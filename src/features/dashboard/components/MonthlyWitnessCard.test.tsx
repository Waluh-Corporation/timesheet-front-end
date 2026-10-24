import { describe, it, expect, beforeEach, afterEach, mock } from "bun:test";
import React, { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { MonthlyWitnessCard } from "./MonthlyWitnessCard";
import type { WitnessResponse, BeritaAcaraStatusResponse } from "@/lib/types";

describe("MonthlyWitnessCard", () => {
  let container: HTMLDivElement;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root?.unmount();
      });
      root = null;
    }
    container.remove();
  });

  it("renders unassigned state with warning callout and button", async () => {
    root = createRoot(container);
    await act(async () => {
      root?.render(
        <MonthlyWitnessCard
          month={10}
          year={2026}
          monthlyWitness={undefined}
          onOpenWitnessModal={() => {}}
        />
      );
    });

    expect(container.textContent).toContain("No Witness Assigned for October 2026");
    expect(container.textContent).toContain("Select Monthly Witness");
  });

  it("renders assigned state with witness name and locked badge", async () => {
    const witness: WitnessResponse = {
      id: 12,
      name: "Budi Santoso",
      employee_id: "EMP-0012",
      division: "Core Banking",
    };

    const status: BeritaAcaraStatusResponse = {
      month: 10,
      year: 2026,
      status: "signed",
      witness_name: "Budi Santoso",
    };

    root = createRoot(container);
    await act(async () => {
      root?.render(
        <MonthlyWitnessCard
          month={10}
          year={2026}
          monthlyWitness={witness}
          beritaAcaraStatus={status}
          onOpenWitnessModal={() => {}}
        />
      );
    });

    expect(container.textContent).toContain("Budi Santoso");
    expect(container.textContent).toContain("Core Banking");
    expect(container.textContent).toContain("Locked Witness for October 2026");
  });

  it("renders 'Submit to Witness' button and triggers onSubmitBeritaAcara when clicked", async () => {
    const witness: WitnessResponse = {
      id: 12,
      name: "Budi Santoso",
      division: "Core Banking",
    };
    const onSubmit = mock(() => {});

    root = createRoot(container);
    await act(async () => {
      root?.render(
        <MonthlyWitnessCard
          month={10}
          year={2026}
          monthlyWitness={witness}
          beritaAcaraCount={5}
          beritaAcaraStatus={null}
          onSubmitBeritaAcara={onSubmit}
        />
      );
    });

    expect(container.textContent).toContain("5 Reports Pending Submission");
    expect(container.textContent).toContain("Submit to Witness (5 days)");

    const submitBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
      btn.textContent?.includes("Submit to Witness")
    );
    expect(submitBtn).not.toBeUndefined();

    await act(async () => {
      submitBtn?.click();
    });
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("renders 'Reports Awaiting Witness' badge when pending_witness", async () => {
    const witness: WitnessResponse = {
      id: 12,
      name: "Budi Santoso",
      division: "Core Banking",
    };
    const status: BeritaAcaraStatusResponse = {
      month: 10,
      year: 2026,
      status: "pending_witness",
      witness_name: "Budi Santoso",
    };

    root = createRoot(container);
    await act(async () => {
      root?.render(
        <MonthlyWitnessCard
          month={10}
          year={2026}
          monthlyWitness={witness}
          beritaAcaraCount={3}
          beritaAcaraStatus={status}
        />
      );
    });

    expect(container.textContent).toContain("3 Reports Awaiting Witness");
    expect(container.textContent).toContain("Witness Locked");
  });

  it("renders singular phrasing when beritaAcaraCount is 1", async () => {
    const witness: WitnessResponse = {
      id: 12,
      name: "Budi Santoso",
      division: "Core Banking",
    };

    root = createRoot(container);
    await act(async () => {
      root?.render(
        <MonthlyWitnessCard
          month={10}
          year={2026}
          monthlyWitness={witness}
          beritaAcaraCount={1}
          beritaAcaraStatus={null}
          onSubmitBeritaAcara={() => {}}
        />
      );
    });

    expect(container.textContent).toContain("1 Report Pending Submission");
    expect(container.textContent).toContain("Submit to Witness (1 day)");
  });

  it("renders 'Cancel Witness Request' button when pending_witness and triggers onRevokeBeritaAcara on confirm", async () => {
    const witness: WitnessResponse = {
      id: 12,
      name: "Budi Santoso",
      division: "Core Banking",
    };
    const status: BeritaAcaraStatusResponse = {
      month: 10,
      year: 2026,
      status: "pending_witness",
      witness_name: "Budi Santoso",
    };
    const onRevoke = mock(() => {});
    const originalConfirm = window.confirm;
    window.confirm = () => true;

    try {
      root = createRoot(container);
      await act(async () => {
        root?.render(
          <MonthlyWitnessCard
            month={10}
            year={2026}
            monthlyWitness={witness}
            beritaAcaraCount={1}
            beritaAcaraStatus={status}
            onRevokeBeritaAcara={onRevoke}
          />
        );
      });

      const cancelBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("Cancel Witness Request")
      );
      expect(cancelBtn).not.toBeUndefined();

      await act(async () => {
        cancelBtn?.click();
      });
      expect(onRevoke).toHaveBeenCalledTimes(1);
    } finally {
      window.confirm = originalConfirm;
    }
  });

  it("renders 'Revoke BA Signature' button when signed and triggers onRevokeBeritaAcara on confirm", async () => {
    const witness: WitnessResponse = {
      id: 12,
      name: "Budi Santoso",
      division: "Core Banking",
    };
    const status: BeritaAcaraStatusResponse = {
      month: 10,
      year: 2026,
      status: "signed",
      witness_name: "Budi Santoso",
    };
    const onRevoke = mock(() => {});
    const originalConfirm = window.confirm;
    window.confirm = () => true;

    try {
      root = createRoot(container);
      await act(async () => {
        root?.render(
          <MonthlyWitnessCard
            month={10}
            year={2026}
            monthlyWitness={witness}
            beritaAcaraCount={1}
            beritaAcaraStatus={status}
            onRevokeBeritaAcara={onRevoke}
          />
        );
      });

      const revokeBtn = Array.from(container.querySelectorAll("button")).find((btn) =>
        btn.textContent?.includes("Revoke BA Signature")
      );
      expect(revokeBtn).not.toBeUndefined();

      await act(async () => {
        revokeBtn?.click();
      });
      expect(onRevoke).toHaveBeenCalledTimes(1);
    } finally {
      window.confirm = originalConfirm;
    }
  });
});
