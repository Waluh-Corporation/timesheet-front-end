import { describe, it, expect, beforeEach, mock } from "bun:test";
import { verifyDocument } from "./verifyService";

describe("verifyService integration tests", () => {
  beforeEach(() => {
    if (typeof document !== "undefined") {
      document.cookie = "";
    }
  });

  it("verifyDocument queries GET /api/v1/verify/doc/:token", async () => {
    let calledUrl = "";

    (globalThis as any).fetch = mock(async (url: string) => {
      calledUrl = url;
      return new Response(
        JSON.stringify({
          is_valid: true,
          document_type: "timesheet",
          user_name: "John Doe",
          employee_id: "EMP-001",
          period: "2026-10",
          signed_at: "2026-10-24T12:00:00Z",
          verification_token: "sample-token-abc",
          hash: "sha256-hash-xyz",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await verifyDocument("sample-token-abc");
    expect(calledUrl).toContain("/api/v1/verify/doc/sample-token-abc");
    expect(res.is_valid).toBe(true);
    expect(res.document_type).toBe("timesheet");
    expect(res.user_name).toBe("John Doe");
    expect(res.hash).toBe("sha256-hash-xyz");
  });
});
