# A2UI Demo Strategy & Implementation Plan

> **Context**: This plan was developed by Ollie Macky (Principal Designer, Elevate Design System, NAB Melbourne) to demonstrate the strategic value of design system patterns for agentic banking experiences. The demo targets the Elevate design system team, design system leadership, and product leadership at NAB.

## Phase 7 Progress Snapshot

- Status: **Scaled back — pending strategic rethink (4 Mar 2026)**
- Original implementation: `UserPreferences` type with theme/density/fontSize/reducedMotion/highContrast/persona fields, `loadPreferences`/`savePreferences` (localStorage), `buildPreferencesPromptBlock` injecting live context into agent system prompts, `PreferencesPanel` slide-in drawer, `SurfaceFeedback` thumbs-up/down widget, CSS variables for dark theme/density/font scale/high-contrast/reduced-motion.
- **Decision**: The original implementation did not adequately convey the actual personalisation vision (see _Browsing Token Personalisation Vision_ below). The preferences code has been removed from the UI for now. A `Preferences` naked button is retained at top-right of the screen as a visual placeholder for the future hook point.
- Test count: **282 tests passing** (unchanged — preferences unit tests remain; only UI wiring removed).
- Next: Revisit personalisation once the browsing-token concept is clearer in scope, or proceed to Phase 8.

## Phase 6.5 Progress Snapshot

- Status: **Complete**
- Completed: `PipelineTimer` class with 5 named stages (`submit → apiStart → firstMsg → firstRender → complete`), `trimConversationHistory` sliding-window utility, latency marks wired into `agentClient.ts` (`apiStart`, `firstMsg`, `complete`) and `app/page.tsx` (`submit`, `logReport`), `trimConversationHistory` applied in `agentClient.ts` and `app/api/agent/route.ts`, mock demo delays gated behind `NEXT_PUBLIC_DEMO_TIMING=true` in `mockAgent.ts`, `spendingSummaryAgent.ts`, and `fundTransferAgent.ts`, shell-first (rule 11) added to base prompt.
- Test count: **266 tests passing** (up from 238).
- Next: Phase 7 (personalisation).

## Phase 6 Progress Snapshot (1 Mar 2026)

- Status: **Complete**
- Completed: Pattern type schema (`src/a2ui/patterns/types.ts`), 10 pattern definitions across 4 categories (`src/a2ui/patterns/definitions.ts`), pattern validator with detect/validate/state APIs (`src/a2ui/patterns/patternValidator.ts`), prompt block generator (`src/a2ui/patterns/patternPrompt.ts`), base prompt updated to include full pattern reference, all 6 scenario prompts annotated with their pattern IDs, 48 pattern tests.
- Test count: **238 tests passing** (up from 190).
- Next: Phase 6.5 (latency instrumentation) ✅ complete.

## Phase 3 Progress Snapshot (23 Feb 2026)

- Status: **In progress**
- Completed: Card image handling fix, action-format normalisation, CategoryBadge `label` standardisation, action follow-up loading state, page layout polish, targeted tests.
- Deferred by decision: `A2UISurface` transition/skeleton/fade enhancements.
- Remaining close-out: real Gemini walkthrough documentation + checklist sign-off + short reference recording.

## Browsing Token Personalisation Vision

> _Captured 4 March 2026 — strategic concept for a later phase, not currently implemented._

The personalisation concept this project should eventually demonstrate is **not** a simple settings panel the user manually configures inside a banking app. That model is already the status quo, and it doesn't make a compelling case for the future.

The real vision is a **user-owned, device-native browsing token** — an agnostic identity and preference layer that travels with the user across the internet, independent of any single website, app, or company. The user manages this token natively, perhaps through their phone's OS, a browser identity provider (like a future Google account layer), or a personal digital wallet. It is entirely theirs.

The token holds browsing preference information such as:
- **Accessibility**: font size / magnification preferences, colour-contrast profiles for specific types of colour blindness, reduced-motion settings, assistive technology configuration hints, preferred input modality (pointer, keyboard, voice)
- **Display**: dark/light mode preference, density preference
- **Identity**: first name, preferred language, locale/timezone — non-sensitive personal context that helps surfaces personalise communication tone and formatting
- **Agent context**: interaction style preferences (verbose vs. concise), preferred level of confirmation before destructive actions

