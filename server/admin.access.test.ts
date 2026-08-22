import { describe, expect, it, vi } from "vitest";

const { createLeadMock, upsertContentSettingMock, createMediaAssetMock, storagePutMock } = vi.hoisted(() => ({ createLeadMock: vi.fn(async () => 42), upsertContentSettingMock: vi.fn(async () => 7), createMediaAssetMock: vi.fn(async () => 9), storagePutMock: vi.fn(async () => ({ key: "content/1/hero/hero.png", url: "/manus-storage/content/1/hero/hero.png" })) }));
vi.mock("./db", () => ({
  createLead: createLeadMock,
  listLeads: vi.fn(async () => []),
  listProjects: vi.fn(async () => []),
  listQuotes: vi.fn(async () => []),
  listAppointments: vi.fn(async () => []),
  listContentSettings: vi.fn(async () => []),
  listMediaAssets: vi.fn(async () => []),
  createMediaAsset: createMediaAssetMock,
  upsertContentSetting: upsertContentSettingMock,
  updateLeadStatus: vi.fn(),
  updateProjectStatus: vi.fn(),
  updateQuoteStatus: vi.fn(),
  updateAppointmentStatus: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

vi.mock("./storage", () => ({ storagePut: storagePutMock }));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function makeContext(role: "user" | "admin"): TrpcContext {
  return {
    user: { id: 1, openId: "test-user", email: "test@example.com", name: "Test User", loginMethod: "test", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("admin access control", () => {
  it("rejects a normal user from reading leads", async () => {
    const caller = appRouter.createCaller(makeContext("user"));
    await expect(caller.leads.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects a normal user from reading projects", async () => {
    const caller = appRouter.createCaller(makeContext("user"));
    await expect(caller.projects.list()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("rejects a normal user from reading managed content", async () => {
    const caller = appRouter.createCaller(makeContext("user"));
    await expect(caller.content.adminList()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});

describe("lead workflow", () => {
  it("creates a lead and returns its identifier", async () => {
    const caller = appRouter.createCaller(makeContext("user"));
    const result = await caller.leads.create({ name: "ลูกค้าทดสอบ", contact: "test@example.com", serviceType: "Website", budget: "฿50,000" });
    expect(result).toEqual({ success: true, id: 42 });
    expect(createLeadMock).toHaveBeenCalledWith(expect.objectContaining({ name: "ลูกค้าทดสอบ", contact: "test@example.com", source: "website" }));
  });

  it("rejects an empty lead name before touching the database", async () => {
    const caller = appRouter.createCaller(makeContext("user"));
    await expect(caller.leads.create({ name: "", contact: "contact" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects oversized image uploads at the API boundary", async () => {
    const caller = appRouter.createCaller(makeContext("admin"));
    await expect(caller.media.upload({ slot: "hero", fileName: "large.png", mimeType: "image/png", fileSize: 5_000_001, dataBase64: "data:image/png;base64,AA==" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects unsupported content keys and empty values", async () => {
    const caller = appRouter.createCaller(makeContext("admin"));
    await expect(caller.content.upsert({ contentKey: "nav" as never, language: "th", value: "ข้อความ" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
    await expect(caller.content.upsert({ contentKey: "heroTitle", language: "th", value: "   " })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("saves an allowed content key for an admin", async () => {
    const caller = appRouter.createCaller(makeContext("admin"));
    const result = await caller.content.upsert({ contentKey: "heroTitle", language: "th", value: "ข้อความจริง" });
    expect(result).toEqual({ success: true, id: 7 });
    expect(upsertContentSettingMock).toHaveBeenCalledWith(expect.objectContaining({ contentKey: "heroTitle", language: "th", value: "ข้อความจริง", updatedBy: 1 }));
  });

  it("uploads a valid image and persists its storage reference", async () => {
    const caller = appRouter.createCaller(makeContext("admin"));
    const result = await caller.media.upload({ slot: "hero", fileName: "hero.png", mimeType: "image/png", fileSize: 1, dataBase64: "data:image/png;base64,AA==", altText: "Hero image" });
    expect(result).toEqual({ success: true, id: 9, url: "/manus-storage/content/1/hero/hero.png" });
    expect(createMediaAssetMock).toHaveBeenCalledWith(expect.objectContaining({ slot: "hero", storageKey: "content/1/hero/hero.png", fileSize: 1, uploadedBy: 1 }));
  });
});
