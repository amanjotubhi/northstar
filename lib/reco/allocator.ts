export type RiskTier = "medium" | "medium-high" | "high";

export interface Candidate {
  symbol: string;
  price: number;
  weight?: number;
}

export interface AllocationPlan {
  tickers: Array<{ symbol: string; weight: number }>;
  shares: Array<{ symbol: string; shares: number; price: number }>;
  cashLeft: number;
  notes: string[];
}

const DEFAULT_WEIGHTS: Record<
  RiskTier,
  { medium: number; "medium-high": number; high: number }
> = {
  medium: { medium: 0.6, "medium-high": 0.3, high: 0.1 },
  "medium-high": { medium: 0.35, "medium-high": 0.45, high: 0.2 },
  high: { medium: 0.2, "medium-high": 0.4, high: 0.4 },
};

export function defaultWeights(risk: RiskTier): {
  medium: number;
  "medium-high": number;
  high: number;
} {
  return DEFAULT_WEIGHTS[risk];
}

export function buildPlan(
  budget: number,
  candidatesWithPrices: Candidate[],
  risk: RiskTier
): AllocationPlan {
  if (candidatesWithPrices.length === 0) {
    return {
      tickers: [],
      shares: [],
      cashLeft: budget,
      notes: ["No candidates provided"],
    };
  }

  // Normalize weights if provided, otherwise distribute evenly
  let totalWeight = candidatesWithPrices.reduce(
    (sum, c) => sum + (c.weight || 0),
    0
  );

  if (totalWeight === 0) {
    // Equal weighting
    const weight = 1 / candidatesWithPrices.length;
    candidatesWithPrices.forEach((c) => {
      c.weight = weight;
    });
    totalWeight = 1;
  }

  // Normalize weights to sum to 1
  const normalized = candidatesWithPrices.map((c) => ({
    ...c,
    weight: (c.weight || 0) / totalWeight,
  }));

  // Reserve 1-3% cash buffer
  const cashBufferPercent = 0.02; // 2%
  const investableBudget = budget * (1 - cashBufferPercent);

  // Calculate shares (floor rounding)
  const allocations = normalized.map((candidate) => {
    const allocation = investableBudget * candidate.weight;
    const shares = Math.floor(allocation / candidate.price);

    return {
      symbol: candidate.symbol,
      weight: candidate.weight,
      shares,
      price: candidate.price,
      allocated: shares * candidate.price,
    };
  });

  const totalAllocated = allocations.reduce(
    (sum, a) => sum + a.allocated,
    0
  );
  const cashLeft = budget - totalAllocated;

  // Re-normalize weights based on actual allocations
  const actualTotal = allocations.reduce((sum, a) => sum + a.allocated, 0);
  const finalTickers = allocations.map((a) => ({
    symbol: a.symbol,
    weight: actualTotal > 0 ? a.allocated / actualTotal : a.weight,
  }));

  const finalShares = allocations.map((a) => ({
    symbol: a.symbol,
    shares: a.shares,
    price: a.price,
  }));

  const notes = [
    `Allocated $${totalAllocated.toFixed(2)} of $${budget.toFixed(2)} budget`,
    `Cash buffer: $${cashLeft.toFixed(2)} (${((cashLeft / budget) * 100).toFixed(1)}%)`,
  ];

  return {
    tickers: finalTickers,
    shares: finalShares,
    cashLeft,
    notes,
  };
}