When a user visits a website or opens an app, the site/app reads (with consent) the subset of the token it needs to adapt the experience. The user never has to re-configure preferences per-product. Crucially, this is **not controlled or stored by the enterprise** — it lives on the user's device or in a user-managed identity provider.

### Why this matters for A2UI and agentic experiences

In an agent-driven UX model, the agent can read the browsing token and make pattern decisions accordingly:
- An accessibility-mode user gets high-contrast, larger-type, reduced-animation surfaces
- A power-user persona gets denser, data-forward layouts with fewer confirmation steps
- A screen-reader user gets components structured for AT compatibility from the first render

This is where design system patterns become genuinely powerful: the token says _who the user is_, the agent selects _which pattern fits_, and the design system governs _how that pattern renders_.

### Why this concept doesn't exist yet

No browser or major enterprise platform currently supports an agnostic, user-owned preference token. The closest approximations are OS-level accessibility settings (which some browsers partially honour) and browser localStorage (which is per-origin and not portable). True cross-product, user-owned preference portability is an emerging area.

For NAB and Elevate specifically, this framing is worth positioning ahead of the curve: **as the web moves toward agentic interfaces, design systems that govern pattern selection become the natural integration point for a future browsing token layer**. This applies across financial services but is especially compelling for assistive technology users, who currently must configure accessibility settings separately in every product they use.

### What to build when revisiting this

1. Mock the token as a browser-native object (e.g., a fictional `navigator.preferences` API surface) — make explicit it is a demo of a concept that does not yet exist
2. Show the agent reading the token on first load and adapting the surface without any explicit user action
3. Demonstrate a contrast: same query, two different token profiles, visibly different rendered output
4. Frame the `Preferences` button in the UI as the "manage your token" entry point — not a per-app settings panel
5. Highlight assistive technology users as the primary beneficiaries in any stakeholder presentation

---

## Strategic Vision

The future of banking UX is agent-driven: users interact with AI agents via voice and text, and the agent renders UI using **design system patterns** — not freeform HTML. The design system becomes the **governance layer** for AI-generated experiences, ensuring consistency, accessibility, and quality regardless of what the agent decides to show.

This demo proves that thesis. It shows:

1. **Patterns matter more than components** — Well-defined compositional patterns (not just buttons and cards) are what enable agents to render predictable, high-quality UI
2. **Voice is the natural input mode** — Text input works, but voice demonstrates the accessibility and convenience advantages of agentic interaction
3. **Personalisation is the next frontier** — User context (preferences, history, accessibility needs) shapes what the agent shows and how it renders
4. **Agentic patterns are a new design system primitive** — Disambiguation, progressive disclosure, confirmation flows, and error recovery are patterns that don't exist in traditional design systems but are essential for agent-driven UX
5. **Feedback loops close the quality gap** — User interactions feed back into pattern refinement, creating a continuous improvement cycle between users and the design system

### Audience & Purpose

- **Primary audience**: Elevate design system team at NAB
- **Secondary audience**: Design system leadership, product leadership
- **Purpose**: Demonstrate that patterns and design systems are strategically critical for the future of banking experiences, and that Elevate should invest in pattern-level definitions that work for both traditional and agentic UI

---

## Current State

### What Works
- 28-component catalog mapped 1:1 to Common Origin design system v2.4
- 6 banking demo scenarios (account overview, transaction search, spending summary, fund transfer, bill payment, card management)
- Real Gemini AI agent generating A2UI v0.9 messages streamed to the client
- Message validation with DoS limits, catalog validation, URL sanitisation
- Multi-turn conversation with action feedback loop (user clicks → agent responds)
- **10 named banking patterns** across 4 categories (data-display, progressive-input, navigation, agentic) with typed definitions, a runtime validator, and prompt injection
- 238 tests covering validation logic, rendering, bindings, voice routing, integration, and pattern compliance
- Deployed on Vercel

