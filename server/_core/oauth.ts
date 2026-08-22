import { COOKIE_NAME, GOOGLE_OAUTH_STATE_COOKIE, ONE_YEAR_MS, OAUTH_STATE_COOKIE, decodeGoogleOAuthState, decodeOAuthState, encodeGoogleOAuthState } from "@shared/const";
import { randomUUID } from "node:crypto";
import { parse as parseCookieHeader } from "cookie";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";
import { ENV } from "./env";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export type GoogleProfile = { sub: string; name?: string; email?: string };
export function mapGoogleProfile(profile: GoogleProfile) {
  return { openId: `google:${profile.sub}`, name: profile.name ?? null, email: profile.email ?? null, loginMethod: "google" as const };
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/auth/google/start", (req: Request, res: Response) => {
    if (!ENV.googleClientId) { res.status(503).json({ error: "Google Login is not configured" }); return; }
    const origin = getQueryParam(req, "origin");
    if (!origin || !/^https:\/\//i.test(origin)) { res.status(400).json({ error: "valid https origin is required" }); return; }
    const redirectUri = `${origin.replace(/\/$/, "")}/api/auth/google/callback`;
    const nonce = randomUUID();
    const state = encodeGoogleOAuthState({ redirectUri, nonce });
    res.cookie(GOOGLE_OAUTH_STATE_COOKIE, nonce, { httpOnly: true, secure: true, sameSite: "lax", maxAge: 600_000, path: "/" });
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    url.searchParams.set("client_id", ENV.googleClientId); url.searchParams.set("redirect_uri", redirectUri); url.searchParams.set("response_type", "code"); url.searchParams.set("scope", "openid email profile"); url.searchParams.set("state", state); url.searchParams.set("prompt", "select_account");
    res.redirect(url.toString());
  });

  app.get("/api/auth/google/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code"); const state = getQueryParam(req, "state");
    const parsed = state ? decodeGoogleOAuthState(state) : null;
    const expected = parseCookieHeader(req.headers.cookie ?? "")[GOOGLE_OAUTH_STATE_COOKIE];
    if (!code || !parsed?.nonce || parsed.nonce !== expected) { res.status(403).json({ error: "invalid google oauth state" }); return; }
    res.clearCookie(GOOGLE_OAUTH_STATE_COOKIE, { httpOnly: true, secure: true, sameSite: "lax", path: "/" });
    try {
      const redirectUri = parsed.redirectUri;
      if (!redirectUri || !/^https:\/\//i.test(redirectUri)) { res.status(400).json({ error: "invalid redirect uri" }); return; }
      const tokenResponse = await fetch("https://oauth2.googleapis.com/token", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ code, client_id: ENV.googleClientId, client_secret: ENV.googleClientSecret, redirect_uri: redirectUri, grant_type: "authorization_code" }) });
      if (!tokenResponse.ok) { res.status(401).json({ error: "Google token exchange failed" }); return; }
      const token = await tokenResponse.json() as { access_token?: string };
      if (!token.access_token) { res.status(401).json({ error: "Google access token missing" }); return; }
      const profileResponse = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${token.access_token}` } });
      if (!profileResponse.ok) { res.status(401).json({ error: "Google profile lookup failed" }); return; }
      const profile = await profileResponse.json() as { sub?: string; name?: string; email?: string };
      if (!profile.sub) { res.status(400).json({ error: "Google subject missing" }); return; }
      const mapped = mapGoogleProfile({ sub: profile.sub, name: profile.name, email: profile.email });
      await db.upsertUser({ ...mapped, lastSignedIn: new Date() });
      const sessionToken = await sdk.createSessionToken(mapped.openId, { name: mapped.name ?? "", expiresInMs: ONE_YEAR_MS });
      res.cookie(COOKIE_NAME, sessionToken, { ...getSessionCookieOptions(req), maxAge: ONE_YEAR_MS });
      res.redirect(302, "/admin");
    } catch (error) { console.error("[Google OAuth] Callback failed", error); res.status(500).json({ error: "Google OAuth callback failed" }); }
  });

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    // CSRF guard: the nonce in `state` must match the one-time cookie that
    // startLogin set in the browser that began this login. An attacker can
    // forge `state`, but cannot plant this cookie in the victim's browser.
    const { nonce } = decodeOAuthState(state);
    const expectedNonce = parseCookieHeader(req.headers.cookie ?? "")[OAUTH_STATE_COOKIE];
    if (!nonce || nonce !== expectedNonce) {
      res.status(403).json({ error: "invalid oauth state" });
      return;
    }
    res.clearCookie(OAUTH_STATE_COOKIE, { path: "/", secure: true, sameSite: "none" });

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
