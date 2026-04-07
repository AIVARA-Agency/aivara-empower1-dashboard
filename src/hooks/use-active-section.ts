"use client";

import { useEffect, useState } from "react";

export const SECTION_IDS = ["system-queue", "forth-deals", "ring-central", "sms-inbound", "sms-performance"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>("system-queue");

  useEffect(() => {
    const ratioMap = new Map<SectionId, number>();
    const observers: IntersectionObserver[] = [];

    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const obs = new IntersectionObserver(
        ([entry]) => {
          ratioMap.set(id, entry.intersectionRatio);
          let best: SectionId = "system-queue";
          let bestRatio = -1;
          ratioMap.forEach((ratio, sectionId) => {
            if (ratio > bestRatio) { bestRatio = ratio; best = sectionId; }
          });
          setActive(best);
        },
        { threshold: [0, 0.1, 0.25, 0.5, 0.75, 1.0], rootMargin: "-10% 0px -60% 0px" }
      );

      obs.observe(el);
      observers.push(obs);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  return active;
}
