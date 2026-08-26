import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { ShieldCheck, UserRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettings() {
  const users = trpc.admin.users.useQuery();
  const { data: me } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();
  const setRole = trpc.admin.setUserRole.useMutation({
    onSuccess: async () => {
      await utils.admin.users.invalidate();
      await utils.admin.recentActivity.invalidate();
      await utils.admin.usageStats.invalidate();
      toast.success("อัปเดตสิทธิ์ผู้ใช้แล้ว");
    },
    onError: error => toast.error(error.message || "ไม่สามารถอัปเดตสิทธิ์ได้"),
  });
  return (
    <DashboardLayout>
      <div className="admin-shell">
        <header className="admin-topbar">
          <div>
            <p className="admin-eyebrow">CODING MUEANG SAM MOK / SETTINGS</p>
            <h1>จัดการสิทธิ์ผู้ดูแล</h1>
            <p className="admin-subtitle">
              เพิ่มหรือลดสิทธิ์ Admin จากหน้านี้ โดยไม่ต้องแก้ฐานข้อมูล
            </p>
          </div>
        </header>
        <section className="admin-table-card">
          <div className="admin-table-head">
            <div>
              <h2>ผู้ใช้ระบบ</h2>
              <p>สิทธิ์มีผลทันทีในการเข้าถึง Back Office</p>
            </div>
            <ShieldCheck className="admin-table-icon" size={20} />
          </div>
          {users.isLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="animate-spin" />
            </div>
          ) : (
            <div className="admin-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ผู้ใช้</th>
                    <th>วิธีเข้าสู่ระบบ</th>
                    <th>เข้าใช้ล่าสุด</th>
                    <th>สิทธิ์</th>
                    <th>การจัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {(users.data ?? []).map(account => (
                    <tr key={account.id}>
                      <td>
                        <strong>{account.name || "ไม่ระบุชื่อ"}</strong>
                        <small>{account.email || account.openId}</small>
                      </td>
                      <td>{account.loginMethod || "—"}</td>
                      <td>
                        {account.lastSignedIn
                          ? new Date(account.lastSignedIn).toLocaleString(
                              "th-TH"
                            )
                          : "—"}
                      </td>
                      <td>
                        <span
                          className={`status-pill ${account.role === "admin" ? "qualified" : "new"}`}
                        >
                          <UserRound size={13} />{" "}
                          {account.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="admin-primary"
                          disabled={
                            setRole.isPending ||
                            (account.id === me?.id && account.role === "admin")
                          }
                          onClick={() => {
                            const next =
                              account.role === "admin" ? "user" : "admin";
                            if (
                              next === "user" &&
                              !window.confirm(
                                "ยืนยันลดสิทธิ์ผู้ใช้นี้เป็น User หรือไม่?"
                              )
                            )
                              return;
                            setRole.mutate({ userId: account.id, role: next });
                          }}
                        >
                          {setRole.isPending ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : null}
                          {account.role === "admin"
                            ? "ลดสิทธิ์เป็น User"
                            : "แต่งตั้งเป็น Admin"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <p className="text-xs text-muted-foreground mt-4">
          ระบบจะไม่อนุญาตให้ผู้ดูแลลดสิทธิ์ตัวเอง
          และจะรักษาผู้ดูแลอย่างน้อยหนึ่งบัญชีไว้เสมอ
        </p>
      </div>
    </DashboardLayout>
  );
}
