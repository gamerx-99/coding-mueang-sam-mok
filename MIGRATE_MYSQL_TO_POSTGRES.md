# แปลงแอป `coding-mueang-sam-mok` : MySQL → PostgreSQL (Supabase)

## ทำไมต้องทำ
Login เด้งกลับหน้า login เพราะโค้ดเขียนผูกกับ **MySQL** (`drizzle-orm/mysql2`) แต่ DB ที่ต่อจริงคือ **Supabase = PostgreSQL** — driver คนละตัว ต่อไม่ติด ทุก request ที่ต้อง auth จึงโหลด user จาก DB ไม่ได้ → ถือว่าไม่ได้ login → เด้งกลับ

> หมายเหตุ: error 500 `Google OAuth callback failed` แก้ไปแล้ว (เป็นเรื่อง `JWT_SECRET` ที่ redeploy แล้วดึงเข้า build) เอกสารนี้แก้เฉพาะเรื่อง **DB / login เด้งกลับ**

---

## วิธีที่เร็วที่สุด — apply patch
มีไฟล์ `mysql-to-postgres.patch` แนบมาให้ วางไว้ที่ root ของ repo แล้วรัน:

```bash
git apply mysql-to-postgres.patch
pnpm install          # ติดตั้ง postgres, ถอด mysql2
pnpm exec tsc --noEmit # เช็คว่า type ผ่าน (ต้องไม่มี error)
```

ถ้า `git apply` ไม่ผ่าน (เช่นโค้ด local ต่างจาก repo) ให้ทำตาม "แก้มือ" ด้านล่างแทน

---

## แก้มือ (สำหรับให้ Gemini ทำทีละไฟล์)

### 1) `package.json` — สลับ driver
ลบบรรทัด `"mysql2": "^3.15.0",` ออก แล้วเพิ่ม `"postgres"` ใน `dependencies`:

```jsonc
// ลบ:  "mysql2": "^3.15.0",
// เพิ่ม:
"postgres": "^3.4.5",
```

### 2) `drizzle.config.ts` — เปลี่ยน dialect
```ts
// เดิม
dialect: "mysql",
// ใหม่
dialect: "postgresql",
```

### 3) `drizzle/schema.ts` — เขียนใหม่ทั้งไฟล์ (จาก mysql-core → pg-core)
แทนที่ทั้งไฟล์ด้วยเนื้อหานี้ (ชื่อคอลัมน์/ตารางเหมือนเดิมทุกอย่าง; `int autoincrement`→`serial`, `int`→`integer`, `mysqlEnum`→`text` + `$type`, `onUpdateNow()`→`$onUpdate()`):

```ts
import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: text("role").$type<"user" | "admin">().default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  contact: varchar("contact", { length: 320 }).notNull(),
  businessType: varchar("businessType", { length: 100 }),
  serviceType: varchar("serviceType", { length: 100 }),
  budget: varchar("budget", { length: 100 }),
  details: text("details"),
  status: text("status").$type<"new" | "contacted" | "qualified" | "closed">().default("new").notNull(),
  source: varchar("source", { length: 60 }).default("website").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  leadId: integer("leadId"),
  serviceType: varchar("serviceType", { length: 100 }).notNull(),
  scope: text("scope"),
  estimatedMin: integer("estimatedMin").notNull(),
  estimatedMax: integer("estimatedMax").notNull(),
  status: text("status").$type<"draft" | "sent" | "accepted" | "declined">().default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  leadId: integer("leadId"),
  customerName: varchar("customerName", { length: 160 }).notNull(),
  contact: varchar("contact", { length: 320 }).notNull(),
  scheduledAt: timestamp("scheduledAt").notNull(),
  durationMinutes: integer("durationMinutes").default(60).notNull(),
  status: text("status").$type<"requested" | "confirmed" | "completed" | "cancelled">().default("requested").notNull(),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const contentSettings = pgTable("contentSettings", {
  id: serial("id").primaryKey(),
  contentKey: varchar("contentKey", { length: 120 }).notNull(),
  language: text("language").$type<"th" | "en">().default("th").notNull(),
  value: text("value").notNull(),
  updatedBy: integer("updatedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const mediaAssets = pgTable("mediaAssets", {
  id: serial("id").primaryKey(),
  slot: varchar("slot", { length: 120 }).notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  storageKey: varchar("storageKey", { length: 500 }).notNull(),
  url: varchar("url", { length: 700 }).notNull(),
  mimeType: varchar("mimeType", { length: 100 }).notNull(),
  fileSize: integer("fileSize").notNull(),
  altText: varchar("altText", { length: 255 }),
  uploadedBy: integer("uploadedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export const auditLogs = pgTable("auditLogs", {
  id: serial("id").primaryKey(),
  userId: integer("userId"),
  action: varchar("action", { length: 80 }).notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  clientName: varchar("clientName", { length: 180 }),
  serviceType: varchar("serviceType", { length: 100 }),
  status: text("status").$type<"idea" | "active" | "review" | "completed" | "archived">().default("idea").notNull(),
  progress: integer("progress").default(0).notNull(),
  dueAt: timestamp("dueAt"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdate(() => new Date()).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuote = typeof quotes.$inferInsert;
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;
export type Appointment = typeof appointments.$inferSelect;
export type InsertAppointment = typeof appointments.$inferInsert;
export type ContentSetting = typeof contentSettings.$inferSelect;
export type InsertContentSetting = typeof contentSettings.$inferInsert;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type InsertMediaAsset = typeof mediaAssets.$inferInsert;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
```

