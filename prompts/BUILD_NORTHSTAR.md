# NorthStar Build Prompts

This document contains the prompts used to build NorthStar from scratch.

## Prompt 1: Initial Build (System + User Prompt)

**Timestamp**: Initial build session

**What it produced**: Complete Next.js application structure, API routes, components, LLM adapters, market data integration, allocation calculator, Docker setup, CI workflows

### System Context
You are an expert full-stack engineer and product designer. Build a minimal, beautiful "Apple-like" app called NorthStar that lets a user chat about the current market and get medium to high risk stock ideas based on a budget. NorthStar is an educational peer, not a trading advisor.

### User Prompt
[Full initial build prompt from the original request - see conversation history for exact text]

---

## Prompt 2: Ollama Integration

**Timestamp**: After initial build

**What it produced**: Added Ollama provider adapter (`lib/llm/providers/ollama.ts`), updated LLM router to support local models, updated README with Ollama setup instructions

### User Prompt
"can't use OpenAI right now — what to do. if you also can't use Anthropic, run a local model with Ollama. add a tiny provider adapter (if it's not already in your repo). i can drop in a minimal lib/llm/providers/ollama.ts and a 3-line switch in lib/llm/index.ts so NorthStar calls your local model."

---

## Prompt 3: GitHub Repository Polish

**Timestamp**: Final polish for public release

**What it produced**: Comprehensive README with badges and diagrams, GitHub templates (issues, PRs, code of conduct), documentation structure, one-click run scripts, GitHub initialization script, AI disclosure documentation

### User Prompt
[Full repository polish prompt from current request]

---

## Notes

- All prompts were iterative, with refinement based on build output and testing
- TypeScript errors were resolved during development
- Webpack configuration was adjusted to handle yahoo-finance2 dependencies
- Final code quality was verified with type checking and linting
