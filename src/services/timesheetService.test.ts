import { describe, it, expect, beforeEach, mock } from "bun:test";
import {
  requestTimesheetGeneration,
  getTimesheetJobs,
  getTimesheetJobStatus,
} from "./timesheetService";

describe("timesheetService integration tests", () => {
  beforeEach(() => {
    if (typeof document !== "undefined") {
      document.cookie = "";
    }
  });

  it("requestTimesheetGeneration posts to /api/v1/timesheet/generate", async () => {
    let calledUrl = "";
    let calledMethod = "";
    let calledBody = "";

    (globalThis as any).fetch = mock(async (url: string, opts: any) => {
      calledUrl = url;
      calledMethod = opts?.method || "GET";
      calledBody = opts?.body || "";
      return new Response(
        JSON.stringify({
          id: "job-uuid-123",
          user_id: 1,
          month: 9,
          year: 2026,
          status: "queued",
          created_at: "2026-09-23T10:00:00Z",
        }),
        { status: 202, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await requestTimesheetGeneration(2026, 9);
    expect(calledUrl).toContain("/api/v1/timesheet/generate");
    expect(calledMethod).toBe("POST");
    expect(JSON.parse(calledBody)).toEqual({ year: 2026, month: 9 });
    expect(res.id).toBe("job-uuid-123");
    expect(res.status).toBe("queued");
  });

  it("getTimesheetJobs queries /api/v1/timesheet/jobs with query params", async () => {
    let calledUrl = "";

    (globalThis as any).fetch = mock(async (url: string) => {
      calledUrl = url;
      return new Response(
        JSON.stringify({
          code: 200,
          status: "success",
          data: [
            {
              id: "job-1",
              user_id: 1,
              month: 9,
              year: 2026,
              status: "completed",
              download_url: "https://s3.example.com/timesheet.xlsx",
              created_at: "2026-09-23T10:00:00Z",
            },
          ],
          pagination: {
            page: 1,
            limit: 10,
            total_pages: 1,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await getTimesheetJobs({ page: 1, limit: 10 });
    expect(calledUrl).toContain("/api/v1/timesheet/jobs?page=1&limit=10");
    expect(res.data.length).toBe(1);
    expect(res.data[0].status).toBe("completed");
    expect(res.data[0].download_url).toBe("https://s3.example.com/timesheet.xlsx");
  });

  it("getTimesheetJobStatus queries /api/v1/timesheet/jobs/:id", async () => {
    let calledUrl = "";

    (globalThis as any).fetch = mock(async (url: string) => {
      calledUrl = url;
      return new Response(
        JSON.stringify({
          id: "job-xyz-789",
          user_id: 1,
          month: 8,
          year: 2026,
          status: "processing",
          created_at: "2026-09-23T09:30:00Z",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await getTimesheetJobStatus("job-xyz-789");
    expect(calledUrl).toContain("/api/v1/timesheet/jobs/job-xyz-789");
    expect(res.id).toBe("job-xyz-789");
    expect(res.status).toBe("processing");
  });
});
