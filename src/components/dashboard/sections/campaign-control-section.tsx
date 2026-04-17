"use client";

import { Power, Loader2, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DashboardData } from "@/types";

interface Props {
  data: DashboardData;
  isLoading: boolean;
  onToggle: () => Promise<void>;
  isToggling: boolean;
}

export function CampaignControlSection({ data, isLoading, onToggle, isToggling }: Props) {
  if (isLoading) {
    return (
      <section id="campaign-control" className="space-y-4">
        <div className="border-b border-[var(--border)] pb-4">
          <h2 className="text-xl font-bold text-[var(--foreground)]">Campaign Control</h2>
        </div>
        <Card><CardContent className="pt-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
      </section>
    );
  }

  const { smsQueue, settings } = data;
  const isOn = settings.settings.sms_queue_toggle === "true";
  const hasQueued = smsQueue.total_queued > 0;

  return (
    <section id="campaign-control" className="space-y-5">
      <div className="border-b border-[var(--border)] pb-4">
        <h2 className="text-xl font-bold text-[var(--foreground)]">Campaign Control</h2>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">Start or stop outbound SMS campaigns</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Main toggle - BIG and obvious */}
        <Card className={`lg:col-span-2 overflow-hidden transition-colors duration-300 ${isOn ? "border-green-500 border-2" : "border-2 border-[var(--border)]"}`}>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-6">
              {/* Big toggle button */}
              <button
                onClick={onToggle}
                disabled={isToggling}
                className={`relative flex items-center justify-center w-24 h-24 rounded-2xl transition-all duration-300 shrink-0 ${
                  isToggling
                    ? "bg-yellow-100 text-yellow-600 cursor-wait"
                    : isOn
                    ? "bg-green-100 text-green-600 hover:bg-green-200 cursor-pointer shadow-lg shadow-green-200/50"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200 cursor-pointer"
                } disabled:cursor-wait`}
                aria-label={isOn ? "Turn campaigns off" : "Turn campaigns on"}
              >
                {isToggling ? (
                  <Loader2 className="h-10 w-10 animate-spin" />
                ) : (
                  <Power className="h-10 w-10" />
                )}
              </button>

              {/* Status text */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className={`inline-block w-3 h-3 rounded-full ${
                    isToggling ? "bg-yellow-500 animate-pulse" : isOn ? "bg-green-500" : "bg-gray-400"
                  }`} />
                  <span className={`text-2xl font-bold ${
                    isToggling ? "text-yellow-600" : isOn ? "text-green-600" : "text-[var(--muted-foreground)]"
                  }`}>
                    {isToggling ? "Updating..." : isOn ? "CAMPAIGNS ACTIVE" : "CAMPAIGNS PAUSED"}
                  </span>
                </div>
                <p className="text-sm text-[var(--muted-foreground)]">
                  {isOn
                    ? "SMS queue is processing. Outbound messages are being sent."
                    : "SMS queue is paused. No outbound messages are being sent."
                  }
                </p>
                <p className="text-xs text-[var(--muted-foreground)] mt-2">
                  Click the power button to {isOn ? "pause" : "start"} campaigns
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Queue status */}
        <Card>
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-sky-100 text-sky-600">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">Queue Status</p>
                <p className="text-2xl font-bold text-[var(--foreground)]">{smsQueue.total_queued.toLocaleString()}</p>
              </div>
            </div>
            <p className="text-sm text-[var(--muted-foreground)]">
              {hasQueued
                ? `${smsQueue.total_queued.toLocaleString()} messages waiting to send`
                : "All clear \u2014 no messages in queue"
              }
            </p>

            {/* Campaign breakdown mini-list */}
            {hasQueued && Object.keys(smsQueue.campaign_breakdown).length > 0 && (
              <div className="mt-4 pt-3 border-t border-[var(--border)] space-y-1.5">
                <p className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">By Campaign</p>
                {Object.entries(smsQueue.campaign_breakdown)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([name, count]) => (
                    <div key={name} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--foreground)] truncate max-w-[70%]">{name}</span>
                      <span className="tabular-nums text-[var(--muted-foreground)]">{count.toLocaleString()}</span>
                    </div>
                  ))
                }
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
