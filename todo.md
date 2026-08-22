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
- [ ] ทดสอบ upload workflow จริงและยืนยันภาพที่อัปโหลดแสดงบน Home — mock Storage/API และ fallback ภาพผ่านแล้ว แต่ E2E UI รอ admin login
- [ ] บันทึก checkpoint ใหม่หลังแก้ไขและทดสอบครบ — build/tests ผ่าน; รอ E2E upload UI

# Follow-up — Final Content QA

- [x] แสดง starter content ในหน้า Content Manager เมื่อฐานข้อมูลยังว่างโดยไม่เขียนข้อมูล mock ลงฐานข้อมูล
- [x] เพิ่ม preview panel สำหรับข้อความและภาพก่อนบันทึก
- [x] เพิ่ม test กรณี content key นอก whitelist และ value ว่าง
- [ ] ทดสอบ upload UI จริงและตรวจการเลือก asset ใน Home — UI, mock Storage/API และ Home fallback ผ่านแล้ว แต่รอ admin login
- [ ] บันทึก checkpoint ใหม่หลัง QA ครบ — build/tests ผ่าน; รอ E2E upload UI
