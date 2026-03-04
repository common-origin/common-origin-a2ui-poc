# A2UI + Common Origin Design System POC

A demonstration of agent-generated UI using [A2UI v0.9](https://a2ui.org) (Agent to UI), rendered through a trusted component catalog mapped to the [Common Origin Design System](https://github.com/common-origin/common-origin-design-system).

## Overview

This project implements a secure, declarative approach to agent-generated interfaces:

- **Agents send data, not code** — UI is described in declarative JSON (A2UI messages), preventing code injection
- **Catalog-based rendering** — Only pre-approved components from a 28-component catalog can be rendered
- **Prompt-Generate-Validate** — LLM output is validated against a formal JSON Schema before rendering
- **Framework mapping** — A2UI component names map 1:1 to Common Origin React components
- **Incremental streaming** — UI updates progressively as the agent generates messages

### Banking Demo

The demo showcases three banking scenarios, driven by natural language queries:

| Scenario | Example Query | Components Used |
|----------|--------------|-----------------|
| Transaction Search | "Find my Woolworths transactions" | TransactionListItem, DateGroup, SearchField, FilterChip |
| Spending Summary | "Show spending summary" | Card, CategoryBadge, MoneyDisplay, Progress |
| Fund Transfer | "Transfer $100 to savings" | AccountCard, NumberField, Select, Button, Modal |

## Architecture

```
┌─────────────────┐
│  Agent (Mock     │  Generates A2UI v0.9 JSONL messages
│  or Gemini)     │
└────────┬────────┘
         │ A2UI Messages (JSON)
         ▼
┌─────────────────┐
│  Message        │  Validates structure, DoS limits, catalog schema
│  Validator      │
└────────┬────────┘
         │ Validated messages
         ▼
┌─────────────────┐
│  A2UI Surface   │  Maintains component tree + data model state
└────────┬────────┘
         │ Component nodes
         ▼
┌─────────────────┐
│ Catalog Layer   │  Security boundary — 28 whitelisted components
│                 │  URL sanitisation, depth limits, prop mapping
└────────┬────────┘
         │ React elements
         ▼
┌─────────────────┐
│ Common Origin   │  Actual React components rendered to DOM
│ Design System   │
└─────────────────┘
```

### Security Layers

1. **Message validation** — Structure checks, DoS limits (100 components, 50 children, 50KB data model, depth 10)
2. **Catalog validation** — Components validated against JSON Schema (required props, enum values, unknown props)
3. **URL sanitisation** — Blocks `javascript:`, `data:text/html`, and other injection vectors
4. **Whitelist rendering** — Only components in `VALID_COMPONENT_TYPES` are rendered; unknown types are silently dropped

## A2UI v0.9 Message Format

### 1. Create Surface
```json
{"createSurface":{"surfaceId":"main","catalogId":"common-origin.design-system:v2.4"}}
```

### 2. Update Components
```json
{"updateComponents":{"surfaceId":"main","components":[
  {"id":"root","component":"Stack","direction":"column","gap":"lg","children":["h1","list"]},
  {"id":"h1","component":"Text","text":"Recent Transactions","variant":"h2"},
  {"id":"list","component":"List","children":["tx1"]}
]}}
```

### 3. Update Data Model
```json
{"updateDataModel":{"surfaceId":"main","value":{"query":"Woolworths","totalAmount":-87.43}}}
```

### 4. Delete Surface
```json
{"deleteSurface":{"surfaceId":"main"}}
```

## Catalog Components (28)

| Category | Component | Description |
|----------|-----------|-------------|
| **Typography** | `Text` | Typography with 8 variants (h1–h4, body, caption, label, overline) |
| **Feedback** | `Alert` | Alert banner with info/success/warning/error variants |
| | `EmptyState` | Empty state with illustration, title, description, CTA |
| **Layout** | `Stack` | Flex container with direction, gap, alignment |
| | `Divider` | Visual separator (horizontal/vertical) |
| **Input** | `TextField` | Text input with label, validation, helper text |
| | `SearchField` | Search input with autocomplete and debouncing |
| | `NumberField` | Numeric input with min/max constraints |
| | `Select` | Dropdown with typed options |
| | `Checkbox` | Boolean toggle input |
| **Action** | `Button` | 4 variants (primary/secondary/ghost/destructive) × 3 sizes |
| | `Chip` | Display chip with variant/size options |
| | `FilterChip` | Dismissible filter chip |
| | `BooleanChip` | Toggle chip for boolean filters |
| **Navigation** | `TabBar` | Tab navigation with 3 visual styles and badge counts |
| **Container** | `Card` | Content card with title, excerpt, labels |
| | `List` | List container with divider/spacing options |
| | `ListItem` | List item with primary/secondary text, badge, icon |
| | `DateGroup` | Date-grouped container with header and total |
| **Banking** | `MoneyDisplay` | Formatted currency display with positive/negative colouring |
| | `TransactionListItem` | Rich transaction item (merchant, amount, status, category) |
| | `AccountCard` | Account summary with balance, trend, actions |
| | `CategoryBadge` | Category indicator with 8 colour options |
| | `StatusBadge` | Transaction status badge (pending/completed/failed/etc.) |
| **Overlay** | `Modal` | Confirmation dialog |
| | `ActionSheet` | Mobile-optimised bottom sheet menu |
| **Feedback** | `Progress` | Progress indicator with percentage |
| | `Skeleton` | Loading placeholder with multiple variants |

## Project Structure

```
common-origin-a2ui-poc/
├── app/
│   ├── layout.tsx                 # Root layout (SurfaceProvider + SC registry)
│   ├── page.tsx                   # Demo page with chat interface
│   ├── globals.css                # CSS variables (light + dark mode)
│   └── api/agent/route.ts         # Streaming API endpoint for agents
├── src/
│   ├── a2ui/
│   │   ├── types.ts               # A2UI message type definitions (v0.9)
│   │   ├── catalog.ts             # Component catalog + security boundary
│   │   ├── constants.ts           # Server-safe constants (CATALOG_ID)
│   │   ├── skeleton.tsx           # Skeleton loading state components
│   │   ├── common_origin_catalog_definition.json  # JSON Schema for catalog
│   │   └── common_origin_catalog_rules.txt        # LLM prompt rules
│   ├── components/
│   │   ├── A2UISurface.tsx        # A2UI renderer with state management
│   │   ├── A2UIErrorBoundary.tsx  # Error boundary for safe rendering
│   │   └── SurfaceContext.tsx     # React context for surface state
│   ├── lib/
│   │   ├── agentClient.ts         # Client-side agent interface (mock/real)
│   │   ├── messageValidator.ts    # A2UI message validation + DoS limits
│   │   ├── catalogValidator.ts    # Deep component prop validation
│   │   ├── logger.ts              # Structured logging
│   │   └── registry.tsx           # Styled-components SSR registry
│   └── server/
│       ├── mockAgent.ts           # Mock agent with AU banking data
│       ├── queryRouter.ts         # NL query → scenario routing
│       ├── spendingSummaryAgent.ts # Gemini spending summary agent
│       ├── fundTransferAgent.ts   # Gemini fund transfer agent
│       └── systemPrompt.ts        # Shared Gemini system prompt
├── vendor/a2ui/                   # Reference A2UI specification
├── vitest.config.ts               # Test configuration
├── package.json
└── tsconfig.json
```

## Setup

### Requirements

- Node.js 18+
- pnpm

### Installation

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

For real Gemini agent integration, create `.env.local`:

```bash
GEMINI_API_KEY=your_api_key_here
NEXT_PUBLIC_AGENT_MODE=mock   # or 'real'
```

`NEXT_PUBLIC_GEMINI_API_KEY` is supported as a fallback, but `GEMINI_API_KEY` is recommended for production/live demos.

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Production build |
| `pnpm start` | Start production server |
| `pnpm test` | Run test suite (Vitest) |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm lint` | Run ESLint |

## Adding a New Catalog Component

### 1. Define in JSON Schema

Add the component definition to `src/a2ui/common_origin_catalog_definition.json`:

```json
{
  "MyWidget": {
    "type": "object",
    "required": ["id", "component", "title"],
    "properties": {
      "id": { "type": "string" },
      "component": { "const": "MyWidget" },
      "title": { "$ref": "#/$defs/stringOrPath" },
      "variant": { "enum": ["default", "compact"] }
    },
    "additionalProperties": false
  }
}
```

### 2. Add Rendering Logic

In `src/a2ui/catalog.ts`, add a case to the `renderNode` switch:

```typescript
case 'MyWidget': {
  const title = resolveBinding(node.title as StringOrPath, dm);
  return React.createElement(MyWidgetComponent, {
    key: id,
    title,
    variant: node.variant || 'default',
  });
}
```

### 3. Add to Valid Types

In `src/a2ui/catalog.ts`, add `'MyWidget'` to `VALID_COMPONENT_TYPES`.

### 4. Add to LLM Rules

Update `src/a2ui/common_origin_catalog_rules.txt` with usage instructions for the LLM.

### 5. Write Tests

Add tests in `src/a2ui/catalog.test.ts` and `src/lib/catalogValidator.test.ts`.

## Testing

The project uses Vitest with 62 tests across 4 test files:

- **`src/lib/messageValidator.test.ts`** — Message structure, DoS limits, catalog warnings
- **`src/lib/catalogValidator.test.ts`** — Component prop validation, enum checks
- **`src/server/queryRouter.test.ts`** — Query routing, entity extraction
- **`src/a2ui/catalog.test.ts`** — URL sanitisation, component whitelist, metadata

```bash
pnpm test
```

## Resources

- [A2UI Specification v0.9](vendor/a2ui/specification/0.9/)
- [A2UI Blog Post](https://developers.googleblog.com/introducing-a2ui-an-open-project-for-agent-driven-interfaces/)
- [Common Origin Design System](https://github.com/common-origin/common-origin-design-system)
- [Google A2UI Repository](https://github.com/google/a2ui)

## License

MIT
