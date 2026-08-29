# Vercel deploy fix — coding-mueang-sam-mok

## รากของปัญหา (ยืนยันแล้ว)

`package.json` มี `"type": "module"` แต่โค้ดฝั่ง server ใช้ import แบบไม่มีนามสกุลไฟล์
(`from "./server/app"`) และใช้ TypeScript path alias (`from "@shared/const"`)

Vercel's `@vercel/node` builder **ไม่รองรับ path mapping** (ระบุไว้ในเอกสารทางการของ
Vercel เอง) และ Node's native ESM loader ก็ไม่ resolve import ที่ไม่มีนามสกุลไฟล์ให้
อัตโนมัติ ผลคือ deploy ผ่าน (build "Ready") แต่ function crash ตอน invoke จริง:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module '/var/task/server/app'
```

นี่คือปัญหาเดียวกับที่ commit `cb0c7d1` (ที่ลบ index.ts ทิ้ง) พยายามจะแก้ด้วยการ
"bundling with esbuild" แต่ทำไม่เสร็จ

ปัญหาที่สอง (แยกกัน): `https://coding-mueang-sam-mok.vercel.app/index.html` ก็ 404
เช่นกัน (static 404 ธรรมดา ไม่ใช่ function crash) — เพราะ `vercel.json` ใช้ legacy
`"builds"` array ซึ่งปิด zero-config static detection ไปด้วย ทำให้ output ของ
`vite build` (โฟลเดอร์ `public/`) ไม่ถูกเผยแพร่เป็น static asset เลย ต้องมี builder
entry สำหรับ static แยกต่างหาก

## วิธีแก้ที่ทดสอบแล้วว่าใช้ได้จริง (bundling ด้วย esbuild)

ผมสร้างไฟล์ทั้งหมดในต้นทาง (index.ts, server/**, shared/**, drizzle/schema.ts) ขึ้นมา
ในเครื่องตัวเอง แล้วรัน esbuild บันเดิลจริง ๆ — โหลด bundle ที่ได้สำเร็จ ไม่มี error เลย
(ทดสอบ import จริงใน Node ผ่าน)

คำสั่งที่ใช้ (รันจาก root ของ repo):

```bash
pnpm exec esbuild index.ts --bundle --platform=node --format=esm \
  --packages=external --outfile=server-dist/index.js
```

ผลลัพธ์คือไฟล์เดียว ~42KB ที่ inline ทุก local import (แก้ปัญหา extension +
path alias พร้อมกันหมด) เหลือแค่ npm package จริง ๆ (express, drizzle-orm,
@trpc/server, axios, cookie, jose, zod, superjson) เป็น external import ตามปกติ

## การเปลี่ยนแปลงที่ต้องทำ

### 1. `package.json` — เพิ่ม script

```json
"scripts": {
  "vercel-build": "vite build && esbuild index.ts --bundle --platform=node --format=esm --packages=external --outfile=server-dist/index.js",
  ...
}
```

### 2. `vercel.json` — เพิ่ม static-build entry + ชี้ node builder ไปที่ไฟล์ที่ bundle แล้ว

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "version": 2,
  "trailingSlash": false,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "public" }
    },
    { "src": "server-dist/index.js", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/server-dist/index.js" },
    { "handle": "filesystem" },
    { "src": "/(.*)", "dest": "/index.html" }
  ]
}
```

**หมายเหตุสำคัญ:** `@vercel/node` ต้องการให้ไฟล์ที่ระบุใน `"src"` มีอยู่จริงใน git
ตอน Vercel resolve build graph (ไม่ใช่ไฟล์ที่เพิ่งสร้างระหว่าง build) เพราะฉะนั้น
**ต้อง commit `server-dist/index.js` (ผลลัพธ์จาก esbuild) เข้า git ด้วย** ไม่ใช่แค่
generate ตอน build — ถ้าไม่ commit ไฟล์นี้ไว้ deploy แรกจะ fail ทันทีด้วย
"no files found matching src pattern"

`vercel-build` script ข้างบนจะ regenerate ไฟล์นี้ใหม่ทุกครั้งที่ deploy (ถ้า static-build
entry รันก่อน node entry ตามลำดับใน builds array) แต่เผื่อไว้ก็ควร**รัน esbuild เอง
ในเครื่องแล้ว commit ไฟล์ `server-dist/index.js` ไปด้วยตอน push ครั้งแรก** เพื่อไม่ให้
ติดปัญหา ordering

### 3. ไฟล์ `.gitignore` — เพิ่มบรรทัดเผื่อไว้ (ไม่บังคับ)

ปัจจุบัน `.gitignore` มี `dist/` อยู่แล้วซึ่งไม่ชนกับ `server-dist/` — ไม่ต้องแก้อะไร

## ทางเลือกอื่น (ถ้าไม่อยากใช้ bundling)

แก้ import ทีละไฟล์ให้ใส่นามสกุล `.js` และเปลี่ยน `@shared/...` เป็น relative path
(`../shared/...` หรือ `../../shared/...` แล้วแต่ความลึกของไฟล์) ทุกจุดที่เป็น import
แบบ runtime (ไม่ใช่ `import type`) ไฟล์ที่ต้องแก้มี 12 ไฟล์:

- `index.ts`
- `server/app.ts`
- `server/routers.ts`
- `server/db.ts`
- `server/storage.ts`
- `server/_core/sdk.ts`
- `server/_core/oauth.ts`
- `server/_core/storageProxy.ts`
- `server/_core/context.ts`
- `server/_core/trpc.ts`
- `server/_core/systemRouter.ts`
- `server/_core/notification.ts`

วิธีนี้ maintainable กว่า (ไม่ต้องดูแล generated bundle) แต่แก้เยอะกว่า ถ้าสนใจแนวทางนี้
ทักมาได้ ผมมี list บรรทัด import เดิม→ใหม่ ครบทุกไฟล์แล้ว

## เรื่องที่ควรรู้เพิ่ม (ไม่เร่งด่วนแต่ควรเช็ค)

1. มี Vercel project ที่สองชื่อ `coding-mueang-sam-mok-he58` ผูกกับ GitHub repo
   เดียวกันนี้อยู่ — เห็นจาก sidebar ของ GitHub repo และไฟล์
   `vercel-error-investigation.md` ในโค้ด ควรเช็คว่าใช้งานอยู่จริงไหม หรือเป็น
   ของเก่าที่ควรลบทิ้ง เพื่อไม่ให้สับสนว่า deploy ไหนคือของจริง
2. ระหว่างที่ผมกำลังแก้ error เดิม มี commit `cb0c7d1` ("fix: resolve Vercel
   Serverless Function module not found error by bundling api/index.ts with
   esbuild") ถูก push เข้า main แบบ concurrent กับที่ผมทำงานอยู่ — ลบ root
   `index.ts` ทิ้งแต่ไม่เสร็จงาน (ไม่มี api/index.ts ใหม่ถูกสร้างขึ้นมาแทน) ถ้ามี
   automation/agent อื่น (เช่น Vercel's own "Agent" feature) กำลังทำงานกับ repo
   นี้พร้อมกันอยู่ ควรเช็คให้แน่ใจว่าจะไม่มาทับ fix นี้อีกรอบ
