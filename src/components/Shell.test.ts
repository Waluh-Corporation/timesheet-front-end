import { describe, it, expect, mock } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Shell from "./Shell";
import { AuthContext } from "@/lib/auth";

const mockReplace = mock(() => {});
// Mock next/navigation
mock.module("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    replace: mockReplace,
    push: mock(() => {}),
  }),
}));

// Mock @/components/ThemeToggle
mock.module("@/components/ThemeToggle", () => ({
  default: () => React.createElement("div", null, "ThemeToggle"),
}));

const mockLogout = mock(async () => {});
const mockAuthValue: any = {
  user: { name: "Test User", username: "testuser", role: "user" },
  logout: mockLogout,
  loading: false,
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

describe("Shell component", () => {
  it("renders shell navigation and user details", () => {
    const html = renderToString(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(
          AuthContext.Provider,
          { value: mockAuthValue },
          React.createElement(Shell, null, React.createElement("div", null, "Child Content"))
        )
      )
    );
    expect(html).toContain("Timesheet");
    expect(html).toContain("Child Content");
    expect(html).toContain("Sign out");
  });

  it("renders admin navigation without employee timesheet menus for admin users", () => {
    const adminAuthValue: any = {
      user: { name: "Admin User", username: "admin", role: "admin" },
      logout: mockLogout,
      loading: false,
    };
    const html = renderToString(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(
          AuthContext.Provider,
          { value: adminAuthValue },
          React.createElement(Shell, null, React.createElement("div", null, "Admin Content"))
        )
      )
    );
    expect(html).toContain("Administration");
    expect(html).toContain("Users");
    expect(html).toContain("Master Data");
    expect(html).not.toContain("Daily Activity");
  });

  it("handles logout click and redirects to /login", async () => {
    let capturedHandler: any = null;
    function Consumer() {
      const tree: any = Shell({ children: null });
      function findClick(node: any) {
        if (!node) return;
        if (typeof node.props?.onClick === "function") {
          const text = Array.isArray(node.props.children)
            ? node.props.children
                .map((c: any) => (typeof c === "string" ? c : ""))
                .join(" ")
            : typeof node.props.children === "string"
              ? node.props.children
              : "";
          if (text.includes("Sign out")) {
            capturedHandler = node.props.onClick;
          }
        }
        if (Array.isArray(node.props?.children)) {
          node.props.children.forEach(findClick);
        } else if (node.props?.children) {
          findClick(node.props.children);
        }
      }
      findClick(tree);
      return tree;
    }

    renderToString(
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        React.createElement(
          AuthContext.Provider,
          { value: mockAuthValue },
          React.createElement(Consumer)
        )
      )
    );
    expect(capturedHandler).toBeDefined();
    await capturedHandler();
    expect(mockLogout).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });
});
