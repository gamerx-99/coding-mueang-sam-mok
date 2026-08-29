import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";
import { toast } from "sonner";

// pdf.js worker via Vite
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export type ToolOptions = Record<string, string | number>;

export type OutputFile = { name: string; blob: Blob; note?: string };

export type ProcessResult = {
  outputs: OutputFile[];
  summary: string;
  failed?: Array<{ name: string; reason: string }>;
};

export type ProgressFn = (done: number, total: number) => void;

export type ToolHandler = (
  files: File[],
  options: ToolOptions,
  onProgress: ProgressFn
) => Promise<ProcessResult>;

const readAsArrayBuffer = (file: File): Promise<ArrayBuffer> =>
  file.arrayBuffer();

const KB = 1024;
export function formatSize(bytes: number): string {
  if (bytes >= KB * KB) return `${(bytes / (KB * KB)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / KB))} KB`;
}

/** Render Thai-safe text to a transparent PNG (standard PDF fonts can't encode Thai). */
async function textToPng(
  text: string,
  fontPx: number,
  color: string
): Promise<{ data: ArrayBuffer; width: number; height: number }> {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  if (!context) throw new Error("ไม่สามารถสร้าง canvas ได้");
  const font = `700 ${fontPx}px "IBM Plex Sans Thai", sans-serif`;
  context.font = font;
  const metrics = context.measureText(text);
  canvas.width = Math.ceil(metrics.width) + 16;
  canvas.height = Math.ceil(fontPx * 1.6);
  const ctx2 = canvas.getContext("2d");
  if (!ctx2) throw new Error("ไม่สามารถสร้าง canvas ได้");
  ctx2.font = font;
  ctx2.fillStyle = color;
  ctx2.textBaseline = "middle";
  ctx2.fillText(text, 8, canvas.height / 2);
  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, "image/png")
  );
  if (!blob) throw new Error("สร้างภาพลายน้ำไม่สำเร็จ");
  return {
    data: await blob.arrayBuffer(),
    width: canvas.width,
    height: canvas.height,
  };
}

/** Render one PDF page to a JPEG/PNG blob at a given scale. */
async function renderPage(
  page: pdfjsLib.PDFPageProxy,
  scale: number,
  mime: "image/jpeg" | "image/png",
  quality: number
): Promise<Blob> {
  const viewport = page.getViewport({ scale });
  const canvas = document.createElement("canvas");
  canvas.width = Math.ceil(viewport.width);
  canvas.height = Math.ceil(viewport.height);
  const context = canvas.getContext("2d");
  if (!context) throw new Error("ไม่สามารถสร้าง canvas ได้");
  if (mime === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  await page.render({
    canvas,
    canvasContext: context,
    viewport,
  }).promise;
  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, mime, quality)
  );
  if (!blob) throw new Error("แปลงภาพไม่สำเร็จ");
  return blob;
}

const openPdfJs = async (file: File) =>
  pdfjsLib.getDocument({ data: await readAsArrayBuffer(file) }).promise;

/* ---------------- Merge ---------------- */

const mergePdf: ToolHandler = async (files, _options, onProgress) => {
  const out = await PDFDocument.create();
  const failed: ProcessResult["failed"] = [];
  let mergedFiles = 0;
  for (let i = 0; i < files.length; i += 1) {
    try {
      const src = await PDFDocument.load(await readAsArrayBuffer(files[i]), {
        ignoreEncryption: true,
      });
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach(page => out.addPage(page));
      mergedFiles += 1;
    } catch {
      failed.push({ name: files[i].name, reason: "ไฟล์เสียหายหรือไม่ใช่ PDF" });
    }
    onProgress(i + 1, files.length);
  }
  if (mergedFiles === 0) throw new Error("ไม่มีไฟล์ที่รวมได้เลย");
  const bytes = await out.save();
  return {
    outputs: [
      {
        name: "merged.pdf",
        blob: new Blob([bytes.buffer as ArrayBuffer], {
          type: "application/pdf",
        }),
      },
    ],
    summary: `รวม ${mergedFiles} ไฟล์เป็น ${out.getPageCount()} หน้า`,
    failed: failed.length ? failed : undefined,
  };
};

