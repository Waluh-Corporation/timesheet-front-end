import { api, downloadFile } from "@/lib/api";
import type { DailyActivity } from "@/lib/types";

export async function fetchDashboardActivities(year: number, month: number) {
  return api<DailyActivity[]>(`/api/v1/activities?year=${year}&month=${month}`);
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
