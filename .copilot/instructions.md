# A2UI Banking Demo — Copilot Project Instructions

> This file provides persistent context for every AI-assisted session. Read this before making any changes.

## Project Purpose

This is a **demonstration project** showing how AI agents can render banking UI using a design system's component catalog. It proves that **design system patterns** are the governance layer for agentic experiences — agents compose pre-defined, validated UI patterns rather than generating arbitrary HTML.

- **Owner**: Ollie Macky, Principal Designer, Elevate Design System, NAB Melbourne
- **Audience**: Elevate design system team, DS leadership, product leadership at NAB
- **Design system**: Common Origin Design System v2.4 (`@common-origin/design-system`)
- **Strategic goal**: Demonstrate that patterns and design systems are critical for the future of banking UX

## Architecture

```
User prompt (text/voice) → Query Router → Agent (Gemini AI or Mock)
→ JSONL stream of A2UI v0.9 messages
→ Message Validator (DoS limits, structure)
→ Catalog Validator (props against JSON Schema)
→ A2UISurface (React state management)
→ Catalog renderNode() (maps to DS components)
→ Design System renders to DOM
→ User interaction → Action feedback → Agent (new turn)
```

### Key Files

| Purpose | File |
|---------|------|
| Component catalog (security boundary) | `src/a2ui/catalog.ts` |
| Catalog JSON Schema definition | `src/a2ui/common_origin_catalog_definition.json` |
| Catalog plaintext rules | `src/a2ui/common_origin_catalog_rules.txt` |
| A2UI types (messages, components, data binding) | `src/a2ui/types.ts` |
| Surface state manager | `src/components/A2UISurface.tsx` |
| Surface React context | `src/components/SurfaceContext.tsx` |
| Message validator | `src/lib/messageValidator.ts` |
| Catalog validator | `src/lib/catalogValidator.ts` |
| Agent client (mock/real routing) | `src/lib/agentClient.ts` |
| API route (Gemini) | `app/api/agent/route.ts` |
| System prompt builder | `src/server/systemPrompt.ts` |
| Scenario prompts | `src/server/prompts/*.ts` |
| Query router | `src/server/queryRouter.ts` |
| Main page | `app/page.tsx` |
| Strategy & plan | `STRATEGY.md` |
| Demo script | `DEMO.md` |

## Common Origin Design System Protocol

### Checking Component APIs

**Always check the DS type definitions before modifying catalog rendering:**

```
node_modules/@common-origin/design-system/dist/components/atoms/<Component>/<Component>.d.ts
node_modules/@common-origin/design-system/dist/components/molecules/<Component>/<Component>.d.ts
```

A generated API reference is at `docs/design-system-api.md`. Regenerate when the DS version is bumped.

### When the DS Doesn't Have What We Need

1. Check `docs/design-system-api.md` to confirm the gap
2. Add an entry to `docs/design-system-feedback.md` with: need, current state, gap, impact, and a prompt for the DS project
3. Implement a workaround in the demo (with a `// DS-FEEDBACK: <description>` comment linking to the feedback entry)
4. Do NOT modify `node_modules/` — all workarounds go in our catalog layer

### Component Name Mapping

The A2UI catalog uses names that sometimes differ from thr DS export names:

| A2UI Catalog Name | DS Component |
|-------------------|-------------|
| `Text` | `Typography` |
| `Card` | `CardLarge` |
| `Select` | `Dropdown` |
| `NumberField` | `NumberInput` |
| `Modal` | `Sheet` |
| `Progress` | `ProgressBar` (wrapped with label) |

## Conventions

### A2UI v0.9 Message Format

- **Flat discriminator**: `{ id, component: "Text", text: "Hello" }` — NOT nested
- **Children by ID**: `children: ["child1", "child2"]` — adjacency list, never inline
- **Data binding**: Literal values OR `{ path: "/json/pointer" }` (RFC 6901)
- **Actions**: v0.9 format: `{ name: "action_name", context: [{ key, value }] }` — prefer this over legacy `{ eventType, dataPath }` format

### Action Format (v0.9 — preferred)

All interactive components should use:
```json
{ "action": { "name": "confirm_transfer", "context": [{ "key": "amount", "value": { "path": "/transfer/amount" } }] } }
```

Legacy `onChange: { eventType, dataPath }` format exists for form controls but should be migrated.

### Testing

- Framework: Vitest 4.x
- Run: `pnpm test`
- Test files: `src/**/*.test.ts` or `src/**/*.test.tsx`
- **All rendering changes need tests** — use `@testing-library/react` with `jsdom` environment
- **All new utility functions need unit tests**
- Environment: `node` for logic tests, `jsdom` for rendering tests (use `// @vitest-environment jsdom` directive)

### Quality Bar

- **Fund Transfer flow** is the reference standard (form → review → confirm → success)
- Quality checklist in `docs/quality-checklist.md`
- No blank flashes between screens
- Loading states during action follow-ups
- Smooth transitions between surface states
- Consistent Australian banking data (Sarah Chen persona, Melbourne, AUD)

### Code Style

- TypeScript strict mode
- `ComponentNode` uses `[prop: string]: any` deliberately — security boundary is in `renderNode()`, not types
- styled-components for page-level layout
- DS components handle their own styling
- No Tailwind for component styling (imported but minimally used)

## Strategic Context

See `STRATEGY.md` for the full plan. Key phases:
1. Project setup & context files ← **current**
2. Testing foundation
3. Fund Transfer flow polish (demo-ready)
4. Apply quality standard to remaining flows
5. Voice input
6. Pattern definition layer
7. Personalisation (visual demo)
8. Agentic pattern library & feedback loop
