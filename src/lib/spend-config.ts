// Per-unit cost rates derived from vendor invoices/snapshots.
// Provided by Austin Owens (2026-04-16 sample day).
// Dashboard multiplies these rates by live webhook volume to get accurate spend
// without needing the vendor invoice total ingested separately.

export const VENDOR_RATES = {
  commio: {
    outboundCallPerMin: 0.009712,   // $/minute for outbound calls via Commio
    inboundCallPerMin:  0.017504,   // $/minute for inbound calls via Commio (derived)
    smsPerMessage:      0.003001,   // $/outbound SMS (derived from $95.80 / 31,927 msgs)
  },
  dropCowboy: {
    rvmPerDrop:         0.005000,   // $/RVM drop (derived from $281.52 / 56,303 drops)
  },
} as const;

/**
 * Calculate SMS spend from Commio using live sent volume.
 * @param messagesSent Total messages sent (from sms_rawlogs.total_sent)
 */
export function calcSmsSpend(messagesSent: number): number {
  return messagesSent * VENDOR_RATES.commio.smsPerMessage;
}

/**
 * Calculate outbound voice spend from Commio using Ring Central minute volume.
 * Ring Central reports `total_duration_mins` — we treat that as billable Commio minutes.
 * @param totalMinutes Total call minutes (from ring_central.summary.total_duration_mins)
 */
export function calcOutboundCallSpend(totalMinutes: number): number {
  return totalMinutes * VENDOR_RATES.commio.outboundCallPerMin;
}

/**
 * Calculate RVM spend from Drop Cowboy using drop volume.
 * Drop count should come from Drop Cowboy webhook once integrated.
 * Until then, pass a static or period estimate.
 * @param dropsCount Total RVM drops sent
 */
export function calcRvmSpend(dropsCount: number): number {
  return dropsCount * VENDOR_RATES.dropCowboy.rvmPerDrop;
}

// ─── Sample-day snapshot (for fallback / display) ────────────────────────────
// Source: Austin Owens dashboard screenshots (2026-04-16)
// These represent activity on a SINGLE sample day. Activity varies wildly
// (2026-04-17 showed $0.81 Drop Cowboy spend on 162 drops).

export interface ChannelSpend {
  name: string;
  vendor: string;
  dailySpend: number;
  description: string;
  metrics?: Record<string, number | string>;
}

export const CHANNEL_SPEND: ChannelSpend[] = [
  {
    name: "Commio Outbound Calls",
    vendor: "Commio",
    dailySpend: 1217.92,
    description: "Outbound call dialing",
    metrics: {
      "Rate": "$0.009712/min",
      "Calls (sample day)": 270640,
      "Minutes (sample day)": 125409.7,
    },
  },
  {
    name: "Commio Messaging (SMS)",
    vendor: "Commio",
    dailySpend: 95.80,
    description: "Outbound SMS via Commio",
    metrics: {
      "Rate": "$0.003/msg",
      "Success rate": "89.62%",
      "Messages (sample day)": 31927,
    },
  },
  {
    name: "Commio Inbound Calls",
    vendor: "Commio",
    dailySpend: 17.69,
    description: "Inbound call routing",
    metrics: {
      "Rate": "$0.0175/min",
      "Phone numbers": 489,
      "Calls (sample day)": 2673,
    },
  },
  {
    name: "Drop Cowboy RVM",
    vendor: "Drop Cowboy",
    dailySpend: 281.52,
    description: "Ringless voicemail drops",
    metrics: {
      "Rate": "$0.005/drop",
      "Drops (sample day)": 56303,
      "Active campaigns": 1,
    },
  },
];

/** Sum of sample-day spend across channels (snapshot only). */
export const SAMPLE_DAY_TOTAL_SPEND = CHANNEL_SPEND.reduce((s, c) => s + c.dailySpend, 0);

/** Very rough monthly estimate (sample day × 30). Replace with live calculation when possible. */
export const MONTHLY_ESTIMATED_SPEND = SAMPLE_DAY_TOTAL_SPEND * 30;

export function spendByChannelType(): { sms: number; rvm: number; calls: number } {
  let sms = 0, rvm = 0, calls = 0;
  CHANNEL_SPEND.forEach((c) => {
    if (c.name.toLowerCase().includes("messaging") || c.name.toLowerCase().includes("sms")) sms += c.dailySpend;
    else if (c.name.toLowerCase().includes("rvm") || c.name.toLowerCase().includes("voicemail")) rvm += c.dailySpend;
    else calls += c.dailySpend;
  });
  return { sms, rvm, calls };
}

// ─── Campaign performance data (Drop Cowboy - last 24hrs + last 7 days) ──────
// Source: Austin Owens campaign spreadsheet (2026-04-16)

export interface CampaignPerformance {
  name: string;
  last24h: { success: number; failed: number; total: number; successRate: number };
  last7d?: { success: number; failed: number; total: number; successRate: number };
  status?: "active" | "paused" | "complete";
}

export const CAMPAIGN_PERFORMANCE: CampaignPerformance[] = [
  { name: "WG Credit",                      last24h: { success: 23781, failed: 50150, total: 73931, successRate: 32.17 }, status: "paused" },
  { name: "LW Bonus Aged",                  last24h: { success: 28935, failed: 71065, total: 100000, successRate: 28.94 }, status: "complete" },
  { name: "RG",                             last24h: { success: 22214, failed: 49766, total: 71980, successRate: 30.86 } },
  { name: "Opt in 10k out of 20k Day 2",    last24h: { success: 3871,  failed: 6129,  total: 10000, successRate: 38.71 } },
  { name: "CS to follow up NSF",            last24h: { success: 257,   failed: 373,   total: 630,   successRate: 40.79 } },
  { name: "Luis Test Data",                 last24h: { success: 12460, failed: 22383, total: 34843, successRate: 35.76 } },
  { name: "LW Opt in 2",                    last24h: { success: 3448,  failed: 6552,  total: 10000, successRate: 34.48 } },
  { name: "Mortgage",                       last24h: { success: 1122,  failed: 1117,  total: 2239,  successRate: 50.11 } },
  { name: "CS Over 25k",                    last24h: { success: 180,   failed: 187,   total: 367,   successRate: 49.05 } },
  { name: "My Campaign",                    last24h: { success: 0,     failed: 0,     total: 0,     successRate: 0 },
                                            last7d:  { success: 4123,  failed: 5877,  total: 10000, successRate: 41.23 } },
  { name: "API",                            last24h: { success: 13316, failed: 37022, total: 50338, successRate: 26.45 },
                                            last7d:  { success: 16042, failed: 44748, total: 60790, successRate: 26.39 } },
];
