import { describe, it, expect, beforeEach, mock } from "bun:test";
import { usersService } from "./usersService";

describe("usersService integration tests", () => {
  beforeEach(() => {
    if (typeof document !== "undefined") {
      document.cookie = "";
    }
  });

  it("anonymizeUser posts to /api/v1/admin/users/:id/anonymize", async () => {
    let calledUrl = "";
    let calledMethod = "";

    (globalThis as any).fetch = mock(async (url: string, opts: any) => {
      calledUrl = url;
      calledMethod = opts?.method || "GET";
      return new Response(
        JSON.stringify({
          code: 200,
          status: "success",
          message: "User personal data anonymized successfully (UU PDP)",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await usersService.anonymizeUser(99);
    expect(calledUrl).toContain("/api/v1/admin/users/99/anonymize");
    expect(calledMethod).toBe("POST");
    expect(res.message).toContain("anonymized successfully");
  });

  it("getUsers queries /api/v1/admin/users", async () => {
    let calledUrl = "";

    (globalThis as any).fetch = mock(async (url: string) => {
      calledUrl = url;
      return new Response(
        JSON.stringify({
          code: 200,
          status: "success",
          data: [
            { id: 1, username: "admin", role: "admin", is_active: true },
          ],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    const res = await usersService.getUsers();
    expect(calledUrl).toContain("/api/v1/admin/users");
    expect(res.length).toBe(1);
    expect(res[0].username).toBe("admin");
  });

  it("deactivateUser sends DELETE to /api/v1/admin/users/:id", async () => {
    let calledUrl = "";
    let calledMethod = "";

    (globalThis as any).fetch = mock(async (url: string, opts: any) => {
      calledUrl = url;
      calledMethod = opts?.method || "GET";
      return new Response(
        JSON.stringify({
          code: 200,
          status: "success",
          deleted: true,
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    });

    await usersService.deactivateUser(5);
    expect(calledUrl).toContain("/api/v1/admin/users/5");
    expect(calledMethod).toBe("DELETE");
  });

  it("isUserAnonymized accurately identifies anonymized accounts", async () => {
    const { isUserAnonymized } = await import("@/lib/types");

    expect(isUserAnonymized({ username: "deleted_user_1935", name: "ANONYMIZED_USER_1935" })).toBe(true);
    expect(isUserAnonymized({ username: "john_doe", name: "ANONYMIZED_USER_10" })).toBe(true);
    expect(isUserAnonymized({ username: "deleted_user_42", email: "deleted_42@timesheet.local" })).toBe(true);
    expect(isUserAnonymized({ username: "alice", name: "Alice Wonderland", email: "alice@example.com" })).toBe(false);
    expect(isUserAnonymized(null)).toBe(false);
    expect(isUserAnonymized(undefined)).toBe(false);
  });
});
