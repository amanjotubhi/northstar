"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface BudgetInputProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function BudgetInput({ value, onChange, className }: BudgetInputProps) {
  const [displayValue, setDisplayValue] = useState(value.toString());

  useEffect(() => {
    setDisplayValue(value.toString());
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value.replace(/[^0-9.]/g, "");
    setDisplayValue(input);

    const numValue = parseFloat(input);
    if (!isNaN(numValue) && numValue > 0) {
      onChange(numValue);
    }
  };

  const handleBlur = () => {
    const numValue = parseFloat(displayValue);
    if (isNaN(numValue) || numValue <= 0) {
      setDisplayValue(value.toString());
    } else {
      setDisplayValue(numValue.toFixed(2));
    }
  };

  return (
    <div className={cn("relative", className)}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        $
      </span>
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="0.00"
        className={cn(
          "w-full pl-8 pr-4 py-2 rounded-xl",
          "bg-background border border-input",
          "text-foreground placeholder:text-muted-foreground",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
          "transition-all duration-200"
        )}
      />
    </div>
  );
}
