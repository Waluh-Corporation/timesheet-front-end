import { describe, it, expect, beforeEach, mock } from "bun:test";
import {
  getUserSignature,
  uploadUserSignature,
  deleteUserSignature,
} from "./signatureService";

describe("signatureService integration tests", () => {
  beforeEach(() => {
    if (typeof document !== "undefined") {
      document.cookie = "";
    }
  });

  it("getUserSignature queries GET /api/v1/user/signature", async () => {
    let calledUrl = "";
    let calledMethod = "";

    (globalThis as any).fetch = mock(async (url: string, opts: any) => {
      calledUrl = url;
      calledMethod = opts?.method || "GET";
      return new Response(
        JSON.stringify({
          has_signature: true,
          signature_url: "https://s3.example.com/signature.png",
          file_key: "signatures/user-1.png",
          updated_at: "2026-10-24T10:00:00Z",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await getUserSignature();
    expect(calledUrl).toContain("/api/v1/user/signature");
    expect(calledMethod).toBe("GET");
    expect(res.has_signature).toBe(true);
    expect(res.signature_url).toBe("https://s3.example.com/signature.png");
  });

  it("uploadUserSignature sends POST to /api/v1/user/signature with payload", async () => {
    let calledUrl = "";
    let calledMethod = "";
    let calledBody = "";

    (globalThis as any).fetch = mock(async (url: string, opts: any) => {
      calledUrl = url;
      calledMethod = opts?.method || "GET";
      calledBody = opts?.body || "";
      return new Response(
        JSON.stringify({
          message: "Signature uploaded successfully",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const base64Data = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...";
    const res = await uploadUserSignature(base64Data);
    expect(calledUrl).toContain("/api/v1/user/signature");
    expect(calledMethod).toBe("POST");
    expect(JSON.parse(calledBody)).toEqual({ signature_base64: base64Data });
    expect(res.message).toBe("Signature uploaded successfully");
  });

  it("deleteUserSignature sends DELETE to /api/v1/user/signature", async () => {
    let calledUrl = "";
    let calledMethod = "";

    (globalThis as any).fetch = mock(async (url: string, opts: any) => {
      calledUrl = url;
      calledMethod = opts?.method || "GET";
      return new Response(
        JSON.stringify({
          message: "Signature deleted successfully",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await deleteUserSignature();
    expect(calledUrl).toContain("/api/v1/user/signature");
    expect(calledMethod).toBe("DELETE");
    expect(res.message).toBe("Signature deleted successfully");
  });
});
