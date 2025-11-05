# NorthStar

A calm, "Apple-like" market peer that turns your budget and risk into live-context stock ideas.

[![CI](https://img.shields.io/github/actions/workflow/status/amanjotubhi/northstar/ci.yml?label=build&branch=main)](https://github.com/amanjotubhi/northstar/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with Claude](https://img.shields.io/badge/Built%20with-Claude-8A2BE2)](https://www.anthropic.com)
[![Docker](https://img.shields.io/badge/Docker-ready-blue)](https://www.docker.com)
[![Vercel](https://img.shields.io/badge/Vercel-ready-black)](https://vercel.com)

## Demo

**Local**: `npm run dev` → http://localhost:3000  
**Docker**: `docker-compose up` → http://localhost:3000  
**Live Demo**: _Coming soon_ (add your Vercel/netlify URL)

## What It Does

NorthStar is an educational market chat companion that:

- **Chats about the market** using live NASDAQ Composite (^IXIC) and E-mini S&P futures (ES=F) context
- **Proposes 4–8 tickers** based on your budget and risk tier (medium, medium-high, high)
- **Calculates estimated shares** with floor rounding and a 1–3% cash buffer
- **Explains rationale** tied to current index context and each ticker's profile
- **Exports JSON plans** for your records

**⚠️ Disclaimer**: NorthStar is an educational tool and does not provide personalized financial advice. All investments carry risk. This is not a trading advisor.

## Key Features

- **Live index tiles**: NASDAQ and ES Mini watchlist with real-time prices, percent change, and sparklines
- **Watchlist management**: Add/remove tickers with optimistic UI and graceful error handling
- **Risk tiers**: Three levels (medium, medium-high, high) with default allocation weights
- **Streaming chat**: Real-time token streaming from Claude (default), OpenAI, or Ollama
- **Clean three-column layout**: Watchlist • Chat • Allocation summary
- **DevOps ready**: Dockerfile, docker-compose, GitHub Actions CI, one-click run scripts

## Architecture

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

**Data Flow**:
1. Client fetches market data (`/api/market`) on load
2. User sets budget and risk tier, sends chat message
3. Server fetches indexes and quotes, builds market context
4. LLM streams response with ticker recommendations (JSON block)
5. Client extracts JSON, calls `/api/plan` for share calculations
6. Allocation card displays tickers, weights, shares, cash left

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS
- **UI**: shadcn/ui patterns, Lucide icons, Framer Motion
- **Market Data**: yahoo-finance2
- **LLM**: Anthropic Claude (default), OpenAI GPT-4, Ollama (local)
- **State**: React Query, localStorage
- **Validation**: Zod
- **Testing**: Vitest
- **DevOps**: Docker, GitHub Actions

## API Overview

### Market Data

```bash
GET /api/market?symbols=AAPL,NVDA
```

**Response**:
```json
{
  "indexes": {
    "^IXIC": { "price": 15000.00, "changePercent": 0.5, "ts": 1234567890 },
    "ES=F": { "price": 4500.00, "changePercent": -0.2, "ts": 1234567890 }
  },
  "quotes": {
    "AAPL": {
      "price": 175.50,
      "changePercent": 1.2,
      "dayRange": { "low": 174.00, "high": 176.00 },
      "fiftyTwoWeekRange": { "low": 150.00, "high": 200.00 },
      "marketCap": 2800000000000,
      "ts": 1234567890
    }
  }
}
```

### Chat

```bash
POST /api/chat
Content-Type: application/json

{
  "message": "Give me stock ideas for tech growth",
  "budget": 2500,
  "risk": "medium-high"
}
```

**Response**: Streams text tokens. LLM includes a JSON block:
```json
{
  "tickers": [
    { "symbol": "AAPL", "weight": 0.25 },
    { "symbol": "MSFT", "weight": 0.25 }
  ],
  "rationale": ["Reason 1", "Reason 2", "Reason 3"]
}
```

### Plan Computation

```bash
POST /api/plan
Content-Type: application/json

{
  "budget": 2500,
  "risk": "medium-high",
  "tickers": [
    { "symbol": "AAPL", "weight": 0.25 },
    { "symbol": "MSFT", "weight": 0.25 }
  ]
}
```

**Response**:
```json
{
  "tickers": [
    { "symbol": "AAPL", "weight": 0.25 },
    { "symbol": "MSFT", "weight": 0.25 }
  ],
  "shares": [
    { "symbol": "AAPL", "shares": 4, "price": 175.50 },
    { "symbol": "MSFT", "shares": 2, "price": 300.00 }
  ],
  "cashLeft": 50.00,
  "notes": [
    "Allocated $2450.00 of $2500.00 budget",
    "Cash buffer: $50.00 (2.0%)"
  ]
}
```

## Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

**Required** (for Claude):
```
ANTHROPIC_API_KEY=sk-ant-...
```

**Optional**:
```
OPENAI_API_KEY=sk-...
LLM_PROVIDER=anthropic  # or openai, ollama
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b-instruct
```

## Quick Start

```bash
# Clone and install
git clone https://github.com/amanjotubhi/northstar.git
cd northstar
npm install

# Set up environment
cp .env.example .env
# Edit .env and add ANTHROPIC_API_KEY

# Run
npm run dev
# Open http://localhost:3000
```

### Docker

```bash
# Build
docker build -t northstar .

# Run
docker run -p 3000:3000 -e ANTHROPIC_API_KEY=sk-... northstar

# Or use docker-compose
docker-compose up --build
```

## One-Click Run

### Bash (macOS/Linux)

```bash
./run-northstar.sh
```

Or with a specific provider:
```bash
LLM_PROVIDER=ollama ./run-northstar.sh
```

### PowerShell (Windows)

```powershell
.\scripts\dev.ps1
```

Or with a provider:
```powershell
.\scripts\dev.ps1 -Provider openai
```

## Risk Policy

NorthStar speaks as an educational peer for learning. It never promises returns or suitability. Always includes a short disclaimer in answers.

**Risk Tiers**:
- **Medium**: Large caps and diversified ETFs (60% medium, 30% medium-high, 10% high)
- **Medium-High**: Sector leaders and high growth (35% medium, 45% medium-high, 20% high)
- **High**: Small caps or momentum names (20% medium, 40% medium-high, 40% high)

If a symbol is stale or missing, NorthStar drops or replaces it and explains briefly.

## Built with Claude

This repository was scaffolded and refined with Claude in Cursor IDE. The initial build prompt, architecture decisions, and documentation were developed through iterative AI-assisted development. See [`/prompts`](./prompts) for the full prompt history and [`/docs/build-log.md`](./docs/build-log.md) for a timeline of major steps.

**What Claude did**: Code scaffolding, boilerplate generation, README/diagram creation, provider adapter patterns  
**What I did**: Design choices, testing, deployment configuration, final refinements

For transparency, see [`CLAUDE.md`](./CLAUDE.md) for the full AI assist disclosure.

## Screenshots

| Landing Page | Chat Interface | Allocation Card |
|--------------|---------------|-----------------|
| ![Landing](./docs/screenshots/README-hero.png) | ![Chat](./docs/screenshots/chat.png) | ![Allocation](./docs/screenshots/allocation.png) |

**Dark Mode**: ![Dark Mode](./docs/screenshots/darkmode.png)

_Add your screenshots to `/docs/screenshots/` to see them here._

## Deploy

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Add environment variable: `ANTHROPIC_API_KEY`
4. Deploy

**Note**: Use Node.js runtime (not Edge) because `yahoo-finance2` requires Node.js APIs.

### Docker on Any VM

```bash
# Build
docker build -t northstar .

# Run
docker run -d \
  -p 3000:3000 \
  -e ANTHROPIC_API_KEY=sk-... \
  --name northstar \
  northstar
```

### Self-Hosted

```bash
# Install dependencies
npm ci

# Build
npm run build

# Start
npm start
```

## Development

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Testing
npm test

# Build
npm run build
```

## License

MIT License - see [LICENSE](./LICENSE) file for details.

---

**Made with care** • [Report a bug](https://github.com/amanjotubhi/northstar/issues) • [Request a feature](https://github.com/amanjotubhi/northstar/issues)