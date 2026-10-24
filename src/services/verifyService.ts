import { api } from "@/lib/api";
import type { DocVerificationResponse } from "@/lib/types";

/**
 * Validates the authenticity and signature audit trail of a Timesheet or Berita Acara via verification token.
 */
export async function verifyDocument(token: string): Promise<DocVerificationResponse> {
  return api<DocVerificationResponse>(`/api/v1/verify/doc/${encodeURIComponent(token)}`);
}
