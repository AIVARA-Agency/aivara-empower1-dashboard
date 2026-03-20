"use client";

import { useState, useEffect } from "react";
import type { SMSDetailResponse } from "@/types";

const SMS_API = "/api/sms";

interface UseSMSLogsReturn {
  data: SMSDetailResponse | null;
  error: string | null;
  isLoading: boolean;
}

export function useSMSLogs(page: number): UseSMSLogsReturn {
  const [data, setData] = useState<SMSDetailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function fetchPage() {
      setIsLoading(true);
      setError(null);

      try {
        const url = `${SMS_API}?page=${page}&pageSize=30`;
        const res = await fetch(url, { cache: "no-store" });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        // API returns an array with one object: [{ pagination, sms_rawlogs }]
        const raw = await res.json();
        const json: SMSDetailResponse = Array.isArray(raw) ? raw[0] : raw;
        if (!cancelled) {
          setData(json);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to fetch SMS logs");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchPage();
    return () => { cancelled = true; };
  }, [page]);

  return { data, error, isLoading };
}
