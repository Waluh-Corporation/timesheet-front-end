import { describe, it, expect, mock, beforeEach, afterEach } from "bun:test";
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { DashboardHeader } from "./DashboardHeader";
import type { WitnessResponse, BeritaAcaraStatusResponse } from "@/lib/types";

// Mock next/navigation useRouter
const mockPush = mock(() => {});
mock.module("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe("DashboardHeader Component", () => {
  let container: HTMLDivElement;
  let root: Root | null = null;

  const mockUser = {
    id: 1,
    name: "John Doe",
    username: "johndoe",
  };

  const mockWitness: WitnessResponse = {
    id: 10,
    name: "Maman Resing",
    username: "maman",
  };

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    mockPush.mockClear();
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

  it("renders standard Generate card when there are no Berita Acara records", async () => {
    const onGenerate = mock(() => {});
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <DashboardHeader
          user={mockUser}
          filledCount={10}
          generating={false}
          onGenerate={onGenerate}
          pushBusy={false}
          pushOn={false}
          onTogglePush={() => {}}
          pushSupported={false}
          onAddPasskey={() => {}}
          passkeysSupported={false}
          beritaAcaraCount={0}
        />
      );
    });

    expect(container.textContent).toContain("Generate");
    expect(container.textContent).toContain("Export monthly timesheet");
    expect(container.textContent).not.toContain("BA Terverifikasi");

    const generateCard = container.querySelector(".cursor-pointer") as HTMLElement | null;
    expect(generateCard).not.toBeNull();
    await act(async () => {
      generateCard?.click();
    });
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it("renders 'Generate' card with 'Locked' badge when beritaAcaraCount > 0 and not signed", async () => {
    const onGenerate = mock(() => {});
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <DashboardHeader
          user={mockUser}
          filledCount={10}
          generating={false}
          onGenerate={onGenerate}
          pushBusy={false}
          pushOn={false}
          onTogglePush={() => {}}
          pushSupported={false}
          onAddPasskey={() => {}}
          passkeysSupported={false}
          beritaAcaraCount={3}
          monthlyWitness={mockWitness}
        />
      );
    });

    expect(container.textContent).toContain("Generate");
    expect(container.textContent).toContain("Locked");
    expect(container.textContent).toContain("3 reports need witness signature");

    const card = Array.from(container.querySelectorAll(".card")).find((c) =>
      c.textContent?.includes("Generate")
    ) as HTMLElement | undefined;
    expect(card).not.toBeUndefined();

    await act(async () => {
      card?.click();
    });
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it("renders standard clean 'Generate' card when status is signed", async () => {
    const onGenerate = mock(() => {});
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

    root = createRoot(container);

    await act(async () => {
      root?.render(
        <DashboardHeader
          user={mockUser}
          filledCount={10}
          generating={false}
          onGenerate={onGenerate}
          pushBusy={false}
          pushOn={false}
          onTogglePush={() => {}}
          pushSupported={false}
          onAddPasskey={() => {}}
          passkeysSupported={false}
          monthlyWitness={mockWitness}
          beritaAcaraCount={3}
          beritaAcaraStatus={signedStatus}
        />
      );
    });

    expect(container.textContent).toContain("Generate");
    expect(container.textContent).toContain("Export monthly timesheet");
    expect(container.textContent).not.toContain("BA Terverifikasi");

    const card = Array.from(container.querySelectorAll(".card")).find((c) =>
      c.textContent?.includes("Generate")
    ) as HTMLElement | undefined;

    await act(async () => {
      card?.click();
    });
    expect(onGenerate).toHaveBeenCalledTimes(1);
  });

  it("renders singular phrasing when beritaAcaraCount is 1", async () => {
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <DashboardHeader
          user={mockUser}
          filledCount={10}
          generating={false}
          onGenerate={() => {}}
          pushBusy={false}
          pushOn={false}
          onTogglePush={() => {}}
          pushSupported={false}
          onAddPasskey={() => {}}
          passkeysSupported={false}
          beritaAcaraCount={1}
          monthlyWitness={mockWitness}
        />
      );
    });

    expect(container.textContent).toContain("1 report needs witness signature");
  });

  it("renders clean header with Today's Activity button without standalone sign/revoke buttons", async () => {
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <DashboardHeader
          user={mockUser}
          filledCount={10}
          generating={false}
          onGenerate={() => {}}
          pushBusy={false}
          pushOn={false}
          onTogglePush={() => {}}
          pushSupported={false}
          onAddPasskey={() => {}}
          passkeysSupported={false}
          timesheetStatus={{
            month: 10,
            year: 2026,
            is_signed: false,
            status: "draft",
          }}
        />
      );
    });

    const buttons = Array.from(container.querySelectorAll("button"));
    const signBtn = buttons.find((btn) => btn.textContent?.includes("Sign Timesheet"));
    const revokeBtn = buttons.find((btn) => btn.textContent?.includes("Revoke"));
    const activityBtn = buttons.find((btn) => btn.textContent?.includes("Today's Activity"));

    expect(signBtn).toBeUndefined();
    expect(revokeBtn).toBeUndefined();
    expect(activityBtn).toBeDefined();
  });

  it("renders 'Daily Reminders' card with active icon avatar when pushOn is true", async () => {
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <DashboardHeader
          user={mockUser}
          filledCount={10}
          generating={false}
          onGenerate={() => {}}
          pushBusy={false}
          pushOn={true}
          onTogglePush={() => {}}
          pushSupported={true}
          onAddPasskey={() => {}}
          passkeysSupported={false}
        />
      );
    });

    expect(container.textContent).toContain("Daily Reminders");
    expect(container.textContent).not.toContain("Active");
    const yellowAvatar = container.querySelector(".avatar.bg-yellow-lt");
    expect(yellowAvatar).not.toBeNull();
  });

  it("renders 'Daily Reminders' card with disabled icon avatar when pushOn is false", async () => {
    root = createRoot(container);

    await act(async () => {
      root?.render(
        <DashboardHeader
          user={mockUser}
          filledCount={10}
          generating={false}
          onGenerate={() => {}}
          pushBusy={false}
          pushOn={false}
          onTogglePush={() => {}}
          pushSupported={true}
          onAddPasskey={() => {}}
          passkeysSupported={false}
        />
      );
    });

    expect(container.textContent).toContain("Daily Reminders");
    expect(container.textContent).not.toContain("Off");
    const secondaryAvatar = container.querySelector(".avatar.bg-secondary-lt");
    expect(secondaryAvatar).not.toBeNull();
  });
});
