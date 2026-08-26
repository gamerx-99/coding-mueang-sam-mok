/**
 * Document & PDF Tools Suite - Tools Dataset (Bilingual TH / EN)
 */

const TOOLS_DATA = [
  {
    id: "merge-pdf",
    category: "organize",
    name: "merge pdf รวมไฟล์ รวมเอกสาร combine join",
    title: {
      th: "รวมไฟล์ PDF",
      en: "Merge PDF",
    },
    desc: {
      th: "รวมไฟล์ PDF หลายไฟล์ตามลำดับที่คุณต้องการได้อย่างง่ายดายและรวดเร็ว",
      en: "Combine PDFs in the order you want with the easiest PDF merger available.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FEE2E2"/><path d="M16 20L24 12L32 20M24 14V34M16 28L24 36L32 28" stroke="#EF4444" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "split-pdf",
    category: "organize",
    name: "split pdf แยกหน้า แยกเอกสาร separate extract pages",
    title: {
      th: "แยกหน้า PDF",
      en: "Split PDF",
    },
    desc: {
      th: "แยกหน้าเฉพาะที่ต้องการ หรือแยกทุกหน้าออกเป็นไฟล์ PDF อิสระแต่ละไฟล์",
      en: "Separate one page or a whole set for easy conversion into independent PDF files.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FFEDD5"/><path d="M20 16L12 24L20 32M28 16L36 24L28 32" stroke="#F97316" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="24" y1="12" x2="24" y2="36" stroke="#F97316" stroke-width="2.5" stroke-dasharray="3 3"/></svg>`,
  },
  {
    id: "compress-pdf",
    category: "organize",
    name: "compress pdf ย่อขนาด บีบอัดไฟล์ reduce size optimize",
    title: {
      th: "บีบอัดไฟล์ PDF",
      en: "Compress PDF",
    },
    desc: {
      th: "ลดขนาดไฟล์ PDF ให้เล็กลงโดยยังคงรักษาคุณภาพเอกสารให้คมชัดสูงสุด",
      en: "Reduce file size while optimizing for maximal PDF quality.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DCFCE7"/><path d="M14 20L20 20L20 14M34 20L28 20L28 14M14 28L20 28L20 34M34 28L28 28L28 34" stroke="#22C55E" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "pdf-to-word",
    category: "convert-from",
    name: "pdf to word doc docx แปลงเป็นเวิร์ด microsoft word converter",
    title: {
      th: "PDF เป็น Word",
      en: "PDF to Word",
    },
    desc: {
      th: "แปลงไฟล์ PDF เป็นเอกสาร Word (DOC, DOCX) แก้ไขง่าย จัดหน้าแม่นยำ",
      en: "Easily convert your PDF files into easy to edit DOC and DOCX documents. The converted WORD document is almost 100% accurate.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DBEAFE"/><rect x="14" y="12" width="20" height="24" rx="4" fill="#2563EB"/><text x="24" y="28" fill="white" font-weight="bold" font-size="14" text-anchor="middle" font-family="sans-serif">W</text><path d="M10 14L16 10" stroke="#2563EB" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "pdf-to-powerpoint",
    category: "convert-from",
    name: "pdf to powerpoint ppt pptx แปลงเป็นพาวเวอร์พอยต์ presentation slides",
    title: {
      th: "PDF เป็น PowerPoint",
      en: "PDF to PowerPoint",
    },
    desc: {
      th: "แปลงไฟล์ PDF ให้กลายเป็นสไลด์นำเสนอ PowerPoint (PPT, PPTX) ที่แก้ไขได้",
      en: "Turn your PDF files into easy to edit PPT and PPTX slideshows.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FFEDD5"/><rect x="14" y="12" width="20" height="24" rx="4" fill="#EA580C"/><text x="24" y="28" fill="white" font-weight="bold" font-size="14" text-anchor="middle" font-family="sans-serif">P</text><path d="M10 14L16 10" stroke="#EA580C" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "pdf-to-excel",
    category: "convert-from",
    name: "pdf to excel xls xlsx แปลงเป็นเอ็กเซล spreadsheet data tables",
    title: {
      th: "PDF เป็น Excel",
      en: "PDF to Excel",
    },
    desc: {
      th: "ดึงข้อมูลตารางจากไฟล์ PDF เข้าสู่สเปรดชีต Excel (XLS, XLSX) ได้ในไม่กี่วินาที",
      en: "Pull data straight from PDFs into Excel spreadsheets in a few short seconds.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DCFCE7"/><rect x="14" y="12" width="20" height="24" rx="4" fill="#16A34A"/><text x="24" y="28" fill="white" font-weight="bold" font-size="14" text-anchor="middle" font-family="sans-serif">X</text><path d="M10 14L16 10" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "word-to-pdf",
    category: "convert-to",
    name: "word to pdf doc docx แปลงเวิร์ดเป็นพีดีเอฟ document to pdf",
    title: {
      th: "Word เป็น PDF",
      en: "Word to PDF",
    },
    desc: {
      th: "แปลงเอกสาร Word (DOC, DOCX) เป็นไฟล์ PDF เปิดอ่านง่ายและคงรูปแบบเดิม",
      en: "Make DOC and DOCX files easy to read by converting them to PDF.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#EFF6FF"/><rect x="12" y="12" width="16" height="20" rx="3" fill="#3B82F6"/><text x="20" y="26" fill="white" font-weight="bold" font-size="11" text-anchor="middle">W</text><path d="M26 28L36 28M36 28L32 24M36 28L32 32" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "powerpoint-to-pdf",
    category: "convert-to",
    name: "powerpoint ppt pptx to pdf แปลงสไลด์เป็นพีดีเอฟ presentation to pdf",
    title: {
      th: "PowerPoint เป็น PDF",
      en: "PowerPoint to PDF",
    },
    desc: {
      th: "แปลงสไลด์งานนำเสนอ PPT และ PPTX ให้เป็นไฟล์ PDF เพื่อการแชร์และเปิดดูที่สะดวก",
      en: "Make PPT and PPTX slideshows easy to view by converting them to PDF.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FFF7ED"/><rect x="12" y="12" width="16" height="20" rx="3" fill="#F97316"/><text x="20" y="26" fill="white" font-weight="bold" font-size="11" text-anchor="middle">P</text><path d="M26 28L36 28M36 28L32 24M36 28L32 32" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "excel-to-pdf",
    category: "convert-to",
    name: "excel xls xlsx to pdf แปลงตารางเป็นพีดีเอฟ spreadsheet to pdf",
    title: {
      th: "Excel เป็น PDF",
      en: "Excel to PDF",
    },
    desc: {
      th: "แปลงตารางคำนวณ Excel (XLS, XLSX) เป็นเอกสาร PDF ที่จัดระเบียบสวยงาม",
      en: "Make EXCEL spreadsheets easy to read by converting them to PDF.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#F0FDF4"/><rect x="12" y="12" width="16" height="20" rx="3" fill="#22C55E"/><text x="20" y="26" fill="white" font-weight="bold" font-size="11" text-anchor="middle">X</text><path d="M26 28L36 28M36 28L32 24M36 28L32 32" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "edit-pdf",
    category: "organize",
    name: "edit pdf draw annotate แก้ไข เขียน วาด ข้อความ รูปภาพ text shapes",
    title: {
      th: "แก้ไขไฟล์ PDF",
      en: "Edit PDF",
    },
    desc: {
      th: "เพิ่มข้อความ รูปภาพ รูปทรง หรือวาดเขียนลงบนเอกสาร PDF ปรับขนาด ฟอนต์ และสีได้ตามใจ",
      en: "Add text, images, shapes or freehand annotations to a PDF document. Edit the size, font, and color of the added content.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#F3E8FF"/><rect x="12" y="12" width="24" height="24" rx="4" stroke="#A855F7" stroke-width="2.5"/><path d="M18 30L30 18M26 14L34 22" stroke="#A855F7" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "pdf-to-jpg",
    category: "convert-from",
    name: "pdf to jpg jpeg png image picture แปลงเป็นรูปภาพ",
    title: {
      th: "PDF เป็น JPG",
      en: "PDF to JPG",
    },
    desc: {
      th: "แปลงหน้า PDF แต่ละหน้าให้เป็นรูปภาพ JPG หรือแยกภาพทั้งหมดออกจาก PDF",
      en: "Convert each PDF page into a JPG or extract all images contained in a PDF.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FEF9C3"/><rect x="12" y="12" width="24" height="24" rx="4" fill="#EAB308"/><circle cx="19" cy="19" r="2.5" fill="white"/><path d="M12 30L19 23L27 31M25 27L29 23L36 30" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
  {
    id: "jpg-to-pdf",
    category: "convert-to",
    name: "jpg jpeg png image to pdf แปลงรูปภาพเป็นพีดีเอฟ photo to pdf",
    title: {
      th: "JPG เป็น PDF",
      en: "JPG to PDF",
    },
    desc: {
      th: "แปลงรูปภาพ JPG เป็น PDF ในไม่กี่วินาที ปรับแนวตั้งแนวนอนและขอบกระดาษได้ง่าย",
      en: "Convert JPG images to PDF in seconds. Easily adjust orientation and margins.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FEF9C3"/><rect x="12" y="14" width="24" height="20" rx="4" fill="#CA8A04"/><text x="24" y="28" fill="white" font-weight="bold" font-size="9" text-anchor="middle">.JPG</text></svg>`,
  },
  {
    id: "sign-pdf",
    category: "security",
    name: "sign pdf signature เซ็นเอกสาร ลายเซ็น electronic sign e-sign",
    title: {
      th: "เซ็นเอกสาร PDF",
      en: "Sign PDF",
    },
    desc: {
      th: "ลงลายมือชื่ออิเล็กทรอนิกส์ด้วยตนเอง หรือส่งคำขอให้ผู้อื่นเซ็นเอกสาร",
      en: "Sign yourself or request electronic signatures from others.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DBEAFE"/><path d="M16 32C20 28 24 34 28 30C32 26 30 20 26 16L18 24L16 32Z" fill="#1D4ED8"/><path d="M14 34C20 34 28 34 34 34" stroke="#1D4ED8" stroke-width="2.5" stroke-linecap="round"/></svg>`,
  },
  {
    id: "watermark",
    category: "organize",
    name: "watermark stamp ลายน้ำ ประทับตรา ปั๊มตรา โลโก้ text stamp",
    title: {
      th: "ใส่ลายน้ำ",
      en: "Watermark",
    },
    desc: {
      th: "ประทับตรายางหรือลายน้ำข้อความ/รูปภาพลงบน PDF กำหนดฟอนต์ ความโปร่งใส และตำแหน่งได้",
      en: "Stamp an image or text over your PDF in seconds. Choose the typography, transparency and position.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FCE7F3"/><path d="M24 12V24M16 28H32M14 34H34" stroke="#DB2777" stroke-width="3.5" stroke-linecap="round"/><rect x="18" y="16" width="12" height="10" rx="2" fill="#DB2777"/></svg>`,
  },
  {
    id: "rotate-pdf",
    category: "organize",
    name: "rotate pdf orientation หมุนหน้ากระดาษ กลับด้าน 90 180 270",
    title: {
      th: "หมุนหน้า PDF",
      en: "Rotate PDF",
    },
    desc: {
      th: "หมุนทิศทางหน้ากระดาษ PDF ตามที่ต้องการ สามารถหมุนหลายไฟล์ได้พร้อมกัน",
      en: "Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#F3E8FF"/><path d="M34 24C34 29.5228 29.5228 34 24 34C18.4772 34 14 29.5228 14 24C14 18.4772 18.4772 14 24 14C27.5 14 30.5 15.8 32.3 18.5M34 14V19H29" stroke="#9333EA" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "html-to-pdf",
    category: "convert-to",
    name: "html to pdf web url link แปลงเว็บเป็นพีดีเอฟ webpage web page",
    title: {
      th: "HTML เป็น PDF",
      en: "HTML to PDF",
    },
    desc: {
      th: "แปลงหน้าเว็บ HTML หรือลิงก์ URL ให้เป็นเอกสาร PDF ได้ง่ายๆ ในคลิกเดียว",
      en: "Convert webpages in HTML to PDF. Copy and paste the URL of the page you want and convert it to PDF with a click.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FEF08A"/><rect x="12" y="14" width="24" height="20" rx="4" fill="#CA8A04"/><text x="24" y="28" fill="white" font-weight="bold" font-size="8.5" text-anchor="middle">HTML</text></svg>`,
  },
  {
    id: "unlock-pdf",
    category: "security",
    name: "unlock pdf password remove ปลดล็อค รหัสผ่าน ถอดรหัส decrypt",
    title: {
      th: "ปลดล็อค PDF",
      en: "Unlock PDF",
    },
    desc: {
      th: "ปลดล็อครหัสผ่านและความปลอดภัย เพื่อให้คุณใช้งานและแก้ไขไฟล์ PDF ได้อย่างอิสระ",
      en: "Remove PDF password security, giving you the freedom to use your PDFs as you want.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DBEAFE"/><rect x="14" y="20" width="20" height="16" rx="4" fill="#0284C7"/><path d="M18 20V14C18 10.6863 20.6863 8 24 8C27.3137 8 30 10.6863 30 14" stroke="#0284C7" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
  {
    id: "protect-pdf",
    category: "security",
    name: "protect pdf password encrypt ตั้งรหัสผ่าน เข้ารหัส ล็อคไฟล์ security",
    title: {
      th: "ตั้งรหัสผ่าน PDF",
      en: "Protect PDF",
    },
    desc: {
      th: "ปกป้องไฟล์ PDF ด้วยการเข้ารหัสและตั้งรหัสผ่าน ป้องกันการเข้าถึงโดยไม่ได้รับอนุญาต",
      en: "Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#E0E7FF"/><path d="M24 10L34 14V22C34 29 29.5 35 24 38C18.5 35 14 29 14 22V14L24 10Z" fill="#4F46E5"/><circle cx="24" cy="22" r="2.5" fill="white"/><path d="M24 24.5V28" stroke="white" stroke-width="2" stroke-linecap="round"/></svg>`,
  },
  {
    id: "organize-pdf",
    category: "organize",
    name: "organize pdf sort reorder delete จัดเรียงหน้า ลบหน้า สลับหน้า rearrange",
    title: {
      th: "จัดเรียงหน้า PDF",
      en: "Organize PDF",
    },
    desc: {
      th: "จัดเรียง สลับลำดับหน้า ลบหน้าที่ไม่ต้องการ หรือแทรกหน้าใหม่ลงในเอกสาร PDF",
      en: "Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages to your document at your convenience.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FFEDD5"/><rect x="14" y="12" width="9" height="10" rx="2" fill="#EA580C"/><rect x="25" y="12" width="9" height="10" rx="2" fill="#EA580C" opacity="0.6"/><rect x="14" y="26" width="9" height="10" rx="2" fill="#EA580C" opacity="0.6"/><rect x="25" y="26" width="9" height="10" rx="2" fill="#EA580C"/></svg>`,
  },
  {
    id: "pdf-to-pdfa",
    category: "organize",
    name: "pdf to pdf/a archive iso มาตรฐานจัดเก็บ เอกสารระยะยาว preservation",
    title: {
      th: "PDF เป็น PDF/A",
      en: "PDF to PDF/A",
    },
    desc: {
      th: "แปลงไฟล์ PDF เป็นมาตรฐานสากล ISO PDF/A สำหรับการจัดเก็บเอกสารระยะยาวอย่างสมบูรณ์",
      en: "Transform your PDF to PDF/A, the ISO-standardized version of PDF for long-term archiving. Your PDF will preserve formatting when accessed in the future.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#E2E8F0"/><rect x="14" y="14" width="20" height="20" rx="4" fill="#475569"/><text x="24" y="28" fill="white" font-weight="bold" font-size="10" text-anchor="middle">/A</text></svg>`,
  },
  {
    id: "repair-pdf",
    category: "organize",
    name: "repair pdf fix corrupt damaged ซ่อมแซม กู้คืนไฟล์ แก้ไฟล์เสีย recover",
    title: {
      th: "ซ่อมแซมไฟล์ PDF",
      en: "Repair PDF",
    },
    desc: {
      th: "ซ่อมแซมและกู้คืนข้อมูลจากไฟล์ PDF ที่เสียหายหรือไม่สามารถเปิดอ่านได้",
      en: "Repair a damaged PDF and recover data from corrupt PDF. Fix PDF files with our Repair tool.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DCFCE7"/><path d="M28 14C32 14 34 18 32 22L20 34L14 34L14 28L26 16C26 14 27 14 28 14Z" stroke="#16A34A" stroke-width="3" stroke-linejoin="round"/></svg>`,
  },
  {
    id: "page-numbers",
    category: "organize",
    name: "page numbers pagination ใส่เลขหน้า หมายเลขหน้า เลขลำดับ header footer",
    title: {
      th: "ใส่เลขหน้า",
      en: "Page numbers",
    },
    desc: {
      th: "ใส่หมายเลขหน้าลงในเอกสาร PDF เลือกตำแหน่ง ขนาดตัวอักษร และรูปแบบได้ตามต้องการ",
      en: "Add page numbers into PDFs with ease. Choose your positions, dimensions, typography.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#F3E8FF"/><rect x="14" y="14" width="8" height="8" rx="2" fill="#9333EA"/><rect x="26" y="14" width="8" height="8" rx="2" fill="#9333EA"/><rect x="14" y="26" width="8" height="8" rx="2" fill="#9333EA"/><rect x="26" y="26" width="8" height="8" rx="2" fill="#9333EA"/><text x="18" y="21" fill="white" font-size="7" font-weight="bold" text-anchor="middle">1</text><text x="30" y="21" fill="white" font-size="7" font-weight="bold" text-anchor="middle">2</text><text x="18" y="33" fill="white" font-size="7" font-weight="bold" text-anchor="middle">3</text><text x="30" y="33" fill="white" font-size="7" font-weight="bold" text-anchor="middle">4</text></svg>`,
  },
  {
    id: "scan-to-pdf",
    category: "convert-to",
    name: "scan to pdf camera mobile สแกนเอกสาร มือถือ ถ่ายภาพ scanner",
    title: {
      th: "สแกนเป็น PDF",
      en: "Scan to PDF",
    },
    desc: {
      th: "ถ่ายภาพสแกนเอกสารจากมือถือ แล้วส่งตรงเข้าบราวเซอร์เพื่อสร้างไฟล์ PDF ได้ทันที",
      en: "Capture document scans from your mobile device and send them instantly to your browser.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FFEDD5"/><path d="M14 20V14H20M34 20V14H28M14 28V34H20M34 28V34H28" stroke="#EA580C" stroke-width="3.5" stroke-linecap="round"/><rect x="20" y="20" width="8" height="8" rx="2" fill="#EA580C"/></svg>`,
  },
  {
    id: "ocr-pdf",
    category: "ai",
    name: "ocr pdf text recognize searchable ค้นหาข้อความ สแกนตัวอักษร ถอดข้อความ optical character recognition",
    title: {
      th: "OCR ถอดข้อความ PDF",
      en: "OCR PDF",
    },
    desc: {
      th: "แปลงเอกสาร PDF สแกนหรือรูปภาพให้เป็นข้อความที่ค้นหา คัดลอก และแก้ไขได้",
      en: "Easily convert scanned PDF into searchable and selectable documents.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DCFCE7"/><rect x="14" y="14" width="20" height="20" rx="4" fill="#16A34A"/><text x="24" y="27" fill="white" font-weight="bold" font-size="8.5" text-anchor="middle">OCR</text></svg>`,
  },
  {
    id: "compare-pdf",
    category: "organize",
    name: "compare pdf diff side by side เปรียบเทียบเอกสาร ตรวจสอบความแตกต่าง diff checker",
    title: {
      th: "เปรียบเทียบไฟล์ PDF",
      en: "Compare PDF",
    },
    desc: {
      th: "เปรียบเทียบเอกสาร 2 ไฟล์แบบเคียงข้างกัน ไฮไลต์จุดที่แตกต่างและตรวจหาการเปลี่ยนแปลงได้อย่างแม่นยำ",
      en: "Show a side-by-side document comparison and easily spot changes between different file versions.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#DBEAFE"/><rect x="13" y="14" width="10" height="20" rx="2" fill="#2563EB"/><rect x="25" y="14" width="10" height="20" rx="2" fill="#60A5FA"/></svg>`,
  },
  {
    id: "redact-pdf",
    category: "security",
    name: "redact pdf black out hide sensitive เซ็นเซอร์ข้อมูล ปิดบังข้อความลับ ปกปิดข้อมูล ส่วนบุคคล privacy",
    title: {
      th: "เซ็นเซอร์/ลบข้อมูลลับ PDF",
      en: "Redact PDF",
    },
    desc: {
      th: "ปิดทับและลบข้อความหรือรูปภาพที่มีข้อมูลส่วนบุคคลและความลับออกจาก PDF อย่างถาวร",
      en: "Redact text and graphics to permanently remove sensitive information from a PDF.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#E2E8F0"/><rect x="14" y="12" width="20" height="24" rx="4" fill="#334155"/><rect x="18" y="18" width="12" height="3" fill="#94A3B8"/><rect x="18" y="24" width="12" height="3" fill="#000000"/></svg>`,
  },
  {
    id: "crop-pdf",
    category: "organize",
    name: "crop pdf margins trim ครอป ตัดขอบกระดาษ ตัดส่วนเกิน adjust margins",
    title: {
      th: "ตัดขอบกระดาษ PDF",
      en: "Crop PDF",
    },
    desc: {
      th: "ตัดขอบกระดาษหรือเลือกตัดเฉพาะพื้นที่ที่ต้องการในเอกสาร PDF นำไปใช้กับหน้าเดียวหรือทั้งฉบับ",
      en: "Crop margins of PDF documents or select specific areas, then apply the changes to one page or the whole document.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#FCE7F3"/><path d="M18 12V30H36M12 18H30V36" stroke="#BE185D" stroke-width="3" stroke-linecap="round"/></svg>`,
  },
  {
    id: "pdf-forms",
    category: "organize",
    isNew: true,
    name: "pdf forms fillable fields interactive ฟอร์ม กรอกข้อมูล แบบสอบถาม interactive form",
    title: {
      th: "ฟอร์ม PDF กรอกได้",
      en: "PDF Forms",
    },
    desc: {
      th: "ตรวจจับช่องฟอร์มอัตโนมัติ สร้างแบบฟอร์ม PDF แบบอินเทอร์แอคทีฟ หรือกรอกข้อมูลลงฟอร์มออนไลน์",
      en: "Detect form fields automatically, create interactive fillable PDFs, or fill PDF forms yourself. Add text fields, checkboxes, multiple choice fields, and lists.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#F3E8FF"/><rect x="14" y="14" width="20" height="20" rx="4" fill="#7E22CE"/><text x="24" y="28" fill="white" font-weight="bold" font-size="10" text-anchor="middle">Ab|</text></svg>`,
  },
  {
    id: "ai-summarizer",
    category: "ai",
    isNew: true,
    name: "ai summarizer summary summarize key points สรุปเนื้อหา สรุปบทความ ปัญญาประดิษฐ์",
    title: {
      th: "AI สรุปเนื้อหาเอกสาร",
      en: "AI Summarizer",
    },
    desc: {
      th: "สรุปบทความและเอกสาร PDF ขนาดยาวให้สั้นกระชับ สกัดประเด็นสำคัญได้อย่างรวดเร็วด้วย AI",
      en: "Quickly generate concise summaries from articles, paragraphs, and essays, providing clear and precise key points in seconds.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#EDE9FE"/><rect x="14" y="14" width="20" height="20" rx="4" fill="#6366F1"/><path d="M24 18L25.5 22.5L30 24L25.5 25.5L24 30L22.5 25.5L18 24L22.5 22.5L24 18Z" fill="white"/></svg>`,
  },
  {
    id: "translate-pdf",
    category: "ai",
    isNew: true,
    name: "translate pdf ai multilingual language แปลภาษา แปลเอกสาร ภาษาอังกฤษ ภาษาไทย",
    title: {
      th: "AI แปลภาษาเอกสาร PDF",
      en: "Translate PDF",
    },
    desc: {
      th: "แปลเอกสาร PDF ทั้งฉบับด้วย AI อัจฉริยะ รักษาฟอนต์ การจัดวาง และเลย์เอาต์เดิมอย่างแม่นยำ",
      en: "Easily translate PDF files powered by AI. Keep fonts, layout, and formatting perfectly intact.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#F3E8FF"/><rect x="14" y="14" width="20" height="20" rx="4" fill="#9333EA"/><text x="24" y="28" fill="white" font-weight="bold" font-size="11" text-anchor="middle">文A</text></svg>`,
  },
  {
    id: "pdf-to-markdown",
    category: "convert-from",
    isNew: true,
    name: "pdf to markdown md llm แปลงเป็นมาร์กดาวน์ ข้อความ structured markdown text",
    title: {
      th: "PDF เป็น Markdown",
      en: "PDF to Markdown",
    },
    desc: {
      th: "แปลงไฟล์ PDF เป็น Markdown (.md) รองรับหัวข้อ ตาราง ลิสต์ และลิงก์ เหมาะสำหรับทำเอกสารและส่งต่อให้ AI/LLM",
      en: "Easily turn PDFs into Markdown files. Perfect for notes, docs, and LLMs. Headings, tables, lists, and links preserved automatically.",
    },
    iconSvg: `<svg viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="12" fill="#EDE9FE"/><rect x="14" y="14" width="20" height="20" rx="4" fill="#4F46E5"/><text x="24" y="27" fill="white" font-weight="bold" font-size="10" text-anchor="middle">{#}</text></svg>`,
  },
];
