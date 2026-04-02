"use client";

import { useState, useEffect, useCallback } from "react";
import type { DashboardData, RawDatatableItem } from "@/types";

const DASHBOARD_API = "/api/dashboard";
const REFRESH_INTERVAL = 600_000; // 10 minutes

// Empty fallbacks so components never receive undefined
const EMPTY_RVM_QUEUE: DashboardData["rvmQueue"] = {
  id: 0, datatable: "rvm_queue", total_queued: 0,
  campaign_breakdown: {}, month_breakdown: {}, createdAt: "",
};
const EMPTY_SMS_QUEUE: DashboardData["smsQueue"] = {
  id: 0, datatable: "sms_queue", total_queued: 0,
  campaign_breakdown: {}, carrier_breakdown: {}, action_breakdown: {},
  month_breakdown: {}, createdAt: "",
};
const EMPTY_RVM_RAWLOGS: DashboardData["rvmRawlogs"] = {
  id: 0, datatable: "rvm_rawlogs", success: 0, failure: 0, queue: 0,
  total_rvm: 0, total_cost: 0, average_ingest_time_ms: 0,
  campaign_breakdown: {}, lead_source_breakdown: {}, reasons: {},
  month_breakdown: {}, createdAt: "",
};
const EMPTY_SMS_RAWLOGS: DashboardData["smsRawlogs"] = {
  id: 0, datatable: "sms_rawlogs", total_messages: 0, total_cost: 0,
  average_ingest_time_ms: 0, status_breakdown: {}, campaign_breakdown: {},
  lead_source_breakdown: {}, month_breakdown: {}, createdAt: "",
};
const EMPTY_SMS_INBOUND: DashboardData["smsInbound"] = {
  id: 0, datatable: "sms_inbound_rawlogs", total_received: 0,
  status_counts: {}, status_reason_counts: {}, month_breakdown: {}, createdAt: "",
};
const EMPTY_FORTH_DEALS: DashboardData["forthDeals"] = {
  id: 0, datatable: "forth_deals", total_deals: 0, total_current_debt_amount: 0,
  total_debt_revenue: 0, total_current_payment: 0, total_payment_revenue: 0,
  lead_source_breakdown: {}, month_breakdown: {}, createdAt: "",
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
        rvmQueue:   find("rvm_queue")   ?? EMPTY_RVM_QUEUE,
        smsQueue:   find("sms_queue")   ?? EMPTY_SMS_QUEUE,
        rvmRawlogs: find("rvm_rawlogs") ?? EMPTY_RVM_RAWLOGS,
        smsRawlogs: find("sms_rawlogs") ?? EMPTY_SMS_RAWLOGS,
        smsInbound: find("sms_inbound_rawlogs") ?? EMPTY_SMS_INBOUND,
        forthDeals: find("forth_deals") ?? EMPTY_FORTH_DEALS,
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

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = setInterval(() => fetchData(false), REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchData]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  return { data, error, isLoading, isRefreshing, lastUpdated, refresh };
}
