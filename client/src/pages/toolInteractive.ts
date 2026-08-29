/**
 * Interactive tool engines — pure browser-side math + canvas.
 * Adapted from the delphitools-cli specs (local-first, no network).
 * No external APIs: everything runs on the user's machine.
 */

/* ================= Colour core ================= */

export type Rgb = { r: number; g: number; b: number };
export type Hsl = { h: number; s: number; l: number };

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

export function hexToRgb(hex: string): Rgb | null {
  const clean = hex.trim().replace(/^#/, "");
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map(ch => ch + ch)
          .join("")
      : clean;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
  };
}

const toHex2 = (n: number) =>
  clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0");

export const rgbToHex = ({ r, g, b }: Rgb) =>
  `#${toHex2(r)}${toHex2(g)}${toHex2(b)}`.toUpperCase();

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: h * 360, s: s * 100, l: l * 100 };
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const hn = (((h % 360) + 360) % 360) / 360;
  const sn = s / 100;
  const ln = l / 100;
  if (sn === 0) {
    const v = ln * 255;
    return { r: v, g: v, b: v };
  }
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  const channel = (t: number) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return {
    r: channel(hn + 1 / 3) * 255,
    g: channel(hn) * 255,
    b: channel(hn - 1 / 3) * 255,
  };
}

