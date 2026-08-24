/**
 * Phase 2: Real Auto Crop & Sprite/Character Extractor
 * Includes Alpha Detection, Solid Background Removal, Connected Component Labeling (CCL),
 * Output Scaling (1x, 2x, 3x, 4x Pixel Art Upscale) and Canvas Visual Overlay with interactive resize handles.
 */
class AutoCropEngine {
  constructor() {
    this.sourceCanvas = document.createElement('canvas');
    this.sourceCtx = this.sourceCanvas.getContext('2d', { willReadFrequently: true });
    this.detectedBoxes = [];
    this.processedBoxes = []; // After filter & merge
    this.sourceImage = null;
    this.width = 0;
    this.height = 0;

    // Config defaults
    this.config = {
      alphaThreshold: 10,        // 0-255: Alpha value above this considered solid
      bgRemovalMode: 'smart_auto', // 'smart_auto', 'alpha', 'white_bg', 'black_bg', 'auto_corner', 'custom_color'
      customBgColor: '#ffffff',  // Hex for solid background
      colorTolerance: 30,        // 0-255 color distance tolerance
      padding: 0,                // Extra transparent padding around each crop (px)
      scaleFactor: 1,            // Output scale multiplier: 1x, 2x, 3x, 4x, 0.5x
      scalingAlgorithm: 'pixelated', // 'pixelated' (crisp pixel art) or 'smooth'
      minWidth: 10,              // Smart filter min width (Phase 3)
      minHeight: 10,             // Smart filter min height (Phase 3)
      minPixels: 50,             // Smart filter min total solid pixels (Phase 3)
      mergeDistance: 15,         // Proximity cluster merge threshold (Phase 3)
      autoMerge: false           // Proximity merging disabled by default (Phase 3)
    };
    this.detectedBgProfile = null;
  }

  setImage(imageElement) {
    this.sourceImage = imageElement;
    this.width = imageElement.naturalWidth || imageElement.width;
    this.height = imageElement.naturalHeight || imageElement.height;
    this.sourceCanvas.width = this.width;
    this.sourceCanvas.height = this.height;
    this.sourceCtx.clearRect(0, 0, this.width, this.height);
    this.sourceCtx.drawImage(imageElement, 0, 0);
  }

