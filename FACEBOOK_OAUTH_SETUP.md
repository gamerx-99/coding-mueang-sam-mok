# Facebook OAuth Setup

## สาเหตุที่ตรวจพบ

Facebook ตอบกลับด้วย **OAuth error code 191** ระหว่างแลก authorization code เป็น access token โดยระบุว่าโดเมนของ callback URL ยังไม่ได้รวมอยู่ใน Facebook App จากการตรวจสอบโดเมน deployment หลักของโปรเจกต์คือ `coding-mueang-sam-mok.vercel.app` และเว็บไซต์ตอบสนองปกติ แต่ callback URI ยังต้องลงทะเบียนใน Meta for Developers ก่อนจึงจะล็อกอินสำเร็จ

Meta กำหนดให้ `redirect_uri` ที่ใช้ใน OAuth flow ต้องตรงกับรายการ **Valid OAuth Redirect URIs** ของแอป และ manual flow ใช้ endpoint `/oauth/access_token` สำหรับแลก code เป็น access token [1] [2]

## ค่าที่ต้องตั้งใน Vercel

ตั้งค่าตัวแปรต่อไปนี้ใน Project Settings > Environment Variables ของ Vercel โดยใช้ค่าจริงของ Facebook App และอย่า commit ค่า secret ลง Git

| Variable | ค่าแนะนำสำหรับ production |
|---|---|
| `FACEBOOK_APP_ID` | Facebook App ID เดิมของโปรเจกต์ |
| `FACEBOOK_APP_SECRET` | Facebook App Secret เดิมของโปรเจกต์ |
| `FACEBOOK_REDIRECT_URI` | `https://coding-mueang-sam-mok.vercel.app/api/auth/facebook/callback` |

หากใช้ custom domain ให้เปลี่ยนค่า `FACEBOOK_REDIRECT_URI` เป็น callback URI ของ custom domain แทน โดยต้องใช้ URI เดียวกันแบบตัวอักษรต่อตัวอักษรในทุกจุด

## ค่าที่ต้องตั้งใน Meta for Developers

ใน Facebook App ให้เปิด **Facebook Login > Settings > Client OAuth Settings** แล้วเพิ่มรายการนี้ใน **Valid OAuth Redirect URIs**:

```text
https://coding-mueang-sam-mok.vercel.app/api/auth/facebook/callback
```

จากนั้นเพิ่มโดเมนต่อไปนี้ใน **App Domains**:

```text
coding-mueang-sam-mok.vercel.app
```

หากต้องการทดสอบ localhost ให้เพิ่ม callback สำหรับ local environment แยกต่างหาก และตั้ง `FACEBOOK_REDIRECT_URI` ของ process local เป็น callback นั้น ไม่ควรใช้ production callback กับ local process

## การแก้ไขในโค้ด

ระบบจะใช้ `FACEBOOK_REDIRECT_URI` เมื่อมีการกำหนดค่า หากไม่มี ระบบยัง fallback ไปยัง host ของ request เพื่อรองรับ development เดิม นอกจากนี้ระบบได้ปรับปรุงการทำงานดังนี้:

1. ตรวจว่ามีทั้ง App ID และ App Secret ก่อนเริ่ม flow
2. อัปเดต Graph API endpoint เป็น `v26.0`
3. เก็บรายละเอียด provider error ไว้ใน server log โดยไม่ส่ง secret หรือ response รายละเอียดกลับไปยัง browser
4. แปลง error code 191 เป็นข้อความที่ผู้ใช้เข้าใจได้ว่า callback URI ไม่ตรง
5. เพิ่ม regression tests สำหรับ provider failure และ static redirect URI

หลังแก้ค่าใน Meta และ Vercel แล้วให้ redeploy จากนั้นลบ session หรือเปิดหน้าต่าง private ใหม่ แล้วทดสอบปุ่ม **Continue with Facebook** อีกครั้ง

## References

[1]: https://developers.facebook.com/documentation/facebook-login/guides/advanced/manual-flow "Meta for Developers — Manually Build a Login Flow"

[2]: https://developers.facebook.com/blog/post/2017/12/18/strict-uri-matching/ "Meta for Developers — Strict URI Matching"
