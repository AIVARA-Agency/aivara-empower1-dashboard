"use client";

import { useState } from "react";
import { Send, CheckCircle2, XCircle, AlertCircle, DollarSign, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/dashboard/stats-card";
import type { DashboardData, SmsCarrierStats } from "@/types";
import { CHART_COLORS } from "@/lib/chart-colors";

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
    carrier_breakdown, month_breakdown, week_breakdown,
  } = smsRawlogs;

  const carriers = Object.entries(carrier_breakdown ?? {}).sort(([, a], [, b]) => b.total_sent - a.total_sent);
  const sortedMonths = Object.entries(month_breakdown ?? {}).sort(([a], [b]) => b.localeCompare(a));
  const sortedWeeks = Object.entries(week_breakdown ?? {}).sort(([a], [b]) => b.localeCompare(a));

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

      {/* Month Breakdown — dropdown */}
      {sortedMonths.length > 0 && (
        <MonthBreakdown months={sortedMonths} />
      )}

      {/* Week Breakdown — dropdown */}
      {sortedWeeks.length > 0 && (
        <WeekBreakdown weeks={sortedWeeks} />
      )}

      {/* Carrier Detail — collapsed by default, low priority */}
      {carriers.length > 0 && (
        <CarrierDetailCollapsible carriers={carriers} />
      )}
    </section>
  );
}

function MonthBreakdown({ months }: { months: [string, import("@/types").SmsPeriodEntry][] }) {
  const [selected, setSelected] = useState(months[0][0]);
  const entry = months.find(([p]) => p === selected)?.[1] ?? months[0][1];
  const carrierRows = Object.entries(entry.carrier_breakdown ?? {}).sort(([, a], [, b]) => b.total_sent - a.total_sent);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Month Breakdown</CardTitle>
        <div className="flex flex-col gap-1 mt-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Select Month
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="text-sm rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] max-w-xs"
          >
            {months.map(([period]) => (
              <option key={period} value={period}>{period}</option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <PeriodStats entry={entry} />
        {carrierRows.length > 0 && <CarrierTable rows={carrierRows} />}
      </CardContent>
    </Card>
  );
}

function WeekBreakdown({ weeks }: { weeks: [string, import("@/types").SmsWeekEntry][] }) {
  const [selected, setSelected] = useState(weeks[0][0]);
  const entry = weeks.find(([p]) => p === selected)?.[1] ?? weeks[0][1];
  const carrierRows = Object.entries(entry.carrier_breakdown ?? {}).sort(([, a], [, b]) => b.total_sent - a.total_sent);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold">Week Breakdown</CardTitle>
        <div className="flex flex-col gap-1 mt-2">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Select Week
          </label>
          <select
            value={selected}
            onChange={(e) => setSelected(e.target.value)}
            className="text-sm rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[var(--ring)] max-w-xs"
          >
            {weeks.map(([period, w]) => (
              <option key={period} value={period}>{period} — {w.date_range}</option>
            ))}
          </select>
          <p className="text-[11px] text-[var(--muted-foreground)]">
            {entry.date_range}
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <PeriodStats entry={entry} />
        {carrierRows.length > 0 && <CarrierTable rows={carrierRows} />}
      </CardContent>
    </Card>
  );
}

function PeriodStats({ entry }: { entry: { total_sent: number; delivered: number; carrier_rejected: number; failed: number; cost: number; delivery_rate: number } }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      <StatBox label="Sent" value={entry.total_sent.toLocaleString()} />
      <StatBox label="Delivered" value={entry.delivered.toLocaleString()} valueClassName="text-green-600" />
      <StatBox label="Delivery Rate" value={`${entry.delivery_rate.toFixed(1)}%`} />
      <StatBox label="Rejected" value={entry.carrier_rejected.toLocaleString()} valueClassName="text-red-500" />
      <StatBox label="Failed" value={entry.failed.toLocaleString()} valueClassName="text-orange-500" />
      <StatBox label="Cost" value={`$${entry.cost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
    </div>
  );
}

function CarrierTable({ rows }: { rows: [string, SmsCarrierStats][] }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1.5">By Carrier</p>
      <div className="rounded-md border border-[var(--border)] overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
              <th className="text-left px-2 py-1.5 font-medium text-[var(--muted-foreground)]">Carrier</th>
              <th className="text-right px-2 py-1.5 font-medium text-[var(--muted-foreground)]">Sent</th>
              <th className="text-right px-2 py-1.5 font-medium text-[var(--muted-foreground)]">Delivered</th>
              <th className="text-right px-2 py-1.5 font-medium text-[var(--muted-foreground)]">Rejected</th>
              <th className="text-right px-2 py-1.5 font-medium text-[var(--muted-foreground)]">Rate</th>
              <th className="text-right px-2 py-1.5 font-medium text-[var(--muted-foreground)]">Cost</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([carrier, s], i) => (
              <tr key={carrier} className={i < rows.length - 1 ? "border-b border-[var(--border)]" : ""}>
                <td className="px-2 py-1.5 font-medium text-[var(--foreground)]">{carrier}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{s.total_sent.toLocaleString()}</td>
                <td className="px-2 py-1.5 text-right tabular-nums text-green-600">{s.delivered.toLocaleString()}</td>
                <td className="px-2 py-1.5 text-right tabular-nums text-red-500">{s.carrier_rejected.toLocaleString()}</td>
                <td className="px-2 py-1.5 text-right tabular-nums">{s.delivery_rate.toFixed(1)}%</td>
                <td className="px-2 py-1.5 text-right tabular-nums">${s.cost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CarrierDetailCollapsible({ carriers }: { carriers: [string, SmsCarrierStats][] }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-[var(--border)] rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
      >
        <span>Carrier Detail ({carriers.length} carriers)</span>
        <span className="text-xs">{open ? "Hide" : "Show"}</span>
      </button>
      {open && (
        <div className="px-4 pb-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {carriers.map(([name, s], i) => (
              <Card key={name}>
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                    <p className="text-sm font-bold text-[var(--foreground)] truncate">{name}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                    <Stat label="Sent" value={s.total_sent.toLocaleString()} />
                    <Stat label="Delivered" value={s.delivered.toLocaleString()} valueClassName="text-green-600" />
                    <Stat label="Rejected" value={s.carrier_rejected.toLocaleString()} valueClassName="text-red-500" />
                    <Stat label="Delivery Rate" value={`${s.delivery_rate.toFixed(1)}%`} />
                    <div className="col-span-2">
                      <Stat label="Cost" value={fmtCurrency(s.cost)} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div className="rounded-md border border-[var(--border)] bg-[var(--muted)] px-3 py-2">
      <p className="text-[10px] text-[var(--muted-foreground)] mb-0.5">{label}</p>
      <p className={`text-sm font-semibold tabular-nums ${valueClassName ?? ""}`}>{value}</p>
    </div>
  );
}

function Stat({ label, value, valueClassName }: { label: string; value: string; valueClassName?: string }) {
  return (
    <div>
      <p className="text-[10px] text-[var(--muted-foreground)]">{label}</p>
      <p className={`font-semibold tabular-nums ${valueClassName ?? ""}`}>{value}</p>
    </div>
  );
}

function SectionHeading() {
  return (
    <div className="border-b border-[var(--border)] pb-4">
      <h2 className="text-xl font-bold text-[var(--foreground)]">SMS Outbound</h2>
      <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Messages sent, delivery rates, and cost</p>
    </div>
  );
}
