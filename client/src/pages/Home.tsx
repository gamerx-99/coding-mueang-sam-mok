/* Design system: Editorial Swiss Craft — asymmetrical rails, paper texture, cobalt/coral annotations, concise Thai editorial voice. */
import { useState } from "react";
import { ArrowUpRight, Check, ChevronDown, Instagram, Mail, Menu, Phone, Sparkles, X } from "lucide-react";
import { toast } from "sonner";

const services = [
  { no: "01", title: "เว็บไซต์ธุรกิจ", detail: "วางภาพลักษณ์ให้แบรนด์ดูน่าเชื่อถือ พร้อมโครงสร้างที่พาคนไปถึงการติดต่อ", tag: "Business" },
  { no: "02", title: "ร้านค้าออนไลน์", detail: "ออกแบบประสบการณ์ซื้อที่ชัด ตั้งแต่หน้าสินค้าจนถึงปุ่มสั่งซื้อ", tag: "Commerce" },
  { no: "03", title: "Landing Page", detail: "หน้าเดียวที่เล่าแคมเปญหรือบริการได้ครบ และพร้อมวัดผลการเติบโต", tag: "Campaign" },
  { no: "04", title: "เว็บพอร์ตโฟลิโอ", detail: "จัดจังหวะผลงานให้โดดเด่น เพื่อให้คนเห็นฝีมือและจำแบรนด์คุณได้", tag: "Portfolio" },
];

