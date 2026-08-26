export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

/** Start Google OAuth from an explicit user action. */
export const startGoogleLogin = () => {
  const origin = window.location.origin;
  window.location.href = `${origin}/api/auth/google/start?origin=${encodeURIComponent(origin)}`;
};

/** Start Facebook OAuth from an explicit user action. */
export const startFacebookLogin = () => {
  const origin = window.location.origin;
  window.location.href = `${origin}/api/auth/facebook/start?origin=${encodeURIComponent(origin)}`;
};
