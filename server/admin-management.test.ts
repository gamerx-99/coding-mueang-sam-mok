import { describe, expect, it } from "vitest";
import { assertRoleChangeAllowed, buildUsageStats } from "./db";

describe("admin role safety", () => {
  it("blocks an admin from removing their own access", () => {
    expect(() => assertRoleChangeAllowed(7, "admin", "user", 7, 2)).toThrow(
      "own admin access"
    );
  });

  it("keeps at least one admin account", () => {
    expect(() => assertRoleChangeAllowed(8, "admin", "user", 7, 1)).toThrow(
      "At least one admin"
    );
  });

  it("allows promoting a user and demoting one of several admins", () => {
    expect(() =>
      assertRoleChangeAllowed(8, "user", "admin", 7, 1)
    ).not.toThrow();
    expect(() =>
      assertRoleChangeAllowed(8, "admin", "user", 7, 2)
    ).not.toThrow();
  });

  it("normalizes usage aggregation counts for dashboard cards", () => {
    expect(
      buildUsageStats({
        users: 2,
        admins: 1,
        leads: 4,
        projects: 3,
        quotes: 5,
        appointments: 1,
        content: 6,
        media: 2,
        logins: 9,
      })
    ).toEqual({
      users: 2,
      admins: 1,
      leads: 4,
      projects: 3,
      quotes: 5,
      appointments: 1,
      content: 6,
      media: 2,
      logins: 9,
    });
  });

  it("preserves explicit zero values for empty systems", () => {
    expect(
      buildUsageStats({
        users: 0,
        admins: 0,
        leads: 0,
        projects: 0,
        quotes: 0,
        appointments: 0,
        content: 0,
        media: 0,
        logins: 0,
      }).logins
    ).toBe(0);
  });
});
