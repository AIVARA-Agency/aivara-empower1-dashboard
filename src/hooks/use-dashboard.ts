"use client";

import { useState, useEffect, useCallback } from "react";
import type { DashboardData, RawDatatableItem, RawSettings } from "@/types";

const DASHBOARD_API = "/api/dashboard";
const SMS_TOGGLE_API = "https://n8n.srv1312686.hstgr.cloud/webhook/sms_toggle";
const REFRESH_INTERVAL = 600_000; // 10 minutes

const EMPTY_SETTINGS: DashboardData["settings"] = {
  id: 0, settings: { sms_queue_toggle: "false" },
};
const EMPTY_SMS_QUEUE: DashboardData["smsQueue"] = {
  id: 0, datatable: "sms_queue", total_queued: 0,
  campaign_breakdown: {}, carrier_breakdown: {}, action_breakdown: {}, month_breakdown: {},
  createdAt: "",
};
const EMPTY_SMS_RAWLOGS: DashboardData["smsRawlogs"] = {
  id: 0, datatable: "sms_rawlogs",
  total_sent: 0, total_delivered: 0, total_carrier_rejected: 0,
  total_failed: 0, total_message_sent: 0, total_cost: 0, overall_delivery_rate: 0,
  carrier_breakdown: {}, month_breakdown: {}, week_breakdown: {}, createdAt: "",
};
const EMPTY_SMS_INBOUND: DashboardData["smsInbound"] = {
  id: 0, datatable: "sms_inbound_rawlogs",
  total_received: 0, status_reason_counts: [],
  month_breakdown: [], week_breakdown: [], createdAt: "",
};
const EMPTY_FORTH_DEALS: DashboardData["forthDeals"] = {
  id: 0, datatable: "forth_deals",
  summary: { total_deals: 0, total_debt: 0, total_current_payments: 0, total_revenue: 0 },
  month_breakdown: [], week_breakdown: [],
  source_lead_breakdown: [], deal_type_breakdown: [], createdAt: "",
};
const EMPTY_RING_CENTRAL: DashboardData["ringCentral"] = {
  id: 0, datatable: "ring_central",
  summary: { total_calls: 0, answered_calls: 0, missed_calls: 0, total_duration: 0, total_duration_mins: 0, answer_rate: 0, avg_duration: 0 },
  leadsource_breakdown: [], month_breakdown: [], week_breakdown: [], createdAt: "",
};

interface UseDashboardReturn {
  data: DashboardData | null;
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  refresh: () => void;
  toggleSmsQueue: () => Promise<void>;
  isTogglingQueue: boolean;
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isTogglingQueue, setIsTogglingQueue] = useState(false);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    setError(null);

    try {
      const res = await fetch(DASHBOARD_API, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const raw: (RawDatatableItem | RawSettings)[] = await res.json();

      const find = <T extends RawDatatableItem>(key: T["datatable"]): T =>
        (raw.find((item) => "datatable" in item && item.datatable === key) as T);

      const settingsItem = raw.find((item) => "settings" in item) as RawSettings | undefined;

      const normalized: DashboardData = {
        settings:    settingsItem              ?? EMPTY_SETTINGS,
        smsQueue:    find("sms_queue")         ?? EMPTY_SMS_QUEUE,
        smsRawlogs:  find("sms_rawlogs")       ?? EMPTY_SMS_RAWLOGS,
        smsInbound:  find("sms_inbound_rawlogs") ?? EMPTY_SMS_INBOUND,
        forthDeals:  find("forth_deals")       ?? EMPTY_FORTH_DEALS,
        ringCentral: find("ring_central")      ?? EMPTY_RING_CENTRAL,
      };

      setData(normalized);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const toggleSmsQueue = useCallback(async () => {
    if (!data || isTogglingQueue) return;
    const current = data.settings.settings.sms_queue_toggle === "true";
    const next = current ? "false" : "true";

    setIsTogglingQueue(true);
    // Optimistic update
    setData((prev) =>
      prev ? { ...prev, settings: { ...prev.settings, settings: { sms_queue_toggle: next } } } : prev
    );

    try {
      await fetch(SMS_TOGGLE_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sms_queue_toggle: next }),
      });
    } catch {
      // Revert on failure
      setData((prev) =>
        prev ? { ...prev, settings: { ...prev.settings, settings: { sms_queue_toggle: current ? "true" : "false" } } } : prev
      );
    } finally {
      setIsTogglingQueue(false);
    }
  }, [data, isTogglingQueue]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => fetchData(false), REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchData]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return { data, error, isLoading, isRefreshing, lastUpdated, refresh, toggleSmsQueue, isTogglingQueue };
}
