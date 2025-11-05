"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { BudgetInput } from "./BudgetInput";
import { RiskPicker, type RiskTier } from "./RiskPicker";
import { type AllocationData } from "./AllocationCard";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatProps {
  budget: number;
  risk: RiskTier;
  onBudgetChange: (value: number) => void;
  onRiskChange: (risk: RiskTier) => void;
  onAllocationChange: (allocation: AllocationData | null) => void;
}

export function Chat({
  budget,
  risk,
  onBudgetChange,
  onRiskChange,
  onAllocationChange,
}: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingMessageRef = useRef<string>("");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const extractJSONFromMarkdown = (text: string): any | null => {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse JSON from markdown:", e);
      }
    }
    return null;
  };

  const computePlan = async (tickers: Array<{ symbol: string; weight: number }>) => {
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget, risk, tickers }),
      });
      const planData = await res.json();
      onAllocationChange(planData);
    } catch (error) {
      console.error("Error computing plan:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    if (!input.trim() || isStreaming) return;

    e.preventDefault();
    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsStreaming(true);
    streamingMessageRef.current = "";

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          budget,
          risk,
        }),
      });

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        streamingMessageRef.current += chunk;

        // Update the streaming message
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return [...prev.slice(0, -1), { role: "assistant", content: streamingMessageRef.current }];
          }
          return [...prev, { role: "assistant", content: streamingMessageRef.current }];
        });
      }

      // Extract JSON and compute plan
      const jsonData = extractJSONFromMarkdown(streamingMessageRef.current);
      if (jsonData?.tickers) {
        await computePlan(jsonData.tickers);
      }
    } catch (error) {
      console.error("Error streaming chat:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsStreaming(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h1 className="text-2xl font-bold mb-4">NorthStar</h1>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Budget</label>
            <BudgetInput value={budget} onChange={onBudgetChange} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Risk Level</label>
            <RiskPicker value={risk} onChange={onRiskChange} />
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <p className="text-lg mb-2">Welcome to NorthStar</p>
            <p className="text-sm">
              Ask me about the market and get stock ideas based on your budget
              and risk tolerance.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={cn(
              "rounded-2xl p-4 max-w-[80%]",
              msg.role === "user"
                ? "bg-primary text-primary-foreground ml-auto"
                : "bg-muted"
            )}
          >
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}

        {messages.length > 0 && (
          <div className="text-xs text-muted-foreground italic mt-4 pt-4 border-t border-border">
            * NorthStar is an educational tool and does not provide personalized
            financial advice. All investments carry risk.
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="p-6 border-t border-border bg-background"
      >
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask NorthStar for stock ideas..."
            className="flex-1 px-4 py-3 rounded-2xl bg-muted border border-input focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="px-6 py-3 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 font-medium"
          >
            <Send className="w-4 h-4" />
            Ask NorthStar
          </button>
        </div>
      </form>
    </div>
  );
}
