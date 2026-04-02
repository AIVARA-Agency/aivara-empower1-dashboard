"use client";

import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import {
  MessageSquare, MessageCircle, Inbox, TrendingDown, DollarSign,
  CheckCircle2, XCircle,
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

export function SMSSection({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <section id="sms" className="space-y-6">
        <SectionHeading title="SMS" subtitle="Outbound delivery, inbound replies, and queue status" />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
      </section>
    );
  }

  const { smsRawlogs, smsInbound } = data;

  // Outbound charts
  const statusData = Object.entries(smsRawlogs.status_breakdown).map(([name, value]) => ({ name, value }));
  const campaignData = Object.entries(smsRawlogs.campaign_breakdown)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));
  const leadSourceData = Object.entries(smsRawlogs.lead_source_breakdown).map(([name, value]) => ({ name, value }));
  const smsMonths = Object.entries(smsRawlogs.month_breakdown)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, e]) => ({ month, Messages: e.total_messages, Cost: e.total_cost }));

  // Inbound charts
  const sentimentData = Object.entries(smsInbound.status_reason_counts)
    .sort(([, a], [, b]) => b - a)
    .map(([name, value]) => ({ name, value }));
  const inboundMonths = Object.entries(smsInbound.month_breakdown)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, e]) => ({ month, Received: e.total_received }));

  const delivered = smsRawlogs.status_breakdown.delivered ?? 0;
  const rejected = smsRawlogs.status_breakdown.carrier_rejected ?? 0;
  const deliveryRate = smsRawlogs.total_messages > 0
    ? ((delivered / smsRawlogs.total_messages) * 100).toFixed(1)
    : "0.0";

  const dnc = smsInbound.status_reason_counts["DNC"] ?? 0;
  const positive = smsInbound.status_reason_counts["POSITIVE"] ?? 0;
  const neutral = smsInbound.status_reason_counts["NEUTRAL"] ?? 0;
  const negative = smsInbound.status_reason_counts["NEGATIVE"] ?? 0;

  return (
    <section id="sms" className="space-y-8">
      <SectionHeading title="SMS" subtitle="Outbound delivery, inbound replies, and queue status" />

      {/* ── Outbound ──────────────────────────────────────────────── */}
      <SubSection
        icon={MessageSquare}
        title="Outbound"
        description="via Commio"
      >
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard title="Total Messages" value={fmt(smsRawlogs.total_messages)}
            subtitle="All outbound SMS" icon={MessageSquare} iconClassName="bg-blue-100 text-blue-600" />
          <StatsCard title="Delivered" value={fmt(delivered)}
            subtitle={`${deliveryRate}% delivery rate`} icon={CheckCircle2} iconClassName="bg-green-100 text-green-600" />
          <StatsCard title="Carrier Rejected" value={fmt(rejected)}
            subtitle={`${smsRawlogs.total_messages > 0 ? ((rejected / smsRawlogs.total_messages) * 100).toFixed(1) : 0}% rejection rate`}
            icon={XCircle} iconClassName="bg-red-100 text-red-600" />
          <StatsCard title="Total Cost" value={fmtCurrency(smsRawlogs.total_cost)}
            subtitle="Outbound SMS spend" icon={DollarSign} iconClassName="bg-teal-100 text-teal-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Delivery Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={color(entry.name, i)} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Campaign Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={campaignData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} width={60} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="Messages" radius={[0, 3, 3, 0]}>
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
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={120} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="Messages" radius={[0, 3, 3, 0]}>
                    {leadSourceData.map((_, i) => <Cell key={i} fill={CHART_COLORS[(i + 2) % CHART_COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Monthly Volume &amp; Cost</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={smsMonths} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar yAxisId="left" dataKey="Messages" fill="#64b5d0" radius={[3, 3, 0, 0]} />
                  <Bar yAxisId="right" dataKey="Cost" fill="#e0a875" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </SubSection>

      {/* ── Inbound ───────────────────────────────────────────────── */}
      <SubSection
        icon={Inbox}
        title="Inbound Replies"
        description="Responses received from leads"
      >
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-4">
          <StatsCard title="Total Received" value={fmt(smsInbound.total_received)}
            subtitle="All inbound replies" icon={Inbox} iconClassName="bg-teal-100 text-teal-600" />
          <StatsCard title="DNC" value={fmt(dnc)}
            subtitle="Do Not Contact" icon={XCircle} iconClassName="bg-red-100 text-red-600" />
          <StatsCard title="Positive" value={fmt(positive)}
            subtitle="Interested leads" icon={CheckCircle2} iconClassName="bg-green-100 text-green-600" />
          <StatsCard title="Neutral" value={fmt(neutral)}
            subtitle="Neutral responses" icon={MessageCircle} iconClassName="bg-blue-100 text-blue-600" />
          <StatsCard title="Negative" value={fmt(negative)}
            subtitle="Negative responses" icon={TrendingDown} iconClassName="bg-orange-100 text-orange-600" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Reply Sentiment Breakdown</CardTitle>
              <CardDescription className="text-xs">All response categories</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={sentimentData} layout="vertical" margin={{ left: 8, right: 16 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={130} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="value" name="Count" radius={[0, 3, 3, 0]}>
                    {sentimentData.map((entry, i) => <Cell key={i} fill={color(entry.name, i)} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Monthly Inbound Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={inboundMonths} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
                  <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="Received" fill="#6ec6a0" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
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

function SubSection({
  icon: Icon, title, description, children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  children: React.ReactNode;
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

