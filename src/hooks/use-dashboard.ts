"use client";

import { useState, useEffect, useCallback } from "react";
import type { DashboardData, RawDatatableItem } from "@/types";

const DASHBOARD_API = "/api/dashboard";
const REFRESH_INTERVAL = 600_000; // 10 minutes

const EMPTY_SMS_QUEUE: DashboardData["smsQueue"] = {
  id: 0, datatable: "sms_queue", total_queued: 0, createdAt: "",
};
const EMPTY_SMS_RAWLOGS: DashboardData["smsRawlogs"] = {
  id: 0, datatable: "sms_rawlogs",
  total_sent: 0, total_delivered: 0, total_carrier_rejected: 0,
  total_failed: 0, total_message_sent: 0, total_cost: 0, overall_delivery_rate: 0,
  carrier_breakdown: {}, month_breakdown: {}, createdAt: "",
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

interface UseDashboardReturn {
  data: DashboardData | null;
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  refresh: () => void;
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) setIsRefreshing(true);
    setError(null);

    try {
      const res = await fetch(DASHBOARD_API, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const raw: RawDatatableItem[] = await res.json();

      const find = <T extends RawDatatableItem>(key: T["datatable"]): T =>
        (raw.find((item) => item.datatable === key) as T);

      const normalized: DashboardData = {
        smsQueue:   find("sms_queue")           ?? EMPTY_SMS_QUEUE,
        smsRawlogs: find("sms_rawlogs")         ?? EMPTY_SMS_RAWLOGS,
        smsInbound: find("sms_inbound_rawlogs") ?? EMPTY_SMS_INBOUND,
        forthDeals: find("forth_deals")         ?? EMPTY_FORTH_DEALS,
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

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => fetchData(false), REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchData]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return { data, error, isLoading, isRefreshing, lastUpdated, refresh };
}
