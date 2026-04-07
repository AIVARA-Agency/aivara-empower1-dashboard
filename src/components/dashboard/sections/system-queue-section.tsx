"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardData } from "@/types";

interface Props { data: DashboardData; isLoading: boolean; }

export function SystemQueueSection({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <section id="system-queue" className="space-y-6">
        <SectionHeading />
        <Card><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
      </section>
    );
  }

  const { smsQueue } = data;

  return (
    <section id="system-queue" className="space-y-6">
      <SectionHeading />

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

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {/* Campaign Breakdown */}
            {Object.keys(smsQueue.campaign_breakdown).length > 0 && (
              <BreakdownCard
                title="Campaign Breakdown"
                entries={smsQueue.campaign_breakdown}
              />
            )}

            {/* Carrier Breakdown */}
            {Object.keys(smsQueue.carrier_breakdown).length > 0 && (
              <BreakdownCard
                title="Carrier Breakdown"
                entries={smsQueue.carrier_breakdown}
              />
            )}

          </div>
        </div>
      )}
    </section>
  );
}

function BreakdownCard({ title, entries }: { title: string; entries: Record<string, number> }) {
  const rows = Object.entries(entries).sort((a, b) => b[1] - a[1]);
  const total = rows.reduce((s, [, v]) => s + v, 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-[var(--foreground)]">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
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
                  <div
                    className="h-full rounded-full bg-[#4cc9f0]"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function SectionHeading() {
  return (
    <div className="border-b border-[var(--border)] pb-4">
      <h2 className="text-xl font-bold text-[var(--foreground)]">System Queue</h2>
      <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Pending SMS messages awaiting dispatch</p>
    </div>
  );
}
