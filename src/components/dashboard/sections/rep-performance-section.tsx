"use client";

import { Users, Trophy, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardData, ForthRepEntry } from "@/types";

function fmtCurrency(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

interface Props {
  data: DashboardData;
  isLoading: boolean;
}

export function RepPerformanceSection({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <section id="rep-performance" className="space-y-4">
        <div className="border-b border-[var(--border)] pb-4">
          <h2 className="text-xl font-bold text-[var(--foreground)]">Rep Performance</h2>
        </div>
        <Card><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
      </section>
    );
  }

  const { forthDeals } = data;
  const repData = forthDeals.rep_breakdown;
  const hasRepData = repData && repData.length > 0;

  // Sort reps by revenue descending
  const sortedReps = hasRepData
    ? [...repData].sort((a, b) => b.total_revenue - a.total_revenue)
    : [];

  const topRep = sortedReps[0];

  return (
    <section id="rep-performance" className="space-y-5">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="text-xl font-bold text-[var(--foreground)]">Rep Performance</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Deals closed by sales rep</p>
      </div>

      {!hasRepData ? (
        <Card>
          <CardContent className="pt-8 pb-8">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Rep data not connected yet</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 max-w-md">
                  Once Fourth sends rep assignments with deal data, this section will show a leaderboard
                  with deals closed, revenue, and average deal size per rep.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Top performer callout */}
          {topRep && (
            <Card className="overflow-hidden border-l-4 border-l-amber-500 bg-gradient-to-r from-amber-50/50 to-transparent dark:from-amber-950/20">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100 text-amber-600 shrink-0">
                    <Trophy className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Top Performer</p>
                    <p className="text-lg font-bold text-[var(--foreground)]">{topRep.rep_name}</p>
                    <p className="text-sm text-[var(--muted-foreground)]">
                      {topRep.total_deals} deals &middot; {fmtCurrency(topRep.total_revenue)} revenue
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rep leaderboard table */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-[var(--muted-foreground)]" />
                <CardTitle className="text-sm font-semibold">Leaderboard</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="rounded-md border border-[var(--border)] overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                      <th className="text-left px-3 py-2.5 font-medium text-[var(--muted-foreground)]">#</th>
                      <th className="text-left px-3 py-2.5 font-medium text-[var(--muted-foreground)]">Rep</th>
                      <th className="text-right px-3 py-2.5 font-medium text-[var(--muted-foreground)]">Deals</th>
                      <th className="text-right px-3 py-2.5 font-medium text-[var(--muted-foreground)]">Revenue</th>
                      <th className="text-right px-3 py-2.5 font-medium text-[var(--muted-foreground)]">Avg Deal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedReps.map((rep, i) => {
                      const avgDeal = rep.avg_deal_size ?? (rep.total_deals > 0 ? rep.total_revenue / rep.total_deals : 0);
                      return (
                        <tr
                          key={rep.rep_name}
                          className={i < sortedReps.length - 1 ? "border-b border-[var(--border)]" : ""}
                        >
                          <td className="px-3 py-2.5 text-[var(--muted-foreground)] font-medium">{i + 1}</td>
                          <td className="px-3 py-2.5 font-medium text-[var(--foreground)]">{rep.rep_name}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-[var(--foreground)]">{rep.total_deals.toLocaleString()}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums font-semibold text-green-600">{fmtCurrency(rep.total_revenue)}</td>
                          <td className="px-3 py-2.5 text-right tabular-nums text-[var(--muted-foreground)]">{fmtCurrency(avgDeal)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </section>
  );
}
