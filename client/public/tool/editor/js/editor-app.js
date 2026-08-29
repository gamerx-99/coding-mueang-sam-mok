/**
 * Live HTML Editor - Main Application Logic
 * Supports Two-Way Bi-directional Live Editing, Visual Preview Toolbar,
 * Left-Click Inline Editing & Selection, Right-Click Custom Context Menu,
 * Viewport Switcher, and Element Component Insertion.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Core DOM Elements
  const editor = document.getElementById("html-code");
  const preview = document.getElementById("preview-frame");
  const previewContainer = document.getElementById("preview-frame-container");
  const currentTag = document.getElementById("current-tag");
  const badge = document.getElementById("highlight-badge");
  const lineInfo = document.getElementById("line-info");
  const lineNumbers = document.getElementById("line-numbers");
  const cursorPosInfo = document.getElementById("cursor-pos");
  const toastPopup = document.getElementById("toast-popup");

  // Top Nav Buttons
  const btnSaveHtml = document.getElementById("btn-save-html");
  const btnOpenFile = document.getElementById("btn-open-file");
  const filePicker = document.getElementById("file-picker");

  // Editor Pane Buttons
  const btnFormatCode = document.getElementById("btn-format-code");
  const btnCopyCode = document.getElementById("btn-copy-code");
  const btnResetCode = document.getElementById("btn-reset-code");

  // Preview Header Buttons & Controls
  const btnModePreview = document.getElementById("btn-mode-preview");
  const btnModeInspect = document.getElementById("btn-mode-inspect");
  const btnModeEdit = document.getElementById("btn-mode-edit");
  const btnVpDesktop = document.getElementById("btn-vp-desktop");
  const btnVpTablet = document.getElementById("btn-vp-tablet");
  const btnVpMobile = document.getElementById("btn-vp-mobile");
  const btnInsertModalTrigger = document.getElementById(
    "btn-insert-modal-trigger"
  );
  const btnRefreshPreview = document.getElementById("btn-refresh-preview");
  const btnOpenPreviewTab = document.getElementById("btn-open-preview-tab");

  // Visual Toolbar Elements
  const visualToolbar = document.getElementById("visual-toolbar");
  const selectedTagPill = document.getElementById("selected-tag-pill");
  const vbtnBold = document.getElementById("vbtn-bold");
  const vbtnItalic = document.getElementById("vbtn-italic");
  const vbtnUnderline = document.getElementById("vbtn-underline");
  const vbtnAlignLeft = document.getElementById("vbtn-align-left");
  const vbtnAlignCenter = document.getElementById("vbtn-align-center");
  const vbtnAlignRight = document.getElementById("vbtn-align-right");
  const vinputTextHex = document.getElementById("vinput-text-color");
  const vinputBgHex = document.getElementById("vinput-bg-color");
  const vbtnEditText = document.getElementById("vbtn-edit-text");
  const vbtnQuickStyle = document.getElementById("vbtn-quick-style");
  const vbtnDuplicate = document.getElementById("vbtn-duplicate");
  const vbtnMoveUp = document.getElementById("vbtn-move-up");
  const vbtnMoveDown = document.getElementById("vbtn-move-down");
  const vbtnDelete = document.getElementById("vbtn-delete");

  // Context Menu Elements
  const contextMenu = document.getElementById("preview-context-menu");
  const cmenuTargetName = document.getElementById("cmenu-target-name");
  const cmenuEditText = document.getElementById("cmenu-edit-text");
  const cmenuJumpCode = document.getElementById("cmenu-jump-code");
  const cmenuLineHint = document.getElementById("cmenu-line-hint");
  const cmenuStyle = document.getElementById("cmenu-style");
  const cmenuInsert = document.getElementById("cmenu-insert");
  const cmenuDuplicate = document.getElementById("cmenu-duplicate");
  const cmenuCopyHtml = document.getElementById("cmenu-copy-html");
  const cmenuMoveUp = document.getElementById("cmenu-move-up");
  const cmenuMoveDown = document.getElementById("cmenu-move-down");
  const cmenuDelete = document.getElementById("cmenu-delete");

  // Insert Modal Elements
  const modalInsertElement = document.getElementById("modal-insert-element");
  const btnCloseInsertModal = document.getElementById("btn-close-insert-modal");

  // Style Modal Elements
  const modalStyleAttributes = document.getElementById(
    "modal-style-attributes"
  );
  const btnCloseStyleModal = document.getElementById("btn-close-style-modal");
  const btnCancelStyleModal = document.getElementById("btn-cancel-style-modal");
  const btnApplyStyleModal = document.getElementById("btn-apply-style-modal");
  const styleInputClass = document.getElementById("style-input-class");
  const styleInputId = document.getElementById("style-input-id");
  const styleInputColor = document.getElementById("style-input-color");
  const styleTextColorHex = document.getElementById("style-text-color-hex");
  const styleInputBg = document.getElementById("style-input-bg");
  const styleTextBgHex = document.getElementById("style-text-bg-hex");
  const styleInputFontSize = document.getElementById("style-input-font-size");
  const styleSelectTextAlign = document.getElementById(
    "style-select-text-align"
  );
  const styleInputPadding = document.getElementById("style-input-padding");
  const styleInputMargin = document.getElementById("style-input-margin");
  const styleInputBorderRadius = document.getElementById(
    "style-input-border-radius"
  );
  const styleInputHref = document.getElementById("style-input-href");
  const groupAttrHref = document.getElementById("group-attr-href");

  // State Variables
  let currentMode = "visual-edit"; // 'preview' | 'inspect' | 'visual-edit'
  let currentSelectedElementData = null;
  let inspectedLineNumber = null;
  let cachedLineCount = 0;
  let isSyncingFromPreview = false;
  let toastTimer = null;
  let previewDebounceTimer = null;
  let storageDebounceTimer = null;

  // Toast Function
  function showToast(message, duration = 2500) {
    if (!toastPopup) return;
    clearTimeout(toastTimer);
    toastPopup.textContent = message;
    toastPopup.classList.add("show");
    toastTimer = setTimeout(() => {
      toastPopup.classList.remove("show");
    }, duration);
  }

  // Copy to Clipboard
  function copyToClipboard(text, successMsg = "📋 คัดลอกสำเร็จ!") {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => showToast(successMsg))
        .catch(() => fallbackCopy(text, successMsg));
    } else {
      fallbackCopy(text, successMsg);
    }
  }

  function fallbackCopy(text, successMsg) {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      showToast(successMsg);
    } catch (e) {
      showToast("⚠️ ไม่สามารถคัดลอกได้");
    }
    document.body.removeChild(ta);
  }

  // Save HTML to Local File
  function saveHTMLToFile() {
    const code = editor.value;
    const blob = new Blob([code], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `webpage-${new Date().toISOString().slice(0, 10)}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("💾 บันทึกไฟล์ HTML ลงเครื่องเรียบร้อย!");
  }

  // Open HTML File from Local
  if (btnOpenFile && filePicker) {
    btnOpenFile.addEventListener("click", () => filePicker.click());
    filePicker.addEventListener("change", e => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = event => {
        editor.value = event.target.result;
        updateLineNumbers();
        updatePreviewImmediate();
        debouncedSaveToLocalStorage();
        showToast(`📂 เปิดไฟล์ "${file.name}" สำเร็จ!`);
      };
      reader.readAsText(file);
      filePicker.value = "";
    });
  }

  if (btnSaveHtml) btnSaveHtml.addEventListener("click", saveHTMLToFile);

  if (btnCopyCode) {
    btnCopyCode.addEventListener("click", () => {
      copyToClipboard(editor.value, "📋 คัดลอกโค้ดทั้งหมดแล้ว!");
    });
  }

  // Send Command to Preview Iframe
  function sendPreviewCommand(cmd, value = null, payload = null) {
    if (preview && preview.contentWindow) {
      try {
        preview.contentWindow.postMessage(
          {
            type: "EXEC_COMMAND",
            cmd: cmd,
            value: value,
            payload: payload,
          },
          "*"
        );
      } catch (err) {
        console.error("Error posting command to preview:", err);
      }
    }
  }

  // Mode Switcher Logic
  function setEditorMode(newMode) {
    currentMode = newMode;

    [btnModePreview, btnModeInspect, btnModeEdit].forEach(btn => {
      if (btn) btn.classList.remove("active");
    });

    if (newMode === "preview") {
      if (btnModePreview) btnModePreview.classList.add("active");
      if (visualToolbar) visualToolbar.classList.add("hidden");
      showToast("👁️ โหมดทดสอบเว็บ (สามารถคลิกปุ่มและกรอกฟอร์มได้ตามปกติ)");
    } else if (newMode === "inspect") {
      if (btnModeInspect) btnModeInspect.classList.add("active");
      if (visualToolbar) visualToolbar.classList.add("hidden");
      showToast("🔍 โหมดตรวจสอบ (ชี้เพื่อหาแท็ก คลิกเพื่อหาบรรทัดโค้ด)");
    } else if (newMode === "visual-edit") {
      if (btnModeEdit) btnModeEdit.classList.add("active");
      if (visualToolbar) visualToolbar.classList.remove("hidden");
      showToast("✏️ โหมดแก้ไขสด (คลิกเพื่อเลือก ดับเบิลคลิกเพื่อพิมพ์ข้อความ)");
    }

    if (preview && preview.contentWindow) {
      try {
        preview.contentWindow.postMessage(
          { type: "SET_MODE", mode: currentMode },
          "*"
        );
      } catch (e) {}
    }

    hideContextMenu();
  }

  if (btnModePreview)
    btnModePreview.addEventListener("click", () => setEditorMode("preview"));
  if (btnModeInspect)
    btnModeInspect.addEventListener("click", () => setEditorMode("inspect"));
  if (btnModeEdit)
    btnModeEdit.addEventListener("click", () => setEditorMode("visual-edit"));

  // Viewport Switcher Logic
  function setViewportMode(vpMode) {
    if (!previewContainer) return;
    [btnVpDesktop, btnVpTablet, btnVpMobile].forEach(btn => {
      if (btn) btn.classList.remove("active");
    });

    previewContainer.classList.remove("viewport-tablet", "viewport-mobile");

    if (vpMode === "768px") {
      if (btnVpTablet) btnVpTablet.classList.add("active");
      previewContainer.classList.add("viewport-tablet");
      showToast("💻 สลับมุมมองแท็บเล็ต (768px)");
    } else if (vpMode === "375px") {
      if (btnVpMobile) btnVpMobile.classList.add("active");
      previewContainer.classList.add("viewport-mobile");
      showToast("📱 สลับมุมมองมือถือ (375px)");
    } else {
      if (btnVpDesktop) btnVpDesktop.classList.add("active");
      showToast("🖥️ สลับมุมมองเดสก์ท็อป (100%)");
    }
  }

  if (btnVpDesktop)
    btnVpDesktop.addEventListener("click", () => setViewportMode("100%"));
  if (btnVpTablet)
    btnVpTablet.addEventListener("click", () => setViewportMode("768px"));
  if (btnVpMobile)
    btnVpMobile.addEventListener("click", () => setViewportMode("375px"));

  if (btnRefreshPreview) {
    btnRefreshPreview.addEventListener("click", () => {
      updatePreviewImmediate();
      showToast("🔄 รีเฟรชหน้าพรีวิวเรียบร้อย");
    });
  }

  // Visual Toolbar Actions
  if (vbtnBold)
    vbtnBold.addEventListener("click", () =>
      sendPreviewCommand("format_text", "bold")
    );
  if (vbtnItalic)
    vbtnItalic.addEventListener("click", () =>
      sendPreviewCommand("format_text", "italic")
    );
  if (vbtnUnderline)
    vbtnUnderline.addEventListener("click", () =>
      sendPreviewCommand("format_text", "underline")
    );
  if (vbtnAlignLeft)
    vbtnAlignLeft.addEventListener("click", () =>
      sendPreviewCommand("format_text", "justifyLeft")
    );
  if (vbtnAlignCenter)
    vbtnAlignCenter.addEventListener("click", () =>
      sendPreviewCommand("format_text", "justifyCenter")
    );
  if (vbtnAlignRight)
    vbtnAlignRight.addEventListener("click", () =>
      sendPreviewCommand("format_text", "justifyRight")
    );

  if (vinputTextHex) {
    vinputTextHex.addEventListener("input", e => {
      sendPreviewCommand("apply_style", null, { color: e.target.value });
    });
  }

  if (vinputBgHex) {
    vinputBgHex.addEventListener("input", e => {
      sendPreviewCommand("apply_style", null, {
        backgroundColor: e.target.value,
      });
    });
  }

  if (vbtnEditText) {
    vbtnEditText.addEventListener("click", () => {
      sendPreviewCommand("edit_text");
      showToast(
        "✏️ กำลังแก้ไขข้อความ (พิมพ์บนหน้าเว็บได้ทันที กด Esc เมื่อเสร็จ)"
      );
    });
  }

  if (vbtnQuickStyle) {
    vbtnQuickStyle.addEventListener("click", openStyleModal);
  }

  if (vbtnDuplicate) {
    vbtnDuplicate.addEventListener("click", () => {
      sendPreviewCommand("duplicate_element");
      showToast("📋 คัดลอก Element เรียบร้อย");
    });
  }

  if (vbtnMoveUp) {
    vbtnMoveUp.addEventListener("click", () => {
      sendPreviewCommand("move_element_up");
      showToast("⬆️ ย้าย Element ขึ้น");
    });
  }

  if (vbtnMoveDown) {
    vbtnMoveDown.addEventListener("click", () => {
      sendPreviewCommand("move_element_down");
      showToast("⬇️ ย้าย Element ลง");
    });
  }

  if (vbtnDelete) {
    vbtnDelete.addEventListener("click", () => {
      sendPreviewCommand("delete_element");
      showToast("🗑️ ลบ Element เรียบร้อย");
    });
  }

  // Right-Click Context Menu Logic
  function showContextMenu(x, y, data) {
    if (!contextMenu) return;
    currentSelectedElementData = data;

    const tagDisplay = `<${data.tag}${data.selector.replace(data.tag, "")}>`;
    if (cmenuTargetName) cmenuTargetName.textContent = tagDisplay;
    if (cmenuLineHint)
      cmenuLineHint.textContent = data.line ? `Ln ${data.line}` : "";

    if (cmenuEditText) {
      cmenuEditText.style.display = data.isEditable ? "flex" : "none";
    }

    // Measure and position inside parent window bounds
    contextMenu.style.display = "block";
    const menuWidth = contextMenu.offsetWidth || 210;
    const menuHeight = contextMenu.offsetHeight || 320;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let posX = x;
    let posY = y;

    if (posX + menuWidth > windowWidth - 10) {
      posX = windowWidth - menuWidth - 10;
    }
    if (posY + menuHeight > windowHeight - 10) {
      posY = windowHeight - menuHeight - 10;
    }

    contextMenu.style.left = `${Math.max(10, posX)}px`;
    contextMenu.style.top = `${Math.max(10, posY)}px`;
    contextMenu.classList.add("show");
  }

  function hideContextMenu() {
    if (contextMenu) {
      contextMenu.classList.remove("show");
      contextMenu.style.display = "none";
    }
  }

  document.addEventListener("click", e => {
    if (!e.target.closest("#preview-context-menu")) {
      hideContextMenu();
    }
  });

  // Context Menu Actions
  if (cmenuEditText) {
    cmenuEditText.addEventListener("click", () => {
      hideContextMenu();
      sendPreviewCommand("edit_text");
      showToast("✏️ เข้าสู่โหมดพิมพ์ข้อความ (ดับเบิลคลิกบนหน้าเว็บเพื่อพิมพ์)");
    });
  }

  if (cmenuJumpCode) {
    cmenuJumpCode.addEventListener("click", () => {
      hideContextMenu();
      if (currentSelectedElementData && currentSelectedElementData.line) {
        goToLine(currentSelectedElementData.line);
        showToast(`🎯 ไปยังบรรทัดที่ ${currentSelectedElementData.line}`);
      }
    });
  }

  if (cmenuStyle) {
    cmenuStyle.addEventListener("click", () => {
      hideContextMenu();
      openStyleModal();
    });
  }

  if (cmenuInsert) {
    cmenuInsert.addEventListener("click", () => {
      hideContextMenu();
      openInsertModal();
    });
  }

  if (cmenuDuplicate) {
    cmenuDuplicate.addEventListener("click", () => {
      hideContextMenu();
      sendPreviewCommand("duplicate_element");
      showToast("📋 คัดลอก Element เรียบร้อย");
    });
  }

  if (cmenuCopyHtml) {
    cmenuCopyHtml.addEventListener("click", () => {
      hideContextMenu();
      if (currentSelectedElementData && currentSelectedElementData.selector) {
        copyToClipboard(
          currentSelectedElementData.selector,
          "📋 คัดลอก Selector แล้ว!"
        );
      }
    });
  }

  if (cmenuMoveUp) {
    cmenuMoveUp.addEventListener("click", () => {
      hideContextMenu();
      sendPreviewCommand("move_element_up");
    });
  }

  if (cmenuMoveDown) {
    cmenuMoveDown.addEventListener("click", () => {
      hideContextMenu();
      sendPreviewCommand("move_element_down");
    });
  }

  if (cmenuDelete) {
    cmenuDelete.addEventListener("click", () => {
      hideContextMenu();
      sendPreviewCommand("delete_element");
      showToast("🗑️ ลบ Element แล้ว");
    });
  }

  // Insert Element Modal Logic
  const elementSnippets = {
    h1: '<h1 style="font-size: 2rem; font-weight: 700; color: #0f172a; margin-bottom: 12px;">หัวข้อใหญ่ (Heading 1)</h1>',
    h2: '<h2 style="font-size: 1.5rem; font-weight: 600; color: #1e293b; margin-bottom: 10px;">หัวข้อรอง (Heading 2)</h2>',
    h3: '<h3 style="font-size: 1.25rem; font-weight: 600; color: #334155; margin-bottom: 8px;">หัวข้อย่อย (Heading 3)</h3>',
    p: '<p style="font-size: 1rem; color: #64748b; line-height: 1.6; margin-bottom: 16px;">นี่คือย่อหน้าข้อความใหม่ สามารถดับเบิลคลิกเพื่อพิมพ์แก้ไขข้อความได้โดยตรง</p>',
    "button-primary":
      '<button style="background: #2563eb; color: #ffffff; padding: 10px 22px; border-radius: 8px; border: none; font-size: 0.95rem; font-weight: 500; cursor: pointer; transition: 0.2s; box-shadow: 0 2px 6px rgba(37,99,235,0.3);">ปุ่มกดหลัก</button>',
    "button-secondary":
      '<button style="background: #f1f5f9; color: #334155; padding: 10px 22px; border-radius: 8px; border: 1px solid #cbd5e1; font-size: 0.95rem; font-weight: 500; cursor: pointer;">ปุ่มรอง</button>',
    badge:
      '<span style="display: inline-block; background: #dbeafe; color: #1d4ed8; padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600;">NEW BADGE</span>',
    link: '<a href="#" style="color: #2563eb; font-weight: 500; text-decoration: underline;">คลิกที่นี่ (Link Text)</a>',
    card: '<div style="background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; margin: 16px 0;"><h3 style="margin-top:0; color:#0f172a;">กล่องการ์ดใหม่</h3><p style="color:#64748b; font-size:0.9rem; line-height:1.5;">ข้อความและเนื้อหาภายในการ์ด สามารถจัดสไตล์และปรับขนาดได้ตามต้องการ</p></div>',
    "grid-2":
      '<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 16px 0;"><div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;"><p style="margin:0; color:#334155; font-weight:500;">คอลัมน์ที่ 1</p></div><div style="background: #f8fafc; padding: 16px; border-radius: 8px; border: 1px solid #e2e8f0;"><p style="margin:0; color:#334155; font-weight:500;">คอลัมน์ที่ 2</p></div></div>',
    "alert-box":
      '<div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px 18px; border-radius: 6px; margin: 16px 0; color: #1e40af;"><p style="margin:0; font-size:0.92rem; font-weight:500;">💡 ข้อความแจ้งเตือนหรือคำแนะนำสำคัญ</p></div>',
    image:
      '<img src="https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80" alt="Sample Image" style="max-width: 100%; border-radius: 10px; display: block; margin: 16px auto; box-shadow: 0 4px 12px rgba(0,0,0,0.08);">',
    list: '<ul style="padding-left: 20px; color: #475569; line-height: 1.8; margin: 12px 0;"><li>หัวข้อย่อยที่ 1</li><li>หัวข้อย่อยที่ 2</li><li>หัวข้อย่อยที่ 3</li></ul>',
    divider:
      '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">',
  };

  function openInsertModal() {
    if (!modalInsertElement) return;
    modalInsertElement.classList.add("show");
  }

  function closeInsertModal() {
    if (!modalInsertElement) return;
    modalInsertElement.classList.remove("show");
  }

  if (btnInsertModalTrigger)
    btnInsertModalTrigger.addEventListener("click", openInsertModal);
  if (btnCloseInsertModal)
    btnCloseInsertModal.addEventListener("click", closeInsertModal);

  document.querySelectorAll(".template-item").forEach(item => {
    item.addEventListener("click", () => {
      const type = item.getAttribute("data-type");
      const snippet = elementSnippets[type];
      if (!snippet) return;

      const posRadio = document.querySelector(
        'input[name="insert-position"]:checked'
      );
      const position = posRadio ? posRadio.value : "after";

      sendPreviewCommand("insert_element", null, {
        html: snippet,
        position: position,
      });
      closeInsertModal();
      showToast(
        `➕ แทรก "${item.querySelector(".template-name").textContent}" เรียบร้อย!`
      );
    });
  });

  // Style & Attributes Modal Logic
  function rgbToHex(rgb) {
    if (!rgb || rgb === "transparent" || rgb === "rgba(0, 0, 0, 0)") return "";
    const rgbMatch = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (!rgbMatch) return rgb;
    const hex = x => ("0" + parseInt(x, 10).toString(16)).slice(-2);
    return "#" + hex(rgbMatch[1]) + hex(rgbMatch[2]) + hex(rgbMatch[3]);
  }

  function openStyleModal() {
    if (!modalStyleAttributes) return;
    const comp = currentSelectedElementData
      ? currentSelectedElementData.computed || {}
      : {};

    if (styleInputClass) styleInputClass.value = comp.className || "";
    if (styleInputId) styleInputId.value = comp.id || "";

    const hexColor = rgbToHex(comp.color) || "#000000";
    if (styleInputColor) styleInputColor.value = hexColor;
    if (styleTextColorHex) styleTextColorHex.value = hexColor;

    const hexBg = rgbToHex(comp.backgroundColor) || "#ffffff";
    if (styleInputBg) styleInputBg.value = hexBg;
    if (styleTextBgHex) styleTextBgHex.value = hexBg;

    if (styleInputFontSize) styleInputFontSize.value = comp.fontSize || "";
    if (styleSelectTextAlign) styleSelectTextAlign.value = comp.textAlign || "";
    if (styleInputPadding) styleInputPadding.value = comp.padding || "";
    if (styleInputMargin) styleInputMargin.value = comp.margin || "";
    if (styleInputBorderRadius)
      styleInputBorderRadius.value = comp.borderRadius || "";

    if (groupAttrHref) {
      if (
        currentSelectedElementData &&
        currentSelectedElementData.tag === "a"
      ) {
        groupAttrHref.style.display = "flex";
        if (styleInputHref) styleInputHref.value = comp.href || "";
      } else {
        groupAttrHref.style.display = "none";
      }
    }

    modalStyleAttributes.classList.add("show");
  }

  function closeStyleModal() {
    if (!modalStyleAttributes) return;
    modalStyleAttributes.classList.remove("show");
  }

  if (btnCloseStyleModal)
    btnCloseStyleModal.addEventListener("click", closeStyleModal);
  if (btnCancelStyleModal)
    btnCancelStyleModal.addEventListener("click", closeStyleModal);

  if (styleInputColor && styleTextColorHex) {
    styleInputColor.addEventListener("input", e => {
      styleTextColorHex.value = e.target.value;
    });
    styleTextColorHex.addEventListener("input", e => {
      if (e.target.value.startsWith("#") && e.target.value.length === 7)
        styleInputColor.value = e.target.value;
    });
  }

  if (styleInputBg && styleTextBgHex) {
    styleInputBg.addEventListener("input", e => {
      styleTextBgHex.value = e.target.value;
    });
    styleTextBgHex.addEventListener("input", e => {
      if (e.target.value.startsWith("#") && e.target.value.length === 7)
        styleInputBg.value = e.target.value;
    });
  }

  if (btnApplyStyleModal) {
    btnApplyStyleModal.addEventListener("click", () => {
      const stylesToApply = {};
      if (styleTextColorHex && styleTextColorHex.value)
        stylesToApply.color = styleTextColorHex.value;
      if (styleTextBgHex && styleTextBgHex.value)
        stylesToApply.backgroundColor = styleTextBgHex.value;
      if (styleInputFontSize && styleInputFontSize.value)
        stylesToApply.fontSize = styleInputFontSize.value;
      if (styleSelectTextAlign && styleSelectTextAlign.value)
        stylesToApply.textAlign = styleSelectTextAlign.value;
      if (styleInputPadding && styleInputPadding.value)
        stylesToApply.padding = styleInputPadding.value;
      if (styleInputMargin && styleInputMargin.value)
        stylesToApply.margin = styleInputMargin.value;
      if (styleInputBorderRadius && styleInputBorderRadius.value)
        stylesToApply.borderRadius = styleInputBorderRadius.value;

      sendPreviewCommand("apply_style", null, stylesToApply);

      const attrsToApply = {
        className: styleInputClass ? styleInputClass.value.trim() : "",
        id: styleInputId ? styleInputId.value.trim() : "",
      };
      if (styleInputHref && styleInputHref.value)
        attrsToApply.href = styleInputHref.value.trim();

      sendPreviewCommand("set_attributes", null, attrsToApply);

      closeStyleModal();
      showToast("🎨 ปรับแต่งสไตล์และคุณสมบัติเรียบร้อยแล้ว!");
    });
  }

  // Line Numbers & Navigation
  function updateLineNumbers() {
    const lineCount = Math.max(1, editor.value.split("\n").length);

    if (lineCount !== cachedLineCount) {
      cachedLineCount = lineCount;
      let html = "";
      for (let i = 1; i <= lineCount; i++) {
        html += `<span class="line-num" data-line="${i}">${i}</span>`;
      }
      lineNumbers.innerHTML = html;

      const digits = lineCount.toString().length;
      const width = Math.max(48, digits * 10 + 20);
      lineNumbers.style.width = width + "px";
      lineNumbers.style.minWidth = width + "px";
    }

    updateActiveLineHighlight();
  }

  function getCurrentCursorLineAndCol() {
    const pos = editor.selectionStart || 0;
    const textBefore = editor.value.substring(0, pos);
    const lines = textBefore.split("\n");
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    return { line, col };
  }

  function updateActiveLineHighlight() {
    const { line, col } = getCurrentCursorLineAndCol();
    if (cursorPosInfo) {
      cursorPosInfo.textContent = `Ln ${line}, Col ${col}`;
    }

    const elements = lineNumbers.children;
    for (let i = 0; i < elements.length; i++) {
      const lineNum = i + 1;
      elements[i].classList.remove("active-line", "inspected-line");
      if (inspectedLineNumber && lineNum === inspectedLineNumber) {
        elements[i].classList.add("inspected-line");
      } else if (lineNum === line) {
        elements[i].classList.add("active-line");
      }
    }
  }

  function goToLine(lineNumber) {
    if (!lineNumber || lineNumber < 1) return;
    const lines = editor.value.split("\n");
    if (lineNumber > lines.length) return;

    let charIndex = 0;
    for (let i = 0; i < lineNumber - 1; i++) {
      charIndex += lines[i].length + 1;
    }
    const lineLength = (lines[lineNumber - 1] || "").length;

    editor.focus();
    editor.setSelectionRange(charIndex, charIndex + lineLength);

    const lineHeight = 24;
    const targetScrollTop = Math.max(0, (lineNumber - 5) * lineHeight);
    try {
      editor.scrollTo({ top: targetScrollTop, behavior: "smooth" });
    } catch (e) {
      editor.scrollTop = targetScrollTop;
    }
    lineNumbers.scrollTop = targetScrollTop;

    inspectedLineNumber = lineNumber;
    updateActiveLineHighlight();
  }

  editor.addEventListener("scroll", () => {
    lineNumbers.scrollTop = editor.scrollTop;
  });

  lineNumbers.addEventListener("click", e => {
    const target = e.target.closest(".line-num");
    if (!target) return;
    const targetLine = parseInt(target.dataset.line, 10);
    goToLine(targetLine);
  });

  // Preview Update Logic
  function debouncedUpdatePreview() {
    if (isSyncingFromPreview) return;
    clearTimeout(previewDebounceTimer);
    previewDebounceTimer = setTimeout(() => {
      updatePreviewImmediate();
    }, 250);
  }

  function updatePreviewImmediate() {
    const code = editor.value;
    const annotatedCode = annotateHTMLWithLines(code);
    const scriptToInject = getInspectorScript(currentMode);

    const injectedCode = annotatedCode.includes("</body>")
      ? annotatedCode.replace("</body>", scriptToInject + "</body>")
      : annotatedCode + scriptToInject;

    preview.srcdoc = injectedCode;
  }

  // Cross-Window / Iframe Message Handling
  window.addEventListener("message", event => {
    if (!event.data) return;

    if (
      preview &&
      preview.contentWindow &&
      event.source !== preview.contentWindow
    ) {
      return;
    }

    const { type } = event.data;

    // Bi-directional sync from Preview to Editor
    if (type === "PREVIEW_MUTATED") {
      const { html } = event.data;
      if (html && html !== editor.value) {
        isSyncingFromPreview = true;
        const currentPos = editor.selectionStart;
        editor.value = html;
        if (currentPos !== undefined) {
          editor.setSelectionRange(currentPos, currentPos);
        }
        updateLineNumbers();
        debouncedSaveToLocalStorage();
        setTimeout(() => {
          isSyncingFromPreview = false;
        }, 300);
      }
    } else if (type === "ELEMENT_HOVER") {
      const { selector, line } = event.data;
      if (line) {
        currentTag.textContent = `${selector} (บรรทัด ${line})`;
        lineInfo.textContent = `พบบรรทัดที่: ${line}`;
        if (currentMode === "inspect") {
          setBadgeContent(
            badge,
            "📍",
            selector,
            `(บรรทัด ${line})`,
            "[คลิกเพื่อไปยังโค้ด]"
          );
          badge.style.display = "block";
        }
        inspectedLineNumber = line;
        updateActiveLineHighlight();
      } else {
        currentTag.textContent = selector || "-";
        if (currentMode === "inspect") {
          setBadgeContent(badge, "📍", selector || "element");
          badge.style.display = "block";
        }
      }
    } else if (type === "ELEMENT_LEAVE") {
      currentTag.textContent = "-";
      badge.style.display = "none";
      lineInfo.textContent = "";
      inspectedLineNumber = null;
      updateActiveLineHighlight();
    } else if (type === "ELEMENT_CLICK") {
      const { selector, line } = event.data;
      if (line) {
        goToLine(line);
        lineInfo.textContent = `พบบรรทัดที่: ${line}`;
        setBadgeContent(badge, "🎯", selector, `(บรรทัด ${line})`);
        badge.style.display = "block";
      }
    } else if (type === "ELEMENT_SELECTED") {
      currentSelectedElementData = event.data;
      const { selector, line, computed, skipLineJump } = event.data;

      if (selectedTagPill) {
        selectedTagPill.textContent = `${selector || "Element"}${line ? " (Ln " + line + ")" : ""}`;
        selectedTagPill.classList.add("active");
      }

      if (line && !skipLineJump) {
        goToLine(line);
      }

      // Sync color pickers on toolbar
      if (computed) {
        if (vinputTextHex && computed.color) {
          vinputTextHex.value = rgbToHex(computed.color) || "#000000";
        }
        if (vinputBgHex && computed.backgroundColor) {
          vinputBgHex.value = rgbToHex(computed.backgroundColor) || "#ffffff";
        }
      }
    } else if (type === "OPEN_CONTEXT_MENU") {
      const iframeRect = preview.getBoundingClientRect();
      const clientX = iframeRect.left + event.data.clientX;
      const clientY = iframeRect.top + event.data.clientY;
      showContextMenu(clientX, clientY, event.data);
    }
  });

  // Code Formatting Trigger
  if (btnFormatCode) {
    btnFormatCode.addEventListener("click", () => {
      try {
        editor.value = formatHTML(editor.value);
        updateLineNumbers();
        updatePreviewImmediate();
        debouncedSaveToLocalStorage();
        showToast("✨ จัดรูปแบบโค้ดเรียบร้อยแล้ว!");
      } catch (err) {
        showToast("⚠️ ไม่สามารถจัดรูปแบบโค้ดได้");
      }
    });
  }

  // Reset Code
  if (btnResetCode) {
    btnResetCode.addEventListener("click", () => {
      if (
        confirm(
          "คุณต้องการรีเซ็ตโค้ดกลับเป็นค่าเริ่มต้นใช่หรือไม่? (โค้ดปัจจุบันจะถูกแทนที่)"
        )
      ) {
        editor.value = defaultHTML;
        updateLineNumbers();
        updatePreviewImmediate();
        debouncedSaveToLocalStorage();
        showToast("↺ คืนค่าโค้ดตัวอย่างเรียบร้อยแล้ว");
      }
    });
  }

  // Open Preview in Full New Tab
  if (btnOpenPreviewTab) {
    btnOpenPreviewTab.addEventListener("click", () => {
      const blob = new Blob([editor.value], {
        type: "text/html;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 5000);
      showToast("↗ เปิดหน้าพรีวิวในแท็บใหม่");
    });
  }

  // LocalStorage Persistence
  function debouncedSaveToLocalStorage() {
    clearTimeout(storageDebounceTimer);
    storageDebounceTimer = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, editor.value);
      } catch (e) {}
    }, 600);
  }

  function loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && saved.trim().length > 0) {
        return saved;
      }
    } catch (e) {}
    return defaultHTML;
  }

  // Split Resizer
  const resizer = document.getElementById("drag-resizer");
  const editorPane = document.getElementById("editor-pane");
  const previewPane = document.getElementById("preview-pane");
  const mainContainer = document.querySelector(".container");

  if (resizer && editorPane && previewPane && mainContainer) {
    let isResizing = false;

    resizer.addEventListener("mousedown", () => {
      isResizing = true;
      resizer.classList.add("resizing");
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
      previewPane.style.pointerEvents = "none";
    });

    document.addEventListener("mousemove", e => {
      if (!isResizing) return;
      const containerRect = mainContainer.getBoundingClientRect();
      const availableWidth = containerRect.width - 6;
      const mouseX = e.clientX - containerRect.left;
      const percentage = Math.max(
        15,
        Math.min(85, (mouseX / availableWidth) * 100)
      );

      editorPane.style.flex = `${percentage} 1 0%`;
      previewPane.style.flex = `${100 - percentage} 1 0%`;
    });

    document.addEventListener("mouseup", () => {
      if (isResizing) {
        isResizing = false;
        resizer.classList.remove("resizing");
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        previewPane.style.pointerEvents = "";
      }
    });
  }

  // Find Bar (Ctrl + F)
  const findBar = document.getElementById("find-bar");
  const findInput = document.getElementById("find-input");
  const findCount = document.getElementById("find-count");
  const btnFindPrev = document.getElementById("btn-find-prev");
  const btnFindNext = document.getElementById("btn-find-next");
  const btnFindClose = document.getElementById("btn-find-close");

  let findMatches = [];
  let currentMatchIndex = -1;

  function openFindBar() {
    if (!findBar) return;
    findBar.classList.add("show");
    findInput.focus();
    findInput.select();
    executeFind();
  }

  function closeFindBar() {
    if (!findBar) return;
    findBar.classList.remove("show");
    editor.focus();
  }

  function executeFind() {
    const query = findInput.value;
    findMatches = [];
    currentMatchIndex = -1;

    if (!query) {
      findCount.textContent = "0/0";
      return;
    }

    const text = editor.value;
    let index = 0;
    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    while ((index = textLower.indexOf(queryLower, index)) !== -1) {
      findMatches.push(index);
      index += query.length;
    }

    if (findMatches.length > 0) {
      currentMatchIndex = 0;
      jumpToMatch(currentMatchIndex);
    } else {
      findCount.textContent = "0/0";
    }
  }

  function jumpToMatch(matchIdx) {
    if (matchIdx < 0 || matchIdx >= findMatches.length) return;
    const startPos = findMatches[matchIdx];
    const queryLen = findInput.value.length;

    editor.focus();
    editor.setSelectionRange(startPos, startPos + queryLen);

    const linesBefore = editor.value.substring(0, startPos).split("\n");
    const lineNum = linesBefore.length;
    const lineHeight = 24;
    const targetScrollTop = Math.max(0, (lineNum - 5) * lineHeight);
    editor.scrollTo({ top: targetScrollTop, behavior: "smooth" });
    lineNumbers.scrollTop = targetScrollTop;

    findCount.textContent = `${matchIdx + 1}/${findMatches.length}`;
  }

  if (findInput) {
    findInput.addEventListener("input", executeFind);
    findInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        if (e.shiftKey) {
          if (findMatches.length > 0) {
            currentMatchIndex =
              (currentMatchIndex - 1 + findMatches.length) % findMatches.length;
            jumpToMatch(currentMatchIndex);
          }
        } else {
          if (findMatches.length > 0) {
            currentMatchIndex = (currentMatchIndex + 1) % findMatches.length;
            jumpToMatch(currentMatchIndex);
          }
        }
      } else if (e.key === "Escape") {
        closeFindBar();
      }
    });
  }

  if (btnFindNext) {
    btnFindNext.addEventListener("click", () => {
      if (findMatches.length > 0) {
        currentMatchIndex = (currentMatchIndex + 1) % findMatches.length;
        jumpToMatch(currentMatchIndex);
      }
    });
  }

  if (btnFindPrev) {
    btnFindPrev.addEventListener("click", () => {
      if (findMatches.length > 0) {
        currentMatchIndex =
          (currentMatchIndex - 1 + findMatches.length) % findMatches.length;
        jumpToMatch(currentMatchIndex);
      }
    });
  }

  if (btnFindClose) {
    btnFindClose.addEventListener("click", closeFindBar);
  }

  // Keyboard Shortcuts
  window.addEventListener("keydown", e => {
    if ((e.ctrlKey || e.metaKey) && (e.key === "s" || e.key === "S")) {
      e.preventDefault();
      saveHTMLToFile();
    }
    if ((e.ctrlKey || e.metaKey) && (e.key === "f" || e.key === "F")) {
      e.preventDefault();
      openFindBar();
    }
    if (e.altKey && e.shiftKey && (e.key === "f" || e.key === "F")) {
      e.preventDefault();
      if (btnFormatCode) btnFormatCode.click();
    }
    if (e.key === "Escape") {
      hideContextMenu();
      closeInsertModal();
      closeStyleModal();
    }
  });

  // Tab key indentation inside editor
  editor.addEventListener("keydown", function (e) {
    if (e.key === "Tab") {
      e.preventDefault();
      const start = this.selectionStart;
      const end = this.selectionEnd;
      this.value =
        this.value.substring(0, start) + "  " + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + 2;
      updateLineNumbers();
      debouncedUpdatePreview();
      debouncedSaveToLocalStorage();
    }
  });

  editor.addEventListener("input", () => {
    updateLineNumbers();
    debouncedUpdatePreview();
    debouncedSaveToLocalStorage();
  });

  editor.addEventListener("click", updateActiveLineHighlight);
  editor.addEventListener("keyup", updateActiveLineHighlight);
  editor.addEventListener("select", updateActiveLineHighlight);

  // App Initialization
  editor.value = loadFromLocalStorage();
  updateLineNumbers();
  updatePreviewImmediate();
  setEditorMode("visual-edit");
});
