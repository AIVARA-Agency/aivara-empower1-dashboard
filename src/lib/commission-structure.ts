// Empower1 revenue tier structure: monthly client payment → Empower1 revenue per deal
// Provided by Austin Owens (2026-04-16).
// Each tier maps a debt-settlement client's monthly payment to the total revenue
// Empower1 recognizes on that deal. NOT AIVARA commission — this is client-side revenue.

export interface CommissionTier {
  payment: number;      // Client's monthly payment amount ($)
  revenue: number;      // Empower1 revenue recognized per deal ($)
  multiple: number;     // revenue / payment (derived)
  bracket: "standard" | "premium"; // 3x bracket vs 5x bracket
}

export const COMMISSION_TIERS: CommissionTier[] = [
  { payment: 220, revenue: 662,   multiple: 3.01, bracket: "standard" },
  { payment: 270, revenue: 807,   multiple: 2.99, bracket: "standard" },
  { payment: 320, revenue: 977,   multiple: 3.05, bracket: "standard" },
  { payment: 370, revenue: 1840,  multiple: 4.97, bracket: "premium" },
  { payment: 420, revenue: 2115,  multiple: 5.04, bracket: "premium" },
  { payment: 520, revenue: 2690,  multiple: 5.17, bracket: "premium" },
  { payment: 620, revenue: 3190,  multiple: 5.15, bracket: "premium" },
];

/**
 * Given a monthly payment amount, return the Empower1 revenue per the tier table.
 * Rounds to the nearest tier for payments that fall between exact values.
 */
export function revenueForPayment(payment: number): number {
  if (payment <= 0) return 0;
  // Find closest tier by payment amount
  const closest = COMMISSION_TIERS.reduce((best, tier) =>
    Math.abs(tier.payment - payment) < Math.abs(best.payment - payment) ? tier : best
  );
  return closest.revenue;
}

/**
 * Given a total revenue amount and total deal count, estimate the dominant tier.
 * Returns which tier's revenue multiplied by deals best approximates the total.
 */
export function estimateDominantTier(totalRevenue: number, totalDeals: number): CommissionTier | null {
  if (totalDeals === 0) return null;
  const avgRevenuePerDeal = totalRevenue / totalDeals;
  return COMMISSION_TIERS.reduce((best, tier) =>
    Math.abs(tier.revenue - avgRevenuePerDeal) < Math.abs(best.revenue - avgRevenuePerDeal) ? tier : best
  );
}
