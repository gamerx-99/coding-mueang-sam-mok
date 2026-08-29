import { describe, expect, it, vi } from "vitest";
import "dotenv/config";
import {
  COOKIE_NAME,
  GOOGLE_OAUTH_STATE_COOKIE,
  decodeGoogleOAuthState,
  encodeGoogleOAuthState,
} from "../shared/const";
import {
  createSignedOAuthState,
  mapGoogleProfile,
  registerOAuthRoutes,
  verifySignedOAuthState,
} from "./_core/oauth";
import * as db from "./db";
import { sessionService } from "./_core/sdk";

describe("Google OAuth configuration", () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (clientId && clientSecret) {
    it("has server-side credentials and Google rejects only the intentionally invalid code", async () => {
      expect(clientId).toBeTruthy();
      expect(clientSecret).toBeTruthy();
      expect(clientId).not.toMatch(/undefined|placeholder|your_/i);

      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code: "intentionally-invalid-code",
          grant_type: "authorization_code",
          redirect_uri:
            "https://webcraft-nvmnwo96.manus.space/api/auth/google/callback",
        }),
      });
      const payload = (await response.json()) as { error?: string };
      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(payload.error).not.toBe("invalid_client");
    }, 15_000);
  } else {
    it.skip("skipped because GOOGLE_CLIENT_ID/GOOGLE_CLIENT_SECRET are not configured", () => {});
  }
});

describe("Google OAuth state safety", () => {
  it("round-trips redirect URI and nonce", () => {
    const state = encodeGoogleOAuthState({
      redirectUri: "https://example.com/api/auth/google/callback",
      nonce: "nonce-123",
    });
    expect(decodeGoogleOAuthState(state)).toEqual({
      redirectUri: "https://example.com/api/auth/google/callback",
      nonce: "nonce-123",
    });
  });

  it("creates and verifies HMAC-signed state securely", () => {
    const signed = createSignedOAuthState(
      "https://example.com/api/auth/google/callback",
      "nonce-secure-999"
    );
    const verified = verifySignedOAuthState(signed, "nonce-secure-999");
    expect(verified.valid).toBe(true);
    expect(verified.redirectUri).toBe(
      "https://example.com/api/auth/google/callback"
    );
    expect(verified.nonce).toBe("nonce-secure-999");

    // Also valid if cross-site redirect dropped cookie
    const verifiedNoCookie = verifySignedOAuthState(signed, undefined);
    expect(verifiedNoCookie.valid).toBe(true);
  });

  it("fails closed for malformed or incomplete state", () => {
    expect(decodeGoogleOAuthState("not-valid-state")).toBeNull();
    const incomplete = Buffer.from(
      JSON.stringify({ redirectUri: "https://example.com/callback" }),
      "utf8"
    ).toString("base64url");
    expect(decodeGoogleOAuthState(incomplete)).toBeNull();
  });
});

describe("Google OAuth callback mapping", () => {
  it("maps the provider subject to a namespaced user identity", () => {
    expect(
      mapGoogleProfile({
        sub: "abc123",
        name: "Mae Hong Son Studio",
        email: "owner@example.com",
      })
    ).toEqual({
      openId: "google:abc123",
      name: "Mae Hong Son Studio",
      email: "owner@example.com",
      loginMethod: "google",
    });
  });

  it("exchanges code, upserts Google user, creates session cookie, and redirects", async () => {
    const routes = new Map<
      string,
      (req: any, res: any) => Promise<void> | void
    >();
    registerOAuthRoutes({
      get: (path: string, handler: any) => routes.set(path, handler),
    } as any);
    const callback = routes.get("/api/auth/google/callback");
    expect(callback).toBeDefined();

    const state = encodeGoogleOAuthState({
      redirectUri:
        "https://webcraft-nvmnwo96.manus.space/api/auth/google/callback",
      nonce: "nonce-success",
    });
    const upsert = vi.spyOn(db, "upsertUser").mockResolvedValue(undefined);
    vi.spyOn(db, "getUserByOpenId").mockResolvedValue({
      openId: "google:google-sub",
    } as NonNullable<Awaited<ReturnType<typeof db.getUserByOpenId>>>);
    const createSession = vi
      .spyOn(sessionService, "createSessionToken")
      .mockResolvedValue("session-token");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ access_token: "access-token" }), {
            status: 200,
          })
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              sub: "google-sub",
              name: "Google User",
              email: "google@example.com",
            }),
            { status: 200 }
          )
        )
    );

    const response = {
      cookies: [] as Array<{
        name: string;
        value: string;
        options: Record<string, unknown>;
      }>,
      redirected: "",
      statusCode: 200,
      body: null as unknown,
      cookie(name: string, value: string, options: Record<string, unknown>) {
        this.cookies.push({ name, value, options });
      },
      clearCookie() {},
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(value: unknown) {
        this.body = value;
        return this;
      },
      redirect(code: number, path: string) {
        this.statusCode = code;
        this.redirected = path;
      },
    };
    await callback!(
      {
        query: { code: "google-code", state },
        headers: { cookie: `${GOOGLE_OAUTH_STATE_COOKIE}=nonce-success` },
        header(name: string) {
          return (this.headers as Record<string, string>)[name.toLowerCase()] ?? null;
        },
      },
      response
    );

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        openId: "google:google-sub",
        loginMethod: "google",
        email: "google@example.com",
      })
    );
    expect(createSession).toHaveBeenCalledWith(
      "google:google-sub",
      expect.objectContaining({ name: "Google User" })
    );
    expect(response.cookies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: COOKIE_NAME, value: "session-token" }),
      ])
    );
    expect(response.redirected).toBe("/admin");
    vi.restoreAllMocks();
  });
});