### What Needs Improvement
- **Rendering quality**: Blank flash between interactions, placeholder images on cards, no loading states during action follow-ups
- **Pattern consistency**: Mixed action formats (v0.9 spec vs legacy), inconsistent prop naming (CategoryBadge accepts both `content` and `label`)
- **Test coverage gaps**: Zero rendering tests for `renderNode()`, no tests for data binding resolution, no integration tests
- **No formal pattern definitions**: The concept of "patterns" (compositions of components) doesn't exist — agents improvise from examples
- **No project context files**: No `.copilot/instructions.md`, no DS API reference, no feedback log

### Known Design System Gaps
1. `AccountCard` uses `accountType: 'checking'` but Australian banking needs `'everyday'`
2. No centered Modal/Dialog component — `Sheet` (slide-in) is used as substitute
3. `CardLarge` requires `picture` prop — forces placeholder image hack
4. No `Skeleton` component in the DS — hand-rolled with inline styles
5. Typography variant naming may not align between A2UI catalog and DS types

---

## Implementation Phases

### Phase 1: Project Setup & Context Files
**Goal**: Establish the working foundation so we can move fast with confidence.

**Steps**:
1. Create `.copilot/instructions.md` — persistent AI context for every session, covering project purpose, architecture, conventions, DS access protocol, testing standards, and quality bar
2. Create `docs/design-system-api.md` — auto-generated from the `.d.ts` type definition files in the installed `@common-origin/design-system` npm package. Single reference for all component props, types, enums. Re-generate when the DS version is bumped
3. Create `docs/design-system-feedback.md` — living log of component enhancement requests, new component needs, and prop mismatches. Each entry includes: what we need, why, current DS state, and a ready-to-use prompt for the DS project
4. Create `docs/quality-checklist.md` — placeholder, populated after the Fund Transfer flow is polished. Becomes the acceptance criteria for all demo flows

**Outcome**: Every future session has full context without re-discovery. DS gaps are tracked systematically.

---

### Phase 2: Testing Foundation
**Goal**: Safety net before changing anything. Know exactly what the current rendering produces.

**Steps**:
1. Install `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`
2. Update `vitest.config.ts` to support both `node` (existing tests) and `jsdom` (rendering tests) environments
3. Write baseline rendering tests for `renderNode()` — covering the components used in Fund Transfer: `Stack`, `Text`, `TextField`, `NumberField`, `Select`, `Button`, `Card`, `MoneyDisplay`, `Alert`, `StatusBadge`
4. Write unit tests for `resolveBinding()`, `resolveNumber()`, `resolveAction()` — the core data binding functions that bridge agent data to component props
5. Run all tests, establish green baseline

**Outcome**: We can refactor and fix rendering with confidence that we're not breaking existing behaviour.

---

### Phase 3: Fund Transfer Flow Polish (Demo-Ready)
**Goal**: One perfect flow that proves the value of well-defined patterns. This becomes the quality reference for all other flows.

**Implementation Status (23 Feb 2026)**:
- ✅ Completed: Card placeholder image fix, action format normalisation, CategoryBadge standardised to `label`, loading state during action follow-ups, page layout polish, and tests for these fixes.
- ⏸️ Deferred by decision: surface transition enhancements in `A2UISurface.tsx` (blank-flash transition, skeleton transition state, fade-in transition).
- ✅ Phase 3 closed for current scope after successful Fund Transfer walkthrough and sign-off.

**Phase 3 Exit Criteria**:
- [x] Record one full real-Gemini Fund Transfer walkthrough (form → review → confirm → success), including rendering issues, interaction bugs, and UX gaps.
- [x] Update `docs/quality-checklist.md` with walkthrough outcomes and mark Fund Transfer as complete only when all non-deferred criteria are met.
- [x] Capture a short screen recording reference for the polished Fund Transfer flow.

**Steps**:
1. Walk through the full Fund Transfer flow (form → review → confirm → success) with the real Gemini agent. Document every rendering issue, interaction bug, and UX gap
2. **Fix blank flash between interactions** — Add a transition state in `A2UISurface.tsx`: hold previous surface briefly with fade-out, show skeleton loading, fade in new surface
3. **Fix Card placeholder image** — Make the `picture` prop on `CardLarge` conditional. Only pass when the agent explicitly provides an `image` prop
4. **Add loading states during action follow-ups** — Show contextual loading indicator when user triggers an action and the agent is generating the next screen
5. **Normalise action format** — Audit all prompt files and `catalog.ts` to ensure all interactive components use the v0.9 `action: {name, context}` format consistently
6. **Fix CategoryBadge dual-prop issue** — Pick one prop name (`label`), update catalog definition, rules, and prompts
7. **Polish page layout** — Review spacing, alignment, visual hierarchy of the surface container
8. Write tests for each fix
9. Document the quality standard in `docs/quality-checklist.md`

