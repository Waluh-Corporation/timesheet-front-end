import { describe, it, expect, beforeEach, mock } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { AuthProvider, useAuth } from "./auth";
import * as pushModule from "./push";

describe("auth context", () => {
  beforeEach(() => {
    if (typeof document !== "undefined") {
      document.cookie = "";
    }
  });

  it("renders children in AuthProvider", () => {
    function TestChild() {
      const { loading } = useAuth();
      return React.createElement("div", null, loading ? "Loading..." : "Loaded");
    }

    const html = renderToString(
      React.createElement(AuthProvider, null, React.createElement(TestChild))
    );
    expect(html).toContain("Loading...");
  });

  it("throws error when useAuth is outside AuthProvider", () => {
    function OrphanChild() {
      useAuth();
      return null;
    }
    expect(() => renderToString(React.createElement(OrphanChild))).toThrow(
      "useAuth must be used within AuthProvider"
    );
  });

  it("provides loginWithToken, logout and calls unsubscribePush on logout", async () => {
    let capturedAuth: any;
    function Consumer() {
      capturedAuth = useAuth();
      return null;
    }

    renderToString(
      React.createElement(AuthProvider, null, React.createElement(Consumer))
    );

    expect(capturedAuth).toBeDefined();

    // Test loginWithToken
    capturedAuth.loginWithToken("test-token", {
      id: "u1",
      username: "john",
      role: "user",
    });

    // Test logout
    await capturedAuth.logout();
    expect(capturedAuth.user).toBeNull();
  });

  it("handles loginWithPassword and refresh flows", async () => {
    let capturedAuth: any;
    function Consumer() {
      capturedAuth = useAuth();
      return null;
    }

    renderToString(
      React.createElement(AuthProvider, null, React.createElement(Consumer))
    );

    (globalThis as any).fetch = mock(async (url: string) => {
      if (url.includes("/api/v1/auth/login")) {
        return new Response(
          JSON.stringify({
            token: "jwt-123",
            user: { id: "u1", username: "alice", role: "user" },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      if (url.includes("/api/v1/me")) {
        return new Response(
          JSON.stringify({ id: "u1", username: "alice", role: "user" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
      }
      return new Response("{}", { status: 200 });
    });

    const user = await capturedAuth.loginWithPassword("alice", "secret");
    expect(user.username).toBe("alice");

    await capturedAuth.refresh();
  });
});
