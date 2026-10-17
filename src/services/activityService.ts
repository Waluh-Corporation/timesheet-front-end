import { api } from "@/lib/api";
import type {
  DailyActivity,
  WitnessResponse,
  UpdateMonthlyWitnessRequest,
} from "@/lib/types";

/**
 * Retrieves the list of eligible witnesses for Berita Acara
 * (active users excluding the current user).
 */
export async function fetchEligibleWitnesses(): Promise<WitnessResponse[]> {
  try {
    return await api<WitnessResponse[]>("/api/v1/users/witnesses");
  } catch (err) {
    console.error("Failed to load eligible witnesses", err);
    return [];
  }
}

/**
 * Updates witness for all Berita Acara daily activities in the specified month and year.
 */
export async function updateMonthlyWitness(
  payload: UpdateMonthlyWitnessRequest
): Promise<{ message: string }> {
  return api<{ message: string }>("/api/v1/activities/witness", {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

/**
 * Retrieves the most recent active daily activity strictly before the specified reference date.
 * Useful for autofilling / copying activity fields.
 */
export async function fetchPreviousDayActivity(
  date?: string
): Promise<DailyActivity> {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  return api<DailyActivity>(`/api/v1/activities/previous${query}`);
}

/**
 * Retrieves detailed daily activity by ID.
 */
export async function fetchActivityDetail(
  id: number | string
): Promise<DailyActivity> {
  return api<DailyActivity>(`/api/v1/activities/${id}`);
}

/**
 * Creates or updates a daily activity record for the authenticated user.
 */
export async function upsertActivity(
  data: Partial<DailyActivity>
): Promise<{ message: string }> {
  return api<{ message: string }>("/api/v1/activities", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