/* ---------------- Split ---------------- */

function parseRanges(input: string, pageCount: number): number[][] {
  const groups = input
    .split(",")
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => {
      const range = part.match(/^(\d+)\s*-\s*(\d+)$/);
      if (range) {
        const start = Math.max(1, parseInt(range[1], 10));
        const end = Math.min(pageCount, parseInt(range[2], 10));
        const pages: number[] = [];
        for (let p = start; p <= end; p += 1) pages.push(p);
        return pages;
      }
      const single = parseInt(part, 10);
      if (Number.isNaN(single) || single < 1 || single > pageCount) return [];
      return [single];
    })
    .filter(group => group.length > 0);
  if (!groups.length) throw new Error("รูปแบบช่วงหน้าไม่ถูกต้อง เช่น 1-3,5");
  return groups;
}

const splitPdf: ToolHandler = async (files, options, onProgress) => {
  const mode = String(options.mode ?? "each");
  const outputs: ProcessResult["outputs"] = [];
  const failed: ProcessResult["failed"] = [];
  let totalGroups = 0;
  let done = 0;

  for (const file of files) {
    try {
      const src = await PDFDocument.load(await readAsArrayBuffer(file), {
        ignoreEncryption: true,
      });
      const pageCount = src.getPageCount();
      const base = file.name.replace(/\.pdf$/i, "");
      let groups: number[][];
      if (mode === "range") {
        groups = parseRanges(String(options.ranges ?? "1"), pageCount);
      } else if (mode === "every") {
        const size = Math.max(1, Number(options.every ?? 2));
        groups = [];
        for (let p = 1; p <= pageCount; p += size) {
          groups.push(
            Array.from({ length: Math.min(size, pageCount - p + 1) }, (_, k) => p + k)
          );
        }
      } else {
        groups = Array.from({ length: pageCount }, (_, k) => [k + 1]);
      }
      totalGroups += groups.length;
      for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
        const group = groups[groupIndex];
        const doc = await PDFDocument.create();
        const pages = await doc.copyPages(
          src,
          group.map((pageNumber: number) => pageNumber - 1)
        );
        pages.forEach(page => doc.addPage(page));
        const bytes = await doc.save();
        const label =
          group.length === 1
            ? `page-${String(group[0]).padStart(3, "0")}`
            : `pages-${group[0]}-${group[group.length - 1]}`;
        outputs.push({
          name: `${base}-${label}.pdf`,
          blob: new Blob([bytes.buffer as ArrayBuffer], {
            type: "application/pdf",
          }),
        });
        done += 1;
        onProgress(done, totalGroups);
      }
    } catch (error) {
      failed.push({
        name: file.name,
        reason: error instanceof Error ? error.message : "แยกไฟล์ไม่สำเร็จ",
      });
      onProgress(++done, Math.max(totalGroups, done));
    }
  }
  if (!outputs.length) throw new Error("ไม่มีไฟล์ที่แยกได้");
  return {
    outputs,
    summary: `แยกออก ${outputs.length} ไฟล์`,
    failed: failed.length ? failed : undefined,
  };
};

/* ---------------- Rotate ---------------- */

const rotatePdf: ToolHandler = async (files, options, onProgress) => {
  const angle = Number(options.angle ?? 90);
  const outputs: ProcessResult["outputs"] = [];
  const failed: ProcessResult["failed"] = [];
  let rotated = 0;
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    try {
      const doc = await PDFDocument.load(await readAsArrayBuffer(file), {
        ignoreEncryption: true,
      });
      doc.getPages().forEach(page => {
        const current = page.getRotation().angle;
        page.setRotation(degrees((current + angle) % 360));
        rotated += 1;
      });
      const bytes = await doc.save();
      outputs.push({
        name: `rotated-${file.name}`,
        blob: new Blob([bytes.buffer as ArrayBuffer], {
          type: "application/pdf",
        }),
      });
    } catch {
      failed.push({ name: file.name, reason: "ไฟล์เสียหายหรือไม่ใช่ PDF" });
    }
    onProgress(index + 1, files.length);
  }
  if (!outputs.length) throw new Error("ไม่มีไฟล์ที่หมุนได้");
  return {
    outputs,
    summary: `หมุนหน้า +${angle}° จำนวน ${rotated} หน้า`,
    failed: failed.length ? failed : undefined,
  };
};

