"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Sun, Moon, Menu, Radio, Settings } from "lucide-react";

interface TopbarProps {
  onMenuClick?: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-8 border-b bg-[var(--card-bg)]/80 backdrop-blur-md border-[var(--border-color)]">
      {/* Left section (Mobile menu trigger + Logo subtitle) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl lg:hidden text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 lg:hidden">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-600/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 font-bold border border-blue-500/20">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <span className="font-semibold text-sm text-[var(--foreground)]">H2H Listener</span>
        </div>
      </div>

      {/* Right section (Live indicator, theme toggle, settings link) */}
      <div className="flex items-center gap-3">
        {/* Live Indicator Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs font-medium">
          <span className="relative flex w-2 h-2">
            <span className="absolute inline-flex w-full h-full rounded-full opacity-75 animate-ping bg-emerald-400"></span>
            <span className="relative inline-flex w-2 h-2 rounded-full bg-emerald-500"></span>
          </span>
          <span>Live Stream</span>
        </div>

        {/* Theme Toggle Button */}
        {mounted && (
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-[var(--border-color)]"
            title="Toggle Light / Dark mode"
          >
            {theme === "dark" ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
          </button>
        )}

        {/* Settings button */}
        <Link
          href="/settings"
          className="p-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border border-[var(--border-color)]"
          title="Settings"
        >
          <Settings className="w-4.5 h-4.5" />
        </Link>
      </div>
    </header>
  );
}
