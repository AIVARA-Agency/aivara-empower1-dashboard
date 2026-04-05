"use client";

import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/dashboard/stats-card";
import type { DashboardData } from "@/types";

interface Props { data: DashboardData; isLoading: boolean; }

export function SystemQueueSection({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <section id="system-queue" className="space-y-6">
        <SectionHeading />
        <Card><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
      </section>
    );
  }

  const { smsQueue } = data;

  return (
    <section id="system-queue" className="space-y-6">
      <SectionHeading />

      {smsQueue.total_queued === 0 ? (
        <div
          className="flex items-center justify-center rounded-lg border border-dashed py-16 text-sm text-[var(--muted-foreground)]"
          style={{ borderColor: "var(--border)" }}
        >
          All clear — no messages queued
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatsCard
            title="SMS Queued"
            value={String(smsQueue.total_queued.toLocaleString())}
            subtitle="Pending SMS messages"
            icon={MessageSquare}
            iconClassName="bg-blue-100 text-blue-600"
          />
        </div>
      )}
    </section>
  );
}

function SectionHeading() {
  return (
    <div className="border-b border-[var(--border)] pb-4">
      <h2 className="text-xl font-bold text-[var(--foreground)]">System Queue</h2>
      <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Pending SMS messages awaiting dispatch</p>
    </div>
  );
}
