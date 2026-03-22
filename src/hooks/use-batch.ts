"use client";

import { useState, useEffect, useCallback } from "react";
import type { BatchAnalysisData } from "@/types";

const BATCH_API = "/api/batch";
const REFRESH_INTERVAL = 600_000; // 10 minutes

interface UseBatchReturn {
  data: BatchAnalysisData | null;
  error: string | null;
  isLoading: boolean;
  isRefreshing: boolean;
  lastUpdated: Date | null;
  leadSource: string;
  setLeadSource: (source: string) => void;
  refresh: () => void;
}

export function useBatch(): UseBatchReturn {
  const [data, setData] = useState<BatchAnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [leadSource, setLeadSource] = useState<string>("all");

  const fetchData = useCallback(async (source: string, isManualRefresh = false) => {
    if (isManualRefresh) {
      setIsRefreshing(true);
    }
    setError(null);

    try {
      const url = source === "all" ? BATCH_API : `${BATCH_API}?lead_source=${encodeURIComponent(source)}`;
      const res = await fetch(url, { cache: "no-store" });

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const raw = await res.json();
      const json = Array.isArray(raw) ? raw[0] : raw;

      const normalized: BatchAnalysisData = {
        meta:                     json.meta ?? { lead_source_filter: source, lead_sources_available: [], record_counts: {} },
        sms_campaign_performance: json.sms_campaign_performance ?? {},
        rvm_campaign_performance: json.rvm_campaign_performance ?? {},
        sms_sender_numbers:       json.failed_commio_numbers?.sms_sender_numbers ?? [],
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

  // Initial load + re-fetch on lead source change
  useEffect(() => {
    setIsLoading(true);
    fetchData(leadSource);
  }, [fetchData, leadSource]);

  // Auto-refresh every 10 minutes
  useEffect(() => {
    const timer = setInterval(() => fetchData(leadSource, false), REFRESH_INTERVAL);
    return () => clearInterval(timer);
  }, [fetchData, leadSource]);

  const refresh = useCallback(() => {
    fetchData(leadSource, true);
  }, [fetchData, leadSource]);

  return { data, error, isLoading, isRefreshing, lastUpdated, leadSource, setLeadSource, refresh };
}
