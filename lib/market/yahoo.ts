import yahooFinance from "yahoo-finance2";

export interface IndexSnapshot {
  price: number;
  changePercent: number;
  ts: number;
}

export interface Quote {
  price: number;
  changePercent: number;
  dayRange: { low: number; high: number };
  fiftyTwoWeekRange: { low: number; high: number };
  marketCap?: number;
  ts: number;
}

export async function getIndexSnapshot(
  symbol: string
): Promise<IndexSnapshot | null> {
  try {
    // @ts-ignore - yahoo-finance2 typing issue
    const quote = await yahooFinance.quote(symbol);
    if (!quote || !quote.regularMarketPrice) {
      return null;
    }

    const price = quote.regularMarketPrice;
    const previousClose = quote.regularMarketPreviousClose || price;
    const changePercent =
      previousClose !== 0 ? ((price - previousClose) / previousClose) * 100 : 0;

    return {
      price,
      changePercent,
      ts: Date.now(),
    };
  } catch (error) {
    console.error(`Error fetching index snapshot for ${symbol}:`, error);
    return null;
  }
}

export async function getQuotes(
  symbols: string[]
): Promise<Record<string, Quote | null>> {
  const results: Record<string, Quote | null> = {};

  if (symbols.length === 0) {
    return results;
  }

  // Fetch quotes in parallel
  const promises = symbols.map(async (symbol) => {
    try {
      // @ts-ignore - yahoo-finance2 typing issue
      const quote = await yahooFinance.quote(symbol);
      if (!quote || !quote.regularMarketPrice) {
        results[symbol] = null;
        return;
      }

      const price = quote.regularMarketPrice;
      const previousClose = quote.regularMarketPreviousClose || price;
      const changePercent =
        previousClose !== 0
          ? ((price - previousClose) / previousClose) * 100
          : 0;

      results[symbol] = {
        price,
        changePercent,
        dayRange: {
          low: quote.regularMarketDayLow || price,
          high: quote.regularMarketDayHigh || price,
        },
        fiftyTwoWeekRange: {
          low: quote.fiftyTwoWeekLow || price,
          high: quote.fiftyTwoWeekHigh || price,
        },
        marketCap: quote.marketCap,
        ts: Date.now(),
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      results[symbol] = null;
    }
  });

  await Promise.all(promises);
  return results;
}

export function mapQuote(data: any): Quote | null {
  if (!data || !data.regularMarketPrice) {
    return null;
  }

  const price = data.regularMarketPrice;
  const previousClose = data.regularMarketPreviousClose || price;
  const changePercent =
    previousClose !== 0 ? ((price - previousClose) / previousClose) * 100 : 0;

  return {
    price,
    changePercent,
    dayRange: {
      low: data.regularMarketDayLow || price,
      high: data.regularMarketDayHigh || price,
    },
    fiftyTwoWeekRange: {
      low: data.fiftyTwoWeekLow || price,
      high: data.fiftyTwoWeekHigh || price,
    },
    marketCap: data.marketCap,
    ts: Date.now(),
  };
}