  hexToRgb(hex) {
    if (!hex) return { r: 255, g: 255, b: 255 };
    const clean = hex.replace('#', '');
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  /**
   * Analyzes image corners, edges, and alpha to determine if it has transparency or solid background
   */
  detectImageBackgroundProfile(imgData, width, height) {
    const data = imgData.data;
    const samplePoints = [
      0, // Top-Left
      Math.floor(width / 2) * 4, // Top-Center
      (width - 1) * 4, // Top-Right
      Math.floor(height / 2) * width * 4, // Mid-Left
      (Math.floor(height / 2) * width + (width - 1)) * 4, // Mid-Right
      ((height - 1) * width) * 4, // Bottom-Left
      ((height - 1) * width + Math.floor(width / 2)) * 4, // Bottom-Center
      ((height - 1) * width + (width - 1)) * 4 // Bottom-Right
    ];

    let transparentSamples = 0;
    let rSum = 0, gSum = 0, bSum = 0, opaqueCount = 0;

    for (const idx of samplePoints) {
      const a = data[idx + 3];
      if (a < 20) {
        transparentSamples++;
      } else {
        rSum += data[idx];
        gSum += data[idx + 1];
        bSum += data[idx + 2];
        opaqueCount++;
      }
    }

    const isTransparent = transparentSamples >= 2;
    const avgR = opaqueCount > 0 ? Math.round(rSum / opaqueCount) : 255;
    const avgG = opaqueCount > 0 ? Math.round(gSum / opaqueCount) : 255;
    const avgB = opaqueCount > 0 ? Math.round(bSum / opaqueCount) : 255;

    let dominantType = 'custom';
    if (avgR > 235 && avgG > 235 && avgB > 235) {
      dominantType = 'white';
    } else if (avgR < 25 && avgG < 25 && avgB < 25) {
      dominantType = 'black';
    }

    return {
      isTransparent,
      dominantColor: { r: avgR, g: avgG, b: avgB },
      dominantType,
      hex: '#' + ((1 << 24) + (avgR << 16) + (avgG << 8) + avgB).toString(16).slice(1)
    };
  }

  detectCornerColor(imgData, width, height) {
    const data = imgData.data;
    const corners = [
      0, // Top-left
      (width - 1) * 4, // Top-right
      ((height - 1) * width) * 4, // Bottom-left
      ((height - 1) * width + (width - 1)) * 4 // Bottom-right
    ];
    let r = 0, g = 0, b = 0, count = 0;
    for (const idx of corners) {
      if (data[idx + 3] > 0) { // If not transparent
        r += data[idx];
        g += data[idx + 1];
        b += data[idx + 2];
        count++;
      }
    }
    if (count === 0) return { r: 255, g: 255, b: 255 }; // Default white
    return {
      r: Math.round(r / count),
      g: Math.round(g / count),
      b: Math.round(b / count)
    };
  }

  getTargetBgColor(imgData, width, height) {
    const mode = this.config.bgRemovalMode;
    if (mode === 'alpha') return null;
    if (mode === 'white_bg') return { r: 255, g: 255, b: 255 };
    if (mode === 'black_bg') return { r: 0, g: 0, b: 0 };
    if (mode === 'custom_color') return this.hexToRgb(this.config.customBgColor);
    if (mode === 'auto_corner') return this.detectCornerColor(imgData, width, height);

    // 'smart_auto' mode:
    const profile = this.detectImageBackgroundProfile(imgData, width, height);
    this.detectedBgProfile = profile;
    if (profile.isTransparent) {
      return null; // Alpha transparency is sufficient
    }
    return profile.dominantColor;
  }

  /**
   * Run Connected Component Labeling (CCL) with Alpha and Background detection
   */
  async analyze(userConfig = {}) {
    this.config = { ...this.config, ...userConfig };
    if (!this.sourceImage || this.width === 0 || this.height === 0) return [];

    const width = this.width;
    const height = this.height;
    const imgData = this.sourceCtx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const targetBg = this.getTargetBgColor(imgData, width, height);
    this.currentTargetBg = targetBg;

    const alphaThresh = this.config.alphaThreshold;
    const colorTolSq = this.config.colorTolerance * this.config.colorTolerance * 3;

    // Step 1: Create binary foreground mask
    const mask = new Uint8Array(width * height);
    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = (rowOffset + x) * 4;
        const a = data[idx + 3];

        if (a < alphaThresh) {
          mask[rowOffset + x] = 0; // Transparent
          continue;
        }

        if (targetBg) {
          const dr = data[idx] - targetBg.r;
          const dg = data[idx + 1] - targetBg.g;
          const db = data[idx + 2] - targetBg.b;
          const distSq = dr * dr + dg * dg + db * db;
          if (distSq <= colorTolSq) {
            mask[rowOffset + x] = 0; // Considered background
            continue;
          }
        }

        mask[rowOffset + x] = 1; // Solid foreground pixel
      }
    }

    // Step 2: Connected Component Labeling using Two-Pass Disjoint-Set (Union-Find)
    const labels = new Int32Array(width * height);
    const parent = [];
    const minXArr = [];
    const minYArr = [];
    const maxXArr = [];
    const maxYArr = [];
    const pixelCountArr = [];

    function find(i) {
      let root = i;
      while (root !== parent[root]) {
        root = parent[root];
      }
      let curr = i;
      while (curr !== root) {
        let nxt = parent[curr];
        parent[curr] = root;
        curr = nxt;
      }
      return root;
    }

