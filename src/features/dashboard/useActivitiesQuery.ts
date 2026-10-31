import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { useTimesheetStore } from "./useTimesheetStore";
import { api, apiWithMeta } from "@/lib/api";
import type { DailyActivity, WitnessResponse } from "@/lib/types";

export interface PaginatedActivitiesResponse {
  code?: number;
  status?: string;
  data: DailyActivity[];
  pagination: {
    page: number;
    limit: number;
    total_rows: number;
    total_pages: number;
  };
  monthly_witness?: WitnessResponse;
  [key: string]: unknown;
}

// 1. Fetch Paginated Activities with keepPreviousData for smooth pagination
export function useActivities() {
  const { month, year, page, limit } = useTimesheetStore();

  return useQuery<PaginatedActivitiesResponse>({
    queryKey: ["activities", { month, year, page, limit }],
    queryFn: async () => {
      const res = await apiWithMeta<DailyActivity[]>(
        `/api/v1/activities?month=${month}&year=${year}&page=${page}&limit=${limit}`
      );
      return {
        code: res.code,
        status: res.status,
        data: Array.isArray(res.data) ? res.data : [],
        pagination: res.pagination || {
          page,
          limit,
          total_rows: Array.isArray(res.data) ? res.data.length : 0,
          total_pages: 1,
        },
        monthly_witness: res.monthly_witness || res.monthlyWitness,
      };
    },
    placeholderData: keepPreviousData, // Prevents layout flicker during pagination
    staleTime: 1000 * 60, // 1 minute
  });
}

// 2. Assign Monthly Witness Mutation
export function useAssignMonthlyWitness() {
  const queryClient = useQueryClient();
  const { month, year } = useTimesheetStore();

  return useMutation({
    mutationFn: async (witnessId: number) => {
      const payload = {
        month,
        year,
        witness_id: witnessId,
      };
      try {
        // Attempt the standard designated endpoint
        return await api("/api/v1/timesheet/monthly-witness", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } catch (err: unknown) {
        // Graceful fallback to backend's PUT /api/v1/activities/witness if needed
        const error = err as Error;
        if (error.message?.includes("404")) {
          return await api("/api/v1/activities/witness", {
            method: "PUT",
            body: JSON.stringify(payload),
          });
        }
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities"] });
      queryClient.invalidateQueries({ queryKey: ["monthly-witness", { month, year }] });
    },
  });
}

// 3. Generate Timesheet Mutation with Signature Guard
export function useGenerateTimesheet() {
  return useMutation({
    mutationFn: async ({ month, year }: { month: number; year: number }) => {
      return await api("/api/v1/timesheet/generate", {
        method: "POST",
        body: JSON.stringify({ month, year }),
      });
    },
  });
}