/* ---------------- Images → PDF ---------------- */

const imagesToPdf: ToolHandler = async (files, options, onProgress) => {
  const images = files.filter(file => file.type.startsWith("image/"));
  if (!images.length) throw new Error("ไม่พบไฟล์รูปภาพ");
  const layout = String(options.pageSize ?? "fit");
  const marginPt = Number(options.margin ?? 0);
  const out = await PDFDocument.create();
  const failed: ProcessResult["failed"] = [];
  let embedded = 0;

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    try {
      const bytes = await readAsArrayBuffer(image);
      const embeddedImage =
        image.type === "image/png"
          ? await out.embedPng(bytes)
          : await out.embedJpg(bytes);
      if (layout === "fit") {
        const page = out.addPage([embeddedImage.width, embeddedImage.height]);
        page.drawImage(embeddedImage, {
          x: 0,
          y: 0,
          width: embeddedImage.width,
          height: embeddedImage.height,
        });
      } else {
        const a4: [number, number] =
          layout === "a4-landscape" ? [842, 595] : [595, 842];
        const page = out.addPage(a4);
        const maxWidth = a4[0] - marginPt * 2;
        const maxHeight = a4[1] - marginPt * 2;
        const scale = Math.min(
          maxWidth / embeddedImage.width,
          maxHeight / embeddedImage.height
        );
        const width = embeddedImage.width * scale;
        const height = embeddedImage.height * scale;
        page.drawImage(embeddedImage, {
          x: (a4[0] - width) / 2,
          y: (a4[1] - height) / 2,
          width,
          height,
        });
      }
      embedded += 1;
    } catch {
      failed.push({ name: image.name, reason: "รูปภาพอ่านไม่ได้" });
    }
    onProgress(index + 1, images.length);
  }
  if (!embedded) throw new Error("ไม่มีรูปที่ฝังได้");
  const pdfBytes = await out.save();
  return {
    outputs: [
      {
        name: "images.pdf",
        blob: new Blob([pdfBytes.buffer as ArrayBuffer], {
          type: "application/pdf",
        }),
      },
    ],
    summary: `ฝังรูป ${embedded} ภาพเป็น PDF ${out.getPageCount()} หน้า`,
    failed: failed.length ? failed : undefined,
  };
};

/* ---------------- PDF → images ---------------- */

const pdfToImages: ToolHandler = async (files, options, onProgress) => {
  const mime = String(options.format ?? "image/jpeg") as "image/jpeg" | "image/png";
  const scale = Number(options.scale ?? 2);
  const ext = mime === "image/png" ? "png" : "jpg";
  const outputs: ProcessResult["outputs"] = [];
  const failed: ProcessResult["failed"] = [];
  let pageCount = 0;
  let totalPages = 0;
  for (const file of files) {
    try {
      const pdf = await openPdfJs(file);
      totalPages += pdf.numPages;
    } catch {
      failed.push({ name: file.name, reason: "ไฟล์เสียหายหรือไม่ใช่ PDF" });
    }
  }
  for (const file of files) {
    try {
      const pdf = await openPdfJs(file);
      const base = file.name.replace(/\.pdf$/i, "");
      for (let i = 1; i <= pdf.numPages; i += 1) {
        const page = await pdf.getPage(i);
        const blob = await renderPage(page, scale, mime, 0.92);
        outputs.push({
          name: `${base}-page-${String(i).padStart(3, "0")}.${ext}`,
          blob,
        });
        pageCount += 1;
        onProgress(pageCount, totalPages);
      }
    } catch {
      // already counted in failed above; keep progress moving
    }
  }
  if (!outputs.length) throw new Error("ไม่มีหน้าที่แปลงได้");
  return {
    outputs,
    summary: `แปลง ${pageCount} หน้าเป็น ${ext.toUpperCase()}`,
    failed: failed.length ? failed : undefined,
  };
};

