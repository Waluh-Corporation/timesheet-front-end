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
});
