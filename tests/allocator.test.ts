import { describe, it, expect } from "vitest";
import { defaultWeights, buildPlan, type RiskTier } from "../lib/reco/allocator";

describe("defaultWeights", () => {
  it("returns correct weights for medium risk", () => {
    const weights = defaultWeights("medium");
    expect(weights.medium).toBe(0.6);
    expect(weights["medium-high"]).toBe(0.3);
    expect(weights.high).toBe(0.1);
  });

  it("returns correct weights for medium-high risk", () => {
    const weights = defaultWeights("medium-high");
    expect(weights.medium).toBe(0.35);
    expect(weights["medium-high"]).toBe(0.45);
    expect(weights.high).toBe(0.2);
  });

  it("returns correct weights for high risk", () => {
    const weights = defaultWeights("high");
    expect(weights.medium).toBe(0.2);
    expect(weights["medium-high"]).toBe(0.4);
    expect(weights.high).toBe(0.4);
  });
});

describe("buildPlan", () => {
  it("handles empty candidates", () => {
    const plan = buildPlan(1000, [], "medium");
    expect(plan.tickers).toEqual([]);
    expect(plan.shares).toEqual([]);
    expect(plan.cashLeft).toBe(1000);
  });

  it("calculates shares with floor rounding", () => {
    const candidates = [
      { symbol: "AAPL", price: 150 },
      { symbol: "MSFT", price: 300 },
    ];
    const plan = buildPlan(1000, candidates, "medium");

    expect(plan.shares.length).toBe(2);
    expect(plan.shares[0].shares).toBe(Math.floor(plan.shares[0].shares));
    expect(plan.shares[1].shares).toBe(Math.floor(plan.shares[1].shares));

    // Verify cash buffer is maintained
    const totalAllocated = plan.shares.reduce(
      (sum, s) => sum + s.shares * s.price,
      0
    );
    expect(plan.cashLeft).toBeGreaterThan(0);
    expect(totalAllocated + plan.cashLeft).toBeLessThanOrEqual(1000);
  });

  it("respects custom weights", () => {
    const candidates = [
      { symbol: "AAPL", price: 100, weight: 0.7 },
      { symbol: "MSFT", price: 200, weight: 0.3 },
    ];
    const plan = buildPlan(1000, candidates, "medium");

    expect(plan.tickers.length).toBe(2);
    // AAPL should have higher weight
    const aaplWeight = plan.tickers.find((t) => t.symbol === "AAPL")?.weight;
    const msftWeight = plan.tickers.find((t) => t.symbol === "MSFT")?.weight;
    expect(aaplWeight).toBeGreaterThan(msftWeight || 0);
  });

  it("maintains 1-3% cash buffer", () => {
    const candidates = [
      { symbol: "AAPL", price: 50 },
      { symbol: "MSFT", price: 100 },
    ];
    const plan = buildPlan(10000, candidates, "medium");

    const cashPercent = (plan.cashLeft / 10000) * 100;
    expect(cashPercent).toBeGreaterThanOrEqual(1);
    expect(cashPercent).toBeLessThanOrEqual(3);
  });

  it("handles very small budget", () => {
    const candidates = [{ symbol: "AAPL", price: 150 }];
    const plan = buildPlan(100, candidates, "medium");

    expect(plan.shares.length).toBeGreaterThanOrEqual(0);
    expect(plan.cashLeft).toBeGreaterThanOrEqual(0);
    expect(plan.cashLeft).toBeLessThanOrEqual(100);
  });
});
