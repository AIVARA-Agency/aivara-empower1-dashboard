"use client";

import { useState, useEffect, useCallback } from "react";
import type { BatchAnalysisData } from "@/types";

const BATCH_API = "/api/batch";

interface UseBatchReturn {
  data: BatchAnalysisData | null;
  error: string | null;
  isLoading: boolean;
  leadSource: string;
  setLeadSource: (source: string) => void;
}

export function useBatch(): UseBatchReturn {
  const [data, setData] = useState<BatchAnalysisData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leadSource, setLeadSource] = useState<string>("all");

  const fetchData = useCallback(async (source: string) => {
    setIsLoading(true);
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
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(leadSource);
  }, [fetchData, leadSource]);

  return { data, error, isLoading, leadSource, setLeadSource };
}
