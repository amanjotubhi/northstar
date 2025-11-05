# Architecture

## System Overview

NorthStar is a Next.js 14+ application using the App Router pattern. It combines real-time market data with LLM-powered chat to generate stock allocation recommendations.

## Architecture Diagram

```mermaid
graph TB
    A[Next.js App Router] --> B[API Routes]
    B --> C[/api/market]
    B --> D[/api/chat]
    B --> E[/api/plan]
    
    C --> F[yahoo-finance2]
    F --> G[Indexes: ^IXIC, ES=F]
    F --> H[Stock Quotes]
    
    D --> I[LLM Adapter]
    I --> J[Anthropic Claude]
    I --> K[OpenAI GPT-4]
    I --> L[Ollama Local]
    
    D --> M[Market Context]
    M --> F
    
    E --> N[Allocator]
    N --> O[Risk Tiers]
    N --> P[Share Calculation]
    N --> Q[Cash Buffer]
    
    R[React Query] --> S[Client State]
    S --> T[Watchlist]
    S --> U[Chat Messages]
    S --> V[Allocation Plan]
    
    W[localStorage] --> S
```

## Data Flow

### Market Route (`/api/market`)

1. Client requests market data with optional `symbols` query parameter
2. Server fetches index snapshots for `^IXIC` and `ES=F` in parallel
3. Server fetches quotes for requested symbols (or defaults)
4. Returns combined JSON with indexes and quotes
5. Errors are handled gracefully, returning partial data with an errors array

### Chat Route (`/api/chat`)

1. Client sends `{ message, budget, risk }` in POST body
2. Server fetches market context (indexes + default quotes)
3. Builds compact JSON summary of market data
4. Constructs system prompt + user message with market context
5. Streams LLM response token by token
6. Client extracts JSON block from markdown in response
7. Client calls `/api/plan` with extracted tickers to compute shares

### Plan Route (`/api/plan`)

1. Client sends `{ budget, risk, tickers[] }` with weights
2. Server fetches current prices for all tickers
3. Allocator computes shares using floor rounding
4. Enforces 1–3% cash buffer
5. Normalizes weights based on actual allocations
6. Returns `{ tickers, shares, cashLeft, notes }`

## LLM Adapter

The LLM layer is provider-agnostic:

```
lib/llm/
├── index.ts          # Router and stream helpers
└── providers/
    ├── anthropic.ts  # Claude streaming
    ├── openai.ts     # GPT-4 streaming
    └── ollama.ts     # Local model streaming
```

**Provider Selection Logic**:
1. If `LLM_PROVIDER` env var is set, use that
2. Else if `ANTHROPIC_API_KEY` exists, use Anthropic
3. Else if `OPENAI_API_KEY` exists, use OpenAI
4. Else if `OLLAMA_MODEL` or `OLLAMA_URL` exists, use Ollama
5. Default fallback: Anthropic

**Streaming**: All providers use async generators that yield token strings, wrapped in a `ReadableStream` for Next.js Response.

## Allocator Math

**Risk Tiers**:
- **Medium**: `{ medium: 0.6, "medium-high": 0.3, high: 0.1 }`
- **Medium-High**: `{ medium: 0.35, "medium-high": 0.45, high: 0.2 }`
- **High**: `{ medium: 0.2, "medium-high": 0.4, high: 0.4 }`

**Share Calculation**:
1. Reserve 1–3% cash buffer (default: 2%)
2. Calculate investable budget: `budget * (1 - cashBufferPercent)`
3. Allocate per ticker: `investableBudget * tickerWeight`
4. Calculate shares: `Math.floor(allocation / tickerPrice)`
5. Re-normalize weights based on actual allocations
6. Compute leftover cash: `budget - totalAllocated`

**Floor Rounding**: Shares are always floored (never rounded up) to ensure we don't exceed budget.

## Error Handling

**Market Data**:
- Missing symbols return `null` in quotes object
- Index fetch failures return empty indexes object
- Errors array included in response for client handling

**LLM**:
- Missing API keys throw descriptive errors
- Streaming errors propagate to client
- Fallback to conservative two-ticker plan if JSON parsing fails

**Allocation**:
- Missing prices cause ticker to be dropped
- Empty ticker list returns plan with full budget as cash
- Invalid weights are normalized to sum to 1

## Client State

**React Query**:
- Market data cached for 30 seconds
- Automatic refetch on window focus disabled
- Optimistic updates for watchlist additions

**localStorage**:
- Persists `{ budget, risk, allocation }` across sessions
- Loaded on mount, saved on changes

**Streaming**:
- Uses `fetch` with `ReadableStream` reader
- Accumulates tokens in ref, updates message state
- Extracts JSON from markdown after stream completes
