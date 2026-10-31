"use client";

import { useQuery } from "@tanstack/react-query";
import { getPendingWitnessRequests } from "@/services/beritaAcaraService";
import type { WitnessRequestItem } from "@/lib/types";

export const WITNESS_REQUESTS_KEY = ["witness-requests", "pending"] as const;

export function usePendingWitnessRequestsQuery(options?: { enabled?: boolean }) {
  return useQuery<WitnessRequestItem[]>({
    queryKey: WITNESS_REQUESTS_KEY,
    queryFn: getPendingWitnessRequests,
    staleTime: 1000 * 60, // 1 minute
    enabled: options?.enabled ?? true,
  });
}
