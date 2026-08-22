export const cropPresets = {
  hero: { label: "Hero · 16:9", width: 1600, height: 900 },
  about: { label: "About · 4:5", width: 1000, height: 1250 },
  portfolio: { label: "Portfolio · 3:2", width: 1200, height: 800 },
  service: { label: "Service · 4:3", width: 1000, height: 750 },
} as const;

export type CropSlot = keyof typeof cropPresets;
export const supportedImageMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;
export const maxUploadBytes = 5_000_000;

export function isSupportedImageUpload(mimeType: string, fileSize: number) {
  return supportedImageMimeTypes.includes(mimeType as (typeof supportedImageMimeTypes)[number]) && fileSize > 0 && fileSize <= maxUploadBytes;
}

export function estimateBase64Bytes(base64Payload: string) {
  const padding = base64Payload.endsWith("==") ? 2 : base64Payload.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((base64Payload.length * 3) / 4) - padding);
}