**Outcome**: Fund Transfer flow is smooth, predictable, and visually polished. Quality standard is documented.

**Note**: Broader render-latency/performance optimisation is intentionally scheduled for **Phase 6.5** after pattern formalisation.

---

### Phase 4: Apply Quality Standard to Remaining Flows
**Goal**: All 6 demo flows meet the quality bar established by Fund Transfer.

**Implementation Status (23 Feb 2026)**:
- ✅ Completed: Account Overview, Transaction Search, Spending Summary, Bill Payment, and Card Management flow passes.
- ✅ Added targeted regression coverage for prompt consistency and renderer interaction bindings used across these flows.
- ✅ Phase 4 closed for current scope.

**Steps**:
1. Walk through each remaining flow (account overview, transaction search, spending summary, bill payment, card management) against the quality checklist
2. Fix rendering issues found in each flow
3. Write tests for each fix, including form-control action wiring regression tests (Select/TextField/NumberField/Checkbox update behavior, object-or-string select payload handling, and `dataPath` normalization)
4. Ensure consistent Australian banking data across all responses (Sarah Chen persona, Melbourne, AUD)
5. Add cancel/back navigation between screens where relevant

**Outcome**: All 6 demo flows are demo-ready. The complete demo script from `DEMO.md` runs smoothly.

**Note**: During Phase 4, prioritise correctness/quality consistency; defer pipeline-level latency tuning to **Phase 6.5**.
**Note**: Transaction-search chip behaviour is functionally wired, but its visible impact is currently limited by the small/low-variance transaction sample set. Expand seeded transaction data (older dates, more credits/debits, broader categories) in a later pass to make filtering interactions more demonstrable.

---

### Phase 5: Voice Input
**Goal**: Add voice-to-text as an alternative input mode, demonstrating accessibility-first thinking.

**Repo Implementation Checklist (1 Mar 2026)**:
- [x] Voice-enabled input wired in [app/page.tsx](app/page.tsx) via `AgentInput` from DS v2.8.2 with local compat type wrapper; transcript routes through `onSubmit` → `handleSubmit`.
- [x] `InputStage` layout: input centered in viewport on first load, collapses smoothly to top on first submit; `SurfaceContainer` animates in only after first submission.
- [x] Simplified page shell: header, security banner, example chips, and agent mode toggle removed — input is the only thing visible at start.
- [x] `speechError` state wired to `AgentInput.errorMessage` so voice errors surface inline.
- [x] Browser compatibility and speech error mapping utilities in [src/lib/voiceInput.ts](src/lib/voiceInput.ts) with unit tests in [src/lib/voiceInput.test.ts](src/lib/voiceInput.test.ts).
- [x] Catalog hardened for DS v2.8.2: `CategoryBadge` variant/color/size normalisation, `TransactionListItem` status/category allow-list, `StatusBadge` size clamping, `CardLarge` picture prop, catalog JSON and rules txt aligned.
- [x] DS stakeholder brief added at [docs/a2ui-banking-stakeholder-brief.md](docs/a2ui-banking-stakeholder-brief.md).
- [x] **DS team deliverable** — Animated circular gradient ring on mic button while listening (spec in [docs/agentic-input-component-spec.md](docs/agentic-input-component-spec.md), prompt in [docs/design-system-feedback.md](docs/design-system-feedback.md)).
- [x] Expand voice-phrasing query coverage in [src/server/queryRouter.ts](src/server/queryRouter.ts) and add tests in [src/server/queryRouter.test.ts](src/server/queryRouter.test.ts) for spoken variants.
- [x] Add integration coverage: mock `AgentInput.onSubmit` and verify `handleSubmit` receives transcript, sets `isGenerating`, and calls `callAgent`.
- [ ] Run `pnpm test` to confirm green baseline after catalog changes, then one manual Chrome pass for permission-denied + no-speech-timeout UX.

