import { api, apiWithMeta } from "@/lib/api";
import type { TimesheetJobResponse, PaginatedResponse, TimesheetStatusResponse } from "@/lib/types";

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

/**
 * Retrieves the sign-off lifecycle state of a monthly timesheet.
 */
export async function getTimesheetStatus(
  year: number,
  month: number
): Promise<TimesheetStatusResponse> {
  return api<TimesheetStatusResponse>(`/api/v1/timesheets/status?year=${year}&month=${month}`);
}

/**
 * Signs the user's monthly timesheet, locking activity edits and issuing verification hash.
 */
export async function signTimesheet(
  year: number,
  month: number
): Promise<{ message: string; [key: string]: unknown }> {
  return api<{ message: string; [key: string]: unknown }>("/api/v1/timesheets/sign", {
    method: "POST",
    body: JSON.stringify({ year, month }),
  });
}

/**
 * Revokes a signed timesheet, unlocking daily activity mutations.
 */
export async function revokeTimesheet(
  year: number,
  month: number
): Promise<{ message: string; [key: string]: unknown }> {
  return api<{ message: string; [key: string]: unknown }>("/api/v1/timesheets/revoke", {
    method: "POST",
    body: JSON.stringify({ year, month }),
  });
}

/**
 * Returns the URL to download a generated timesheet via its secure magic token.
 */
export function getTimesheetDownloadUrl(token: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
  return `${baseUrl}/api/v1/timesheet/downloads/${encodeURIComponent(token)}`;
}