    function union(i, j) {
      const rootI = find(i);
      const rootJ = find(j);
      if (rootI !== rootJ) {
        parent[rootJ] = rootI;
        minXArr[rootI] = Math.min(minXArr[rootI], minXArr[rootJ]);
        minYArr[rootI] = Math.min(minYArr[rootI], minYArr[rootJ]);
        maxXArr[rootI] = Math.max(maxXArr[rootI], maxXArr[rootJ]);
        maxYArr[rootI] = Math.max(maxYArr[rootI], maxYArr[rootJ]);
        pixelCountArr[rootI] += pixelCountArr[rootJ];
      }
      return rootI;
    }

    let nextLabel = 1;

    for (let y = 0; y < height; y++) {
      const rowOffset = y * width;
      for (let x = 0; x < width; x++) {
        const idx = rowOffset + x;
        if (mask[idx] === 0) continue;

        let neighborLabels = [];
        if (y > 0 && x > 0 && mask[idx - width - 1] > 0) neighborLabels.push(labels[idx - width - 1]);
        if (y > 0 && mask[idx - width] > 0) neighborLabels.push(labels[idx - width]);
        if (y > 0 && x < width - 1 && mask[idx - width + 1] > 0) neighborLabels.push(labels[idx - width + 1]);
        if (x > 0 && mask[idx - 1] > 0) neighborLabels.push(labels[idx - 1]);

        if (neighborLabels.length === 0) {
          const lbl = nextLabel++;
          parent[lbl] = lbl;
          minXArr[lbl] = x;
          minYArr[lbl] = y;
          maxXArr[lbl] = x;
          maxYArr[lbl] = y;
          pixelCountArr[lbl] = 1;
          labels[idx] = lbl;
        } else {
          let root = find(neighborLabels[0]);
          for (let k = 1; k < neighborLabels.length; k++) {
            root = union(root, neighborLabels[k]);
          }
          labels[idx] = root;
          minXArr[root] = Math.min(minXArr[root], x);
          minYArr[root] = Math.min(minYArr[root], y);
          maxXArr[root] = Math.max(maxXArr[root], x);
          maxYArr[root] = Math.max(maxYArr[root], y);
          pixelCountArr[root]++;
        }
      }
    }

    // Step 3: Extract Raw Bounding Boxes
    const rootsMap = new Map();
    for (let i = 1; i < nextLabel; i++) {
      const root = find(i);
      if (!rootsMap.has(root)) {
        rootsMap.set(root, {
          minX: minXArr[root],
          minY: minYArr[root],
          maxX: maxXArr[root],
          maxY: maxYArr[root],
          pixelCount: pixelCountArr[root]
        });
      }
    }

    const rawBoxes = [];
    let boxIndex = 1;
    for (const [_, b] of rootsMap.entries()) {
      const w = b.maxX - b.minX + 1;
      const h = b.maxY - b.minY + 1;
      rawBoxes.push({
        id: boxIndex++,
        minX: b.minX,
        minY: b.minY,
        maxX: b.maxX,
        maxY: b.maxY,
        width: w,
        height: h,
        pixelCount: b.pixelCount,
        selected: false
      });
    }

    this.detectedBoxes = rawBoxes;

    // Apply Phase 3 Smart Processing: Filter & Proximity Clustering
    this.processedBoxes = SmartProcessor.processBoxes(rawBoxes, this.config, width, height);

    // Render cropped canvases for preview
    this.generateCropThumbnails();

