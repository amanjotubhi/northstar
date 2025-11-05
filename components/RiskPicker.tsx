"use client";

import { cn } from "@/lib/utils";

export type RiskTier = "medium" | "medium-high" | "high";

interface RiskPickerProps {
  value: RiskTier;
  onChange: (risk: RiskTier) => void;
}

export function RiskPicker({ value, onChange }: RiskPickerProps) {
  const options: { value: RiskTier; label: string }[] = [
    { value: "medium", label: "Medium" },
    { value: "medium-high", label: "Medium-High" },
    { value: "high", label: "High" },
  ];

  return (
    <div className="flex gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary",
            value === option.value
              ? "bg-primary text-primary-foreground shadow-md"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
