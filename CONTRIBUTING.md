# Contributing to NorthStar

Thank you for your interest in contributing to NorthStar!

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/amanjotubhi/northstar.git`
3. Install dependencies: `npm install`
4. Copy `.env.example` to `.env` and add your API keys
5. Run the dev server: `npm run dev`

## Development Workflow

1. Create a branch: `git checkout -b feature/your-feature-name`
2. Make your changes
3. Run type checking: `npm run typecheck`
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Commit your changes (see [Commit Style](#commit-style))
7. Push and create a pull request

## Coding Style

- **TypeScript**: Use strict mode, prefer types over interfaces for simple objects
- **React**: Use functional components with hooks, prefer `"use client"` for client components
- **Naming**: camelCase for variables/functions, PascalCase for components
- **Formatting**: Use Prettier (runs on save)
- **Imports**: Group by external → internal, use `@/` alias for internal imports

## Commit Style

Use conventional commits format:

```
feat: add dark mode toggle
fix: handle missing market data gracefully
docs: update API examples
test: add allocator edge case tests
refactor: simplify LLM provider selection
```

## Pull Request Process

1. Update documentation if needed
2. Add tests for new features
3. Ensure all checks pass (CI)
4. Request review from maintainers
5. Address feedback and update PR

## Areas for Contribution

- **UI/UX improvements**: Better error states, loading indicators, accessibility
- **Market data**: Additional data sources, better error handling
- **LLM integration**: New providers, prompt optimization
- **Testing**: More test coverage, E2E tests
- **Documentation**: API docs, tutorials, examples

## Questions?

Open an issue or start a discussion. We're here to help!
