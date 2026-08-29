import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  COOKIE_NAME,
  FACEBOOK_OAUTH_STATE_COOKIE,
  decodeFacebookOAuthState,
  encodeFacebookOAuthState,
} from "../shared/const";
import {
  createSignedFacebookOAuthState,
  mapFacebookProfile,
  registerOAuthRoutes,
  verifySignedFacebookOAuthState,
} from "./_core/oauth";
import * as db from "./db";
import { sessionService } from "./_core/sdk";
import { ENV } from "./_core/env";

const previousFacebookConfig = {
  appId: ENV.facebookAppId,
  appSecret: ENV.facebookAppSecret,
  redirectUri: ENV.facebookRedirectUri,
};

beforeEach(() => {
  ENV.facebookAppId = "test-facebook-app-id";
  ENV.facebookAppSecret = "test-facebook-app-secret";
  ENV.facebookRedirectUri = "";
});

afterEach(() => {
  ENV.facebookAppId = previousFacebookConfig.appId;
  ENV.facebookAppSecret = previousFacebookConfig.appSecret;
  ENV.facebookRedirectUri = previousFacebookConfig.redirectUri;
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Facebook OAuth state safety", () => {
  it("round-trips redirect URI and nonce", () => {
    const state = encodeFacebookOAuthState({
      redirectUri: "https://example.com/api/auth/facebook/callback",
      nonce: "fb-nonce-123",
    });
    expect(decodeFacebookOAuthState(state)).toEqual({
      redirectUri: "https://example.com/api/auth/facebook/callback",
      nonce: "fb-nonce-123",
    });
  });

  it("creates and verifies HMAC-signed Facebook state securely", () => {
    const signed = createSignedFacebookOAuthState(
      "https://example.com/api/auth/facebook/callback",
      "fb-nonce-secure-999"
    );
    const verified = verifySignedFacebookOAuthState(
      signed,
      "fb-nonce-secure-999"
    );
    expect(verified.valid).toBe(true);
    expect(verified.redirectUri).toBe(
      "https://example.com/api/auth/facebook/callback"
    );
    expect(verified.nonce).toBe("fb-nonce-secure-999");

    // Also valid if cross-site redirect dropped cookie
    const verifiedNoCookie = verifySignedFacebookOAuthState(signed, undefined);
    expect(verifiedNoCookie.valid).toBe(true);
  });

  it("fails closed for malformed or incomplete state", () => {
    expect(decodeFacebookOAuthState("not-valid-fb-state")).toBeNull();
    const incomplete = Buffer.from(
      JSON.stringify({ redirectUri: "https://example.com/callback" }),
      "utf8"
    ).toString("base64url");
    expect(decodeFacebookOAuthState(incomplete)).toBeNull();
  });
});

describe("Facebook OAuth callback mapping", () => {
  it("maps the Facebook profile to a namespaced user identity", () => {
    expect(
      mapFacebookProfile({
        id: "1234567890",
        name: "Mae Hong Son Dev",
        email: "user@example.com",
      })
    ).toEqual({
      openId: "facebook:1234567890",
      name: "Mae Hong Son Dev",
      email: "user@example.com",
      loginMethod: "facebook",
    });
  });

  it("exchanges code, upserts Facebook user, creates session cookie, and redirects", async () => {
    const routes = new Map<
      string,
      (req: any, res: any) => Promise<void> | void
    >();
    registerOAuthRoutes({
      get: (path: string, handler: any) => routes.set(path, handler),
    } as any);
    const callback = routes.get("/api/auth/facebook/callback");
    expect(callback).toBeDefined();

    const state = encodeFacebookOAuthState({
      redirectUri:
        "https://webcraft-nvmnwo96.manus.space/api/auth/facebook/callback",
      nonce: "fb-nonce-success",
    });
    const upsert = vi.spyOn(db, "upsertUser").mockResolvedValue(undefined);
    const createSession = vi
      .spyOn(sessionService, "createSessionToken")
      .mockResolvedValue("fb-session-token");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ access_token: "fb-access-token" }), {
            status: 200,
          })
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              id: "fb-user-id-999",
              name: "Facebook User",
              email: "fbuser@example.com",
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
        query: { code: "facebook-code", state },
        headers: { cookie: `${FACEBOOK_OAUTH_STATE_COOKIE}=fb-nonce-success` },
        header(name: string) {
          return (this.headers as Record<string, string>)[name.toLowerCase()] ?? null;
        },
      },
      response
    );

    expect(upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        openId: "facebook:fb-user-id-999",
        loginMethod: "facebook",
        email: "fbuser@example.com",
      })
    );
    expect(createSession).toHaveBeenCalledWith(
      "facebook:fb-user-id-999",
      expect.objectContaining({ name: "Facebook User" })
    );
    expect(response.cookies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: COOKIE_NAME, value: "fb-session-token" }),
      ])
    );
    expect(response.redirected).toBe("/admin");
    vi.restoreAllMocks();
  });
});


