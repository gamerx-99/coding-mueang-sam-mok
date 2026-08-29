import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const MEDIA_ROOT = path.resolve("media");

function ensureMediaRoot() {
  return fs.mkdir(MEDIA_ROOT, { recursive: true });
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "").replace(/\\/g, "/");
}

function appendHashSuffix(relKey: string): string {
  const hash = crypto.randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  await ensureMediaRoot();
  const key = appendHashSuffix(normalizeKey(relKey));
  const filePath = path.join(MEDIA_ROOT, key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  await fs.writeFile(filePath, buffer);
  return { key, url: `/media/${key}` };
}

export async function storageGet(
  relKey: string
): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  return { key, url: `/media/${key}` };
}

export async function storageGetSignedUrl(relKey: string): Promise<string> {
  const { url } = await storageGet(relKey);
  return url;
}