const packages = [
  { name: "STARTER", price: "เริ่มต้น 18,900", desc: "สำหรับธุรกิจที่กำลังสร้างตัวตนบนออนไลน์", items: ["Landing page 1 หน้า", "Responsive ทุกหน้าจอ", "วางโครงเนื้อหาเบื้องต้น"] },
  { name: "SIGNATURE", price: "เริ่มต้น 39,900", desc: "สำหรับแบรนด์ที่พร้อมสื่อสารอย่างจริงจัง", items: ["เว็บไซต์ 5–7 หน้า", "ออกแบบ UI แบบเฉพาะแบรนด์", "วางระบบ SEO เบื้องต้น", "ดูแลหลังส่งมอบ 30 วัน"], featured: true },
  { name: "CUSTOM", price: "คุยโจทย์ก่อนประเมิน", desc: "สำหรับโปรเจกต์ที่มีระบบหรือประสบการณ์เฉพาะ", items: ["วางกลยุทธ์และ user flow", "ออกแบบระบบตามโจทย์", "เชื่อมต่อเครื่องมือที่จำเป็น"] },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [formSent, setFormSent] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormSent(true);
    toast.success("รับข้อมูลแล้ว — เราจะติดต่อกลับเพื่อคุยโจทย์ของคุณ");
  };

  return (
    <main className="min-h-screen overflow-hidden bg-paper text-ink selection:bg-cobalt selection:text-white">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-ink/10 bg-paper/90 backdrop-blur-md">
        <div className="container flex h-[72px] items-center justify-between">
          <button onClick={() => scrollTo("top")} className="group flex items-center gap-3" aria-label="กลับไปด้านบน">
            <span className="grid h-9 w-9 place-items-center bg-cobalt p-1 transition-transform duration-200 group-hover:rotate-6"><img src="/manus-storage/webcraft-logo_eb9c7f44.png" alt="" className="h-full w-full object-contain" /></span>
            <span className="font-display text-lg font-bold tracking-[-0.08em]">webcraft<span className="ml-1 text-coral">/studio</span></span>
          </button>
          <nav className="hidden items-center gap-8 text-sm font-semibold md:flex" aria-label="เมนูหลัก">
            <button className="nav-link" onClick={() => scrollTo("services")}>บริการ</button>
            <button className="nav-link" onClick={() => scrollTo("work")}>ผลงาน</button>
            <button className="nav-link" onClick={() => scrollTo("process")}>วิธีทำงาน</button>
            <button className="button-cobalt px-5 py-3" onClick={() => scrollTo("contact")}>คุยกับเรา <ArrowUpRight size={16} /></button>
          </nav>
          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)} aria-label="เปิดเมนู">{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <div className="border-t border-ink/10 bg-paper px-6 py-5 md:hidden"><div className="flex flex-col gap-5 text-sm font-semibold"><button onClick={() => scrollTo("services")}>บริการ</button><button onClick={() => scrollTo("work")}>ผลงาน</button><button onClick={() => scrollTo("process")}>วิธีทำงาน</button><button className="button-cobalt justify-center" onClick={() => scrollTo("contact")}>คุยกับเรา <ArrowUpRight size={16} /></button></div></div>}
      </header>

      <section id="top" className="relative pt-[72px]">
        <div className="container grid min-h-[680px] items-center gap-12 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-4 lg:py-28">
          <div className="relative z-10 max-w-[690px]">
            <p className="eyebrow mb-7"><span className="eyebrow-dot" /> DIGITAL DESIGN STUDIO / BANGKOK</p>
            <h1 className="font-display text-[clamp(3.5rem,8vw,7.4rem)] font-bold leading-[0.9] tracking-[-0.08em]">เว็บไซต์ที่ทำให้คน<br /><span className="text-cobalt">อยากรู้จัก</span><br />แบรนด์คุณต่อ<span className="text-coral">.</span></h1>
            <div className="mt-10 flex flex-col gap-7 sm:flex-row sm:items-center"><p className="max-w-[290px] text-[15px] leading-7 text-ink/65">เราออกแบบและพัฒนาเว็บไซต์ที่สวย มีเหตุผล และช่วยให้ธุรกิจเดินหน้าได้จริง</p><button className="button-ink self-start" onClick={() => scrollTo("contact")}>เล่าโจทย์ให้เราฟัง <ArrowUpRight size={17} /></button></div>
          </div>
          <div className="relative lg:-mr-24">
            <div className="absolute -left-5 top-8 z-10 bg-coral px-3 py-2 font-mono text-[10px] font-bold tracking-[0.15em] text-ink shadow-lg">CRAFTED / 2026</div>
            <div className="hero-frame"><img src="/manus-storage/webcraft-hero_60a725f7.png" alt="ภาพนามธรรมแสดงแนวคิดการออกแบบเว็บไซต์" /><div className="hero-grid" /></div>
            <div className="absolute -bottom-10 -right-3 hidden max-w-[160px] border-l-2 border-cobalt pl-4 text-xs leading-5 text-ink/60 sm:block">โครงสร้างดีไซน์ที่ชัดเจน เริ่มจากความเข้าใจธุรกิจ</div>
          </div>
        </div>
        <div className="container flex items-center justify-between border-t border-ink/15 py-5 font-mono text-[10px] font-bold tracking-[0.16em] text-ink/45"><span>SCROLL TO EXPLORE</span><span className="flex items-center gap-2">↓ <span className="hidden sm:inline">WEB EXPERIENCE / 001</span></span></div>
      </section>

      <section id="services" className="bg-ink py-24 text-paper sm:py-32"><div className="container"><div className="mb-16 grid gap-8 lg:grid-cols-[0.4fr_1fr]"><p className="eyebrow text-paper/50"><span className="eyebrow-dot bg-coral" /> WHAT WE MAKE</p><div><h2 className="font-display text-5xl font-bold leading-none tracking-[-0.06em] sm:text-7xl">จากโจทย์ที่ยัง<br /><span className="text-coral">ไม่เป็นรูป</span></h2><p className="mt-7 max-w-[500px] leading-7 text-paper/60">ทุกโปรเจกต์เริ่มต้นจากการฟัง เราช่วยแปลงความคิดที่กระจัดกระจายให้กลายเป็นประสบการณ์ดิจิทัลที่คนเข้าใจและอยากมีส่วนร่วม</p></div></div><div className="grid border-t border-paper/20 md:grid-cols-2">{services.map((service) => <div key={service.no} className="service-card group border-b border-paper/20 py-8 md:even:border-l md:even:pl-10 md:odd:pr-10"><div className="flex items-start justify-between"><span className="font-mono text-xs text-coral">/{service.no}</span><span className="font-mono text-[10px] tracking-[0.18em] text-paper/35">{service.tag}</span></div><h3 className="mt-10 font-display text-3xl font-bold tracking-[-0.04em] transition-colors group-hover:text-coral">{service.title}<ArrowUpRight className="ml-2 inline-block opacity-0 transition-opacity group-hover:opacity-100" size={24} /></h3><p className="mt-4 max-w-[370px] text-sm leading-6 text-paper/55">{service.detail}</p></div>)}</div></div></section>

      <section id="work" className="bg-bluewash py-24 sm:py-32"><div className="container"><div className="mb-14 flex flex-col justify-between gap-6 sm:flex-row sm:items-end"><div><p className="eyebrow mb-5"><span className="eyebrow-dot" /> SELECTED WORK / 2024—26</p><h2 className="font-display text-5xl font-bold tracking-[-0.07em] sm:text-7xl">งานที่เล่า<br /><span className="text-cobalt">เรื่องได้ดี</span></h2></div><p className="max-w-[260px] text-sm leading-6 text-ink/60">ผลงานแต่ละชิ้นถูกออกแบบให้เหมาะกับเสียงของแบรนด์ ไม่ใช่แค่สวยในหน้าจอ</p></div><div className="grid gap-7 lg:grid-cols-[1.15fr_0.85fr]"><article className="group"><div className="work-image aspect-[4/3]"><img src="/manus-storage/webcraft-work-1_558a4eaf.png" alt="ตัวอย่างงานออกแบบเว็บไซต์ร้านค้าออนไลน์" /><span className="work-label">01 / E-COMMERCE</span></div><div className="mt-5 flex items-start justify-between gap-4"><div><h3 className="font-display text-2xl font-bold">Morrow Objects</h3><p className="mt-1 text-sm text-ink/55">ร้านของแต่งบ้านที่เล่าเรื่องวัสดุอย่างมีรสนิยม</p></div><ArrowUpRight className="mt-1 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div></article><article className="group lg:mt-24"><div className="work-image aspect-[4/3]"><img src="/manus-storage/webcraft-work-2_75f57a21.png" alt="ตัวอย่างงานออกแบบเว็บไซต์ธุรกิจโรงแรม" /><span className="work-label">02 / HOSPITALITY</span></div><div className="mt-5 flex items-start justify-between gap-4"><div><h3 className="font-display text-2xl font-bold">Serein House</h3><p className="mt-1 text-sm text-ink/55">พื้นที่พักใจที่เริ่มต้นตั้งแต่หน้าแรก</p></div><ArrowUpRight className="mt-1 transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" /></div></article></div></div></section>

      <section id="process" className="bg-paper py-24 sm:py-32"><div className="container"><div className="grid gap-14 lg:grid-cols-[0.4fr_1fr]"><div><p className="eyebrow"><span className="eyebrow-dot" /> THE PROCESS</p><h2 className="mt-6 font-display text-5xl font-bold leading-[0.94] tracking-[-0.06em] sm:text-6xl">คิดเป็น<br /><span className="text-cobalt">ขั้นตอน</span><br />ทำเป็นระบบ</h2></div><div className="border-t border-ink/15">{[{n:"01",t:"Discovery",d:"ทำความเข้าใจธุรกิจ กลุ่มเป้าหมาย และสิ่งที่อยากให้คนรู้สึก"},{n:"02",t:"Direction",d:"วางโครงสร้างและทิศทางภาพให้เห็นภาพเดียวกันก่อนเริ่มทำจริง"},{n:"03",t:"Design & Build",d:"ออกแบบหน้าจอ พัฒนาเว็บไซต์ และทำให้ทุกอย่างใช้งานได้ลื่นไหล"},{n:"04",t:"Launch & Care",d:"ส่งมอบพร้อมคำแนะนำ และดูแลหลังเปิดตัวให้คุณไปต่อได้"}].map((item) => <div key={item.n} className="process-row grid gap-4 border-b border-ink/15 py-7 sm:grid-cols-[80px_180px_1fr]"><span className="font-mono text-xs text-cobalt">/{item.n}</span><h3 className="font-display text-xl font-bold">{item.t}</h3><p className="text-sm leading-6 text-ink/55">{item.d}</p></div>)}</div></div></div></section>

      <section className="border-y border-ink/15 bg-paper py-20 sm:py-28"><div className="container"><div className="mb-12 flex items-center justify-between"><p className="eyebrow"><span className="eyebrow-dot bg-coral" /> SIMPLE, CLEAR, USEFUL / 003</p><div className="flex items-center gap-3"><span className="font-mono text-[10px] tracking-[0.15em] text-ink/40">INVESTMENT GUIDE</span><Sparkles className="text-coral" size={22} /></div></div><div className="grid gap-5 lg:grid-cols-3">{packages.map((pkg) => <div key={pkg.name} className={`package-card ${pkg.featured ? "featured" : ""}`}><div className="flex items-start justify-between"><span className="font-mono text-[11px] font-bold tracking-[0.17em]">{pkg.name}</span>{pkg.featured && <span className="bg-cobalt px-2 py-1 font-mono text-[9px] font-bold tracking-[0.15em] text-white">MOST POPULAR</span>}</div><p className="mt-8 font-display text-2xl font-bold">{pkg.price}</p><p className="mt-2 min-h-12 text-sm leading-6 text-ink/60">{pkg.desc}</p><div className="my-7 h-px bg-ink/15" /><ul className="space-y-3 text-sm">{pkg.items.map((item) => <li key={item} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-cobalt" />{item}</li>)}</ul><button onClick={() => scrollTo("contact")} className="mt-9 flex w-full items-center justify-between border-b border-ink/30 pb-3 text-sm font-bold">เลือกแพ็กเกจนี้ <ArrowUpRight size={16} /></button></div>)}</div></div></section>

      <section id="contact" className="relative bg-bluewash py-24 sm:py-32"><div className="absolute right-6 top-10 hidden font-mono text-[10px] tracking-[0.15em] text-ink/35 lg:block">CONTACT / 004</div><div className="container grid gap-14 lg:grid-cols-[0.8fr_1.2fr]"><div><p className="eyebrow mb-6"><span className="eyebrow-dot" /> START A PROJECT</p><h2 className="font-display text-6xl font-bold leading-[0.9] tracking-[-0.07em] sm:text-8xl">พร้อมทำให้<br /><span className="text-cobalt">ชัดขึ้น</span>ไหม<span className="text-coral">?</span></h2><p className="mt-8 max-w-[330px] text-sm leading-7 text-ink/60">เล่าไอเดีย งบประมาณ หรือปัญหาที่กำลังเจอมาได้เลย ไม่มีคำถามไหนเล็กเกินไป</p><div className="mt-10 space-y-3 text-sm"><a className="flex items-center gap-3 font-semibold hover:text-cobalt" href="mailto:hello@webcraft.studio"><Mail size={17} /> hello@webcraft.studio</a><a className="flex items-center gap-3 font-semibold hover:text-cobalt" href="tel:+6621234567"><Phone size={17} /> 02 123 4567</a><a className="flex items-center gap-3 font-semibold hover:text-cobalt" href="#contact"><Instagram size={17} /> @webcraft.studio</a></div></div><div className="bg-paper p-7 shadow-[12px_12px_0_#2457FF] sm:p-10"><div className="mb-8 flex items-center justify-between border-b border-ink/15 pb-5"><h3 className="font-display text-2xl font-bold">บรีฟโปรเจกต์</h3><span className="font-mono text-[10px] tracking-[0.15em] text-ink/40">FORM / 001</span></div>{formSent ? <div className="grid min-h-[340px] place-items-center text-center"><div><div className="mx-auto grid h-14 w-14 place-items-center bg-cobalt text-white"><Check /></div><h3 className="mt-6 font-display text-3xl font-bold">ขอบคุณที่ทักมา</h3><p className="mt-3 text-sm text-ink/60">ทีมงานจะติดต่อกลับภายใน 1 วันทำการ</p><button className="mt-7 text-sm font-bold text-cobalt underline" onClick={() => setFormSent(false)}>ส่งข้อความใหม่</button></div></div> : <form className="space-y-6" onSubmit={handleSubmit}><label className="field"><span>ชื่อ / ชื่อแบรนด์</span><input required placeholder="เช่น Morrow Objects" /></label><label className="field"><span>อีเมลที่ติดต่อได้</span><input required type="email" placeholder="you@company.com" /></label><label className="field"><span>อยากให้เราช่วยเรื่องอะไร</span><select defaultValue=""><option value="" disabled>เลือกบริการ</option><option>เว็บไซต์ธุรกิจ</option><option>ร้านค้าออนไลน์</option><option>Landing Page</option><option>ยังไม่แน่ใจ ขอคุยก่อน</option></select><ChevronDown className="pointer-events-none absolute bottom-3 right-0" size={17} /></label><label className="field"><span>เล่าโจทย์สั้น ๆ</span><textarea required rows={3} placeholder="ตอนนี้กำลังทำอะไร และอยากให้เว็บไซต์ช่วยเรื่องไหน..." /></label><button type="submit" className="button-cobalt w-full justify-center py-4">ส่งบรีฟให้ WebCraft <ArrowUpRight size={17} /></button></form>}</div></div></section>

      <footer className="bg-ink py-8 text-paper"><div className="container flex flex-col justify-between gap-5 sm:flex-row sm:items-center"><div className="flex items-center gap-3"><span className="grid h-8 w-8 place-items-center bg-cobalt p-1"><img src="/manus-storage/webcraft-logo_eb9c7f44.png" alt="" className="h-full w-full object-contain" /></span><span className="font-display font-bold tracking-[-0.08em]">webcraft<span className="ml-1 text-coral">/studio</span></span></div><p className="font-mono text-[10px] tracking-[0.14em] text-paper/40">© 2026 WEBCRAFT STUDIO / MADE WITH INTENT</p><button onClick={() => scrollTo("top")} className="text-sm font-semibold text-paper/70 hover:text-coral">กลับด้านบน ↑</button></div></footer>
    </main>
  );
}
