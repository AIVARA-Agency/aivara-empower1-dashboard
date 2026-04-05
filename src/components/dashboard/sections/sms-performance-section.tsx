"use client";

import {
  BarChart, Bar, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { Send, CheckCircle2, XCircle, AlertCircle, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/dashboard/stats-card";
import type { DashboardData } from "@/types";
import { CHART_COLORS } from "@/lib/chart-colors";

const TOOLTIP_STYLE = {
  backgroundColor: "var(--popover)",
  borderColor: "var(--border)",
  borderRadius: "0.5rem",
  color: "var(--popover-foreground)",
  fontSize: "0.75rem",
};

function fmtCurrency(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtCurrencyShort(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(2)}`;
}

interface Props { data: DashboardData; isLoading: boolean; }

export function SmsPerformanceSection({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <section id="sms-performance" className="space-y-6">
        <SectionHeading />
        <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      </section>
    );
  }

  const { smsRawlogs } = data;
  const {
    total_sent, total_delivered, total_carrier_rejected,
    total_failed, total_cost, overall_delivery_rate,
    carrier_breakdown, month_breakdown,
  } = smsRawlogs;

  const carriers = Object.entries(carrier_breakdown ?? {}).sort(([, a], [, b]) => b.total_sent - a.total_sent);
  const months = Object.entries(month_breakdown ?? {}).sort(([a], [b]) => a.localeCompare(b));

  return (
    <section id="sms-performance" className="space-y-6">
      <SectionHeading />

      {/* Summary stats */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <StatsCard
          title="Total Sent"
          value={total_sent.toLocaleString()}
          subtitle="All outbound messages"
          icon={Send}
          iconClassName="bg-blue-100 text-blue-600"
        />
        <StatsCard
          title="Delivered"
          value={total_delivered.toLocaleString()}
          subtitle="Successfully delivered"
          icon={CheckCircle2}
          iconClassName="bg-green-100 text-green-600"
        />
        <StatsCard
          title="Delivery Rate"
          value={`${overall_delivery_rate.toFixed(1)}%`}
          subtitle="Overall delivery rate"
          icon={Activity}
          iconClassName="bg-violet-100 text-violet-600"
        />
        <StatsCard
          title="Carrier Rejected"
          value={total_carrier_rejected.toLocaleString()}
          subtitle="Rejected by carrier"
          icon={XCircle}
          iconClassName="bg-red-100 text-red-600"
        />
        <StatsCard
          title="Failed"
          value={total_failed.toLocaleString()}
          subtitle="Delivery failures"
          icon={AlertCircle}
          iconClassName="bg-orange-100 text-orange-600"
        />
        <StatsCard
          title="Total Cost"
          value={fmtCurrencyShort(total_cost)}
          subtitle="Messaging spend"
          icon={DollarSign}
          iconClassName="bg-amber-100 text-amber-600"
        />
      </div>

      {/* Carrier breakdown chart */}
      {carriers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Sent by Carrier</CardTitle>
            <CardDescription className="text-xs">Message volume per carrier</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={Math.max(140, carriers.length * 44)}>
              <BarChart
                data={carriers.map(([name, s]) => ({ name, Sent: s.total_sent, Delivered: s.delivered, Rejected: s.carrier_rejected }))}
                layout="vertical"
                margin={{ left: 8, right: 24 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={120} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="Sent" fill="#64b5d0" radius={[0, 3, 3, 0]} />
                <Bar dataKey="Delivered" fill="#6ec6a0" radius={[0, 3, 3, 0]} />
                <Bar dataKey="Rejected" fill="#e07b7b" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Monthly volume chart */}
      {months.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Monthly Volume</CardTitle>
            <CardDescription className="text-xs">Sent and delivered per month</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={months.map(([period, m]) => ({ month: period, Sent: m.total_sent, Delivered: m.delivered }))}
                margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="Sent" fill="#64b5d0" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Delivered" fill="#6ec6a0" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Per-carrier detail cards */}
      {carriers.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Carrier Detail</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {carriers.map(([name, s], i) => (
              <Card key={name}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <p className="text-sm font-bold text-[var(--foreground)] truncate">{name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <div>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Sent</p>
                      <p className="font-semibold tabular-nums">{s.total_sent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Delivered</p>
                      <p className="font-semibold tabular-nums text-green-600">{s.delivered.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Rejected</p>
                      <p className="font-semibold tabular-nums text-red-500">{s.carrier_rejected.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Delivery Rate</p>
                      <p className="font-semibold tabular-nums">{s.delivery_rate.toFixed(1)}%</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-[var(--muted-foreground)]">Cost</p>
                      <p className="font-semibold tabular-nums">{fmtCurrency(s.cost)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Monthly detail cards */}
      {months.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Monthly Detail</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {months.map(([period, m]) => (
              <Card key={period}>
                <CardContent className="pt-4">
                  <p className="text-sm font-bold text-[var(--primary)] mb-3">{period}</p>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <div>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Sent</p>
                      <p className="font-semibold tabular-nums">{m.total_sent.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Delivered</p>
                      <p className="font-semibold tabular-nums text-green-600">{m.delivered.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Rejected</p>
                      <p className="font-semibold tabular-nums text-red-500">{m.carrier_rejected.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[var(--muted-foreground)]">Rate</p>
                      <p className="font-semibold tabular-nums">{m.delivery_rate.toFixed(1)}%</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[10px] text-[var(--muted-foreground)]">Cost</p>
                      <p className="font-semibold tabular-nums">{fmtCurrency(m.cost)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function SectionHeading() {
  return (
    <div className="border-b border-[var(--border)] pb-4">
      <h2 className="text-xl font-bold text-[var(--foreground)]">SMS Performance</h2>
      <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Outbound delivery stats, carrier breakdown, and monthly trends</p>
    </div>
  );
}
