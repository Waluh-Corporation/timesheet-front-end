import { describe, it, expect, beforeEach, mock } from "bun:test";
import {
  fetchEligibleWitnesses,
  updateMonthlyWitness,
  fetchPreviousDayActivity,
  fetchActivityDetail,
  upsertActivity,
} from "./activityService";

describe("activityService integration tests", () => {
  beforeEach(() => {
    if (typeof document !== "undefined") {
      document.cookie = "";
    }
  });

  it("fetchEligibleWitnesses queries /api/v1/users/witnesses", async () => {
    let calledUrl = "";

    (globalThis as any).fetch = mock(async (url: string) => {
      calledUrl = url;
      return new Response(
        JSON.stringify({
          code: 200,
          status: "success",
          data: [
            { id: 2, name: "Alice Witness" },
            { id: 3, name: "Bob Colleague" },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await fetchEligibleWitnesses();
    expect(calledUrl).toContain("/api/v1/users/witnesses");
    expect(res.length).toBe(2);
    expect(res[0].name).toBe("Alice Witness");
  });

  it("updateMonthlyWitness sends PUT to /api/v1/activities/witness", async () => {
    let calledUrl = "";
    let calledMethod = "";
    let calledBody = "";

    (globalThis as any).fetch = mock(async (url: string, opts: any) => {
      calledUrl = url;
      calledMethod = opts?.method || "GET";
      calledBody = opts?.body || "";
      return new Response(
        JSON.stringify({
          code: 200,
          status: "success",
          message: "Witness updated for 4 Berita Acara entries",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await updateMonthlyWitness({
      year: 2026,
      month: 10,
      witness_id: 2,
    });
    expect(calledUrl).toContain("/api/v1/activities/witness");
    expect(calledMethod).toBe("PUT");
    expect(JSON.parse(calledBody)).toEqual({
      year: 2026,
      month: 10,
      witness_id: 2,
    });
    expect(res.message).toContain("Witness updated");
  });

  it("fetchPreviousDayActivity queries /api/v1/activities/previous with optional date", async () => {
    let calledUrl = "";

    (globalThis as any).fetch = mock(async (url: string) => {
      calledUrl = url;
      return new Response(
        JSON.stringify({
          code: 200,
          status: "success",
          data: {
            id: 10,
            date: "2026-10-15",
            activity: "Refactoring API integration",
            project_id: "PROJ-1",
            project_name: "Timesheet System",
            app_impacted: "Core System",
            start_time: "08:00",
            end_time: "17:00",
            status: "P",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await fetchPreviousDayActivity("2026-10-16");
    expect(calledUrl).toContain("/api/v1/activities/previous?date=2026-10-16");
    expect(res.activity).toBe("Refactoring API integration");
    expect(res.project_name).toBe("Timesheet System");
  });

  it("fetchActivityDetail queries /api/v1/activities/:id", async () => {
    let calledUrl = "";

    (globalThis as any).fetch = mock(async (url: string) => {
      calledUrl = url;
      return new Response(
        JSON.stringify({
          code: 200,
          status: "success",
          data: {
            id: 42,
            date: "2026-10-01",
            activity: "Daily task",
            is_berita_acara: true,
            berita_acara_notes: "Lupa tap masuk",
            witness_id: 2,
            witness: { id: 2, name: "Alice Witness" },
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await fetchActivityDetail(42);
    expect(calledUrl).toContain("/api/v1/activities/42");
    expect(res.is_berita_acara).toBe(true);
    expect(res.witness?.name).toBe("Alice Witness");
  });

  it("upsertActivity posts daily activity payload to /api/v1/activities", async () => {
    let calledUrl = "";
    let calledMethod = "";
    let calledBody = "";

    (globalThis as any).fetch = mock(async (url: string, opts: any) => {
      calledUrl = url;
      calledMethod = opts?.method || "GET";
      calledBody = opts?.body || "";
      return new Response(
        JSON.stringify({
          code: 200,
          status: "success",
          message: "activity saved successfully",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await upsertActivity({
      date: "2026-10-17",
      start_time: "08:00",
      end_time: "17:00",
      status: "P",
      activity: "Developing Berita Acara feature",
      is_berita_acara: true,
      berita_acara_notes: "Mesin absen offline",
      witness_id: 2,
    });

    expect(calledUrl).toContain("/api/v1/activities");
    expect(calledMethod).toBe("POST");
    const parsed = JSON.parse(calledBody);
    expect(parsed.is_berita_acara).toBe(true);
    expect(parsed.witness_id).toBe(2);
    expect(res.message).toBe("activity saved successfully");
  });
});
