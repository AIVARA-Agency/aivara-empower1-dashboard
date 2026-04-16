"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardData } from "@/types";

interface Props {
  data: DashboardData;
  isLoading: boolean;
  onToggle: () => Promise<void>;
  isToggling: boolean;
}

export function SystemQueueSection({ data, isLoading, onToggle, isToggling }: Props) {
  if (isLoading) {
    return (
      <section id="system-queue" className="space-y-6">
        <SectionHeading isOn={false} isToggling={false} onToggle={onToggle} />
        <Card><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
      </section>
    );
  }

  const { smsQueue, settings } = data;
  const isOn = settings.settings.sms_queue_toggle === "true";

  return (
    <section id="system-queue" className="space-y-6">
      <SectionHeading isOn={isOn} isToggling={isToggling} onToggle={onToggle} />

      {smsQueue.total_queued === 0 ? (
        <div
          className="flex items-center justify-center rounded-lg border border-dashed py-16 text-sm text-[var(--muted-foreground)]"
          style={{ borderColor: "var(--border)" }}
        >
          All clear — no messages queued
        </div>
      ) : (
        <div className="space-y-4">
          {/* Total */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-5 py-4 flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--muted-foreground)]">Total Queued</span>
            <span className="text-2xl font-bold tabular-nums text-[var(--foreground)]">
              {smsQueue.total_queued.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.keys(smsQueue.campaign_breakdown).length > 0 && (
              <BreakdownCard title="Campaign Breakdown" entries={smsQueue.campaign_breakdown} />
            )}
            {Object.keys(smsQueue.carrier_breakdown).length > 0 && (
              <BreakdownCard title="Carrier Breakdown" entries={smsQueue.carrier_breakdown} />
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function SectionHeading({
  isOn,
  isToggling,
  onToggle,
}: {
  isOn: boolean;
  isToggling: boolean;
  onToggle: () => Promise<void>;
}) {
  return (
    <div className="border-b border-[var(--border)] pb-4 flex items-start justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">System Queue</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Pending SMS messages awaiting dispatch</p>
      </div>

      {/* Toggle */}
      <div className="flex items-center gap-3 shrink-0 pt-0.5">
        <span className="text-xs font-medium text-[var(--muted-foreground)]">SMS Queue</span>
        <button
          onClick={onToggle}
          disabled={isToggling}
          aria-label={isOn ? "Turn SMS queue off" : "Turn SMS queue on"}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed
            ${isOn ? "bg-green-500" : "bg-[var(--muted)]"}`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200
              ${isOn ? "translate-x-5" : "translate-x-0"}`}
          />
        </button>
        <span className={`text-xs font-semibold ${isOn ? "text-green-500" : "text-[var(--muted-foreground)]"}`}>
          {isToggling ? "Updating…" : isOn ? "ON" : "OFF"}
        </span>
      </div>
    </div>
  );
}

function BreakdownCard({ title, entries }: { title: string; entries: Record<string, number> }) {
  const rows = Object.entries(entries).sort((a, b) => b[1] - a[1]);
  const total = rows.reduce((s, [, v]) => s + v, 0);

  return (
    <Card>
      <CardContent className="pt-4">
        <p className="text-xs font-semibold text-[var(--foreground)] mb-3">{title}</p>
        <div className="space-y-2">
          {rows.map(([label, count]) => {
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-[var(--foreground)] font-medium truncate max-w-[60%]">{label}</span>
                  <span className="tabular-nums text-[var(--muted-foreground)]">
                    {count.toLocaleString()} <span className="text-[10px]">({pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--muted)] overflow-hidden">
                  <div className="h-full rounded-full bg-[#4cc9f0]" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
