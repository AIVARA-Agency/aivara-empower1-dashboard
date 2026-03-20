"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StatsCard, StatsCardSkeleton } from "@/components/dashboard/stats-card";
import { SMSTable, SMSTableSkeleton } from "@/components/dashboard/sms-table";
import { CarrierChart, CarrierChartSkeleton } from "@/components/dashboard/carrier-chart";
import { useSMSLogs } from "@/hooks/use-sms-logs";
import {
  MessageSquare,
  DollarSign,
  Clock,
  TrendingUp,
  BarChart2,
  AlertCircle,
} from "lucide-react";
import { formatNumber, formatCurrency, formatDuration } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const COLORS = [
  "#64b5d0",
  "#4e8fa0",
  "#7dcad8",
  "#72c0d0",
  "#93d4df",
  "#e0a875",
  "#d97d5a",
];

export default function SMSPage() {
  const [page, setPage] = useState(1);
  const { data, error, isLoading } = useSMSLogs(page);

  const summary = data?.sms_rawlogs?.summary;
  const records = data?.sms_rawlogs?.records ?? [];
  const pagination = data?.pagination;

  const campaignData = summary
    ? Object.entries(summary.campaign_breakdown)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
    : [];

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">SMS Logs</h2>
            <p className="text-[var(--muted-foreground)] mt-1">
              Detailed SMS delivery records and analytics
            </p>
          </div>

          {error && (
            <div
              className="flex items-center gap-3 p-4 rounded-lg border"
              style={{
                backgroundColor: "color-mix(in srgb, var(--destructive) 12%, transparent)",
                borderColor: "color-mix(in srgb, var(--destructive) 30%, transparent)",
                color: "var(--destructive)",
              }}
            >
              <AlertCircle className="h-5 w-5 shrink-0" />
              <div>
                <p className="font-medium">Failed to load SMS logs</p>
                <p className="text-sm" style={{ opacity: 0.8 }}>{error}</p>
              </div>
            </div>
          )}

          {/* Summary KPI Cards */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="text-base font-semibold">Summary</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {isLoading ? (
                Array.from({ length: 4 }, (_, i) => <StatsCardSkeleton key={i} />)
              ) : !data && !error ? (
                Array.from({ length: 4 }, (_, i) => <StatsCardSkeleton key={i} />)
              ) : summary ? (
                <>
                  <StatsCard
                    title="Total SMS"
                    value={formatNumber(summary.total_sms)}
                    subtitle={`${summary.total_sms.toLocaleString()} messages`}
                    icon={MessageSquare}
                    iconClassName="bg-blue-100 text-blue-600 dark:text-blue-600"
                  />
                  <StatsCard
                    title="Total Cost"
                    value={formatCurrency(summary.total_cost)}
                    subtitle={`Avg ${formatCurrency(summary.total_cost / Math.max(1, summary.total_sms))} per SMS`}
                    icon={DollarSign}
                    iconClassName="bg-green-100 text-green-600 dark:text-green-600"
                  />
                  <StatsCard
                    title="Avg Ingest Time"
                    value={formatDuration(summary.average_ingest_time_ms)}
                    subtitle="Average processing time"
                    icon={Clock}
                    iconClassName="bg-yellow-100 text-yellow-600 dark:text-yellow-600"
                  />
                  <StatsCard
                    title="Campaigns"
                    value={Object.keys(summary.campaign_breakdown).length}
                    subtitle={`${Object.keys(summary.carrier_breakdown).length} carriers tracked`}
                    icon={TrendingUp}
                    iconClassName="bg-[var(--accent)] text-[var(--accent-foreground)]"
                  />
                </>
              ) : null}
            </div>
          </section>

          {/* Charts Row */}
          <section>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {isLoading ? (
                <>
                  <CarrierChartSkeleton />
                  <CarrierChartSkeleton />
                </>
              ) : summary ? (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base">Campaign Breakdown</CardTitle>
                      <CardDescription>SMS volume by campaign</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={260}>
                        <BarChart
                          data={campaignData}
                          margin={{ top: 0, right: 10, left: -10, bottom: 20 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                          <XAxis
                            dataKey="name"
                            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                            axisLine={{ stroke: "var(--border)" }}
                            tickLine={false}
                            angle={-20}
                            textAnchor="end"
                            height={50}
                          />
                          <YAxis
                            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                            tickFormatter={(v: number) =>
                              v >= 1000 ? `${(v / 1000).toFixed(0)}K` : String(v)
                            }
                          />
                          <Tooltip
                            formatter={(value: number) => [value.toLocaleString(), "SMS Count"]}
                            contentStyle={{
                              backgroundColor: "var(--popover)",
                              borderColor: "var(--border)",
                              borderRadius: "0.5rem",
                              color: "var(--popover-foreground)",
                            }}
                          />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {campaignData.map((entry, index) => (
                              <Cell
                                key={`campaign-${entry.name}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <CarrierChart
                    data={summary.carrier_breakdown}
                    title="Carrier Breakdown"
                    description="SMS volume by carrier network"
                  />
                </>
              ) : null}
            </div>
          </section>

          {/* SMS Records Table */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-[var(--primary)]" />
              <h3 className="text-base font-semibold">SMS Records</h3>
            </div>

            {isLoading || (!data && !error) ? (
              <SMSTableSkeleton />
            ) : pagination ? (
              <SMSTable
                records={records}
                pagination={pagination}
                onPageChange={setPage}
              />
            ) : null}
          </section>
        </main>
      </div>
    </div>
  );
}
