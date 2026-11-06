import Cookies from "js-cookie";

/**
 * "Logged-in hint" cookie — sirf UX ke liye (proxy ka optimistic redirect).
 *
 * Asli session cookies (cmpp_at / cmpp_rt) backend API host pe httpOnly set hoti hain,
 * isliye Next.js server unhe dekh nahi sakta. Yeh hint AuthContext `/auth/me` ke result se
 * sync karta hai. Yeh security boundary NAHI hai — data ki protection backend API karta hai;
 * hint ko fake karne se sirf khaali dashboard shell dikhega, jo client guard phir login pe bhej dega.
 */
export const AUTH_HINT_COOKIE = "cmp_auth_hint";

export function setAuthHint() {
  Cookies.set(AUTH_HINT_COOKIE, "1", {
    path: "/",
    sameSite: "lax",
    secure: typeof window !== "undefined" && window.location.protocol === "https:",
    expires: 30, // days; refresh token ki life se zyada na ho to bhi /auth/me fail hone pe clear ho jata hai
  });
}

export function hasAuthHint(): boolean {
  return typeof window !== "undefined" && Cookies.get(AUTH_HINT_COOKIE) === "1";
}

export function clearAuthHint() {
  Cookies.remove(AUTH_HINT_COOKIE, { path: "/" });
}

/**
 * `?next=` query param ko validate karke return karta hai (open-redirect se bachne ke liye
 * sirf same-origin, same-locale relative paths allowed). Warna `/${locale}`.
 */
export function getSafeNextPath(locale: string): string {
  const fallback = `/${locale}`;
  if (typeof window === "undefined") return fallback;

  const next = new URLSearchParams(window.location.search).get("next");
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return fallback;

  try {
    const url = new URL(next, window.location.origin);
    if (url.origin !== window.location.origin) return fallback;
    if (url.pathname !== fallback && !url.pathname.startsWith(`${fallback}/`)) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
