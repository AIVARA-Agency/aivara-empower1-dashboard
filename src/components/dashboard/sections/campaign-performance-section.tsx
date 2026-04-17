"use client";

import { useState } from "react";
import { Megaphone, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CAMPAIGN_PERFORMANCE } from "@/lib/spend-config";

interface Props {
  isLoading: boolean;
}

export function CampaignPerformanceSection({ isLoading }: Props) {
  const [view, setView] = useState<"last24h" | "last7d">("last24h");

  if (isLoading) return null;

  // Sort campaigns by success rate descending
  const rows = CAMPAIGN_PERFORMANCE
    .map((c) => {
      const period = view === "last7d" ? (c.last7d ?? c.last24h) : c.last24h;
      return {
        name: c.name,
        status: c.status,
        success: period.success,
        failed: period.failed,
        total: period.total,
        successRate: period.successRate,
        hasData: period.total > 0,
      };
    })
    .sort((a, b) => b.successRate - a.successRate);

  const totals = rows.reduce(
    (acc, r) => {
      acc.success += r.success;
      acc.failed += r.failed;
      acc.total += r.total;
      return acc;
    },
    { success: 0, failed: 0, total: 0 }
  );
  const overallRate = totals.total > 0 ? (totals.success / totals.total) * 100 : 0;

  return (
    <section id="campaign-performance" className="space-y-5">
      <div className="border-b border-[var(--border)] pb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[var(--foreground)]">Campaign Performance</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            Drop Cowboy RVM delivery results by campaign
          </p>
        </div>
        <div className="flex gap-1 shrink-0">
          <button
            onClick={() => setView("last24h")}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              view === "last24h"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Last 24hrs
          </button>
          <button
            onClick={() => setView("last7d")}
            className={`text-xs px-3 py-1.5 rounded-md transition-colors ${
              view === "last7d"
                ? "bg-[var(--primary)] text-[var(--primary-foreground)]"
                : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            Last 7 Days
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3">
          <div className="flex items-center gap-2">
            <Megaphone className="h-4 w-4 text-[var(--muted-foreground)]" />
            <p className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Campaigns</p>
          </div>
          <p className="text-xl font-bold text-[var(--foreground)] mt-1">{rows.filter((r) => r.hasData).length}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <p className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Delivered</p>
          </div>
          <p className="text-xl font-bold text-green-600 mt-1">{totals.success.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3">
          <div className="flex items-center gap-2">
            <XCircle className="h-4 w-4 text-red-500" />
            <p className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Failed</p>
          </div>
          <p className="text-xl font-bold text-red-500 mt-1">{totals.failed.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--card)] px-4 py-3">
          <p className="text-[10px] font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Overall Success Rate</p>
          <p className={`text-xl font-bold mt-1 ${overallRate >= 40 ? "text-green-600" : overallRate >= 30 ? "text-amber-600" : "text-red-500"}`}>
            {overallRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Campaign table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold">By Campaign</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="rounded-md border border-[var(--border)] overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                  <th className="text-left px-3 py-2.5 font-medium text-[var(--muted-foreground)]">Campaign</th>
                  <th className="text-left px-3 py-2.5 font-medium text-[var(--muted-foreground)]">Status</th>
                  <th className="text-right px-3 py-2.5 font-medium text-[var(--muted-foreground)]">Success</th>
                  <th className="text-right px-3 py-2.5 font-medium text-[var(--muted-foreground)]">Failed</th>
                  <th className="text-right px-3 py-2.5 font-medium text-[var(--muted-foreground)]">Total</th>
                  <th className="text-right px-3 py-2.5 font-medium text-[var(--muted-foreground)]">Success %</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const rateColor =
                    r.successRate >= 45 ? "text-green-600" :
                    r.successRate >= 35 ? "text-amber-600" :
                    r.successRate >= 25 ? "text-orange-500" :
                    "text-red-500";
                  return (
                    <tr key={r.name} className={i < rows.length - 1 ? "border-b border-[var(--border)]" : ""}>
                      <td className="px-3 py-2.5 font-medium text-[var(--foreground)]">{r.name}</td>
                      <td className="px-3 py-2.5">
                        {r.status ? (
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            r.status === "active" ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300" :
                            r.status === "paused" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" :
                            "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}>
                            {r.status}
                          </span>
                        ) : (
                          <span className="text-[10px] text-[var(--muted-foreground)]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-green-600">{r.success.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-red-500">{r.failed.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums text-[var(--muted-foreground)]">{r.total.toLocaleString()}</td>
                      <td className={`px-3 py-2.5 text-right tabular-nums font-semibold ${rateColor}`}>
                        {r.hasData ? `${r.successRate.toFixed(2)}%` : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[var(--border)] bg-[var(--muted)]">
                  <td className="px-3 py-2.5 font-semibold text-[var(--foreground)]">Total</td>
                  <td className="px-3 py-2.5"></td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-bold text-green-600">{totals.success.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-bold text-red-500">{totals.failed.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-bold text-[var(--foreground)]">{totals.total.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-bold text-[var(--foreground)]">{overallRate.toFixed(2)}%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
