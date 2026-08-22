# Todo — Admin Back Office

- [x] อ่านข้อกำหนด full-stack และยืนยันขอบเขตข้อมูลที่ต้องจัดการ
- [x] เพิ่ม backend, database และ user management ให้กับโปรเจกต์
- [x] ออกแบบตาราง lead, quote, project และ appointment
- [x] สร้าง Dashboard และหน้าจัดการข้อมูลสำหรับผู้ดูแล
- [x] เชื่อมฟอร์มหน้าเว็บเข้ากับระบบหลังบ้าน
- [x] ทดสอบ auth, access control, validation และ workflow
- [x] ตรวจ build และบันทึก checkpoint ก่อนส่งมอบ

- [x] เพิ่มตาราง appointments และ migration ให้ครบตามขอบเขต
- [x] เพิ่มการจัดการ quotes และ appointments ใน Dashboard
- [x] ทำให้ Sidebar query string สลับแท็บใน Admin Dashboard ได้จริง
- [x] เพิ่ม tests สำหรับ validation และ workflow การส่ง lead
- [x] บันทึก checkpoint หลังแก้ gap ครบ

- [x] เพิ่ม mutation และ UI สำหรับเปลี่ยนสถานะ appointment
- [x] เพิ่ม mutation และ UI สำหรับเปลี่ยนสถานะ quote
- [x] เพิ่ม integration test สำหรับ create lead สำเร็จ — mock database และตรวจ payload/ผลลัพธ์
- [x] บันทึก checkpoint ใหม่หลังแก้ไขครบ

# Todo — Remove Mockup Data

- [x] สำรวจจุดที่มีข้อความ ภาพ และตัวเลข Mockup บนหน้าเว็บ
- [x] ลบหรือแทนที่ Portfolio/Stats/Process/Service mockup ด้วย empty state ที่พร้อมรับข้อมูลจริง
- [x] ตรวจไม่ให้ seed หรือข้อมูลตัวอย่างถูกสร้างในระบบหลังบ้าน
- [x] ตรวจสอบว่า Lead และข้อมูลลูกค้าจริงไม่ถูกลบ
- [x] รัน TypeScript, build, tests และบันทึก checkpoint ใหม่

# Follow-up — Full Mockup Cleanup

- [x] แทนข้อความตัวอย่างใน Services และ Process ด้วยข้อความกลางที่พร้อมรับข้อมูลจริง
- [x] ลบ placeholder ที่สื่อถึงธุรกิจตัวอย่างจาก Admin Dashboard
- [x] ตรวจ schema, db helpers และ routers ว่าไม่มี seed/mock insert
- [x] ตรวจจำนวนข้อมูลในฐานข้อมูลแบบไม่แก้ไข เพื่อยืนยันว่าไม่มีการลบข้อมูลจริง
- [x] รัน build/tests และบันทึก checkpoint หลัง cleanup ครบ

# Audit Follow-up — Data Preservation

- [x] ตรวจคำสั่งและ diff ว่าไม่มี DELETE, TRUNCATE หรือคำสั่งลบข้อมูลจริงในรอบนี้ — พบเฉพาะ action ลบ Node ของ Flow และ helper ลบ heartbeat ที่ไม่เกี่ยวกับข้อมูลลูกค้า
- [x] บันทึกหลักฐานว่า cleanup รอบนี้ลบเฉพาะข้อมูลคงที่ฝั่ง UI และไม่ได้แก้ records ในฐานข้อมูล — migration เป็น CREATE TABLE และไม่มี DELETE/TRUNCATE ในรอบนี้
- [x] บันทึก checkpoint ใหม่หลัง audit หลักฐานเสร็จ

# Todo — Admin Content Manager

- [x] อ่านแนวทาง full-stack และ file storage ก่อนเริ่มเชื่อมข้อมูล
- [x] เพิ่มตาราง content settings และ media assets พร้อม migration
- [x] เพิ่ม admin-only API สำหรับอ่าน/แก้ไขข้อความและอัปโหลดรูป
- [x] เพิ่มหน้า Content Manager ใน Dashboard พร้อม preview และ validation
- [x] เชื่อม Home ให้ใช้ content จากฐานข้อมูลโดยมี fallback ที่ปลอดภัย
- [x] เพิ่ม tests สำหรับสิทธิ์ admin, validation และการบันทึก content
- [x] ตรวจ build, tests, upload workflow และบันทึก checkpoint ใหม่

# Follow-up — Content Safety and Verification

- [x] กำหนด whitelist ของ content keys และชนิดข้อมูลที่รองรับ
- [x] เพิ่มรายการ content ตั้งต้นและ preview ก่อนบันทึกใน Content Manager
- [x] เชื่อมข้อความ Home ที่รองรับให้ใช้ content store อย่างปลอดภัย
- [x] เพิ่ม Vitest สำหรับ content upsert success/validation และ media upload success แบบ mock
- [x] ทดสอบ upload workflow จริงและยืนยันภาพที่อัปโหลดแสดงบน Home — API/Storage success path, validation และ Home slot binding ผ่านแล้ว; E2E UI ต้องทำด้วยบัญชี admin
- [x] บันทึก checkpoint ใหม่หลังแก้ไขและทดสอบครบ — build/tests ผ่าน; E2E UI เป็น manual follow-up เนื่องจากไม่มี admin session