### 4) `server/db.ts` — 6 จุด
```ts
// (ก) import driver  (บรรทัด 2)
- import { drizzle } from "drizzle-orm/mysql2";
+ import { drizzle } from "drizzle-orm/postgres-js";
+ import postgres from "postgres";

// (ข) การเชื่อมต่อใน getDb()
- try { _db = drizzle(process.env.DATABASE_URL); }
+ try {
+   const client = postgres(process.env.DATABASE_URL, { prepare: false });
+   _db = drizzle(client);
+ }

// (ค) upsertUser — MySQL onDuplicateKeyUpdate → Postgres onConflictDoUpdate
- await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
+ await db.insert(users).values(values).onConflictDoUpdate({ target: users.openId, set: updateSet });

// (ง–ช) ทุกจุดที่ return insertId (4 ฟังก์ชัน: createLead, createProject, upsertContentSetting, createMediaAsset)
//   MySQL ใช้ result[0].insertId ; Postgres ต้อง .returning() แล้วอ่าน .id
- const result = await db.insert(leads).values(input);
- return Number(result[0].insertId);
+ const result = await db.insert(leads).values(input).returning({ id: leads.id });
+ return result[0].id;
//   ทำแบบเดียวกันกับ projects / contentSettings / mediaAssets (เปลี่ยนชื่อตารางให้ตรง)
```

> `prepare: false` จำเป็นสำหรับ Supabase transaction pooler (port 6543)

### 5) Migration — ลบของเก่า สร้าง Postgres ใหม่
ลบไฟล์ migration MySQL เดิมทั้งหมด:
```bash
rm drizzle/0000_cooing_christian_walker.sql drizzle/0001_long_morg.sql \
   drizzle/0002_equal_mother_askani.sql drizzle/0003_stormy_silver_surfer.sql
rm drizzle/meta/0001_snapshot.json drizzle/meta/0002_snapshot.json drizzle/meta/0003_snapshot.json
```
แล้ว generate ใหม่ (ต้องมี `DATABASE_URL` ใน env ตอนรัน):
```bash
pnpm exec drizzle-kit generate
```
> ไฟล์ `drizzle/0000_large_swarm.sql` ที่แนบมา คือผลลัพธ์ที่ generate แล้ว (Postgres) — จะใช้ไฟล์นี้เลยก็ได้

---

## รัน migration ขึ้น Supabase (สร้างตาราง)

**ทางที่ง่ายที่สุด (แนะนำ):** เปิด Supabase → **SQL Editor** → แปะเนื้อหาไฟล์ `drizzle/0000_large_swarm.sql` ทั้งหมด → Run
(วิธีนี้ไม่ต้องยุ่งกับ connection string / pooler เลย)

**หรือรันผ่าน drizzle-kit** (ใช้ connection แบบ **Direct / Session pooler = port 5432** เท่านั้น ห้ามใช้ 6543 เพราะรัน DDL ไม่ได้):
```bash
DATABASE_URL="postgresql://postgres:<PASSWORD>@db.<ref>.supabase.co:5432/postgres" \
  pnpm exec drizzle-kit migrate
```

---

## ตั้งค่า env `DATABASE_URL` บน Vercel

โค้ดอ่านแค่ตัวแปรเดียวคือ **`DATABASE_URL`** (ตัว `SUPABASE_*`, `PGHOST`, `PGPORT` ฯลฯ ที่ใส่ไว้ไม่ได้ถูกใช้ — ลบทิ้งได้ ไม่ลบก็ไม่เป็นไร)

ให้ตั้ง `DATABASE_URL` = **Transaction pooler ของ Supabase (port 6543)** เพราะดีที่สุดสำหรับ Vercel serverless:
```
postgresql://postgres.<ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:6543/postgres
```
(หาได้ที่ Supabase → Project Settings → Database → Connection string → **Transaction pooler**)

ตั้งให้ครอบทั้ง **Production และ Preview**

---

## Redeploy
หลังแก้โค้ด + push ขึ้น Git แล้ว Vercel จะ build ใหม่เอง หรือกด **Redeploy** จาก dashboard ให้ build ล่าสุดดึง `DATABASE_URL` เข้าไป

---

## ทดสอบ
เปิด `coding-mueang-sam-mok.vercel.app` → login Google → ต้องเข้า `/admin` ได้โดยไม่เด้งกลับ
> อยากเป็น admin: ตั้ง env `OWNER_OPEN_ID = google:<sub ของบัญชี Google คุณ>` (ดู sub ได้จาก log ตอน callback หรือ decode session)

---

## เก็บกวาด / ความปลอดภัย
- env ที่ไม่ได้ใช้ (`SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PGHOST`, `PGPORT`, `DATABASE_POOLER_URL` ฯลฯ) ลบได้เพื่อความสะอาด
- ถ้ารหัส DB เคยแปะไว้ที่ไหนก็ตาม แนะนำ **rotate password** ใน Supabase หลังตั้งค่าเสร็จ
- `JWT_SECRET`, `GOOGLE_CLIENT_SECRET` = ความลับ อย่า commit ลง Git

---

## เช็คลิสต์
- [ ] แก้ 4 ไฟล์ (package.json, drizzle.config.ts, schema.ts, db.ts)
- [ ] `pnpm install` + `pnpm exec tsc --noEmit` ผ่าน
- [ ] ลบ migration MySQL เก่า + มี `0000_large_swarm.sql` (Postgres)
- [ ] รัน SQL สร้างตารางบน Supabase สำเร็จ
- [ ] `DATABASE_URL` (pooler 6543) ตั้งใน Vercel Production + Preview
- [ ] Redeploy
- [ ] login แล้วเข้า /admin ได้ ไม่เด้งกลับ
