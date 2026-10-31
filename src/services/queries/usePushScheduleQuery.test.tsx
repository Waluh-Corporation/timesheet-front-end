import { describe, it, expect, mock, beforeEach } from "bun:test";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePushScheduleQuery, PUSH_SCHEDULE_KEY } from "./usePushScheduleQuery";

const mockGetPushSchedule = mock(async () => ({
  hour: 17,
  minute: 0,
  timezone: "Asia/Jakarta",
  next_run: "2026-11-01T17:00:00+07:00",
  human_readable: "Daily at 17:00 (Asia/Jakarta)",
  cron_expression: "0 17 * * *",
  is_enabled: true,
}));

mock.module("@/lib/push", () => ({
  getPushSchedule: mockGetPushSchedule,
}));

describe("usePushScheduleQuery", () => {
  let container: HTMLDivElement;
  let queryClient: QueryClient;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    mockGetPushSchedule.mockClear();
  });

  it("has correct query key", () => {
    expect(PUSH_SCHEDULE_KEY).toEqual(["push", "schedule"]);
  });

  it("fetches push schedule successfully", async () => {
    let capturedData: any = null;

    function TestComponent() {
      const { data } = usePushScheduleQuery();
      capturedData = data;
      return null;
    }

    const root = createRoot(container);
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );
    });

    // Wait for promise resolution
    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(mockGetPushSchedule).toHaveBeenCalled();
    expect(capturedData).toBeDefined();
    expect(capturedData?.hour).toBe(17);
    expect(capturedData?.timezone).toBe("Asia/Jakarta");
    expect(capturedData?.is_enabled).toBe(true);

    act(() => {
      root.unmount();
    });
  });

  it("returns null when fetch fails", async () => {
    mockGetPushSchedule.mockImplementationOnce(async () => {
      throw new Error("Network error");
    });

    let capturedData: any = "initial";

    function TestComponent() {
      const { data } = usePushScheduleQuery();
      capturedData = data;
      return null;
    }

    const root = createRoot(container);
    await act(async () => {
      root.render(
        <QueryClientProvider client={queryClient}>
          <TestComponent />
        </QueryClientProvider>
      );
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 20));
    });

    expect(capturedData).toBeNull();

    act(() => {
      root.unmount();
    });
  });
});
