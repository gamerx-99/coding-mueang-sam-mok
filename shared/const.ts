export const COOKIE_NAME = "app_session_id";
export const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = "Please login (10001)";
export const NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
export const GOOGLE_OAUTH_STATE_COOKIE = "google_oauth_state";
export const FACEBOOK_OAUTH_STATE_COOKIE = "facebook_oauth_state";
export const LEGACY_GOOGLE_OAUTH_STATE_COOKIE = "__Host-google_oauth_state";
export const LEGACY_FACEBOOK_OAUTH_STATE_COOKIE = "__Host-facebook_oauth_state";

export type GoogleOAuthState = {
  redirectUri: string;
  nonce: string;
  timestamp?: number;
  sig?: string;
};
export type FacebookOAuthState = {
  redirectUri: string;
  nonce: string;
  timestamp?: number;
  sig?: string;
};

export const encodeGoogleOAuthState = (state: GoogleOAuthState): string =>
  Buffer.from(JSON.stringify(state), "utf8").toString("base64url");

export const decodeGoogleOAuthState = (
  state: string
): GoogleOAuthState | null => {
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
    if (
      typeof parsed?.redirectUri !== "string" ||
      typeof parsed?.nonce !== "string"
    )
      return null;
    return parsed as GoogleOAuthState;
  } catch {
    return null;
  }
};

export const encodeFacebookOAuthState = (state: FacebookOAuthState): string =>
  Buffer.from(JSON.stringify(state), "utf8").toString("base64url");

export const decodeFacebookOAuthState = (
  state: string
): FacebookOAuthState | null => {
  try {
    const parsed = JSON.parse(Buffer.from(state, "base64url").toString("utf8"));
    if (
      typeof parsed?.redirectUri !== "string" ||
      typeof parsed?.nonce !== "string"
    )
      return null;
    return parsed as FacebookOAuthState;
  } catch {
    return null;
  }
};
