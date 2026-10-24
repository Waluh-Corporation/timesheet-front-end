import { describe, it, expect, mock, beforeEach } from "bun:test";
import React, { act } from "react";
import { createRoot } from "react-dom/client";
import { daysInMonth, useDashboardData } from "./useDashboardData";

// Stable mocks for dashboardService
const mockFetchActivities = mock(async () => ({
  activities: [
    {
      id: 1,
      date: "2026-10-15",
      activity: "Work on timesheet",
      is_berita_acara: true,
      berita_acara_notes: "Lupa tap kartu",
    },
  ],
  monthlyWitness: { id: 5, name: "Pak Budi" },
}));
const mockFetchHolidays = mock(async () => []);
const mockDownloadTimesheet = mock(async () => {});
const mockRequestTimesheetGeneration = mock(async () => ({
  id: "job-1",
  user_id: 1,
  month: 10,
  year: 2026,
  status: "queued",
  created_at: "2026-10-24T10:00:00Z",
}));

mock.module("../services/dashboardService", () => ({
  fetchDashboardActivities: mockFetchActivities,
  fetchHolidays: mockFetchHolidays,
  downloadTimesheet: mockDownloadTimesheet,
  requestTimesheetGeneration: mockRequestTimesheetGeneration,
}));

// Stable mocks for beritaAcaraService
const mockGetBeritaAcaraStatus = mock(async () => ({
  id: "ba-1",
  month: 10,
  year: 2026,
  status: "pending_witness",
  witness_id: 5,
  witness_name: "Pak Budi",
}));
const mockSubmitBeritaAcara = mock(async () => ({ message: "Submitted" }));
const mockRevokeBeritaAcara = mock(async () => ({ message: "Revoked" }));
const mockGetPendingWitnessRequests = mock(async () => [
  {
    id: "req-1",
    user_id: 20,
    user_name: "Alice",
    month: 10,
    year: 2026,
    status: "pending",
    submitted_at: "2026-10-24T08:00:00Z",
  },
]);

mock.module("@/services/beritaAcaraService", () => ({
  getBeritaAcaraStatus: mockGetBeritaAcaraStatus,
  submitBeritaAcara: mockSubmitBeritaAcara,
  revokeBeritaAcara: mockRevokeBeritaAcara,
  getPendingWitnessRequests: mockGetPendingWitnessRequests,
}));

// Stable mocks for timesheetService
const mockGetTimesheetStatus = mock(async () => ({
  status: "signed",
  is_signed: true,
  document_hash: "hash123",
}));
const mockSignTimesheet = mock(async () => ({ message: "Signed" }));
const mockRevokeTimesheet = mock(async () => ({ message: "Revoked" }));

mock.module("@/services/timesheetService", () => ({
  getTimesheetStatus: mockGetTimesheetStatus,
  signTimesheet: mockSignTimesheet,
  revokeTimesheet: mockRevokeTimesheet,
}));

// Stable mock for Toast
const mockNotify = mock(() => {});
mock.module("@/components/Toast", () => ({
  useToast: () => ({
    notify: mockNotify,
  }),
}));

// Stable mock for Auth
mock.module("@/lib/auth", () => ({
  useAuth: () => ({
    user: { id: 1, name: "Employee User", username: "employee", role: "user" },
  }),
}));

// Stable mock for Push
mock.module("@/lib/push", () => ({
  enablePush: mock(async () => true),
  disablePush: mock(async () => {}),
  pushSupported: () => true,
  registerServiceWorker: mock(async () => ({})),
  isPushSubscribed: mock(async () => false),
  sendTestPush: mock(async () => {}),
}));