describe("Facebook OAuth provider failures", () => {
  it("redirects with an actionable error when Meta rejects the redirect URI", async () => {
    const routes = new Map<
      string,
      (req: any, res: any) => Promise<void> | void
    >();
    registerOAuthRoutes({
      get: (path: string, handler: any) => routes.set(path, handler),
    } as any);
    const callback = routes.get("/api/auth/facebook/callback");
    expect(callback).toBeDefined();

    const state = encodeFacebookOAuthState({
      redirectUri:
        "https://webcraft-nvmnwo96.manus.space/api/auth/facebook/callback",
      nonce: "fb-nonce-provider-error",
    });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            error: {
              code: 191,
              type: "OAuthException",
              message: "Invalid redirect_uri",
            },
          }),
          { status: 400, headers: { "content-type": "application/json" } }
        )
      )
    );

    const response = {
      redirected: "",
      statusCode: 200,
      body: null as unknown,
      cookie() {},
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
        query: { code: "facebook-code", state },
        headers: { cookie: `${FACEBOOK_OAUTH_STATE_COOKIE}=fb-nonce-provider-error` },
        header(name: string) {
          return (this.headers as Record<string, string>)[name.toLowerCase()] ?? null;
        },
      },
      response
    );

    expect(response.statusCode).toBe(302);
    expect(response.redirected).toBe(
      "/login?error=facebook_redirect_uri_mismatch"
    );
    vi.unstubAllGlobals();
  });
});


describe("Facebook OAuth redirect configuration", () => {
  it("uses the configured callback URI instead of the incoming host", async () => {
    ENV.facebookRedirectUri =
      "https://coding-mueang-sam-mok.vercel.app/api/auth/facebook/callback";
    const routes = new Map<
      string,
      (req: any, res: any) => Promise<void> | void
    >();
    registerOAuthRoutes({
      get: (path: string, handler: any) => routes.set(path, handler),
    } as any);
    const start = routes.get("/api/auth/facebook/start");
    expect(start).toBeDefined();

    const response = {
      redirected: "",
      statusCode: 200,
      body: null as unknown,
      cookies: [] as Array<{ name: string; value: string }>,
      cookie(name: string, value: string) {
        this.cookies.push({ name, value });
      },
      status(code: number) {
        this.statusCode = code;
        return this;
      },
      json(value: unknown) {
        this.body = value;
        return this;
      },
      redirect(codeOrPath: number | string, path?: string) {
        this.redirected = typeof codeOrPath === "string" ? codeOrPath : path ?? "";
      },
    };

    await start!(
      {
        query: {},
        protocol: "https",
        headers: { host: "unexpected-host.example" },
        header(name: string) {
          return (this.headers as Record<string, string>)[name.toLowerCase()] ?? null;
        },
      },
      response
    );

    expect(response.redirected).toBeTruthy();
    expect(response.statusCode).toBe(200);
    const location = new URL(response.redirected);
    expect(location.searchParams.get("redirect_uri")).toBe(
      ENV.facebookRedirectUri
    );
    expect(response.cookies).toHaveLength(1);
  });
});
