import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

export function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.header("x-forwarded-proto");
  if (!forwardedProto) return false;

  return forwardedProto
    .split(",")
    .some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const secure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    // SameSite=None requires Secure. Use Lax for local HTTP development.
    sameSite: secure ? "none" : "lax",
    secure,
  };
}

export function getOAuthStateCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure" | "maxAge"> {
  const isSecure = isSecureRequest(req);
  return {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: isSecure,
    maxAge: 10 * 60 * 1000, // 10 minutes
  };
}

export function getCookie(req: Request, ...names: string[]): string | undefined {
  const header = req.header("cookie");
  if (!header) return undefined;
  const parsed = header.split(";").reduce<Record<string, string>>((acc, part) => {
    const [rawKey, ...rawVal] = part.trim().split("=");
    if (rawKey) {
      try {
        acc[rawKey] = decodeURIComponent(rawVal.join("="));
      } catch {
        acc[rawKey] = rawVal.join("=");
      }
    }
    return acc;
  }, {});
  for (const name of names) {
    if (parsed[name]) return parsed[name];
  }
  return undefined;
}
