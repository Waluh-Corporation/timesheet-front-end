"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchProjects,
  fetchActivityStatuses,
} from "@/features/admin-master-data/services/masterDataService";
import { fetchEligibleWitnesses } from "@/services/activityService";
import { fetchHolidays } from "@/features/dashboard/services/dashboardService";
import type { Project, ActivityStatus, WitnessResponse } from "@/lib/types";

export const MASTER_DATA_KEYS = {
  projects: ["master-data", "projects"] as const,
  activityStatuses: ["master-data", "activity-statuses"] as const,
  eligibleWitnesses: ["witnesses", "eligible"] as const,
  holidays: (year: number, month: number) => ["holidays", year, month] as const,
};

export function useProjectsQuery(options?: { enabled?: boolean }) {
  return useQuery<Project[]>({
    queryKey: MASTER_DATA_KEYS.projects,
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
  });
}

export function useActivityStatusesQuery(options?: { enabled?: boolean }) {
  return useQuery<ActivityStatus[]>({
    queryKey: MASTER_DATA_KEYS.activityStatuses,
    queryFn: fetchActivityStatuses,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
  });
}

export function useEligibleWitnessesQuery(options?: { enabled?: boolean }) {
  return useQuery<WitnessResponse[]>({
    queryKey: MASTER_DATA_KEYS.eligibleWitnesses,
    queryFn: fetchEligibleWitnesses,
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
  });
}

export function useHolidaysQuery(
  year: number,
  month: number,
  options?: { enabled?: boolean }
) {
  return useQuery<{ date: string; description: string }[]>({
    queryKey: MASTER_DATA_KEYS.holidays(year, month),
    queryFn: () => fetchHolidays(year, month),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? (Boolean(year) && Boolean(month)),
  });
}
