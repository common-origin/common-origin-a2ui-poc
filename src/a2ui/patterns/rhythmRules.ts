/**
 * Global Visual Rhythm Rules
 *
 * These rules apply to EVERY surface regardless of which pattern is active.
 * They encode the visual grammar shared across all banking UX flows:
 *
 *   - Consistent spacing between form fields and sections
 *   - Button placement and ordering conventions  
 *   - Input field containment (always inside a Stack)
 *   - Uniform button sizing within the same group
 *
 * Rules return an array of violation messages (empty = pass).
 * They are informational / warnings — they do not affect `valid` on
 * PatternValidationResult so a surface can still render; violations are
 * surfaced to developers and logged for agent improvement.
 *
 * Run via: checkRhythm(nodes) in patternValidator.ts
 */

import type { RhythmRule } from './types';

// ---------------------------------------------------------------------------
// Rule helpers
// ---------------------------------------------------------------------------

const INPUT_TYPES = new Set([
  'TextField',
  'NumberField',
  'Select',
  'Checkbox',
  'SearchField',
  'DateField',
]);

const BUTTON_TYPES = new Set(['Button']);

// ---------------------------------------------------------------------------
// Rule 1 — stack-gap-declared
// ---------------------------------------------------------------------------

/**
 * Every Stack must declare a `gap` or `spacing` prop.
 *
 * Without a gap value the agent relies on the browser's default margin
 * collapsing — which varies. Explicitly declared gaps ensure identical
 * vertical rhythm across scrollable surfaces and different screen sizes.
 *
 * Recommended values (design token names):
 *   "xs"  →  4 px  — icon rows, inline chips
 *   "sm"  →  8 px  — tight label/value pairs
 *   "md"  → 16 px  — form fields, card sections   ← default for forms
 *   "lg"  → 24 px  — section-level spacing
 *   "xl"  → 32 px  — top-level page sections
 */