    return this.processedBoxes;
  }

  /**
   * Generates cropped preview Canvas object for a single box
   */
  generateSingleCropThumbnail(box) {
    if (!box) return;
    const pad = Math.max(0, parseInt(this.config.padding) || 0);
    const scale = parseFloat(this.config.scaleFactor) || 1.0;
    const isPixelated = this.config.scalingAlgorithm === 'pixelated';

    const x = Math.max(0, box.minX - pad);
    const y = Math.max(0, box.minY - pad);
    const rawW = Math.max(1, Math.min(this.width - x, (box.maxX - box.minX + 1) + pad * 2));
    const rawH = Math.max(1, Math.min(this.height - y, (box.maxY - box.minY + 1) + pad * 2));

    const rawCanvas = document.createElement('canvas');
    rawCanvas.width = rawW;
    rawCanvas.height = rawH;
    const rawCtx = rawCanvas.getContext('2d');
    rawCtx.drawImage(this.sourceCanvas, x, y, rawW, rawH, 0, 0, rawW, rawH);

    if (this.currentTargetBg) {
      const cropImgData = rawCtx.getImageData(0, 0, rawW, rawH);
      const d = cropImgData.data;
      const targetBg = this.currentTargetBg;
      const colorTolSq = this.config.colorTolerance * this.config.colorTolerance * 3;

      for (let i = 0; i < d.length; i += 4) {
        if (d[i + 3] < this.config.alphaThreshold) continue;
        const dr = d[i] - targetBg.r;
        const dg = d[i + 1] - targetBg.g;
        const db = d[i + 2] - targetBg.b;
        if (dr * dr + dg * dg + db * db <= colorTolSq) {
          d[i + 3] = 0;
        }
      }
      rawCtx.putImageData(cropImgData, 0, 0);
    }

    const outW = Math.max(1, Math.round(rawW * scale));
    const outH = Math.max(1, Math.round(rawH * scale));

    const outCanvas = document.createElement('canvas');
    outCanvas.width = outW;
    outCanvas.height = outH;
    const outCtx = outCanvas.getContext('2d');

    outCtx.imageSmoothingEnabled = !isPixelated;
    if (!isPixelated) {
      outCtx.imageSmoothingQuality = 'high';
    }
    outCtx.drawImage(rawCanvas, 0, 0, rawW, rawH, 0, 0, outW, outH);

    box.cropCanvas = outCanvas;
    box.cropWidth = outW;
    box.cropHeight = outH;
    box.originalCropWidth = rawW;
    box.originalCropHeight = rawH;
    box.width = box.maxX - box.minX + 1;
    box.height = box.maxY - box.minY + 1;
  }

  /**
   * Generates cropped preview Canvas objects for all processed boxes with Output Scaling
   */
  generateCropThumbnails() {
    for (const box of this.processedBoxes) {
      this.generateSingleCropThumbnail(box);
    }
  }

  /**
   * Get 8 handle locations for a bounding box
   */
  getHandlePositions(box, pad = 0) {
    const x = Math.max(0, box.minX - pad);
    const y = Math.max(0, box.minY - pad);
    const w = Math.max(1, Math.min(this.width - x, (box.maxX - box.minX + 1) + pad * 2));
    const h = Math.max(1, Math.min(this.height - y, (box.maxY - box.minY + 1) + pad * 2));

    const cx = x + w / 2;
    const cy = y + h / 2;

    return {
      nw: { x: x, y: y, cursor: 'nwse-resize' },
      n:  { x: cx, y: y, cursor: 'ns-resize' },
      ne: { x: x + w, y: y, cursor: 'nesw-resize' },
      e:  { x: x + w, y: cy, cursor: 'ew-resize' },
      se: { x: x + w, y: y + h, cursor: 'nwse-resize' },
      s:  { x: cx, y: y + h, cursor: 'ns-resize' },
      sw: { x: x, y: y + h, cursor: 'nesw-resize' },
      w:  { x: x, y: cy, cursor: 'ew-resize' }
    };
  }

  /**
   * Draw bounding box overlays on the main canvas
   */
  drawOverlays(overlayCanvas, hoveredBoxId = null, selectedIds = []) {
    if (!overlayCanvas || !this.sourceImage) return;

    overlayCanvas.width = this.width;
    overlayCanvas.height = this.height;
    const ctx = overlayCanvas.getContext('2d');
    ctx.clearRect(0, 0, this.width, this.height);

    const pad = Math.max(0, parseInt(this.config.padding) || 0);

    for (const box of this.processedBoxes) {
      const x = Math.max(0, box.minX - pad);
      const y = Math.max(0, box.minY - pad);
      const w = Math.max(1, Math.min(this.width - x, (box.maxX - box.minX + 1) + pad * 2));
      const h = Math.max(1, Math.min(this.height - y, (box.maxY - box.minY + 1) + pad * 2));

      const isHovered = hoveredBoxId === box.id;
      const isSelected = selectedIds.includes(box.id) || box.selected;

      // Box border styling
      if (isSelected) {
        ctx.strokeStyle = '#f59e0b'; // Amber / Orange
        ctx.lineWidth = 3;
        ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';
      } else if (isHovered) {
        ctx.strokeStyle = '#38bdf8'; // Cyan
        ctx.lineWidth = 2.5;
        ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      } else {
        ctx.strokeStyle = '#6366f1'; // Indigo
        ctx.lineWidth = 1.5;
        ctx.fillStyle = 'rgba(99, 102, 241, 0.08)';
      }

      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);

      // If selected, draw 8 prominent resize handles
      if (isSelected) {
        const handleSize = 10;
        const half = handleSize / 2;
        const handles = this.getHandlePositions(box, pad);

        for (const [key, pos] of Object.entries(handles)) {
          // Outer shadow/border for high contrast
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(pos.x - half - 1, pos.y - half - 1, handleSize + 2, handleSize + 2);

          // Handle fill (White center)
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(pos.x - half, pos.y - half, handleSize, handleSize);

          // Inner accent border
          ctx.strokeStyle = '#b45309';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(pos.x - half, pos.y - half, handleSize, handleSize);
        }
      }

      // Draw Badge / Tag
      const scale = parseFloat(this.config.scaleFactor) || 1;
      const displayW = box.cropWidth || Math.round(w * scale);
      const displayH = box.cropHeight || Math.round(h * scale);
      const tagText = `#${box.id} (${w}×${h}${scale !== 1 ? ' ➔ ' + displayW + '×' + displayH : ''})`;
      ctx.font = 'bold 12px Inter, sans-serif';
      const textMetrics = ctx.measureText(tagText);
      const badgeW = textMetrics.width + 12;
      const badgeH = 22;

      const badgeX = Math.min(Math.max(0, x), Math.max(0, this.width - badgeW));
      const badgeY = y >= badgeH ? y - badgeH : y;

      ctx.fillStyle = isSelected ? '#d97706' : isHovered ? '#0284c7' : '#4338ca';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, [4, 4, 0, 0]);
      } else {
        ctx.rect(badgeX, badgeY, badgeW, badgeH);
      }
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.fillText(tagText, badgeX + 6, badgeY + 15);
    }
  }

  deleteBox(boxId) {
    this.processedBoxes = this.processedBoxes.filter(b => b.id !== boxId);
  }

  mergeSelectedBoxes(selectedIds) {
    if (!selectedIds || selectedIds.length < 2) return;
    const toMerge = this.processedBoxes.filter(b => selectedIds.includes(b.id));
    if (toMerge.length < 2) return;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, totalPixels = 0;
    for (const b of toMerge) {
      minX = Math.min(minX, b.minX);
      minY = Math.min(minY, b.minY);
      maxX = Math.max(maxX, b.maxX);
      maxY = Math.max(maxY, b.maxY);
      totalPixels += b.pixelCount || 0;
    }

    const newId = Math.min(...toMerge.map(b => b.id));
    const mergedBox = {
      id: newId,
      minX,
      minY,
      maxX,
      maxY,
      width: maxX - minX + 1,
      height: maxY - minY + 1,
      pixelCount: totalPixels,
      selected: false
    };

    this.processedBoxes = this.processedBoxes.filter(b => !selectedIds.includes(b.id));
    this.processedBoxes.push(mergedBox);
    this.processedBoxes.sort((a, b) => a.id - b.id);
    this.generateCropThumbnails();
  }
}

if (typeof window !== 'undefined') {
  window.AutoCropEngine = AutoCropEngine;
}
