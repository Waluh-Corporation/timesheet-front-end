// Browser-side WebAuthn helpers. The backend speaks the standard
// PublicKeyCredentialCreationOptions / RequestOptions JSON shape, which the
// browser's credential API needs as ArrayBuffers — so we base64url-decode the
// challenge/id fields on the way in and re-encode on the way out.

import { api, setToken, setRefreshToken } from "./api";
import type { User, WebAuthnOriginsResponse, LoginResponse } from "./types";

function bufToBase64url(buf: ArrayBuffer | null | undefined): string {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let binary = "";
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlToBuf(value: string | ArrayBuffer | null | undefined): ArrayBuffer {
  if (!value) return new ArrayBuffer(0);
  if (value instanceof ArrayBuffer) return value;
  if (typeof value !== "string") return new ArrayBuffer(0);

  try {
    const pad = "=".repeat((4 - (value.length % 4)) % 4);
    const base64 = (value + pad).replace(/-/g, "+").replace(/_/g, "/");
    const raw = atob(base64);
    const bytes = new Uint8Array(raw.length);
    for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
    return bytes.buffer;
  } catch (err) {
    console.error("Failed to decode base64url string to ArrayBuffer", err);
    return new ArrayBuffer(0);
  }
}

export function passkeysSupported(): boolean {
  return typeof window !== "undefined" && !!window.PublicKeyCredential;
}

export async function isConditionalSupported(): Promise<boolean> {
  if (typeof window === "undefined" || !window.PublicKeyCredential) return false;
  if (typeof PublicKeyCredential.isConditionalMediationAvailable !== "function") return false;
  try {
    return await PublicKeyCredential.isConditionalMediationAvailable();
  } catch {
    return false;
  }
}

// registerPasskey runs a registration ceremony for the logged-in user.
// If friendlyName is omitted or empty, the backend automatically sets the name
// using the authenticator's AAGUID (e.g. Bitwarden, iCloud Keychain, Windows Hello).
export async function registerPasskey(friendlyName?: string) {
  const sanitizedName = friendlyName ? friendlyName.trim().slice(0, 100) : "";

  const { session_id, options } = await api<{ session_id: string; options: any }>(
    "/api/v1/passkey/register/begin",
    { method: "POST", body: JSON.stringify({}) }
  );

  if (!options?.publicKey) {
    throw new Error("Invalid passkey registration options received from server");
  }

  const publicKey = options.publicKey;
  publicKey.challenge = base64urlToBuf(publicKey.challenge);
  if (publicKey.user?.id) {
    publicKey.user.id = base64urlToBuf(publicKey.user.id);
  }
  if (Array.isArray(publicKey.excludeCredentials)) {
    publicKey.excludeCredentials = publicKey.excludeCredentials.map((c: any) => ({
      ...c,
      id: base64urlToBuf(c.id),
    }));
  }

  const credential = (await navigator.credentials.create({ publicKey })) as PublicKeyCredential | null;
  if (!credential) {
    throw new Error("No passkey credential created");
  }
  const response = credential.response as AuthenticatorAttestationResponse;

  const rawTransports =
    typeof response.getTransports === "function" ? response.getTransports() : [];
  const transports =
    rawTransports.length > 0
      ? rawTransports
      : credential.authenticatorAttachment === "platform"
      ? ["internal"]
      : [];

  const body = {
    id: credential.id,
    rawId: bufToBase64url(credential.rawId),
    type: credential.type,
    authenticatorAttachment: credential.authenticatorAttachment,
    response: {
      attestationObject: bufToBase64url(response.attestationObject),
      clientDataJSON: bufToBase64url(response.clientDataJSON),
      transports,
    },
    transports,
  };

  const nameParam = sanitizedName ? `&name=${encodeURIComponent(sanitizedName)}` : "";
  await api(
    `/api/v1/passkey/register/finish?session_id=${encodeURIComponent(session_id)}${nameParam}`,
    { method: "POST", body: JSON.stringify(body) }
  );
}

// loginWithPasskey runs an assertion ceremony and returns the authenticated
// user. With no identifier it performs a usernameless (discoverable) login —
// the browser offers whatever resident passkey it holds for this site.
// If optionsObj.conditional is true, it activates WebAuthn Conditional UI (autofill).
export async function loginWithPasskey(
  identifier = "",
  optionsObj?: { conditional?: boolean; signal?: AbortSignal }
): Promise<User> {
  const sanitizedIdentifier = (identifier || "").trim().slice(0, 254);

  const { session_id, options } = await api<{ session_id: string; options: any }>(
    "/api/v1/auth/passkey/login/begin",
    { method: "POST", auth: false, body: JSON.stringify({ identifier: sanitizedIdentifier }) }
  );

  if (!options?.publicKey) {
    throw new Error("Invalid passkey login options received from server");
  }

  const publicKey = options.publicKey;
  publicKey.challenge = base64urlToBuf(publicKey.challenge);
  if (Array.isArray(publicKey.allowCredentials)) {
    publicKey.allowCredentials = publicKey.allowCredentials.map((c: any) => ({
      ...c,
      id: base64urlToBuf(c.id),
    }));
  }

  const credentialRequestOptions: CredentialRequestOptions = {
    publicKey,
    mediation: optionsObj?.conditional ? "conditional" : "optional",
    signal: optionsObj?.signal,
  };

  const assertion = (await navigator.credentials.get(credentialRequestOptions)) as PublicKeyCredential | null;
  if (!assertion) {
    throw new Error("No passkey credential returned");
  }

  const response = assertion.response as AuthenticatorAssertionResponse;

  const body = {
    id: assertion.id,
    rawId: bufToBase64url(assertion.rawId),
    type: assertion.type,
    response: {
      authenticatorData: bufToBase64url(response.authenticatorData),
      clientDataJSON: bufToBase64url(response.clientDataJSON),
      signature: bufToBase64url(response.signature),
      userHandle: response.userHandle ? bufToBase64url(response.userHandle) : null,
    },
  };

  const res = await api<LoginResponse>(
    `/api/v1/auth/passkey/login/finish?session_id=${encodeURIComponent(session_id)}`,
    { method: "POST", auth: false, body: JSON.stringify(body) }
  );
  setToken(res.token);
  if (res.refresh_token) {
    setRefreshToken(res.refresh_token);
  }
  let userData = res.user;
  if (!userData) {
    userData = await api<User>("/api/v1/me");
  }
  return userData;
}

// fetchWebAuthnOrigins retrieves the W3C WebAuthn related origins document from backend
export async function fetchWebAuthnOrigins(): Promise<WebAuthnOriginsResponse> {
  return api<WebAuthnOriginsResponse>("/.well-known/webauthn", { auth: false });
}

