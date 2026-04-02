"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CronBanner } from "@/components/dashboard/cron-banner";
import { OverviewSection } from "@/components/dashboard/sections/overview-section";
import { SMSSection } from "@/components/dashboard/sections/sms-section";
import { RVMSection } from "@/components/dashboard/sections/rvm-section";
import { ForthDealsSection } from "@/components/dashboard/sections/forth-deals-section";
import { SystemQueueSection } from "@/components/dashboard/sections/system-queue-section";
import { useDashboard } from "@/hooks/use-dashboard";

export default function DashboardPage() {
  const { data, error, isLoading, isRefreshing, lastUpdated, refresh } = useDashboard();

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

          <div className="p-4 lg:p-6 space-y-20">
            {data ? (
              <>
                <OverviewSection data={data} isLoading={false} />
                <ForthDealsSection data={data} isLoading={false} />
                <SMSSection data={data} isLoading={false} />
                <RVMSection data={data} isLoading={false} />
                <SystemQueueSection data={data} isLoading={false} />
              </>
            ) : (
              <>
                <OverviewSection data={null as never} isLoading={true} />
                <ForthDealsSection data={null as never} isLoading={true} />
                <SMSSection data={null as never} isLoading={true} />
                <RVMSection data={null as never} isLoading={true} />
                <SystemQueueSection data={null as never} isLoading={true} />
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
