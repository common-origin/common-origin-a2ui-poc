# Roadmap

## Current State

This POC demonstrates A2UI v0.9 integration with the Common Origin Design System for agent-generated banking UIs. It includes a 28-component catalog, mock + Gemini agent support, message validation, and catalog schema validation.

## Short-Term (This POC)

- [x] ~~Core A2UI v0.9 rendering pipeline~~
- [x] ~~28-component catalog mapped to Common Origin DS~~
- [x] ~~Three banking scenarios (transactions, spending, transfers)~~
- [x] ~~Message validation with DoS limits~~
- [x] ~~Catalog validation against JSON Schema~~
- [x] ~~URL sanitisation and tree depth limits~~
- [x] ~~React context for surface state management~~
- [x] ~~Dark mode support via CSS custom properties~~
- [x] ~~Test suite (62 tests, Vitest)~~
- [ ] Deploy to Vercel with stable URL
- [ ] Multi-turn conversation (agent context across messages)
- [ ] Mobile-responsive layout optimisation
- [ ] Accessibility audit (WCAG 2.1 AA)

## Medium-Term: Publishable Libraries

The A2UI + design system integration pattern should be extracted into reusable packages for the wider organisation.

### `@common-origin/a2ui-catalog`

A standalone, framework-agnostic package containing the catalog definition and validation logic.

**Contents:**
- `common_origin_catalog_definition.json` — JSON Schema 2020-12 defining all components
- `common_origin_catalog_rules.txt` — Natural language rules for LLM system prompts
- `validateComponent()` — Validate a single component node against the schema
- `validateComponentsMessage()` — Batch validation with summary
- `VALID_COMPONENT_TYPES` — Set of allowed component names
- `CATALOG_ID` — Canonical catalog identifier string

**Use cases:**
- LLM prompt engineering (include the schema + rules in system prompts)
- Server-side validation of agent output before sending to clients
- Client-side validation as a security layer
- Testing: verify agent output conforms to catalog

**Publishing:**
```
@common-origin/a2ui-catalog
├── dist/
│   ├── index.js          # CJS
│   ├── index.mjs         # ESM
│   └── index.d.ts        # TypeScript types
├── schema/
│   ├── catalog_definition.json
│   └── catalog_rules.txt
└── package.json
```

### `@common-origin/a2ui-react`

A React renderer that takes validated A2UI messages and renders them using `@common-origin/design-system` components. This is the catalog + rendering layer extracted from this POC.

**Contents:**
- `A2UISurface` — Main renderer component
- `A2UISurfaceProvider` — React context provider
- `renderNode()` — Component tree renderer with security boundary
- `useA2UISurface()` — Hook for dispatching messages to a surface
- Error boundary component
- URL sanitisation, depth limiting

**Dependencies:**
- `@common-origin/design-system` (peer dependency)
- `@common-origin/a2ui-catalog` (for validation)
- `react` ≥ 18 (peer dependency)

**Publishing:**
```
@common-origin/a2ui-react
├── dist/
│   ├── index.js
│   ├── index.mjs
│   └── index.d.ts
└── package.json
```

### Extraction Guide

1. **Extract catalog package first** — it has no React dependencies
2. **Extract renderer second** — it depends on the catalog package
3. **Update this POC** to import from `@common-origin/a2ui-catalog` and `@common-origin/a2ui-react` instead of local `src/` modules
4. **Add integration tests** that verify the published packages work together

## Long-Term

### Multi-Framework Support

Following the A2UI specification's renderer pattern, consider additional renderers:

| Framework | Package | Status |
|-----------|---------|--------|
| React | `@common-origin/a2ui-react` | Planned (extract from POC) |
| Angular | `@common-origin/a2ui-angular` | Future — follow A2UI's Angular renderer pattern |
| Lit/Web Components | `@common-origin/a2ui-lit` | Future — follow A2UI's Lit renderer pattern |

The catalog package (`@common-origin/a2ui-catalog`) is framework-agnostic and would be shared across all renderers.

### A2A (Agent-to-Agent) Integration

The A2UI specification includes an [A2A extension](vendor/a2ui/specification/0.8/docs/v0.8-a2a-extension.md) for multi-agent coordination. This enables:

- Specialised agents for different banking tasks (transactions, payments, investments)
- Agent orchestration where a router agent delegates to task-specific agents
- Each agent produces A2UI messages for its area of expertise

### Design System Evolution

- **Component analytics** — track which A2UI components agents use most to prioritise DS investment
- **Agent-optimised variants** — add component variants specifically useful for agent-generated layouts (e.g., streaming-friendly skeletons, progressive disclosure patterns)
- **Catalog versioning** — formal catalog version bumps aligned with design system releases, with backward compatibility rules

### Security Hardening

- **Content Security Policy** integration for rendered surfaces
- **Rate limiting** on the agent API endpoint
- **Audit logging** of all agent-generated UI for compliance review
- **Formal security review** of the catalog boundary before production use
