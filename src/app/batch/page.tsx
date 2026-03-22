"use client";

import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useBatch } from "@/hooks/use-batch";
import {
  AlertCircle,
  MessageSquare,
  PhoneCall,
  Hash,
  TrendingUp,
  DollarSign,
  Users,
  ChevronDown,
} from "lucide-react";

function fmt(n: number) { return n.toLocaleString(); }
function fmtCost(n: number) { return `$${n.toFixed(4)}`; }
function fmtCostFull(n: number) { return `$${n.toFixed(2)}`; }
function fmtPct(n: number) { return `${n.toFixed(2)}%`; }

function cleanLabel(key: string) {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function BatchPage() {
  const { data, error, isLoading, isRefreshing, lastUpdated, refresh, leadSource, setLeadSource } = useBatch();

  const availableSources = data?.meta?.lead_sources_available ?? [];

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      <div className="hidden lg:flex lg:shrink-0">
        <Sidebar />
      </div>

      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Top bar — mobile nav + refresh + theme toggle */}
        <Header lastUpdated={lastUpdated} onRefresh={refresh} isRefreshing={isRefreshing} />

        {/* Page sub-header — title + lead source filter */}
        <div className="flex items-center justify-between px-4 lg:px-6 py-4 border-b border-[var(--border)] shrink-0">
          <div>
            <h1 className="text-xl font-semibold">Batch Status</h1>
            <p className="text-sm text-[var(--muted-foreground)]">Campaign performance analysis by lead source</p>
          </div>

          {/* Lead Source Dropdown */}
          <div className="relative">
            <select
              value={leadSource}
              onChange={(e) => setLeadSource(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 rounded-md border border-[var(--border)] bg-[var(--background)] text-sm font-medium text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] cursor-pointer"
            >
              <option value="all">All Lead Sources</option>
              {availableSources.map((src) => (
                <option key={src} value={src}>{src}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 space-y-6">
          {/* Error */}
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

          {/* ── RECORD COUNTS ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Hash className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">Record Counts</h2>
              {!isLoading && data && (
                <Badge variant="secondary" className="ml-1">
                  {data.meta.lead_source_filter === "all" ? "All Sources" : data.meta.lead_source_filter}
                </Badge>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
              {isLoading ? (
                Array.from({ length: 5 }, (_, i) => (
                  <Card key={i}><CardContent className="pt-6"><Skeleton className="h-8 w-20 mb-2" /><Skeleton className="h-3 w-24" /></CardContent></Card>
                ))
              ) : data ? (
                [
                  { label: "SMS Raw Logs",   value: data.meta.record_counts.sms_rawlogs,  icon: MessageSquare, color: "bg-blue-100 text-blue-600" },
                  { label: "SMS Inbound",    value: data.meta.record_counts.sms_inbound,  icon: TrendingUp,    color: "bg-green-100 text-green-600" },
                  { label: "RVM Raw Logs",   value: data.meta.record_counts.rvm_rawlogs,  icon: PhoneCall,     color: "bg-purple-100 text-purple-600" },
                  { label: "Filtered SMS",   value: data.meta.record_counts.filtered_sms, icon: MessageSquare, color: "bg-sky-100 text-sky-600" },
                  { label: "Filtered RVM",   value: data.meta.record_counts.filtered_rvm, icon: PhoneCall,     color: "bg-indigo-100 text-indigo-600" },
                ].map(({ label, value, icon: Icon, color }) => (
                  <Card key={label}>
                    <CardContent className="pt-5 pb-4">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm text-[var(--muted-foreground)]">{label}</p>
                        <div className={`flex items-center justify-center w-8 h-8 rounded-lg shrink-0 ${color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <p className="text-2xl font-bold tabular-nums">{fmt(value ?? 0)}</p>
                    </CardContent>
                  </Card>
                ))
              ) : null}
            </div>
          </section>

          {/* ── SMS CAMPAIGN PERFORMANCE ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">SMS Campaign Performance</h2>
            </div>
            {isLoading ? (
              <Card><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
            ) : data ? (
              <div className="space-y-4">
                {Object.entries(data.sms_campaign_performance)
                  .sort(([, a], [, b]) => b.total_sent - a.total_sent)
                  .map(([campaign, stat]) => (
                    <Card key={campaign}>
                      <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono font-semibold">{campaign}</Badge>
                            <span className="text-sm text-[var(--muted-foreground)]">{fmt(stat.total_sent)} sent</span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                              <span className="font-medium">{fmtCostFull(stat.total_cost)}</span>
                              <span className="text-[var(--muted-foreground)]">total cost</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                              <span className="font-medium">{fmt(stat.inbound_replies)}</span>
                              <span className="text-[var(--muted-foreground)]">replies</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-semibold" style={{ color: stat.reply_rate_pct >= 5 ? "var(--chart-2)" : "var(--muted-foreground)" }}>
                                {fmtPct(stat.reply_rate_pct)}
                              </span>
                              <span className="text-[var(--muted-foreground)]">reply rate</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-medium">{fmtCost(stat.cost_per_reply)}</span>
                              <span className="text-[var(--muted-foreground)]">/ reply</span>
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      {Object.keys(stat.carrier_breakdown).length > 0 && (
                        <CardContent className="pt-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-2">Carrier Breakdown</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                            {Object.entries(stat.carrier_breakdown)
                              .sort(([, a], [, b]) => b - a)
                              .map(([carrier, count]) => (
                                <div
                                  key={carrier}
                                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-sm"
                                  style={{ backgroundColor: "color-mix(in srgb, var(--muted) 60%, transparent)" }}
                                >
                                  <span className="truncate text-xs text-[var(--foreground)]">{carrier}</span>
                                  <span className="font-semibold shrink-0 tabular-nums text-xs">{fmt(count)}</span>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
              </div>
            ) : null}
          </section>

          {/* ── RVM CAMPAIGN PERFORMANCE ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <PhoneCall className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">RVM Campaign Performance</h2>
            </div>
            {isLoading ? (
              <Card><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
            ) : data ? (
              <div className="space-y-4">
                {Object.entries(data.rvm_campaign_performance)
                  .sort(([, a], [, b]) => b.total_sent - a.total_sent)
                  .map(([campaign, stat]) => (
                    <Card key={campaign}>
                      <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="font-mono font-semibold">{campaign}</Badge>
                            <span className="text-sm text-[var(--muted-foreground)]">{fmt(stat.total_sent)} sent</span>
                          </div>
                          <div className="flex flex-wrap gap-4 text-sm">
                            <span className="flex items-center gap-1.5">
                              <span className="inline-block w-2 h-2 rounded-full bg-green-500 shrink-0" />
                              <span className="font-medium text-green-600 dark:text-green-400">{fmt(stat.success)}</span>
                              <span className="text-[var(--muted-foreground)]">success</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="inline-block w-2 h-2 rounded-full bg-red-500 shrink-0" />
                              <span className="font-medium text-red-600 dark:text-red-400">{fmt(stat.failure)}</span>
                              <span className="text-[var(--muted-foreground)]">failed</span>
                            </span>
                            <span className="flex items-center gap-1.5">
                              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500 shrink-0" />
                              <span className="font-medium">{fmt(stat.queued)}</span>
                              <span className="text-[var(--muted-foreground)]">queued</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="h-3.5 w-3.5 text-[var(--muted-foreground)]" />
                              <span className="font-medium">{fmtCostFull(stat.total_cost)}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <span className="font-semibold" style={{ color: stat.success_rate_pct >= 5 ? "var(--chart-2)" : "var(--muted-foreground)" }}>
                                {fmtPct(stat.success_rate_pct)}
                              </span>
                              <span className="text-[var(--muted-foreground)]">success rate</span>
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      {Object.keys(stat.failure_reasons).length > 0 && (
                        <CardContent className="pt-0">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted-foreground)] mb-2">Failure Reasons</p>
                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                            {Object.entries(stat.failure_reasons)
                              .sort(([, a], [, b]) => b - a)
                              .map(([reason, count]) => (
                                <div
                                  key={reason}
                                  className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-md text-sm"
                                  style={{ backgroundColor: "color-mix(in srgb, var(--muted) 60%, transparent)" }}
                                >
                                  <span className="truncate text-xs text-[var(--foreground)]">{cleanLabel(reason)}</span>
                                  <span className="font-semibold shrink-0 tabular-nums text-xs">{fmt(count)}</span>
                                </div>
                              ))}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
              </div>
            ) : null}
          </section>

          {/* ── SMS SENDER NUMBERS ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Users className="h-5 w-5 text-[var(--primary)]" />
              <h2 className="text-lg font-semibold">SMS Sender Numbers</h2>
              <span className="text-xs text-[var(--muted-foreground)] ml-1">— via Commio</span>
            </div>
            {isLoading ? (
              <Card><CardContent className="pt-6"><Skeleton className="h-48 w-full" /></CardContent></Card>
            ) : data && data.sms_sender_numbers.length > 0 ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Sender Number Performance</CardTitle>
                  <CardDescription>Status breakdown per outbound number</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--border)]" style={{ backgroundColor: "color-mix(in srgb, var(--muted) 50%, transparent)" }}>
                          <th className="text-left px-4 py-3 font-semibold">From Number</th>
                          <th className="text-right px-4 py-3 font-semibold">Total Sent</th>
                          <th className="text-right px-4 py-3 font-semibold text-green-600 dark:text-green-400">Delivered</th>
                          <th className="text-right px-4 py-3 font-semibold text-red-600 dark:text-red-400">Rejected</th>
                          <th className="text-right px-4 py-3 font-semibold text-sky-600 dark:text-sky-400">Msg Sent</th>
                          <th className="text-right px-4 py-3 font-semibold text-orange-600 dark:text-orange-400">Failed</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.sms_sender_numbers
                          .sort((a, b) => b.total_sent - a.total_sent)
                          .map((num, idx) => {
                            const s = num.status_breakdown;
                            const delivered       = s["delivered"]        ?? 0;
                            const rejected        = s["carrier_rejected"] ?? 0;
                            const messageSent     = s["me_age _ent"]      ?? s["message_sent"] ?? 0;
                            const failed          = s["failed"]           ?? 0;
                            return (
                              <tr
                                key={num.from}
                                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--accent)]/30 transition-colors"
                              >
                                <td className="px-4 py-3 font-mono font-medium">{num.from}</td>
                                <td className="px-4 py-3 text-right tabular-nums font-semibold">{fmt(num.total_sent)}</td>
                                <td className="px-4 py-3 text-right tabular-nums text-green-600 dark:text-green-400">{fmt(delivered)}</td>
                                <td className="px-4 py-3 text-right tabular-nums text-red-600 dark:text-red-400">{fmt(rejected)}</td>
                                <td className="px-4 py-3 text-right tabular-nums text-sky-600 dark:text-sky-400">{fmt(messageSent)}</td>
                                <td className="px-4 py-3 text-right tabular-nums text-orange-600 dark:text-orange-400">{failed > 0 ? fmt(failed) : <span className="text-[var(--muted-foreground)]">—</span>}</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            ) : !isLoading ? (
              <Card><CardContent className="py-12 text-center text-[var(--muted-foreground)]">No sender number data available.</CardContent></Card>
            ) : null}
          </section>

        </main>
      </div>
    </div>
  );
}
