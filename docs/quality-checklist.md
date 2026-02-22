# A2UI Demo — Quality Checklist

> Defines the quality bar for all demo flows. Established from the Fund Transfer flow polish (Phase 3). All flows must meet these criteria before being considered demo-ready.

---

## Visual Quality
- [x] **No grey placeholder images**: Cards used as containers render via `Box` (not `CardLarge`), avoiding the forced grey SVG placeholder. `CardLarge` only used when an actual image is available.
- [x] **Card children render correctly**: When the agent sends a Card with `children`, the children are visible inside a styled `Box` container with appropriate padding and border.
- [ ] **Consistent spacing**: All screens use DS spacing tokens (`xs`/`sm`/`md`/`lg`/`xl`) — no hardcoded pixel values in agent output.
- [ ] **Typography hierarchy**: Each screen has one `h1`, section headers use `h2`/`h3`, body text uses `body`, metadata uses `caption`.
- [ ] **No visual overflow**: All content fits within the surface container without horizontal scrolling.

## Transitions & Loading
- [x] **No blank flash between screens**: Previous surface dims/blurs during transition instead of being deleted. New content replaces old atomically when `createSurface` + `updateComponents` arrive.
- [x] **Skeleton loading for empty surfaces**: When `createSurface` fires but components haven't arrived yet, skeleton placeholders are shown (not "Root component not found").
- [x] **Fade-in animation**: New surfaces fade in with the `fadeInUp` animation for smooth appearance.
- [ ] **Loading indicator visible**: Status indicator shows "Agent streaming UI updates..." during generation.

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
- [x] **CategoryBadge uses `label`**: Standardised on `label` as the primary prop (not `content`). `content` kept as deprecated fallback.
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

*Last updated: Phase 3 — Fund Transfer flow polish*

## Flow Status

| Flow | Status | Notes |
|------|--------|-------|
| Fund Transfer | ⏳ Not started | Reference flow — polished first |
| Account Overview | ⏳ Not started | |
| Transaction Search | ⏳ Not started | |
| Spending Summary | ⏳ Not started | |
| Bill Payment | ⏳ Not started | |
| Card Management | ⏳ Not started | |
