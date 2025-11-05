import { NextRequest } from "next/server";
import { z } from "zod";
import { getIndexSnapshot, getQuotes } from "@/lib/market/yahoo";
import { chatLLM, createStreamResponse } from "@/lib/llm";
import { buildPlan } from "@/lib/reco/allocator";

const chatSchema = z.object({
  message: z.string().min(1),
  budget: z.number().positive(),
  risk: z.enum(["medium", "medium-high", "high"]),
});

const SYSTEM_PROMPT = `You are NorthStar, an educational market chat companion. You help the user brainstorm stock ideas using live market context. You must 1) restate the user's budget and risk tier, 2) propose 4–8 tickers with a simple allocation table, 3) explain three short reasons tied to current index context and each ticker's profile, 4) compute estimated shares and leftover cash, 5) add a one-sentence risk note. Never provide personalized financial advice. If data for a ticker is missing or stale, replace it and say so briefly.

Format your response as natural text, but end with a JSON block like this:

\`\`\`json
{
  "tickers": [
    {"symbol": "AAPL", "weight": 0.25},
    {"symbol": "MSFT", "weight": 0.25}
  ],
  "rationale": ["Reason 1", "Reason 2", "Reason 3"]
}
\`\`\`

The JSON must include tickers with symbols and weights (0-1), and rationale as an array of strings.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, budget, risk } = chatSchema.parse(body);

    // Fetch market data
    const [nasdaq, esMini] = await Promise.all([
      getIndexSnapshot("^IXIC"),
      getIndexSnapshot("ES=F"),
    ]);

    const defaultSymbols = [
      "AAPL",
      "MSFT",
      "NVDA",
      "AMD",
      "TSLA",
      "META",
      "GOOGL",
      "AMZN",
      "SMCI",
      "AVGO",
    ];
    const quotes = await getQuotes(defaultSymbols);

    // Build market context JSON
    const marketContext = {
      indexes: {
        "^IXIC": nasdaq,
        "ES=F": esMini,
      },
      quotes: Object.fromEntries(
        Object.entries(quotes).filter(([_, v]) => v !== null)
      ),
    };

    const userContent = `Budget: $${budget.toFixed(2)}
Risk tier: ${risk}
User message: ${message}

Current market context:
${JSON.stringify(marketContext, null, 2)}

Please provide stock recommendations following the format specified.`;

    // Stream LLM response
    const stream = chatLLM(
      [{ role: "user", content: userContent }],
      SYSTEM_PROMPT
    );

    const readableStream = createStreamResponse(stream);

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
