import { describe, it, expect, beforeEach, mock } from "bun:test";
import {
  api,
  apiWithMeta,
  setToken,
  getToken,
  setRefreshToken,
  getRefreshToken,
  clearAuthTokens,
} from "./api";
import { usersService } from "@/app/(admin)/users/services/usersService";
import { fetchDepartments } from "@/app/(admin)/master-data/services/masterData";

describe("Auth refresh & new endpoint integration tests", () => {
  beforeEach(() => {
    if (typeof document !== "undefined") {
      document.cookie = "";
    }
  });

  it("stores and retrieves refresh token correctly", () => {
    setRefreshToken("rf_test_123");
    expect(getRefreshToken()).toBe("rf_test_123");
    clearAuthTokens();
    expect(getRefreshToken()).toBeNull();
    expect(getToken()).toBeNull();
  });

  it("performs silent token refresh on 401 error and retries the request", async () => {
    setToken("old_access_token");
    setRefreshToken("initial_refresh_token");

    let originalCallCount = 0;
    let refreshCallCount = 0;

    (globalThis as any).fetch = mock(async (url: string, opts: any) => {
      if (url.includes("/api/v1/auth/refresh")) {
        refreshCallCount++;
        const body = JSON.parse(opts.body);
        expect(body.refresh_token).toBe("initial_refresh_token");
        return new Response(
          JSON.stringify({
            code: 200,
            status: "success",
            data: {
              token: "new_rotated_access_token",
              refresh_token: "new_rotated_refresh_token",
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }

      if (url.includes("/api/v1/test-protected")) {
        originalCallCount++;
        const authHeader = opts.headers?.get ? opts.headers.get("Authorization") : opts.headers?.Authorization;
        if (originalCallCount === 1) {
          expect(authHeader).toBe("Bearer old_access_token");
          return new Response(JSON.stringify({ error: "Unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        // Second call should have new access token
        expect(authHeader).toBe("Bearer new_rotated_access_token");
        return new Response(JSON.stringify({ code: 200, data: { ok: true } }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      return new Response("{}", { status: 200 });
    });

    const result = await api<{ ok: boolean }>("/api/v1/test-protected");
    expect(result.ok).toBe(true);
    expect(refreshCallCount).toBe(1);
    expect(originalCallCount).toBe(2);
    expect(getToken()).toBe("new_rotated_access_token");
    expect(getRefreshToken()).toBe("new_rotated_refresh_token");
  });

  it("apiWithMeta returns data and pagination metadata", async () => {
    (globalThis as any).fetch = mock(async () => {
      return new Response(
        JSON.stringify({
          code: 200,
          status: "success",
          data: [{ id: 1, activity: "Coding" }],
          pagination: {
            current_page: 1,
            limit: 10,
            total_items: 42,
            total_pages: 5,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await apiWithMeta<any[]>("/api/v1/activities?page=1&limit=10");
    expect(res.data).toHaveLength(1);
    expect(res.pagination?.total_items).toBe(42);
    expect(res.pagination?.total_pages).toBe(5);
  });

  it("usersService.updateUser sends PATCH with complete payload", async () => {
    let capturedMethod = "";
    let capturedBody: any = null;

    (globalThis as any).fetch = mock(async (url: string, opts: any) => {
      capturedMethod = opts.method;
      capturedBody = JSON.parse(opts.body);
      return new Response(
        JSON.stringify({
          code: 200,
          data: { id: 10, name: "Alice Updated", role: "admin" },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    await usersService.updateUser(10, {
      name: "Alice Updated",
      role: "admin",
      employee_id: "12345",
      division: "Engineering",
      division_id: 2,
    });

    expect(capturedMethod).toBe("PATCH");
    expect(capturedBody.name).toBe("Alice Updated");
    expect(capturedBody.role).toBe("admin");
    expect(capturedBody.division_id).toBe(2);
  });

  it("fetchDepartments queries backend with division and division_id parameters", async () => {
    let calledUrl = "";
    (globalThis as any).fetch = mock(async (url: string) => {
      calledUrl = url;
      return new Response(
        JSON.stringify({
          code: 200,
          data: [{ id: 1, name: "Wholesale Delivery", division: "IT" }],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    await fetchDepartments({ division: "IT", division_id: 5 });
    expect(calledUrl).toContain("division=IT");
    expect(calledUrl).toContain("division_id=5");
    expect(calledUrl).not.toContain("company_id");
  });

  it("handles token refresh failure gracefully and clears tokens", async () => {
    setToken("expired_token");
    setRefreshToken("invalid_refresh_token");

    (globalThis as any).fetch = mock(async (url: string) => {
      if (url.includes("/api/v1/auth/refresh")) {
        return new Response(JSON.stringify({ error: "Session expired" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    });

    await expect(api("/api/v1/some-endpoint")).rejects.toThrow();
    expect(getToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("handles network error during token refresh", async () => {
    setToken("expired_token");
    setRefreshToken("invalid_refresh_token");

    (globalThis as any).fetch = mock(async (url: string) => {
      if (url.includes("/api/v1/auth/refresh")) {
        throw new Error("Network down");
      }
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    });

    await expect(api("/api/v1/some-endpoint")).rejects.toThrow();
    expect(getToken()).toBeNull();
    expect(getRefreshToken()).toBeNull();
  });

  it("migrates tokens from localStorage when cookies are missing", () => {
    window.localStorage.setItem("ts_auth_token", "legacy_access_123");
    window.localStorage.setItem("ts_refresh_token", "legacy_refresh_456");

    expect(getToken()).toBe("legacy_access_123");
    expect(getRefreshToken()).toBe("legacy_refresh_456");
    expect(window.localStorage.getItem("ts_auth_token")).toBeNull();
    expect(window.localStorage.getItem("ts_refresh_token")).toBeNull();
  });

  it("parses non-json blob responses correctly", async () => {
    (globalThis as any).fetch = mock(async () => {
      return new Response("plain text or binary stream", {
        status: 200,
        headers: { "Content-Type": "application/octet-stream" },
      });
    });

    const res = await api("/api/v1/download-raw");
    expect(res).toBeDefined();

    const metaRes = await apiWithMeta("/api/v1/download-raw");
    expect(metaRes.data).toBeDefined();
  });

  it("handles downloadFile with filename header and click event", async () => {
    const origCreateObjectURL = window.URL.createObjectURL;
    const origRevokeObjectURL = window.URL.revokeObjectURL;

    window.URL.createObjectURL = mock(() => "blob:http://localhost:3000/mock-uuid");
    window.URL.revokeObjectURL = mock(() => {});

    let clicked = false;
    let appended = false;
    let downloadAttr = "";

    const origCreateElement = document.createElement.bind(document);
    document.createElement = ((tag: string) => {
      if (tag === "a") {
        return {
          href: "",
          download: "",
          click: () => {
            clicked = true;
          },
          remove: () => {},
          setAttribute: (k: string, v: string) => {
            if (k === "download") downloadAttr = v;
          },
        } as any;
      }
      return origCreateElement(tag);
    }) as any;

    const origAppendChild = document.body.appendChild.bind(document.body);
    document.body.appendChild = ((node: any) => {
      appended = true;
      return node;
    }) as any;

    const { downloadFile } = await import("./api");

    (globalThis as any).fetch = mock(async () => {
      return new Response(new Blob(["mock-xlsx-content"]), {
        status: 200,
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": 'attachment; filename="timesheet-2026.xlsx"',
        },
      });
    });

    await downloadFile("/api/v1/timesheet/generate", { year: 2026, month: 9 }, "fallback.xlsx");

    expect(clicked).toBe(true);
    expect(appended).toBe(true);

    // Restore DOM mocks
    window.URL.createObjectURL = origCreateObjectURL;
    window.URL.revokeObjectURL = origRevokeObjectURL;
    document.createElement = origCreateElement;
    document.body.appendChild = origAppendChild;
  });

  it("handles downloadFile error when server returns failure", async () => {
    const { downloadFile } = await import("./api");

    (globalThis as any).fetch = mock(async () => {
      return new Response(JSON.stringify({ error: "Cannot generate timesheet" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    });

    await expect(
      downloadFile("/api/v1/timesheet/generate", { year: 2026, month: 9 }, "fallback.xlsx")
    ).rejects.toThrow("Cannot generate timesheet");
  });
});
