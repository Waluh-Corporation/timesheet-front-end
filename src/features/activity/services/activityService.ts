import { api } from "@/lib/api";
import type {
  DailyActivity,
  WitnessResponse,
  UpdateMonthlyWitnessRequest,
} from "@/lib/types";
import {
  fetchEligibleWitnesses,
  updateMonthlyWitness,
  fetchPreviousDayActivity,
  fetchActivityDetail,
  upsertActivity,
} from "@/services/activityService";

export {
  fetchEligibleWitnesses,
  updateMonthlyWitness,
  fetchPreviousDayActivity,
  fetchActivityDetail,
  upsertActivity,
};

export const fetchActivityById = (id: string): Promise<DailyActivity> => {
  return api<DailyActivity>(`/api/v1/activities/${id}`, { method: "GET" });
};

export const createActivity = (data: DailyActivity) => {
  return api("/api/v1/activities", { method: "POST", body: JSON.stringify(data) });
};
