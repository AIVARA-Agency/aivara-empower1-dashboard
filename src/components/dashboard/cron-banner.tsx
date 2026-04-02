"use client";

import { Clock } from "lucide-react";

export function CronBanner() {
  return (
    <div
      className="flex items-center gap-3 px-4 lg:px-6 py-3 border-b border-[var(--border)] text-sm"
      style={{
        backgroundColor: "color-mix(in srgb, var(--primary) 8%, transparent)",
        borderLeftWidth: "3px",
        borderLeftStyle: "solid",
        borderLeftColor: "color-mix(in srgb, var(--primary) 40%, transparent)",
      }}
    >
      <Clock className="h-4 w-4 shrink-0" style={{ color: "var(--primary)" }} />
      <span className="text-[var(--muted-foreground)]">
        <span className="font-medium text-[var(--foreground)]">Cached data</span>
        {" — "}processed by a scheduled job running daily at{" "}
        <span className="font-medium text-[var(--foreground)]">6 AM, 12 PM, 3 PM, and 6 PM</span>.
        What you&apos;re seeing reflects the last completed run.
      </span>
    </div>
  );
}