describe("useDashboardData hook (Feature)", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    mockNotify.mockClear();
    mockFetchActivities.mockClear();
    mockGetBeritaAcaraStatus.mockClear();
    mockSubmitBeritaAcara.mockClear();
    mockRevokeBeritaAcara.mockClear();
    mockGetPendingWitnessRequests.mockClear();
    mockGetTimesheetStatus.mockClear();
    mockSignTimesheet.mockClear();
    mockRevokeTimesheet.mockClear();
    mockRequestTimesheetGeneration.mockClear();
    mockDownloadTimesheet.mockClear();
  });

  it("calculates daysInMonth correctly", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2026, 10)).toBe(31);
  });

  it("loads activities, berita acara status, and pending witness requests", async () => {
    let captured: any;
    function Consumer() {
      captured = useDashboardData();
      return React.createElement("div", null, captured.loading ? "Loading" : "Ready");
    }

    const root = createRoot(container);
    await act(async () => {
      root.render(React.createElement(Consumer));
      await new Promise((resolve) => setTimeout(resolve, 30));
    });

    expect(captured).toBeDefined();
    expect(captured.beritaAcaraCount).toBe(1);
    expect(captured.beritaAcaraStatus?.status).toBe("pending_witness");
    expect(captured.witnessRequests.length).toBe(1);

    // Test submitBeritaAcara
    await act(async () => {
      await captured.handleSubmitBeritaAcara();
    });

    expect(mockSubmitBeritaAcara).toHaveBeenCalled();
    expect(mockNotify).toHaveBeenCalledWith("Attendance Incident Reports successfully submitted to witness! 📋", "success");

    root.unmount();
    container.remove();
  });

  it("notifies error message when generate fails with Berita Acara guard rejection", async () => {
    mockRequestTimesheetGeneration.mockImplementationOnce(async () => {
      const err = new Error(
        "dokumen belum dapat dibuat karena Berita Acara periode ini masih menunggu persetujuan dan tanda tangan dari saksi Pak Budi"
      );
      throw err;
    });

    let captured: any;
    function Consumer() {
      captured = useDashboardData();
      return React.createElement("div", null, "Ready");
    }

    const root = createRoot(container);
    await act(async () => {
      root.render(React.createElement(Consumer));
      await new Promise((resolve) => setTimeout(resolve, 30));
    });

    await act(async () => {
      await captured.generate();
    });

    expect(mockNotify).toHaveBeenCalledWith(
      "dokumen belum dapat dibuat karena Berita Acara periode ini masih menunggu persetujuan dan tanda tangan dari saksi Pak Budi",
      "error"
    );
    // Should NOT have attempted fallback download
    expect(mockDownloadTimesheet).not.toHaveBeenCalled();

    root.unmount();
    container.remove();
  });

  it("revokes submitted Berita Acara signature request successfully", async () => {
    let captured: any;
    function Consumer() {
      captured = useDashboardData();
      return React.createElement("div", null, "Ready");
    }

    const root = createRoot(container);
    await act(async () => {
      root.render(React.createElement(Consumer));
      await new Promise((resolve) => setTimeout(resolve, 30));
    });

    await act(async () => {
      await captured.handleRevokeBeritaAcara();
    });

    expect(mockRevokeBeritaAcara).toHaveBeenCalledWith("ba-1");
    expect(mockNotify).toHaveBeenCalledWith("Witness signature request successfully cancelled.", "success");

    root.unmount();
    container.remove();
  });

  it("signs and revokes monthly timesheet successfully", async () => {
    let captured: any;
    function Consumer() {
      captured = useDashboardData();
      return React.createElement("div", null, "Ready");
    }

    const root = createRoot(container);
    await act(async () => {
      root.render(React.createElement(Consumer));
      await new Promise((resolve) => setTimeout(resolve, 30));
    });

    // Test sign
    await act(async () => {
      await captured.handleSignTimesheet();
    });
    expect(mockSignTimesheet).toHaveBeenCalledWith(2026, 10);
    expect(mockNotify).toHaveBeenCalledWith(
      "Timesheet signed successfully! Document and activity period are now locked. ✍️",
      "success"
    );

    // Test revoke
    await act(async () => {
      await captured.handleRevokeTimesheet();
    });
    expect(mockRevokeTimesheet).toHaveBeenCalledWith(2026, 10);
    expect(mockNotify).toHaveBeenCalledWith(
      "Timesheet signature revoked. Activity period is unlocked. 🔄",
      "success"
    );

    root.unmount();
    container.remove();
  });
});
