import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { Activity, BarChart3, Clock3, FileText, Users } from "lucide-react";

export default function AdminInsights() {
  const stats = trpc.admin.usageStats.useQuery();
  const activity = trpc.admin.recentActivity.useQuery();
  const cards = stats.data
    ? [
        { label: "ผู้ใช้ทั้งหมด", value: stats.data.users, icon: Users },
        { label: "ผู้ดูแลระบบ", value: stats.data.admins, icon: Users },
        { label: "การเข้าสู่ระบบ", value: stats.data.logins, icon: Activity },
        { label: "Lead", value: stats.data.leads, icon: FileText },
        { label: "โปรเจกต์", value: stats.data.projects, icon: BarChart3 },
        {
          label: "คอนเทนต์และสื่อ",
          value: stats.data.content + stats.data.media,
          icon: FileText,
        },
      ]
    : [];
  return (
    <DashboardLayout>
      <div className="admin-shell">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">CODING MUEANG SAM MOK / ANALYTICS</p>
            <h1>สถิติการใช้งานระบบ</h1>
            <p className="admin-subtitle">
              ภาพรวมจากข้อมูลจริงของระบบและประวัติการเข้าสู่ระบบล่าสุด
            </p>
          </div>
        </header>
        <section className="admin-stat-grid">
          {cards.map(({ label, value, icon: Icon }) => (
            <article className="admin-stat blue" key={label}>
              <div className="admin-stat-icon">
                <Icon size={18} />
              </div>
              <div>
                <p>{label}</p>
                <strong>{value}</strong>
                <small>ข้อมูลปัจจุบัน</small>
              </div>
            </article>
          ))}
        </section>
        <section className="admin-table-card">
          <div className="admin-table-head">
            <div>
              <h2>ประวัติการเข้าสู่ระบบล่าสุด</h2>
              <p>รายการ login และกิจกรรมสิทธิ์ที่บันทึกไว้</p>
            </div>
            <Clock3 className="admin-table-icon" size={20} />
          </div>
          {activity.isLoading ? (
            <div className="p-8 text-muted-foreground">กำลังโหลดข้อมูล...</div>
          ) : activity.data?.length ? (
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>กิจกรรม</th>
                    <th>ผู้ดำเนินการ</th>
                    <th>รายละเอียด</th>
                    <th>เวลา</th>
                  </tr>
                </thead>
                <tbody>
                  {activity.data.map(item => (
                    <tr key={item.id}>
                      <td>
                        <span className="status-pill qualified">
                          <Activity size={13} />{" "}
                          {item.action === "login"
                            ? "เข้าสู่ระบบ"
                            : "เปลี่ยนสิทธิ์"}
                        </span>
                      </td>
                      <td>
                        <strong>{item.userName || "ไม่ระบุชื่อ"}</strong>
                        <small>{item.userEmail || "—"}</small>
                      </td>
                      <td>{item.metadata || "—"}</td>
                      <td>
                        {new Date(item.createdAt).toLocaleString("th-TH")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-muted-foreground">
              ยังไม่มีประวัติการใช้งาน
            </div>
          )}
        </section>
      </div>
    </DashboardLayout>
  );
}
