export const CHART_COLORS = [
  "#4cc9f0", // sky blue
  "#ff6b6b", // coral red
  "#51cf66", // green
  "#ffd43b", // yellow
  "#cc5de8", // purple
  "#ff922b", // orange
  "#20c997", // teal
  "#f06595", // pink
  "#74c0fc", // light blue
  "#a9e34b", // lime
  "#e599f7", // lavender
  "#fd7e14", // deep orange
];

export const STATUS_COLORS: Record<string, string> = {
  delivered:        "#6ec6a0",
  success:          "#6ec6a0",
  carrier_rejected: "#e05c5c",
  rejected:         "#e05c5c",
  failed:           "#e05c5c",
  failure:          "#e05c5c",
  message_sent:     "#64b5d0",
  unknown:          "#a0a0a0",
  invalid_number:   "#e0a875",
  queue:            "#e0a875",
  sent:             "#6ec6a0",
  // RVM
  voicemail_notdetected:  "#e0a875",
  number_not_reachable:   "#e05c5c",
  too_many_attempts:      "#d97d5a",
  no_answer:              "#a78bca",
  user_busy:              "#64b5d0",
  other:                  "#a0a0a0",
  no_caller_id:           "#8cb8e8",
  known_litigator:        "#f0c97a",
  internal_dnc:           "#93d4df",
  united_states_blocked:  "#e8a0bf",
  // Sentiment
  DNC:            "#e05c5c",
  POSITIVE:       "#6ec6a0",
  NEUTRAL:        "#64b5d0",
  NEGATIVE:       "#d97d5a",
  INVALID_NUMBER: "#a0a0a0",
};
