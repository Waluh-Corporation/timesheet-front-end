import { describe, it, expect, mock } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
import Shell from "./Shell";

const mockReplace = mock(() => {});
// Mock next/navigation
mock.module("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({
    replace: mockReplace,
    push: mock(() => {}),
  }),
}));

// Mock @/lib/auth
const mockLogout = mock(async () => {});
mock.module("@/lib/auth", () => ({
  useAuth: () => ({
    user: { name: "Test User", username: "testuser", role: "user" },
    logout: mockLogout,
    loading: false,
  }),
}));

// Mock @/components/ThemeToggle
mock.module("@/components/ThemeToggle", () => ({
  default: () => React.createElement("div", null, "ThemeToggle"),
}));

describe("Shell component", () => {
  it("renders shell navigation and user details", () => {
    const html = renderToString(
      React.createElement(Shell, null, React.createElement("div", null, "Child Content"))
    );
    expect(html).toContain("Timesheet");
    expect(html).toContain("Child Content");
    expect(html).toContain("Sign out");
  });

  it("handles logout click and redirects to /login", async () => {
    const tree: any = Shell({ children: null });

    function findClickHandlers(node: any): Array<() => Promise<void>> {
      if (!node) return [];
      const res: Array<() => Promise<void>> = [];
      if (typeof node.props?.onClick === "function") {
        res.push(node.props.onClick);
      }
      if (Array.isArray(node.props?.children)) {
        for (const child of node.props.children) {
          res.push(...findClickHandlers(child));
        }
      } else if (node.props?.children) {
        res.push(...findClickHandlers(node.props.children));
      }
      return res;
    }

    const clickHandlers = findClickHandlers(tree);
    expect(clickHandlers.length).toBeGreaterThan(0);

    // Invoke handleLogout
    await clickHandlers[0]();
    expect(mockLogout).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });
});
