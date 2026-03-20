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
  total_cost: number;
  campaign_breakdown: Record<string, number>;
  failure_reasons: RVMFailureReasons;
}

// SMS Outbound Types
export interface SMSOutboundStats {
  total: number;
  delivered: number;
  carrier_rejected: number;
  message_sent: number;
  failed: number;
  total_cost: number;
  campaign_breakdown: Record<string, number>;
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

// Queue Types
export interface SMSQueueData {
  total_queued: number;
  campaign_breakdown: Record<string, number>;
  carrier_breakdown: Record<string, number>;
  action_breakdown: Record<string, number>;
}

export interface RVMQueueData {
  total_queued: number;
  campaign_breakdown: Record<string, number>;
}

// Aggregated Dashboard Response
export interface DashboardData {
  rvm: RVMStats;
  sms_outbound: SMSOutboundStats;
  sms_inbound: SMSInboundStats;
  sms_queue: SMSQueueData;
  rvm_queue: RVMQueueData;
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
  createdAt?: string;
}

export interface SMSRawLogs {
  summary: SMSSummary;
  records: SMSRecord[];
}

export interface SMSDetailResponse {
  pagination: SMSPagination;
  sms_rawlogs: SMSRawLogs;
}

// Batch Analysis Types
export interface BatchMeta {
  lead_source_filter: string;
  lead_sources_available: string[];
  record_counts: {
    sms_rawlogs: number;
    sms_inbound: number;
    rvm_rawlogs: number;
    filtered_sms: number;
    filtered_rvm: number;
  };
}

export interface SMSCampaignStat {
  total_sent: number;
  total_cost: number;
  inbound_replies: number;
  reply_rate_pct: number;
  cost_per_reply: number;
  carrier_breakdown: Record<string, number>;
}

export interface RVMCampaignStat {
  total_sent: number;
  success: number;
  failure: number;
  queued: number;
  total_cost: number;
  success_rate_pct: number;
  failure_reasons: Record<string, number>;
}

export interface SMSSenderNumber {
  from: string;
  total_sent: number;
  status_breakdown: Record<string, number>;
}

export interface BatchAnalysisData {
  meta: BatchMeta;
  sms_campaign_performance: Record<string, SMSCampaignStat>;
  rvm_campaign_performance: Record<string, RVMCampaignStat>;
  sms_sender_numbers: SMSSenderNumber[];
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
