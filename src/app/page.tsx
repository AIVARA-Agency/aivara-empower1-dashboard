"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CronBanner } from "@/components/dashboard/cron-banner";
import { RoiOverviewSection } from "@/components/dashboard/sections/roi-overview-section";
import { CampaignControlSection } from "@/components/dashboard/sections/campaign-control-section";
import { CampaignPerformanceSection } from "@/components/dashboard/sections/campaign-performance-section";
import { ForthDealsSection } from "@/components/dashboard/sections/forth-deals-section";
import { RepPerformanceSection } from "@/components/dashboard/sections/rep-performance-section";
import { RingCentralSection } from "@/components/dashboard/sections/ring-central-section";
import { SmsInboundSection } from "@/components/dashboard/sections/sms-inbound-section";
import { SmsPerformanceSection } from "@/components/dashboard/sections/sms-performance-section";
import { useDashboard } from "@/hooks/use-dashboard";

export default function DashboardPage() {
  const { data, error, isLoading, isRefreshing, lastUpdated, refresh, toggleSmsQueue, isTogglingQueue } = useDashboard();

  return (
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Sticky sidebar */}
      <div className="hidden lg:flex lg:shrink-0 sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header lastUpdated={lastUpdated} onRefresh={refresh} isRefreshing={isRefreshing} />

        <main className="flex-1 overflow-y-auto">
          <CronBanner />

          {error && (
            <div
              className="mx-4 lg:mx-6 mt-4 flex items-center gap-3 rounded-lg border px-4 py-3 text-sm"
              style={{
                backgroundColor: "color-mix(in srgb, var(--destructive) 10%, transparent)",
                borderColor: "color-mix(in srgb, var(--destructive) 30%, transparent)",
                color: "var(--destructive)",
              }}
            >
              <span className="font-medium">Error loading data:</span> {error}
            </div>
          )}

          <div className="p-4 lg:p-6 space-y-16">
            {data ? (
              <>
                <RepPerformanceSection data={data} isLoading={false} />
                <RoiOverviewSection data={data} isLoading={false} />
                <CampaignControlSection data={data} isLoading={false} onToggle={toggleSmsQueue} isToggling={isTogglingQueue} />
                <CampaignPerformanceSection isLoading={false} />
                <ForthDealsSection data={data} isLoading={false} />
                <RingCentralSection data={data} isLoading={false} />
                <SmsInboundSection data={data} isLoading={false} />
                <SmsPerformanceSection data={data} isLoading={false} />
              </>
            ) : (
              <>
                <RepPerformanceSection data={null as never} isLoading={true} />
                <RoiOverviewSection data={null as never} isLoading={true} />
                <CampaignControlSection data={null as never} isLoading={true} onToggle={toggleSmsQueue} isToggling={false} />
                <CampaignPerformanceSection isLoading={true} />
                <ForthDealsSection data={null as never} isLoading={true} />
                <RingCentralSection data={null as never} isLoading={true} />
                <SmsInboundSection data={null as never} isLoading={true} />
                <SmsPerformanceSection data={null as never} isLoading={true} />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
