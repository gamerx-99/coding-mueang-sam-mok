import { createHash, randomBytes } from "node:crypto";

/**
 * Canva Connect API — OAuth 2.0 Authorization Code flow with PKCE (SHA-256),
 * verified against the official OpenAPI spec (canva-sdks/canva-connect-api-starter-kit).
 *
 * - Authorize:  https://www.canva.com/api/oauth/authorize
 * - Token:      https://api.canva.com/auth/v1/oauth/token   (Basic auth, POST form)
 * - Refresh:    same endpoint, grant_type=refresh_token
 * - Revoke:     https://api.canva.com/auth/v1/oauth/revoke
 * - Profile:    https://api.canva.com/rest/v1/users/me/profile  (scope profile:read)
 */

export const CANVA_AUTHORIZE_URL = "https://www.canva.com/api/oauth/authorize";
export const CANVA_TOKEN_URL = "https://api.canva.com/auth/v1/oauth/token";
export const CANVA_REVOKE_URL = "https://api.canva.com/auth/v1/oauth/revoke";
export const CANVA_PROFILE_URL = "https://api.canva.com/rest/v1/users/me/profile";

/** Minimum scope set for C1 (identity) — C2/C3 will extend, never shrink. */
export const CANVA_SCOPES = [
  "profile:read",
  "asset:read",
  "asset:write",
  "design:meta:read",
  "design:content:read",
  "design:content:write",
];

export function createPkcePair(): { verifier: string; challenge: string } {
  // 43-128 chars from unreserved ASCII per PKCE spec
  const verifier = randomBytes(48).toString("base64url").slice(0, 64);
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { verifier, challenge };
}

export type CanvaProfile = {
  id: string;
  displayName: string | null;
  email: string | null;
};

export async function exchangeAuthCode(params: {
  clientId: string;
  clientSecret: string;
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<{
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
  scopes: string | null;
}> {
  const basic = Buffer.from(
    `${params.clientId}:${params.clientSecret}`
  ).toString("base64");
  const response = await fetch(CANVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: params.code,
      code_verifier: params.codeVerifier,
      redirect_uri: params.redirectUri,
    }),
  });
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || typeof body.access_token !== "string") {
    const errCode = typeof body.error === "string" ? body.error : "unknown";
    throw new Error(`canva_token_exchange_failed:${errCode}`);
  }
  return {
    accessToken: body.access_token,
    refreshToken: typeof body.refresh_token === "string" ? body.refresh_token : null,
    expiresIn: typeof body.expires_in === "number" ? body.expires_in : 14400,
    scopes: typeof body.scope === "string" ? body.scope : null,
  };
}

export async function refreshAccessToken(params: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<{
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
  scopes: string | null;
}> {
  const basic = Buffer.from(
    `${params.clientId}:${params.clientSecret}`
  ).toString("base64");
  const response = await fetch(CANVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: params.refreshToken,
    }),
  });
  const body = (await response.json().catch(() => ({}))) as Record<string, unknown>;
  if (!response.ok || typeof body.access_token !== "string") {
    const errCode = typeof body.error === "string" ? body.error : "unknown";
    throw new Error(`canva_refresh_failed:${errCode}`);
  }
  return {
    accessToken: body.access_token,
    refreshToken: typeof body.refresh_token === "string" ? body.refresh_token : null,
    expiresIn: typeof body.expires_in === "number" ? body.expires_in : 14400,
    scopes: typeof body.scope === "string" ? body.scope : null,
  };
}

export async function revokeToken(params: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<void> {
  const basic = Buffer.from(
    `${params.clientId}:${params.clientSecret}`
  ).toString("base64");
  await fetch(CANVA_REVOKE_URL, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({ token: params.refreshToken }),
  }).catch(() => undefined);
}

export async function fetchCanvaProfile(
  accessToken: string
): Promise<CanvaProfile> {
  const response = await fetch(CANVA_PROFILE_URL, {
    headers: { authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`canva_profile_lookup_failed:${response.status}`);
  }
  const body = (await response.json()) as {
    id?: string;
    display_name?: string;
    team_user_profile?: { display_name?: string };
  };
  if (!body.id) throw new Error("canva_profile_missing_id");
  return {
    id: body.id,
    displayName:
      body.display_name ?? body.team_user_profile?.display_name ?? null,
    // profile:read does not always include email — treat as optional
    email: null,
  };
}

export function buildAuthorizeUrl(params: {
  clientId: string;
  redirectUri: string;
  challenge: string;
  state: string;
}): string {
  const url = new URL(CANVA_AUTHORIZE_URL);
  url.searchParams.set("client_id", params.clientId);
  url.searchParams.set("redirect_uri", params.redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", CANVA_SCOPES.join(" "));
  url.searchParams.set("code_challenge", params.challenge);
  url.searchParams.set("code_challenge_method", "s256");
  url.searchParams.set("state", params.state);
  return url.toString();
}
