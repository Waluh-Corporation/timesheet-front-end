"use client";

import { useQuery } from "@tanstack/react-query";
import { getPushSchedule } from "@/lib/push";
import type { PushScheduleResponse } from "@/lib/types";

export const PUSH_SCHEDULE_KEY = ["push", "schedule"] as const;

export function usePushScheduleQuery(options?: { enabled?: boolean }) {
  return useQuery<PushScheduleResponse | null>({
    queryKey: PUSH_SCHEDULE_KEY,
    queryFn: () => getPushSchedule().catch(() => null),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
  });
}
