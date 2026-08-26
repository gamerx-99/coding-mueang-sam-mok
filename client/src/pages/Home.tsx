import { useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Cloud,
  Code2,
  Database,
  Globe2,
  LogIn,
  Menu,
  MessageCircle,
  Settings2,
  Sparkles,
  Wrench,
  X,
} from "lucide-react";

type Service = {
  icon: typeof Globe2;
  tone: "blue" | "cyan" | "gold" | "navy";
  title: string;
  body: string;
  tags: string[];
};

const services: Service[] = [
  {
    icon: Code2,
    tone: "blue",
    title: "รับทำเว็บไซต์",
    body: "พัฒนาเว็บไซต์ที่สวยงาม ใช้งานง่าย และรองรับทุกหน้าจอ เน้นประสิทธิภาพและความเร็วในการโหลด เพื่อประสบการณ์ที่ดีที่สุดของผู้ใช้",
    tags: ["React", "Next.js", "Tailwind CSS"],
  },
  {
    icon: Settings2,
    tone: "cyan",
    title: "ระบบซอฟต์แวร์องค์กร",
    body: "ออกแบบและพัฒนาระบบซอฟต์แวร์เฉพาะทางที่ปรับให้เข้ากับกระบวนการทำงานขององค์กร เช่น ระบบ ERP, CRM หรือระบบจัดการภายใน",
    tags: ["Node.js", "Python", "ERP / CRM"],
  },
  {
    icon: Cloud,
    tone: "gold",
    title: "Cloud Solutions",
    body: "ให้คำปรึกษาและวางระบบโครงสร้างพื้นฐานบน Cloud ให้เสถียร ปลอดภัย และขยายระบบรองรับการเติบโตของธุรกิจได้",
    tags: ["AWS", "Docker", "Cloud"],
  },
  {
    icon: Database,
    tone: "blue",
    title: "Database Management",
    body: "ออกแบบและจัดการฐานข้อมูลให้มีประสิทธิภาพ พร้อมระบบสำรองข้อมูลและแนวทางรักษาความปลอดภัยที่เหมาะกับงานจริง",
    tags: ["PostgreSQL", "MongoDB", "Redis"],
  },
  {
    icon: Wrench,
    tone: "cyan",
    title: "Custom Software & API Development",
    body: "พัฒนาซอฟต์แวร์ตามความต้องการเฉพาะ และเชื่อมต่อระบบต่าง ๆ ด้วย API พร้อมวาง automation เพื่อลดเวลางานซ้ำ",
    tags: ["RESTful API", "GraphQL", "Automation"],
  },
];

