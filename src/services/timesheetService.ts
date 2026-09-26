import { api, apiWithMeta } from "@/lib/api";
import type { TimesheetJobResponse, PaginatedResponse } from "@/lib/types";

export interface TimesheetJobsQueryParams {
  page?: number;
  limit?: number;
}

/**
 * Enqueues a monthly timesheet generation task asynchronously.
 * Backend responds with 202 Accepted and the job details.
 */
export async function requestTimesheetGeneration(
  year: number,
  month: number
): Promise<TimesheetJobResponse> {
  return api<TimesheetJobResponse>("/api/v1/timesheet/generate", {
    method: "POST",
    body: JSON.stringify({ year, month }),
  });
}

/**
 * Returns recent timesheet generation jobs for the authenticated user.
 */
export async function getTimesheetJobs(
  params?: TimesheetJobsQueryParams
): Promise<PaginatedResponse<TimesheetJobResponse[]>> {
  const query = new URLSearchParams();
  if (params?.page) query.append("page", params.page.toString());
  if (params?.limit) query.append("limit", params.limit.toString());

  const qs = query.toString();
  const endpoint = `/api/v1/timesheet/jobs${qs ? `?${qs}` : ""}`;
  return (await apiWithMeta<TimesheetJobResponse[]>(endpoint)) as PaginatedResponse<TimesheetJobResponse[]>;
}

/**
 * Checks status and download URL of an asynchronous timesheet generation job.
 */
export async function getTimesheetJobStatus(
  id: string
): Promise<TimesheetJobResponse> {
  return api<TimesheetJobResponse>(`/api/v1/timesheet/jobs/${id}`);
}
