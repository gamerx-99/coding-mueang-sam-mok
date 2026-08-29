export type ToolCategory =
  | "convert-to"
  | "convert-from"
  | "organize"
  | "security"
  | "ai"
  | "colour"
  | "images"
  | "typography"
  | "calculators";

export type CatalogTool = {
  id: string;
  category: ToolCategory;
  titleTh: string;
  descTh: string;
  iconSvg: string;
  isNew?: boolean;
};

/** Search keywords per tool (Thai + English), kept from the original dataset. */
export const TOOL_SEARCH: Record<string, string> = {
  "merge-pdf": "merge pdf รวมไฟล์ รวมเอกสาร combine join",
  "split-pdf": "split pdf แยกหน้า แยกเอกสาร separate extract pages",
  "compress-pdf": "compress pdf ย่อขนาด บีบอัดไฟล์ reduce size optimize",
  "pdf-to-word": "pdf to word doc docx แปลงเป็นเวิร์ด",
  "pdf-to-powerpoint": "pdf to powerpoint ppt pptx แปลงเป็นพาวเวอร์พอยต์",
  "pdf-to-excel": "pdf to excel xls xlsx แปลงเป็นเอ็กเซล spreadsheet",
  "word-to-pdf": "word to pdf doc docx แปลงเวิร์ดเป็นพีดีเอฟ",
  "powerpoint-to-pdf": "powerpoint ppt pptx to pdf แปลงสไลด์เป็นพีดีเอฟ",
  "excel-to-pdf": "excel xls xlsx to pdf แปลงตารางเป็นพีดีเอฟ",
  "edit-pdf": "edit pdf draw annotate แก้ไข เขียน วาด ข้อความ รูปภาพ",
  "pdf-to-jpg": "pdf to jpg jpeg png image แปลงเป็นรูปภาพ",
  "jpg-to-pdf": "jpg jpeg png image to pdf แปลงรูปภาพเป็นพีดีเอฟ",
  "sign-pdf": "sign pdf signature เซ็นเอกสาร ลายเซ็น electronic sign",
  watermark: "watermark stamp ลายน้ำ ประทับตรา โลโก้ text stamp",
  "rotate-pdf": "rotate pdf orientation หมุนหน้ากระดาษ กลับด้าน",
  "html-to-pdf": "html to pdf web url link แปลงเว็บเป็นพีดีเอฟ",
  "unlock-pdf": "unlock pdf password remove ปลดล็อค รหัสผ่าน decrypt",
  "protect-pdf": "protect pdf password encrypt ตั้งรหัสผ่าน เข้ารหัส",
  "organize-pdf": "organize pdf sort reorder delete จัดเรียงหน้า ลบหน้า",
  "pdf-to-pdfa": "pdf to pdf/a archive iso มาตรฐานจัดเก็บ เอกสารระยะยาว",
  "repair-pdf": "repair pdf fix corrupt damaged ซ่อมแซม กู้คืนไฟล์",
  "page-numbers": "page numbers pagination ใส่เลขหน้า หมายเลขหน้า",
  "scan-to-pdf": "scan to pdf camera mobile สแกนเอกสาร มือถือ",
  "ocr-pdf": "ocr pdf text recognize searchable ถอดข้อความ สแกนตัวอักษร",
  "compare-pdf": "compare pdf diff side by side เปรียบเทียบเอกสาร",
  "redact-pdf": "redact pdf black out เซ็นเซอร์ข้อมูล ปิดบังข้อความลับ",
  "crop-pdf": "crop pdf margins trim ครอป ตัดขอบกระดาษ",
  "pdf-forms": "pdf forms fillable fields interactive ฟอร์ม กรอกข้อมูล",
  "ai-summarizer": "ai summarizer summary สรุปเนื้อหา สรุปบทความ",
  "translate-pdf": "translate pdf ai multilingual แปลภาษา แปลเอกสาร",
  "pdf-to-markdown": "pdf to markdown md llm แปลงเป็นมาร์กดาวน์",
};

