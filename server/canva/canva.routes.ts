import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { Express, Request, Response } from "express";
import { getCookie, getOAuthStateCookieOptions, isSecureRequest } from "../_core/cookies";
import { ENV } from "../_core/env";
import { createAuditLog } from "../db";
import { sessionService } from "../_core/sdk";
import {
  buildAuthorizeUrl,
  createPkcePair,
  exchangeAuthCode,
  fetchCanvaProfile,
  refreshAccessToken,
  revokeToken,
} from "./canva.oauth";
import {
  deleteCanvaAccount,
  getCanvaAccount,
  isExpiring,
  readRefreshToken,
  updateTokens,
  upsertCanvaAccount,
} from "./canva.store";

const STATE_COOKIE = "canva_oauth_state";
const VERIFIER_COOKIE = "canva_oauth_verifier";
const RETURN_TO_COOKIE = "canva_oauth_return";

function resolveOrigin(req: Request): string | null {
  const host = req.header("x-forwarded-host") || req.header("host");
  if (!host) return null;
  const proto =
    req.header("x-forwarded-proto")?.split(",")[0]?.trim() ||
    (req.protocol === "https" ? "https" : "http");
  return `${proto}://${host}`;
}

/** Canva rejects `localhost` as a redirect — use 127.0.0.1 for local dev. */
function normalizeCanvaOrigin(origin: string): string {
  return origin.replace("//localhost:", "//127.0.0.1:");
}

function resolveCanvaRedirectUri(req: Request): string {
  if (ENV.canvaRedirectUri) return ENV.canvaRedirectUri;
  const origin = resolveOrigin(req);
  return normalizeCanvaOrigin(`${origin ?? ""}/api/canva/callback`);
}

function sign(value: string): string {
  const secret =
    ENV.cookieSecret || ENV.googleClientSecret || "mueang-sam-mok-canva-state-key";
  return createHmac("sha256", secret).update(value).digest("base64url");
}

function createSignedState(nonce: string): string {
  const timestamp = Date.now().toString(36);
  const payload = `${nonce}|${timestamp}`;
  return `${payload}|${sign(payload)}`;
}

function verifySignedState(
  state: string | undefined
): { valid: boolean; nonce?: string; reason?: string } {
  if (!state) return { valid: false, reason: "missing_state" };
  const parts = state.split("|");
  if (parts.length !== 3) return { valid: false, reason: "malformed_state" };
  const [nonce, timestamp, sig] = parts;
  const payload = `${nonce}|${timestamp}`;
  const expectedSig = sign(payload);
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) {
    return { valid: false, reason: "invalid_signature" };
  }
  const ageMs = Date.now() - parseInt(timestamp, 36);
  if (Number.isNaN(ageMs) || ageMs < 0 || ageMs > 15 * 60 * 1000) {
    return { valid: false, reason: "state_expired" };
  }
  return { valid: true, nonce };
}

async function requireUser(req: Request, res: Response): Promise<number | null> {
  try {
    const user = await sessionService.authenticateRequest(req);
    if (!user) throw new Error("no user");
    return user.id;
  } catch {
    res.status(401).json({ connected: false, error: "login_required" });
    return null;
  }
}

