import { describe, expect, it, vi } from "vitest";

const { createLeadMock } = vi.hoisted(() => ({ createLeadMock: vi.fn(async () => 42) }));
vi.mock("./db", () => ({
  createLead: createLeadMock,
  listLeads: vi.fn(async () => []),
  listProjects: vi.fn(async () => []),
  listQuotes: vi.fn(async () => []),
  listAppointments: vi.fn(async () => []),
  updateLeadStatus: vi.fn(),
  updateProjectStatus: vi.fn(),
  updateQuoteStatus: vi.fn(),
  updateAppointmentStatus: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
}));

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
});
