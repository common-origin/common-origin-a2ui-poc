# Common Origin Design System — Feedback Log

> Living document tracking component enhancement requests, new component needs, and prop mismatches identified during A2UI demo development. Each entry includes a ready-to-use prompt for the Common Origin design system project.

---

## How to Use This File

When a gap is identified between what this demo needs and what the DS provides:

1. Add an entry below with the date, component name, and details
2. Include a `### Prompt for DS Project` section with a copy-paste-ready prompt
3. Add a `// DS-FEEDBACK: <short description>` comment in the relevant source code
4. Work around the gap in the demo if possible

---

## Entries

### 2026-03-01 — AgentInput: Voice-Active Animated Gradient Ring

**Need**: Strong, immediate visual feedback that voice capture is actively listening.

**Current DS State**: `AgentInput` supports voice interactions and state callbacks, but the listening state feedback does not yet require a distinct animated circular border treatment around the mic icon button.

**Gap**: During listening, users need an unmistakable active-state affordance beyond text/status alone. Current guidance is not specific enough to guarantee a consistent, premium interaction pattern.

**Impact**: Voice state can feel ambiguous, reducing confidence and increasing stop/start errors during demos and real usage. This weakens accessibility and discoverability of active capture state.

**Affected Files**: [docs/agentic-input-component-spec.md](docs/agentic-input-component-spec.md), [app/page.tsx](app/page.tsx)

#### Prompt for DS Project

> **Enhancement Request: AgentInput — Listening State Animated Circular Gradient Ring on Mic Button**
>
> Please add a first-class listening-state visual treatment for `AgentInput` voice capture:
>
> **Requested behavior**
> - When voice listening is active, show an animated circular gradient ring around the mic icon button.
> - The ring should appear to travel/rotate around the button perimeter and be clearly distinct from idle state.
> - The ring must be removed immediately when listening stops, errors, or submit begins.
>
> **Design/token constraints**
> - Use design-system blue token family only (no hard-coded color values).
> - Keep the treatment token-driven and theme-compatible.
> - Preserve layout stability: no control-cluster shift, no icon-size jump.
>
> **Accessibility requirements**
> - Respect reduced-motion: replace animation with static blue ring while retaining listening text/status semantics.
> - Ensure listening vs idle remains distinguishable without relying only on motion or color.
> - Keep keyboard/screen-reader behavior unchanged (`aria-pressed`, labels, live status updates).
>
> **Suggested API/implementation shape**
> - Internal state-driven visual style is acceptable (no new prop required), but if needed expose a minimal variant hook for custom theming.
> - Add Storybook examples: idle, listening (animated), listening (reduced motion), error, submitting.
>
> **Acceptance criteria**
> 1. Listening state renders animated circular blue gradient ring around mic button.
> 2. Reduced-motion renders static ring instead of animation.
> 3. No layout shift when toggling idle/listening.
> 4. No regressions in voice start/stop and send flows.
>
> **Priority**: High — core UX feedback for voice capture in agentic input.

---

### 2026-02-22 — AccountCard: Missing `'everyday'` Account Type

**Need**: Australian banking uses "Everyday" accounts, not "Checking" accounts.

**Current DS State**: `AccountCard` accepts `accountType: 'checking' | 'savings' | 'credit' | 'investment' | 'loan'`

**Gap**: No `'everyday'` option. The demo uses `'checking'` as a substitute, which is US-centric terminology.

**Impact**: Undermines the Australian banking demo narrative. The agent prompts reference "everyday" accounts but must map to `'checking'` in the component.

**Affected Files**: `src/a2ui/catalog.ts`, `src/server/prompts/accountOverview.ts`

#### Prompt for DS Project

> **Enhancement Request: AccountCard — Add Australian account type support**
>
> The `AccountCard` component's `accountType` prop currently supports: `'checking' | 'savings' | 'credit' | 'investment' | 'loan'`.
>
> For Australian banking contexts, we need `'everyday'` as an account type (the Australian equivalent of "checking"). This is the standard terminology used by Australian banks including NAB, CBA, ANZ, and Westpac.
>
> **Requested change**: Add `'everyday'` to the `AccountType` union type. It should use the same visual treatment as `'checking'` (or a dedicated Australian style if appropriate). Consider also adding `'term-deposit'` and `'mortgage'` as these are common Australian banking products distinct from `'loan'` and `'savings'`.
>
> **Priority**: Medium — affects demo accuracy for Australian banking scenarios.

---

### 2026-02-22 — CardLarge: `picture` Prop Should Be Optional

**Need**: Display card-style content without requiring an image.

**Current DS State**: `CardLarge` requires `picture: string` (not optional).

**Gap**: The A2UI catalog must pass a hardcoded grey placeholder SVG data URI as `picture` for every `Card` component, even when the agent doesn't intend to show an image. This results in a visible grey rectangle on every card.

**Impact**: Every card rendered by the agent shows an unnecessary grey placeholder image, degrading visual quality significantly.

**Affected Files**: `src/a2ui/catalog.ts` (line ~463, Card case in renderNode)

**Workaround**: Consider using `CardSmall` (which has optional `picture`) as an alternative mapping, or use a transparent 1x1 pixel as the placeholder.

#### Prompt for DS Project

> **Enhancement Request: CardLarge — Make `picture` prop optional**
>
> The `CardLarge` component currently requires `picture: string`. In contexts where cards are used for structured content display (e.g., AI-generated banking summaries, account details), an image is not always appropriate or available.
>
> **Option A (preferred)**: Make `picture` optional. When omitted, the card renders without the image area — the title, excerpt, subtitle, and labels fill the available space.
>
> **Option B**: Create a `CardLarge` variant (e.g., `variant: 'text-only'`) that omits the image area.
>
> **Context**: This is blocking clean rendering in AI agent scenarios where the agent generates card content dynamically and images are not always relevant.
>
> **Priority**: High — directly affects rendering quality of every card in the demo.

