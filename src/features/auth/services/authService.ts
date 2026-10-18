import { api } from "@/lib/api";
import type { VerifyResetTokenResponse } from "@/lib/types";

export async function requestPasswordReset(email: string): Promise<void> {
  await api("/api/v1/auth/forgot-password", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ email }),
  });
}

export async function verifyResetToken(token: string): Promise<VerifyResetTokenResponse> {
  return await api<VerifyResetTokenResponse>(
    `/api/v1/auth/reset-password/verify?token=${encodeURIComponent(token)}`,
    { auth: false }
  );
}

export async function submitPasswordReset(token: string, password: string): Promise<void> {
  await api("/api/v1/auth/reset-password", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ token, password }),
  });
}
