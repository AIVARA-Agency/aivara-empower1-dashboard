"use client";

import {
  PieChart, Pie, Cell, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  PhoneCall, CheckCircle2, XCircle, Clock3, DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/dashboard/stats-card";
import type { DashboardData } from "@/types";
import { CHART_COLORS, STATUS_COLORS } from "@/lib/chart-colors";

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
function color(key: string, idx: number) {
  return STATUS_COLORS[key] ?? CHART_COLORS[idx % CHART_COLORS.length];
}

interface Props { data: DashboardData; isLoading: boolean; }

export function RVMSection({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <section id="rvm" className="space-y-6">
        <SectionHeading title="RVM" subtitle="Ringless Voicemail delivery performance and queue" />
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      </section>
    );
  }

  const { rvmRawlogs } = data;

  // Performance charts
  const outcomePie = [
    { name: "Success", value: rvmRawlogs.success },
    { name: "Failure", value: rvmRawlogs.failure },
    { name: "Queued", value: rvmRawlogs.queue },
  ];
  const failureData = Object.entries(rvmRawlogs.reasons)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));
  const campaignData = Object.entries(rvmRawlogs.campaign_breakdown)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));
  const leadSourceData = Object.entries(rvmRawlogs.lead_source_breakdown).map(([name, value]) => ({ name, value }));
  const monthTrend = Object.entries(rvmRawlogs.month_breakdown)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, e]) => ({ month, Success: e.success, Failure: e.failure, Queued: e.queued }));

  const successRate = rvmRawlogs.total_rvm > 0
    ? ((rvmRawlogs.success / rvmRawlogs.total_rvm) * 100).toFixed(1)
    : "0.0";

  return (
    <section id="rvm" className="space-y-8">
      <SectionHeading title="RVM" subtitle="Ringless Voicemail delivery performance and queue" />

      {/* ── Performance ───────────────────────────────────────────── */}
      <SubSection icon={PhoneCall} title="Performance" description="via Drop Cowboy">
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          <StatsCard title="Total RVM" value={fmt(rvmRawlogs.total_rvm)}
            subtitle="All voicemails sent" icon={PhoneCall} iconClassName="bg-violet-100 text-violet-600" />
          <StatsCard title="Success" value={fmt(rvmRawlogs.success)}
            subtitle={`${successRate}% success rate`} icon={CheckCircle2} iconClassName="bg-green-100 text-green-600" />
          <StatsCard title="Failure" value={fmt(rvmRawlogs.failure)}
            subtitle="Failed deliveries" icon={XCircle} iconClassName="bg-red-100 text-red-600" />
          <StatsCard title="Queued" value={fmt(rvmRawlogs.queue)}
            subtitle="Awaiting Drop Cowboy callback" icon={Clock3} iconClassName="bg-amber-100 text-amber-600" />
          <StatsCard title="Total Cost" value={fmtCurrency(rvmRawlogs.total_cost)}
            subtitle="RVM spend" icon={DollarSign} iconClassName="bg-teal-100 text-teal-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Outcome Breakdown</CardTitle>
              <CardDescription className="text-xs">Success / Failure / Queued</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={outcomePie} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    <Cell fill="#6ec6a0" />
                    <Cell fill="#e05c5c" />
                    <Cell fill="#e0a875" />
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Failure Reasons</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={failureData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={140} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="Count" radius={[0, 3, 3, 0]}>
                    {failureData.map((entry, i) => <Cell key={i} fill={color(entry.name, i)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Campaign Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={campaignData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={60} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="Count" radius={[0, 3, 3, 0]}>
                    {campaignData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Lead Source Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={leadSourceData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={130} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="Count" radius={[0, 3, 3, 0]}>
                    {leadSourceData.map((_, i) => <Cell key={i} fill={CHART_COLORS[(i + 4) % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Monthly trend area chart */}
        {monthTrend.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Monthly Trend — Success / Failure / Queued</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={monthTrend} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="successGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6ec6a0" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6ec6a0" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="failureGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e05c5c" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e05c5c" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="queuedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e0a875" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#e0a875" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="Success" stroke="#6ec6a0" fill="url(#successGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Failure" stroke="#e05c5c" fill="url(#failureGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="Queued" stroke="#e0a875" fill="url(#queuedGrad)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}
      </SubSection>

    </section>
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

function SubSection({ icon: Icon, title, description, children }: {
  icon: React.ElementType; title: string; description: string; children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span
          className="flex items-center justify-center w-7 h-7 rounded-md"
          style={{ backgroundColor: "color-mix(in srgb, var(--primary) 12%, transparent)", color: "var(--primary)" }}
        >
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-[var(--foreground)]">{title}</h3>
          <p className="text-xs text-[var(--muted-foreground)]">{description}</p>
        </div>
      </div>
      {children}
    </div>
  );
}
