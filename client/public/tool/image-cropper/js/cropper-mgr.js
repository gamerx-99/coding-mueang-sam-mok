/**
 * Phase 1: Interactive Manual Cropper Manager
 * Handles Cropper.js initialization, toolbar transformations, live side preview, and export.
 */
class CropperManager {
  constructor(options = {}) {
    this.imageElement = options.imageElement || document.getElementById('cropperImage');
    this.previewElement = options.previewElement || document.getElementById('manualPreviewCanvas');
    this.infoElement = options.infoElement || document.getElementById('manualCropInfo');
    this.cropper = null;
    this.currentBlob = null;
    this.currentFormat = 'png';
    this.currentQuality = 0.92;
    this.aspectRatio = NaN; // Free
    this.rotation = 0;
    this.scaleX = 1;
    this.scaleY = 1;
  }

  init(imageSrc) {
    if (this.cropper) {
      this.cropper.destroy();
      this.cropper = null;
    }

    this.rotation = 0;
    this.scaleX = 1;
    this.scaleY = 1;

    this.imageElement.src = imageSrc;
    this.imageElement.onload = () => {
      this.cropper = new Cropper(this.imageElement, {
        aspectRatio: this.aspectRatio,
        viewMode: 1, // Restrict crop box within canvas
        dragMode: 'move',
        autoCropArea: 0.85,
        restore: false,
        guides: true,
        center: true,
        highlight: true,
        cropBoxMovable: true,
        cropBoxResizable: true,
        toggleDragModeOnDblclick: true,
        ready: () => {
          this.updatePreview();
        },
        crop: () => {
          this.updatePreviewDebounced();
        }
      });
    };
  }

  updatePreviewDebounced() {
    if (this._debounceTimer) clearTimeout(this._debounceTimer);
    this._debounceTimer = setTimeout(() => this.updatePreview(), 50);
  }

  updatePreview() {
    if (!this.cropper) return;
    const canvas = this.cropper.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high'
    });
    if (!canvas) return;

    if (this.previewElement) {
      const pCtx = this.previewElement.getContext('2d');
      this.previewElement.width = canvas.width;
      this.previewElement.height = canvas.height;
      pCtx.clearRect(0, 0, canvas.width, canvas.height);
      pCtx.drawImage(canvas, 0, 0);
    }

    if (this.infoElement) {
      const w = canvas.width;
      const h = canvas.height;
      const estSize = Math.round((w * h * 4) / 1024); // KB rough estimate
      this.infoElement.innerHTML = `
        <span class="inline-flex items-center gap-1"><i class="fa-solid fa-expand text-indigo-400"></i> ${w} × ${h} px</span>
        <span class="text-slate-400">|</span>
        <span class="inline-flex items-center gap-1"><i class="fa-solid fa-file-image text-emerald-400"></i> ~${estSize > 1024 ? (estSize / 1024).toFixed(1) + ' MB' : estSize + ' KB'}</span>
      `;
    }
  }

  setAspectRatio(ratio) {
    this.aspectRatio = ratio;
    if (this.cropper) {
      this.cropper.setAspectRatio(ratio);
    }
  }

  zoom(factor) {
    if (this.cropper) this.cropper.zoom(factor);
  }

  rotate(degree) {
    if (this.cropper) {
      this.cropper.rotate(degree);
      this.rotation = (this.rotation + degree) % 360;
    }
  }

  rotateTo(exactDegree) {
    if (this.cropper) {
      const diff = exactDegree - this.rotation;
      this.cropper.rotate(diff);
      this.rotation = exactDegree;
    }
  }

  flipH() {
    if (this.cropper) {
      this.scaleX = -this.scaleX;
      this.cropper.scaleX(this.scaleX);
    }
  }

  flipV() {
    if (this.cropper) {
      this.scaleY = -this.scaleY;
      this.cropper.scaleY(this.scaleY);
    }
  }

  reset() {
    if (this.cropper) {
      this.cropper.reset();
      this.rotation = 0;
      this.scaleX = 1;
      this.scaleY = 1;
      this.updatePreview();
    }
  }

  getCroppedCanvas(format = 'png') {
    if (!this.cropper) return null;
    const canvas = this.cropper.getCroppedCanvas({
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
      fillColor: format === 'jpeg' ? '#ffffff' : 'transparent'
    });
    return canvas;
  }

  async getCroppedBlob(format = 'image/png', quality = 0.92) {
    const canvas = this.getCroppedCanvas(format.includes('jpeg') ? 'jpeg' : 'png');
    if (!canvas) return null;
    return new Promise(resolve => canvas.toBlob(resolve, format, quality));
  }

  async downloadCrop(filename = 'cropped_image', format = 'png', quality = 0.92) {
    const mimeType = format === 'jpg' || format === 'jpeg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
    const ext = format === 'jpeg' ? 'jpg' : format;
    const blob = await this.getCroppedBlob(mimeType, quality);
    if (blob && window.saveAs) {
      window.saveAs(blob, `${filename}.${ext}`);
    }
  }
}

window.CropperManager = CropperManager;
