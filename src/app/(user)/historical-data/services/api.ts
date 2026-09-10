import { api } from "@/lib/api";
import type { DailyActivity } from "@/lib/types";

export async function fetchHistoricalActivities() {
  return api<DailyActivity[]>("/api/v1/activities");
}
