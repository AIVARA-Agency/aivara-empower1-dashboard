"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { MobileSidebar } from "./sidebar";
import { cn } from "@/lib/utils";

interface HeaderProps {
  lastUpdated?: Date | null;
  onRefresh?: () => void;
  isRefreshing?: boolean;
}

export function Header({ lastUpdated, onRefresh, isRefreshing }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!lastUpdated) return;
    const interval = setInterval(() => {
      setSecondsAgo(Math.floor((Date.now() - lastUpdated.getTime()) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const formatSecondsAgo = (s: number) => {
    if (s < 60) return `${s}s ago`;
    return `${Math.floor(s / 60)}m ${s % 60}s ago`;
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[var(--border)] bg-[var(--background)] px-4 lg:px-6">
      {/* Mobile menu toggle */}
      <MobileSidebar />

      {/* Title */}
      <div className="flex-1">
        <h1 className="text-lg font-semibold text-[var(--foreground)] hidden lg:block">
          AIVARA Empower Dashboard
        </h1>
        <h1 className="text-base font-semibold text-[var(--foreground)] lg:hidden">
          AIVARA
        </h1>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Last updated indicator */}
        {lastUpdated && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-[var(--muted-foreground)]">
            <span
              className={cn(
                "inline-block w-2 h-2 rounded-full",
                isRefreshing ? "bg-yellow-500 animate-pulse" : "bg-green-500"
              )}
            />
            <span>Updated {formatSecondsAgo(secondsAgo)}</span>
          </div>
        )}

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              "p-2 rounded-md transition-colors",
              "hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--accent-foreground)]",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            title="Refresh data"
          >
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </button>
        )}

        {/* Theme toggle */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md transition-colors hover:bg-[var(--accent)] text-[var(--muted-foreground)] hover:text-[var(--accent-foreground)]"
            title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    </header>
  );
}
