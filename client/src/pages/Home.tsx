// Design philosophy: Reference-led dark navy cyber-studio — midnight surfaces, cobalt light, cyan data accents, coral action punctuation, and confident Thai display type.
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import { ArrowRight, Check, ChevronRight, CircleCheck, Code2, Database, ExternalLink, Globe2, Layers3, Languages, Menu, Send, Share2, Sparkles, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Language = "th" | "en";

type Work = { title: string; category: string; image: string; tags: string[] };

const content = {
  th: {
    nav: ["หน้าแรก", "บริการของเรา", "ผลงานของเรา", "เกี่ยวกับเรา", "ขั้นตอนการทำงาน", "ติดต่อเรา"],
    contact: "คุยโปรเจกต์กับเรา",
    heroKicker: "DIGITAL PRODUCT STUDIO / MAE HONG SON",
    heroTitle: "โค้ดดิ้ง\nเมืองสามหมอก",
    heroAccent: "เขียนโค้ดบนดอย ไม่ต้องรอ Silicon Valley",
    heroBody: "รับทำเว็บไซต์ Web Application และระบบ Software สำหรับธุรกิจที่อยากเติบโต ด้วยทีมที่คุยง่ายและเข้าใจงานจริง",
    primary: "คุยโปรเจกต์กับเรา",
    secondary: "ดูผลงานของเรา",
    serviceKicker: "บริการของเรา",
    serviceTitle: "เราทำอะไรให้คุณได้บ้าง?",
    portfolioKicker: "ผลงานของเรา",
    portfolioTitle: "ตัวอย่างงานที่เราภูมิใจ",
    portfolioMore: "ดูผลงานทั้งหมด",
    processKicker: "ขั้นตอนการทำงาน",
    processTitle: "ทำงานกับเราอย่างไร?",
    aboutKicker: "ทำไมต้องเลือกเรา",
    aboutTitle: "มีไอเดียอยากทำเว็บ?\nเล่าให้เราฟังก่อนได้",
    aboutBody: "ไม่ต้องมี Technical Requirement ที่ดี เราช่วยตั้งคำถามและวางแผนให้เป็นขั้นตอน",
    formTitle: "เล่าโปรเจกต์ให้เราฟัง",
    formBody: "เริ่มต้นจากไอเดียสั้น ๆ ได้เลย ทีมงานจะติดต่อกลับเพื่อคุยรายละเอียด",
    formButton: "ส่งข้อมูลให้เรา",
    footerTag: "เขียนโค้ดบนดอย ไม่ต้องรอ Silicon Valley",
    share: "แชร์ผลงาน",
    shared: "คัดลอกลิงก์ผลงานแล้ว",
    flow: "ออกแบบ System Flow",
  },
  en: {
    nav: ["Home", "Services", "Our work", "About", "Process", "Contact"],
    contact: "Start a project",
    heroKicker: "DIGITAL PRODUCT STUDIO / MAE HONG SON",
    heroTitle: "Coding\nMueang Sam Mok",
    heroAccent: "Build from the mountains, not Silicon Valley",
    heroBody: "Websites, web applications and software systems for ambitious businesses — with a team that makes complex work feel clear.",
    primary: "Start a project",
    secondary: "Explore our work",
    serviceKicker: "Our services",
    serviceTitle: "What can we build for you?",
    portfolioKicker: "Selected work",
    portfolioTitle: "Projects we are proud of",
    portfolioMore: "View all work",
    processKicker: "How we work",
    processTitle: "A clear path from idea to launch",
    aboutKicker: "Why work with us",
    aboutTitle: "Have an idea for a website?\nTell us before you build it",
    aboutBody: "You do not need a perfect technical brief. We ask the right questions and turn your idea into a clear plan.",
    formTitle: "Tell us about your project",
    formBody: "Start with a rough idea. Our team will reach out and help shape the next step.",
    formButton: "Send your brief",
    footerTag: "Build from the mountains, not Silicon Valley",
    share: "Share work",
    shared: "Project link copied",
    flow: "Design a System Flow",
  },
} as const;

const services = [
  { icon: Globe2, num: "01", th: "เว็บไซต์", en: "Websites", thBody: "ออกแบบและพัฒนาเว็บไซต์ธุรกิจให้สวย เร็ว และพร้อมเติบโต", enBody: "Thoughtful business websites built to look sharp, load fast and grow.", accent: "cyan" },
  { icon: Layers3, num: "02", th: "Web Application", en: "Web Applications", thBody: "ระบบออนไลน์ที่ออกแบบตาม Workflow ของธุรกิจคุณ", enBody: "Tailored online products designed around your real business workflow.", accent: "blue" },
  { icon: Code2, num: "03", th: "ระบบ Software", en: "Software systems", thBody: "พัฒนาระบบเฉพาะทาง พร้อม Dashboard และระบบหลังบ้าน", enBody: "Purpose-built systems with dashboards, admin tools and clean foundations.", accent: "purple" },
  { icon: Database, num: "04", th: "ดูแลและบำรุงรักษา", en: "Care & maintenance", thBody: "ดูแล แก้ไข และปรับปรุงระบบให้พร้อมใช้งานเสมอ", enBody: "Ongoing care, fixes and improvements to keep your product dependable.", accent: "coral" },
];

const works: Work[] = [
  { title: "ระบบจองพัก", category: "ธุรกิจโรงแรม / Booking", image: "/manus-storage/webcraft-work-1_92de2f49.png", tags: ["Next.js", "Supabase"] },
  { title: "ระบบจัดการสินค้า", category: "ธุรกิจค้าปลีก", image: "/manus-storage/webcraft-work-2_56a72d8b.png", tags: ["React", "PostgreSQL"] },
  { title: "เว็บไซต์ร้านกาแฟ", category: "ธุรกิจอาหาร", image: "/manus-storage/webcraft-hero_e93bc4d4.png", tags: ["Next.js", "Tailwind CSS"] },
  { title: "ระบบจัดการงานบริการ", category: "ธุรกิจบริการ", image: "/manus-storage/webcraft-work-1_92de2f49.png", tags: ["Vue.js", "Laravel"] },
];

const process = [
  ["01", "คุยไอเดีย", "พูดคุยความต้องการและเป้าหมายของคุณ"],
  ["02", "วางระบบ", "วิเคราะห์และออกแบบโครงสร้างระบบ"],
  ["03", "ออกแบบ", "ออกแบบ UI/UX ให้ใช้งานง่ายและชัดเจน"],
  ["04", "พัฒนา", "เขียนโค้ดและพัฒนาไปพร้อมกับคุณ"],
  ["05", "ทดสอบ", "ทดสอบการทำงานและตรวจสอบคุณภาพ"],
  ["06", "ส่งมอบ", "ส่งมอบงานพร้อมใช้งานและดูแลต่อ"],
];

function shareWork(work: Work, language: Language) {
  const text = `${work.title} — Coding Mueang Sam Mok`;
  if (navigator.share) navigator.share({ title: text, text, url: window.location.href }).catch(() => undefined);
  else navigator.clipboard?.writeText(window.location.href).then(() => toast.success(content[language].shared));
}

export default function Home() {
  const [language, setLanguage] = useState<Language>(() => (localStorage.getItem("webcraft-language") as Language) || "th");
  const [mobileOpen, setMobileOpen] = useState(false);
  const submitLead = trpc.leads.create.useMutation({
    onSuccess: () => toast.success(language === "th" ? "ส่งข้อมูลแล้ว ทีมงานจะติดต่อกลับเร็ว ๆ นี้" : "Brief received — we will be in touch soon"),
    onError: () => toast.error(language === "th" ? "ส่งข้อมูลไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" : "Could not send your brief. Please try again."),
  });
  const t = content[language];
  const setLang = (next: Language) => { setLanguage(next); localStorage.setItem("webcraft-language", next); document.documentElement.lang = next; };
  const scrollTo = (id: string) => { document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }); setMobileOpen(false); };

  return <main className="site-dark min-h-screen bg-night text-white">
    <header className="dark-header"><div className="site-container flex h-[72px] items-center justify-between gap-5"><a href="#top" className="brand-lockup"><span className="brand-mark"><img src="/manus-storage/webcraft-logo_f3b5f60e.png" alt="" /></span><span><b>{language === "th" ? "โค้ดดิ้งเมืองสามหมอก" : "Coding Mueang Sam Mok"}</b><small>CODING MUEANG SAM MOK</small></span></a><nav className={`dark-nav ${mobileOpen ? "open" : ""}`}>{t.nav.map((item, index) => <button key={item} onClick={() => scrollTo(["top", "services", "portfolio", "about", "process", "contact"][index])}>{item}</button>)}<Link href="/flow" onClick={() => setMobileOpen(false)}>{t.flow}</Link></nav><div className="header-actions"><div className="dark-language"><Languages size={14} /><button className={language === "th" ? "active" : ""} onClick={() => setLang("th")}>TH</button><span>/</span><button className={language === "en" ? "active" : ""} onClick={() => setLang("en")}>EN</button></div><button className="glow-button hidden sm:flex" onClick={() => scrollTo("contact")}><Send size={14} /> {t.contact}</button><button className="mobile-menu sm:hidden" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">{mobileOpen ? <X size={20} /> : <Menu size={20} />}</button></div></div></header>

    <section id="top" className="dark-hero"><div className="site-container hero-grid"><div className="hero-copy"><p className="dark-kicker"><span /> {t.heroKicker}</p><h1>{t.heroTitle}</h1><h2>{t.heroAccent}</h2><p className="hero-body">{t.heroBody}</p><div className="hero-actions"><button className="glow-button" onClick={() => scrollTo("contact")}><Send size={15} /> {t.primary}</button><button className="ghost-button" onClick={() => scrollTo("portfolio")}>{t.secondary} <ArrowRight size={15} /></button></div><div className="hero-proof"><span><CircleCheck size={15} /> คุยง่าย เข้าใจเร็ว</span><span><CircleCheck size={15} /> คุณภาพทุกงาน</span><span><CircleCheck size={15} /> ส่งงานตรงเวลา</span></div></div><div className="hero-visual"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><img src="/manus-storage/mueang-sam-mok-hero_e5657bc4.png" alt="Coding Mueang Sam Mok studio" /><span className="hero-chip chip-code">&lt;/&gt; CODE</span><span className="hero-chip chip-db"><Database size={15} /> DATABASE</span><span className="hero-chip chip-cloud">☁ CLOUD</span><div className="hero-glow" /></div></div></section>

    <section id="services" className="dark-section"><div className="site-container"><div className="section-heading centered"><p className="dark-kicker"><span /> {t.serviceKicker}</p><h2>{t.serviceTitle}</h2></div><div className="service-grid">{services.map(({ icon: Icon, num, th, en, thBody, enBody, accent }) => <article className={`dark-card service-card ${accent}`} key={num}><div className="card-top"><span className="card-num">{num}</span><Icon size={28} /></div><span className="service-code">&lt;/&gt;</span><h3>{language === "th" ? th : en}</h3><p>{language === "th" ? thBody : enBody}</p><button onClick={() => scrollTo("contact")} aria-label="Learn more"><ArrowRight size={17} /></button></article>)}</div></div></section>

    <section id="portfolio" className="dark-section portfolio-section"><div className="site-container"><div className="section-heading"><div><p className="dark-kicker"><span /> {t.portfolioKicker}</p><h2>{t.portfolioTitle}</h2></div><button className="outline-button" onClick={() => toast.success(language === "th" ? "กำลังเตรียมผลงานเพิ่มเติม" : "More work is coming soon")}>{t.portfolioMore} <ArrowRight size={15} /></button></div><div className="portfolio-grid">{works.map((work) => <article className="work-card" key={work.title}><div className="work-image"><img src={work.image} alt={work.title} /><div className="work-overlay"><button onClick={() => shareWork(work, language)} aria-label={t.share}><Share2 size={16} /> {t.share}</button><button onClick={() => toast.info(language === "th" ? "รายละเอียดโปรเจกต์จะเปิดให้ชมเร็ว ๆ นี้" : "Project details coming soon")} aria-label="Open project"><ExternalLink size={16} /></button></div></div><div className="work-meta"><div><h3>{work.title}</h3><p>{work.category}</p></div><div className="work-tags">{work.tags.map((tag) => <span key={tag}>{tag}</span>)}</div></div></article>)}</div></div></section>

    <section id="process" className="dark-section process-section"><div className="site-container"><div className="section-heading centered"><p className="dark-kicker"><span /> {t.processKicker}</p><h2>{t.processTitle}</h2></div><div className="process-grid">{process.map(([num, title, detail]) => <div className="process-step" key={num}><span className="process-number">{num}</span><div className="process-avatar"><Sparkles size={21} /></div><h3>{language === "th" ? title : ["Talk ideas", "Plan the system", "Design", "Build", "Test", "Ship"][Number(num) - 1]}</h3><p>{language === "th" ? detail : ["Align on your goals and opportunity.", "Turn the brief into a clear structure.", "Make the product feel simple to use.", "Build in public and keep momentum.", "Check quality across real scenarios.", "Launch with support after handoff."][Number(num) - 1]}</p>{num !== "06" && <ChevronRight className="process-arrow" size={22} />}</div>)}</div></div></section>

    <section id="about" className="dark-section about-section"><div className="site-container about-grid"><div className="about-copy"><p className="dark-kicker"><span /> {t.aboutKicker}</p><h2>{t.aboutTitle}</h2><p>{t.aboutBody}</p><div className="about-list"><span><Check size={15} /> งานของคุณไม่ใช่ Template</span><span><Check size={15} /> เข้าใจธุรกิจไม่ใช่แค่เขียนโค้ด</span><span><Check size={15} /> เทคโนโลยีทันสมัย ปลอดภัย ขยายระบบได้</span><span><Check size={15} /> สื่อสารชัดเจน ไม่หายระหว่างทาง</span></div></div><div className="about-mascot"><img src="/manus-storage/mueang-sam-mok-mascot_f89dec6c.png" alt="Developer mascot" /></div><div className="stats-panel"><div><strong>30<span>+</span></strong><small>โปรเจกต์ที่เสร็จแล้ว</small></div><div><strong>15<span>+</span></strong><small>ลูกค้าที่ไว้ใจเรา</small></div><div><strong>5<span>+</span></strong><small>ปีประสบการณ์</small></div><div><strong>100<span>%</span></strong><small>ดูแลหลังส่งมอบ</small></div></div></div></section>

    <section id="contact" className="contact-section"><div className="site-container contact-grid"><div className="contact-visual"><p className="dark-kicker"><span /> LET'S BUILD TOGETHER</p><h2>{t.formTitle}</h2><p>{t.formBody}</p><div className="contact-pills"><span>Websites</span><span>Web Apps</span><span>Software</span></div></div><form className="dark-form" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); submitLead.mutate({ name: String(form.get("name") || ""), contact: String(form.get("contact") || ""), businessType: String(form.get("businessType") || "") || undefined, serviceType: String(form.get("serviceType") || "") || undefined, budget: String(form.get("budget") || "") || undefined, details: String(form.get("details") || "") || undefined }); event.currentTarget.reset(); }}><div className="form-row"><label>ชื่อของคุณ *<input name="name" required placeholder={language === "th" ? "กรอกชื่อของคุณ" : "Your name"} /></label><label>ช่องทางติดต่อ *<input name="contact" required placeholder={language === "th" ? "เบอร์โทร / อีเมล / LINE" : "Email / phone / LINE"} /></label></div><div className="form-row"><label>ประเภทธุรกิจ<select name="businessType" defaultValue=""><option value="" disabled>{language === "th" ? "เลือกประเภทธุรกิจ" : "Select business type"}</option><option>Website</option><option>Web Application</option><option>Software System</option></select></label><label>งบประมาณโดยประมาณ<select name="budget" defaultValue=""><option value="" disabled>{language === "th" ? "เลือกช่วงงบประมาณ" : "Select a range"}</option><option>฿20,000 – ฿50,000</option><option>฿50,000 – ฿100,000</option><option>฿100,000+</option></select></label></div><label>รายละเอียดเพิ่มเติม<textarea name="details" rows={4} placeholder={language === "th" ? "บอกข้อมูลเบื้องต้นเกี่ยวกับโปรเจกต์ของคุณ" : "Tell us a little about your project"} /></label><button className="glow-button w-full justify-center" type="submit"><Send size={15} /> {t.formButton}</button></form></div></section>

    <footer className="dark-footer"><div className="site-container footer-grid"><div><a href="#top" className="brand-lockup"><span className="brand-mark"><img src="/manus-storage/webcraft-logo_f3b5f60e.png" alt="" /></span><span><b>{language === "th" ? "โค้ดดิ้งเมืองสามหมอก" : "Coding Mueang Sam Mok"}</b><small>CODING MUEANG SAM MOK</small></span></a><p>{t.footerTag}</p><div className="socials"><span>f</span><span>ig</span><span>line</span><span>▶</span></div></div><div><h4>{language === "th" ? "บริการของเรา" : "Services"}</h4><a onClick={() => scrollTo("services")}>เว็บไซต์</a><a onClick={() => scrollTo("services")}>Web Application</a><a onClick={() => scrollTo("services")}>ระบบ Software</a></div><div><h4>{language === "th" ? "ลิงก์สำคัญ" : "Explore"}</h4><a onClick={() => scrollTo("portfolio")}>{t.portfolioKicker}</a><a onClick={() => scrollTo("about")}>{t.aboutKicker}</a><a href="/flow">{t.flow}</a></div><div><h4>{language === "th" ? "ติดต่อเรา" : "Contact"}</h4><a>อีเมล: กำลังเพิ่มข้อมูล</a><a>โทรศัพท์: กำลังเพิ่มข้อมูล</a><a>ที่อยู่: กำลังเพิ่มข้อมูล</a></div></div><div className="site-container footer-bottom"><span>© 2026 Coding Mueang Sam Mok. All rights reserved.</span><span>Made with intent in Mae Hong Son</span></div></footer>
  </main>;
}