export const stackGapDeclared: RhythmRule = {
  id: 'stack-gap-declared',
  description: 'Every Stack must declare a gap or spacing prop for predictable vertical rhythm',
  check: (nodes) => {
    const violations: string[] = [];
    for (const node of nodes) {
      if (node.component === 'Stack') {
        const hasGap =
          node.gap !== undefined ||
          node.spacing !== undefined ||
          node.space !== undefined;
        if (!hasGap) {
          violations.push(
            `Stack "${node.id}" has no gap/spacing prop — add gap="md" (or xs/sm/lg/xl as appropriate)`
          );
        }
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule 2 — primary-button-last
// ---------------------------------------------------------------------------

/**
 * In a group of Buttons inside the same Stack, the primary action Button
 * must be last (trailing position).
 *
 * This matches the conventional "Cancel / Back  →  Confirm / Continue"
 * reading order: destructive/escape actions lead, commit actions trail.
 * It also aligns with right-alignment conventions when the Stack is horizontal.
 *
 * A primary button is one with: variant="primary", no variant, or variant
 * not set to "secondary", "ghost", "destructive", or "link".
 */
export const primaryButtonLast: RhythmRule = {
  id: 'primary-button-last',
  description:
    'The primary action Button must be the last button in its Stack (trailing position)',
  check: (nodes, ctx) => {
    const violations: string[] = [];
    const SECONDARY_VARIANTS = new Set(['secondary', 'ghost', 'destructive', 'link', 'text']);

    for (const node of nodes) {
      if (node.component !== 'Stack') continue;

      const buttonChildren = ctx
        .childrenOf(node.id)
        .filter((c) => BUTTON_TYPES.has(c.component));

      if (buttonChildren.length < 2) continue;

      const lastButton = buttonChildren[buttonChildren.length - 1];
      const primaryButtons = buttonChildren.filter(
        (b) => !b.variant || !SECONDARY_VARIANTS.has(String(b.variant))
      );

      for (const pb of primaryButtons) {
        if (pb.id !== lastButton.id) {
          violations.push(
            `Primary Button "${pb.id}" in Stack "${node.id}" must be the last button ` +
              `(place secondary/cancel actions before primary/confirm actions)`
          );
        }
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule 3 — form-actions-at-bottom
// ---------------------------------------------------------------------------

/**
 * In any Stack containing both input fields and Buttons, all Buttons must
 * appear AFTER all input fields in the children order.
 *
 * An action group floating above inputs creates visual interruption and
 * breaks the user's top-to-bottom task flow (fill in → submit).
 */
export const formActionsAtBottom: RhythmRule = {
  id: 'form-actions-at-bottom',
  description:
    'Action Buttons must follow all input fields in a form Stack — inputs lead, actions trail',
  check: (nodes, ctx) => {
    const violations: string[] = [];

    for (const node of nodes) {
      if (node.component !== 'Stack') continue;

      const children = ctx.childrenOf(node.id);
      let lastInputIdx = -1;
      let firstButtonIdx = -1;

      children.forEach((child, idx) => {
        if (INPUT_TYPES.has(child.component)) lastInputIdx = idx;
        if (BUTTON_TYPES.has(child.component) && firstButtonIdx === -1)
          firstButtonIdx = idx;
      });

      if (lastInputIdx !== -1 && firstButtonIdx !== -1 && firstButtonIdx < lastInputIdx) {
        violations.push(
          `Stack "${node.id}" has Buttons (index ${firstButtonIdx}) before input fields ` +
            `(last input index ${lastInputIdx}) — move all Buttons after all inputs`
        );
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule 4 — consistent-button-size
// ---------------------------------------------------------------------------

/**
 * All Buttons in the same Stack must share the same `size` value.
 *
 * Mixing "sm" and "lg" buttons in a single action row creates uneven
 * vertical rhythm and draws the eye away from the intended hierarchy.
 * Prefer "md" (default) for all standard button groups.
 */
export const consistentButtonSize: RhythmRule = {
  id: 'consistent-button-size',
  description:
    'Buttons within the same Stack must share the same size prop for uniform visual weight',
  check: (nodes, ctx) => {
    const violations: string[] = [];

    for (const node of nodes) {
      if (node.component !== 'Stack') continue;

      const buttons = ctx.childrenOf(node.id).filter((c) => BUTTON_TYPES.has(c.component));
      if (buttons.length < 2) continue;

      // Normalise undefined → "default" for comparison
      const sizes = new Set(buttons.map((b) => String(b.size ?? 'default')));
      if (sizes.size > 1) {
        const detail = buttons
          .map((b) => `"${b.id}" (${b.size ?? 'default'})`)
          .join(', ');
        violations.push(
          `Stack "${node.id}" has Buttons with mixed sizes [${[...sizes].join(', ')}]: ${detail}. ` +
            `Use the same size for all Buttons in a group.`
        );
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule 5 — inputs-wrapped-in-stack
// ---------------------------------------------------------------------------

/**
 * Input fields (TextField, NumberField, Select, Checkbox, SearchField) must
 * always be direct children of a Stack.
 *
 * A floating input with no Stack parent cannot participate in the gap-based
 * spacing system, produces inconsistent vertical rhythm, and makes form
 * layout unpredictable across viewport sizes.
 */
export const inputsWrappedInStack: RhythmRule = {
  id: 'inputs-wrapped-in-stack',
  description:
    'Input fields must be direct children of a Stack — never at root level or inside a non-layout container',
  check: (nodes, ctx) => {
    const LAYOUT_CONTAINERS = new Set(['Stack', 'Box', 'Card', 'Form']);
    const violations: string[] = [];

    for (const node of nodes) {
      if (!INPUT_TYPES.has(node.component)) continue;

      const pid = ctx.parentId.get(node.id);

      if (!pid) {
        violations.push(
          `${node.component} "${node.id}" is at root level — wrap it in a Stack with gap="md"`
        );
        continue;
      }

      const parent = ctx.nodesById.get(pid);
      if (parent && !LAYOUT_CONTAINERS.has(parent.component)) {
        violations.push(
          `${node.component} "${node.id}" is inside a ${parent.component} — ` +
            `input fields should be direct children of Stack (not ${parent.component})`
        );
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Rule 6 — section-heading-before-content
// ---------------------------------------------------------------------------

/**
 * Within a Stack, if a heading Text (variant h1/h2/h3/heading/title) is present,
 * it must be the first child — headings should never follow body content.
 *
 * This enforces the scanning hierarchy: title → summary → detail → actions.
 */
export const sectionHeadingFirst: RhythmRule = {
  id: 'section-heading-first',
  description:
    'Heading Text components must be the first child of their Stack — title before body content',
  check: (nodes, ctx) => {
    const HEADING_VARIANTS = new Set(['h1', 'h2', 'h3', 'heading', 'title', 'subtitle']);
    const violations: string[] = [];

    for (const node of nodes) {
      if (node.component !== 'Stack') continue;

      const children = ctx.childrenOf(node.id);
      let firstNonHeadingIdx = -1;

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        const isHeading =
          child.component === 'Text' && HEADING_VARIANTS.has(String(child.variant ?? ''));

        if (!isHeading && firstNonHeadingIdx === -1) {
          firstNonHeadingIdx = i;
        }

        if (isHeading && firstNonHeadingIdx !== -1) {
          violations.push(
            `Heading Text "${child.id}" (variant="${child.variant}") in Stack "${node.id}" ` +
              `appears after non-heading content (index ${i} vs first non-heading at ${firstNonHeadingIdx}). ` +
              `Move headings to the top of the Stack.`
          );
        }
      }
    }
    return violations;
  },
};

// ---------------------------------------------------------------------------
// Registry — exported as the canonical global rule set
// ---------------------------------------------------------------------------

/**
 * The full set of global visual rhythm rules.
 * Applied to every surface via checkRhythm() in patternValidator.ts.
 */
export const GLOBAL_RHYTHM_RULES: RhythmRule[] = [
  stackGapDeclared,
  primaryButtonLast,
  formActionsAtBottom,
  consistentButtonSize,
  inputsWrappedInStack,
  sectionHeadingFirst,
];