export function registerCanvaRoutes(app: Express) {
  /**
   * GET /api/canva/connect — starts the OAuth flow (requires app login).
   * Stores PKCE verifier + signed state in httpOnly cookies, redirects to Canva.
   */
  app.get("/api/canva/connect", (req: Request, res: Response) => {
    if (!ENV.canvaClientId || !ENV.canvaClientSecret) {
      res
        .status(503)
        .json({ error: "Canva integration is not configured (missing CANVA_CLIENT_ID / CANVA_CLIENT_SECRET)" });
      return;
    }
    const nonce = randomUUID();
    const { verifier, challenge } = createPkcePair();
    const state = createSignedState(nonce);
    const cookieOpts = getOAuthStateCookieOptions(req);
    res.cookie(STATE_COOKIE, state, cookieOpts);
    res.cookie(VERIFIER_COOKIE, verifier, cookieOpts);
    // remember where to send the user back (default: /tool)
    const returnTo = typeof req.query.returnTo === "string" && req.query.returnTo.startsWith("/")
      ? req.query.returnTo
      : "/tool";
    res.cookie(RETURN_TO_COOKIE, returnTo, cookieOpts);
    res.redirect(
      302,
      buildAuthorizeUrl({
        clientId: ENV.canvaClientId,
        redirectUri: resolveCanvaRedirectUri(req),
        challenge,
        state,
      })
    );
  });

  /**
   * GET /api/canva/callback — Canva redirects here with ?code&state.
   * Validates state+cookie, exchanges code (PKCE), fetches profile, stores tokens.
   */
  app.get("/api/canva/callback", async (req: Request, res: Response) => {
    const code = typeof req.query.code === "string" ? req.query.code : undefined;
    const state = typeof req.query.state === "string" ? req.query.state : undefined;
    const errorParam = typeof req.query.error === "string" ? req.query.error : undefined;
    const returnTo = getCookie(req, RETURN_TO_COOKIE) || "/tool";
    const fail = (reason: string) => {
      console.warn("[Canva OAuth] callback failed:", reason);
      res.clearCookie(STATE_COOKIE, { path: "/" });
      res.clearCookie(VERIFIER_COOKIE, { path: "/" });
      res.clearCookie(RETURN_TO_COOKIE, { path: "/" });
      res.redirect(302, `${returnTo}?canva=error&reason=${encodeURIComponent(reason)}`);
    };

    if (errorParam) return fail(`provider_error:${errorParam}`);
    if (!code) return fail("missing_code");

    const stateCheck = verifySignedState(state);
    const cookieState = getCookie(req, STATE_COOKIE);
    if (!stateCheck.valid) return fail(stateCheck.reason ?? "invalid_state");
    if (!cookieState || cookieState !== state) return fail("state_cookie_mismatch");

    const verifier = getCookie(req, VERIFIER_COOKIE);
    if (!verifier) return fail("missing_verifier");

    // session must still exist at callback time
    let userId: number;
    try {
      const user = await sessionService.authenticateRequest(req);
      if (!user) throw new Error("no user");
      userId = user.id;
    } catch {
      return fail("login_required");
    }

    if (!ENV.canvaClientId || !ENV.canvaClientSecret) return fail("not_configured");

    try {
      const tokens = await exchangeAuthCode({
        clientId: ENV.canvaClientId,
        clientSecret: ENV.canvaClientSecret,
        code,
        codeVerifier: verifier,
        redirectUri: resolveCanvaRedirectUri(req),
      });
      let profile = { id: "", displayName: null as string | null, email: null as string | null };
      try {
        profile = await fetchCanvaProfile(tokens.accessToken);
      } catch (profileError) {
        console.warn("[Canva OAuth] profile lookup failed:", profileError);
      }
      await upsertCanvaAccount({
        userId,
        canvaUserId: profile.id || null,
        displayName: profile.displayName,
        email: profile.email,
        tokens: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          scopes: tokens.scopes,
          expiresAt: new Date(Date.now() + tokens.expiresIn * 1000),
        },
      });
      await createAuditLog({
        userId,
        action: "canva_connect",
        metadata: JSON.stringify({ canvaUserId: profile.id || null }),
      }).catch(() => undefined);
      res.clearCookie(STATE_COOKIE, { path: "/" });
      res.clearCookie(VERIFIER_COOKIE, { path: "/" });
      res.clearCookie(RETURN_TO_COOKIE, { path: "/" });
      res.redirect(302, `${returnTo}?canva=connected`);
    } catch (error) {
      fail(error instanceof Error ? error.message : "callback_failed");
    }
  });

  /**
   * GET /api/canva/status — used by the Canva card. Refreshes token when expiring.
   */
  app.get("/api/canva/status", async (req: Request, res: Response) => {
    const userId = await requireUser(req, res);
    if (userId === null) return;
    if (!ENV.canvaClientId || !ENV.canvaClientSecret) {
      res.json({ connected: false, configured: false });
      return;
    }
    const account = await getCanvaAccount(userId);
    if (!account) {
      res.json({ connected: false, configured: true });
      return;
    }
    if (isExpiring(account)) {
      const refreshToken = readRefreshToken(account);
      if (refreshToken) {
        try {
          const refreshed = await refreshAccessToken({
            clientId: ENV.canvaClientId,
            clientSecret: ENV.canvaClientSecret,
            refreshToken,
          });
          await updateTokens(userId, {
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken ?? undefined,
            expiresAt: new Date(Date.now() + refreshed.expiresIn * 1000),
            scopes: refreshed.scopes ?? undefined,
          });
          res.json({
            connected: true,
            configured: true,
            displayName: account.displayName,
            canvaUserId: account.canvaUserId,
            scopes: refreshed.scopes,
          });
          return;
        } catch (error) {
          console.warn("[Canva OAuth] refresh failed:", error);
          // fall through to disconnected state
          await deleteCanvaAccount(userId).catch(() => undefined);
          res.json({ connected: false, configured: true, error: "refresh_failed" });
          return;
        }
      }
    }
    res.json({
      connected: true,
      configured: true,
      displayName: account.displayName,
      canvaUserId: account.canvaUserId,
      scopes: account.scopes,
    });
  });

  /**
   * POST /api/canva/disconnect — revokes the refresh token and deletes local row.
   */
  app.post("/api/canva/disconnect", async (req: Request, res: Response) => {
    const userId = await requireUser(req, res);
    if (userId === null) return;
    const account = await getCanvaAccount(userId);
    if (account && ENV.canvaClientId && ENV.canvaClientSecret) {
      const refreshToken = readRefreshToken(account);
      if (refreshToken) {
        await revokeToken({
          clientId: ENV.canvaClientId,
          clientSecret: ENV.canvaClientSecret,
          refreshToken,
        });
      }
    }
    await deleteCanvaAccount(userId).catch(() => undefined);
    await createAuditLog({ userId, action: "canva_disconnect" }).catch(() => undefined);
    res.json({ connected: false });
  });
}

/** Ensures CSRF cookie semantics match environment (lax on http, none+secure on https). */
export function canvaCookieIsSecure(req: Request): boolean {
  return isSecureRequest(req);
}
