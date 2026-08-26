import { Home, MapPin, Search } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();
  return (
    <main className="not-found-page">
      <div className="not-found-stars" />
      <div className="not-found-card">
        <div className="not-found-visual"><div className="not-found-ring" /><img src="/media/mascot/mhs-pose-11.png" alt="เมืองสามหมอกเดฟกำลังสงสัย" /><span className="not-found-bubble"><Search size={13} /> searching...</span></div>
        <span className="not-found-code">MHS DEV / 404</span>
        <h1>หลงทางบนดอย?</h1>
        <p>หน้านี้อาจถูกย้ายไปแล้ว แต่ไม่ต้องห่วง เมืองสามหมอกเดฟกำลังช่วยหาเส้นทางกลับให้</p>
        <button className="not-found-button" onClick={() => setLocation("/")}><Home size={16} /> กลับหน้าแรก <MapPin size={14} /></button>
      </div>
    </main>
  );
}