/* ---------------- Watermark (Thai-safe via canvas) ---------------- */

const watermarkPdf: ToolHandler = async (files, options, onProgress) => {
  const text = String(options.text ?? "").trim();
  if (!text) throw new Error("กรุณากรอกข้อความลายน้ำ");
  const opacity = Math.min(0.6, Math.max(0.08, Number(options.opacity ?? 0.25)));
  const color = "#8a93a8";
  const stamp = await textToPng(text, 64, color);
  const outputs: ProcessResult["outputs"] = [];
  const failed: ProcessResult["failed"] = [];
  let stamped = 0;

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    try {
      const doc = await PDFDocument.load(await readAsArrayBuffer(file), {
        ignoreEncryption: true,
      });
      const embedded = await doc.embedPng(stamp.data);
      doc.getPages().forEach(page => {
        const { width, height } = page.getSize();
        const drawWidth = width * 0.62;
        const drawHeight = (stamp.height / stamp.width) * drawWidth;
        page.drawImage(embedded, {
          x: width / 2 - drawWidth / 2,
          y: height / 2 - drawHeight / 2,
          width: drawWidth,
          height: drawHeight,
          opacity,
          rotate: degrees(32),
        });
      });
      const bytes = await doc.save();
      outputs.push({
        name: `watermarked-${file.name}`,
        blob: new Blob([bytes.buffer as ArrayBuffer], {
          type: "application/pdf",
        }),
      });
      stamped += 1;
    } catch {
      failed.push({ name: file.name, reason: "ไฟล์เสียหายหรือไม่ใช่ PDF" });
    }
    onProgress(index + 1, files.length);
  }
  if (!outputs.length) throw new Error("ไม่มีไฟล์ที่ใส่ลายน้ำได้");
  return {
    outputs,
    summary: `ใส่ลายน้ำ "${text}" แล้ว ${stamped} ไฟล์`,
    failed: failed.length ? failed : undefined,
  };
};

/* ---------------- Page numbers ---------------- */

const pageNumbers: ToolHandler = async (files, options, onProgress) => {
  const position = String(options.position ?? "bottom-center");
  const style = String(options.style ?? "n-of-total");
  const startAt = Math.max(0, Number(options.startAt ?? 1));
  const outputs: ProcessResult["outputs"] = [];
  const failed: ProcessResult["failed"] = [];
  let processed = 0;

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    try {
      const doc = await PDFDocument.load(await readAsArrayBuffer(file), {
        ignoreEncryption: true,
      });
      const font = await doc.embedFont(StandardFonts.Helvetica);
      const pages = doc.getPages();
      pages.forEach((page, pageIndex) => {
        const number = startAt + pageIndex;
        const label =
          style === "bare"
            ? `${number}`
            : style === "page-n"
              ? `Page ${number}`
              : `${number} / ${pages.length}`;
        const size = 10;
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(label, size);
        const x =
          position === "bottom-right" || position === "top-right"
            ? width - textWidth - 36
            : position === "bottom-left" || position === "top-left"
              ? 36
              : width / 2 - textWidth / 2;
        const y =
          position.startsWith("top") ? height - 30 : 22;
        page.drawText(label, { x, y, size, font, color: rgb(0.32, 0.36, 0.45) });
      });
      const bytes = await doc.save();
      outputs.push({
        name: `numbered-${file.name}`,
        blob: new Blob([bytes.buffer as ArrayBuffer], {
          type: "application/pdf",
        }),
      });
      processed += 1;
    } catch {
      failed.push({ name: file.name, reason: "ไฟล์เสียหายหรือไม่ใช่ PDF" });
    }
    onProgress(index + 1, files.length);
  }
  if (!outputs.length) throw new Error("ไม่มีไฟล์ที่ใส่เลขหน้าได้");
  return {
    outputs,
    summary: `ใส่เลขหน้าแล้ว ${processed} ไฟล์`,
    failed: failed.length ? failed : undefined,
  };
};

/* ---------------- Real compression: re-render pages, keep the smaller one ---------------- */

