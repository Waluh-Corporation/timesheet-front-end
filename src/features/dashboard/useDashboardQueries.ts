"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchDashboardActivities } from "./services/dashboardService";
import { getBeritaAcaraStatus } from "@/services/beritaAcaraService";
import { getTimesheetStatus } from "@/services/timesheetService";
import type {
  DailyActivity,
  WitnessResponse,
  BeritaAcaraStatusResponse,
  TimesheetStatusResponse,
} from "@/lib/types";

export const DASHBOARD_QUERY_KEYS = {
  monthlyActivities: (year: number, month: number) =>
    ["activities", "monthly", year, month] as const,
  beritaAcaraStatus: (year: number, month: number) =>
    ["berita-acara-status", year, month] as const,
  timesheetStatus: (year: number, month: number) =>
    ["timesheet-status", year, month] as const,
};

export function useDashboardActivitiesQuery(
  year: number,
  month: number,
  options?: { enabled?: boolean }
) {
  return useQuery<{ activities: DailyActivity[]; monthlyWitness?: WitnessResponse }>({
    queryKey: DASHBOARD_QUERY_KEYS.monthlyActivities(year, month),
    queryFn: () => fetchDashboardActivities(year, month),
    staleTime: 1000 * 60, // 1 minute
    enabled: options?.enabled ?? (Boolean(year) && Boolean(month)),
  });
}

export function useBeritaAcaraStatusQuery(
  year: number,
  month: number,
  options?: { enabled?: boolean }
) {
  return useQuery<BeritaAcaraStatusResponse | null>({
    queryKey: DASHBOARD_QUERY_KEYS.beritaAcaraStatus(year, month),
    queryFn: () => getBeritaAcaraStatus(year, month).catch(() => null),
    staleTime: 1000 * 60, // 1 minute
    enabled: options?.enabled ?? (Boolean(year) && Boolean(month)),
  });
}

export function useTimesheetStatusQuery(
  year: number,
  month: number,
  options?: { enabled?: boolean }
) {
  return useQuery<TimesheetStatusResponse | null>({
    queryKey: DASHBOARD_QUERY_KEYS.timesheetStatus(year, month),
    queryFn: () => getTimesheetStatus(year, month).catch(() => null),
    staleTime: 1000 * 60, // 1 minute
    enabled: options?.enabled ?? (Boolean(year) && Boolean(month)),
  });
}
