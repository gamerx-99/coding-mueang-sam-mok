/**
 * Live HTML Editor - Configuration & Constants
 */

const defaultHTML = `<!DOCTYPE html>
<html>
<head>
  <style>
    body {
      font-family: system-ui, sans-serif;
      padding: 40px 20px;
      background: #f8fafc;
      text-align: center;
    }
    .card {
      background: white;
      max-width: 420px;
      margin: 0 auto;
      padding: 30px;
      border-radius: 16px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.08);
    }
    .badge {
      display: inline-block;
      background: #dbeafe;
      color: #1d4ed8;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 600;
      margin-bottom: 12px;
    }
    h2 { color: #0f172a; margin-bottom: 8px; }
    p { color: #64748b; font-size: 14px; line-height: 1.5; }
    .btn {
      background: #2563eb;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 8px;
      font-weight: 500;
      margin-top: 18px;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">UI Components</span>
    <h2>Hover Inspector</h2>
    <p>เลื่อนเมาส์มาชี้ที่กล่อง ข้อความ หรือปุ่มด้านล่าง เพื่อตรวจจับโค้ดต้นทางได้ทันที</p>
    <button class="btn">คลิกทดสอบ</button>
  </div>
</body>
</html>`;

const STORAGE_KEY = "live_html_editor_saved_code";
