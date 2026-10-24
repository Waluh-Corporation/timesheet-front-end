import { api } from "@/lib/api";
import type { UserSignatureResponse, UploadSignatureRequest } from "@/lib/types";

/**
 * Retrieves the signature presigned URL and status for the authenticated user.
 */
export async function getUserSignature(): Promise<UserSignatureResponse> {
  return api<UserSignatureResponse>("/api/v1/user/signature");
}

/**
 * Uploads a Base64-encoded PNG/JPEG signature image to storage and updates user profile.
 */
export async function uploadUserSignature(
  signatureBase64: string
): Promise<{ message: string; [key: string]: unknown }> {
  const payload: UploadSignatureRequest = {
    signature_base64: signatureBase64,
  };
  return api<{ message: string; [key: string]: unknown }>("/api/v1/user/signature", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Removes the saved signature for the authenticated user.
 */
export async function deleteUserSignature(): Promise<{ message: string; [key: string]: unknown }> {
  return api<{ message: string; [key: string]: unknown }>("/api/v1/user/signature", {
    method: "DELETE",
  });
}
