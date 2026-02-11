# Setup Guide

## Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **pnpm** — install with `npm install -g pnpm` if needed

## Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

Copy the example file and configure:

```bash
cp .env.local.example .env.local
```

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_GEMINI_API_KEY` | Google Gemini API key (for real agent mode) | — |
| `NEXT_PUBLIC_AGENT_MODE` | `mock` or `real` | `mock` |

To get a Gemini API key, visit [Google AI Studio](https://aistudio.google.com/app/apikey).

## Available Commands

```bash
pnpm dev          # Start dev server (http://localhost:3000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm test         # Run test suite
pnpm test:watch   # Run tests in watch mode
pnpm lint         # Run ESLint
```

## Project Structure

```
app/
├── layout.tsx            # Root layout — wraps in SurfaceProvider + StyledComponents
├── page.tsx              # Main demo page with chat interface
├── globals.css           # CSS custom properties (light + dark mode)
└── api/agent/route.ts    # POST endpoint — streams A2UI JSONL from Gemini

src/
├── a2ui/
│   ├── types.ts          # A2UI v0.9 message type definitions
│   ├── catalog.ts        # Component catalog — maps A2UI names to React components
│   ├── constants.ts      # CATALOG_ID constant (safe for server imports)
│   ├── skeleton.tsx      # Loading skeleton components
│   ├── common_origin_catalog_definition.json  # JSON Schema 2020-12 for all 28 components
│   └── common_origin_catalog_rules.txt        # Natural language rules for LLM prompts
├── components/
│   ├── A2UISurface.tsx        # Core renderer — maintains surface state, renders tree
│   ├── A2UIErrorBoundary.tsx  # Error boundary for graceful rendering failures
│   └── SurfaceContext.tsx     # React context for surface registration/dispatch
├── lib/
│   ├── agentClient.ts         # Client-side agent abstraction (mock/real, retry, fallback)
│   ├── messageValidator.ts    # Structural validation + DoS limits
│   ├── catalogValidator.ts    # Component prop validation against JSON Schema
│   ├── logger.ts              # Lightweight structured logger
│   └── registry.tsx           # Styled-components SSR integration for Next.js
└── server/
    ├── mockAgent.ts           # Mock agent — 10 AU banking transactions, 3 scenarios
    ├── queryRouter.ts         # NL query → scenario classifier with entity extraction
    ├── spendingSummaryAgent.ts # Gemini agent for spending summary scenario
    ├── fundTransferAgent.ts   # Gemini agent for fund transfer scenario
    ├── systemPrompt.ts        # Shared system prompt builder
    └── prompts/               # Scenario-specific LLM prompt templates

vendor/a2ui/                   # Vendored A2UI specification (reference only)
```

## Design System Dependency

This project depends on `@common-origin/design-system` (^2.4.0). The design system provides the actual React components that the A2UI catalog maps to. Ensure you have access to the Common Origin npm registry.

## Troubleshooting

### Build fails with `createContext` error
The `CATALOG_ID` constant must be imported from `src/a2ui/constants.ts` (not `catalog.ts`) in server-side code. This avoids pulling React client imports into server API routes.

### Gemini agent returns malformed JSON
The mock agent is used as an automatic fallback. Set `NEXT_PUBLIC_AGENT_MODE=mock` to use only the mock agent while debugging.

### Tests fail with module resolution errors
Ensure `vitest.config.ts` has path aliases matching `tsconfig.json`:
```ts
resolve: {
  alias: {
    '@': path.resolve(__dirname),
    '@/src': path.resolve(__dirname, 'src'),
  },
},
```