**Recommended Next Action**: Run one manual Chrome pass for permission-denied + no-speech-timeout UX, then proceed to Phase 6 (Pattern Definition Layer).

**Phase 5 Status**: All automated checklist items complete. 190 tests passing. DS ring animation remains blocked on DS team delivery.

**Steps**:
1. Add right-aligned microphone and send icon buttons inside the text input container. Use the Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) — zero external dependencies, Chrome/Edge on desktop
2. Visual feedback during listening — animated circular gradient border highlight around mic icon button (blue design-system token), interim transcript in the input field, clear start/stop states
3. Graceful handling — browser compatibility check (show/hide mic icon button), permission denied handling, no-speech-detected timeout, manual stop button
4. Test voice-transcribed queries against `analyzeQuery()` regex patterns — expand patterns if voice phrasing differs from typed queries
5. Write tests for voice input integration (transcript → handleSubmit path, browser compat detection)

**Outcome**: Users can speak banking queries and see UI rendered from their voice. Compelling accessibility demo moment.

---

### Phase 6: Pattern Definition Layer
**Goal**: Formalise "patterns" as a concept above components — the strategic centerpiece for the Elevate narrative.

**Steps**:
1. **Define the pattern schema format** — A pattern is a named composition: component structure + layout rules + data requirements + interaction flow. Lives between the component catalog and full-screen layouts
2. **Identify core banking patterns** from the 6 demo scenarios:
   - **Data Display**: Account summary, transaction list with grouping, spending breakdown
   - **Progressive Input**: Multi-step form (transfer, bill payment)
   - **Confirmation Flow**: Review → confirm → success/error
   - **Search & Filter**: List with search/filter controls
   - **Detail Drilldown**: List item → expanded detail → back
   - **Agentic Patterns** (new): Disambiguation ("which account?"), progressive disclosure ("I need more info"), consent/confirmation
3. **Create pattern definition files** — Extend the catalog with a `patterns/` directory. Each pattern defines: required components, layout structure, data model shape, interaction states, example JSONL
4. **Update system prompts** to reference patterns by name rather than providing full JSONL examples — reduces prompt size dramatically and improves agent output consistency
5. **Update catalog rules** to include pattern-level rules alongside component-level rules
6. Write tests for pattern validation

**Outcome**: Patterns are first-class citizens in the design system. Agents reference patterns by name and the system validates compliance.

---

### Phase 6.5: Performance & Render Latency Optimisation (Post-Pattern Layer) ✅
**Goal**: Reduce time-to-first-render and time-to-interactive while preserving the A2UI protocol and pattern governance model.

**Steps**:
1. ✅ Add latency instrumentation across the full pipeline: submit → API start → model first byte → first valid A2UI message → first meaningful render
2. ✅ Reduce runtime prompt weight by replacing verbose inline examples with compact pattern references established in Phase 6
3. ✅ Limit conversation history sent per turn to only recent/relevant turns (sliding window)
4. ✅ Introduce shell-first streaming guidance: agent sends minimal `createSurface` + lightweight initial components first, then detail batches
5. Reduce render churn in the client by batching/coalescing rapid `updateComponents` bursts where possible _(deferred)_
6. Keep strict validation in development; use a lightweight production fast-path validation for streaming hot path if safe _(deferred)_
7. ✅ For mock mode, gate artificial delays behind a demo timing flag so performance testing can run without simulated wait
8. Add regression tests/benchmarks for form interactivity latency and first-render timing targets _(deferred)_

**Outcome**: UI feels immediate while still fully A2UI-compliant. Performance improvements are measurable and repeatable.

---

### Phase 7: Personalisation (Visual Demo) ✅
**Goal**: Demonstrate how user context shapes the experience — preferences panel that visibly changes the UI.

