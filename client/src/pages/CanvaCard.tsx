import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Link2, Loader2, Unlink } from "lucide-react";
import { toast } from "sonner";

type CanvaStatus = {
  connected: boolean;
  configured: boolean;
  displayName?: string | null;
  canvaUserId?: string | null;
  scopes?: string | null;
  error?: string;
};

/**
 * Canva Connect card for the Tool Hub — C1 scope: connect / status / disconnect.
 * Tokens never reach the client; this card only sees connection metadata.
 */
export function CanvaCard() {
  const [status, setStatus] = useState<CanvaStatus | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/canva/status", { credentials: "include" })
      .then(response => (response.ok ? response.json() : { connected: false, configured: true }))
      .then((data: CanvaStatus) => {
        if (!cancelled) setStatus(data);
      })
      .catch(() => {
        if (!cancelled) setStatus({ connected: false, configured: true });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const disconnect = async () => {
    setBusy(true);
    try {
      const response = await fetch("/api/canva/disconnect", {
        method: "POST",
        credentials: "include",
      });
      if (response.ok) {
        setStatus(current => (current ? { ...current, connected: false } : current));
        toast.success("ยกเลิกการเชื่อมต่อ Canva แล้ว (revoke ที่ Canva แล้ว)");
      } else {
        toast.error("ยกเลิกการเชื่อมต่อไม่สำเร็จ");
      }
    } catch {
      toast.error("ยกเลิกการเชื่อมต่อไม่สำเร็จ");
    } finally {
      setBusy(false);
    }
  };

  if (status === null) {
    return (
      <div className="toolhub-canva-card">
        <Loader2 size={16} className="animate-spin" />
        <span>กำลังตรวจสถานะการเชื่อมต่อ Canva…</span>
      </div>
    );
  }

  if (!status.configured) {
    return (
      <div className="toolhub-canva-card">
        <Link2 size={16} />
        <div className="toolhub-canva-body">
          <strong>Canva Integration</strong>
          <span>
            ยังไม่ได้ตั้งค่า integration — ต้องมี CANVA_CLIENT_ID / CANVA_CLIENT_SECRET
            ใน environment ก่อน (ดูขั้นตอนในรายงาน Phase C1)
          </span>
        </div>
      </div>
    );
  }

  if (status.connected) {
    return (
      <div className="toolhub-canva-card is-connected">
        <CheckCircle2 size={16} />
        <div className="toolhub-canva-body">
          <strong>เชื่อมต่อ Canva แล้ว{status.displayName ? ` — ${status.displayName}` : ""}</strong>
          <span>พร้อมใช้งานโมดูล Canva (Phase C2/C3 จะเพิ่ม import/export ในเวลาต่อมา)</span>
        </div>
        <button className="toolhub-canva-unlink" onClick={disconnect} disabled={busy}>
          {busy ? <Loader2 size={13} className="animate-spin" /> : <Unlink size={13} />}
          ยกเลิกการเชื่อมต่อ
        </button>
      </div>
    );
  }

  return (
    <div className="toolhub-canva-card">
      <Link2 size={16} />
      <div className="toolhub-canva-body">
        <strong>เชื่อมต่อบัญชี Canva</strong>
        <span>
          เพื่อส่ง/ดึงไฟล์ระหว่างเครื่องมือในเว็บกับ Canva ของคุณ
          (อนุญาตผ่านหน้า Canva ครั้งเดียว — ยกเลิกได้ทุกเมื่อ)
        </span>
      </div>
      <a className="toolhub-canva-connect" href="/api/canva/connect?returnTo=/tool">
        <ExternalLink size={14} /> เชื่อมต่อผ่าน Canva
      </a>
    </div>
  );
}
