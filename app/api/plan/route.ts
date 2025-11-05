import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getQuotes } from "@/lib/market/yahoo";
import { buildPlan } from "@/lib/reco/allocator";

const planSchema = z.object({
  budget: z.number().positive(),
  risk: z.enum(["medium", "medium-high", "high"]),
  tickers: z.array(
    z.object({
      symbol: z.string(),
      weight: z.number().min(0).max(1),
    })
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { budget, risk, tickers } = planSchema.parse(body);

    if (tickers.length === 0) {
      return NextResponse.json(
        {
          tickers: [],
          shares: [],
          cashLeft: budget,
          notes: ["No tickers provided"],
        },
        { status: 200 }
      );
    }

    // Fetch current prices
    const symbols = tickers.map((t) => t.symbol);
    const quotes = await getQuotes(symbols);

    // Build candidates with prices
    const candidates = tickers
      .map((t) => {
        const quote = quotes[t.symbol];
        if (!quote) {
          return null;
        }
        return {
          symbol: t.symbol,
          price: quote.price,
          weight: t.weight,
        };
      })
      .filter((c): c is { symbol: string; price: number; weight: number } => {
        return c !== null;
      });

    if (candidates.length === 0) {
      return NextResponse.json(
        {
          tickers: [],
          shares: [],
          cashLeft: budget,
          notes: ["Failed to fetch prices for requested tickers"],
        },
        { status: 200 }
      );
    }

    // Build plan
    const plan = buildPlan(budget, candidates, risk);

    return NextResponse.json(plan);
  } catch (error) {
    console.error("Error in plan route:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request", details: error.errors },
        { status: 400 }
      );
    }

    // Fallback to conservative plan
    return NextResponse.json(
      {
        tickers: [
          { symbol: "SPY", weight: 0.5 },
          { symbol: "QQQ", weight: 0.5 },
        ],
        shares: [],
        cashLeft: 0,
        notes: [
          "Error processing plan. Please verify ticker symbols and try again.",
        ],
      },
      { status: 200 }
    );
  }
}
