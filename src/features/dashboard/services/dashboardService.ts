import { api, apiWithMeta, downloadFile } from "@/lib/api";
import type { DailyActivity, WitnessResponse } from "@/lib/types";
import {
  requestTimesheetGeneration,
  getTimesheetJobs,
  getTimesheetJobStatus,
} from "@/services/timesheetService";

export { requestTimesheetGeneration, getTimesheetJobs, getTimesheetJobStatus };

export async function fetchDashboardActivities(
  year: number,
  month: number
): Promise<{ activities: DailyActivity[]; monthlyWitness?: WitnessResponse }> {
  const res = await apiWithMeta<DailyActivity[]>(
    `/api/v1/activities?year=${year}&month=${month}&limit=-1`
  );
  return {
    activities: Array.isArray(res?.data) ? res.data : [],
    monthlyWitness: res?.monthly_witness,
  };
}

export async function fetchHolidays(year: number, month: number) {
  return api<{ date: string; description: string }[]>(
    `/api/v1/holidays?year=${year}&month=${month}`
  ).catch(() => []);
}

export async function downloadTimesheet(year: number, month: number) {
  return downloadFile(
    "/api/v1/timesheet/generate",
    { month, year },
    `Timesheet_${month}_${year}.xlsx`
  );
}