const projectIdeas = [
  { title: "เว็บธุรกิจและ Landing Page", src: "/media/mascot/mhs-pose-08.png", label: "WEBSITE" },
  { title: "ระบบหลังบ้านและข้อมูล", src: "/media/mascot/mhs-pose-13.png", label: "SOFTWARE" },
  { title: "ดูแลระบบต่อหลังเปิดใช้", src: "/media/mascot/mhs-pose-16.png", label: "SUPPORT" },
];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMobileOpen(false);
  };

  return (
    <main className="code-home">
      <header className="code-topbar">
        <div className="code-container code-topbar-inner">
          <a href="#top" className="code-brand" aria-label="Coding Mueang Sam Mok home">
            <span className="code-brand-mark"><Code2 size={19} /></span>
            <span>
              <strong>CODING MUEANG SAM MOK</strong>
              <small>Local Dev • Local Solution</small>
            </span>
          </a>

          <nav className={`code-nav ${mobileOpen ? "is-open" : ""}`} aria-label="Main navigation">
            <button onClick={() => scrollTo("top")}>Home</button>
            <button onClick={() => scrollTo("services")}>Services</button>
            <button onClick={() => scrollTo("portfolio")}>Portfolio</button>
            <button onClick={() => scrollTo("about")}>About Us</button>
            <button onClick={() => scrollTo("process")}>Process</button>
            <button onClick={() => scrollTo("contact")}>Contact</button>
            <Link href="/tool/" onClick={() => setMobileOpen(false)} className="code-nav-tool"><Wrench size={14} /> Tool</Link>
            <Link href="/login" onClick={() => setMobileOpen(false)} className="code-nav-login"><LogIn size={14} /> Login</Link>
          </nav>

          <div className="code-topbar-actions">
            <Link href="/login" className="code-login-pill"><LogIn size={14} /> Login</Link>
            <Link href="/tool/" className="code-tool-pill"><Wrench size={14} /> Tool</Link>
            <button className="code-menu-button" onClick={() => setMobileOpen(value => !value)} aria-label="Open menu">
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
          </div>
        </div>
      </header>

      <section id="top" className="code-hero">
        <div className="code-container code-hero-grid">
          <div className="code-hero-copy">
            <span className="code-eyebrow"><i /> TECH STACK &amp; CAPABILITIES</span>
            <h1>เครื่องมือและ<br /><em>บริการของเรา</em></h1>
            <p>เราใช้เทคโนโลยีที่ทันสมัยและมีประสิทธิภาพสูงในการพัฒนาซอฟต์แวร์ เพื่อสร้างโซลูชันที่ตอบโจทย์ธุรกิจของคุณ ตั้งแต่การออกแบบ UI/UX ไปจนถึงการจัดการฐานข้อมูลและโครงสร้างพื้นฐานบนคลาวด์</p>
            <div className="code-hero-badges">
              <span><Code2 size={15} /> Full-Stack Dev</span>
              <span><Cloud size={15} /> Cloud Native</span>
              <span><Sparkles size={15} /> High Performance</span>
            </div>
            <div className="code-hero-actions">
              <button className="code-primary-button" onClick={() => scrollTo("contact")}><MessageCircle size={16} /> คุยโปรเจกต์กับเรา</button>
              <button className="code-secondary-button" onClick={() => scrollTo("services")}>ดูบริการทั้งหมด <ArrowRight size={16} /></button>
            </div>
          </div>

          <div className="code-hero-art" aria-label="เมืองสามหมอกเดฟ mascot">
            <div className="code-hero-halo" />
            <div className="code-hero-grid-lines" />
            <div className="code-mascot-stage">
              <span className="code-stage-label">MHS DEV / READY TO BUILD</span>
              <img src="/media/mhs-dev-mascot.png" alt="เมืองสามหมอกเดฟกำลังเขียนโค้ด" />
              <span className="code-stage-mountain" />
            </div>
            <span className="code-floating-badge code-floating-code"><Code2 size={16} /> &lt;/&gt; CODE</span>
            <span className="code-floating-badge code-floating-cloud"><Cloud size={16} /> CLOUD</span>
            <span className="code-floating-badge code-floating-data"><Database size={16} /> DATABASE</span>
            <span className="code-hero-coffee">MHS <small>COFFEE MODE</small></span>
          </div>
        </div>
      </section>

      <section id="services" className="code-section code-services">
        <div className="code-container">
          <div className="code-section-heading">
            <div><span className="code-eyebrow"><i /> 01 / SERVICES</span><h2>โซลูชันที่เริ่มจากโจทย์จริง</h2></div>
            <p>เลือกเฉพาะสิ่งที่ธุรกิจต้องใช้ก่อน แล้วค่อยต่อยอดเมื่อพร้อม เราออกแบบให้ใช้งานได้จริงและดูแลต่อได้</p>
          </div>
          <div className="code-service-grid">
            {services.map(({ icon: Icon, tone, title, body, tags }) => (
              <article className={`code-service-card ${tone}`} key={title}>
                <div className="code-card-icon"><Icon size={27} /></div>
                <div className="code-card-content"><h3>{title}</h3><p>{body}</p></div>
                <div className="code-card-tags">{tags.map(tag => <span key={tag}>{tag}</span>)}</div>
                <button onClick={() => scrollTo("contact")} className="code-card-link">ดูรายละเอียดเพิ่มเติม <ArrowRight size={16} /></button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="portfolio" className="code-section code-projects">
        <div className="code-container">
          <div className="code-section-heading"><div><span className="code-eyebrow"><i /> 02 / PROJECT DIRECTIONS</span><h2>เริ่มต้นจากภาพที่คุณเห็น</h2></div><p>ไม่ต้องมีคำตอบครบตั้งแต่วันแรก แค่เล่าโจทย์ แล้วเราจะช่วยแปลงให้เป็นระบบที่จับต้องได้</p></div>
          <div className="code-project-grid">
            {projectIdeas.map(({ title, src, label }) => <button className="code-project-card" key={label} onClick={() => scrollTo("contact")}><span>{label}</span><img src={src} alt="" /><strong>{title}</strong><ArrowRight size={16} /></button>)}
          </div>
        </div>
      </section>

      <section id="about" className="code-section code-about">
        <div className="code-container code-about-grid">
          <div><span className="code-eyebrow"><i /> 03 / LOCAL DEV</span><h2>เด็กผู้ชายขี้เล่น<br /><em>แต่ทำงานจริง</em></h2><p>สามหมอกโค้ดดิ้งคือทีมจากแม่ฮ่องสอนที่เชื่อว่าเทคโนโลยีไม่ควรทำให้คนรู้สึกไกลตัว เราคุยด้วยภาษาคน วางระบบเป็นขั้นตอน และอยู่ดูแลต่อเมื่อคุณต้องการ</p><div className="code-about-points"><span>01 <b>คุยง่าย</b></span><span>02 <b>เห็นภาพก่อนเริ่ม</b></span><span>03 <b>ดูแลต่อได้</b></span></div></div>
          <div className="code-about-visual"><img src="/media/mascot/mhs-pose-18.png" alt="เมืองสามหมอกเดฟพักกับกาแฟ MHS" /><span>WRITE CODE<br />FROM THE MOUNTAINS</span></div>
        </div>
      </section>

      <section id="process" className="code-section code-process">
        <div className="code-container"><div className="code-section-heading"><div><span className="code-eyebrow"><i /> 04 / PROCESS</span><h2>ชัดเจนตั้งแต่คุยจนส่งมอบ</h2></div><p>ทุกขั้นตอนมีจุดเช็กที่เข้าใจง่าย ลดความเสี่ยง และทำให้คุณเห็นความคืบหน้า</p></div><div className="code-process-steps"><span><b>01</b> คุยโจทย์</span><span><b>02</b> วางระบบ</span><span><b>03</b> ออกแบบ</span><span><b>04</b> พัฒนา</span><span><b>05</b> ทดสอบ</span><span><b>06</b> ส่งมอบ</span></div></div>
      </section>

      <section id="contact" className="code-contact"><div className="code-container code-contact-inner"><div><span className="code-eyebrow"><i /> 05 / START A PROJECT</span><h2>มีไอเดียอยากทำเว็บ?<br /><em>เริ่มคุยกันได้เลย</em></h2><p>กดเข้าสู่ Tool เพื่อทดลองวาง Flow หรือเข้าสู่ Login เพื่อจัดการระบบหลังบ้าน</p></div><div className="code-contact-actions"><Link href="/tool/" className="code-primary-button"><Wrench size={16} /> เปิด Tool</Link><Link href="/login" className="code-secondary-button"><LogIn size={16} /> เข้าสู่ Login</Link></div></div></section>

      <footer className="code-footer"><div className="code-container code-footer-inner"><div><a href="#top" className="code-brand"><span className="code-brand-mark"><Code2 size={19} /></span><span><strong>CODING MUEANG SAM MOK</strong><small>Local Dev • Local Solution</small></span></a><p>เขียนโค้ดบนดอย ไม่ต้องรอ Silicon Valley</p></div><div className="code-footer-links"><Link href="/tool/">Tool</Link><Link href="/login">Login</Link><a href="#services">Services</a><a href="#contact">Contact</a></div></div><div className="code-container code-footer-bottom">© 2026 Coding Mueang Sam Mok <span>Made with care in Mae Hong Son</span></div></footer>
    </main>
  );
}
