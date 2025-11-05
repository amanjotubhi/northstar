"use client";

import { cn } from "@/lib/utils";
import { Download } from "lucide-react";

export interface AllocationData {
  tickers: Array<{ symbol: string; weight: number }>;
  shares: Array<{ symbol: string; shares: number; price: number }>;
  cashLeft: number;
  notes?: string[];
}

interface AllocationCardProps {
  data: AllocationData | null;
  budget: number;
}

export function AllocationCard({ data, budget }: AllocationCardProps) {
  if (!data || data.tickers.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Allocation Plan</h2>
        <p className="text-muted-foreground text-sm">
          Ask NorthStar for recommendations to see your allocation plan here.
        </p>
      </div>
    );
  }

  const handleExport = () => {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `northstar-plan-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 rounded-2xl bg-card border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Allocation Plan</h2>
        <button
          onClick={handleExport}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
          aria-label="Export plan as JSON"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          {data.tickers.map((ticker) => {
            const shareData = data.shares.find((s) => s.symbol === ticker.symbol);
            return (
              <div
                key={ticker.symbol}
                className="p-3 rounded-xl bg-muted/50 border border-border"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium">{ticker.symbol}</span>
                  <span className="text-sm text-muted-foreground">
                    {(ticker.weight * 100).toFixed(1)}%
                  </span>
                </div>
                {shareData && (
                  <div className="text-sm text-muted-foreground">
                    {shareData.shares} shares @ ${shareData.price.toFixed(2)} = $
                    {(shareData.shares * shareData.price).toFixed(2)}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Cash Remaining:</span>
            <span className="font-medium">${data.cashLeft.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Allocated:</span>
            <span className="font-medium">
              ${(budget - data.cashLeft).toFixed(2)}
            </span>
          </div>
        </div>

        {data.notes && data.notes.length > 0 && (
          <div className="pt-4 border-t border-border">
            <ul className="space-y-1">
              {data.notes.map((note, idx) => (
                <li key={idx} className="text-sm text-muted-foreground">
                  • {note}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
