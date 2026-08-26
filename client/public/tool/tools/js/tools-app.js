/**
 * Document & PDF Tools Suite - Main Application Logic (Bilingual TH / EN)
 */

const TRANSLATIONS = {
  th: {
    page_title: "PDF & Document Tools Suite - รวมเครื่องมือจัดการเอกสารครบวงจร",
    search_placeholder:
      "ค้นหาเครื่องมือ เช่น Merge, Convert, OCR, AI, Live Editor...",
    btn_theme_title: "สลับโหมดมืด/สว่าง",
    header_cropper: "✂️ Image Cropper",
    header_live_editor: "🔍 Live Editor",
    header_workflow: "⚡ เวิร์กโฟลว์",
    hero_title: "ทุกเครื่องมือสำหรับจัดการไฟล์ PDF & เอกสาร",
    hero_subtitle:
      "แปลงไฟล์, รวมไฟล์, แยกหน้า, บีบอัด, เซ็นชื่อ, แก้ไข และฟีเจอร์ AI ครบครันในที่เดียว",
    tab_all: "ทั้งหมด",
    tab_convert_to: "แปลงเป็น PDF",
    tab_convert_from: "แปลงจาก PDF",
    tab_organize: "จัดหน้า & แก้ไข",
    tab_security: "ความปลอดภัย",
    tab_ai: "AI & ขั้นสูง",
    badge_new: "ใหม่!",
    workflow_title: "สร้างเวิร์กโฟลว์อัตโนมัติ",
    workflow_desc:
      "สร้างขั้นตอนการทำงานแบบกำหนดเองด้วยเครื่องมือโปรดของคุณ เพื่อประหยัดเวลาและใช้งานซ้ำได้ทุกเมื่อ",
    workflow_link: "สร้างเวิร์กโฟลว์ ↗",
    editor_title: "Live HTML Editor + Inspector",
    editor_desc:
      "แก้ไขและตรวจสอบโค้ด HTML สดแบบ Real-time พร้อมฟังก์ชันจัดเก็บไฟล์และดาวน์โหลด",
    editor_link: "เปิด Live Editor ↗",
    cropper_title: "Smart Image Cropper & Auto Sprite Extractor",
    cropper_desc:
      "ตัดภาพแยกตัวละครอัตโนมัติ (Auto-Cut On Drop), ตรวจจับพื้นหลังสีทึบ/Alpha, ปรับสเกลภาพ Pixel Art และส่งออก ZIP",
    cropper_link: "เปิด Image Cropper ↗",
    dropzone_title: "ลากหลายไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือก",
    dropzone_desc: "รองรับ PDF, Word, Excel และรูปภาพ (ไฟล์ละไม่เกิน 100 MB)",
    btn_start_process: "เริ่มประมวลผลทันที ⚡",
    btn_processing: "⏳ กำลังประมวลผล...",
    file_count: count => `เลือกแล้ว ${count} ไฟล์`,
    file_total_size: size => `รวม ${size}`,
    file_remove: "นำไฟล์ออก",
    file_clear: "ล้างทั้งหมด",
    toast_files_selected: count => `📁 เพิ่มไฟล์ ${count} ไฟล์เรียบร้อยแล้ว`,
    toast_file_size_error: count =>
      `⚠️ มี ${count} ไฟล์ที่เกินขนาด 100 MB และไม่ได้เพิ่ม`,
    toast_duplicate_files: count => `ไฟล์ซ้ำ ${count} ไฟล์ถูกข้ามแล้ว`,
    toast_max_files: "เพิ่มได้สูงสุด 20 ไฟล์ต่อครั้ง",
    toast_no_files: "กรุณาเลือกไฟล์อย่างน้อย 1 ไฟล์ก่อนเริ่มประมวลผล",
    toast_process_success: (title, count) =>
      `⚡ Demo Mode: ประมวลผล ${count} ไฟล์ของ ${title} สำเร็จ!`,
  },
  en: {
    page_title: "PDF & Document Tools Suite - All-in-One Document & PDF Tools",
    search_placeholder:
      "Search tools e.g. Merge, Convert, OCR, AI, Live Editor...",
    btn_theme_title: "Toggle dark/light mode",
    header_cropper: "✂️ Image Cropper",
    header_live_editor: "🔍 Live Editor",
    header_workflow: "⚡ Workflows",
    hero_title: "Every tool you need to work with PDFs and documents",
    hero_subtitle:
      "Convert, merge, split, compress, sign, edit, and use AI features all in one place.",
    tab_all: "All",
    tab_convert_to: "Convert to PDF",
    tab_convert_from: "Convert from PDF",
    tab_organize: "Organize & Edit",
    tab_security: "Security",
    tab_ai: "AI & Advanced",
    badge_new: "New!",
    workflow_title: "Create a workflow",
    workflow_desc:
      "Create custom workflows with your favorite tools, automate tasks, and reuse them anytime.",
    workflow_link: "Create workflow ↗",
    editor_title: "Live HTML Editor + Inspector",
    editor_desc:
      "Live edit & inspect HTML elements in real-time with file manager & export features.",
    editor_link: "Open Live Editor ↗",
    cropper_title: "Smart Image Cropper & Auto Sprite Extractor",
    cropper_desc:
      "Smart auto crop & sprite extraction on drop, alpha/solid background removal, pixel art scaling, and batch ZIP export.",
    cropper_link: "Open Image Cropper ↗",
    dropzone_title: "Drag & drop multiple files here, or click to select",
    dropzone_desc: "Supports PDF, Word, Excel, and images (max 100 MB per file)",
    btn_start_process: "Process Now ⚡",
    btn_processing: "⏳ Processing...",
    file_count: count => `${count} file${count === 1 ? "" : "s"} selected`,
    file_total_size: size => `Total ${size}`,
    file_remove: "Remove file",
    file_clear: "Clear all",
    toast_files_selected: count => `📁 Added ${count} file${count === 1 ? "" : "s"}`,
    toast_file_size_error: count =>
      `⚠️ ${count} file${count === 1 ? "" : "s"} over 100 MB were skipped`,
    toast_duplicate_files: count =>
      `${count} duplicate file${count === 1 ? "" : "s"} skipped`,
    toast_max_files: "You can add up to 20 files per batch",
    toast_no_files: "Choose at least one file before processing",
    toast_process_success: (title, count) =>
      `⚡ Demo Mode: Successfully processed ${count} file${count === 1 ? "" : "s"} for ${title}!`,
  },
};

