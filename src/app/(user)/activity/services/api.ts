import { api } from "@/lib/api";
import type { DailyActivity } from "@/lib/types";

export const fetchActivityById = (id: string): Promise<DailyActivity> => {
  return api(`/api/v1/activities/${id}`, { method: "GET" });
};

export const createActivity = (data: DailyActivity) => {
  return api("/api/v1/activities", { method: "POST", body: JSON.stringify(data) });
};