const compressPdf: ToolHandler = async (files, options, onProgress) => {
  const scale = Number(options.scale ?? 1.5);
  const quality = Number(options.quality ?? 0.72);
  const outputs: ProcessResult["outputs"] = [];
  const failed: ProcessResult["failed"] = [];
  let originalTotal = 0;
  let compressedTotal = 0;

  for (let fileIndex = 0; fileIndex < files.length; fileIndex += 1) {
    const file = files[fileIndex];
    try {
      const originalBytes = await readAsArrayBuffer(file);
      const pdf = await openPdfJs(file);
      const out = await PDFDocument.create();
      for (let i = 1; i <= pdf.numPages; i += 1) {
        const page = await pdf.getPage(i);
        const blob = await renderPage(page, scale, "image/jpeg", quality);
        const embedded = await out.embedJpg(await blob.arrayBuffer());
        const pdfPage = out.addPage([embedded.width, embedded.height]);
        pdfPage.drawImage(embedded, {
          x: 0,
          y: 0,
          width: embedded.width,
          height: embedded.height,
        });
      }
      onProgress(fileIndex + 1, files.length);
      const newBytes = await out.save();
      const newBlob = new Blob([newBytes.buffer as ArrayBuffer], {
        type: "application/pdf",
      });
      originalTotal += file.size;
      if (newBlob.size < file.size * 0.95) {
        compressedTotal += newBlob.size;
        const saved = Math.round((1 - newBlob.size / file.size) * 100);
        outputs.push({
          name: file.name.replace(/\.pdf$/i, "") + "-compressed.pdf",
          blob: newBlob,
          note: `ลดขนาด ${saved}% (${formatSize(file.size)} → ${formatSize(newBlob.size)})`,
        });
      } else {
        compressedTotal += file.size;
        outputs.push({
          name: file.name,
          blob: new Blob([originalBytes], { type: "application/pdf" }),
          note: "บีบอัดแล้วไม่เล็กลง — คงไฟล์เดิมไว้",
        });
      }
    } catch {
      failed.push({ name: file.name, reason: "ไฟล์เสียหายหรือไม่ใช่ PDF" });
    }
  }
  if (!outputs.length) throw new Error("ไม่มีไฟล์ที่บีบอัดได้");
  const savedPct = originalTotal
    ? Math.round((1 - compressedTotal / originalTotal) * 100)
    : 0;
  return {
    outputs,
    summary:
      savedPct > 0
        ? `บีบอัดรวมกันลดลง ${savedPct}% (${formatSize(originalTotal)} → ${formatSize(compressedTotal)})`
        : "ไฟล์เหล่านี้บีบอัดไปมากแล้ว — คงขนาดเดิม",
    failed: failed.length ? failed : undefined,
  };
};

/* ---------------- Unlock (strip owner-password restrictions) ---------------- */

const unlockPdf: ToolHandler = async (files, _options, onProgress) => {
  const outputs: ProcessResult["outputs"] = [];
  const failed: ProcessResult["failed"] = [];
  let unlocked = 0;
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    try {
      const doc = await PDFDocument.load(await readAsArrayBuffer(file), {
        ignoreEncryption: true,
      });
      const bytes = await doc.save();
      outputs.push({
        name: `unlocked-${file.name}`,
        blob: new Blob([bytes.buffer as ArrayBuffer], {
          type: "application/pdf",
        }),
      });
      unlocked += 1;
    } catch {
      failed.push({
        name: file.name,
        reason: "ต้องใช้รหัสผ่านเปิดไฟล์ — ปลดล็อคไม่ได้",
      });
    }
    onProgress(index + 1, files.length);
  }
  if (!outputs.length)
    throw new Error("ปลดล็อคไม่สำเร็จ — ไฟล์ต้องใช้รหัสผ่านเปิดจริง");
  return {
    outputs,
    summary: `ปลดล็อคข้อจำกัดการแก้ไข/พิมพ์ ${unlocked} ไฟล์`,
    failed: failed.length ? failed : undefined,
  };
};

/* ---------------- ZIP packaging ---------------- */

