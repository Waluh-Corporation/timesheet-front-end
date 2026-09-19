import { api, apiWithMeta } from "@/lib/api";
import type { DailyActivity, ActivityFilterParams, PaginationMeta } from "@/lib/types";

export async function fetchHistoricalActivities(params?: ActivityFilterParams) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit !== undefined) query.set("limit", params.limit.toString());
  else query.set("limit", "-1");
  if (params?.all) query.set("all", "true");
  if (params?.year) query.set("year", params.year.toString());
  if (params?.month) query.set("month", params.month.toString());
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);
  if (params?.status_id) query.set("status_id", params.status_id.toString());
  if (params?.sort) query.set("sort", params.sort);

  return api<DailyActivity[]>(`/api/v1/activities?${query.toString()}`);
}

export async function fetchHistoricalActivitiesWithMeta(params?: ActivityFilterParams): Promise<{
  data: DailyActivity[];
  pagination?: PaginationMeta;
}> {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", params.page.toString());
  if (params?.limit !== undefined) query.set("limit", params.limit.toString());
  if (params?.all) query.set("all", "true");
  if (params?.year) query.set("year", params.year.toString());
  if (params?.month) query.set("month", params.month.toString());
  if (params?.start_date) query.set("start_date", params.start_date);
  if (params?.end_date) query.set("end_date", params.end_date);
  if (params?.status_id) query.set("status_id", params.status_id.toString());
  if (params?.sort) query.set("sort", params.sort);

  const res = await apiWithMeta<DailyActivity[]>(`/api/v1/activities?${query.toString()}`);
  return {
    data: res.data || [],
    pagination: res.pagination,
  };
}
