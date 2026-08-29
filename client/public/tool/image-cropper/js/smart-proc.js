/**
 * Phase 3: Smart Processing, Fragment Merging, Auto Naming & Batch Export
 * Implements Proximity Clustering, Noise Filtering, Template Naming, and JSZip packaging.
 */
class SmartProcessor {
  /**
   * Filters and merges raw detected bounding boxes
   */
  static processBoxes(rawBoxes, config, imgWidth, imgHeight) {
    if (!rawBoxes || rawBoxes.length === 0) return [];

    // 1. Smart Noise Filter
    const minW = parseInt(config.minWidth) || 0;
    const minH = parseInt(config.minHeight) || 0;
    const minPx = parseInt(config.minPixels) || 0;

    let filtered = rawBoxes.filter(box => {
      const w = box.maxX - box.minX + 1;
      const h = box.maxY - box.minY + 1;
      if (w < minW || h < minH) return false;
      if (box.pixelCount && box.pixelCount < minPx) return false;
      return true;
    });

    if (filtered.length === 0) return [];

    // 2. Fragment Merging (Proximity Clustering)
    if (config.autoMerge && config.mergeDistance > 0) {
      filtered = this.clusterProximityBoxes(filtered, config.mergeDistance);
    }

    // 3. Sort boxes (Top to Bottom, Left to Right)
    filtered.sort((a, b) => {
      const rowDiff = a.minY - b.minY;
      if (Math.abs(rowDiff) > 20) return rowDiff;
      return a.minX - b.minX;
    });

    // 4. Re-assign sequential IDs and calculate dimensions
    return filtered.map((box, index) => ({
      ...box,
      id: index + 1,
      width: box.maxX - box.minX + 1,
      height: box.maxY - box.minY + 1,
    }));
  }

  /**
   * Proximity Clustering Algorithm
   * Merges bounding boxes if the distance between them is within mergeDistance
   */
  static clusterProximityBoxes(boxes, maxDistance) {
    let currentBoxes = boxes.map(b => ({ ...b }));
    let mergedSomething = true;

    while (mergedSomething) {
      mergedSomething = false;
      const nextBoxes = [];
      const visited = new Uint8Array(currentBoxes.length);

      for (let i = 0; i < currentBoxes.length; i++) {
        if (visited[i]) continue;
        visited[i] = 1;

        let cur = { ...currentBoxes[i] };

        for (let j = i + 1; j < currentBoxes.length; j++) {
          if (visited[j]) continue;
          const other = currentBoxes[j];

          // Calculate horizontal and vertical gap
          const gapX = Math.max(
            0,
            Math.max(cur.minX, other.minX) - Math.min(cur.maxX, other.maxX)
          );
          const gapY = Math.max(
            0,
            Math.max(cur.minY, other.minY) - Math.min(cur.maxY, other.maxY)
          );
          const distance = Math.max(gapX, gapY); // Chebyshev / Box distance

          if (distance <= maxDistance) {
            // Merge box 'other' into 'cur'
            cur.minX = Math.min(cur.minX, other.minX);
            cur.minY = Math.min(cur.minY, other.minY);
            cur.maxX = Math.max(cur.maxX, other.maxX);
            cur.maxY = Math.max(cur.maxY, other.maxY);
            cur.pixelCount = (cur.pixelCount || 0) + (other.pixelCount || 0);

            visited[j] = 1;
            mergedSomething = true;
          }
        }
        nextBoxes.push(cur);
      }
      currentBoxes = nextBoxes;
    }

    return currentBoxes;
  }

  /**
   * Generate dynamic file name from template
   * Tokens: {prefix}, {index}, {pad2}, {pad3}, {w}, {h}
   */
  static formatFileName(template, prefix, index, width, height) {
    const pad2 = String(index).padStart(2, "0");
    const pad3 = String(index).padStart(3, "0");
    const cleanPrefix = (prefix || "character")
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "_");

    let name = template || "{prefix}_{pad2}";
    name = name
      .replace(/{prefix}/gi, cleanPrefix)
      .replace(/{index}/gi, String(index))
      .replace(/{pad2}/gi, pad2)
      .replace(/{pad3}/gi, pad3)
      .replace(/{w}/gi, String(width))
      .replace(/{h}/gi, String(height));

    return name;
  }

  /**
   * Export multiple canvases to a ZIP file using JSZip
   */
  static async exportToZip(boxes, options = {}, onProgress = null) {
    if (!boxes || boxes.length === 0) throw new Error("No items to export");
    if (typeof JSZip === "undefined")
      throw new Error("JSZip library is not loaded");

    const zip = new JSZip();
    const folderName = (options.zipFolderName || options.prefix || "sprites")
      .trim()
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const folder = zip.folder(folderName);

    const template = options.namingTemplate || "{prefix}_{pad2}";
    const prefix = options.prefix || "sprite";
    const format = options.format || "png";
    const ext = format === "jpeg" ? "jpg" : format;
    const mimeType =
      format === "jpeg"
        ? "image/jpeg"
        : format === "webp"
          ? "image/webp"
          : "image/png";
    const quality = options.quality || 0.92;

    const total = boxes.length;
    for (let i = 0; i < total; i++) {
      const box = boxes[i];
      const filename =
        box.customName ||
        this.formatFileName(
          template,
          prefix,
          i + 1,
          box.cropWidth,
          box.cropHeight
        );

      if (box.cropCanvas) {
        const blob = await new Promise(resolve =>
          box.cropCanvas.toBlob(resolve, mimeType, quality)
        );
        if (blob) {
          folder.file(`${filename}.${ext}`, blob);
        }
      }

      if (onProgress) {
        onProgress(Math.round(((i + 1) / total) * 100), i + 1, total);
      }
    }

    const zipBlob = await zip.generateAsync({ type: "blob" }, metadata => {
      if (onProgress) {
        onProgress(Math.round(metadata.percent), total, total);
      }
    });

    if (window.saveAs) {
      window.saveAs(zipBlob, `${folderName}_all.zip`);
    }

    return zipBlob;
  }
}

if (typeof window !== "undefined") {
  window.SmartProcessor = SmartProcessor;
}