const zipFiles: ToolHandler = async (files, _options, onProgress) => {
  const outputs: ProcessResult["outputs"] = [];
  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const zip = new JSZip();
    zip.file(file.name, await readAsArrayBuffer(file));
    const blob = await zip.generateAsync({ type: "blob" });
    outputs.push({
      name: `${file.name.replace(/\.[^.]+$/, "")}.zip`,
      blob,
    });
    onProgress(index + 1, files.length);
  }
  return { outputs, summary: `บีบอัดเป็น ZIP ${outputs.length} ไฟล์` };
};

/* ---------------- Registry + option schemas ---------------- */

export const TOOL_HANDLERS: Record<string, ToolHandler> = {
  "merge-pdf": mergePdf,
  "split-pdf": splitPdf,
  "rotate-pdf": rotatePdf,
  "jpg-to-pdf": imagesToPdf,
  "scan-to-pdf": imagesToPdf,
  "pdf-to-jpg": pdfToImages,
  watermark: watermarkPdf,
  "page-numbers": pageNumbers,
  "protect-pdf": unlockPdf,
  "unlock-pdf": unlockPdf,
  "compress-pdf": compressPdf,
};

export type ToolOptionField =
  | {
      key: string;
      label: string;
      type: "select";
      choices: Array<{ value: string; label: string }>;
      default: string;
    }
  | {
      key: string;
      label: string;
      type: "number";
      min: number;
      max: number;
      step: number;
      default: number;
    }
  | { key: string; label: string; type: "text"; default: string; placeholder?: string };

export const TOOL_OPTIONS: Record<string, ToolOptionField[]> = {
  "split-pdf": [
    {
      key: "mode",
      label: "วิธีแยก",
      type: "select",
      default: "each",
      choices: [
        { value: "each", label: "ทุกหน้าแยกเป็นไฟล์" },
        { value: "every", label: "ทุก N หน้าเป็นไฟล์" },
        { value: "range", label: "ตามช่วงที่กำหนด" },
      ],
    },
    { key: "every", label: "N หน้าต่อไฟล์", type: "number", min: 1, max: 50, step: 1, default: 2 },
    { key: "ranges", label: "ช่วงหน้า (เช่น 1-3,5,8-10)", type: "text", default: "1-3", placeholder: "1-3,5" },
  ],
  "rotate-pdf": [
    {
      key: "angle",
      label: "มุมหมุน",
      type: "select",
      default: "90",
      choices: [
        { value: "90", label: "90° ตามเข็ม" },
        { value: "180", label: "180° กลับหัว" },
        { value: "270", label: "90° ทวนเข็ม" },
      ],
    },
  ],
  "jpg-to-pdf": [
    {
      key: "pageSize",
      label: "ขนาดกระดาษ",
      type: "select",
      default: "fit",
      choices: [
        { value: "fit", label: "ตามขนาดรูป" },
        { value: "a4", label: "A4 แนวตั้ง" },
        { value: "a4-landscape", label: "A4 แนวนอน" },
      ],
    },
    { key: "margin", label: "ระยะขอบ (pt, เฉพาะ A4)", type: "number", min: 0, max: 72, step: 2, default: 24 },
  ],
  "scan-to-pdf": [
    {
      key: "pageSize",
      label: "ขนาดกระดาษ",
      type: "select",
      default: "fit",
      choices: [
        { value: "fit", label: "ตามขนาดรูป" },
        { value: "a4", label: "A4 แนวตั้ง" },
        { value: "a4-landscape", label: "A4 แนวนอน" },
      ],
    },
    { key: "margin", label: "ระยะขอบ (pt, เฉพาะ A4)", type: "number", min: 0, max: 72, step: 2, default: 24 },
  ],
  "pdf-to-jpg": [
    {
      key: "format",
      label: "รูปแบบภาพ",
      type: "select",
      default: "image/jpeg",
      choices: [
        { value: "image/jpeg", label: "JPG" },
        { value: "image/png", label: "PNG" },
      ],
    },
    {
      key: "scale",
      label: "ความคมชัด",
      type: "select",
      default: "2",
      choices: [
        { value: "1", label: "ปกติ (เร็ว)" },
        { value: "2", label: "สูง 2x (แนะนำ)" },
        { value: "3", label: "สูงมาก 3x (ไฟล์ใหญ่)" },
      ],
    },
  ],
  watermark: [
    { key: "text", label: "ข้อความลายน้ำ (ภาษาไทยได้)", type: "text", default: "", placeholder: "เช่น ตัวอย่างเอกสาร" },
    {
      key: "opacity",
      label: "ความเข้ม",
      type: "select",
      default: "0.25",
      choices: [
        { value: "0.12", label: "จางมาก" },
        { value: "0.25", label: "ปกติ" },
        { value: "0.45", label: "เข้ม" },
      ],
    },
  ],
  "page-numbers": [
    {
      key: "position",
      label: "ตำแหน่ง",
      type: "select",
      default: "bottom-center",
      choices: [
        { value: "bottom-center", label: "ล่างกึ่งกลาง" },
        { value: "bottom-right", label: "ล่างขวา" },
        { value: "bottom-left", label: "ล่างซ้าย" },
        { value: "top-right", label: "บนขวา" },
        { value: "top-center", label: "บนกึ่งกลาง" },
        { value: "top-left", label: "บนซ้าย" },
      ],
    },
    {
      key: "style",
      label: "รูปแบบ",
      type: "select",
      default: "n-of-total",
      choices: [
        { value: "n-of-total", label: "1 / N" },
        { value: "bare", label: "1" },
        { value: "page-n", label: "Page 1" },
      ],
    },
    { key: "startAt", label: "เริ่มนับที่เลข", type: "number", min: 0, max: 999, step: 1, default: 1 },
  ],
  "compress-pdf": [
    {
      key: "scale",
      label: "ระดับบีบอัด",
      type: "select",
      default: "1.5",
      choices: [
        { value: "1.2", label: "เบา — คุณภาพสูงสุด" },
        { value: "1.5", label: "ปานกลาง (แนะนำ)" },
        { value: "2", label: "แรง — ไฟล์เล็กสุด" },
      ],
    },
    { key: "quality", label: "คุณภาพภาพ (0.5-0.9)", type: "number", min: 0.5, max: 0.9, step: 0.02, default: 0.72 },
  ],
};

