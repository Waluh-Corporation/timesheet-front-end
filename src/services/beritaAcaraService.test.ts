import { describe, it, expect, beforeEach, mock } from "bun:test";
import {
  getBeritaAcaraStatus,
  submitBeritaAcara,
  getPendingWitnessRequests,
  revokeBeritaAcara,
  witnessAction,
} from "./beritaAcaraService";

describe("beritaAcaraService integration tests", () => {
  beforeEach(() => {
    if (typeof document !== "undefined") {
      document.cookie = "";
    }
  });

  it("getBeritaAcaraStatus queries GET /api/v1/berita-acara/status", async () => {
    let calledUrl = "";

    (globalThis as any).fetch = mock(async (url: string) => {
      calledUrl = url;
      return new Response(
        JSON.stringify({
          id: 10,
          year: 2026,
          month: 10,
          status: "submitted",
          witness_id: 2,
          witness: { id: 2, name: "Jane Witness" },
          submitted_at: "2026-10-24T10:00:00Z",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await getBeritaAcaraStatus(2026, 10);
    expect(calledUrl).toContain("/api/v1/berita-acara/status?year=2026&month=10");
    expect(res.id).toBe(10);
    expect(res.status).toBe("submitted");
    expect(res.witness?.name).toBe("Jane Witness");
  });

  it("submitBeritaAcara sends POST to /api/v1/berita-acara/submit with payload", async () => {
    let calledUrl = "";
    let calledMethod = "";
    let calledBody = "";

    (globalThis as any).fetch = mock(async (url: string, opts: any) => {
      calledUrl = url;
      calledMethod = opts?.method || "GET";
      calledBody = opts?.body || "";
      return new Response(
        JSON.stringify({
          message: "Berita Acara submitted successfully",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await submitBeritaAcara(2026, 10, 5);
    expect(calledUrl).toContain("/api/v1/berita-acara/submit");
    expect(calledMethod).toBe("POST");
    expect(JSON.parse(calledBody)).toEqual({ year: 2026, month: 10, witness_id: 5 });
    expect(res.message).toBe("Berita Acara submitted successfully");
  });

  it("submitBeritaAcara sends POST to /api/v1/berita-acara/submit omitting witness_id if not provided or 0", async () => {
    let calledBody = "";

    (globalThis as any).fetch = mock(async (_url: string, opts: any) => {
      calledBody = opts?.body || "";
      return new Response(
        JSON.stringify({
          message: "Berita Acara submitted with locked monthly witness",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await submitBeritaAcara(2026, 10);
    expect(JSON.parse(calledBody)).toEqual({ year: 2026, month: 10 });
    expect(res.message).toBe("Berita Acara submitted with locked monthly witness");

    // Also test with witness_id = 0
    await submitBeritaAcara(2026, 10, 0);
    expect(JSON.parse(calledBody)).toEqual({ year: 2026, month: 10 });
  });

  it("getPendingWitnessRequests handles array response", async () => {
    let calledUrl = "";

    (globalThis as any).fetch = mock(async (url: string) => {
      calledUrl = url;
      return new Response(
        JSON.stringify([
          {
            id: 1,
            user_id: 42,
            user_name: "Alice Doe",
            month: 10,
            year: 2026,
            status: "pending",
            submitted_at: "2026-10-24T08:00:00Z",
          },
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await getPendingWitnessRequests();
    expect(calledUrl).toContain("/api/v1/berita-acara/witness-requests");
    expect(res.length).toBe(1);
    expect(res[0].user_name).toBe("Alice Doe");
  });

  it("getPendingWitnessRequests handles wrapped { data: [] } response", async () => {
    (globalThis as any).fetch = mock(async () => {
      return new Response(
        JSON.stringify({
          data: [
            {
              id: 2,
              user_id: 43,
              user_name: "Bob Builder",
              month: 10,
              year: 2026,
              status: "pending",
              submitted_at: "2026-10-24T09:00:00Z",
            },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await getPendingWitnessRequests();
    expect(res.length).toBe(1);
    expect(res[0].user_name).toBe("Bob Builder");
  });

  it("revokeBeritaAcara sends POST to /api/v1/berita-acara/:id/revoke", async () => {
    let calledUrl = "";
    let calledMethod = "";

    (globalThis as any).fetch = mock(async (url: string, opts: any) => {
      calledUrl = url;
      calledMethod = opts?.method || "GET";
      return new Response(
        JSON.stringify({
          message: "Berita Acara revoked back to draft",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await revokeBeritaAcara("sub-123");
    expect(calledUrl).toContain("/api/v1/berita-acara/sub-123/revoke");
    expect(calledMethod).toBe("POST");
    expect(res.message).toBe("Berita Acara revoked back to draft");
  });

  it("witnessAction sends POST to /api/v1/berita-acara/:id/witness-action with action and notes", async () => {
    let calledUrl = "";
    let calledMethod = "";
    let calledBody = "";

    (globalThis as any).fetch = mock(async (url: string, opts: any) => {
      calledUrl = url;
      calledMethod = opts?.method || "GET";
      calledBody = opts?.body || "";
      return new Response(
        JSON.stringify({
          message: "Berita Acara approved by witness",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await witnessAction("sub-123", "approve", "Approved without notes");
    expect(calledUrl).toContain("/api/v1/berita-acara/sub-123/witness-action");
    expect(calledMethod).toBe("POST");
    expect(JSON.parse(calledBody)).toEqual({ action: "approve", notes: "Approved without notes" });
    expect(res.message).toBe("Berita Acara approved by witness");
  });
});
