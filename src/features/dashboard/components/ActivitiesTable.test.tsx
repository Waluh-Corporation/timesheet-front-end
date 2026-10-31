import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ActivitiesTable } from "./ActivitiesTable";
import { useTimesheetStore } from "../useTimesheetStore";

// Mock next/navigation
mock.module("next/navigation", () => ({
  useRouter: () => ({ push: () => {}, replace: () => {} }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams("page=1&limit=10"),
}));

// Mock api
mock.module("@/lib/api", () => ({
  default: () => Promise.resolve({ data: [] }),
  apiWithMeta: () =>
    Promise.resolve({
      data: [
        {
          id: 101,
          date: "2026-10-14",
          start_time: "08:00",
          end_time: "17:00",
          status: "P",
          activity: "API Gateway Migration",
          project_name: "Timesheet",
          project_id: "TS",
          app_impacted: "Portal",
          is_berita_acara: true,
          berita_acara_notes: "Biometric clock error",
        },
      ],
      meta: {
        pagination: {
          page: 1,
          limit: 10,
          total_rows: 1,
          total_pages: 1,
        },
      },
    }),
}));

describe("ActivitiesTable", () => {
  let container: HTMLDivElement;
  let root: Root | null = null;
  let queryClient: QueryClient;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    useTimesheetStore.setState({ page: 1, limit: 10, month: 10, year: 2026 });
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
      root = null;
    }
    container.remove();
    queryClient.clear();
  });

  it("renders table with activities and pagination controls", async () => {
    root = createRoot(container);
    await act(async () => {
      root?.render(
        <QueryClientProvider client={queryClient}>
          <ActivitiesTable />
        </QueryClientProvider>
      );
    });

    // Wait for query resolution
    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(container.textContent).toContain("Date");
    expect(container.textContent).toContain("Activity / Description");
    expect(container.textContent).toContain("Berita Acara");
    expect(container.textContent).toContain("API Gateway Migration");
  });
});
