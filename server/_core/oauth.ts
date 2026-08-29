import {
  COOKIE_NAME,
  GOOGLE_OAUTH_STATE_COOKIE,
  LEGACY_GOOGLE_OAUTH_STATE_COOKIE,
  FACEBOOK_OAUTH_STATE_COOKIE,
  LEGACY_FACEBOOK_OAUTH_STATE_COOKIE,
  decodeGoogleOAuthState,
  encodeGoogleOAuthState,
  decodeFacebookOAuthState,
  encodeFacebookOAuthState,
} from "@shared/const";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions, getOAuthStateCookieOptions, getCookie } from "./cookies";
import { sessionService } from "./sdk";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

function resolveOrigin(req: Request): string | null {
  const queryOrigin = getQueryParam(req, "origin");
  if (queryOrigin && /^https?:\/\//i.test(queryOrigin)) {
    return queryOrigin.replace(/\/$/, "");
  }
  const host = req.header("x-forwarded-host") || req.header("host");
  if (host) {
    const proto =
      req.header("x-forwarded-proto")?.split(",")[0]?.trim() ||
      (req.protocol === "https" ? "https" : "http");
    return `${proto}://${host}`;
  }
  return null;
}

const FACEBOOK_GRAPH_VERSION = "v26.0";

function resolveFacebookRedirectUri(req: Request): string | null {
  const configured = ENV.facebookRedirectUri.trim();
  if (configured) {
    try {
      const url = new URL(configured);
      if (!/^https?:$/i.test(url.protocol) || url.search || url.hash) return null;
      return url.toString().replace(/\/$/, "");
    } catch {
      return null;
    }
  }

  const origin = resolveOrigin(req);
  return origin ? `${origin}/api/auth/facebook/callback` : null;
}

function getFacebookTokenExchangeError(providerBody: string): string {
  try {
    const parsed = JSON.parse(providerBody) as {
      error?: { code?: number; message?: string };
    };
    if (parsed.error?.code === 191) return "facebook_redirect_uri_mismatch";
    if (parsed.error?.code === 190) return "facebook_code_invalid";
    if (parsed.error?.message?.toLowerCase().includes("redirect_uri")) {
      return "facebook_redirect_uri_mismatch";
    }
  } catch {
    // Keep provider response details server-side only.
  }
  return "facebook_token_exchange_failed";
}

function getOAuthSigningSecret(): string {
  return ENV.cookieSecret || ENV.googleClientSecret || "mueang-sam-mok-oauth-secret-key";
}

export function createSignedOAuthState(redirectUri: string, nonce: string): string {
  const timestamp = Date.now();
  const secret = getOAuthSigningSecret();
  const sig = createHmac("sha256", secret)
    .update(`${redirectUri}|${nonce}|${timestamp}`)
    .digest("base64url");
  return encodeGoogleOAuthState({ redirectUri, nonce, timestamp, sig });
}

export function verifySignedOAuthState(
  stateString: string,
  expectedCookieNonce?: string
): { valid: boolean; redirectUri?: string; nonce?: string; reason?: string } {
  const parsed = decodeGoogleOAuthState(stateString);
  if (!parsed?.redirectUri || !parsed?.nonce) {
    return { valid: false, reason: "malformed_state" };
  }

  if (parsed.sig && parsed.timestamp) {
    const ageMs = Date.now() - parsed.timestamp;
    if (ageMs < 0 || ageMs > 15 * 60 * 1000) {
      return { valid: false, reason: "state_expired", redirectUri: parsed.redirectUri, nonce: parsed.nonce };
    }

    const secret = getOAuthSigningSecret();
    const expectedSig = createHmac("sha256", secret)
      .update(`${parsed.redirectUri}|${parsed.nonce}|${parsed.timestamp}`)
      .digest("base64url");

    const sigBuf = Buffer.from(parsed.sig, "utf8");
    const expectedSigBuf = Buffer.from(expectedSig, "utf8");
    if (sigBuf.length !== expectedSigBuf.length || !timingSafeEqual(sigBuf, expectedSigBuf)) {
      return { valid: false, reason: "invalid_signature", redirectUri: parsed.redirectUri, nonce: parsed.nonce };
    }

    if (expectedCookieNonce && expectedCookieNonce !== parsed.nonce) {
      return { valid: false, reason: "cookie_nonce_mismatch", redirectUri: parsed.redirectUri, nonce: parsed.nonce };
    }

    return { valid: true, redirectUri: parsed.redirectUri, nonce: parsed.nonce };
  }

  if (expectedCookieNonce && expectedCookieNonce === parsed.nonce) {
    return { valid: true, redirectUri: parsed.redirectUri, nonce: parsed.nonce };
  }

  return { valid: false, reason: "missing_signature_and_cookie", redirectUri: parsed.redirectUri, nonce: parsed.nonce };
}

