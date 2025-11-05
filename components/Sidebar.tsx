"use client";

import { useState, useEffect } from "react";
import { TickerCard } from "./TickerCard";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface IndexData {
  price: number;
  changePercent: number;
  ts: number;
}

interface QuoteData {
  price: number;
  changePercent: number;
  dayRange: { low: number; high: number };
  fiftyTwoWeekRange: { low: number; high: number };
  marketCap?: number;
  ts: number;
}

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [indexes, setIndexes] = useState<Record<string, IndexData>>({});
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [watchlist, setWatchlist] = useState<string[]>(["^IXIC", "ES=F"]);
  const [newTicker, setNewTicker] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchMarketData = async (symbols?: string[]) => {
    try {
      const symbolsParam = symbols
        ? symbols.join(",")
        : watchlist.filter((s) => !s.startsWith("^") && s !== "ES=F").join(",");
      const url = `/api/market${symbolsParam ? `?symbols=${symbolsParam}` : ""}`;
      const res = await fetch(url);
      const data = await res.json();

      if (data.indexes) {
        setIndexes(data.indexes);
      }
      if (data.quotes) {
        setQuotes((prev) => ({ ...prev, ...data.quotes }));
      }
    } catch (error) {
      console.error("Error fetching market data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketData();
    const interval = setInterval(() => {
      fetchMarketData();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleAddTicker = async () => {
    const symbol = newTicker.trim().toUpperCase();
    if (!symbol || watchlist.includes(symbol)) {
      return;
    }

    setIsAdding(true);
    try {
      const res = await fetch(`/api/market?symbols=${symbol}`);
      const data = await res.json();

      if (data.quotes?.[symbol] || data.indexes?.[symbol]) {
        setWatchlist([...watchlist, symbol]);
        setNewTicker("");
        if (data.quotes?.[symbol]) {
          setQuotes((prev) => ({ ...prev, [symbol]: data.quotes[symbol] }));
        }
        if (data.indexes?.[symbol]) {
          setIndexes((prev) => ({ ...prev, [symbol]: data.indexes[symbol] }));
        }
      } else {
        alert(`Could not fetch data for ${symbol}. Please check the symbol.`);
      }
    } catch (error) {
      console.error("Error adding ticker:", error);
      alert(`Error adding ${symbol}. Please try again.`);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveTicker = (symbol: string) => {
    setWatchlist(watchlist.filter((s) => s !== symbol));
    if (symbol.startsWith("^") || symbol === "ES=F") {
      setIndexes((prev) => {
        const next = { ...prev };
        delete next[symbol];
        return next;
      });
    } else {
      setQuotes((prev) => {
        const next = { ...prev };
        delete next[symbol];
        return next;
      });
    }
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold mb-4">Watchlist</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTicker}
            onChange={(e) => setNewTicker(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddTicker();
              }
            }}
            placeholder="Add ticker..."
            className="flex-1 px-3 py-2 rounded-xl bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleAddTicker}
            disabled={isAdding || !newTicker.trim()}
            className="p-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            aria-label="Add ticker"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="text-center text-muted-foreground text-sm py-8">
            Loading market data...
          </div>
        ) : (
          <>
            {watchlist.map((symbol) => {
              const indexData = indexes[symbol];
              const quoteData = quotes[symbol];

              if (!indexData && !quoteData) {
                return null;
              }

              const data = indexData || quoteData;
              if (!data) return null;

              return (
                <div key={symbol} className="relative">
                  <TickerCard
                    symbol={symbol}
                    price={data.price}
                    changePercent={data.changePercent}
                    onRemove={
                      symbol !== "^IXIC" && symbol !== "ES=F"
                        ? () => handleRemoveTicker(symbol)
                        : undefined
                    }
                  />
                </div>
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
