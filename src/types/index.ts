// ─── settings ─────────────────────────────────────────────────────────────────

export interface RawSettings {
  id: 0;
  settings: {
    sms_queue_toggle: "true" | "false";
  };
}

// ─── sms_queue ────────────────────────────────────────────────────────────────

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

// ─── sms_rawlogs ──────────────────────────────────────────────────────────────

export interface SmsCarrierStats {
  total_sent: number;
  delivered: number;
  carrier_rejected: number;
  failed: number;
  message_sent: number;
  cost: number;
  delivery_rate: number;
}

export interface SmsPeriodEntry {
  total_sent: number;
  delivered: number;
  carrier_rejected: number;
  failed: number;
  message_sent: number;
  cost: number;
  delivery_rate: number;
  carrier_breakdown: Record<string, SmsCarrierStats>;
}

export interface SmsWeekEntry extends SmsPeriodEntry {
  date_range: string;
}

export interface RawSmsRawlogs {
  id: number;
  datatable: "sms_rawlogs";
  total_sent: number;
  total_delivered: number;
  total_carrier_rejected: number;
  total_failed: number;
  total_message_sent: number;
  total_cost: number;
  overall_delivery_rate: number;
  carrier_breakdown: Record<string, SmsCarrierStats>;
  month_breakdown: Record<string, SmsPeriodEntry>;
  week_breakdown: Record<string, SmsWeekEntry>;
  createdAt: string;
}

// ─── sms_inbound_rawlogs ──────────────────────────────────────────────────────

export interface StatusReasonCount {
  status_reason: string;
  total_received: number;
}

export interface InboundMonthEntry {
  period: string;
  total_received: number;
  by_status_reason: StatusReasonCount[];
}

export interface InboundWeekEntry {
  period: string;
  date_range: string;
  total_received: number;
  by_status_reason: StatusReasonCount[];
}

export interface RawSmsInbound {
  id: number;
  datatable: "sms_inbound_rawlogs";
  total_received: number;
  status_reason_counts: StatusReasonCount[];
  month_breakdown: InboundMonthEntry[];
  week_breakdown: InboundWeekEntry[];
  createdAt: string;
}

// ─── forth_deals ──────────────────────────────────────────────────────────────

export interface ForthDealsSummary {
  total_deals: number;
  total_debt: number;
  total_current_payments: number;
  total_revenue: number;
  total_campaign_spend?: number; // Commio + Drop Cowboy + labor costs
}

// Rep-level deal tracking (populated when n8n sends by_rep data)
export interface ForthRepEntry {
  rep_name: string;
  total_deals: number;
  total_revenue: number;
  total_calls?: number;
  avg_deal_size?: number;
}

// Shared sub-entry shapes used inside breakdowns
export interface ForthDealTypeEntry {
  deal_type: string;
  total_deals: number;
  total_revenue: number;
}
export interface ForthSourceLeadEntry {
  source_lead: string;
  total_deals: number;
  total_revenue: number;
}

export interface ForthMonthEntry {
  period: string;
  total_deals: number;
  total_revenue: number;
  by_deal_type: ForthDealTypeEntry[];
  by_source_lead: ForthSourceLeadEntry[];
  by_rep?: ForthRepEntry[];
}

export interface ForthWeekEntry {
  period: string;
  date_range: string;
  total_deals: number;
  total_revenue: number;
  by_deal_type: ForthDealTypeEntry[];
  by_source_lead: ForthSourceLeadEntry[];
}

export interface ForthSourceLead {
  source_lead: string;
  total_deals: number;
  total_revenue: number;
  by_deal_type: ForthDealTypeEntry[];
}

export interface ForthDealType {
  deal_type: string;
  total_deals: number;
  total_revenue: number;
  by_source_lead: ForthSourceLeadEntry[];
}

export interface RawForthDeals {
  id: number;
  datatable: "forth_deals";
  summary: ForthDealsSummary;
  month_breakdown: ForthMonthEntry[];
  week_breakdown: ForthWeekEntry[];
  source_lead_breakdown: ForthSourceLead[];
  deal_type_breakdown: ForthDealType[];
  rep_breakdown?: ForthRepEntry[];
  createdAt: string;
}

// ─── ring_central ─────────────────────────────────────────────────────────────

export interface RingCentralSummary {
  total_calls: number;
  answered_calls: number;
  missed_calls: number;
  total_duration: number;
  total_duration_mins: number;
  answer_rate: number;
  avg_duration: number;
}

export interface RingCentralLeadSource extends RingCentralSummary {
  lead_source: string;
}

export interface RingCentralMonthEntry extends RingCentralSummary {
  period: string;
  by_leadsource: RingCentralLeadSource[];
}

export interface RingCentralWeekEntry extends RingCentralSummary {
  period: string;
  date_range: string;
  by_leadsource: RingCentralLeadSource[];
}

export interface RawRingCentral {
  id: number;
  datatable: "ring_central";
  summary: RingCentralSummary;
  leadsource_breakdown: RingCentralLeadSource[];
  month_breakdown: RingCentralMonthEntry[];
  week_breakdown: RingCentralWeekEntry[];
  createdAt: string;
}

// ─── Union + DashboardData ────────────────────────────────────────────────────

export type RawDatatableItem =
  | RawSmsQueue
  | RawSmsRawlogs
  | RawSmsInbound
  | RawForthDeals
  | RawRingCentral;

export interface DashboardData {
  settings: RawSettings;
  smsQueue: RawSmsQueue;
  smsRawlogs: RawSmsRawlogs;
  smsInbound: RawSmsInbound;
  forthDeals: RawForthDeals;
  ringCentral: RawRingCentral;
}

// ─── Chart utilities ─────────────────────────────────────────────────────────

export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}
