"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StatsCard, StatsCardSkeleton } from "@/components/dashboard/stats-card";
import { OverviewCharts, OverviewChartsSkeleton } from "@/components/dashboard/overview-charts";
import { CarrierChart, CarrierChartSkeleton } from "@/components/dashboard/carrier-chart";
import { useDashboard } from "@/hooks/use-dashboard";
import {
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  PhoneCall,
  PhoneIncoming,
  BarChart2,
  AlertCircle,
} from "lucide-react";
import { formatNumber, formatPercentage } from "@/lib/utils";

export default function OverviewPage() {
  const { data, error, isLoading, isRefreshing, lastUpdated, refresh } = useDashboard();

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Sidebar - hidden on mobile */}
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        <Header
          lastUpdated={lastUpdated}
          onRefresh={refresh}
          isRefreshing={isRefreshing}
        />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* Error state */}
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
                <p className="font-medium">Failed to load data</p>
                <p className="text-sm" style={{ opacity: 0.8 }}>{error}</p>
              </div>
            </div>
          )}

          {/* SMS Outbound Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">SMS Outbound</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
              {isLoading ? (
                Array.from({ length: 4 }, (_, i) => <StatsCardSkeleton key={i} />)
              ) : data ? (
                <>
                  <StatsCard
                    title="Total Messages"
                    value={formatNumber(data.sms_outbound.total)}
                    subtitle={`${data.sms_outbound.total.toLocaleString()} total sent`}
                    icon={MessageSquare}
                    iconClassName="bg-blue-100 text-blue-600 dark:text-blue-600"
                  />
                  <StatsCard
                    title="Delivered"
                    value={formatNumber(data.sms_outbound.delivered)}
                    subtitle={formatPercentage(data.sms_outbound.delivered, data.sms_outbound.total) + " delivery rate"}
                    icon={CheckCircle}
                    iconClassName="bg-green-100 text-green-600 dark:text-green-600"
                    trend={{
                      value: `+${formatPercentage(data.sms_outbound.delivered, data.sms_outbound.total)} success rate`,
                      positive: true,
                    }}
                  />
                  <StatsCard
                    title="Carrier Rejected"
                    value={formatNumber(data.sms_outbound.carrier_rejected)}
                    subtitle={formatPercentage(data.sms_outbound.carrier_rejected, data.sms_outbound.total) + " rejection rate"}
                    icon={XCircle}
                    iconClassName="bg-red-100 text-red-600 dark:text-red-600"
                  />
                  <StatsCard
                    title="Delivery Rate"
                    value={formatPercentage(data.sms_outbound.delivered, data.sms_outbound.total)}
                    subtitle="Overall SMS delivery rate"
                    icon={TrendingUp}
                    iconClassName="bg-[var(--accent)] text-[var(--accent-foreground)]"
                    trend={{
                      value: `${formatNumber(data.sms_outbound.delivered)} of ${formatNumber(data.sms_outbound.total)} delivered`,
                      positive: true,
                    }}
                  />
                </>
              ) : null}
            </div>
          </section>

          {/* RVM Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <PhoneCall className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">RVM (Ringless Voicemail)</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4">
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => <StatsCardSkeleton key={i} />)
              ) : data ? (
                <>
                  <StatsCard
                    title="Total RVM"
                    value={formatNumber(data.rvm.total)}
                    subtitle="Total voicemail attempts"
                    icon={PhoneCall}
                    iconClassName="bg-purple-100 text-purple-600 dark:text-purple-600"
                  />
                  <StatsCard
                    title="Completed"
                    value={formatNumber(data.rvm.completed)}
                    subtitle={formatPercentage(data.rvm.completed, data.rvm.total) + " of total"}
                    icon={CheckCircle}
                    iconClassName="bg-green-100 text-green-600 dark:text-green-600"
                  />
                  <StatsCard
                    title="Failed"
                    value={formatNumber(data.rvm.failed)}
                    subtitle={formatPercentage(data.rvm.failed, data.rvm.total) + " failure rate"}
                    icon={XCircle}
                    iconClassName="bg-red-100 text-red-600 dark:text-red-600"
                  />
                  <StatsCard
                    title="Queued"
                    value={formatNumber(data.rvm.queued)}
                    subtitle="Pending delivery"
                    icon={Clock}
                    iconClassName="bg-yellow-100 text-yellow-600 dark:text-yellow-600"
                  />
                  <StatsCard
                    title="Success Rate"
                    value={formatPercentage(data.rvm.completed, data.rvm.total)}
                    subtitle="RVM completion rate"
                    icon={TrendingUp}
                    iconClassName="bg-[var(--accent)] text-[var(--accent-foreground)]"
                    trend={{
                      value: `${formatNumber(data.rvm.completed)} completed`,
                      positive: true,
                    }}
                  />
                </>
              ) : null}
            </div>
          </section>

          {/* SMS Inbound Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <PhoneIncoming className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">SMS Inbound</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {isLoading ? (
                Array.from({ length: 6 }, (_, i) => <StatsCardSkeleton key={i} />)
              ) : data ? (
                <>
                  <StatsCard
                    title="Total Inbound"
                    value={formatNumber(data.sms_inbound.total)}
                    subtitle="Total replies received"
                    icon={PhoneIncoming}
                    iconClassName="bg-indigo-100 text-indigo-600 dark:text-indigo-600"
                  />
                  <StatsCard
                    title="DNC Requests"
                    value={formatNumber(data.sms_inbound.sentiment.dnc)}
                    subtitle={formatPercentage(data.sms_inbound.sentiment.dnc, data.sms_inbound.total) + " of inbound"}
                    icon={XCircle}
                    iconClassName="bg-red-100 text-red-600 dark:text-red-600"
                  />
                  <StatsCard
                    title="Positive Responses"
                    value={formatNumber(data.sms_inbound.sentiment.positive)}
                    subtitle={formatPercentage(data.sms_inbound.sentiment.positive, data.sms_inbound.total) + " of inbound"}
                    icon={CheckCircle}
                    iconClassName="bg-green-100 text-green-600 dark:text-green-600"
                    trend={{
                      value: `${formatNumber(data.sms_inbound.sentiment.positive)} positive replies`,
                      positive: true,
                    }}
                  />
                  <StatsCard
                    title="Neutral"
                    value={formatNumber(data.sms_inbound.sentiment.neutral)}
                    subtitle={formatPercentage(data.sms_inbound.sentiment.neutral, data.sms_inbound.total) + " of inbound"}
                    icon={BarChart2}
                    iconClassName="bg-[var(--accent)] text-[var(--accent-foreground)]"
                  />
                  <StatsCard
                    title="Negative"
                    value={formatNumber(data.sms_inbound.sentiment.negative)}
                    subtitle={formatPercentage(data.sms_inbound.sentiment.negative, data.sms_inbound.total) + " of inbound"}
                    icon={AlertCircle}
                    iconClassName="bg-orange-100 text-orange-600 dark:text-orange-600"
                  />
                  <StatsCard
                    title="Invalid"
                    value={formatNumber(data.sms_inbound.sentiment.invalid)}
                    subtitle="Could not classify"
                    icon={AlertCircle}
                    iconClassName="bg-gray-100 text-gray-600 dark:text-gray-600"
                  />
                </>
              ) : null}
            </div>
          </section>

          {/* Charts Section */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <BarChart2 className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">Analytics Charts</h2>
            </div>
            {isLoading ? (
              <OverviewChartsSkeleton />
            ) : data ? (
              <OverviewCharts data={data} />
            ) : null}
          </section>
        </main>
      </div>
    </div>
  );
}
