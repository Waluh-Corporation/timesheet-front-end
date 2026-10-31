import { api } from "@/lib/api";
import type {
  BeritaAcaraStatusResponse,
  SubmitBeritaAcaraRequest,
  WitnessActionRequest,
  WitnessRequestItem,
} from "@/lib/types";

/**
 * Retrieves the sign-off lifecycle state of a monthly Berita Acara.
 */
export async function getBeritaAcaraStatus(
  year: number,
  month: number
): Promise<BeritaAcaraStatusResponse> {
  return api<BeritaAcaraStatusResponse>(`/api/v1/berita-acara/status?year=${year}&month=${month}`);
}

/**
 * Submits monthly Berita Acara with employee signature and assigns a witness for approval.
 * If witness_id is omitted or 0, backend automatically detects and uses the locked monthly witness.
 */
export async function submitBeritaAcara(
  year: number,
  month: number,
  witness_id?: number
): Promise<{ message: string; [key: string]: unknown }> {
  const payload: SubmitBeritaAcaraRequest = {
    year,
    month,
    ...(witness_id && witness_id > 0 ? { witness_id } : {}),
  };
  return api<{ message: string; [key: string]: unknown }>("/api/v1/berita-acara/submit", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * Lists all Berita Acara submissions awaiting the authenticated user's signature as a witness.
 */
export async function getPendingWitnessRequests(): Promise<WitnessRequestItem[]> {
  const res = await api<WitnessRequestItem[] | { data: WitnessRequestItem[] }>("/api/v1/berita-acara/witness-requests");
  if (Array.isArray(res)) {
    return res;
  }
  return (res as { data: WitnessRequestItem[] })?.data || [];
}

/**
 * Revokes a pending or signed Berita Acara back to draft.
 */
export async function revokeBeritaAcara(
  id: string | number
): Promise<{ message: string; [key: string]: unknown }> {
  return api<{ message: string; [key: string]: unknown }>(`/api/v1/berita-acara/${id}/revoke`, {
    method: "POST",
  });
}

/**
 * Allows the designated witness to sign/approve or reject with revision notes.
 */
export async function witnessAction(
  id: string | number,
  action: "approve" | "reject",
  notes?: string
): Promise<{ message: string; [key: string]: unknown }> {
  const payload: WitnessActionRequest = {
    action,
    notes,
  };
  return api<{ message: string; [key: string]: unknown }>(`/api/v1/berita-acara/${id}/witness-action`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
