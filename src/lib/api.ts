// Thin fetch wrapper around the Go backend API.
//
// The base URL is configurable via NEXT_PUBLIC_API_URL (baked at build time).
// When unset it defaults to "" — i.e. same-origin, relative "/api/v1/..." paths —
// which is exactly what the single unified image needs, since the Go server
// serves this frontend and the API from the same host. For local `bun run dev`
// against a separately-running backend, set NEXT_PUBLIC_API_URL=http://localhost:8080
// (the dev docker-compose already does this).

export function getApiBase(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // In development, when frontend is accessed via localhost:3000,
  // automatically route API calls to local backend on port 8080.
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") &&
    window.location.port === "3000"
  ) {
    return "http://localhost:8080";
  }
  return "";
}

export const API_BASE = getApiBase();

const TOKEN_KEY = "ts_auth_token";

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cleanName = name.replace(/[\r\n]/g, "");
  const regex = new RegExp("(?:^|; )" + cleanName.replace(/([.$?*|{}()[\]\\/+^])/g, String.raw`\$1`) + "=([^;]*)");
  const match = regex.exec(document.cookie);
  return match ? decodeURIComponent(match[1]) : null;
}

export function setCookie(name: string, value: string, days = 7) {
  if (typeof document === "undefined") return;
  const cleanName = name.replace(/[\r\n;=]/g, "").trim();
  const cleanValue = value.replace(/[\r\n;]/g, "").trim();
  const maxAge = days * 24 * 60 * 60;
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${cleanName}=${encodeURIComponent(cleanValue)}; path=/; max-age=${maxAge}; SameSite=Lax${secure}`;
}

export function deleteCookie(name: string) {
  if (typeof document === "undefined") return;
  const cleanName = name.replace(/[\r\n;=]/g, "").trim();
  const secure = typeof window !== "undefined" && window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${cleanName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secure}`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  const cookieVal = getCookie(TOKEN_KEY);
  if (cookieVal) return cookieVal;

  // Migration from legacy localStorage: move to cookie and purge from localStorage immediately
  try {
    const localVal = window.localStorage.getItem(TOKEN_KEY);
    if (localVal) {
      setCookie(TOKEN_KEY, localVal);
      window.localStorage.removeItem(TOKEN_KEY);
      return localVal;
    }
  } catch {
    // Ignore restricted localStorage in sandboxed environments
  }
  return null;
}

export function setToken(token: string) {
  setCookie(TOKEN_KEY, token);
  // Purge token from localStorage to prevent XSS exposure
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Ignore
    }
  }
}

export function clearToken() {
  deleteCookie(TOKEN_KEY);
  if (typeof window !== "undefined") {
    try {
      window.localStorage.removeItem(TOKEN_KEY);
    } catch {
      // Ignore
    }
  }
}

interface RequestOptions extends RequestInit {
  auth?: boolean;
}

export async function api<T = any>(
  path: string,
  opts: RequestOptions = {}
): Promise<T> {
  const headers = new Headers(opts.headers);
  if (!(opts.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (opts.auth !== false) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(`${getApiBase()}${path}`, {
    ...opts,
    credentials: opts.credentials || "include",
    headers,
  });

  if (res.status === 401 && typeof window !== "undefined") {
    clearToken();
  }

  const contentType = res.headers.get("content-type") || "";
  if (!res.ok) {
    await handleApiError(res, contentType);
  }

  return parseApiResponse<T>(res, contentType);
}

async function handleApiError(res: Response, contentType: string) {
  let message = res.statusText;
  if (contentType.includes("application/json")) {
    const data = await res.json().catch(() => null);
    if (data?.error) message = data.error;
    else if (data?.message) message = data.message;
  }
  throw new Error(message);
}

async function parseApiResponse<T>(res: Response, contentType: string): Promise<T> {
  if (contentType.includes("application/json")) {
    const json = await res.json();
    if (json && typeof json === "object" && "data" in json && "code" in json) {
      return json.data as T;
    }
    return json as T;
  }
  // Non-JSON (e.g. file downloads) returned as blob.
  return res.blob() as unknown as T;
}

// downloadFile POSTs a JSON body and triggers a browser download of the
// returned binary stream (used for timesheet generation).
export async function downloadFile(
  path: string,
  body: unknown,
  fallbackName: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${getApiBase()}${path}`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(data.error || data.message || "download failed");
  }

  const disposition = res.headers.get("content-disposition") || "";
  const match = /filename=([^;]+)/.exec(disposition);
  const filename = match ? match[1].trim() : fallbackName;

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