export function createSignedFacebookOAuthState(redirectUri: string, nonce: string): string {
  const timestamp = Date.now();
  const secret = getOAuthSigningSecret();
  const sig = createHmac("sha256", secret)
    .update(`${redirectUri}|${nonce}|${timestamp}`)
    .digest("base64url");
  return encodeFacebookOAuthState({ redirectUri, nonce, timestamp, sig });
}

export function verifySignedFacebookOAuthState(
  stateString: string,
  expectedCookieNonce?: string
): { valid: boolean; redirectUri?: string; nonce?: string; reason?: string } {
  const parsed = decodeFacebookOAuthState(stateString);
  if (!parsed?.redirectUri || !parsed?.nonce) {
    return { valid: false, reason: "malformed_state" };
  }

  if (parsed.sig && parsed.timestamp) {
    const ageMs = Date.now() - parsed.timestamp;
    if (ageMs < 0 || ageMs > 15 * 60 * 1000) {
      return { valid: false, reason: "state_expired", redirectUri: parsed.redirectUri, nonce: parsed.nonce };
    }

    const secret = getOAuthSigningSecret();
    const expectedSig = createHmac("sha256", secret)
      .update(`${parsed.redirectUri}|${parsed.nonce}|${parsed.timestamp}`)
      .digest("base64url");

    const sigBuf = Buffer.from(parsed.sig, "utf8");
    const expectedSigBuf = Buffer.from(expectedSig, "utf8");
    if (sigBuf.length !== expectedSigBuf.length || !timingSafeEqual(sigBuf, expectedSigBuf)) {
      return { valid: false, reason: "invalid_signature", redirectUri: parsed.redirectUri, nonce: parsed.nonce };
    }

    if (expectedCookieNonce && expectedCookieNonce !== parsed.nonce) {
      return { valid: false, reason: "cookie_nonce_mismatch", redirectUri: parsed.redirectUri, nonce: parsed.nonce };
    }

    return { valid: true, redirectUri: parsed.redirectUri, nonce: parsed.nonce };
  }

  if (expectedCookieNonce && expectedCookieNonce === parsed.nonce) {
    return { valid: true, redirectUri: parsed.redirectUri, nonce: parsed.nonce };
  }

  return { valid: false, reason: "missing_signature_and_cookie", redirectUri: parsed.redirectUri, nonce: parsed.nonce };
}

export type GoogleProfile = { sub: string; name?: string; email?: string };
export function mapGoogleProfile(profile: GoogleProfile) {
  return { openId: `google:${profile.sub}`, name: profile.name ?? null, email: profile.email ?? null, loginMethod: "google" as const };
}

