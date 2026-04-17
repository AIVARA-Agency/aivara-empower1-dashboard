// Lead source normalization layer.
// Forth lead sources are entered by reps as free-text, so the same source often
// appears under 2-3 different labels ("Patriot" vs "Patriot Resources",
// "Empower" vs "EMPOWER1"). This module canonicalizes those labels so revenue
// and call data aggregate correctly.
//
// Long-term fix: Forth admin should convert the lead source field to a fixed
// dropdown. Until then, normalize at the dashboard layer.

/**
 * Map of variant label → canonical label. Add new aliases here as duplicates
 * are discovered in the data. Comparison is case-insensitive and trimmed.
 */
const SOURCE_ALIASES: Record<string, string> = {
  // Patriot family
  "patriot":           "Patriot",
  "patriot resources": "Patriot",

  // Empower1 family
  "empower":    "Empower1",
  "empower1":   "Empower1",
  "empower 1":  "Empower1",

  // TrackDrive family
  "trackdrive":   "TrackDrive",
  "track drive":  "TrackDrive",
  "track-drive":  "TrackDrive",

  // Unattributed / untracked
  "":                  "Not Specified",
  "not specified":     "Not Specified",
  "unknown":           "Not Specified",
  "n/a":               "Not Specified",
  "null":              "Not Specified",
};

/**
 * Normalize a raw lead source label to its canonical form.
 * Falls back to a title-cased version of the input if no alias is found.
 */
export function normalizeLeadSource(raw: string | null | undefined): string {
  if (!raw) return "Not Specified";
  const key = raw.trim().toLowerCase();
  if (SOURCE_ALIASES[key]) return SOURCE_ALIASES[key];
  // No alias match — return the original trimmed value (preserves case)
  return raw.trim();
}

/**
 * Merge an array of {source, deals, revenue, ...} entries by their normalized source name.
 * Sums numeric fields and keeps the canonical label.
 */
export function mergeBySource<T extends { source: string; deals: number; revenue: number }>(
  entries: T[]
): T[] {
  const merged = new Map<string, T>();
  for (const e of entries) {
    const canonical = normalizeLeadSource(e.source);
    const existing = merged.get(canonical);
    if (existing) {
      existing.deals += e.deals;
      existing.revenue += e.revenue;
      // Merge numeric-valued extras (calls, answered, etc.) if they exist
      for (const key of Object.keys(e) as (keyof T)[]) {
        if (key === "source" || key === "deals" || key === "revenue") continue;
        const ev = e[key];
        const xv = existing[key];
        if (typeof ev === "number" && typeof xv === "number") {
          (existing[key] as number) = xv + ev;
        } else if (xv == null && ev != null) {
          existing[key] = ev;
        }
      }
    } else {
      merged.set(canonical, { ...e, source: canonical });
    }
  }
  return Array.from(merged.values());
}

/**
 * Detect which raw source labels collapsed into each canonical label.
 * Useful for a diagnostic "data hygiene" panel.
 */
export function detectDuplicates(rawLabels: string[]): Record<string, string[]> {
  const groups: Record<string, string[]> = {};
  for (const raw of rawLabels) {
    const canonical = normalizeLeadSource(raw);
    if (!groups[canonical]) groups[canonical] = [];
    if (!groups[canonical].includes(raw)) groups[canonical].push(raw);
  }
  // Only keep groups where multiple raw variants collapsed into the same canonical
  const duplicates: Record<string, string[]> = {};
  for (const [canonical, variants] of Object.entries(groups)) {
    if (variants.length > 1) duplicates[canonical] = variants;
  }
  return duplicates;
}
