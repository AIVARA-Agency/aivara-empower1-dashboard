// ─── Per-datatable raw shapes ────────────────────────────────────────────────

export interface RawRvmQueue {
  id: number;
  datatable: "rvm_queue";
  total_queued: number;
  campaign_breakdown: Record<string, number>;
  month_breakdown: Record<string, number>;
  createdAt: string;
}

export interface RawSmsQueue {
  id: number;
  datatable: "sms_queue";
  total_queued: number;
  campaign_breakdown: Record<string, number>;
  carrier_breakdown: Record<string, number>;
  action_breakdown: Record<string, number>;
  month_breakdown: Record<string, number>;
  createdAt: string;
}

export interface RvmMonthEntry {
  success: number;
  failure: number;
  queued: number;
  total_cost: number;
}

export interface RawRvmRawlogs {
  id: number;
  datatable: "rvm_rawlogs";
  success: number;
  failure: number;
  queue: number;
  total_rvm: number;
  total_cost: number;
  average_ingest_time_ms: number;
  campaign_breakdown: Record<string, number>;
  lead_source_breakdown: Record<string, number>;
  reasons: Record<string, number>;
  month_breakdown: Record<string, RvmMonthEntry>;
  createdAt: string;
}

export interface SmsMonthEntry {
  total_messages: number;
  total_cost: number;
}

export interface RawSmsRawlogs {
  id: number;
  datatable: "sms_rawlogs";
  total_messages: number;
  total_cost: number;
  average_ingest_time_ms: number;
  status_breakdown: Record<string, number>;
  campaign_breakdown: Record<string, number>;
  lead_source_breakdown: Record<string, number>;
  month_breakdown: Record<string, SmsMonthEntry>;
  createdAt: string;
}

export interface InboundMonthEntry {
  total_received: number;
}

export interface RawSmsInbound {
  id: number;
  datatable: "sms_inbound_rawlogs";
  total_received: number;
  status_counts: Record<string, number>;
  status_reason_counts: Record<string, number>;
  month_breakdown: Record<string, InboundMonthEntry>;
  createdAt: string;
}

export interface ForthDealsSummary {
  total_deals: number;
  total_debt: number;
  total_current_payments: number;
  total_revenue: number;
}

export interface ForthDealsByDealType {
  deal_type: string;
  total_deals: number;
  total_revenue: number;
}

export interface ForthDealsBySourceLead {
  source_lead: string;
  total_deals: number;
  total_revenue: number;
}

export interface ForthDealsByMonth {
  period: string;
  total_deals: number;
  total_revenue: number;
  by_deal_type: ForthDealsByDealType[];
  by_source_lead: ForthDealsBySourceLead[];
}

export interface ForthRevenueByMonth {
  period: string;
  gross_revenue: number;
}

export interface ForthRevenueByLeadSource {
  lead_source: string;
  gross_revenue: number;
}

export interface ForthRevenueByDealType {
  deal_type: string;
  gross_revenue: number;
}

export interface RawForthDeals {
  id: number;
  datatable: "forth_deals";
  summary: ForthDealsSummary;
  deals_by_month: ForthDealsByMonth[];
  revenue_by_month: ForthRevenueByMonth[];
  revenue_by_lead_source: ForthRevenueByLeadSource[];
  revenue_by_deal_type: ForthRevenueByDealType[];
  createdAt: string;
}

export type RawDatatableItem =
  | RawRvmQueue
  | RawSmsQueue
  | RawRvmRawlogs
  | RawSmsRawlogs
  | RawSmsInbound
  | RawForthDeals;

// ─── Normalized dashboard data ───────────────────────────────────────────────

export interface DashboardData {
  rvmQueue: RawRvmQueue;
  smsQueue: RawSmsQueue;
  rvmRawlogs: RawRvmRawlogs;
  smsRawlogs: RawSmsRawlogs;
  smsInbound: RawSmsInbound;
  forthDeals: RawForthDeals;
}

// ─── Chart utilities ─────────────────────────────────────────────────────────

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

export interface BarChartDataPoint {
  name: string;
  [key: string]: string | number;
}