export type FacebookProfile = { id: string; name?: string; email?: string };
export function mapFacebookProfile(profile: FacebookProfile) {
  return { openId: `facebook:${profile.id}`, name: profile.name ?? null, email: profile.email ?? null, loginMethod: "facebook" as const };
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/auth/google/start", (req: Request, res: Response) => {
    if (!ENV.googleClientId || !ENV.googleClientSecret) {
      res.status(503).json({ error: "Google Login is not configured" });
      return;
    }
    const origin = resolveOrigin(req);
    if (!origin) { res.status(400).json({ error: "valid origin is required" }); return; }
    const redirectUri = `${origin}/api/auth/google/callback`;
    const nonce = randomUUID();
    const state = createSignedOAuthState(redirectUri, nonce);
    const cookieOpts = getOAuthStateCookieOptions(req);
    res.cookie(GOOGLE_OAUTH_STATE_COOKIE, nonce, cookieOpts);
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", ENV.googleClientId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("scope", "openid email profile");
    url.searchParams.set("state", state);
    url.searchParams.set("prompt", "select_account");
    res.redirect(url.toString());
  });

  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const errorParam = getQueryParam(req, "error");

    if (errorParam) {
      console.warn("[Google OAuth] Provider returned error:", errorParam);
      res.redirect(302, `/login?error=${encodeURIComponent(errorParam)}`);
      return;
    }

    if (!code || !state) {
      console.warn("[Google OAuth] Missing code or state", { hasCode: Boolean(code), hasState: Boolean(state) });
      res.status(400).json({ error: "missing code or state" });
      return;
    }

    const expected = getCookie(req, GOOGLE_OAUTH_STATE_COOKIE, LEGACY_GOOGLE_OAUTH_STATE_COOKIE);
    const verification = verifySignedOAuthState(state, expected);
    if (!verification.valid || !verification.nonce || !verification.redirectUri) {
      console.warn("[Google OAuth] Invalid state:", verification.reason);
      res.status(403).json({ error: "invalid google oauth state" });
      return;
    }

    res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE, { path: "/" });
    res.clearCookie(LEGACY_GOOGLE_OAUTH_STATE_COOKIE, { path: "/" });
    if (!ENV.googleClientId || !ENV.googleClientSecret) {
      res.status(503).json({ error: "Google Login is not configured" });
      return;
    }
    try {
      const redirectUri = verification.redirectUri;
      if (!redirectUri || !/^https?:\/\//i.test(redirectUri)) { res.status(400).json({ error: "invalid redirect uri" }); return; }
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: ENV.googleClientId, client_secret: ENV.googleClientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }) });
      if (!tokenResponse.ok) {
        const providerDetails = await tokenResponse.clone().text();
        console.error("[Google OAuth] Token exchange failed", {
          status: tokenResponse.status,
          details: providerDetails,
        });
        res.redirect(302, "/login?error=token_exchange_failed");
        return;
      }
      const token = (await tokenResponse.json()) as { access_token?: string };
      if (!token.access_token) {
        console.error("[Google OAuth] Access token missing from provider response");
        res.redirect(302, "/login?error=token_exchange_failed");
        return;
      }
      const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${token.access_token}` } });
      if (!profileResponse.ok) {
        const providerDetails = await profileResponse.clone().text();
        console.error("[Google OAuth] Profile lookup failed", {
          status: profileResponse.status,
          details: providerDetails,
        });
        res.redirect(302, "/login?error=profile_lookup_failed");
        return;
      }
      const profile = (await profileResponse.json()) as {
        sub?: string;
        name?: string;
        email?: string;
      };
      if (!profile.sub) {
        console.error("[Google OAuth] Subject missing from provider response");
        res.redirect(302, "/login?error=profile_lookup_failed");
        return;
      }
      const mapped = mapGoogleProfile({ sub: profile.sub, name: profile.name, email: profile.email });
      try {
        await db.upsertUser({ ...mapped, lastSignedIn: new Date() });
        const persistedUser = await db.getUserByOpenId(mapped.openId);
        if (!persistedUser) {
          console.error("[Google OAuth] User persistence check failed");
          res.redirect(302, "/login?error=database_unavailable");
          return;
        }
      } catch (dbErr) {
        console.error("[Google OAuth] DB upsert failed; session not created", {
          message: dbErr instanceof Error ? dbErr.message : String(dbErr),
        });
        res.redirect(302, "/login?error=database_unavailable");
        return;
      }
      const sessionToken = await sessionService.createSessionToken(mapped.openId, { name: mapped.name ?? "", expiresInMs: 365 * 24 * 60 * 60 * 1000 });
      res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: 365 * 24 * 60 * 60 * 1000 });
      res.redirect(302, "/admin");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Google OAuth] Callback failed", { message });
      res.redirect(302, "/login?error=callback_failed");
    }
  });

  app.get("/api/auth/facebook/start", (req: Request, res: Response) => {
    if (!ENV.facebookAppId || !ENV.facebookAppSecret) {
      res.status(503).json({ error: "Facebook Login is not configured" });
      return;
    }
    const redirectUri = resolveFacebookRedirectUri(req);
    if (!redirectUri) {
      res.status(400).json({ error: "valid Facebook redirect URI is required" });
      return;
    }
    const nonce = randomUUID();
    const state = createSignedFacebookOAuthState(redirectUri, nonce);
    const cookieOpts = getOAuthStateCookieOptions(req);
    res.cookie(FACEBOOK_OAUTH_STATE_COOKIE, nonce, cookieOpts);
    const url = new URL(`https://www.facebook.com/${FACEBOOK_GRAPH_VERSION}/dialog/oauth`);
    url.searchParams.set("client_id", ENV.facebookAppId);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("scope", "email,public_profile");
    res.redirect(url.toString());
  });

  app.get("/api/auth/facebook/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    const errorParam = getQueryParam(req, "error");

    if (errorParam) {
      console.warn("[Facebook OAuth] Provider returned error:", errorParam);
      res.redirect(302, `/login?error=${encodeURIComponent(errorParam)}`);
      return;
    }

    if (!code || !state) {
      console.warn("[Facebook OAuth] Missing code or state", { hasCode: Boolean(code), hasState: Boolean(state) });
      res.status(400).json({ error: "missing code or state" });
      return;
    }

    const expected = getCookie(req, FACEBOOK_OAUTH_STATE_COOKIE, LEGACY_FACEBOOK_OAUTH_STATE_COOKIE);
    if (!ENV.facebookAppId || !ENV.facebookAppSecret) {
      res.redirect(302, "/login?error=facebook_not_configured");
      return;
    }
    const verification = verifySignedFacebookOAuthState(state, expected);
    if (!verification.valid || !verification.nonce || !verification.redirectUri) {
      console.warn("[Facebook OAuth] Invalid state:", verification.reason);
      res.status(403).json({ error: "invalid facebook oauth state" });
      return;
    }

    res.clearCookie(FACEBOOK_OAUTH_STATE_COOKIE, { path: "/" });
    res.clearCookie(LEGACY_FACEBOOK_OAUTH_STATE_COOKIE, { path: "/" });
    try {
      const redirectUri = verification.redirectUri;
      if (!redirectUri || !/^https?:\/\//i.test(redirectUri)) { res.status(400).json({ error: "invalid redirect uri" }); return; }
      const tokenUrl = new URL(`https://graph.facebook.com/${FACEBOOK_GRAPH_VERSION}/oauth/access_token`);
      tokenUrl.searchParams.set("client_id", ENV.facebookAppId);
      tokenUrl.searchParams.set("client_secret", ENV.facebookAppSecret);
      tokenUrl.searchParams.set("redirect_uri", redirectUri);
      tokenUrl.searchParams.set("code", code);
      const tokenResponse = await fetch(tokenUrl.toString());
      if (!tokenResponse.ok) {
        const providerDetails = await tokenResponse.clone().text();
        const errorCode = getFacebookTokenExchangeError(providerDetails);
        console.error("[Facebook OAuth] Token exchange failed", {
          status: tokenResponse.status,
          errorCode,
          details: providerDetails.slice(0, 2000),
        });
        res.redirect(302, `/login?error=${errorCode}`);
        return;
      }
      const token = await tokenResponse.json() as { access_token?: string };
      if (!token.access_token) {
        console.error("[Facebook OAuth] Access token missing from provider response");
        res.redirect(302, "/login?error=facebook_token_exchange_failed");
        return;
      }
      const profileUrl = new URL(`https://graph.facebook.com/${FACEBOOK_GRAPH_VERSION}/me`);
      profileUrl.searchParams.set("fields", "id,name,email");
      profileUrl.searchParams.set("access_token", token.access_token);
      const profileResponse = await fetch(profileUrl.toString());
      if (!profileResponse.ok) {
        const providerDetails = await profileResponse.clone().text();
        console.error("[Facebook OAuth] Profile lookup failed", {
          status: profileResponse.status,
          details: providerDetails.slice(0, 2000),
        });
        res.redirect(302, "/login?error=facebook_profile_lookup_failed");
        return;
      }
      const profile = await profileResponse.json() as { id?: string; name?: string; email?: string };
      if (!profile.id) { res.status(400).json({ error: "Facebook id missing" }); return; }
      const mapped = mapFacebookProfile({ id: profile.id, name: profile.name, email: profile.email });
      await db.upsertUser({ ...mapped, lastSignedIn: new Date() });
      const sessionToken = await sessionService.createSessionToken(mapped.openId, { name: mapped.name ?? "", expiresInMs: 365 * 24 * 60 * 60 * 1000 });
      res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: 365 * 24 * 60 * 60 * 1000 });
      res.redirect(302, "/admin");
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("[Facebook OAuth] Callback failed", { message });
      res.redirect(302, "/login?error=facebook_callback_failed");
    }
  });
}
