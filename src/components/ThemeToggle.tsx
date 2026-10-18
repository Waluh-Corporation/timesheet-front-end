"use client";

import { IconMoon, IconSun } from "@tabler/icons-react";
import { useTheme } from "@/lib/theme";

// Clean theme toggle matching Tabler dashboard styling
export default function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      className={`btn btn-icon btn-ghost ${className}`}
    >
      {isDark ? <IconSun size={18} className="text-warning" /> : <IconMoon size={18} />}
    </button>
  );
}
