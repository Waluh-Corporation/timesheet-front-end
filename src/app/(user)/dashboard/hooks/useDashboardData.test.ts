import { describe, it, expect, mock } from "bun:test";
import React from "react";
import { createRoot } from "react-dom/client";
import { daysInMonth, useDashboardData } from "./useDashboardData";

// Mock services/api
mock.module("../services/api", () => ({
  fetchDashboardActivities: mock(async () => []),
  fetchHolidays: mock(async () => []),
  downloadTimesheet: mock(async () => {}),
}));

// Stable mock for Toast
const mockNotify = mock(() => {});
mock.module("@/components/Toast", () => ({
  useToast: () => ({
    notify: mockNotify,
  }),
}));

// Stable mock for Auth
const mockUser = { username: "alice" };
mock.module("@/lib/auth", () => ({
  useAuth: () => ({
    user: mockUser,
  }),
}));

// Mock @/lib/push
mock.module("@/lib/push", () => ({
  enablePush: mock(async () => true),
  disablePush: mock(async () => {}),
  pushSupported: () => true,
  registerServiceWorker: mock(async () => ({})),
  isPushSubscribed: mock(async () => true),
}));

describe("useDashboardData hook", () => {
  it("calculates daysInMonth correctly", () => {
    expect(daysInMonth(2024, 2)).toBe(29); // leap year
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(daysInMonth(2026, 9)).toBe(30);
  });

  it("mounts hook and runs useEffect for push and load", async () => {
    let captured: any;
    function Consumer() {
      captured = useDashboardData();
      return React.createElement("div", null, captured.loading ? "Loading" : "Ready");
    }

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await (React as any).act(async () => {
      root.render(React.createElement(Consumer));
      await new Promise((resolve) => setTimeout(resolve, 20));
    });

    expect(captured).toBeDefined();
    expect(captured.pushOn).toBe(true);

    await (React as any).act(async () => {
      await captured.handleTogglePush();
    });
    expect(captured.pushBusy).toBe(false);

    await (React as any).act(async () => {
      root.unmount();
    });
  });
});
