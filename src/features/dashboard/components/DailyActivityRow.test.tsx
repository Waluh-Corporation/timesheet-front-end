import { describe, it, expect, beforeEach, afterEach } from "bun:test";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { DailyActivityRow } from "./DailyActivityRow";
import type { DailyActivity, BeritaAcaraStatusResponse } from "@/lib/types";

describe("DailyActivityRow Component", () => {
  let container: HTMLDivElement;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
      root = null;
    }
    container.remove();
  });

  it("renders '-' for normal working attendance without incident", async () => {
    const actData: DailyActivity = {
      id: 1,
      date: "2026-10-24",
      start_time: "08:00",
      end_time: "17:00",
      status: "P",
      activity: "Normal daily work",
      project_name: "Portal",
      project_id: "PORTAL",
      app_impacted: "Portal",
      is_berita_acara: false,
    };

    root = createRoot(container);
    await act(async () => {
      root?.render(
        <DailyActivityRow
          day={24}
          dateStr="2026-10-24"
          monthName="Oct"
          dow="Sat"
          isToday={false}
          isYesterday={false}
          isWeekend={false}
          activity={actData}
        />
      );
    });

    expect(container.textContent).toContain("Oct 24 · Sat");
    expect(container.textContent).toContain("08:00 - 17:00");
    expect(container.textContent).toContain("-");
    expect(container.textContent).not.toContain("Draft");
    expect(container.textContent).not.toContain("Signed");
  });

  it("renders 'Draft' badge when activity is_berita_acara and status is draft", async () => {
    const actData: DailyActivity = {
      id: 2,
      date: "2026-10-20",
      start_time: "09:30",
      end_time: "17:00",
      status: "P",
      activity: "Late arrival",
      project_name: "Portal",
      project_id: "PORTAL",
      app_impacted: "Portal",
      is_berita_acara: true,
      berita_acara_notes: "Technical clock-in issue",
    };

    root = createRoot(container);
    await act(async () => {
      root?.render(
        <DailyActivityRow
          day={20}
          dateStr="2026-10-20"
          monthName="Oct"
          dow="Tue"
          isToday={false}
          isYesterday={false}
          isWeekend={false}
          activity={actData}
          beritaAcaraStatus={null}
        />
      );
    });

    expect(container.textContent).toContain("BA");
    expect(container.textContent).toContain("Draft");
  });

  it("renders 'Awaiting Signature' badge when status is pending_witness", async () => {
    const actData: DailyActivity = {
      id: 3,
      date: "2026-10-20",
      start_time: "08:00",
      end_time: "17:00",
      status: "P",
      activity: "Late arrival",
      project_name: "Portal",
      project_id: "PORTAL",
      app_impacted: "Portal",
      is_berita_acara: true,
      berita_acara_notes: "Traffic jam",
    };

    const status: BeritaAcaraStatusResponse = {
      month: 10,
      year: 2026,
      status: "pending_witness",
      witness_name: "Jane Witness",
    };

    root = createRoot(container);
    await act(async () => {
      root?.render(
        <DailyActivityRow
          day={20}
          dateStr="2026-10-20"
          monthName="Oct"
          dow="Tue"
          isToday={false}
          isYesterday={false}
          isWeekend={false}
          activity={actData}
          beritaAcaraStatus={status}
        />
      );
    });

    expect(container.textContent).toContain("Awaiting Signature");
  });

  it("renders 'Signed' badge when status is signed", async () => {
    const actData: DailyActivity = {
      id: 4,
      date: "2026-10-18",
      start_time: "08:00",
      end_time: "17:00",
      status: "P",
      activity: "Missed time in",
      project_name: "Portal",
      project_id: "PORTAL",
      app_impacted: "Portal",
      is_berita_acara: true,
      berita_acara_notes: "Fingerprint scanner offline",
    };

    const status: BeritaAcaraStatusResponse = {
      month: 10,
      year: 2026,
      status: "signed",
      witness_name: "Jane Witness",
    };

    root = createRoot(container);
    await act(async () => {
      root?.render(
        <DailyActivityRow
          day={18}
          dateStr="2026-10-18"
          monthName="Oct"
          dow="Sun"
          isToday={false}
          isYesterday={false}
          isWeekend={false}
          activity={actData}
          beritaAcaraStatus={status}
        />
      );
    });

    expect(container.textContent).toContain("Signed");
  });

  it("renders 'Rejected' badge when status is rejected", async () => {
    const actData: DailyActivity = {
      id: 5,
      date: "2026-10-15",
      start_time: "08:00",
      end_time: "17:00",
      status: "P",
      activity: "Discrepancy",
      project_name: "Portal",
      project_id: "PORTAL",
      app_impacted: "Portal",
      is_berita_acara: true,
      berita_acara_notes: "Discrepancy",
    };

    const status: BeritaAcaraStatusResponse = {
      month: 10,
      year: 2026,
      status: "rejected",
      witness_name: "Jane Witness",
      witness_rejection_notes: "Please fix hours",
    };

    root = createRoot(container);
    await act(async () => {
      root?.render(
        <DailyActivityRow
          day={15}
          dateStr="2026-10-15"
          monthName="Oct"
          dow="Thu"
          isToday={false}
          isYesterday={false}
          isWeekend={false}
          activity={actData}
          beritaAcaraStatus={status}
        />
      );
    });

    expect(container.textContent).toContain("Rejected");
  });
});