const MASCOT_POSES = {
  "merge-pdf": "/media/mascot/mhs-pose-09.png",
  "split-pdf": "/media/mascot/mhs-pose-06.png",
  "compress-pdf": "/media/mascot/mhs-pose-02.png",
  "edit-pdf": "/media/mascot/mhs-pose-07.png",
  "sign-pdf": "/media/mascot/mhs-pose-12.png",
  "ocr-pdf": "/media/mascot/mhs-pose-06.png",
  "compare-pdf": "/media/mascot/mhs-pose-11.png",
  "pdf-forms": "/media/mascot/mhs-pose-13.png",
  "ai-summarizer": "/media/mascot/mhs-pose-06.png",
  "translate-pdf": "/media/mascot/mhs-pose-08.png",
};

document.addEventListener("DOMContentLoaded", () => {
  // 1. Language Manager
  let currentLang = localStorage.getItem("docutools_lang") || "th";
  if (currentLang !== "th" && currentLang !== "en") {
    currentLang = "th";
  }

  const langButtons = document.querySelectorAll(".lang-btn");
  const searchInput = document.getElementById("search-input");
  const toolsGrid = document.getElementById("tools-grid");
  const totalCountEl = document.getElementById("total-tools-count");

  // Currently active tool in modal (for instant re-translating if open)
  let currentActiveTool = null;

  function updateStaticTexts(lang) {
    const t = TRANSLATIONS[lang] || TRANSLATIONS.th;

    // Page Title
    document.title = t.page_title;
    document.documentElement.setAttribute("lang", lang);

    // Search placeholder
    if (searchInput) {
      searchInput.placeholder = t.search_placeholder;
    }

    // Dynamic data-i18n elements
    document.querySelectorAll("[data-i18n]").forEach(el => {
      const key = el.getAttribute("data-i18n");
      if (t[key]) {
        el.textContent = t[key];
      }
    });

    // Theme toggle tooltip
    const btnThemeToggle = document.getElementById("btn-theme-toggle");
      if (btnThemeToggle) {
      btnThemeToggle.title = t.btn_theme_title;
    }

    // Dropzone texts
    const dropzoneTitle = document.getElementById("dropzone-title");
    const dropzoneDesc = document.getElementById("dropzone-desc");
    const btnStart = document.getElementById("btn-start-process");
    if (dropzoneTitle) dropzoneTitle.textContent = t.dropzone_title;
    if (dropzoneDesc) dropzoneDesc.textContent = t.dropzone_desc;
    if (btnStart && !btnStart.disabled)
      btnStart.textContent = t.btn_start_process;

    // Active tool modal update
    if (currentActiveTool) {
      const title = currentActiveTool.title
        ? currentActiveTool.title[lang] ||
          currentActiveTool.title.en ||
          currentActiveTool.title
        : "";
      const desc = currentActiveTool.desc
        ? currentActiveTool.desc[lang] ||
          currentActiveTool.desc.en ||
          currentActiveTool.desc
        : "";
      const modalTitle = document.getElementById("modal-tool-title");
      const modalDesc = document.getElementById("modal-tool-desc");
      if (modalTitle) modalTitle.textContent = title;
      if (modalDesc) modalDesc.textContent = desc;
    }

    // Update active state in lang buttons
    langButtons.forEach(btn => {
      if (btn.dataset.lang === lang) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    renderFileQueue();
  }

  function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem("docutools_lang", lang);
    updateStaticTexts(lang);
    renderTools();
    applyCurrentSearchAndFilter();
  }

  // Setup language button click listeners
  langButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetLang = btn.dataset.lang;
      if (targetLang && targetLang !== currentLang) {
        setLanguage(targetLang);
      }
    });
  });

  // 2. Theme Toggle (Dark / Light)
  const btnThemeToggle = document.getElementById("btn-theme-toggle");
  let currentTheme = localStorage.getItem("docutools_theme") || "light";

  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    if (btnThemeToggle) {
      btnThemeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
    }
    localStorage.setItem("docutools_theme", theme);
  }
  applyTheme(currentTheme);

  if (btnThemeToggle) {
    btnThemeToggle.addEventListener("click", () => {
      currentTheme = currentTheme === "light" ? "dark" : "light";
      applyTheme(currentTheme);
    });
  }

  // 3. Render Tool Cards Dynamically from TOOLS_DATA
  function renderTools() {
    if (!toolsGrid) return;
    toolsGrid.innerHTML = "";

    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.th;
    const totalTools = TOOLS_DATA.length + 3; // +1 workflow, +1 live editor, +1 cropper
    if (totalCountEl) {
      totalCountEl.textContent = `(${totalTools})`;
    }

    // Render each tool in TOOLS_DATA
    TOOLS_DATA.forEach(tool => {
      const card = document.createElement("div");
      const mascotPose = MASCOT_POSES[tool.id];
      card.className = `tool-card${mascotPose ? " has-mascot" : ""}`;
      card.dataset.category = tool.category;

      const titleTh =
        typeof tool.title === "object" ? tool.title.th || "" : tool.title;
      const titleEn =
        typeof tool.title === "object" ? tool.title.en || "" : tool.title;
      const descTh =
        typeof tool.desc === "object" ? tool.desc.th || "" : tool.desc;
      const descEn =
        typeof tool.desc === "object" ? tool.desc.en || "" : tool.desc;

      const activeTitle = currentLang === "th" ? titleTh : titleEn;
      const activeDesc = currentLang === "th" ? descTh : descEn;

      // Comprehensive search index (TH + EN + Keywords)
      card.dataset.search =
        `${tool.name || ""} ${titleTh} ${titleEn} ${descTh} ${descEn}`.toLowerCase();
      card.dataset.tool = activeTitle;

      let badgeHTML = tool.isNew
        ? `<span class="badge-new">${t.badge_new}</span>`
        : "";

      const mascotHTML = mascotPose
        ? `<img class="tool-mascot" src="${mascotPose}" alt="" aria-hidden="true" />`
        : "";

      card.innerHTML = `
        ${badgeHTML}
        ${mascotHTML}
        <div class="tool-icon-wrapper">
          ${tool.iconSvg}
        </div>
        <h3 class="tool-title">${activeTitle}</h3>
        <p class="tool-desc">${activeDesc}</p>
      `;

      card.addEventListener("click", e => {
        if (e.target.closest(".workflow-link, .editor-link, .cropper-link"))
          return;
        if (tool.isDirectLink && tool.url) {
          window.open(tool.url, "_blank");
          return;
        }
        currentActiveTool = tool;
        openModal(activeTitle, activeDesc, tool.iconSvg);
      });

      toolsGrid.appendChild(card);
    });

    // Append 32. Workflow Card
    const workflowCard = document.createElement("div");
    workflowCard.className = "tool-card workflow-card";
    workflowCard.dataset.category = "all";
    workflowCard.dataset.search =
      "workflow automate custom เวิร์กโฟลว์ อัตโนมัติ auto flows create";
    workflowCard.dataset.tool = t.workflow_title;
    workflowCard.id = "workflow";
    workflowCard.innerHTML = `
      <img class="special-mascot special-mascot-rocket" src="/media/mascot/mhs-pose-15.png" alt="" aria-hidden="true" />
      <div>
        <h3 class="tool-title">${t.workflow_title}</h3>
        <p class="tool-desc">${t.workflow_desc}</p>
      </div>
      <a href="#workflow" class="workflow-link">${t.workflow_link}</a>
      <svg class="workflow-bg-art" viewBox="0 0 100 100" fill="none">
        <circle cx="25" cy="25" r="12" stroke="#EF4444" stroke-width="3" stroke-dasharray="4 4"/>
        <circle cx="75" cy="75" r="18" stroke="#EF4444" stroke-width="3"/>
        <path d="M35 35L60 60" stroke="#EF4444" stroke-width="2.5" stroke-linecap="round"/>
      </svg>
    `;
    toolsGrid.appendChild(workflowCard);

    // Append 33. Live HTML Editor Card (Beside Workflow)
    const editorCard = document.createElement("div");
    editorCard.className = "tool-card editor-card";
    editorCard.dataset.category = "all";
    editorCard.dataset.search =
      "live html editor inspector inspect code web ตัวแก้ไขโค้ด ตรวจสอบองค์ประกอบ";
    editorCard.dataset.tool = t.editor_title;
    editorCard.id = "live-editor";
    editorCard.innerHTML = `
      <img class="special-mascot special-mascot-code" src="/media/mascot/mhs-pose-07.png" alt="" aria-hidden="true" />
      <div>
        <h3 class="tool-title">${t.editor_title}</h3>
        <p class="tool-desc">${t.editor_desc}</p>
      </div>
      <a href="Live%20HTML%20Editor%20+%20Inspector.html" class="editor-link" target="_blank">${t.editor_link}</a>
      <svg class="editor-bg-art" viewBox="0 0 100 100" fill="none">
        <rect x="20" y="20" width="60" height="60" rx="14" stroke="#6366F1" stroke-width="3" stroke-dasharray="5 5"/>
        <path d="M35 45L45 50L35 55M55 58H65" stroke="#6366F1" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    toolsGrid.appendChild(editorCard);

    // Append 34. Image Cropper & Auto Sprite Extractor Card (Beside Live Editor)
    const cropperCard = document.createElement("div");
    cropperCard.className = "tool-card cropper-card";
    cropperCard.dataset.category = "all";
    cropperCard.dataset.search =
      "image cropper crop sprite extractor character cut ตัดภาพ ตัดรูปภาพ แยกตัวละคร สไปรท์ คัดลอกภาพ ตัดภาพอัตโนมัติ pixel art";
    cropperCard.dataset.tool = t.cropper_title;
    cropperCard.id = "image-cropper";
    cropperCard.innerHTML = `
      <img class="special-mascot special-mascot-crop" src="/media/mascot/mhs-pose-13.png" alt="" aria-hidden="true" />
      <div>
        <span class="badge-new" style="background:#ea580c; color:#fff; top:12px; right:12px;">${t.badge_new}</span>
        <h3 class="tool-title" style="margin-top:4px;">${t.cropper_title}</h3>
        <p class="tool-desc">${t.cropper_desc}</p>
      </div>
      <a href="image-cropper/index.html" class="cropper-link" target="_blank">${t.cropper_link}</a>
      <svg class="cropper-bg-art" viewBox="0 0 100 100" fill="none">
        <path d="M30 20V65H75M20 30H65V75" stroke="#EA580C" stroke-width="3.5" stroke-linecap="round"/>
        <circle cx="34" cy="34" r="5" stroke="#EA580C" stroke-width="3"/>
        <circle cx="60" cy="60" r="5" stroke="#EA580C" stroke-width="3"/>
      </svg>
    `;
    toolsGrid.appendChild(cropperCard);
  }

  // 4. Filtering and Search Logic
  let currentCategory = "all";

  function applyCurrentSearchAndFilter() {
    const query = (searchInput ? searchInput.value : "").toLowerCase().trim();
    const cards = document.querySelectorAll(".tool-card");

    cards.forEach(card => {
      const isSpecialCard =
        card.classList.contains("workflow-card") ||
        card.classList.contains("editor-card") ||
        card.classList.contains("cropper-card");
      const cardCategory = card.dataset.category || "all";
      const searchIndex = card.dataset.search || "";

      const matchCategory =
        currentCategory === "all" ||
        cardCategory === currentCategory ||
        (isSpecialCard && currentCategory === "all");
      const matchQuery = !query || searchIndex.includes(query);

      if (matchCategory && matchQuery) {
        card.style.display = "flex";
      } else {
        card.style.display = "none";
      }
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyCurrentSearchAndFilter);
  }

  // Category Tabs Filter
  const tabButtons = document.querySelectorAll(".tab-btn");
  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      tabButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      currentCategory = btn.dataset.category || "all";
      applyCurrentSearchAndFilter();
    });
  });

  // 5. Modal & File Handlers
  const modal = document.getElementById("tool-modal");
  const modalClose = document.getElementById("btn-modal-close");
  const modalTitle = document.getElementById("modal-tool-title");
  const modalDesc = document.getElementById("modal-tool-desc");
  const modalIconContainer = document.getElementById("modal-icon-container");
  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("file-input");
  const btnStartProcess = document.getElementById("btn-start-process");
  const toastMsg = document.getElementById("toast-msg");
  const fileQueue = document.getElementById("file-queue");
  const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024;
  const MAX_FILES = 20;
  let selectedFiles = [];

  let toastTimeout = null;
  function showToast(msg) {
    if (!toastMsg) return;
    clearTimeout(toastTimeout);
    toastMsg.textContent = msg;
    toastMsg.style.display = "block";
    toastTimeout = setTimeout(() => {
      toastMsg.style.display = "none";
    }, 2800);
  }

  function openModal(title, desc, iconSvg) {
    if (!modal) return;
    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modalIconContainer.innerHTML = iconSvg || "";
    modal.classList.add("open");
    renderFileQueue();
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove("open");
    currentActiveTool = null;
    selectedFiles = [];
    if (fileInput) fileInput.value = "";
    renderFileQueue();
  }

  if (modalClose) {
    modalClose.addEventListener("click", closeModal);
  }

  if (modal) {
    modal.addEventListener("click", e => {
      if (e.target === modal) closeModal();
    });
  }

  // Batch File Handling
  function formatFileSize(bytes) {
    if (bytes < 1024 * 1024) {
      return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function getFileKey(file) {
    return `${file.name}::${file.size}::${file.lastModified}`;
  }

  function renderFileQueue() {
    if (!fileQueue) return;
    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.th;
    fileQueue.innerHTML = "";
    fileQueue.hidden = selectedFiles.length === 0;

    if (btnStartProcess && !btnStartProcess.dataset.processing) {
      btnStartProcess.disabled = selectedFiles.length === 0;
      if (selectedFiles.length === 0) {
        btnStartProcess.textContent = t.btn_start_process;
      }
    }

    if (selectedFiles.length === 0) return;

    const summary = document.createElement("div");
    summary.className = "file-queue-summary";

    const summaryText = document.createElement("span");
    summaryText.textContent = t.file_count(selectedFiles.length);

    const totalSize = selectedFiles.reduce((sum, file) => sum + file.size, 0);
    const totalText = document.createElement("span");
    totalText.className = "file-queue-total";
    totalText.textContent = t.file_total_size(formatFileSize(totalSize));

    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.className = "file-queue-clear";
    clearButton.textContent = t.file_clear;
    clearButton.addEventListener("click", event => {
      event.preventDefault();
      event.stopPropagation();
      selectedFiles = [];
      if (fileInput) fileInput.value = "";
      renderFileQueue();
    });

    summary.append(summaryText, totalText, clearButton);
    fileQueue.appendChild(summary);

    const list = document.createElement("ul");
    list.className = "file-queue-list";
    selectedFiles.forEach((file, index) => {
      const item = document.createElement("li");
      item.className = "file-queue-item";

      const fileInfo = document.createElement("div");
      fileInfo.className = "file-queue-info";
      const fileName = document.createElement("strong");
      fileName.className = "file-queue-name";
      fileName.textContent = file.name;
      const fileMeta = document.createElement("span");
      fileMeta.className = "file-queue-meta";
      fileMeta.textContent = formatFileSize(file.size);
      fileInfo.append(fileName, fileMeta);

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.className = "file-queue-remove";
      removeButton.title = t.file_remove;
      removeButton.setAttribute("aria-label", `${t.file_remove}: ${file.name}`);
      removeButton.textContent = "×";
      removeButton.addEventListener("click", event => {
        event.preventDefault();
        event.stopPropagation();
        selectedFiles.splice(index, 1);
        if (fileInput) fileInput.value = "";
        renderFileQueue();
      });

      item.append(fileInfo, removeButton);
      list.appendChild(item);
    });
    fileQueue.appendChild(list);
  }

  function handleFiles(files) {
    const incomingFiles = Array.from(files || []);
    if (incomingFiles.length === 0) return;

    const t = TRANSLATIONS[currentLang] || TRANSLATIONS.th;
    const existingKeys = new Set(selectedFiles.map(getFileKey));
    const addedFiles = [];
    let oversizedCount = 0;
    let duplicateCount = 0;
    let maxFilesReached = false;

    for (const file of incomingFiles) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        oversizedCount += 1;
        continue;
      }
      const key = getFileKey(file);
      if (existingKeys.has(key)) {
        duplicateCount += 1;
        continue;
      }
      if (selectedFiles.length + addedFiles.length >= MAX_FILES) {
        maxFilesReached = true;
        break;
      }
      existingKeys.add(key);
      addedFiles.push(file);
    }

    selectedFiles.push(...addedFiles);
    if (fileInput) fileInput.value = "";
    renderFileQueue();

    if (oversizedCount > 0) {
      showToast(t.toast_file_size_error(oversizedCount));
    } else if (maxFilesReached) {
      showToast(t.toast_max_files);
    } else if (duplicateCount > 0) {
      showToast(t.toast_duplicate_files(duplicateCount));
    } else if (addedFiles.length > 0) {
      showToast(t.toast_files_selected(addedFiles.length));
    }
  }

  if (dropzone) {
    dropzone.addEventListener("click", () => fileInput && fileInput.click());

    ["dragenter", "dragover"].forEach(eventName => {
      dropzone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.add("dragover");
      });
    });

    ["dragleave", "drop"].forEach(eventName => {
      dropzone.addEventListener(eventName, e => {
        e.preventDefault();
        e.stopPropagation();
        dropzone.classList.remove("dragover");
      });
    });

    dropzone.addEventListener("drop", e => {
      const dt = e.dataTransfer;
      if (dt && dt.files && dt.files.length > 0) {
        handleFiles(dt.files);
      }
    });
  }

  if (fileInput) {
    fileInput.addEventListener("change", e => {
      if (e.target.files && e.target.files.length > 0) {
        handleFiles(e.target.files);
      }
    });
  }

  if (btnStartProcess) {
    btnStartProcess.addEventListener("click", () => {
      const t = TRANSLATIONS[currentLang] || TRANSLATIONS.th;
      if (selectedFiles.length === 0) {
        showToast(t.toast_no_files);
        return;
      }

      const processedCount = selectedFiles.length;
      btnStartProcess.dataset.processing = "true";
      btnStartProcess.textContent = t.btn_processing;
      btnStartProcess.disabled = true;
      setTimeout(() => {
        btnStartProcess.textContent = t.btn_start_process;
        btnStartProcess.disabled = false;
        delete btnStartProcess.dataset.processing;
        const currentTitle = modalTitle ? modalTitle.textContent : "";
        closeModal();
        showToast(t.toast_process_success(currentTitle, processedCount));
      }, 1200);
    });
  }

  // Initial Boot
  setLanguage(currentLang);
});
