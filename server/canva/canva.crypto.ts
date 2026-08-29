import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scryptSync,
} from "node:crypto";
import { ENV } from "../_core/env";

/**
 * AES-256-GCM encryption for Canva tokens at rest.
 * Key is derived (scrypt) from the app's existing signing secret —
 * no new secret required. Ciphertext format: iv:tag:ciphertext (base64url).
 */

function getKey(): Buffer {
  const secret =
    ENV.cookieSecret ||
    ENV.googleClientSecret ||
    "mueang-sam-mok-canva-token-encryption-key";
  return scryptSync(secret, "canva-token-v1", 32);
}

export function encryptToken(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getKey(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString("base64url"),
    tag.toString("base64url"),
    enc.toString("base64url"),
  ].join(".");
}

export function decryptToken(payload: string): string | null {
  try {
    const [ivPart, tagPart, dataPart] = payload.split(".");
    if (!ivPart || !tagPart || !dataPart) return null;
    const decipher = createDecipheriv(
      "aes-256-gcm",
      getKey(),
      Buffer.from(ivPart, "base64url")
    );
    decipher.setAuthTag(Buffer.from(tagPart, "base64url"));
    const dec = Buffer.concat([
      decipher.update(Buffer.from(dataPart, "base64url")),
      decipher.final(),
    ]);
    return dec.toString("utf8");
  } catch {
    return null;
  }
}
