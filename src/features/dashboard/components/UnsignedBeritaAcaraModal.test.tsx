import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { UnsignedBeritaAcaraModal } from "./UnsignedBeritaAcaraModal";
import type { DailyActivity, WitnessResponse, BeritaAcaraStatusResponse } from "@/lib/types";

describe("UnsignedBeritaAcaraModal", () => {
  let container: HTMLDivElement;
  let root: Root | null = null;

  const mockWitness: WitnessResponse = {
    id: 12,
    name: "Jane Witness",
  };

  const mockActivities: DailyActivity[] = [
    {
      id: 101,
      date: "2026-10-05",
      start_time: "09:15",
      end_time: "17:00",
      status: "P",
      activity: "Core banking development",
      project_name: "Mobile Banking",
      project_id: "MB",
      app_impacted: "MB",
      is_berita_acara: true,
      berita_acara_notes: "Late due to transportation issue",
    },
    {
      id: 102,
      date: "2026-10-14",
      start_time: "08:00",
      end_time: "17:00",
      status: "P",
      activity: "Database maintenance",
      project_name: "Mobile Banking",
      project_id: "MB",
      app_impacted: "MB",
      is_berita_acara: true,
      berita_acara_notes: "Forgot to tap out when leaving",
    },
  ];

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

  it("renders when open and displays all unsigned attendance incident dates", async () => {
    root = createRoot(container);
    await act(async () => {
      root?.render(
        <UnsignedBeritaAcaraModal
          isOpen={true}
          onClose={() => {}}
          month={10}
          year={2026}
          monthlyWitness={mockWitness}
          unsignedActivities={mockActivities}
          beritaAcaraStatus={null}
        />
      );
    });

    expect(document.body.textContent).toContain("Cannot Generate Timesheet");
    expect(document.body.textContent).toContain("Witness Signature Guard Active");
    expect(document.body.textContent).toContain("Jane Witness");
    expect(document.body.textContent).toContain("Late due to transportation issue");
    expect(document.body.textContent).toContain("Forgot to tap out when leaving");
    expect(document.body.textContent).toContain("Draft (Unsubmitted)");
  });

  it("shows awaiting signature badge when status is pending_witness", async () => {
    const pendingStatus: BeritaAcaraStatusResponse = {
      id: "ba-1",
      month: 10,
      year: 2026,
      status: "pending_witness",
      witness_name: "Jane Witness",
    };

    root = createRoot(container);
    await act(async () => {
      root?.render(
        <UnsignedBeritaAcaraModal
          isOpen={true}
          onClose={() => {}}
          month={10}
          year={2026}
          monthlyWitness={mockWitness}
          unsignedActivities={mockActivities}
          beritaAcaraStatus={pendingStatus}
        />
      );
    });

    expect(document.body.textContent).toContain("Awaiting Signature");
    expect(document.body.textContent).toContain("Currently awaiting signature from Jane Witness");
  });

  it("calls onSubmitBeritaAcara when submit button is clicked", async () => {
    const onSubmit = mock(async () => {});
    const onClose = mock(() => {});

    root = createRoot(container);
    await act(async () => {
      root?.render(
        <UnsignedBeritaAcaraModal
          isOpen={true}
          onClose={onClose}
          month={10}
          year={2026}
          monthlyWitness={mockWitness}
          unsignedActivities={mockActivities}
          beritaAcaraStatus={null}
          onSubmitBeritaAcara={onSubmit}
        />
      );
    });

    const submitBtn = Array.from(document.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("Submit to Witness")
    );
    expect(submitBtn).toBeDefined();

    await act(async () => {
      submitBtn?.click();
    });

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders singular phrasing when only 1 activity is pending", async () => {
    root = createRoot(container);
    await act(async () => {
      root?.render(
        <UnsignedBeritaAcaraModal
          isOpen={true}
          onClose={() => {}}
          month={10}
          year={2026}
          monthlyWitness={mockWitness}
          unsignedActivities={[mockActivities[0]]}
          beritaAcaraStatus={null}
        />
      );
    });

    expect(document.body.textContent).toContain("Pending Attendance Incident Report (1)");
  });

  it("calls onRevokeBeritaAcara when cancel witness request button is clicked in modal footer", async () => {
    const onRevoke = mock(async () => {});
    const onClose = mock(() => {});
    const pendingStatus: BeritaAcaraStatusResponse = {
      id: "ba-1",
      month: 10,
      year: 2026,
      status: "pending_witness",
      witness_name: "Jane Witness",
    };
    const originalConfirm = window.confirm;
    window.confirm = () => true;

    try {
      root = createRoot(container);
      await act(async () => {
        root?.render(
          <UnsignedBeritaAcaraModal
            isOpen={true}
            onClose={onClose}
            month={10}
            year={2026}
            monthlyWitness={mockWitness}
            unsignedActivities={mockActivities}
            beritaAcaraStatus={pendingStatus}
            onRevokeBeritaAcara={onRevoke}
          />
        );
      });

      const cancelBtn = Array.from(document.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("Cancel Witness Request")
      );
      expect(cancelBtn).toBeDefined();

      await act(async () => {
        cancelBtn?.click();
      });

      expect(onRevoke).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    } finally {
      window.confirm = originalConfirm;
    }
  });
});