export const CATALOG_TOOLS: CatalogTool[] = [
  {
    id: "merge-pdf",
    category: "organize",
    titleTh: "รวมไฟล์ PDF",
    descTh: "รวมไฟล์ PDF หลายไฟล์ตามลำดับที่คุณต้องการได้อย่างง่ายดายและรวดเร็ว",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FEE2E2"/><path d="M16 20L24 12L32 20M24 14V34M16 28L24 36L32 28" stroke="#EF4444" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "split-pdf",
    category: "organize",
    titleTh: "แยกหน้า PDF",
    descTh: "แยกหน้าเฉพาะที่ต้องการ หรือแยกทุกหน้าออกเป็นไฟล์ PDF อิสระแต่ละไฟล์",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FFEDD5"/><path d="M20 16L12 24L20 32M28 16L36 24L28 32" stroke="#F97316" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="24" y1="12" x2="24" y2="36" stroke="#F97316" stroke-width="2.5" stroke-dasharray="3 3"/></svg>`,
  },
  {
    id: "compress-pdf",
    category: "organize",
    titleTh: "บีบอัดไฟล์ PDF",
    descTh: "ลดขนาดไฟล์ PDF ให้เล็กลงโดยยังคงรักษาคุณภาพเอกสารให้คมชัดสูงสุด",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DCFCE7"/><path d="M14 20L20 20L20 14M34 20L28 20L28 14M14 28L20 28L20 34M34 28L28 28L28 34" stroke="#22C55E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "pdf-to-word",
    category: "convert-from",
    titleTh: "PDF เป็น Word",
    descTh: "แปลงไฟล์ PDF เป็นเอกสาร Word (DOC, DOCX) แก้ไขง่าย จัดหน้าแม่นยำ",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DBEAFE"/><rect x="14" y="12" width="20" height="24" rx="4" fill="#2563EB"/><text x="24" y="28" fill="white" font-weight="bold" font-size="14" text-anchor="middle" font-family="sans-serif">W</text><path d="M10 14L16 10" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "pdf-to-powerpoint",
    category: "convert-from",
    titleTh: "PDF เป็น PowerPoint",
    descTh: "แปลงไฟล์ PDF ให้กลายเป็นสไลด์นำเสนอ PowerPoint (PPT, PPTX) ที่แก้ไขได้",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FFEDD5"/><rect x="14" y="12" width="20" height="24" rx="4" fill="#EA580C"/><text x="24" y="28" fill="white" font-weight="bold" font-size="14" text-anchor="middle" font-family="sans-serif">P</text><path d="M10 14L16 10" stroke="#EA580C" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "pdf-to-excel",
    category: "convert-from",
    titleTh: "PDF เป็น Excel",
    descTh: "ดึงข้อมูลตารางจากไฟล์ PDF เข้าสู่สเปรดชีต Excel (XLS, XLSX) ได้ในไม่กี่วินาที",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DCFCE7"/><rect x="14" y="12" width="20" height="24" rx="4" fill="#16A34A"/><text x="24" y="28" fill="white" font-weight="bold" font-size="14" text-anchor="middle" font-family="sans-serif">X</text><path d="M10 14L16 10" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "word-to-pdf",
    category: "convert-to",
    titleTh: "Word เป็น PDF",
    descTh: "แปลงเอกสาร Word (DOC, DOCX) เป็นไฟล์ PDF เปิดอ่านง่ายและคงรูปแบบเดิม",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#EFF6FF"/><rect x="12" y="12" width="16" height="20" rx="3" fill="#3B82F6"/><text x="20" y="26" fill="white" font-weight="bold" font-size="11" text-anchor="middle">W</text><path d="M26 28L36 28M36 28L32 24M36 28L32 32" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "powerpoint-to-pdf",
    category: "convert-to",
    titleTh: "PowerPoint เป็น PDF",
    descTh: "แปลงสไลด์งานนำเสนอ PPT และ PPTX ให้เป็นไฟล์ PDF เพื่อการแชร์และเปิดดูที่สะดวก",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FFF7ED"/><rect x="12" y="12" width="16" height="20" rx="3" fill="#F97316"/><text x="20" y="26" fill="white" font-weight="bold" font-size="11" text-anchor="middle">P</text><path d="M26 28L36 28M36 28L32 24M36 28L32 32" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "excel-to-pdf",
    category: "convert-to",
    titleTh: "Excel เป็น PDF",
    descTh: "แปลงตารางคำนวณ Excel (XLS, XLSX) เป็นเอกสาร PDF ที่จัดระเบียบสวยงาม",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#F0FDF4"/><rect x="12" y="12" width="16" height="20" rx="3" fill="#22C55E"/><text x="20" y="26" fill="white" font-weight="bold" font-size="11" text-anchor="middle">X</text><path d="M26 28L36 28M36 28L32 24M36 28L32 32" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "edit-pdf",
    category: "organize",
    titleTh: "แก้ไขไฟล์ PDF",
    descTh: "เพิ่มข้อความ รูปภาพ รูปทรง หรือวาดเขียนลงบนเอกสาร PDF ปรับขนาด ฟอนต์ และสีได้ตามใจ",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#F3E8FF"/><rect x="12" y="12" width="24" height="24" rx="4" stroke="#A855F7" stroke-width="2.5"/><path d="M18 30L30 18M26 14L34 22" stroke="#A855F7" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "pdf-to-jpg",
    category: "convert-from",
    titleTh: "PDF เป็น JPG",
    descTh: "แปลงหน้า PDF แต่ละหน้าให้เป็นรูปภาพ JPG หรือแยกภาพทั้งหมดออกจาก PDF",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FEF9C3"/><rect x="12" y="12" width="24" height="24" rx="4" fill="#EAB308"/><circle cx="19" cy="19" r="2.5" fill="white"/><path d="M12 30L19 23L27 31M25 27L29 23L36 30" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
  {
    id: "jpg-to-pdf",
    category: "convert-to",
    titleTh: "JPG เป็น PDF",
    descTh: "แปลงรูปภาพ JPG เป็น PDF ในไม่กี่วินาที ปรับแนวตั้งแนวนอนและขอบกระดาษได้ง่าย",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FEF9C3"/><rect x="12" y="14" width="24" height="20" rx="4" fill="#CA8A04"/><text x="24" y="28" fill="white" font-weight="bold" font-size="9" text-anchor="middle">.JPG</text></svg>`,
  },
  {
    id: "sign-pdf",
    category: "security",
    titleTh: "เซ็นเอกสาร PDF",
    descTh: "ลงลายมือชื่ออิเล็กทรอนิกส์ด้วยตนเอง หรือส่งคำขอให้ผู้อื่นเซ็นเอกสาร",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DBEAFE"/><path d="M16 32C20 28 24 34 28 30C32 26 30 20 26 16L18 24L16 32Z" fill="#1D4ED8"/><path d="M14 34C20 34 28 34 34 34" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "watermark",
    category: "organize",
    titleTh: "ใส่ลายน้ำ",
    descTh: "ประทับตรายางหรือลายน้ำข้อความ/รูปภาพลงบน PDF กำหนดฟอนต์ ความโปร่งใส และตำแหน่งได้",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FCE7F3"/><path d="M24 12V24M16 28H32M14 34H34" stroke="#DB2777" stroke-width="3.5" stroke-linecap="round"/><rect x="18" y="16" width="12" height="10" rx="2" fill="#DB2777"/></svg>`,
  },
  {
    id: "rotate-pdf",
    category: "organize",
    titleTh: "หมุนหน้า PDF",
    descTh: "หมุนทิศทางหน้ากระดาษ PDF ตามที่ต้องการ สามารถหมุนหลายไฟล์ได้พร้อมกัน",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#F3E8FF"/><path d="M34 24C34 29.5228 29.5228 34 24 34C18.4772 34 14 29.5228 14 24C14 18.4772 18.4772 14 24 14C27.5 14 30.5 15.8 32.3 18.5M34 14V19H29" stroke="#9333EA" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "html-to-pdf",
    category: "convert-to",
    titleTh: "HTML เป็น PDF",
    descTh: "แปลงหน้าเว็บ HTML หรือลิงก์ URL ให้เป็นเอกสาร PDF ได้ง่ายๆ ในคลิกเดียว",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FEF08A"/><rect x="12" y="14" width="24" height="20" rx="4" fill="#CA8A04"/><text x="24" y="28" fill="white" font-weight="bold" font-size="8.5" text-anchor="middle">HTML</text></svg>`,
  },
  {
    id: "unlock-pdf",
    category: "security",
    titleTh: "ปลดล็อค PDF",
    descTh: "ปลดล็อครหัสผ่านและความปลอดภัย เพื่อให้คุณใช้งานและแก้ไขไฟล์ PDF ได้อย่างอิสระ",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DBEAFE"/><rect x="14" y="20" width="20" height="16" rx="4" fill="#0284C7"/><path d="M18 20V14C18 10.6863 20.6863 8 24 8C27.3137 8 30 10.6863 30 14" stroke="#0284C7" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
  {
    id: "protect-pdf",
    category: "security",
    titleTh: "ตั้งรหัสผ่าน PDF",
    descTh: "ปกป้องไฟล์ PDF ด้วยการเข้ารหัสและตั้งรหัสผ่าน ป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#E0E7FF"/><path d="M24 10L34 14V22C34 29 29.5 35 24 38C18.5 35 14 29 14 22V14L24 10Z" fill="#4F46E5"/><circle cx="24" cy="22" r="2.5" fill="white"/><path d="M24 24.5V28" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
  {
    id: "organize-pdf",
    category: "organize",
    titleTh: "จัดเรียงหน้า PDF",
    descTh: "จัดเรียง สลับลำดับหน้า ลบหน้าที่ไม่ต้องการ หรือแทรกหน้าใหม่ลงในเอกสาร PDF",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FFEDD5"/><rect x="14" y="12" width="9" height="10" rx="2" fill="#EA580C"/><rect x="25" y="12" width="9" height="10" rx="2" fill="#EA580C" opacity="0.6"/><rect x="14" y="26" width="9" height="10" rx="2" fill="#EA580C" opacity="0.6"/><rect x="25" y="26" width="9" height="10" rx="2" fill="#EA580C"/></svg>`,
  },
  {
    id: "pdf-to-pdfa",
    category: "organize",
    titleTh: "PDF เป็น PDF/A",
    descTh: "แปลงไฟล์ PDF เป็นมาตรฐานสากล ISO PDF/A สำหรับการจัดเก็บเอกสารระยะยาวอย่างสมบูรณ์",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#E2E8F0"/><rect x="14" y="14" width="20" height="20" rx="4" fill="#475569"/><text x="24" y="28" fill="white" font-weight="bold" font-size="10" text-anchor="middle">/A</text></svg>`,
  },
  {
    id: "repair-pdf",
    category: "organize",
    titleTh: "ซ่อมแซมไฟล์ PDF",
    descTh: "ซ่อมแซมและกู้คืนข้อมูลจากไฟล์ PDF ที่เสียหายหรือไม่สามารถเปิดอ่านได้",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DCFCE7"/><path d="M28 14C32 14 34 18 32 22L20 34L14 34L14 28L26 16C26 14 27 14 28 14Z" stroke="#16A34A" stroke-width="3" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "page-numbers",
    category: "organize",
    titleTh: "ใส่เลขหน้า",
    descTh: "ใส่หมายเลขหน้าลงในเอกสาร PDF เลือกตำแหน่ง ขนาดตัวอักษร และรูปแบบได้ตามต้องการ",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#F3E8FF"/><rect x="14" y="14" width="8" height="8" rx="2" fill="#9333EA"/><rect x="26" y="14" width="8" height="8" rx="2" fill="#9333EA"/><rect x="14" y="26" width="8" height="8" rx="2" fill="#9333EA"/><rect x="26" y="26" width="8" height="8" rx="2" fill="#9333EA"/><text x="18" y="21" fill="white" font-size="7" font-weight="bold" text-anchor="middle">1</text><text x="30" y="21" fill="white" font-size="7" font-weight="bold" text-anchor="middle">2</text><text x="18" y="33" fill="white" font-size="7" font-weight="bold" text-anchor="middle">3</text><text x="30" y="33" fill="white" font-size="7" font-weight="bold" text-anchor="middle">4</text></svg>`,
  },
  {
    id: "scan-to-pdf",
    category: "convert-to",
    titleTh: "สแกนเป็น PDF",
    descTh: "ถ่ายภาพสแกนเอกสารจากมือถือ แล้วส่งตรงเข้าบราวเซอร์เพื่อสร้างไฟล์ PDF ได้ทันที",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FFEDD5"/><path d="M14 20V14H20M34 20V14H28M14 28V34H20M34 28V34H28" stroke="#EA580C" stroke-width="3.5" stroke-linecap="round"/><rect x="20" y="20" width="8" height="8" rx="2" fill="#EA580C"/></svg>`,
  },
  {
    id: "ocr-pdf",
    category: "ai",
    titleTh: "OCR ถอดข้อความ PDF",
    descTh: "แปลงเอกสาร PDF สแกนหรือรูปภาพให้เป็นข้อความที่ค้นหา คัดลอก และแก้ไขได้",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DCFCE7"/><rect x="14" y="14" width="20" height="20" rx="4" fill="#16A34A"/><text x="24" y="27" fill="white" font-weight="bold" font-size="8.5" text-anchor="middle">OCR</text></svg>`,
  },
  {
    id: "compare-pdf",
    category: "organize",
    titleTh: "เปรียบเทียบไฟล์ PDF",
    descTh: "เปรียบเทียบเอกสาร 2 ไฟล์แบบเคียงข้างกัน ไฮไลต์จุดที่แตกต่างและตรวจหาการเปลี่ยนแปลงได้อย่างแม่นยำ",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DBEAFE"/><rect x="13" y="14" width="10" height="20" rx="2" fill="#2563EB"/><rect x="25" y="14" width="10" height="20" rx="2" fill="#60A5FA"/></svg>`,
  },
  {
    id: "redact-pdf",
    category: "security",
    titleTh: "เซ็นเซอร์/ลบข้อมูลลับ PDF",
    descTh: "ปิดทับและลบข้อความหรือรูปภาพที่มีข้อมูลส่วนบุคคลและความลับออกจาก PDF อย่างถาวร",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#E2E8F0"/><rect x="14" y="12" width="20" height="24" rx="4" fill="#334155"/><rect x="18" y="18" width="12" height="3" fill="#94A3B8"/><rect x="18" y="24" width="12" height="3" fill="#000000"/></svg>`,
  },
  {
    id: "crop-pdf",
    category: "organize",
    titleTh: "ตัดขอบกระดาษ PDF",
    descTh: "ตัดขอบกระดาษหรือเลือกตัดเฉพาะพื้นที่ที่ต้องการในเอกสาร PDF นำไปใช้กับหน้าเดียวหรือทั้งฉบับ",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FCE7F3"/><path d="M18 12V30H36M12 18H30V36" stroke="#BE185D" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
  {
    id: "pdf-forms",
    category: "organize",
    isNew: true,
    titleTh: "ฟอร์ม PDF กรอกได้",
    descTh: "ตรวจจับช่องฟอร์มอัตโนมัติ สร้างแบบฟอร์ม PDF แบบอินเทอร์แอคทีฟ หรือกรอกข้อมูลลงฟอร์มออนไลน์",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#F3E8FF"/><rect x="14" y="14" width="20" height="20" rx="4" fill="#7E22CE"/><text x="24" y="28" fill="white" font-weight="bold" font-size="10" text-anchor="middle">Ab|</text></svg>`,
  },
  {
    id: "ai-summarizer",
    category: "ai",
    isNew: true,
    titleTh: "AI สรุปเนื้อหาเอกสาร",
    descTh: "สรุปบทความและเอกสาร PDF ขนาดยาวให้สั้นกระชับ สกัดประเด็นสำคัญได้อย่างรวดเร็วด้วย AI",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#EDE9FE"/><rect x="14" y="14" width="20" height="20" rx="4" fill="#6366F1"/><path d="M24 18L25.5 22.5L30 24L25.5 25.5L24 30L22.5 25.5L18 24L22.5 22.5L24 18Z" fill="white"/></svg>`,
  },
  {
    id: "translate-pdf",
    category: "ai",
    isNew: true,
    titleTh: "AI แปลภาษาเอกสาร PDF",
    descTh: "แปลเอกสาร PDF ทั้งฉบับด้วย AI อัจฉริยะ รักษาฟอนต์ การจัดวาง และเลย์เอาต์เดิมอย่างแม่นยำ",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#F3E8FF"/><rect x="14" y="14" width="20" height="20" rx="4" fill="#9333EA"/><text x="24" y="28" fill="white" font-weight="bold" font-size="11" text-anchor="middle">文A</text></svg>`,
  },
  {
    id: "pdf-to-markdown",
    category: "convert-from",
    isNew: true,
    titleTh: "PDF เป็น Markdown",
    descTh: "แปลงไฟล์ PDF เป็น Markdown (.md) รองรับหัวข้อ ตาราง ลิสต์ และลิงก์ เหมาะสำหรับทำเอกสารและส่งต่อให้ AI/LLM",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#EDE9FE"/><rect x="14" y="14" width="20" height="20" rx="4" fill="#4F46E5"/><text x="24" y="27" fill="white" font-weight="bold" font-size="10" text-anchor="middle">{#}</text></svg>`,
  },
];

export const CATEGORY_LABELS: Array<{ id: ToolCategory | "all"; label: string }> =
  [
    { id: "all", label: "ทั้งหมด" },
    { id: "images", label: "รูปภาพ & โซเชียล" },
    { id: "colour", label: "สี" },
    { id: "typography", label: "ตัวอักษร" },
    { id: "calculators", label: "เครื่องมือคำนวณ" },
    { id: "convert-to", label: "แปลงเป็น PDF" },
    { id: "convert-from", label: "แปลงจาก PDF" },
    { id: "organize", label: "จัดหน้า & แก้ไข" },
    { id: "security", label: "ความปลอดภัย" },
    { id: "ai", label: "AI & ขั้นสูง" },
  ];

/* ---------- Interactive (live) tools — adapted from delphitools-cli ---------- */

export type InteractiveKind =
  | "color-converter"
  | "tw-shades"
  | "harmony"
  | "contrast"
  | "colorblind"
  | "palette"
  | "social-crop"
  | "matte"
  | "scroll"
  | "favicon"
  | "img-convert"
  | "img-clip"
  | "px-rem"
  | "line-height"
  | "type-scale"
  | "word-counter"
  | "paper-sizes"
  | "unit-convert"
  | "base-convert"
  | "time-convert"
  | "encoder"
  | "meta-tag";

export type InteractiveTool = {
  id: string;
  kind: InteractiveKind;
  category: ToolCategory;
  titleTh: string;
  descTh: string;
  iconSvg: string;
};

const swatchIcon = (fill: string) =>
  `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="${fill}"/><circle cx="24" cy="24" r="9" fill="white" opacity="0.9"/><circle cx="24" cy="24" r="4.5" fill="${fill}" stroke="white" stroke-width="2"/></svg>`;

export const INTERACTIVE_TOOLS: InteractiveTool[] = [
  {
    id: "colour-convert",
    kind: "color-converter",
    category: "colour",
    titleTh: "แปลงรหัสสี",
    descTh: "แปลงสีระหว่าง HEX / RGB / HSL พร้อมคัดลอกได้ทันที",
    iconSvg: swatchIcon("#1D4ED8"),
  },
  {
    id: "tailwind-shades",
    kind: "tw-shades",
    category: "colour",
    titleTh: "ชุดเฉดสี 50–950",
    descTh: "สร้างเฉดสีจากสีหลักแบบ Tailwind 11 ระดับ พร้อมคัดลอกทุกเฉด",
    iconSvg: swatchIcon("#0F766E"),
  },
  {
    id: "colour-harmony",
    kind: "harmony",
    category: "colour",
    titleTh: "สีฮาร์มอนี",
    descTh: "หาสีคู่ สีสามเหลี่ยม สีข้างเคียง และสีแยกจากสีหลัก",
    iconSvg: swatchIcon("#B45309"),
  },
  {
    id: "contrast-check",
    kind: "contrast",
    category: "colour",
    titleTh: "ตรวจ Contrast WCAG",
    descTh: "ตรวจความตัดกันของสีตัวอักษร/พื้นหลัง ตามเกณฑ์ AA / AAA",
    iconSvg: swatchIcon("#374151"),
  },
  {
    id: "colour-blind-sim",
    kind: "colorblind",
    category: "colour",
    titleTh: "จำลองตาบอดสี",
    descTh: "ดูสีของคุณผ่านตาของคนตาบอดสี 3 ประเภท",
    iconSvg: swatchIcon("#7C3AED"),
  },
  {
    id: "palette-from-image",
    kind: "palette",
    category: "colour",
    titleTh: "สกัดพาเลตจากรูป",
    descTh: "ดึงสีเด่นจากไฟล์รูปภาพเป็นพาเลตพร้อมสัดส่วน",
    iconSvg: swatchIcon("#BE185D"),
  },
  {
    id: "social-crop",
    kind: "social-crop",
    category: "images",
    titleTh: "ครอปรูปโซเชียล",
    descTh: "ครอปรูปเป็นสัดส่วน IG/Feed (1:1, 4:5, 9:16, 16:9) เลือกจุดตัดได้",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DBEAFE"/><rect x="12" y="12" width="24" height="24" rx="4" stroke="#2563EB" stroke-width="3"/><path d="M18 6V12M30 6V12M18 36V42M30 36V42M6 18H12M6 30H12M36 18H42M36 30H42" stroke="#2563EB" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
  {
    id: "matte-maker",
    kind: "matte",
    category: "images",
    titleTh: "พื้นหลังรอบรูป (Matte)",
    descTh: "วางรูปที่ไม่จัตุรัสบนพื้นเบลอ/สีทึบ/ไล่เฉด แบบโพสต์ IG",
    iconSvg: swatchIcon("#0E7490"),
  },
  {
    id: "carousel-split",
    kind: "scroll",
    category: "images",
    titleTh: "แตะรูปเป็นคารูเซล",
    descTh: "แบ่งภาพยาวเป็นไทล์ IG carousel เรียงถูกลำดับ พร้อมพื้นเติม",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#E0E7FF"/><rect x="8" y="14" width="14" height="20" rx="3" stroke="#4F46E5" stroke-width="3"/><rect x="26" y="14" width="14" height="20" rx="3" stroke="#4F46E5" stroke-width="3" stroke-dasharray="4 3"/></svg>`,
  },
  {
    id: "favicon-gen",
    kind: "favicon",
    category: "images",
    titleTh: "สร้างชุด Favicon",
    descTh: "ตัดรูปเป็น favicon 16/32/48 + Apple Touch + PWA ในคลิกเดียว",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FEF3C7"/><rect x="10" y="10" width="12" height="12" rx="3" fill="#D97706"/><rect x="26" y="10" width="12" height="12" rx="6" fill="#D97706"/><rect x="10" y="26" width="12" height="12" rx="6" fill="#D97706"/><rect x="26" y="26" width="12" height="12" rx="3" fill="#D97706"/></svg>`,
  },
  {
    id: "image-convert",
    kind: "img-convert",
    category: "images",
    titleTh: "แปลงชนิดรูปภาพ",
    descTh: "แปลง PNG / JPG / WebP พร้อมเทียบขนาดไฟล์ก่อน-หลัง",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DCFCE7"/><path d="M14 18H30M30 18L26 14M30 18L26 22" stroke="#16A34A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><path d="M34 30H18M18 30L22 26M18 30L22 34" stroke="#16A34A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "transparent-trim",
    kind: "img-clip",
    category: "images",
    titleTh: "ตัดขอบโปร่งใส",
    descTh: "ตัดขอบโปร่งใสรอบ PNG ให้เนื้อหาชิดกรอบ พร้อมบอกพิกเซลที่ตัดไป",
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FCE7F3"/><path d="M16 10V32H38M10 16H32V38" stroke="#DB2777" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
  {
    id: "px-rem",
    kind: "px-rem",
    category: "typography",
    titleTh: "PX ⇄ REM",
    descTh: "แปลงพิกเซลเป็น rem และกลับกัน กำหนด root size เองได้",
    iconSvg: swatchIcon("#334155"),
  },
  {
    id: "line-height",
    kind: "line-height",
    category: "typography",
    titleTh: "คำนวณ Line-height",
    descTh: "ได้ระยะบรรทัดจริงเป็น px พร้อมคำแนะนำว่าเหมาะหัวเรื่องหรือเนื้อความ",
    iconSvg: swatchIcon("#475569"),
  },
  {
    id: "type-scale",
    kind: "type-scale",
    category: "typography",
    titleTh: "Type Scale",
    descTh: "สร้างขนาดตัวอักษรทั้งระบบจากฐานเดียว ตามอัตราส่วนดนตรี",
    iconSvg: swatchIcon("#1D2B50"),
  },
  {
    id: "word-count",
    kind: "word-counter",
    category: "typography",
    titleTh: "นับคำ (รองรับไทย)",
    descTh: "นับคำ/ตัวอักษร/ประโยค + เวลาอ่าน โดยตัดคำไทยด้วย Intl.Segmenter",
    iconSvg: swatchIcon("#0F766E"),
  },
  {
    id: "paper-size",
    kind: "paper-sizes",
    category: "typography",
    titleTh: "ขนาดกระดาษ",
    descTh: "ตาราง A/B/Letter หน่วยมม. — อ้างอิงสำหรับงานพิมพ์และ PDF",
    iconSvg: swatchIcon("#64748B"),
  },
  {
    id: "unit-convert",
    kind: "unit-convert",
    category: "calculators",
    titleTh: "แปลงหน่วย",
    descTh: "ความยาว น้ำหนัก ข้อมูล และอุณหภูมิ ครบในเครื่องเดียว",
    iconSvg: swatchIcon("#2050E0"),
  },
  {
    id: "base-convert",
    kind: "base-convert",
    category: "calculators",
    titleTh: "แปลงเลขฐาน",
    descTh: "ฐาน 2 / 8 / 10 / 16 แปลงไป-กลับทุกรูปแบบพร้อมกัน",
    iconSvg: swatchIcon("#4F46E5"),
  },
  {
    id: "time-convert",
    kind: "time-convert",
    category: "calculators",
    titleTh: "แปลงหน่วยเวลา",
    descTh: "วินาที นาที ชั่วโมง วัน สัปดาห์ เดือน ปี — รวดเร็วทันใจ",
    iconSvg: swatchIcon("#B97A12"),
  },
  {
    id: "text-encode",
    kind: "encoder",
    category: "calculators",
    titleTh: "Base64 / URL Encode",
    descTh: "เข้ารหัส-ถอดรหัสข้อความ ทั้ง Base64 (รองรับไทย) และ URL",
    iconSvg: swatchIcon("#3D4C73"),
  },
  {
    id: "meta-tags",
    kind: "meta-tag",
    category: "calculators",
    titleTh: "สร้าง Meta Tags (OG)",
    descTh: "กรอกข้อมูลเว็บ ได้ชุด meta Open Graph / Twitter พร้อมคัดลอก",
    iconSvg: swatchIcon("#1A7F4E"),
  },
];

/** Catalog id → interactive kind lookup. */
export const INTERACTIVE_BY_ID: Record<string, InteractiveTool> =
  Object.fromEntries(INTERACTIVE_TOOLS.map(tool => [tool.id, tool]));
