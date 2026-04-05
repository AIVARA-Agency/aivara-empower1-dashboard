"use client";

import {
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardData } from "@/types";
import { CHART_COLORS } from "@/lib/chart-colors";

const TOOLTIP_STYLE = {
  backgroundColor: "var(--popover)",
  borderColor: "var(--border)",
  borderRadius: "0.5rem",
  color: "var(--popover-foreground)",
  fontSize: "0.75rem",
};

interface Props { data: DashboardData; isLoading: boolean; }

export function SmsInboundSection({ data, isLoading }: Props) {
  const { smsInbound } = data ?? {};
  const sortedMonths = [...(smsInbound?.month_breakdown ?? [])].sort((a, b) => a.period.localeCompare(b.period));
  const sortedWeeks  = [...(smsInbound?.week_breakdown  ?? [])].sort((a, b) => a.period.localeCompare(b.period));

  if (isLoading) {
    return (
      <section id="sms-inbound" className="space-y-6">
        <SectionHeading />
        <Card><CardContent className="pt-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
      </section>
    );
  }

  const { total_received, status_reason_counts } = smsInbound;
  const sortedReasons = [...status_reason_counts].sort((a, b) => b.total_received - a.total_received);

  return (
    <section id="sms-inbound" className="space-y-6">
      <SectionHeading />

      {/* Status reason breakdown + total */}
      {sortedReasons.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-sm font-semibold">Inbound by Status Reason</CardTitle>
                <CardDescription className="text-xs">Volume per inbound category</CardDescription>
              </div>
              <div className="text-right shrink-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">Total Received</p>
                <p className="text-xl font-bold text-[var(--foreground)]">{total_received.toLocaleString()}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(140, sortedReasons.length * 44)}>
              <BarChart data={sortedReasons.map((r) => ({ name: r.status_reason, value: r.total_received }))} layout="vertical" margin={{ left: 8, right: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={140} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="value" name="Received" radius={[0, 3, 3, 0]}>
                  {sortedReasons.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Monthly trend — stacked by status reason */}
      {sortedMonths.length > 0 && (() => {
        const reasons = [...new Set(sortedMonths.flatMap((m) => m.by_status_reason.map((r) => r.status_reason)))];
        const chartData = sortedMonths.map((m) => {
          const point: Record<string, number | string> = { month: m.period };
          reasons.forEach((r) => {
            point[r] = m.by_status_reason.find((s) => s.status_reason === r)?.total_received ?? 0;
          });
          return point;
        });
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Monthly Inbound Volume</CardTitle>
              <CardDescription className="text-xs">Messages received per month, broken down by status reason</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {reasons.map((r, i) => (
                    <Bar key={r} dataKey={r} stackId="a" fill={CHART_COLORS[i % CHART_COLORS.length]}
                      radius={i === reasons.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      })()}

      {/* Weekly trend — stacked by status reason */}
      {sortedWeeks.length > 0 && (() => {
        const reasons = [...new Set(sortedWeeks.flatMap((w) => w.by_status_reason.map((r) => r.status_reason)))];
        const chartData = sortedWeeks.map((w) => {
          const point: Record<string, number | string> = { week: w.period };
          reasons.forEach((r) => {
            point[r] = w.by_status_reason.find((s) => s.status_reason === r)?.total_received ?? 0;
          });
          return point;
        });
        return (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Weekly Inbound Volume</CardTitle>
              <CardDescription className="text-xs">Messages received per week, broken down by status reason</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={chartData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  {reasons.map((r, i) => (
                    <Bar key={r} dataKey={r} stackId="a" fill={CHART_COLORS[i % CHART_COLORS.length]}
                      radius={i === reasons.length - 1 ? [3, 3, 0, 0] : [0, 0, 0, 0]} />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        );
      })()}

    </section>
  );
}

function SectionHeading() {
  return (
    <div className="border-b border-[var(--border)] pb-4">
      <h2 className="text-xl font-bold text-[var(--foreground)]">SMS Inbound</h2>
      <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Inbound message volume and category breakdown</p>
    </div>
  );
}
