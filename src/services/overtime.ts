import { api } from "@/lib/api";
import type { OvertimeEntry, OvertimeRequest } from "@/lib/types";

export async function fetchOvertimes(
  year: number,
  month: number
): Promise<OvertimeEntry[]> {
  try {
    return await api<OvertimeEntry[]>(
      `/api/v1/overtimes?year=${year}&month=${month}`
    );
  } catch (err) {
    console.error("Failed to load overtimes", err);
    return [];
  }
}

export async function upsertOvertime(
  data: OvertimeRequest
): Promise<OvertimeEntry> {
  return api<OvertimeEntry>("/api/v1/overtimes", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function deleteOvertime(id: number): Promise<{ message: string }> {
  return api<{ message: string }>(`/api/v1/overtimes/${id}`, {
    method: "DELETE",
  });
}
