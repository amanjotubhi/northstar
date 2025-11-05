"use client";

import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";

interface TickerCardProps {
  symbol: string;
  price: number;
  changePercent: number;
  onRemove?: () => void;
}

export function TickerCard({
  symbol,
  price,
  changePercent,
  onRemove,
}: TickerCardProps) {
  const isPositive = changePercent >= 0;

  return (
    <div
      className={cn(
        "p-4 rounded-2xl bg-card border border-border",
        "shadow-sm hover:shadow-md transition-shadow duration-200"
      )}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-lg">{symbol}</h3>
          <p className="text-2xl font-bold mt-1">
            ${price.toFixed(2)}
          </p>
        </div>
        {onRemove && (
          <button
            onClick={onRemove}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label={`Remove ${symbol}`}
          >
            ×
          </button>
        )}
      </div>
      <div
        className={cn(
          "flex items-center gap-1 text-sm font-medium",
          isPositive ? "text-green-500" : "text-red-500"
        )}
      >
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        <span>{isPositive ? "+" : ""}{changePercent.toFixed(2)}%</span>
      </div>
      {/* Simple sparkline placeholder - in a real app, you'd use a charting library */}
      <div className="mt-3 h-8 bg-muted rounded-lg opacity-50" />
    </div>
  );
}
