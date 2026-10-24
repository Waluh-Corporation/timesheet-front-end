import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { WitnessReviewModal } from "./WitnessReviewModal";
import type { WitnessRequestItem } from "@/lib/types";

// Stable mock for Toast
const mockNotify = mock(() => {});
mock.module("@/components/Toast", () => ({
  useToast: () => ({
    notify: mockNotify,
  }),
}));

// Mock witnessAction from beritaAcaraService
const mockWitnessAction = mock(async () => ({ message: "Success" }));
mock.module("@/services/beritaAcaraService", () => ({
  witnessAction: mockWitnessAction,
}));

describe("WitnessReviewModal Component", () => {
  let container: HTMLDivElement;
  let root: Root | null = null;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    mockNotify.mockClear();
    mockWitnessAction.mockClear();
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

  it("does not render when isOpen is false", async () => {
    root = createRoot(container);
    await act(async () => {
      root?.render(
        <WitnessReviewModal
          isOpen={false}
          onClose={() => {}}
          requests={[]}
          onActionCompleted={() => {}}
        />
      );
    });

    expect(container.innerHTML).toBe("");
  });

  it("renders empty state when requests is empty and isOpen is true", async () => {
    root = createRoot(container);
    await act(async () => {
      root?.render(
        <WitnessReviewModal
          isOpen={true}
          onClose={() => {}}
          requests={[]}
          onActionCompleted={() => {}}
        />
      );
    });

    expect(document.body.innerHTML).toContain("Tidak Ada Permohonan Tertunda");
  });

  it("renders pending requests and triggers approve action", async () => {
    const mockCompleted = mock(() => {});
    const sampleRequests: WitnessRequestItem[] = [
      {
        id: "req-1",
        user_id: 10,
        user_name: "Budi Santoso",
        month: 10,
        year: 2026,
        status: "pending",
        submitted_at: "2026-10-24T10:00:00Z",
        notes: "Mohon tanda tangan",
      },
    ];

    root = createRoot(container);
    await act(async () => {
      root?.render(
        <WitnessReviewModal
          isOpen={true}
          onClose={() => {}}
          requests={sampleRequests}
          onActionCompleted={mockCompleted}
        />
      );
    });

    expect(document.body.innerHTML).toContain("Budi Santoso");
    expect(document.body.innerHTML).toContain("Oktober 2026");

    // Find and click approve button
    const buttons = document.body.querySelectorAll("button");
    const approveBtn = Array.from(buttons).find((b) =>
      b.textContent?.includes("Tanda Tangani / Setujui")
    );
    expect(approveBtn).toBeDefined();

    await act(async () => {
      approveBtn?.click();
    });

    expect(mockWitnessAction).toHaveBeenCalledWith("req-1", "approve");
  });
});

