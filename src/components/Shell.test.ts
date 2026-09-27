import { describe, it, expect, mock } from "bun:test";
import React from "react";
import { renderToString } from "react-dom/server";
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

describe("Shell component", () => {
  it("renders shell navigation and user details", () => {
    const html = renderToString(
      React.createElement(
        AuthContext.Provider,
        { value: mockAuthValue },
        React.createElement(Shell, null, React.createElement("div", null, "Child Content"))
      )
    );
    expect(html).toContain("Timesheet");
    expect(html).toContain("Child Content");
    expect(html).toContain("Sign out");
  });

  it("handles logout click and redirects to /login", async () => {
    let capturedHandler: any = null;
    function Consumer() {
      const tree: any = Shell({ children: null });
      function findClick(node: any) {
        if (!node) return;
        if (typeof node.props?.onClick === "function") {
          capturedHandler = node.props.onClick;
        }
        if (Array.isArray(node.props?.children)) {
          node.props.children.forEach(findClick);
        } else if (node.props?.children) {
          findClick(node.props.children);
        }
      }
      findClick(tree);
      return null;
    }

    renderToString(
      React.createElement(
        AuthContext.Provider,
        { value: mockAuthValue },
        React.createElement(Consumer)
      )
    );

    expect(capturedHandler).toBeDefined();
    await capturedHandler();
    expect(mockLogout).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/login");
  });
});
