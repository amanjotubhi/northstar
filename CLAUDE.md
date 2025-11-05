# AI Assist Disclosure

This repository was created with assistance from Claude (Anthropic) in Cursor IDE.

## What Claude Did

- **Code scaffolding**: Generated Next.js 14+ App Router structure, TypeScript configuration, and component boilerplate
- **Library implementation**: Created LLM adapter layer (Anthropic, OpenAI, Ollama), market data wrappers (yahoo-finance2), and allocation calculator
- **Documentation**: Wrote README, architecture diagrams (Mermaid), API documentation, and setup guides
- **DevOps setup**: Generated Dockerfile, docker-compose.yml, GitHub Actions workflows, and one-click run scripts
- **Pattern application**: Applied provider-agnostic LLM patterns, streaming response handling, and error boundaries

## What I Did

- **Design decisions**: Defined the "Apple-like" UI aesthetic, risk tier structure, and allocation math rules
- **Testing and refinement**: Validated market data fetching, tested streaming responses, verified share calculations
- **Deployment configuration**: Configured environment variables, Docker networking, and CI/CD secrets
- **Final polish**: Reviewed code quality, fixed type errors, optimized build configuration

## Transparency

All prompts used to build this repository are stored in [`/prompts`](./prompts) for full transparency. The build process and timeline are documented in [`/docs/build-log.md`](./docs/build-log.md).

This disclosure follows best practices for AI-assisted development transparency.
