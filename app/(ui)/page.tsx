"use client";

import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar } from "@/components/Sidebar";
import { Chat } from "@/components/Chat";
import { AllocationCard, type AllocationData } from "@/components/AllocationCard";
import { type RiskTier } from "@/components/RiskPicker";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function Home() {
  const [budget, setBudget] = useState(2500);
  const [risk, setRisk] = useState<RiskTier>("medium-high");
  const [allocation, setAllocation] = useState<AllocationData | null>(null);

  // Load persisted session from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("northstar-session");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.budget) setBudget(data.budget);
        if (data.risk) setRisk(data.risk);
        if (data.allocation) setAllocation(data.allocation);
      } catch (e) {
        console.error("Failed to load session:", e);
      }
    }
  }, []);

  // Persist session
  useEffect(() => {
    localStorage.setItem(
      "northstar-session",
      JSON.stringify({ budget, risk, allocation })
    );
  }, [budget, risk, allocation]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen w-screen flex overflow-hidden bg-background">
        {/* Left Sidebar - Watchlist */}
        <aside className="w-80 border-r border-border flex-shrink-0">
          <Sidebar />
        </aside>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0">
          <Chat
            budget={budget}
            risk={risk}
            onBudgetChange={setBudget}
            onRiskChange={setRisk}
            onAllocationChange={setAllocation}
          />
        </main>

        {/* Right Panel - Allocation Card */}
        <aside className="w-96 border-l border-border flex-shrink-0 p-6 overflow-y-auto">
          <AllocationCard data={allocation} budget={budget} />
        </aside>
      </div>
    </QueryClientProvider>
  );
}
