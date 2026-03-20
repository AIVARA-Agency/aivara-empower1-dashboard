// RVM Types
export interface RVMFailureReasons {
  voicemail_notdetected?: number;
  number_not_reachable?: number;
  [key: string]: number | undefined;
}

export interface RVMStats {
  completed: number;
  failed: number;
  queued: number;
  total: number;
  failure_reasons: RVMFailureReasons;
}

// SMS Outbound Types
export interface SMSOutboundStats {
  total: number;
  delivered: number;
  carrier_rejected: number;
}

// SMS Inbound Types
export interface SMSSentiment {
  dnc: number;
  positive: number;
  neutral: number;
  negative: number;
  invalid: number;
}

export interface SMSInboundStats {
  total: number;
  sentiment: SMSSentiment;
}

// Aggregated Dashboard Response
export interface DashboardData {
  rvm: RVMStats;
  sms_outbound: SMSOutboundStats;
  sms_inbound: SMSInboundStats;
}

// SMS Detail Types
export interface SMSPagination {
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
}

export interface CampaignBreakdown {
  [campaign: string]: number;
}

export interface CarrierBreakdown {
  [carrier: string]: number;
}

export interface SMSSummary {
  total_sms: number;
  total_cost: number;
  campaign_breakdown: CampaignBreakdown;
  carrier_breakdown: CarrierBreakdown;
  average_ingest_time_ms: number;
}

export interface SMSRecord {
  guid: string;
  status: string;
  status_message: string;
  lead_source: string;
  campaign_id: string;
  lead_cost: number;
  ingest_time: number;
}

export interface SMSRawLogs {
  summary: SMSSummary;
  records: SMSRecord[];
}

export interface SMSDetailResponse {
  pagination: SMSPagination;
  sms_rawlogs: SMSRawLogs;
}

// Chart data types
export interface ChartDataPoint {
  name: string;
  value: number;
  fill?: string;
}

export interface BarChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}
