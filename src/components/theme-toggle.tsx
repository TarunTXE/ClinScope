"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        aria-label="Toggle theme"
        className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-navy-200 dark:border-navy-800 bg-transparent text-navy-600 dark:text-navy-300 transition-colors"
      >
        <span className="h-4 w-4" />
      </button>
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-navy-200 bg-white/80 dark:border-navy-800 dark:bg-navy-900/80 text-navy-600 hover:text-navy-900 dark:text-navy-300 dark:hover:text-white transition-all shadow-sm hover:border-clinical-400 dark:hover:border-clinical-500 focus:outline-none focus:ring-2 focus:ring-clinical-500"
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-200 rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-200 rotate-0 scale-100" />
      )}
    </button>
  );
}
