import { Home, MapPin, Wrench } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <main className="nf-page">
      <div className="nf-stage">
        <div className="nf-mascot">
          <div className="nf-ring" />
          <img src="/media/mascot/mhs-pose-11.png" alt="เมืองสามหมอกเดฟกำลังสงสัย" />
        </div>
        <span className="nf-code">MHS DEV / 404</span>
        <h1 className="nf-title">หลงทางบนดอย?</h1>
        <p className="nf-body">
          หน้านี้อาจถูกย้ายไปแล้ว แต่ไม่ต้องห่วง เมืองสามหมอกเดฟกำลังช่วยหาเส้นทางกลับให้
        </p>
        <div className="nf-actions">
          <button className="button-cobalt" onClick={() => setLocation("/")}>
            <Home size={16} /> กลับหน้าแรก
          </button>
          <button className="ghost-button" onClick={() => (window.location.href = "/tool")}>
            <Wrench size={15} /> เปิด Tool <MapPin size={14} />
          </button>
        </div>
      </div>
    </main>
  );
}
