export const TIERS = ["S", "A", "B", "C", "D"] as const;
export type Tier = (typeof TIERS)[number];

export const TIER_SCORE: Record<Tier, number> = { S: 5, A: 4, B: 3, C: 2, D: 1 };

export const TIER_COLORS: Record<Tier, string> = {
  S: "bg-tier-s text-tier-s-foreground",
  A: "bg-tier-a text-tier-a-foreground",
  B: "bg-tier-b text-tier-b-foreground",
  C: "bg-tier-c text-tier-c-foreground",
  D: "bg-tier-d text-tier-d-foreground",
};

export function scoreToTier(avg: number): Tier {
  if (avg >= 4.5) return "S";
  if (avg >= 3.5) return "A";
  if (avg >= 2.5) return "B";
  if (avg >= 1.5) return "C";
  return "D";
}
