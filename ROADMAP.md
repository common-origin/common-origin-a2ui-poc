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
- [x] ~~Deploy to Vercel with stable URL~~
- [x] ~~Multi-turn conversation (agent context across messages)~~
- [x] ~~Mobile-responsive layout optimisation~~
- [x] ~~Accessibility audit (WCAG 2.1 AA)~~
- [x] ~~Action-to-agent feedback loop (v0.9 spec actions)~~

## In Progress: Making It Feel Real

The goal is to demonstrate a banking experience where the user can interact naturally — type a request, see dynamic UI, click buttons that produce follow-up screens — all powered by an AI agent generating A2UI.

### Action Feedback Loop (Done)
- [x] v0.9 spec `action` with `name` + `context` on Button components
- [x] `onClick` with `name` + `context` on TransactionListItem (uses existing catalog schema)
- [x] Client resolves context paths from data model before sending to agent
- [x] Agent receives user actions and generates follow-up UI
- [x] System prompts updated with action handling instructions + examples
- [x] Server-side scenario detection via `analyzeQuery` fallback in API route
- [x] Fixed scenario name mismatch (`transaction-finder` → `transaction-search`)

### Interactive Flows (Validated end-to-end with Gemini)
- [x] Transfer: form → review → confirm → success
- [x] Transaction search: drill-down into transaction details on click
- [x] Spending summary: "Compare to last month" and "View all transactions" action buttons
- [ ] Cancel / back navigation between screens

### Polish & Realism
- [x] All three scenarios validated end-to-end with Gemini (not just mock)
- [ ] Consistent, realistic Australian banking data across all agent responses
- [ ] Smooth transitions between screens (loading states during action follow-ups)
- [ ] Error recovery: retry on agent failure, user-friendly error messages

### Expand Banking Coverage
- [ ] Account overview / balances scenario
- [ ] Bill payments scenario
- [ ] Card management scenario
- [ ] Freeform banking queries (agent handles any banking prompt)

## Long-Term (Beyond This POC)

If this POC validates the approach, the following directions are worth exploring:

### Multi-Agent Banking
- Specialised agents per banking domain (transactions, payments, investments)
- A router agent delegates to task-specific agents, each producing A2UI
- Follows the A2UI A2A extension pattern for multi-agent coordination

### Additional Renderers
- Angular and Lit/Web Component renderers following A2UI's reference implementations
- The catalog definition is already framework-agnostic and could be shared

### Production Hardening
- Content Security Policy integration for rendered surfaces
- Rate limiting on the agent API endpoint
- Audit logging of all agent-generated UI for compliance review
- Formal security review of the catalog boundary
