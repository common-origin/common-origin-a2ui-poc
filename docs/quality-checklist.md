# A2UI Demo — Quality Checklist

> Defines the quality bar for all demo flows. Established from the Fund Transfer flow polish (Phase 3). All flows must meet these criteria before being considered demo-ready.

## Phase 3 Snapshot (23 Feb 2026)

- Status: **Complete for current scope**
- Completed in codebase: action format normalisation, CategoryBadge `label` standardisation, Card image placeholder removal, action follow-up loading indicator, targeted tests.
- Deferred by decision: surface transition enhancements (`A2UISurface` fade/skeleton transition behaviour).
- Sign-off: Fund Transfer walkthrough completed and accepted for demo scope.

## Phase 4 Snapshot (Kickoff)

- Status: **In progress**
- Kickoff completed: Prompt consistency update to Australian `AccountCard.accountType` (`everyday`) across core flow prompts.
- Guardrails added: Automated prompt consistency tests to prevent reintroducing legacy `transaction` account type examples.
- Flow progress: `Account Overview` is now complete; `Transaction Search` is the next active flow.

## Phase 4 Snapshot (Transaction Search pass)

- Status: **In progress**
- Completed in this pass: `Transaction Search` filter chips updated to local interactive pattern (`selected` data binding + `onClick` local updates).
- Renderer improvements: boolean path bindings now supported for `BooleanChip.selected` and `Checkbox.checked`.
- Guardrails added: regression tests for boolean binding + toggle action update behavior.

## Phase 4 Snapshot (Spending Summary pass)

- Status: **In progress**
- Completed in this pass: Spending Summary prompt aligned to catalog-valid `MoneyDisplay` props/tokens and includes explicit `TransactionListItem` drilldown contract.
- Guardrails added: prompt consistency tests now enforce Spending Summary `MoneyDisplay` size tokens and required category-drilldown example.
- Follow-up: mock Spending Summary total now uses schema-valid `MoneyDisplay.size` (`large`).

## Phase 4 Snapshot (Bill Payment pass)

- Status: **In progress**
- Completed in this pass: Bill Payment prompt now includes complete 4-step examples (select → form → review → success) and explicit mandatory rules for interactive bill selection and confirmation actions.
- Guardrails added: prompt consistency tests now enforce Bill Payment review/success examples and required action names (`select_biller`, `review_payment`, `confirm_payment`, `back_to_form`).

## Phase 4 Snapshot (Card Management pass)

- Status: **Complete**
- Completed in this pass: Card Management prompt now includes explicit unfreeze and lost-card report/recovery flows with concrete success screens.
- Guardrails added: prompt consistency tests now enforce Card Management action coverage (`freeze_card`, `confirm_freeze`, `unfreeze_card`, `report_lost`, `confirm_report_lost`) and required follow-up examples.
- Phase 4 outcome: all six demo flows now have completed prompt/interaction consistency passes.

---

## Visual Quality
- [x] **No grey placeholder images**: Cards used as containers render via `Box` (not `CardLarge`), avoiding the forced grey SVG placeholder. `CardLarge` only used when an actual image is available.
- [x] **Card children render correctly**: When the agent sends a Card with `children`, the children are visible inside a styled `Box` container with appropriate padding and border.
- [ ] **Consistent spacing**: All screens use DS spacing tokens (`xs`/`sm`/`md`/`lg`/`xl`) — no hardcoded pixel values in agent output.
- [ ] **Typography hierarchy**: Each screen has one `h1`, section headers use `h2`/`h3`, body text uses `body`, metadata uses `caption`.
- [ ] **No visual overflow**: All content fits within the surface container without horizontal scrolling.

## Transitions & Loading
- [ ] **No blank flash between screens**: Deferred for now by decision — keep current transition behaviour in `A2UISurface`.
- [ ] **Skeleton loading for empty surfaces**: Deferred for now by decision — keep current `A2UISurface` behaviour.
- [ ] **Fade-in animation**: Deferred for now by decision — no surface-level fade-in added.
- [x] **Loading indicator visible**: Status indicator shows "Agent streaming UI updates..." during generation.

## Interaction & Actions
- [x] **v0.9 action format**: All buttons use `action: { name, context }` format. Catalog resolves context paths from data model.
- [x] **Action follow-up loop**: User clicks → handler sends follow-up to agent → agent generates next screen → surface updates.
- [ ] **Cancel/back navigation**: Multi-step flows include a way to go back or cancel.
- [ ] **Disabled state during generation**: Buttons are not clickable while agent is generating.

## Data Consistency
- [ ] **Australian banking persona**: All responses use Sarah Chen, AUD, BSB numbers, Melbourne timezone.
- [ ] **Consistent account details**: Account numbers, names, and balances are consistent across all screens in a flow.
- [ ] **Realistic reference numbers**: Format `REF-YYYYMMDD-XXXX` with appropriate dates.
- [ ] **Data binding resolution**: All `{ path: "/field" }` bindings resolve to correct values from the data model.

## Prop Naming Consistency
- [x] **CategoryBadge uses `label`**: Standardised on `label` only (schema, rules, prompts, renderer, tests).
- [x] **Button uses `action`**: All buttons use `action` prop. `onClick` kept as alias for backward compat.
- [ ] **onChange uses `eventType`/`dataPath`**: Form controls use the local data-binding format (not agent-round-trip actions).

## Accessibility
- [ ] **Semantic HTML**: Surface renders with appropriate ARIA attributes (`role="status"` for loading states, `aria-label` for containers).
- [ ] **Keyboard navigation**: All interactive elements are reachable via Tab and activatable via Enter/Space.
- [ ] **Screen reader support**: Loading states, status changes, and surface updates announced via `aria-live` regions.

## Agent Output Consistency
- [ ] **Component names match catalog**: Agent only uses valid `VALID_COMPONENT_TYPES` names.
- [ ] **Required props present**: Every component includes all required props per the catalog JSON schema.
- [ ] **No unknown props**: Agent doesn't send props that aren't in the component definition.
- [ ] **Children reference valid IDs**: All `children: ["id"]` references point to components that exist in the same `updateComponents` batch.

---

*Last updated: Phase 4 complete (all flows)*

## Flow Status

| Flow | Status | Notes |
|------|--------|-------|
| Fund Transfer | ✅ Complete (scope) | Signed off for demo scope; transition enhancements intentionally deferred |
| Account Overview | ✅ Complete | Clickable account cards wired and validated; prompt/account-type consistency pass complete |
| Transaction Search | ✅ Complete | Interactive filter-chip pattern aligned with local data binding and tested |
| Spending Summary | ✅ Complete | Prompt/schema alignment completed with category transaction drilldown coverage |
| Bill Payment | ✅ Complete | Full 4-step flow examples and action contract guard tests added |
| Card Management | ✅ Complete | Unfreeze and lost-card confirmation/success flows added with guard tests |