---

### 2026-02-22 — Missing Centered Modal/Dialog Component

**Need**: Centered modal dialog for confirmation flows, alerts, and focused interactions.

**Current DS State**: The DS has `Sheet` (slide-in panel from top/right/bottom/left) but no centered modal/dialog.

**Gap**: The A2UI catalog maps `Modal` to `Sheet`, which renders as a slide-in panel. Confirmation flows ("Are you sure you want to transfer $500?") and focused interactions expect a centered overlay dialog, not a side panel.

**Impact**: Confirmation patterns in the demo use a slide-in panel instead of a conventional centered dialog, which doesn't match user expectations for modal confirmation flows.

**Affected Files**: `src/a2ui/catalog.ts` (Modal case in renderNode)

#### Prompt for DS Project

> **New Component Request: Modal / Dialog**
>
> The design system currently has `Sheet` (slide-in panel) but no centered modal/dialog component. Many interaction patterns require a centered overlay dialog:
>
> - Confirmation dialogs ("Are you sure?")
> - Alert dialogs (critical information)
> - Focused form inputs (quick data entry)
> - Destructive action confirmation
>
> **Requested component**: `Modal` or `Dialog` with props:
> - `isOpen: boolean` (required)
> - `onClose: () => void` (required)
> - `title?: string`
> - `description?: string`
> - `children?: ReactNode`
> - `size?: 'small' | 'medium' | 'large'`
> - `closeOnOverlayClick?: boolean` (default: true)
> - `closeOnEscape?: boolean` (default: true)
> - `showCloseButton?: boolean` (default: true)
>
> Should follow WCAG 2.1 AA: focus trap, escape to close, aria-modal, return focus on close.
>
> **Priority**: High — needed for agent-driven confirmation and consent patterns.

---

### 2026-02-22 — Missing Skeleton Component

**Need**: Loading placeholder component for skeleton screens during content loading.

**Current DS State**: No `Skeleton` component in the design system.

**Gap**: The A2UI demo hand-rolls skeleton loading states with inline styles and hardcoded CSS animation in `src/a2ui/skeleton.tsx`. This is inconsistent with the DS's visual language and doesn't use DS tokens.

**Impact**: Loading states don't match the design system's visual style. Maintenance burden of a custom implementation.

**Affected Files**: `src/a2ui/skeleton.tsx`

#### Prompt for DS Project

> **New Component Request: Skeleton**
>
> The design system needs a `Skeleton` loading placeholder component for content loading states. This is a standard design system primitive used when content is being fetched or generated.
>
> **Requested component**: `Skeleton` with props:
> - `variant?: 'text' | 'rectangular' | 'circular'` (default: 'text')
> - `width?: string | number`
> - `height?: string | number`
> - `count?: number` (default: 1) — render multiple skeleton lines
> - `animation?: 'pulse' | 'wave' | 'none'` (default: 'pulse')
>
> Should use DS tokens for colors (background track color) and animation timing. Should support both block-level and inline usage.
>
> **Priority**: Medium — currently hand-rolled in consuming projects.

---

### 2026-02-22 — StatusBadge: `'refunded'` Status Not Supported

**Need**: Display refund status on transactions.

**Current DS State**: `StatusBadge` supports `status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing' | 'scheduled'`

**Gap**: The A2UI catalog rules reference `'refunded'` as a valid status, but the DS only supports `'scheduled'` as the 6th status type. Banking transactions commonly have a "refunded" status.

**Impact**: Agent may generate `'refunded'` status badges that don't render correctly.

**Affected Files**: `src/a2ui/common_origin_catalog_rules.txt`, `src/a2ui/common_origin_catalog_definition.json`

#### Prompt for DS Project

> **Enhancement Request: StatusBadge — Add `'refunded'` status**
>
> The `StatusBadge` component currently supports: `'pending' | 'completed' | 'failed' | 'cancelled' | 'processing' | 'scheduled'`.
>
> Banking transactions commonly have a "refunded" status that needs visual representation. Suggested visual treatment: use a distinct color (e.g., blue or teal) with a refund icon to differentiate from "completed".
>
> **Requested change**: Add `'refunded'` to the `StatusType` union.
>
> **Priority**: Low — can work around by using `'completed'` with a label override.

---

### 2026-02-22 — Typography Variant Naming Alignment

**Need**: Clear mapping between A2UI catalog variant names and DS Typography variants.

**Current DS State**: `Typography` accepts `variant: 'display' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'subtitle' | 'body' | 'small' | 'overline' | 'caption' | 'button1' | 'button2' | 'button3' | 'label'`

**Gap**: The A2UI catalog rules and agent prompts may reference variants like `'heading-lg'`, `'heading-sm'`, `'body-lg'` that don't directly map to DS variants. The catalog `renderNode()` passes the variant through without mapping.

**Impact**: If the agent sends a variant name that isn't in the DS's `TypographyVariant` type, the component may fall back to default styling or produce unexpected results.

**Affected Files**: `src/a2ui/catalog.ts` (Text case), `src/a2ui/common_origin_catalog_rules.txt`

**Workaround**: Add a variant mapping function in the catalog that translates A2UI variant names to DS variants. Not a DS change — this is a catalog-layer concern.

#### Prompt for DS Project

> No DS change needed. The catalog layer should handle variant mapping. Documenting for awareness only.
