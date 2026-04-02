"use client";

import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { MessageSquare, PhoneCall, CheckCircle2, Clock3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Props { data: DashboardData; isLoading: boolean; }

export function SystemQueueSection({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <section id="system-queue" className="space-y-6">
        <SectionHeading />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-40 w-full" /></CardContent></Card>
          ))}
        </div>
      </section>
    );
  }

  const { smsQueue, rvmQueue } = data;

  return (
    <section id="system-queue" className="space-y-6">
      <SectionHeading />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SMS Queue */}
        <QueueBlock
          title="SMS Queue"
          icon={MessageSquare}
          totalQueued={smsQueue.total_queued}
          iconClassName="bg-blue-100 text-blue-600"
        >
          {smsQueue.total_queued > 0 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <StatsCard
                  title="Sent"
                  value={fmt(smsQueue.action_breakdown?.sent ?? 0)}
                  subtitle="Already dispatched"
                  icon={CheckCircle2}
                  iconClassName="bg-green-100 text-green-600"
                />
                <StatsCard
                  title="In Queue"
                  value={fmt(smsQueue.action_breakdown?.queue ?? 0)}
                  subtitle="Still pending"
                  icon={Clock3}
                  iconClassName="bg-amber-100 text-amber-600"
                />
              </div>

              {Object.keys(smsQueue.action_breakdown ?? {}).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-semibold">Action Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center justify-center">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={Object.entries(smsQueue.action_breakdown ?? {}).map(([name, value]) => ({ name, value }))}
                          cx="50%" cy="50%" outerRadius={70} dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          labelLine={false}
                        >
                          <Cell fill="#6ec6a0" />
                          <Cell fill="#e0a875" />
                        </Pie>
                        <Tooltip contentStyle={TOOLTIP_STYLE} />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}

              {Object.keys(smsQueue.campaign_breakdown ?? {}).length > 0 && (
                <VerticalBarCard
                  title="Campaign Breakdown"
                  data={Object.entries(smsQueue.campaign_breakdown ?? {}).sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name, value }))}
                  colorOffset={0}
                />
              )}

              {Object.keys(smsQueue.carrier_breakdown ?? {}).length > 0 && (
                <VerticalBarCard
                  title="Carrier Breakdown"
                  data={Object.entries(smsQueue.carrier_breakdown ?? {})
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10)
                    .map(([name, value]) => ({ name: name.replace(/ OTHER$/, ""), value }))}
                  colorOffset={3}
                  yWidth={150}
                />
              )}

              {Object.keys(smsQueue.month_breakdown ?? {}).length > 0 && (
                <MonthBarCard
                  title="Monthly Volume"
                  data={Object.entries(smsQueue.month_breakdown ?? {})
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([month, value]) => ({ month, Queued: value }))}
                  fill="#64b5d0"
                />
              )}
            </div>
          )}
        </QueueBlock>

        {/* RVM Queue */}
        <QueueBlock
          title="RVM Queue"
          icon={PhoneCall}
          totalQueued={rvmQueue.total_queued}
          iconClassName="bg-violet-100 text-violet-600"
        >
          {rvmQueue.total_queued > 0 && (
            <div className="space-y-4">
              {Object.keys(rvmQueue.campaign_breakdown ?? {}).length > 0 && (
                <VerticalBarCard
                  title="Campaign Breakdown"
                  data={Object.entries(rvmQueue.campaign_breakdown ?? {}).sort(([, a], [, b]) => b - a).map(([name, value]) => ({ name, value }))}
                  colorOffset={2}
                />
              )}

              {Object.keys(rvmQueue.month_breakdown ?? {}).length > 0 && (
                <MonthBarCard
                  title="Monthly Volume"
                  data={Object.entries(rvmQueue.month_breakdown ?? {})
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([month, value]) => ({ month, Queued: value }))}
                  fill="#a78bca"
                />
              )}
            </div>
          )}
        </QueueBlock>
      </div>
    </section>
  );
}

function QueueBlock({
  title, icon: Icon, totalQueued, iconClassName, children,
}: {
  title: string;
  icon: React.ElementType;
  totalQueued: number;
  iconClassName: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-3 border-b border-[var(--border)]">
        <span className={`flex items-center justify-center w-7 h-7 rounded-md ${iconClassName}`}>
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h3 className="text-base font-semibold text-[var(--foreground)]">{title}</h3>
          <p className="text-xs text-[var(--muted-foreground)]">
            {totalQueued > 0 ? `${fmt(totalQueued)} pending` : "No queued items in the system"}
          </p>
        </div>
      </div>

      {totalQueued === 0 ? (
        <div
          className="flex items-center justify-center rounded-lg border border-dashed py-12 text-sm text-[var(--muted-foreground)]"
          style={{ borderColor: "var(--border)" }}
        >
          All clear — nothing queued
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function VerticalBarCard({
  title, data, colorOffset = 0, yWidth = 80,
}: {
  title: string;
  data: { name: string; value: number }[];
  colorOffset?: number;
  yWidth?: number;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={Math.max(160, data.length * 32)}>
          <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} width={yWidth} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="value" name="Count" radius={[0, 3, 3, 0]}>
              {data.map((_, i) => <Cell key={i} fill={CHART_COLORS[(i + colorOffset) % CHART_COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function MonthBarCard({
  title, data, fill,
}: {
  title: string;
  data: { month: string; Queued: number }[];
  fill: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} />
            <YAxis tick={{ fontSize: 10, fill: "var(--muted-foreground)" }} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="Queued" fill={fill} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

function SectionHeading() {
  return (
    <div className="border-b border-[var(--border)] pb-4">
      <h2 className="text-xl font-bold text-[var(--foreground)]">System Queue</h2>
      <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Pending SMS and RVM messages awaiting dispatch</p>
    </div>
  );
}

