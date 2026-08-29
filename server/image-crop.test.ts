import { describe, expect, it } from "vitest";
import {
  cropPresets,
  estimateBase64Bytes,
  isSupportedImageUpload,
  maxUploadBytes,
} from "../shared/imageCrop";

describe("image crop workflow rules", () => {
  it("defines a stable output size for every website slot", () => {
    expect(cropPresets.hero).toMatchObject({ width: 1600, height: 900 });
    expect(cropPresets.about).toMatchObject({ width: 1000, height: 1250 });
    expect(cropPresets.portfolio).toMatchObject({ width: 1200, height: 800 });
    expect(cropPresets.service).toMatchObject({ width: 1000, height: 750 });
  });

  it("accepts supported images within the upload limit and rejects unsafe files", () => {
    expect(isSupportedImageUpload("image/jpeg", 1024)).toBe(true);
    expect(isSupportedImageUpload("image/webp", maxUploadBytes)).toBe(true);
    expect(isSupportedImageUpload("application/pdf", 1024)).toBe(false);
    expect(isSupportedImageUpload("image/png", maxUploadBytes + 1)).toBe(false);
    expect(isSupportedImageUpload("image/png", 0)).toBe(false);
  });

  it("estimates decoded bytes from base64 payload with padding", () => {
    expect(estimateBase64Bytes("TQ==")).toBe(1);
    expect(estimateBase64Bytes("TWE=")).toBe(2);
    expect(estimateBase64Bytes("TWFu")).toBe(3);
  });
});
