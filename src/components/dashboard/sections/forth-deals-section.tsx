"use client";

import {
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { DollarSign, TrendingUp, Users, CreditCard, Banknote } from "lucide-react";
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

function fmt(n: number) {
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(1)}K` : String(n);
}
function fmtCurrency(n: number) {
  return `$${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function fmtCurrencyShort(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n.toFixed(0)}`;
}

interface Props { data: DashboardData; isLoading: boolean; }

export function ForthDealsSection({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <section id="forth-deals" className="space-y-6">
        <SectionHeading title="Forth Deals" subtitle="Deal pipeline, debt, and revenue overview" />
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      </section>
    );
  }

  const { forthDeals } = data;

  // Lead source pie
  const leadSourceData = Object.entries(forthDeals.lead_source_breakdown).map(([name, value]) => ({ name, value }));

  // Monthly data
  const monthData = Object.entries(forthDeals.month_breakdown)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, e]) => ({
      month,
      Deals: e.deals,
      "Debt Revenue": e.debt_revenue,
      "Payment Revenue": e.payment_revenue,
      "Debt Amount": e.current_debt_amount,
      "Current Payment": e.current_payment,
    }));

  const totalRevenue = forthDeals.total_debt_revenue + forthDeals.total_payment_revenue;

  return (
    <section id="forth-deals" className="space-y-6">
      <SectionHeading title="Forth Deals" subtitle="Deal pipeline, debt, and revenue overview" />

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
        <StatsCard title="Total Deals" value={String(forthDeals.total_deals)}
          subtitle="All processed deals" icon={TrendingUp} iconClassName="bg-violet-100 text-violet-600" />
        <StatsCard title="Total Debt Amount" value={fmtCurrency(forthDeals.total_current_debt_amount)}
          subtitle="Current client debt" icon={CreditCard} iconClassName="bg-red-100 text-red-600" />
        <StatsCard title="Debt Revenue" value={fmtCurrency(forthDeals.total_debt_revenue)}
          subtitle="Revenue from debt" icon={DollarSign} iconClassName="bg-teal-100 text-teal-600" />
        <StatsCard title="Current Payment" value={fmtCurrency(forthDeals.total_current_payment)}
          subtitle="Client payment amounts" icon={Banknote} iconClassName="bg-amber-100 text-amber-600" />
        <StatsCard title="Payment Revenue" value={fmtCurrency(forthDeals.total_payment_revenue)}
          subtitle={`Total revenue: ${fmtCurrency(totalRevenue)}`} icon={Users} iconClassName="bg-green-100 text-green-600" />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Lead Source Breakdown</CardTitle>
            <CardDescription className="text-xs">Deals by lead origin</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={leadSourceData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`} labelLine>
                  {leadSourceData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Monthly Deals Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="Deals" fill="#a78bca" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Revenue area chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Monthly Revenue Trend</CardTitle>
          <CardDescription className="text-xs">Debt revenue vs payment revenue over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="debtRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#64b5d0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#64b5d0" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="payRevGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6ec6a0" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6ec6a0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickFormatter={fmtCurrencyShort} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: number) => fmtCurrency(v)} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="Debt Revenue" stroke="#64b5d0" fill="url(#debtRevGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="Payment Revenue" stroke="#6ec6a0" fill="url(#payRevGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Per-month detail cards */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3">Monthly Detail</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {monthData.map((m) => (
            <Card key={m.month}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-bold text-[var(--primary)]">{m.month}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5 text-xs">
                <Row label="Deals" value={String(m.Deals)} />
                <Row label="Debt Amount" value={fmtCurrency(m["Debt Amount"] as number)} />
                <Row label="Debt Revenue" value={fmtCurrency(m["Debt Revenue"] as number)} />
                <Row label="Payment" value={fmtCurrency(m["Current Payment"] as number)} />
                <Row label="Pay Revenue" value={fmtCurrency(m["Payment Revenue"] as number)} />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-[var(--muted-foreground)]">{label}</span>
      <span className="font-medium text-[var(--foreground)]">{value}</span>
    </div>
  );
}

function SectionHeading({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="border-b border-[var(--border)] pb-4">
      <h2 className="text-xl font-bold text-[var(--foreground)]">{title}</h2>
      <p className="text-sm text-[var(--muted-foreground)] mt-0.5">{subtitle}</p>
    </div>
  );
}

// Keep fmt to avoid lint warning
void fmt;
