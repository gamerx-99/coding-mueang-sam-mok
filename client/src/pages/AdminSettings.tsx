import DashboardLayout from "@/components/DashboardLayout";
import { trpc } from "@/lib/trpc";
import { ShieldCheck, UserRound, Loader2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type AdminAccount = {
  id: number;
  name: string | null;
  email: string | null;
  openId: string;
  loginMethod: string | null;
  lastSignedIn: string | Date | null;
  role: "admin" | "user";
};

export default function AdminSettings() {
  const users = trpc.admin.users.useQuery();
  const { data: me } = trpc.auth.me.useQuery();
  const utils = trpc.useUtils();
  const [demoteTarget, setDemoteTarget] = useState<AdminAccount | null>(null);
  const setRole = trpc.admin.setUserRole.useMutation({
    onSuccess: async () => {
      await utils.admin.users.invalidate();
      await utils.admin.recentActivity.invalidate();
      await utils.admin.usageStats.invalidate();
      toast.success("อัปเดตสิทธิ์ผู้ใช้แล้ว");
    },
    onError: error => toast.error(error.message || "ไม่สามารถอัปเดตสิทธิ์ได้"),
    onSettled: () => setDemoteTarget(null),
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
            <div className="admin-loading">
              <Loader2 className="animate-spin" size={18} />
              <span>กำลังโหลดรายชื่อผู้ใช้...</span>
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
                          className={`status-pill ${
                            account.role === "admin" ? "qualified" : "new"
                          }`}
                        >
                          <UserRound size={13} />{" "}
                          {account.role === "admin" ? "Admin" : "User"}
                        </span>
                      </td>
                      <td>
                        {account.role === "admin" &&
                        account.id === me?.id ? (
                          <button
                            className="admin-secondary"
                            disabled
                            title="ระบบไม่อนุญาตให้ลดสิทธิ์บัญชีของตัวเอง"
                          >
                            ลดสิทธิ์เป็น User
                          </button>
                        ) : account.role === "admin" ? (
                          <button
                            className="admin-secondary"
                            disabled={setRole.isPending}
                            onClick={() => setDemoteTarget(account)}
                          >
                            ลดสิทธิ์เป็น User
                          </button>
                        ) : (
                          <button
                            className="admin-primary"
                            disabled={setRole.isPending}
                            onClick={() =>
                              setRole.mutate({
                                userId: account.id,
                                role: "admin",
                              })
                            }
                          >
                            {setRole.isPending ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : null}
                            แต่งตั้งเป็น Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <p className="admin-settings-note">
          ระบบจะไม่อนุญาตให้ผู้ดูแลลดสิทธิ์ตัวเอง
          และจะรักษาผู้ดูแลอย่างน้อยหนึ่งบัญชีไว้เสมอ
        </p>
      </div>

      <AlertDialog
        open={demoteTarget !== null}
        onOpenChange={open => !open && setDemoteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <ShieldAlert size={18} className="text-destructive" />
              ลดสิทธิ์ผู้ใช้นี้เป็น User?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {demoteTarget?.name || "บัญชีนี้"} (
              {demoteTarget?.email || "—"}) จะเสียสิทธิ์เข้าถึง Back Office
              ทันที การเปลี่ยนแปลงนี้บันทึกในประวัติกิจกรรมของระบบ
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={event => {
                event.preventDefault();
                if (demoteTarget) {
                  setRole.mutate({ userId: demoteTarget.id, role: "user" });
                }
              }}
            >
              {setRole.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : null}
              ยืนยันลดสิทธิ์
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