**Steps**:
1. ✅ Create a user preferences panel (settings icon). Include: theme (light/dark), density (compact/comfortable/spacious), accessibility preferences (reduced motion, high contrast, font size), persona selector
2. ✅ Wire preferences into the rendering layer — extend CSS custom properties for density, motion, font scaling
3. ✅ Wire preferences into the system prompt — inject current preference state so the agent adapts pattern choices (e.g., compact list vs card layout based on density)
4. ✅ Add a "Was this helpful?" interaction on each rendered surface to demonstrate the feedback concept
5. ✅ Write tests for preference application

**Outcome**: Toggle preferences during a demo and see visible changes. Demonstrates the personalisation concept without a real token system.

---

### Phase 8: Agentic Pattern Library & Feedback Loop
**Goal**: The longer-term strategic work — build the full case for Elevate's role in agentic experiences.

**Steps**:
1. **Formalise agentic interaction patterns** as design system primitives: disambiguation, progressive disclosure, consent, error recovery, handoff. Document each with: when to use, component composition, UX guidelines, examples
2. **Pattern analytics layer** — Track which patterns the agent selects, user interaction rates, completion rates, drop-off points
3. **Pattern playground** — Tool for the design system team to preview, edit, and test patterns in isolation
4. **Feedback loop architecture** — Design how user signals (explicit feedback, interaction analytics, error rates) flow back to pattern definitions: data → design review → pattern refinement → catalog update → agent behaviour change
5. **Mobile experience exploration** — Design how patterns adapt to mobile contexts

**Outcome**: Complete strategic vision realised. Elevate has a governance model for agentic experiences with a continuous improvement feedback loop.

---

## Testing Strategy

Tests are created alongside every step — not as an afterthought.

| Area | Test Type | Current | Target |
|------|-----------|---------|--------|
| Message validation | Unit | 16 tests ✅ | Maintain |
| Catalog validation | Unit | 11 tests ✅ | Maintain |
| URL sanitisation | Unit | 10 tests ✅ | Maintain |
| Query routing | Unit | 20 tests ✅ | Expand for voice phrasing |
| Component rendering (`renderNode`) | Unit + RTL | **0 tests** ❌ | All 28 components |
| Data binding (`resolveBinding` etc.) | Unit | **0 tests** ❌ | Full coverage |
| Surface transitions | Integration | **0 tests** ❌ | Transition states |
| Action feedback loop | Integration | **0 tests** ❌ | End-to-end action flow |
| Voice input | Unit | N/A | Browser compat, transcript handling |
| Pattern validation | Unit | N/A | Pattern schema compliance |

**Dependencies to install**: `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`

---

## Design System Feedback Protocol

When a gap is identified between what the demo needs and what Common Origin provides:

1. Document in `docs/design-system-feedback.md` with: need, current state, gap, impact
2. Include a ready-to-use prompt for the Common Origin design system project to implement the enhancement
3. Work around the gap in the demo if possible (with a TODO comment linking to the feedback entry)
4. Review accumulated feedback periodically and batch requests to the DS team

---

## Key Decisions

- **Fund Transfer is the reference flow** — polished first, quality standard derived from it, then applied to all others
- **Personalisation is visual-only for the demo** — preferences panel that changes rendering, no real token system
- **Voice uses Web Speech API** — zero dependencies, Chrome/Edge desktop only, acceptable for demo context
- **Pattern layer is the strategic keystone** — Phases 6-8 are where the Elevate narrative lives, built on the foundation of Phases 1-5
- **DS access via npm package `.d.ts` files** — no repo cloning, auto-generate API reference, stays in sync with version bumps
- **Solo contributor** — phases are sized for one person working incrementally

---

## Verification

- **Phase 1**: Context files exist and contain accurate, useful information
- **Phase 2**: All new tests pass. `pnpm test` is green
- **Phase 3**: Fund Transfer flow runs end-to-end with no visual glitches, no blank flashes, smooth transitions. Screen-recorded for reference
- **Phase 4**: All 6 demo flows pass the quality checklist
- **Phase 5**: Voice input works in Chrome with 10+ common banking queries
- **Phase 6**: Patterns are defined, agent references them, output is more consistent than inline examples
- **Phase 6.5**: Latency metrics are captured, first render time is reduced, and shell-first streaming performs within defined targets
- **Phase 7**: Toggling preferences visibly changes the rendered UI during a demo flow
- **Phase 8**: Pattern analytics dashboard shows real interaction data