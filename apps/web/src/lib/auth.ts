/**
 * Client-side authentication helpers for Zoom Clone.
 * Manages JWT tokens, token validation, and current user info in localStorage.
 */

const TOKEN_KEY = "zc_access_token";
const USER_KEY = "zc_user_info";

export interface AuthUser {
  id: string;
  display_name: string;
  email: string | null;
  avatar_url?: string | null;
}

export interface JwtPayload {
  sub: string;
  email: string | null;
  display_name: string;
  exp: number;
  iat: number;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function setStoredUser(user: AuthUser): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload) as JwtPayload;
  } catch {
    return null;
  }
}

export function isLoggedIn(): boolean {
  const token = getToken();
  if (!token) return false;
  const payload = parseJwt(token);
  if (!payload || !payload.exp) return false;
  return payload.exp * 1000 > Date.now();
}

export function getCurrentUserFromToken(): AuthUser | null {
  const token = getToken();
  if (!token) return null;
  const payload = parseJwt(token);
  if (!payload) return null;
  return {
    id: payload.sub,
    display_name: payload.display_name,
    email: payload.email,
  };
}
