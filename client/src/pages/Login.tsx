import { Button } from "@/components/ui/button";
import { FacebookLoginButton } from "@/components/FacebookLoginButton";
import { startGoogleLogin, startFacebookLogin } from "@/const";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, Coffee, Mountain, ShieldCheck, Sparkles } from "lucide-react";

export default function Login() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user && !loading) setLocation("/admin");
  }, [user, loading, setLocation]);

  const searchParams = new URLSearchParams(window.location.search);
  const errorParam = searchParams.get("error");
  const errorMessage = errorParam
    ? ({
        access_denied: "คุณยกเลิกการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง",
        callback_failed: "เข้าสู่ระบบ Google ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
        invalid_grant: "เซสชัน Google หมดอายุ กรุณาเริ่มเข้าสู่ระบบใหม่",
        invalid_state: "เซสชันหมดอายุ กรุณาลองใหม่อีกครั้ง",
        profile_lookup_failed: "ไม่สามารถอ่านข้อมูลบัญชี Google ได้",
        token_exchange_failed: "ไม่สามารถยืนยันบัญชีกับ Google ได้",
        facebook_not_configured: "ระบบ Login ยังไม่ได้ตั้งค่า Facebook OAuth ครบถ้วน",
        facebook_redirect_uri_mismatch: "โดเมนหรือ Callback URL ของ Facebook ยังไม่ตรงกับที่ตั้งค่าไว้",
        facebook_code_invalid: "รหัสยืนยันจาก Facebook หมดอายุ กรุณาลองเข้าสู่ระบบใหม่",
        facebook_token_exchange_failed: "ไม่สามารถยืนยันบัญชีกับ Facebook ได้ กรุณาลองใหม่อีกครั้ง",
        facebook_profile_lookup_failed: "ไม่สามารถอ่านข้อมูลบัญชี Facebook ได้",
        facebook_callback_failed: "เข้าสู่ระบบ Facebook ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง",
        "Facebook Login is not configured": "ระบบ Login ยังไม่ได้ตั้งค่า Facebook OAuth ครบถ้วน",
        "Google Login is not configured": "ระบบ Login ยังไม่ได้ตั้งค่า Google OAuth ครบถ้วน",
      }[errorParam] ?? errorParam)
    : null;

  return (
    <main className="auth-page">
      <div className="auth-noise" />
      <header className="auth-topbar">
        <button onClick={() => setLocation("/")} className="auth-back"><ArrowLeft size={16} /> กลับสู่หน้าหลัก</button>
        <span className="auth-code">MHS DEV / PRIVATE WORKSPACE</span>
      </header>
      <section className="auth-shell">
        <div className="auth-story">
          <span className="auth-kicker"><Mountain size={14} /> LOCAL DIGITAL STUDIO</span>
          <h1>เข้าไปดูหลังบ้าน<br /><em>แล้วสร้างของจริงกัน</em></h1>
          <p>พื้นที่สำหรับจัดการ Lead, โปรเจกต์, คอนเทนต์ และข้อมูลที่ทำให้ไอเดียของคุณเดินต่อได้</p>
          <div className="auth-pose-card">
            <div className="auth-pose-glow" />
            <img src="/media/mascot/mhs-pose-01.png" alt="เมืองสามหมอกเดฟกำลังเขียนโค้ด" />
            <div className="auth-pose-note"><Coffee size={15} /><span><b>MHS COFFEE MODE</b><small>ready to build</small></span></div>
          </div>
          <div className="auth-values"><span><Sparkles size={14} /> เข้าใจง่าย</span><span><ShieldCheck size={14} /> ปลอดภัย</span><span><Mountain size={14} /> จากแม่ฮ่องสอน</span></div>
        </div>
        <div className="auth-card">
          <div className="auth-card-mark"><ShieldCheck size={21} /></div>
          <span className="auth-card-label">SIGN IN / 01</span>
          <h2>เข้าสู่ระบบแผงควบคุม</h2>
          <p>เลือกบัญชีเพื่อเข้าไปจัดการระบบหลังบ้านของสามหมอกโค้ดดิ้ง</p>
          {errorMessage && <div className="auth-error" role="alert"><b>พบปัญหา:</b> {errorMessage}</div>}
          <div className="auth-actions">
            <Button onClick={() => startGoogleLogin()} size="lg" className="auth-google"><span className="google-mark">G</span><span>เข้าสู่ระบบด้วย Google</span></Button>
            <FacebookLoginButton onClick={() => startFacebookLogin()} label="Continue with Facebook" />
          </div>
          <div className="auth-footnote"><ShieldCheck size={14} /><span>ระบบยืนยันตัวตนสำหรับทีมงานและผู้ดูแลเท่านั้น</span></div>
        </div>
      </section>
      <footer className="auth-footer">© {new Date().getFullYear()} โค้ดดิ้งเมืองสามหมอก <span>•</span> Built with care in Mae Hong Son</footer>
    </main>
  );
}
