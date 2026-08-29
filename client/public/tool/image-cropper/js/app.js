/**
 * Main Application Controller (app.js)
 * Implements Instant Auto-Cut on Drop/Upload, Viewport Zoom & Pan Navigation,
 * Output Scaling (1x, 2x, 3x, 4x Pixel Art Upscaling), and Interactive Bounding Box Editing.
 */
document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const dropZone = document.getElementById("dropZone");
  const fileInput = document.getElementById("fileInput");
  const emptyState = document.getElementById("emptyState");
  const mainWorkspace = document.getElementById("mainWorkspace");
  const activeFileName = document.getElementById("activeFileName");
  const activeImageMeta = document.getElementById("activeImageMeta");
  const globalDragOverlay = document.getElementById("globalDragOverlay");

  // Mode Tabs
  const tabManual = document.getElementById("tabManual");
  const tabAuto = document.getElementById("tabAuto");
  const viewManual = document.getElementById("viewManual");
  const viewAuto = document.getElementById("viewAuto");

  // Overlay Canvas & Image Elements
  const cropperImage = document.getElementById("cropperImage");
  const autoCropImage = document.getElementById("autoCropImage");
  const autoCropOverlayCanvas = document.getElementById(
    "autoCropOverlayCanvas"
  );
  const autoCropContainer = document.getElementById("autoCropContainer");
  const autoCropContentWrapper = document.getElementById(
    "autoCropContentWrapper"
  );

  // Viewport Zoom & Pan Controls
  const btnZoomInAuto = document.getElementById("btnZoomInAuto");
  const btnZoomOutAuto = document.getElementById("btnZoomOutAuto");
  const btnZoomResetAuto = document.getElementById("btnZoomResetAuto");
  const btnZoomFitAuto = document.getElementById("btnZoomFitAuto");
  const zoomSliderAuto = document.getElementById("zoomSliderAuto");
  const zoomPercentBadge = document.getElementById("zoomPercentBadge");

  // Output Scaling Controls
  const scaleFactorSelect = document.getElementById("scaleFactorSelect");
  const scalingAlgorithmSelect = document.getElementById(
    "scalingAlgorithmSelect"
  );

  // Engines
  const cropperMgr = new CropperManager({
    imageElement: cropperImage,
    previewElement: document.getElementById("manualPreviewCanvas"),
    infoElement: document.getElementById("manualCropInfo"),
  });
  const autoCropEngine = new AutoCropEngine();

  // App State
  let currentImageSrc = null;
  let currentImageName = "image";
  let currentActiveTab = "auto"; // Default to Auto Extractor for instant cutting!
  let selectedBoxIds = new Set();
  let debounceAnalyzeTimer = null;
  let dragCounter = 0;

  // Viewport Zoom & Pan State
  let autoZoom = 1.0;
  let autoPanX = 0;
  let autoPanY = 0;
  let isPanning = false;
  let startMouseX = 0;
  let startMouseY = 0;
  let startPanX = 0;
  let startPanY = 0;

  // ----------------------------------------------------
  // 1. Instant Auto-Cut on File Drop / Upload / Paste
  // ----------------------------------------------------
  function handleFile(file) {
    if (!file || !file.type.startsWith("image/")) {
      showToast("กรุณาเลือกไฟล์รูปภาพที่ถูกต้อง (PNG, JPG, WebP ฯลฯ)", "error");
      return;
    }

    currentImageName = file.name.replace(/\.[^/.]+$/, "");
    activeFileName.textContent = file.name;
    const prefixInput = document.getElementById("namingPrefixInput");
    if (prefixInput) {
      prefixInput.value = currentImageName;
    }

    const reader = new FileReader();
    reader.onload = e => {
      loadImageAndAutoCut(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  function loadImageAndAutoCut(src) {
    currentImageSrc = src;
    const img = new Image();
    img.onload = () => {
      emptyState.classList.add("hidden");
      mainWorkspace.classList.remove("hidden");
      mainWorkspace.classList.add("flex");

      activeImageMeta.textContent = `${img.naturalWidth} × ${img.naturalHeight} px`;

      // Set image in Cropper Manager (for Phase 1 if switched later)
      cropperMgr.init(src);

      // Set image in Auto Crop Engine and cut immediately!
      autoCropImage.src = src;
      autoCropImage.onload = () => {
        const natW = autoCropImage.naturalWidth || autoCropImage.width;
        const natH = autoCropImage.naturalHeight || autoCropImage.height;

        autoCropImage.style.width = `${natW}px`;
        autoCropImage.style.height = `${natH}px`;
        if (autoCropContentWrapper) {
          autoCropContentWrapper.style.width = `${natW}px`;
          autoCropContentWrapper.style.height = `${natH}px`;
        }
        if (autoCropOverlayCanvas) {
          autoCropOverlayCanvas.width = natW;
          autoCropOverlayCanvas.height = natH;
        }

        autoCropEngine.setImage(autoCropImage);

        // Reset Zoom and Fit to container
        fitAutoCropToScreen();

        // Always default to Auto Extractor mode & cut immediately
        switchTab("auto");
        triggerAutoAnalyze(true);
      };
    };
    img.src = src;
  }

  // Global Drag & Drop over entire window
  window.addEventListener("dragenter", e => {
    e.preventDefault();
    dragCounter++;
    if (globalDragOverlay) globalDragOverlay.classList.add("active");
  });

  window.addEventListener("dragleave", e => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
      dragCounter = 0;
      if (globalDragOverlay) globalDragOverlay.classList.remove("active");
    }
  });

  window.addEventListener("dragover", e => {
    e.preventDefault();
  });

  window.addEventListener("drop", e => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter = 0;
    if (globalDragOverlay) globalDragOverlay.classList.remove("active");
    if (dropZone) dropZone.classList.remove("drag-active");

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  });

  if (fileInput) {
    fileInput.addEventListener("change", e => {
      if (e.target.files && e.target.files.length > 0) {
        handleFile(e.target.files[0]);
      }
    });
  }

  // Paste from clipboard (Ctrl+V) anywhere
  window.addEventListener("paste", e => {
    const items = (e.clipboardData || e.originalEvent.clipboardData)?.items;
    if (!items) return;
    for (const item of items) {
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        handleFile(file);
        break;
      }
    }
  });

  // ----------------------------------------------------
  // 2. Tab Navigation (Manual Cropper vs Auto Extractor)
  // ----------------------------------------------------
  function switchTab(tab) {
    currentActiveTab = tab;
    if (tab === "manual") {
      tabManual.classList.add(
        "bg-indigo-600",
        "text-white",
        "shadow-lg",
        "shadow-indigo-600/30"
      );
      tabManual.classList.remove(
        "text-slate-400",
        "hover:text-white",
        "hover:bg-slate-800"
      );
      tabAuto.classList.remove(
        "bg-indigo-600",
        "text-white",
        "shadow-lg",
        "shadow-indigo-600/30"
      );
      tabAuto.classList.add(
        "text-slate-400",
        "hover:text-white",
        "hover:bg-slate-800"
      );

      viewManual.classList.remove("hidden");
      viewAuto.classList.add("hidden");
      if (cropperMgr.cropper) {
        cropperMgr.updatePreview();
      }
    } else {
      tabAuto.classList.add(
        "bg-indigo-600",
        "text-white",
        "shadow-lg",
        "shadow-indigo-600/30"
      );
      tabAuto.classList.remove(
        "text-slate-400",
        "hover:text-white",
        "hover:bg-slate-800"
      );
      tabManual.classList.remove(
        "bg-indigo-600",
        "text-white",
        "shadow-lg",
        "shadow-indigo-600/30"
      );
      tabManual.classList.add(
        "text-slate-400",
        "hover:text-white",
        "hover:bg-slate-800"
      );

      viewManual.classList.add("hidden");
      viewAuto.classList.remove("hidden");

      applyAutoTransform();
      triggerAutoAnalyze();
    }
  }

  tabManual.addEventListener("click", () => switchTab("manual"));
  tabAuto.addEventListener("click", () => switchTab("auto"));

  // ----------------------------------------------------
  // 3. Viewport Zoom & Pan Controller (Auto Extractor)
  // ----------------------------------------------------
  function applyAutoTransform() {
    if (!autoCropContentWrapper) return;
    autoCropContentWrapper.style.transform = `translate(${autoPanX}px, ${autoPanY}px) scale(${autoZoom})`;
    autoCropContentWrapper.style.transformOrigin = "0 0";

    if (zoomSliderAuto) {
      zoomSliderAuto.value = Math.round(autoZoom * 100);
    }
    if (zoomPercentBadge) {
      zoomPercentBadge.textContent = `${Math.round(autoZoom * 100)}%`;
    }
  }

  function setAutoZoom(newZoom, centerX = null, centerY = null) {
    newZoom = Math.min(Math.max(0.15, newZoom), 8.0); // 15% to 800%
    if (centerX !== null && centerY !== null) {
      // Zoom toward cursor position
      const prevZoom = autoZoom;
      autoPanX = centerX - (centerX - autoPanX) * (newZoom / prevZoom);
      autoPanY = centerY - (centerY - autoPanY) * (newZoom / prevZoom);
    }
    autoZoom = newZoom;
    applyAutoTransform();
  }

  function fitAutoCropToScreen() {
    if (!autoCropContainer || !autoCropEngine.width || !autoCropEngine.height)
      return;
    const containerW = autoCropContainer.clientWidth - 40;
    const containerH = autoCropContainer.clientHeight - 40;
    const imgW = autoCropEngine.width;
    const imgH = autoCropEngine.height;

    const scaleX = containerW / imgW;
    const scaleY = containerH / imgH;
    autoZoom = Math.min(scaleX, scaleY, 1.0); // Fit completely
    autoZoom = Math.max(0.2, autoZoom);

    // Center image
    autoPanX = Math.round(
      (autoCropContainer.clientWidth - imgW * autoZoom) / 2
    );
    autoPanY = Math.round(
      (autoCropContainer.clientHeight - imgH * autoZoom) / 2
    );
    applyAutoTransform();
  }

  // Zoom Button Listeners
  btnZoomInAuto?.addEventListener("click", () => setAutoZoom(autoZoom * 1.25));
  btnZoomOutAuto?.addEventListener("click", () => setAutoZoom(autoZoom / 1.25));
  btnZoomResetAuto?.addEventListener("click", () => {
    autoZoom = 1.0;
    if (autoCropContainer && autoCropEngine.width) {
      autoPanX = Math.round(
        (autoCropContainer.clientWidth - autoCropEngine.width) / 2
      );
      autoPanY = Math.round(
        (autoCropContainer.clientHeight - autoCropEngine.height) / 2
      );
    }
    applyAutoTransform();
  });
  btnZoomFitAuto?.addEventListener("click", () => fitAutoCropToScreen());

  zoomSliderAuto?.addEventListener("input", e => {
    const val = parseInt(e.target.value) / 100;
    setAutoZoom(val);
  });

  // Mouse Wheel Zoom
  if (autoCropContainer) {
    autoCropContainer.addEventListener(
      "wheel",
      e => {
        e.preventDefault();
        const rect = autoCropContainer.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const factor = e.deltaY < 0 ? 1.15 : 0.85;
        setAutoZoom(autoZoom * factor, mouseX, mouseY);
      },
      { passive: false }
    );

    // Drag to Pan Canvas
    autoCropContainer.addEventListener("mousedown", e => {
      if (interactionState) return;
      isPanning = true;
      startMouseX = e.clientX;
      startMouseY = e.clientY;
      startPanX = autoPanX;
      startPanY = autoPanY;
      autoCropContainer.classList.add("cursor-grabbing");
    });

    window.addEventListener("mousemove", e => {
      if (interactionState) {
        const { x, y } = getCanvasCoordinates(e);
        const dx = x - interactionState.startCanvasX;
        const dy = y - interactionState.startCanvasY;

        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          interactionState.hasMoved = true;
        }

        const imgW = autoCropEngine.width;
        const imgH = autoCropEngine.height;

        if (interactionState.mode === "resize") {
          const box = interactionState.targetBox;
          const init = interactionState.initialBoxes.get(box.id);
          const h = interactionState.handle;
          const minBoxSize = 4;

          let newMinX = init.minX;
          let newMinY = init.minY;
          let newMaxX = init.maxX;
          let newMaxY = init.maxY;

          if (h.includes("w")) {
            newMinX = Math.min(
              init.maxX - minBoxSize,
              Math.max(0, Math.round(init.minX + dx))
            );
          }
          if (h.includes("e")) {
            newMaxX = Math.max(
              init.minX + minBoxSize,
              Math.min(imgW - 1, Math.round(init.maxX + dx))
            );
          }
          if (h.includes("n")) {
            newMinY = Math.min(
              init.maxY - minBoxSize,
              Math.max(0, Math.round(init.minY + dy))
            );
          }
          if (h.includes("s")) {
            newMaxY = Math.max(
              init.minY + minBoxSize,
              Math.min(imgH - 1, Math.round(init.maxY + dy))
            );
          }

          box.minX = newMinX;
          box.minY = newMinY;
          box.maxX = newMaxX;
          box.maxY = newMaxY;
          box.width = box.maxX - box.minX + 1;
          box.height = box.maxY - box.minY + 1;

          renderDetectedOverlays();
        } else if (interactionState.mode === "move") {
          let minAllowedDx = -Infinity;
          let maxAllowedDx = Infinity;
          let minAllowedDy = -Infinity;
          let maxAllowedDy = Infinity;

          interactionState.initialBoxes.forEach(init => {
            minAllowedDx = Math.max(minAllowedDx, -init.minX);
            maxAllowedDx = Math.min(maxAllowedDx, imgW - 1 - init.maxX);
            minAllowedDy = Math.max(minAllowedDy, -init.minY);
            maxAllowedDy = Math.min(maxAllowedDy, imgH - 1 - init.maxY);
          });

          const clampedDx = Math.round(
            Math.min(maxAllowedDx, Math.max(minAllowedDx, dx))
          );
          const clampedDy = Math.round(
            Math.min(maxAllowedDy, Math.max(minAllowedDy, dy))
          );

          interactionState.initialBoxes.forEach((init, id) => {
            const box = autoCropEngine.processedBoxes.find(b => b.id === id);
            if (box) {
              box.minX = init.minX + clampedDx;
              box.minY = init.minY + clampedDy;
              box.maxX = init.maxX + clampedDx;
              box.maxY = init.maxY + clampedDy;
              box.width = box.maxX - box.minX + 1;
              box.height = box.maxY - box.minY + 1;
            }
          });

          renderDetectedOverlays();
        }
      } else if (isPanning) {
        const dx = e.clientX - startMouseX;
        const dy = e.clientY - startMouseY;
        autoPanX = startPanX + dx;
        autoPanY = startPanY + dy;
        applyAutoTransform();
      }
    });

    window.addEventListener("mouseup", () => {
      if (interactionState) {
        if (interactionState.hasMoved) {
          interactionState.initialBoxes.forEach((_, id) => {
            const box = autoCropEngine.processedBoxes.find(b => b.id === id);
            if (box) {
              autoCropEngine.generateSingleCropThumbnail(box);
              updateGalleryCard(box);
            }
          });
          renderDetectedOverlays();
        }
        interactionState = null;
      }

      if (isPanning) {
        isPanning = false;
        autoCropContainer?.classList.remove("cursor-grabbing");
      }
    });
  }

  // ----------------------------------------------------
  // 4. Phase 1: Manual Cropper Controls
  // ----------------------------------------------------
  document.querySelectorAll(".aspect-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".aspect-btn")
        .forEach(b =>
          b.classList.remove("bg-indigo-600", "text-white", "active")
        );
      btn.classList.add("bg-indigo-600", "text-white", "active");
      const ratioVal = btn.getAttribute("data-ratio");
      const ratio = ratioVal === "free" ? NaN : eval(ratioVal);
      cropperMgr.setAspectRatio(ratio);
    });
  });

  document
    .getElementById("btnZoomIn")
    ?.addEventListener("click", () => cropperMgr.zoom(0.1));
  document
    .getElementById("btnZoomOut")
    ?.addEventListener("click", () => cropperMgr.zoom(-0.1));
  document
    .getElementById("btnRotateLeft")
    ?.addEventListener("click", () => cropperMgr.rotate(-90));
  document
    .getElementById("btnRotateRight")
    ?.addEventListener("click", () => cropperMgr.rotate(90));
  document
    .getElementById("btnFlipH")
    ?.addEventListener("click", () => cropperMgr.flipH());
  document
    .getElementById("btnFlipV")
    ?.addEventListener("click", () => cropperMgr.flipV());
  document.getElementById("btnResetCrop")?.addEventListener("click", () => {
    cropperMgr.reset();
    document.getElementById("rotateSlider").value = 0;
    document.getElementById("rotateSliderVal").textContent = "0°";
  });

  const rotateSlider = document.getElementById("rotateSlider");
  const rotateSliderVal = document.getElementById("rotateSliderVal");
  if (rotateSlider) {
    rotateSlider.addEventListener("input", e => {
      const val = parseInt(e.target.value);
      rotateSliderVal.textContent = `${val}°`;
      cropperMgr.rotateTo(val);
    });
  }

  document
    .getElementById("btnDownloadSingleCrop")
    ?.addEventListener("click", () => {
      const format =
        document.getElementById("exportFormatSelect")?.value || "png";
      const filename = (
        document.getElementById("manualFileNameInput")?.value ||
        currentImageName ||
        "cropped"
      ).trim();
      cropperMgr.downloadCrop(filename, format);
      showToast(`ดาวน์โหลดภาพตัดแล้ว (${format.toUpperCase()})`, "success");
    });

  document
    .getElementById("btnDownloadSingleZip")
    ?.addEventListener("click", async () => {
      const format =
        document.getElementById("exportFormatSelect")?.value || "png";
      const filename = (
        document.getElementById("manualFileNameInput")?.value ||
        currentImageName ||
        "cropped"
      ).trim();
      const canvas = cropperMgr.getCroppedCanvas(format);
      if (!canvas) return;

      const fakeBox = [
        {
          cropCanvas: canvas,
          cropWidth: canvas.width,
          cropHeight: canvas.height,
          customName: filename,
        },
      ];

      await SmartProcessor.exportToZip(fakeBox, {
        zipFolderName: filename,
        prefix: filename,
        format: format,
      });
      showToast("ดาวน์โหลด ZIP ภาพตัดสำเร็จ!", "success");
    });

  // ----------------------------------------------------
  // 5. Phase 2 & 3: Auto Crop Engine & UI Controls
  // ----------------------------------------------------
  const bgRemovalSelect = document.getElementById("bgRemovalSelect");
  const customColorGroup = document.getElementById("customColorGroup");
  const customBgColorInput = document.getElementById("customBgColorInput");
  const colorToleranceSlider = document.getElementById("colorToleranceSlider");
  const colorToleranceVal = document.getElementById("colorToleranceVal");
  const alphaThresholdSlider = document.getElementById("alphaThresholdSlider");
  const alphaThresholdVal = document.getElementById("alphaThresholdVal");

  const minWidthSlider = document.getElementById("minWidthSlider");
  const minWidthVal = document.getElementById("minWidthVal");
  const minHeightSlider = document.getElementById("minHeightSlider");
  const minHeightVal = document.getElementById("minHeightVal");
  const minPixelsSlider = document.getElementById("minPixelsSlider");
  const minPixelsVal = document.getElementById("minPixelsVal");

  const autoMergeCheckbox = document.getElementById("autoMergeCheckbox");
  const mergeDistanceSlider = document.getElementById("mergeDistanceSlider");
  const mergeDistanceVal = document.getElementById("mergeDistanceVal");
  const paddingSlider = document.getElementById("paddingSlider");
  const paddingVal = document.getElementById("paddingVal");

  const namingPrefixInput = document.getElementById("namingPrefixInput");
  const namingTemplateInput = document.getElementById("namingTemplateInput");
  const solidBgTipBanner = document.getElementById("solidBgTipBanner");
  const btnSwitchWhiteBg = document.getElementById("btnSwitchWhiteBg");
  const btnSwitchCornerBg = document.getElementById("btnSwitchCornerBg");

  function getAutoCropConfig() {
    return {
      bgRemovalMode: bgRemovalSelect ? bgRemovalSelect.value : "smart_auto",
      customBgColor: customBgColorInput ? customBgColorInput.value : "#ffffff",
      colorTolerance: parseInt(colorToleranceSlider?.value || 30),
      alphaThreshold: parseInt(alphaThresholdSlider?.value || 10),
      scaleFactor: parseFloat(scaleFactorSelect?.value || 1.0),
      scalingAlgorithm: scalingAlgorithmSelect?.value || "pixelated",
      minWidth: parseInt(minWidthSlider?.value || 10),
      minHeight: parseInt(minHeightSlider?.value || 10),
      minPixels: parseInt(minPixelsSlider?.value || 50),
      autoMerge: autoMergeCheckbox ? autoMergeCheckbox.checked : false,
      mergeDistance: parseInt(mergeDistanceSlider?.value || 15),
      padding: parseInt(paddingSlider?.value || 0),
    };
  }

  function triggerAutoAnalyze(isInitialLoad = false) {
    if (debounceAnalyzeTimer) clearTimeout(debounceAnalyzeTimer);
    debounceAnalyzeTimer = setTimeout(
      async () => {
        const config = getAutoCropConfig();
        const boxes = await autoCropEngine.analyze(config);
        renderDetectedOverlays();
        renderGalleryGrid(boxes);
        updateSummaryStats(boxes);

        // Check if image is solid background and user is in alpha mode with 1 full-size box
        if (solidBgTipBanner) {
          const isSingleLargeBox =
            boxes.length === 1 &&
            boxes[0].width >= autoCropEngine.width * 0.75 &&
            boxes[0].height >= autoCropEngine.height * 0.75;

          if (isSingleLargeBox && config.bgRemovalMode === "alpha") {
            solidBgTipBanner.classList.remove("hidden");
          } else {
            solidBgTipBanner.classList.add("hidden");
          }
        }

        if (isInitialLoad) {
          showToast(
            `⚡ ตัดภาพอัตโนมัติสำเร็จ! แยกได้ทั้งหมด ${boxes.length} ชิ้น`,
            "success"
          );
        }
      },
      isInitialLoad ? 10 : 100
    );
  }

  if (btnSwitchWhiteBg) {
    btnSwitchWhiteBg.addEventListener("click", () => {
      if (bgRemovalSelect) bgRemovalSelect.value = "white_bg";
      if (customColorGroup) customColorGroup.classList.add("hidden");
      if (solidBgTipBanner) solidBgTipBanner.classList.add("hidden");
      triggerAutoAnalyze();
      showToast("🤍 สลับเป็นโหมดตัดพื้นหลังสีขาวแล้ว", "info");
    });
  }

  if (btnSwitchCornerBg) {
    btnSwitchCornerBg.addEventListener("click", () => {
      if (bgRemovalSelect) bgRemovalSelect.value = "auto_corner";
      if (customColorGroup) customColorGroup.classList.add("hidden");
      if (solidBgTipBanner) solidBgTipBanner.classList.add("hidden");
      triggerAutoAnalyze();
      showToast("🎨 สลับเป็นโหมดตัดสีมุมภาพแล้ว", "info");
    });
  }

  function bindSlider(slider, labelEl, unit = "") {
    if (!slider || !labelEl) return;
    slider.addEventListener("input", e => {
      labelEl.textContent = `${e.target.value}${unit}`;
      triggerAutoAnalyze();
    });
  }

  bindSlider(alphaThresholdSlider, alphaThresholdVal);
  bindSlider(colorToleranceSlider, colorToleranceVal);
  bindSlider(minWidthSlider, minWidthVal, " px");
  bindSlider(minHeightSlider, minHeightVal, " px");
  bindSlider(minPixelsSlider, minPixelsVal, " px");
  bindSlider(mergeDistanceSlider, mergeDistanceVal, " px");
  bindSlider(paddingSlider, paddingVal, " px");

  if (scaleFactorSelect) {
    scaleFactorSelect.addEventListener("change", () => {
      triggerAutoAnalyze();
      showToast(
        `เปลี่ยน Output Scale เป็น ${scaleFactorSelect.value}x แล้ว`,
        "info"
      );
    });
  }

  if (scalingAlgorithmSelect) {
    scalingAlgorithmSelect.addEventListener("change", () => {
      triggerAutoAnalyze();
    });
  }

  if (bgRemovalSelect) {
    bgRemovalSelect.addEventListener("change", () => {
      if (bgRemovalSelect.value === "custom_color") {
        customColorGroup.classList.remove("hidden");
      } else {
        customColorGroup.classList.add("hidden");
      }
      triggerAutoAnalyze();
    });
  }

  if (customBgColorInput) {
    customBgColorInput.addEventListener("input", () => triggerAutoAnalyze());
  }

  if (autoMergeCheckbox) {
    autoMergeCheckbox.addEventListener("change", () => triggerAutoAnalyze());
  }

  if (namingPrefixInput) {
    namingPrefixInput.addEventListener("input", () => updateGalleryNames());
  }
  if (namingTemplateInput) {
    namingTemplateInput.addEventListener("input", () => updateGalleryNames());
  }

  // ----------------------------------------------------
  // 6. Interactive Bounding Box Controller (Resize & Move)
  // ----------------------------------------------------
  let interactionState = null;

  function getCanvasCoordinates(e) {
    if (!autoCropOverlayCanvas) return { x: 0, y: 0 };
    const rect = autoCropOverlayCanvas.getBoundingClientRect();
    if (!rect.width || !rect.height) return { x: 0, y: 0 };
    const scaleX = autoCropOverlayCanvas.width / rect.width;
    const scaleY = autoCropOverlayCanvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    return {
      x: Math.max(0, Math.min(autoCropOverlayCanvas.width - 1, x)),
      y: Math.max(0, Math.min(autoCropOverlayCanvas.height - 1, y)),
    };
  }

  function hitTestHandle(canvasX, canvasY, box) {
    if (!box) return null;
    const pad = Math.max(0, parseInt(autoCropEngine.config.padding) || 0);
    const handles = autoCropEngine.getHandlePositions(box, pad);
    const hitRadius = Math.max(12, 12 / (autoZoom || 1));

    for (const [handleKey, pos] of Object.entries(handles)) {
      const dist = Math.hypot(canvasX - pos.x, canvasY - pos.y);
      if (dist <= hitRadius) {
        return { handle: handleKey, cursor: pos.cursor, box: box };
      }
    }
    return null;
  }

  function hitTestBox(canvasX, canvasY) {
    const pad = Math.max(0, parseInt(autoCropEngine.config.padding) || 0);
    const boxes = autoCropEngine.processedBoxes;
    for (let i = boxes.length - 1; i >= 0; i--) {
      const b = boxes[i];
      const x = Math.max(0, b.minX - pad);
      const y = Math.max(0, b.minY - pad);
      const w = Math.min(
        autoCropEngine.width - x,
        b.maxX - b.minX + 1 + pad * 2
      );
      const h = Math.min(
        autoCropEngine.height - y,
        b.maxY - b.minY + 1 + pad * 2
      );
      if (
        canvasX >= x &&
        canvasX <= x + w &&
        canvasY >= y &&
        canvasY <= y + h
      ) {
        return b;
      }
    }
    return null;
  }

  function renderDetectedOverlays(hoveredId = null) {
    autoCropEngine.drawOverlays(
      autoCropOverlayCanvas,
      hoveredId,
      Array.from(selectedBoxIds)
    );
  }

  function updateGalleryCard(box) {
    const card = document.getElementById(`gallery-card-${box.id}`);
    if (!card) return;

    const scaleFactor = parseFloat(scaleFactorSelect?.value || 1.0);
    const sizeBadge = card.querySelector('[title="ขนาด Output"]');
    if (sizeBadge) {
      sizeBadge.textContent = `${box.cropWidth}×${box.cropHeight}${scaleFactor !== 1 ? " (" + scaleFactor + "x)" : ""}`;
    }

    const thumbImg = card.querySelector(".checkerboard img");
    if (thumbImg && box.cropCanvas) {
      thumbImg.src = box.cropCanvas.toDataURL("image/png");
    }
  }

  if (autoCropOverlayCanvas) {
    // Hover cursor feedback
    autoCropOverlayCanvas.addEventListener("mousemove", e => {
      if (interactionState || isPanning) return;
      const { x, y } = getCanvasCoordinates(e);

      // Check handle on any selected box
      let foundHandle = null;
      for (const boxId of selectedBoxIds) {
        const box = autoCropEngine.processedBoxes.find(b => b.id === boxId);
        if (box) {
          foundHandle = hitTestHandle(x, y, box);
          if (foundHandle) break;
        }
      }

      if (foundHandle) {
        autoCropOverlayCanvas.style.cursor = foundHandle.cursor;
        return;
      }

      // Check hit box
      const hitBox = hitTestBox(x, y);
      if (hitBox) {
        if (selectedBoxIds.has(hitBox.id)) {
          autoCropOverlayCanvas.style.cursor = "move";
        } else {
          autoCropOverlayCanvas.style.cursor = "pointer";
        }
      } else {
        autoCropOverlayCanvas.style.cursor = "grab";
      }
    });

    // Mousedown on canvas: Handle resize, box move, or selection
    autoCropOverlayCanvas.addEventListener("mousedown", e => {
      if (e.button !== 0 && e.button !== 1) return;
      const { x, y } = getCanvasCoordinates(e);

      // 1. Check if clicking on an active resize handle
      let handleHit = null;
      for (const boxId of selectedBoxIds) {
        const box = autoCropEngine.processedBoxes.find(b => b.id === boxId);
        if (box) {
          handleHit = hitTestHandle(x, y, box);
          if (handleHit) break;
        }
      }

      if (handleHit) {
        e.stopPropagation();
        e.preventDefault();
        const box = handleHit.box;
        const initialBoxes = new Map();
        initialBoxes.set(box.id, {
          minX: box.minX,
          minY: box.minY,
          maxX: box.maxX,
          maxY: box.maxY,
        });

        interactionState = {
          mode: "resize",
          handle: handleHit.handle,
          targetBox: box,
          startMouseX: e.clientX,
          startMouseY: e.clientY,
          startCanvasX: x,
          startCanvasY: y,
          initialBoxes,
          hasMoved: false,
        };
        return;
      }

      // 2. Check if clicking inside a bounding box
      const hitBox = hitTestBox(x, y);
      if (hitBox) {
        e.stopPropagation();
        const isMultiKey = e.shiftKey || e.ctrlKey || e.metaKey;

        if (!selectedBoxIds.has(hitBox.id)) {
          if (!isMultiKey) {
            selectedBoxIds.clear();
          }
          selectedBoxIds.add(hitBox.id);
          renderDetectedOverlays();
          updateGallerySelections();
        } else if (isMultiKey) {
          selectedBoxIds.delete(hitBox.id);
          renderDetectedOverlays();
          updateGallerySelections();
          return;
        }

        // Prepare to move all selected boxes
        const initialBoxes = new Map();
        selectedBoxIds.forEach(id => {
          const b = autoCropEngine.processedBoxes.find(bx => bx.id === id);
          if (b) {
            initialBoxes.set(b.id, {
              minX: b.minX,
              minY: b.minY,
              maxX: b.maxX,
              maxY: b.maxY,
            });
          }
        });

        interactionState = {
          mode: "move",
          targetBox: hitBox,
          startMouseX: e.clientX,
          startMouseY: e.clientY,
          startCanvasX: x,
          startCanvasY: y,
          initialBoxes,
          hasMoved: false,
        };
        return;
      }

      // 3. Clicked empty area on canvas: Deselect & allow panning
      if (!e.shiftKey && !e.ctrlKey) {
        if (selectedBoxIds.size > 0) {
          selectedBoxIds.clear();
          renderDetectedOverlays();
          updateGallerySelections();
        }
      }

      // Viewport Pan
      isPanning = true;
      startMouseX = e.clientX;
      startMouseY = e.clientY;
      startPanX = autoPanX;
      startPanY = autoPanY;
      autoCropContainer?.classList.add("cursor-grabbing");
    });
  }

  // ----------------------------------------------------
  // 7. Gallery Grid Rendering & Actions
  // ----------------------------------------------------
  const galleryGrid = document.getElementById("galleryGrid");
  const detectedCountBadge = document.getElementById("detectedCountBadge");

  function updateSummaryStats(boxes) {
    const count = boxes.length;
    if (detectedCountBadge) {
      detectedCountBadge.textContent = `${count} ตัวละคร/ชิ้น`;
    }
  }

  function renderGalleryGrid(boxes) {
    if (!galleryGrid) return;
    galleryGrid.innerHTML = "";

    if (!boxes || boxes.length === 0) {
      galleryGrid.innerHTML = `
        <div class="col-span-full text-center py-12 text-slate-400">
          <i class="fa-solid fa-ghost text-4xl mb-3 text-slate-500"></i>
          <p class="font-medium text-slate-300">ไม่พบตัวละครหรือชิ้นส่วนตามเงื่อนไขที่กำหนด</p>
          <p class="text-xs text-slate-400 mt-1">ลองปรับลดค่า Alpha Threshold, Min Size หรือตรวจสอบโหมดพื้นหลัง</p>
        </div>
      `;
      return;
    }

    const template = namingTemplateInput?.value || "{prefix}_{pad2}";
    const prefix = namingPrefixInput?.value || currentImageName || "character";
    const scaleFactor = parseFloat(scaleFactorSelect?.value || 1.0);

    boxes.forEach((box, idx) => {
      const card = document.createElement("div");
      card.id = `gallery-card-${box.id}`;
      card.className = `group relative rounded-xl p-3 flex flex-col transition-all duration-200 glass-panel-card border ${
        selectedBoxIds.has(box.id)
          ? "border-amber-500 ring-2 ring-amber-500/30 bg-slate-900/90"
          : "border-slate-700/60 hover:border-slate-500 hover:bg-slate-800/80"
      }`;

      const defaultName = SmartProcessor.formatFileName(
        template,
        prefix,
        idx + 1,
        box.cropWidth,
        box.cropHeight
      );

      // Card Header
      const header = document.createElement("div");
      header.className = "flex items-center justify-between gap-2 mb-2";
      header.innerHTML = `
        <div class="flex items-center gap-2">
          <input type="checkbox" class="box-checkbox rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" data-id="${box.id}" ${selectedBoxIds.has(box.id) ? "checked" : ""}>
          <span class="text-xs font-bold text-indigo-400">#${box.id}</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700" title="ขนาด Output">${box.cropWidth}×${box.cropHeight}${scaleFactor !== 1 ? " (" + scaleFactor + "x)" : ""}</span>
          <button class="btn-delete-box text-slate-400 hover:text-rose-400 p-1 transition" title="ลบชิ้นนี้" data-id="${box.id}">
            <i class="fa-solid fa-trash-can text-xs"></i>
          </button>
        </div>
      `;

      // Card Thumbnail Preview Container
      const thumbContainer = document.createElement("div");
      thumbContainer.className =
        "w-full h-32 rounded-lg checkerboard overflow-hidden flex items-center justify-center p-2 border border-slate-700/40 relative cursor-pointer";

      if (box.cropCanvas) {
        const thumbImg = document.createElement("img");
        thumbImg.src = box.cropCanvas.toDataURL("image/png");
        thumbImg.className =
          "max-w-full max-h-full object-contain filter drop-shadow hover:scale-105 transition-transform duration-150";
        thumbContainer.appendChild(thumbImg);
      }

      // Card Footer / Controls
      const footer = document.createElement("div");
      footer.className = "mt-2 flex flex-col gap-1.5";
      footer.innerHTML = `
        <div class="flex items-center gap-1">
          <input type="text" class="box-name-input w-full bg-slate-900/90 text-slate-200 border border-slate-700/80 rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none font-mono" value="${box.customName || defaultName}" data-id="${box.id}" placeholder="ชื่อไฟล์">
        </div>
        <button class="btn-download-one w-full bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white py-1.5 px-2 rounded text-xs font-medium transition flex items-center justify-center gap-1.5 border border-slate-700 hover:border-indigo-500 shadow-sm" data-id="${box.id}">
          <i class="fa-solid fa-download"></i> ดาวน์โหลด PNG
        </button>
      `;

      card.appendChild(header);
      card.appendChild(thumbContainer);
      card.appendChild(footer);

      // Hover events to highlight on canvas
      card.addEventListener("mouseenter", () => renderDetectedOverlays(box.id));
      card.addEventListener("mouseleave", () => renderDetectedOverlays(null));

      // Click card to toggle selection
      thumbContainer.addEventListener("click", () => {
        if (selectedBoxIds.has(box.id)) {
          selectedBoxIds.delete(box.id);
        } else {
          selectedBoxIds.add(box.id);
        }
        renderDetectedOverlays();
        updateGallerySelections();
      });

      // Individual actions
      card.querySelector(".box-checkbox")?.addEventListener("change", e => {
        if (e.target.checked) selectedBoxIds.add(box.id);
        else selectedBoxIds.delete(box.id);
        renderDetectedOverlays();
        updateGallerySelections();
      });

      card.querySelector(".box-name-input")?.addEventListener("input", e => {
        box.customName = e.target.value;
      });

      card.querySelector(".btn-delete-box")?.addEventListener("click", e => {
        e.stopPropagation();
        autoCropEngine.deleteBox(box.id);
        selectedBoxIds.delete(box.id);
        renderDetectedOverlays();
        renderGalleryGrid(autoCropEngine.processedBoxes);
        updateSummaryStats(autoCropEngine.processedBoxes);
        showToast(`ลบกรอบ #${box.id} แล้ว`, "info");
      });

      card.querySelector(".btn-download-one")?.addEventListener("click", e => {
        e.stopPropagation();
        downloadSingleBox(box);
      });

      galleryGrid.appendChild(card);
    });

    updateSelectionUI();
  }

  function updateGalleryNames() {
    const template = namingTemplateInput?.value || "{prefix}_{pad2}";
    const prefix = namingPrefixInput?.value || currentImageName || "character";
    autoCropEngine.processedBoxes.forEach((box, idx) => {
      const input = document.querySelector(
        `.box-name-input[data-id="${box.id}"]`
      );
      if (input && !box.customName) {
        input.value = SmartProcessor.formatFileName(
          template,
          prefix,
          idx + 1,
          box.cropWidth,
          box.cropHeight
        );
      }
    });
  }

  function updateGallerySelections() {
    autoCropEngine.processedBoxes.forEach(box => {
      const card = document.getElementById(`gallery-card-${box.id}`);
      const checkbox = card?.querySelector(".box-checkbox");
      const isSel = selectedBoxIds.has(box.id);

      if (checkbox) checkbox.checked = isSel;
      if (card) {
        if (isSel) {
          card.classList.add(
            "border-amber-500",
            "ring-2",
            "ring-amber-500/30",
            "bg-slate-900/90"
          );
          card.classList.remove("border-slate-700/60");
        } else {
          card.classList.remove(
            "border-amber-500",
            "ring-2",
            "ring-amber-500/30",
            "bg-slate-900/90"
          );
          card.classList.add("border-slate-700/60");
        }
      }
    });

    updateSelectionUI();
  }

  function updateSelectionUI() {
    const count = selectedBoxIds.size;
    const btnMerge = document.getElementById("btnMergeSelected");
    const btnDeleteSel = document.getElementById("btnDeleteSelected");
    const selectedCountLabel = document.getElementById("selectedCountLabel");

    if (selectedCountLabel) {
      selectedCountLabel.textContent =
        count > 0 ? `(เลือกอยู่ ${count} ชิ้น)` : "";
    }

    if (btnMerge) {
      btnMerge.disabled = count < 2;
      if (count >= 2) {
        btnMerge.classList.remove("opacity-40", "cursor-not-allowed");
      } else {
        btnMerge.classList.add("opacity-40", "cursor-not-allowed");
      }
    }

    if (btnDeleteSel) {
      btnDeleteSel.disabled = count === 0;
      if (count > 0) {
        btnDeleteSel.classList.remove("opacity-40", "cursor-not-allowed");
      } else {
        btnDeleteSel.classList.add("opacity-40", "cursor-not-allowed");
      }
    }
  }

  function downloadSingleBox(box) {
    if (!box.cropCanvas) return;
    const template = namingTemplateInput?.value || "{prefix}_{pad2}";
    const prefix = namingPrefixInput?.value || currentImageName || "character";
    const filename =
      box.customName ||
      SmartProcessor.formatFileName(
        template,
        prefix,
        box.id,
        box.cropWidth,
        box.cropHeight
      );

    box.cropCanvas.toBlob(blob => {
      if (blob && window.saveAs) {
        window.saveAs(blob, `${filename}.png`);
        showToast(`ดาวน์โหลด ${filename}.png สำเร็จ!`, "success");
      }
    }, "image/png");
  }

  // ----------------------------------------------------
  // 8. Multi-Selection & Batch Actions
  // ----------------------------------------------------
  document.getElementById("btnSelectAll")?.addEventListener("click", () => {
    autoCropEngine.processedBoxes.forEach(b => selectedBoxIds.add(b.id));
    renderDetectedOverlays();
    updateGallerySelections();
  });

  document.getElementById("btnDeselectAll")?.addEventListener("click", () => {
    selectedBoxIds.clear();
    renderDetectedOverlays();
    updateGallerySelections();
  });

  // Merge Selected (Phase 3)
  document.getElementById("btnMergeSelected")?.addEventListener("click", () => {
    if (selectedBoxIds.size < 2) return;
    const count = selectedBoxIds.size;
    autoCropEngine.mergeSelectedBoxes(Array.from(selectedBoxIds));
    selectedBoxIds.clear();
    renderDetectedOverlays();
    renderGalleryGrid(autoCropEngine.processedBoxes);
    updateSummaryStats(autoCropEngine.processedBoxes);
    showToast(`รวมชิ้นส่วน ${count} ชิ้นเข้าด้วยกันแล้ว`, "success");
  });

  // Delete Selected
  document
    .getElementById("btnDeleteSelected")
    ?.addEventListener("click", () => {
      if (selectedBoxIds.size === 0) return;
      const count = selectedBoxIds.size;
      selectedBoxIds.forEach(id => autoCropEngine.deleteBox(id));
      selectedBoxIds.clear();
      renderDetectedOverlays();
      renderGalleryGrid(autoCropEngine.processedBoxes);
      updateSummaryStats(autoCropEngine.processedBoxes);
      showToast(`ลบ ${count} ชิ้นที่เลือกแล้ว`, "info");
    });

  // Download All as ZIP (Phase 2 & 3)
  document
    .getElementById("btnDownloadAllZip")
    ?.addEventListener("click", async () => {
      const boxes = autoCropEngine.processedBoxes;
      if (!boxes || boxes.length === 0) {
        showToast("ไม่พบรายการภาพสำหรับส่งออก", "error");
        return;
      }

      const prefix =
        namingPrefixInput?.value || currentImageName || "character";
      const template = namingTemplateInput?.value || "{prefix}_{pad2}";

      const modal = document.getElementById("progressModal");
      const progressBar = document.getElementById("progressBar");
      const progressText = document.getElementById("progressText");

      if (modal) modal.classList.remove("hidden");

      try {
        await SmartProcessor.exportToZip(
          boxes,
          {
            zipFolderName: prefix,
            prefix: prefix,
            namingTemplate: template,
            format: "png",
          },
          (percent, current, total) => {
            if (progressBar) progressBar.style.width = `${percent}%`;
            if (progressText)
              progressText.textContent = `กำลังบีบอัดไฟล์ ${current}/${total} (${percent}%)`;
          }
        );
        showToast(`ส่งออก ZIP ทั้งหมด ${boxes.length} ไฟล์สำเร็จ!`, "success");
      } catch (err) {
        console.error(err);
        showToast("เกิดข้อผิดพลาดในการสร้างไฟล์ ZIP: " + err.message, "error");
      } finally {
        if (modal) setTimeout(() => modal.classList.add("hidden"), 500);
      }
    });

  // Start Auto Cut Button
  const btnStartAutoCut = document.getElementById("btnStartAutoCut");
  if (btnStartAutoCut) {
    btnStartAutoCut.addEventListener("click", async () => {
      if (!autoCropEngine.sourceImage) {
        showToast("กรุณาเลือกรูปภาพก่อนเริ่มตัด", "info");
        return;
      }

      const origContent = btnStartAutoCut.innerHTML;
      btnStartAutoCut.disabled = true;
      btnStartAutoCut.classList.add("opacity-75", "cursor-wait");
      btnStartAutoCut.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin text-sm"></i><span>กำลังตัดภาพอัตโนมัติ...</span>';

      try {
        const config = getAutoCropConfig();
        const boxes = await autoCropEngine.analyze(config);
        renderDetectedOverlays();
        renderGalleryGrid(boxes);
        updateSummaryStats(boxes);
        showToast(
          `✂️ ตัดภาพอัตโนมัติสำเร็จ! แยกได้ทั้งหมด ${boxes.length} ชิ้น`,
          "success"
        );
      } catch (err) {
        console.error(err);
        showToast("เกิดข้อผิดพลาดในการตัดภาพ: " + err.message, "error");
      } finally {
        btnStartAutoCut.disabled = false;
        btnStartAutoCut.classList.remove("opacity-75", "cursor-wait");
        btnStartAutoCut.innerHTML = origContent;
      }
    });
  }

  // Re-Analyze Button
  document.getElementById("btnReAnalyze")?.addEventListener("click", () => {
    triggerAutoAnalyze();
    showToast("รีเฟรชการวิเคราะห์ภาพแล้ว", "info");
  });

  // ----------------------------------------------------
  // 9. Toast Notification Utility
  // ----------------------------------------------------
  function showToast(message, type = "info") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    const colors = {
      success: "bg-emerald-950/90 text-emerald-300 border-emerald-500/50",
      error: "bg-rose-950/90 text-rose-300 border-rose-500/50",
      info: "bg-slate-900/95 text-slate-200 border-indigo-500/50",
    };
    const icons = {
      success: '<i class="fa-solid fa-circle-check text-emerald-400"></i>',
      error: '<i class="fa-solid fa-circle-exclamation text-rose-400"></i>',
      info: '<i class="fa-solid fa-circle-info text-indigo-400"></i>',
    };

    toast.className = `toast-animate flex items-center gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl text-sm font-medium ${colors[type] || colors.info}`;
    toast.innerHTML = `
      ${icons[type] || icons.info}
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(10px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  window.showToast = showToast;
});
