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

const STORAGE_KEY = 'live_html_editor_saved_code';
const DRIVE_STORAGE_KEY = 'drive_folder_id';

// Helper to extract clean Folder ID from URL or raw ID
function parseDriveFolderId(input) {
  if (!input) return '';
  input = input.trim();
  const folderMatch = input.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch) return folderMatch[1];
  const idMatch = input.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  const fileMatch = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  return input.replace(/[^a-zA-Z0-9_-]/g, '');
}

// Helper to extract clean File ID from URL or raw ID
function parseDriveFileId(input) {
  if (!input) return '';
  input = input.trim();
  const fileMatch = input.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  const idMatch = input.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch) return idMatch[1];
  return input.replace(/[^a-zA-Z0-9_-]/g, '');
}

let DRIVE_FOLDER_ID = localStorage.getItem(DRIVE_STORAGE_KEY) || '12dX1erF00MV79ySehpRlTi5rDb-PUSNo';

function getDriveFolderUrl(folderId = DRIVE_FOLDER_ID) {
  if (!folderId) return '';
  return `https://drive.google.com/drive/folders/${folderId}?usp=sharing`;
}
