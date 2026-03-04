# A2UI + Common Origin in Banking: Stakeholder Brief

## 1) Executive summary
A2UI (Agent-to-UI) is a protocol that lets an AI agent request UI as **structured data** instead of generating executable frontend code. In this project, that data is rendered only through a trusted Common Origin component catalog, giving us a practical way to deliver adaptive, conversational banking experiences while retaining enterprise controls for security, consistency, and compliance.

**Simple framing:**
- The agent decides **what** interaction is needed.
- The bank controls **how** it is rendered.
- The protocol ensures data and actions flow in a controlled, auditable way.

## 2) What this project proves
This POC demonstrates a secure agentic UI loop for common banking journeys (transaction search, spending summary, fund transfer):
1. User asks in natural language.
2. Agent returns A2UI JSON messages (`createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`).
3. Client validates messages and catalog conformance.
4. Renderer maps approved component types to Common Origin components.
5. User actions are sent back as explicit action events with scoped context.

This is a shift from “LLM writes UI code” to “LLM requests from a controlled UI contract.”

## 3) Why this matters in regulated banking environments
### Control by design
- **No arbitrary code execution from agent output**: messages are declarative JSON, not script payloads.
- **Catalog allow-listing**: only pre-approved components and property shapes can render.
- **Validation gates**: malformed or out-of-policy payloads are rejected before render.

### Better compliance posture
- **Auditability**: each UI state change is represented as explicit protocol messages.
- **Deterministic constraints**: schema, component catalog, and action contracts are inspectable by risk/compliance teams.
- **Data minimisation options**: user input updates can stay local until explicit actions are triggered.

### Operational safety
- **Trust boundary separation**: agent proposes; client enforces.
- **Transport flexibility**: A2UI is transport-agnostic and can ride enterprise channels (for example A2A patterns) with existing auth, policy, and observability controls.
- **Failure containment**: invalid components can be dropped without taking down the host app.

## 4) Security model: from user request to rendered UI
The practical security chain in this approach:
1. **Prompt/generation controls** constrain the agent to known catalog rules.
2. **Protocol validation** checks message envelope and structure.
3. **Catalog validation** checks component type, required fields, and permitted properties.
4. **Sanitisation** (for example URLs) blocks common injection vectors.
5. **Renderer isolation** ensures only native app components are instantiated.
6. **Action mediation** sends explicit, typed user actions back to server-side logic.

Net effect: the agent can orchestrate experiences, but cannot directly execute arbitrary client code.

## 5) Why UI patterns matter (user outcomes + design system outcomes)
### For customers and frontline users
- **Predictability under complexity**: dynamic journeys still use familiar banking patterns (cards, lists, form fields, confirmations).
- **Reduced cognitive load**: users interact with purpose-built controls instead of long text back-and-forth.
- **Accessibility and trust**: native components inherit established accessibility and brand expectations.

### For design system and platform teams
- **Governed innovation**: agents can compose only from approved patterns, preserving quality and consistency.
- **Reuse at scale**: one catalog investment supports many agent workflows.
- **Faster iteration with guardrails**: teams evolve components centrally without changing agent architecture.

## 6) Why this is future-forward for banking UX
A2UI-style architecture supports where digital banking is heading:
- **Intent-driven journeys**: users describe outcomes (“transfer money”, “explain fees”), UI is assembled contextually.
- **Adaptive workflows**: experiences adjust in-session based on risk signals, eligibility, and user behavior.
- **Cross-channel portability**: same protocol patterns can map to web, mobile, and future surfaces.
- **Multi-agent orchestration potential**: specialist agents can contribute UI fragments while host app maintains a single trusted presentation layer.

In short: this model moves banks from static screens plus chatbot text to **controlled, adaptive, and policy-aligned conversational interfaces**.

## 7) Talking points for stakeholders
### 30-second version
“We’re using A2UI to let AI agents generate banking interfaces safely. The agent sends structured UI data, not executable code, and our app only renders pre-approved Common Origin components. That gives us adaptive customer experiences with strong security, governance, and design consistency.”

### 2-minute version
“This POC proves a practical architecture for agentic banking UX. The agent handles intent and orchestration, while the bank keeps control through schema validation, catalog allow-lists, and native rendering. That reduces injection risk, improves auditability, and gives design-system teams a scalable way to support many new journeys. It’s a foundation for future banking experiences that are more conversational, personalised, and still compliance-ready.”

## 8) Current maturity and positioning notes
- Public A2UI materials describe the ecosystem as **early stage/public preview** overall.
- Public spec guidance indicates **v0.8 as stable/public preview** and **v0.9 as draft/evolving**.
- This POC intentionally targets a controlled enterprise pattern: strict catalog + validation + native component mapping.

Recommended message to leadership: **adopt as an architecture pattern now in bounded domains, scale with protocol maturity.**

## 9) Public sources reviewed (outside this repo)
- https://a2ui.org/
- https://a2ui.org/specification/v0.9-a2ui/
- https://a2ui.org/renderers/
- https://a2ui.org/transports/
- https://github.com/google/A2UI
- https://a2a-protocol.org/latest/
- https://github.com/a2aproject/A2A
