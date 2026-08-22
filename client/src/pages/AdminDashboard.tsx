import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Activity, ArrowUpRight, BriefcaseBusiness, CheckCircle2, CircleDollarSign, Inbox, Loader2, Plus, RefreshCw, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

const leadStatuses = ["new", "contacted", "qualified", "closed"] as const;
const projectStatuses = ["idea", "active", "review", "completed", "archived"] as const;

export default function AdminDashboard() {
  const leads = trpc.leads.list.useQuery();
  const projects = trpc.projects.list.useQuery();
  const quotes = trpc.quotes.list.useQuery();
  const appointments = trpc.appointments.list.useQuery();
  const utils = trpc.useUtils();
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<"leads" | "projects" | "quotes" | "appointments">(() => {
    const tab = new URLSearchParams(window.location.search).get("tab");
    return tab === "projects" || tab === "quotes" || tab === "appointments" ? tab : "leads";
  });
  useEffect(() => {
    const tab = new URLSearchParams(location.split("?")[1] || "").get("tab");
    if (tab === "projects" || tab === "quotes" || tab === "appointments" || tab === "leads") setActiveTab(tab);
  }, [location]);
  const [projectOpen, setProjectOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [clientName, setClientName] = useState("");

  const updateLead = trpc.leads.updateStatus.useMutation({
    onSuccess: async () => { await utils.leads.list.invalidate(); toast.success("อัปเดตสถานะ Lead แล้ว"); },
    onError: () => toast.error("อัปเดตสถานะไม่สำเร็จ"),
  });
  const updateQuote = trpc.quotes.updateStatus.useMutation({
    onSuccess: async () => { await utils.quotes.list.invalidate(); toast.success("อัปเดตใบประเมินแล้ว"); },
    onError: () => toast.error("อัปเดตใบประเมินไม่สำเร็จ"),
  });
  const updateAppointment = trpc.appointments.updateStatus.useMutation({
    onSuccess: async () => { await utils.appointments.list.invalidate(); toast.success("อัปเดตนัดหมายแล้ว"); },
    onError: () => toast.error("อัปเดตนัดหมายไม่สำเร็จ"),
  });
  const updateProject = trpc.projects.updateStatus.useMutation({
    onSuccess: async () => { await utils.projects.list.invalidate(); toast.success("อัปเดตโปรเจกต์แล้ว"); },
    onError: () => toast.error("อัปเดตสถานะไม่สำเร็จ"),
  });
  const createProject = trpc.projects.create.useMutation({
    onSuccess: async () => { await utils.projects.list.invalidate(); setProjectOpen(false); setProjectName(""); setClientName(""); toast.success("สร้างโปรเจกต์แล้ว"); },
    onError: () => toast.error("สร้างโปรเจกต์ไม่สำเร็จ"),
  });

  const leadRows = leads.data ?? [];
  const projectRows = projects.data ?? [];
  const newLeads = leadRows.filter((lead) => lead.status === "new").length;
  const activeProjects = projectRows.filter((project) => project.status === "active" || project.status === "review").length;
  const completedProjects = projectRows.filter((project) => project.status === "completed").length;
  const quoteRows = quotes.data ?? [];
  const appointmentRows = appointments.data ?? [];

  return <DashboardLayout><div className="admin-shell">
    <header className="admin-topbar"><div><p className="admin-eyebrow">CODING MUEANG SAM MOK / BACK OFFICE</p><h1>ภาพรวมงานหลังบ้าน</h1><p className="admin-subtitle">จัดการ Lead, โปรเจกต์ และคำขอจากเว็บไซต์ในที่เดียว</p></div><button className="admin-refresh" onClick={() => { void leads.refetch(); void projects.refetch(); void quotes.refetch(); void appointments.refetch(); }}><RefreshCw size={15} /> รีเฟรชข้อมูล</button></header>

    <section className="admin-stat-grid"><Stat icon={Inbox} label="Lead ใหม่" value={newLeads} hint="รอติดต่อกลับ" tone="blue" /><Stat icon={BriefcaseBusiness} label="โปรเจกต์กำลังทำ" value={activeProjects} hint="กำลังเดินงาน" tone="purple" /><Stat icon={CheckCircle2} label="ส่งมอบแล้ว" value={completedProjects} hint="จากรายการที่บันทึก" tone="cyan" /><Stat icon={Activity} label="Lead ทั้งหมด" value={leadRows.length} hint="จากทุกช่องทาง" tone="orange" /></section>

    <section className="admin-workspace"><div className="admin-tabs"><button className={activeTab === "leads" ? "active" : ""} onClick={() => setActiveTab("leads")}><Users size={16} /> Lead จากเว็บไซต์ <span>{leadRows.length}</span></button><button className={activeTab === "projects" ? "active" : ""} onClick={() => setActiveTab("projects")}><BriefcaseBusiness size={16} /> โปรเจกต์ <span>{projectRows.length}</span></button><button className={activeTab === "quotes" ? "active" : ""} onClick={() => setActiveTab("quotes")}><CircleDollarSign size={16} /> ใบประเมิน <span>{quoteRows.length}</span></button><button className={activeTab === "appointments" ? "active" : ""} onClick={() => setActiveTab("appointments")}><Activity size={16} /> นัดหมาย <span>{appointmentRows.length}</span></button>{activeTab === "projects" && <button className="admin-primary" onClick={() => setProjectOpen(!projectOpen)}><Plus size={15} /> สร้างโปรเจกต์</button>}</div>
      {projectOpen && <form className="admin-create-form" onSubmit={(event) => { event.preventDefault(); if (!projectName.trim()) return; createProject.mutate({ name: projectName.trim(), clientName: clientName.trim() || undefined, serviceType: "Website" }); }}><label>ชื่อโปรเจกต์<input value={projectName} onChange={(event) => setProjectName(event.target.value)} placeholder="เช่น เว็บไซต์รีสอร์ตแม่ฮ่องสอน" required /></label><label>ชื่อลูกค้า<input value={clientName} onChange={(event) => setClientName(event.target.value)} placeholder="กรอกเมื่อต้องการ" /></label><button className="admin-primary" disabled={createProject.isPending}>{createProject.isPending ? <Loader2 className="animate-spin" size={15} /> : <Plus size={15} />} บันทึกโปรเจกต์</button></form>}
      {activeTab === "leads" ? <LeadTable rows={leadRows} loading={leads.isLoading} onStatus={(id, status) => updateLead.mutate({ id, status })} /> : activeTab === "projects" ? <ProjectTable rows={projectRows} loading={projects.isLoading} onStatus={(id, status, progress) => updateProject.mutate({ id, status, progress })} /> : activeTab === "quotes" ? <QuoteTable rows={quoteRows} loading={quotes.isLoading} onStatus={(id, status) => updateQuote.mutate({ id, status })} /> : <AppointmentTable rows={appointmentRows} loading={appointments.isLoading} onStatus={(id, status) => updateAppointment.mutate({ id, status })} />}
    </section>
  </div></DashboardLayout>;
}

function Stat({ icon: Icon, label, value, hint, tone }: { icon: typeof Inbox; label: string; value: number; hint: string; tone: string }) { return <article className={`admin-stat ${tone}`}><div className="admin-stat-icon"><Icon size={18} /></div><div><p>{label}</p><strong>{value}</strong><small>{hint}</small></div><ArrowUpRight className="admin-stat-arrow" size={16} /></article>; }

function LeadTable({ rows, loading, onStatus }: { rows: Array<{ id: number; name: string; contact: string; businessType: string | null; serviceType: string | null; budget: string | null; status: "new" | "contacted" | "qualified" | "closed"; createdAt: Date }>; loading: boolean; onStatus: (id: number, status: "new" | "contacted" | "qualified" | "closed") => void }) { return <div className="admin-table-card"><div className="admin-table-head"><div><h2>คำขอเข้ามาล่าสุด</h2><p>จัดลำดับการติดตามลูกค้าจากข้อมูลจริงในเว็บไซต์</p></div><span className="admin-live"><span /> LIVE</span></div>{loading ? <LoadingRows /> : rows.length === 0 ? <EmptyState text="ยังไม่มี Lead จากเว็บไซต์" /> : <div className="admin-table-wrap"><table><thead><tr><th>ลูกค้า</th><th>บริการ</th><th>ช่องทาง</th><th>งบประมาณ</th><th>สถานะ</th></tr></thead><tbody>{rows.map((lead) => <tr key={lead.id}><td><strong>{lead.name}</strong><small>{new Date(lead.createdAt).toLocaleString("th-TH")}</small></td><td>{lead.serviceType || lead.businessType || "—"}</td><td>{lead.contact}</td><td>{lead.budget || "—"}</td><td><select className={`status-select ${lead.status}`} value={lead.status} onChange={(event) => onStatus(lead.id, event.target.value as typeof lead.status)}>{leadStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></td></tr>)}</tbody></table></div>}</div>; }

function ProjectTable({ rows, loading, onStatus }: { rows: Array<{ id: number; name: string; clientName: string | null; serviceType: string | null; status: "idea" | "active" | "review" | "completed" | "archived"; progress: number }>; loading: boolean; onStatus: (id: number, status: "idea" | "active" | "review" | "completed" | "archived", progress: number) => void }) { return <div className="admin-table-card"><div className="admin-table-head"><div><h2>โปรเจกต์ทั้งหมด</h2><p>ติดตามสถานะและความคืบหน้าของงานที่รับผิดชอบ</p></div><CircleDollarSign size={18} className="admin-table-icon" /></div>{loading ? <LoadingRows /> : rows.length === 0 ? <EmptyState text="ยังไม่มีโปรเจกต์ที่บันทึก" /> : <div className="admin-table-wrap"><table><thead><tr><th>โปรเจกต์</th><th>ลูกค้า</th><th>บริการ</th><th>ความคืบหน้า</th><th>สถานะ</th></tr></thead><tbody>{rows.map((project) => <tr key={project.id}><td><strong>{project.name}</strong></td><td>{project.clientName || "—"}</td><td>{project.serviceType || "—"}</td><td><div className="progress-cell"><div><span style={{ width: `${project.progress}%` }} /></div><small>{project.progress}%</small></div></td><td><select className={`status-select ${project.status}`} value={project.status} onChange={(event) => onStatus(project.id, event.target.value as typeof project.status, project.status === "completed" ? 100 : project.progress)}>{projectStatuses.map((status) => <option key={status} value={status}>{statusLabel(status)}</option>)}</select></td></tr>)}</tbody></table></div>}</div>; }

function QuoteTable({ rows, loading, onStatus }: { rows: Array<{ id: number; serviceType: string; scope: string | null; estimatedMin: number; estimatedMax: number; status: "draft" | "sent" | "accepted" | "declined"; createdAt: Date }>; loading: boolean; onStatus: (id: number, status: "draft" | "sent" | "accepted" | "declined") => void }) { return <div className="admin-table-card"><div className="admin-table-head"><div><h2>ใบประเมินราคา</h2><p>ตรวจสอบช่วงราคาและสถานะใบประเมินของลูกค้า</p></div><CircleDollarSign className="admin-table-icon" size={18} /></div>{loading ? <LoadingRows /> : rows.length === 0 ? <EmptyState text="ยังไม่มีใบประเมินราคา" /> : <div className="admin-table-wrap"><table><thead><tr><th>บริการ</th><th>ขอบเขตงาน</th><th>ช่วงราคา</th><th>สถานะ</th><th>สร้างเมื่อ</th></tr></thead><tbody>{rows.map((quote) => <tr key={quote.id}><td><strong>{quote.serviceType}</strong></td><td>{quote.scope || "—"}</td><td>฿{quote.estimatedMin.toLocaleString()} – ฿{quote.estimatedMax.toLocaleString()}</td><td><select className={`status-select ${quote.status}`} value={quote.status} onChange={(event) => onStatus(quote.id, event.target.value as typeof quote.status)}>{["draft", "sent", "accepted", "declined"].map((status) => <option key={status} value={status}>{status}</option>)}</select></td><td>{new Date(quote.createdAt).toLocaleDateString("th-TH")}</td></tr>)}</tbody></table></div>}</div>; }

function AppointmentTable({ rows, loading, onStatus }: { rows: Array<{ id: number; customerName: string; contact: string; scheduledAt: Date; durationMinutes: number; status: "requested" | "confirmed" | "completed" | "cancelled" }>; loading: boolean; onStatus: (id: number, status: "requested" | "confirmed" | "completed" | "cancelled") => void }) { return <div className="admin-table-card"><div className="admin-table-head"><div><h2>นัดหมาย</h2><p>ติดตามคำขอคุยโปรเจกต์และการนัดหมายลูกค้า</p></div><Activity className="admin-table-icon" size={18} /></div>{loading ? <LoadingRows /> : rows.length === 0 ? <EmptyState text="ยังไม่มีนัดหมาย" /> : <div className="admin-table-wrap"><table><thead><tr><th>ลูกค้า</th><th>ช่องทาง</th><th>วันเวลา</th><th>ระยะเวลา</th><th>สถานะ</th></tr></thead><tbody>{rows.map((appointment) => <tr key={appointment.id}><td><strong>{appointment.customerName}</strong></td><td>{appointment.contact}</td><td>{new Date(appointment.scheduledAt).toLocaleString("th-TH")}</td><td>{appointment.durationMinutes} นาที</td><td><select className={`status-select ${appointment.status}`} value={appointment.status} onChange={(event) => onStatus(appointment.id, event.target.value as typeof appointment.status)}>{["requested", "confirmed", "completed", "cancelled"].map((status) => <option key={status} value={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div>}</div>; }

function LoadingRows() { return <div className="admin-loading"><Loader2 className="animate-spin" size={20} /> กำลังโหลดข้อมูล...</div>; }
function EmptyState({ text }: { text: string }) { return <div className="admin-empty"><Inbox size={25} /><p>{text}</p><small>ข้อมูลใหม่จะแสดงที่นี่เมื่อมีการส่งจากหน้าเว็บไซต์</small></div>; }
function statusLabel(status: string) { return ({ new: "ใหม่", contacted: "ติดต่อแล้ว", qualified: "ผ่านการคัดกรอง", closed: "ปิดแล้ว", idea: "ไอเดีย", active: "กำลังทำ", review: "รอตรวจ", completed: "เสร็จแล้ว", archived: "เก็บถาวร" } as Record<string, string>)[status] ?? status; }
