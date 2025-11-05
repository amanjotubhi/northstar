import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getIndexSnapshot, getQuotes } from "@/lib/market/yahoo";

const querySchema = z.object({
  symbols: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const { symbols } = querySchema.parse({
      symbols: searchParams.get("symbols"),
    });

    // Always fetch indexes
    const [nasdaq, esMini] = await Promise.all([
      getIndexSnapshot("^IXIC"),
      getIndexSnapshot("ES=F"),
    ]);

    const indexes: Record<string, any> = {};
    if (nasdaq) {
      indexes["^IXIC"] = nasdaq;
    }
    if (esMini) {
      indexes["ES=F"] = esMini;
    }

    // Fetch quotes for requested symbols
    let quotes: Record<string, any> = {};
    const errors: string[] = [];

    if (symbols) {
      const symbolList = symbols
        .split(",")
        .map((s) => s.trim().toUpperCase())
        .filter((s) => s.length > 0);

      if (symbolList.length > 0) {
        const quoteResults = await getQuotes(symbolList);
        quotes = quoteResults;

        // Track errors
        Object.entries(quoteResults).forEach(([symbol, quote]) => {
          if (!quote) {
            errors.push(`Failed to fetch quote for ${symbol}`);
          }
        });
      }
    }

    return NextResponse.json({
      indexes,
      quotes,
      ...(errors.length > 0 && { errors }),
    });
  } catch (error) {
    console.error("Error in market route:", error);
    return NextResponse.json(
      {
        indexes: {},
        quotes: {},
        errors: ["Failed to fetch market data"],
      },
      { status: 500 }
    );
  }
}