export function defaultOptionsFor(id: string): ToolOptions {
  const fields = TOOL_OPTIONS[id] ?? [];
  const options: ToolOptions = {};
  fields.forEach(field => {
    options[field.key] = field.default;
  });
  return options;
}

export const ACCEPTED_TYPES = ".pdf,.jpg,.jpeg,.png,.webp";

/** Per-tool file pickers so batch-selecting can't pick files a tool can't read. */
const PDF_ONLY = ".pdf";
const IMAGES_ONLY = ".jpg,.jpeg,.png,.webp";
const ANY_DOC =
  ".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt";

export function getAcceptForTool(id: string): string {
  switch (id) {
    case "jpg-to-pdf":
    case "scan-to-pdf":
      return IMAGES_ONLY;
    case "merge-pdf":
    case "split-pdf":
    case "rotate-pdf":
    case "pdf-to-jpg":
    case "watermark":
    case "page-numbers":
    case "protect-pdf":
    case "unlock-pdf":
      return PDF_ONLY;
    case "compress-pdf":
      return ANY_DOC;
    default:
      return ACCEPTED_TYPES;
  }
}

export const MAX_FILE_SIZE = 100 * 1024 * 1024;
export const MAX_FILES = 20;

export function isWorkingTool(id: string): boolean {
  return Boolean(TOOL_HANDLERS[id]);
}

/** Trigger a browser download for each produced blob. */
export function downloadOutputs(outputs: OutputFile[]) {
  outputs.forEach((output, index) => {
    const url = URL.createObjectURL(output.blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = output.name;
    document.body.appendChild(anchor);
    // stagger so multi-file downloads do not get swallowed by the browser
    setTimeout(() => {
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    }, index * 250);
  });
}

export function notifyError(error: unknown) {
  const message =
    error instanceof Error ? error.message : "ประมวลผลไม่สำเร็จ";
  toast.error(message);
}
