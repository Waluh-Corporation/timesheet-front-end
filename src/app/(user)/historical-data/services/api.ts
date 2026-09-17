import { api } from "@/lib/api";
import type { DailyActivity } from "@/lib/types";

export async function fetchHistoricalActivities(params?: {
  year?: number;
  month?: number;
  limit?: number;
  all?: boolean;
}) {
  const query = new URLSearchParams();
  if (params?.year) query.set("year", params.year.toString());
  if (params?.month) query.set("month", params.month.toString());
  query.set("limit", params?.limit !== undefined ? params.limit.toString() : "-1");
  return api<DailyActivity[]>(`/api/v1/activities?${query.toString()}`);
}