export function parseColor(input: string): Rgb | null {
  const text = input.trim();
  if (/^#?[0-9a-fA-F]{3}$|^#?[0-9a-fA-F]{6}$/.test(text)) return hexToRgb(text);
  const rgbMatch = text.match(
    /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/
  );
  if (rgbMatch)
    return {
      r: clamp(+rgbMatch[1], 0, 255),
      g: clamp(+rgbMatch[2], 0, 255),
      b: clamp(+rgbMatch[3], 0, 255),
    };
  const hslMatch = text.match(
    /^hsla?\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?/
  );
  if (hslMatch)
    return hslToRgb({ h: +hslMatch[1], s: +hslMatch[2], l: +hslMatch[3] });
  return null;
}

export function colorFormats(input: string) {
  const rgbValue = parseColor(input);
  if (!rgbValue) return null;
  const hsl = rgbToHsl(rgbValue);
  return {
    hex: rgbToHex(rgbValue),
    rgb: `rgb(${Math.round(rgbValue.r)}, ${Math.round(rgbValue.g)}, ${Math.round(rgbValue.b)})`,
    hsl: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`,
    swatch: rgbToHex(rgbValue),
  };
}

/* ---- Tailwind-style shades (keep hue/sat, step lightness) ---- */

const SHADE_LIGHTNESS: Array<[string, number]> = [
  ["50", 97],
  ["100", 94],
  ["200", 86],
  ["300", 77],
  ["400", 66],
  ["500", 53],
  ["600", 47],
  ["700", 39],
  ["800", 32],
  ["900", 24],
  ["950", 15],
];

export function tailwindShades(input: string) {
  const rgbValue = parseColor(input);
  if (!rgbValue) return null;
  const { h, s } = rgbToHsl(rgbValue);
  return SHADE_LIGHTNESS.map(([name, l]) => {
    const shade = rgbToHex(hslToRgb({ h, s, l }));
    return { name, hex: shade };
  });
}

/* ---- Harmony ---- */

export type HarmonyMode =
  | "complementary"
  | "analogous"
  | "triadic"
  | "tetradic"
  | "split";

export function colorHarmony(input: string, mode: HarmonyMode) {
  const rgbValue = parseColor(input);
  if (!rgbValue) return null;
  const base = rgbToHsl(rgbValue);
  const offsets: Record<HarmonyMode, number[]> = {
    complementary: [0, 180],
    analogous: [-30, 0, 30],
    triadic: [0, 120, 240],
    tetradic: [0, 90, 180, 270],
    split: [0, 150, 210],
  };
  return offsets[mode].map(offset => {
    const value = rgbToHex(
      hslToRgb({ h: base.h + offset, s: base.s, l: base.l })
    );
    return { offset, hex: value };
  });
}

/* ---- WCAG contrast ---- */

const channelLuminance = (c: number) => {
  const n = c / 255;
  return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4);
};

export function relativeLuminance({ r, g, b }: Rgb) {
  return (
    0.2126 * channelLuminance(r) +
    0.7152 * channelLuminance(g) +
    0.0722 * channelLuminance(b)
  );
}

export function contrastRatio(foreground: string, background: string) {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) return null;
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  return {
    ratio,
    text: ratio.toFixed(2),
    aa: ratio >= 4.5,
    aaLarge: ratio >= 3,
    aaa: ratio >= 7,
    uiComponent: ratio >= 3,
  };
}

/* ---- Colour-blindness simulation (standard matrices) ---- */

const CB_MATRICES: Record<string, number[]> = {
  protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
};

export function simulateColorBlind(input: string, kind: string) {
  const rgbValue = parseColor(input);
  if (!rgbValue) return null;
  const matrix = CB_MATRICES[kind] ?? CB_MATRICES.deuteranopia;
  const { r, g, b } = rgbValue;
  return rgbToHex({
    r: matrix[0] * r + matrix[1] * g + matrix[2] * b,
    g: matrix[3] * r + matrix[4] * g + matrix[5] * b,
    b: matrix[6] * r + matrix[7] * g + matrix[8] * b,
  });
}

/* ---- Palette extraction from an image ---- */

export async function extractPalette(
  file: File,
  count = 6
): Promise<Array<{ hex: string; share: number }>> {
  const bitmap = await createImageBitmap(file);
  const size = 72;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("ไม่สามารถสร้าง canvas ได้");
  context.drawImage(bitmap, 0, 0, size, size);
  const { data } = context.getImageData(0, 0, size, size);
  const buckets = new Map<number, { n: number; r: number; g: number; b: number }>();
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 128) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = ((r >> 4) << 8) | ((g >> 4) << 4) | (b >> 4);
    const bucket = buckets.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    bucket.n += 1;
    bucket.r += r;
    bucket.g += g;
    bucket.b += b;
    buckets.set(key, bucket);
  }
  const total = Array.from(buckets.values()).reduce((sum, b) => sum + b.n, 0);
  return Array.from(buckets.values())
    .sort((a, b) => b.n - a.n)
    .slice(0, count)
    .map(bucket => ({
      hex: rgbToHex({
        r: bucket.r / bucket.n,
        g: bucket.g / bucket.n,
        b: bucket.b / bucket.n,
      }),
      share: bucket.n / total,
    }));
}

/* ================= Image canvas helpers ================= */

async function fileToCanvas(file: File): Promise<HTMLCanvasElement> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("ไม่สามารถสร้าง canvas ได้");
  context.drawImage(bitmap, 0, 0);
  return canvas;
}

export type CropPosition = "center" | "top" | "bottom" | "left" | "right";

export async function cropToRatio(
  file: File,
  ratioW: number,
  ratioH: number,
  position: CropPosition
): Promise<Blob> {
  const source = await fileToCanvas(file);
  const current = source.width / source.height;
  const target = ratioW / ratioH;
  let sx = 0;
  let sy = 0;
  let sw = source.width;
  let sh = source.height;
  if (current > target) {
    sw = Math.round(source.height * target);
    sx =
      position === "left"
        ? 0
        : position === "right"
          ? source.width - sw
          : Math.round((source.width - sw) / 2);
  } else {
    sh = Math.round(source.width / target);
    sy =
      position === "top"
        ? 0
        : position === "bottom"
          ? source.height - sh
          : Math.round((source.height - sh) / 2);
  }
  const out = document.createElement("canvas");
  out.width = sw;
  out.height = sh;
  const context = out.getContext("2d");
  if (!context) throw new Error("ไม่สามารถสร้าง canvas ได้");
  context.drawImage(source, sx, sy, sw, sh, 0, 0, sw, sh);
  return await canvasToBlob(out, "image/png");
}

export type MatteMode = "blur" | "solid" | "gradient";

export async function makeMatte(
  file: File,
  ratioW: number,
  ratioH: number,
  mode: MatteMode,
  colour = "#f4f0e8"
): Promise<Blob> {
  const source = await fileToCanvas(file);
  const sideW = Math.max(source.width, (source.height * ratioW) / ratioH);
  const sideH = Math.max(source.height, (source.width * ratioH) / ratioW);
  const out = document.createElement("canvas");
  out.width = Math.round(sideW);
  out.height = Math.round(sideH);
  const context = out.getContext("2d");
  if (!context) throw new Error("ไม่สามารถสร้าง canvas ได้");
  if (mode === "solid") {
    context.fillStyle = colour;
    context.fillRect(0, 0, out.width, out.height);
  } else if (mode === "blur") {
    context.filter = "blur(36px)";
    const scale = Math.max(out.width / source.width, out.height / source.height);
    const w = source.width * scale;
    const h = source.height * scale;
    context.drawImage(
      source,
      (out.width - w) / 2,
      (out.height - h) / 2,
      w,
      h
    );
    context.filter = "none";
  } else {
    const { r, g, b } = averageColor(source);
    const gradient = context.createLinearGradient(0, 0, out.width, out.height);
    gradient.addColorStop(0, rgbToHex({ r: r + 30, g: g + 30, b: b + 30 }));
    gradient.addColorStop(1, rgbToHex({ r: r - 30, g: g - 30, b: b - 30 }));
    context.fillStyle = gradient;
    context.fillRect(0, 0, out.width, out.height);
  }
  const scale = Math.min(out.width / source.width, out.height / source.height);
  const w = source.width * scale;
  const h = source.height * scale;
  context.drawImage(source, (out.width - w) / 2, (out.height - h) / 2, w, h);
  return await canvasToBlob(out, "image/png");
}

export async function splitCarousel(
  file: File,
  ratioW: number,
  ratioH: number,
  fill: MatteMode
): Promise<Blob[]> {
  const source = await fileToCanvas(file);
  const tileH = source.height;
  const tileW = Math.round(tileH * (ratioW / ratioH));
  const count = Math.max(1, Math.ceil(source.width / tileW));
  const tiles: Blob[] = [];
  for (let i = 0; i < count; i += 1) {
    const tile = document.createElement("canvas");
    tile.width = tileW;
    tile.height = tileH;
    const context = tile.getContext("2d");
    if (!context) throw new Error("ไม่สามารถสร้าง canvas ได้");
    if (fill === "blur") {
      context.filter = "blur(36px)";
      const scale = Math.max(tileW / source.width, tileH / source.height);
      context.drawImage(
        source,
        (tileW - source.width * scale) / 2,
        (tileH - source.height * scale) / 2,
        source.width * scale,
        source.height * scale
      );
      context.filter = "none";
    }
    const sx = Math.min(i * tileW, Math.max(0, source.width - tileW));
    context.drawImage(source, sx, 0, tileW, tileH, 0, 0, tileW, tileH);
    tiles.push(await canvasToBlob(tile, "image/png"));
  }
  return tiles.reverse(); // carousel order: rightmost first
}

export async function generateFavicons(
  file: File
): Promise<Array<{ name: string; blob: Blob }>> {
  const source = await fileToCanvas(file);
  const sizes = [16, 32, 48, 180, 512];
  const results: Array<{ name: string; blob: Blob }> = [];
  for (const size of sizes) {
    const out = document.createElement("canvas");
    out.width = size;
    out.height = size;
    const context = out.getContext("2d");
    if (!context) continue;
    const scale = Math.max(size / source.width, size / source.height);
    const w = source.width * scale;
    const h = source.height * scale;
    context.drawImage(
      source,
      (size - w) / 2,
      (size - h) / 2,
      w,
      h
    );
    results.push({
      name: `favicon-${size}x${size}.png`,
      blob: await canvasToBlob(out, "image/png"),
    });
  }
  return results;
}

export type ImageFormat = "image/png" | "image/jpeg" | "image/webp";

export async function convertImage(
  file: File,
  format: ImageFormat,
  quality: number
): Promise<{ blob: Blob; size: number; originalSize: number }> {
  const source = await fileToCanvas(file);
  if (format === "image/jpeg") {
    const context = source.getContext("2d");
    if (context) {
      const flattened = document.createElement("canvas");
      flattened.width = source.width;
      flattened.height = source.height;
      const flatContext = flattened.getContext("2d");
      if (flatContext) {
        flatContext.fillStyle = "#ffffff";
        flatContext.fillRect(0, 0, flattened.width, flattened.height);
        flatContext.drawImage(source, 0, 0);
        const blob = await canvasToBlob(flattened, format, quality);
        return { blob, size: blob.size, originalSize: file.size };
      }
    }
  }
  const blob = await canvasToBlob(source, format, quality);
  return { blob, size: blob.size, originalSize: file.size };
}

function averageColor(canvas: HTMLCanvasElement): Rgb {
  const context = canvas.getContext("2d");
  if (!context) return { r: 128, g: 128, b: 128 };
  const small = document.createElement("canvas");
  small.width = 24;
  small.height = 24;
  const smallContext = small.getContext("2d");
  if (!smallContext) return { r: 128, g: 128, b: 128 };
  smallContext.drawImage(canvas, 0, 0, 24, 24);
  const { data } = smallContext.getImageData(0, 0, 24, 24);
  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 128) continue;
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    n += 1;
  }
  return n ? { r: r / n, g: g / n, b: b / n } : { r: 128, g: 128, b: 128 };
}

export async function canvasToBlob(
  canvas: HTMLCanvasElement,
  mime: string,
  quality = 0.92
): Promise<Blob> {
  const blob = await new Promise<Blob | null>(resolve =>
    canvas.toBlob(resolve, mime, quality)
  );
  if (!blob) throw new Error("แปลงภาพไม่สำเร็จ");
  return blob;
}

export async function trimTransparent(file: File): Promise<{
  blob: Blob;
  trimmed: [number, number, number, number];
}> {
  const source = await fileToCanvas(file);
  const context = source.getContext("2d");
  if (!context) throw new Error("ไม่สามารถอ่านภาพได้");
  const { width, height } = source;
  const { data } = context.getImageData(0, 0, width, height);
  let top = height;
  let bottom = 0;
  let left = width;
  let right = 0;
  let found = false;
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (data[(y * width + x) * 4 + 3] > 0) {
        found = true;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
        if (x < left) left = x;
        if (x > right) right = x;
      }
    }
  }
  if (!found) throw new Error("ภาพโปร่งใสทั้งหมด ไม่มีเนื้อหาให้ตัด");
  const out = document.createElement("canvas");
  out.width = right - left + 1;
  out.height = bottom - top + 1;
  const outContext = out.getContext("2d");
  if (!outContext) throw new Error("ไม่สามารถสร้าง canvas ได้");
  outContext.drawImage(
    source,
    left,
    top,
    out.width,
    out.height,
    0,
    0,
    out.width,
    out.height
  );
  return {
    blob: await canvasToBlob(out, "image/png"),
    trimmed: [left, top, width - right - 1, height - bottom - 1],
  };
}

/* ================= Typography & text ================= */

export function pxRem(value: number, rootSize: number, direction: "px2rem" | "rem2px") {
  return direction === "px2rem"
    ? Number((value / rootSize).toFixed(4))
    : Number((value * rootSize).toFixed(2));
}

export function lineHeightCalc(fontSize: number, lineHeight: number) {
  const px = Number((fontSize * lineHeight).toFixed(2));
  const body = lineHeight >= 1.5 && lineHeight <= 1.8;
  const heading = lineHeight >= 1.1 && lineHeight <= 1.35;
  return {
    px,
    suggestion: body
      ? "เหมาะกับเนื้อความ (1.5–1.8)"
      : heading
        ? "เหมาะกับหัวเรื่อง (1.1–1.35)"
        : lineHeight < 1.1
          ? "แน่นเกินไป — เสี่ยงชนกันบรรทัด"
          : "ห่างเกินไป — อ่านต่อเนื่องยาก",
  };
}

const TYPE_RATIOS: Array<[string, number]> = [
  ["1.125 — Major Second", 1.125],
  ["1.200 — Minor Third", 1.2],
  ["1.250 — Major Third", 1.25],
  ["1.333 — Perfect Fourth", 1.333],
  ["1.500 — Perfect Fifth", 1.5],
  ["1.618 — Golden Ratio", 1.618],
];

export function typeScale(baseSize: number, ratio: number) {
  const steps = ["xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"];
  return steps.map((name, index) => {
    const exponent = index - 2; // base at index 2
    return {
      step: name,
      px: Number((baseSize * Math.pow(ratio, exponent)).toFixed(2)),
    };
  });
}

export const TYPE_RATIO_OPTIONS = TYPE_RATIOS;

/** Thai-aware word counting via Intl.Segmenter with graceful fallback. */
export function countText(text: string) {
  const trimmed = text.trim();
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  let words = 0;
  const SegmenterCtor = (
    Intl as unknown as { Segmenter?: new (locale: string, opts: { granularity: "word" }) => { segment: (s: string) => Iterable<{ isWordLike?: boolean }> } }
  ).Segmenter;
  if (SegmenterCtor) {
    try {
      const segmenter = new SegmenterCtor("th", { granularity: "word" });
      const segments = Array.from(
        segmenter.segment(trimmed) as Iterable<{ isWordLike?: boolean }>
      );
      words = segments.filter(segment => segment.isWordLike).length;
    } catch {
      words = trimmed.split(/\s+/).filter(Boolean).length;
    }
  } else {
    words = trimmed.split(/\s+/).filter(Boolean).length;
  }
  const sentences = trimmed
    .split(/[.!?…]+|\n+/)
    .map(part => part.trim())
    .filter(Boolean).length;
  const minutes = words / 200; // ~200 wpm reading
  return {
    characters,
    charactersNoSpaces,
    words,
    sentences: Math.max(sentences, trimmed ? 1 : 0),
    readingTime:
      words === 0 ? "0 นาที" : minutes < 1 ? "< 1 นาที" : `${Math.ceil(minutes)} นาที`,
  };
}

export function paperSizes() {
  const mm = (w: number, h: number) => ({ w, h });
  return [
    { name: "A0", ...mm(841, 1189) },
    { name: "A1", ...mm(594, 841) },
    { name: "A2", ...mm(420, 594) },
    { name: "A3", ...mm(297, 420) },
    { name: "A4", ...mm(210, 297) },
    { name: "A5", ...mm(148, 210) },
    { name: "A6", ...mm(105, 148) },
    { name: "B4", ...mm(250, 353) },
    { name: "B5", ...mm(176, 250) },
    { name: "Letter", ...mm(215.9, 279.4) },
    { name: "Legal", ...mm(215.9, 355.6) },
  ];
}

/* ================= Calculators ================= */

const UNIT_TABLES: Record<string, Record<string, number>> = {
  length: { m: 1, cm: 0.01, mm: 0.001, km: 1000, in: 0.0254, ft: 0.3048, yd: 0.9144, mi: 1609.344 },
  mass: { kg: 1, g: 0.001, mg: 0.000001, t: 1000, lb: 0.45359237, oz: 0.028349523 },
  data: { B: 1, KB: 1024, MB: 1024 ** 2, GB: 1024 ** 3, TB: 1024 ** 4 },
};

export const UNIT_CATEGORIES: Record<string, { units: string[]; label: string }> = {
  length: { units: Object.keys(UNIT_TABLES.length), label: "ความยาว" },
  mass: { units: Object.keys(UNIT_TABLES.mass), label: "น้ำหนัก" },
  data: { units: Object.keys(UNIT_TABLES.data), label: "ข้อมูล" },
};

export function convertUnit(
  value: number,
  from: string,
  to: string,
  category: keyof typeof UNIT_TABLES
) {
  const table = UNIT_TABLES[category];
  if (!table?.[from] || !table?.[to]) return null;
  return (value * table[from]) / table[to];
}

export function convertTemperature(value: number, from: "c" | "f" | "k", to: "c" | "f" | "k") {
  const toCelsius = from === "c" ? value : from === "f" ? ((value - 32) * 5) / 9 : value - 273.15;
  return to === "c"
    ? toCelsius
    : to === "f"
      ? (toCelsius * 9) / 5 + 32
      : toCelsius + 273.15;
}

export function convertBase(value: string, from: 2 | 8 | 10 | 16) {
  const parsed = parseInt(value.replace(/^0[bxo]/i, ""), from);
  if (Number.isNaN(parsed)) return null;
  return {
    dec: parsed.toString(10),
    hex: "0x" + parsed.toString(16).toUpperCase(),
    bin: "0b" + parsed.toString(2),
    oct: "0o" + parsed.toString(8),
  };
}

export function convertTime(value: number, from: string, to: string) {
  const seconds: Record<string, number> = {
    s: 1, min: 60, h: 3600, d: 86400, wk: 604800, mo: 2629800, yr: 31557600,
  };
  if (!seconds[from] || !seconds[to]) return null;
  return (value * seconds[from]) / seconds[to];
}

export function encodeText(text: string, mode: "b64enc" | "b64dec" | "urlenc" | "urldec") {
  try {
    if (mode === "b64enc")
      return btoa(
        new TextEncoder()
          .encode(text)
          .reduce((s, byte) => s + String.fromCharCode(byte), "")
      );
    if (mode === "b64dec")
      return new TextDecoder().decode(
        Uint8Array.from(atob(text.trim()), c => c.charCodeAt(0))
      );
    if (mode === "urlenc") return encodeURIComponent(text);
    return decodeURIComponent(text.replace(/\+/g, " "));
  } catch {
    return null;
  }
}

export function metaTagGenny(input: {
  title: string;
  description: string;
  url: string;
  image: string;
  siteName: string;
}) {
  const escape = (value: string) =>
    value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  const tag = (property: string, value: string) =>
    value ? `  <meta property="${property}" content="${escape(value)}" />` : null;
  const nameTag = (name: string, value: string) =>
    value ? `  <meta name="${name}" content="${escape(value)}" />` : null;
  return [
    `<!-- Primary -->`,
    nameTag("title", input.title),
    nameTag("description", input.description),
    nameTag("canonical", input.url),
    ``,
    `<!-- Open Graph / Facebook -->`,
    `  <meta property="og:type" content="website" />`,
    tag("og:url", input.url),
    tag("og:site_name", input.siteName),
    tag("og:title", input.title),
    tag("og:description", input.description),
    tag("og:image", input.image),
    ``,
    `<!-- Twitter -->`,
    `  <meta name="twitter:card" content="summary_large_image" />`,
    tag("twitter:title", input.title),
    tag("twitter:description", input.description),
    tag("twitter:image", input.image),
  ]
    .filter(line => line !== null)
    .join("\n");
}
