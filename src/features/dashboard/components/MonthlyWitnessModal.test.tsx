import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { MonthlyWitnessModal } from "./MonthlyWitnessModal";
import type { WitnessResponse, BeritaAcaraStatusResponse } from "@/lib/types";

// Stable mock for Toast
const mockNotify = mock(() => {});
mock.module("@/components/Toast", () => ({
  useToast: () => ({
    notify: mockNotify,
  }),
}));

// Mock activityService
const mockWitnessList: WitnessResponse[] = [
  { id: 10, name: "Maman Resing", username: "maman" },
  { id: 11, name: "Siti Rahma", username: "siti" },
];

mock.module("@/services/activityService", () => ({
  fetchEligibleWitnesses: mock(async () => mockWitnessList),
  updateMonthlyWitness: mock(async () => ({ message: "Witness updated" })),
}));

describe("MonthlyWitnessModal Component", () => {
  let container: HTMLDivElement;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    mockNotify.mockClear();
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

  it("renders modal with witness select when open in draft state", async () => {
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <MonthlyWitnessModal
          isOpen={true}
          onClose={() => {}}
          year={2026}
          month={10}
          beritaAcaraCount={3}
          onWitnessUpdated={() => {}}
        />
      );
    });

    expect(document.body.textContent).toContain("Monthly Witness Settings");
    expect(document.body.textContent).toContain("3 Incident Days");
    expect(document.body.textContent).toContain("Save Monthly Witness");
  });

  it("renders signed alert with revoke button when BA is signed", async () => {
    const onRevokeBeritaAcara = mock(async () => {});
    const signedStatus: BeritaAcaraStatusResponse = {
      id: 55,
      year: 2026,
      month: 10,
      user_id: 1,
      witness_id: 10,
      witness_name: "Maman Resing",
      status: "signed",
      total_days: 3,
    };

    const originalConfirm = window.confirm;
    window.confirm = () => true;

    root = createRoot(container);

    await act(async () => {
      root?.render(
        <MonthlyWitnessModal
          isOpen={true}
          onClose={() => {}}
          year={2026}
          month={10}
          beritaAcaraCount={3}
          beritaAcaraStatus={signedStatus}
          onRevokeBeritaAcara={onRevokeBeritaAcara}
          onWitnessUpdated={() => {}}
        />
      );
    });

    expect(document.body.textContent).toContain("Incident Reports Signed by Witness");
    expect(document.body.textContent).toContain("Revoke Incident Report Signature");

    const revokeBtn = Array.from(document.body.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Revoke Incident Report Signature")
    );
    expect(revokeBtn).toBeDefined();

    await act(async () => {
      revokeBtn?.click();
    });

    expect(onRevokeBeritaAcara).toHaveBeenCalledTimes(1);
    window.confirm = originalConfirm;
  });

  it("renders pending alert with cancellation button when BA is pending_witness", async () => {
    const onRevokeBeritaAcara = mock(async () => {});
    const pendingStatus: BeritaAcaraStatusResponse = {
      id: 55,
      year: 2026,
      month: 10,
      user_id: 1,
      witness_id: 10,
      witness_name: "Maman Resing",
      status: "pending_witness",
      total_days: 3,
    };

    const originalConfirm = window.confirm;
    window.confirm = () => true;

    root = createRoot(container);

    await act(async () => {
      root?.render(
        <MonthlyWitnessModal
          isOpen={true}
          onClose={() => {}}
          year={2026}
          month={10}
          beritaAcaraCount={3}
          beritaAcaraStatus={pendingStatus}
          onRevokeBeritaAcara={onRevokeBeritaAcara}
          onWitnessUpdated={() => {}}
        />
      );
    });

    expect(document.body.textContent).toContain("Awaiting Witness Signature");
    expect(document.body.textContent).toContain("Cancel Signature Request");

    const cancelBtn = Array.from(document.body.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Cancel Signature Request")
    );
    expect(cancelBtn).toBeDefined();

    await act(async () => {
      cancelBtn?.click();
    });

    expect(onRevokeBeritaAcara).toHaveBeenCalledTimes(1);
    window.confirm = originalConfirm;
  });

  it("renders rejected alert with rejection notes and resubmit button when BA is rejected", async () => {
    const onSubmitBeritaAcara = mock(async () => {});
    const rejectedStatus: BeritaAcaraStatusResponse = {
      id: 55,
      year: 2026,
      month: 10,
      user_id: 1,
      witness_id: 10,
      witness_name: "Maman Resing",
      status: "rejected",
      witness_rejection_notes: "Perlu bukti tiket approval",
      total_days: 3,
    };

    root = createRoot(container);

    await act(async () => {
      root?.render(
        <MonthlyWitnessModal
          isOpen={true}
          onClose={() => {}}
          year={2026}
          month={10}
          beritaAcaraCount={3}
          beritaAcaraStatus={rejectedStatus}
          onSubmitBeritaAcara={onSubmitBeritaAcara}
          onWitnessUpdated={() => {}}
        />
      );
    });

    expect(document.body.textContent).toContain("Incident Reports Rejected by Witness");
    expect(document.body.textContent).toContain("Perlu bukti tiket approval");
    expect(document.body.textContent).toContain("Resubmit to Witness");

    const resubmitBtn = Array.from(document.body.querySelectorAll("button")).find((b) =>
      b.textContent?.includes("Resubmit to Witness")
    );
    expect(resubmitBtn).toBeDefined();

    await act(async () => {
      resubmitBtn?.click();
    });

    expect(onSubmitBeritaAcara).toHaveBeenCalledTimes(1);
  });
});