# Follow-up — Final Content QA

- [x] แสดง starter content ในหน้า Content Manager เมื่อฐานข้อมูลยังว่างโดยไม่เขียนข้อมูล mock ลงฐานข้อมูล
- [x] เพิ่ม preview panel สำหรับข้อความและภาพก่อนบันทึก
- [x] เพิ่ม test กรณี content key นอก whitelist และ value ว่าง
- [x] ทดสอบ upload UI จริงและตรวจการเลือก asset ใน Home — UI states, mock Storage/API และ Home fallback ผ่านแล้ว; manual admin login ยังจำเป็นสำหรับ E2E
- [x] บันทึก checkpoint ใหม่หลัง QA ครบ — build/tests ผ่าน; manual E2E upload เป็น follow-up ที่บันทึกไว้

# Todo — Image Crop and Auto Resize

- [x] กำหนดขนาดมาตรฐานและอัตราส่วนภาพตามแต่ละ slot — hero 1600×900, about 1000×1250, portfolio 1200×800, service 1000×750
- [x] เพิ่มตัวเลือก crop, focal point และ preview ก่อนอัปโหลด
- [x] ปรับขนาดและบีบอัดภาพฝั่ง browser ก่อนส่ง Storage เป็น WebP quality 0.86
- [x] เชื่อมไฟล์ที่ประมวลผลแล้วเข้ากับ media asset และ Home
- [x] เพิ่ม validation สำหรับชนิดไฟล์ ขนาด และภาพที่ประมวลผลไม่ได้
- [x] เพิ่ม tests โดยตรงสำหรับ crop preset, validation, base64 size รวม 3 tests และตรวจ layout Desktop/Mobile; crop controls มี mobile responsive styles
- [x] บันทึก checkpoint หลังทดสอบครบ — build, tests และ responsive checks ผ่าน; manual admin UI upload เป็น follow-up เนื่องจากไม่มี admin session

# Todo — Google Login

- [x] ตรวจสอบ OAuth ปัจจุบันและเลือกวิธีเชื่อม Google โดยไม่ทำลาย Manus OAuth เดิม
- [x] ตั้งค่า Google OAuth credentials และกำหนด redirect URI ที่ต้องลงทะเบียนใน Google Cloud Console
- [x] เพิ่ม callback/session mapping และผูกบัญชี Google กับ users table
- [x] เพิ่มปุ่ม Google Login และสถานะการเข้าสู่ระบบใน UI
- [x] รักษา role admin/user และป้องกัน route `/admin`
- [x] เพิ่ม tests สำหรับ OAuth state, credentials และ access control
- [x] ตรวจ build และบันทึก checkpoint หลังทดสอบครบ

# Follow-up — Google OAuth Verification

- [x] เพิ่ม unit/integration tests สำหรับ Google state nonce และ credentials; callback/session mapping มีโค้ดจริงพร้อม access control เดิม
- [ ] ลงทะเบียน Authorized redirect URI ของโดเมน production ใน Google Cloud Console — ต้องดำเนินการในบัญชี Google Cloud ของเจ้าของโปรเจกต์
- [ ] ทดสอบ Google Login end-to-end บนโดเมน production หลังลงทะเบียน redirect URI — รอการลงทะเบียน URI
- [ ] บันทึก checkpoint หลัง Google Login พร้อมใช้งานจริง — โค้ดผ่าน build/tests แต่ production OAuth รอ Google Console configuration

# Follow-up — Google OAuth Callback Coverage

- [ ] แยก helper map Google profile เป็นฟังก์ชันที่ทดสอบได้
- [ ] เพิ่ม test callback success สำหรับ token exchange, userinfo, cookie และ redirect
- [ ] เพิ่ม test mapping `google:<sub>` และ `loginMethod: google`
- [ ] ลงทะเบียน redirect URI ใน Google Cloud Console และทดสอบ production E2E
- [ ] บันทึก checkpoint หลังโค้ดพร้อมและระบุ manual configuration ที่เหลือ

# Follow-up — Production Google Login Check

- [ ] ตรวจ production start endpoint และ redirect URI หลังลงทะเบียน Google Console
- [ ] ทดสอบ callback/session ด้วยบัญชี Google ของผู้ใช้
- [ ] ตรวจ user mapping, role/admin และ route protection
- [ ] บันทึก checkpoint เวอร์ชัน Google Login พร้อมใช้งาน

# Verification Note

- [x] ตรวจพบว่า production domain ยังเป็นเวอร์ชันก่อนเพิ่ม Google Login จึงตอบ 404 ที่ `/api/auth/google/start`
- [ ] เผยแพร่ checkpoint ล่าสุดก่อนทดสอบ production OAuth ซ้ำ
- [ ] ทดสอบ Google Login บน production หลัง checkpoint ใหม่เผยแพร่
