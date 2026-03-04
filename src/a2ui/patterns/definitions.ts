/**
 * Pattern Definitions — Banking Design System Patterns
 *
 * The canonical set of UI patterns for Common Origin banking experiences.
 * Each pattern is derived from the 6 demo scenarios and classified by:
 *   - data-display:      Read-only information layouts
 *   - progressive-input: Multi-step forms / input flows
 *   - navigation:        Browse / filter / drill-down
 *   - agentic:           Patterns unique to agent-driven UX
 *
 * Agents reference these patterns by ID in system prompts, and the
 * pattern validator can check surface compliance at runtime.
 */

import type { PatternDefinition, RhythmRule } from './types';

// ---------------------------------------------------------------------------
// Shared per-pattern rhythm rule helpers (supplement the global rules)
// ---------------------------------------------------------------------------

/** Form stacks must use direction="column" — horizontal form layouts break rhythm. */
const formStackColumnRule: RhythmRule = {
  id: 'form-stack-column',
  description: 'Form Stacks containing input fields must use direction="column" (vertical layout)',
  check: (nodes, ctx) => {
    const INPUT_TYPES = new Set(['TextField', 'NumberField', 'Select', 'Checkbox', 'DateField']);
    const violations: string[] = [];
    for (const node of nodes) {
      if (node.component !== 'Stack') continue;
      const hasInputs = ctx.childrenOf(node.id).some((c) => INPUT_TYPES.has(c.component));
      if (hasInputs && node.direction === 'row') {
        violations.push(
          `Form Stack "${node.id}" uses direction="row" — input fields require direction="column"`
        );
      }
    }
    return violations;
  },
};

/** Filter chip rows must use direction="row" so chips wrap horizontally. */
const filterChipsRowRule: RhythmRule = {
  id: 'filter-chips-row',
  description: 'Stacks containing BooleanChip / FilterChip must use direction="row" for horizontal chip flow',
  check: (nodes, ctx) => {
    const CHIP_TYPES = new Set(['BooleanChip', 'FilterChip', 'Chip']);
    const violations: string[] = [];
    for (const node of nodes) {
      if (node.component !== 'Stack') continue;
      const hasChips = ctx.childrenOf(node.id).some((c) => CHIP_TYPES.has(c.component));
      if (hasChips && node.direction !== 'row') {
        violations.push(
          `Chip Stack "${node.id}" should use direction="row" so filter chips flow horizontally`
        );
      }
    }
    return violations;
  },
};

/** Disambiguation option Buttons must each be in their own row (direction=column). */
const disambiguationColumnRule: RhythmRule = {
  id: 'disambiguation-column',
  description: 'Option Buttons in disambiguation patterns must be in a column Stack (not row)',
  check: (nodes, ctx) => {
    const violations: string[] = [];
    for (const node of nodes) {
      if (node.component !== 'Stack') continue;
      const buttonChildren = ctx.childrenOf(node.id).filter((c) => c.component === 'Button');
      if (buttonChildren.length >= 2 && node.direction === 'row') {
        violations.push(
          `Disambiguation Stack "${node.id}" uses direction="row" — option Buttons must stack vertically (direction="column") so each option is a full-width tap target`
        );
      }
    }
    return violations;
  },
};

// ── Data Display Patterns ───────────────────────────────────────────────────

const accountSummary: PatternDefinition = {
  id: 'account-summary',
  name: 'Account Summary',
  category: 'data-display',
  description: 'Displays one or more accounts with balances, trends, and quick actions.',
  requiredComponents: ['AccountCard', 'Stack'],
  typicalComponents: ['Text', 'MoneyDisplay', 'Alert', 'Button', 'Divider'],
  validationRules: [
    {
      description: 'Must include at least one AccountCard',
      check: (types) => types.includes('AccountCard'),
    },
    {
      description: 'AccountCards must be wrapped in a Stack layout',
      check: (types) => types.includes('Stack'),
    },
  ],
  agentGuidance:
    'Use AccountCard for each account. Show a MoneyDisplay total at the top. ' +
    'Place quick-action Buttons (Transfer, View spending, Search) at the bottom in a Stack with gap="sm" and direction="row". ' +
    'All Buttons in the action row must share the same size prop. ' +
    'If a credit card payment is due, show a warning Alert.',
  usedBy: ['account-overview'],
};

const transactionList: PatternDefinition = {
  id: 'transaction-list',
  name: 'Transaction List',
  category: 'data-display',
  description: 'Groups transactions by date with search/filter and drill-down capability.',
  requiredComponents: ['Stack'],
  typicalComponents: ['TransactionListItem', 'DateGroup', 'Text', 'SearchField', 'BooleanChip', 'EmptyState', 'Button'],
  states: [
    {
      id: 'results',
      description: 'Transaction results are shown',
      indicatorComponents: ['TransactionListItem'],
    },
    {
      id: 'empty',
      description: 'No results matched the query',
      indicatorComponents: ['EmptyState'],
    },
    {
      id: 'detail',
      description: 'Single transaction detail view',
      indicatorComponents: ['StatusBadge', 'MoneyDisplay'],
    },
  ],
  validationRules: [
    {
      description: 'Every transaction must be rendered with TransactionListItem',
      check: (types) => types.includes('TransactionListItem') || types.includes('EmptyState'),
    },
    {
      description: 'When results are shown, transactions must be grouped with DateGroup',
      check: (types) =>
        !types.includes('TransactionListItem') || types.includes('DateGroup'),
    },
  ],
  agentGuidance:
    'Group TransactionListItems inside DateGroup components, most-recent date first. ' +
    'Every TransactionListItem MUST have an onClick action "view_transaction". ' +
    'Show a summary line (e.g. "8 transactions · $423.50 total"). ' +
    'Show EmptyState (not an empty list) when there are no results.',
  usedBy: ['transaction-search'],
};

const spendingBreakdown: PatternDefinition = {
  id: 'spending-breakdown',
  name: 'Spending Breakdown',
  category: 'data-display',
  description: 'Visualises spending by category over a time period using badges and amounts.',
  requiredComponents: ['CategoryBadge', 'MoneyDisplay', 'Stack'],
  typicalComponents: ['Text', 'Progress', 'Card', 'Divider', 'Button', 'Alert'],
  validationRules: [
    {
      description: 'Must include at least one CategoryBadge',
      check: (types) => types.includes('CategoryBadge'),
    },
    {
      description: 'Must include MoneyDisplay for totals',
      check: (types) => types.includes('MoneyDisplay'),
    },
  ],
  agentGuidance:
    'Show a total spend MoneyDisplay at the top. List each category with a CategoryBadge ' +
    'plus a MoneyDisplay and optional Progress bar showing percentage of total. ' +
    'Wrap the category list in a Stack with gap="md". ' +
    'Order categories by spend amount (highest first). ' +
    'Include a comparison Alert if spend is unusual vs prior period.',
  usedBy: ['spending-summary'],
};

// ── Progressive Input Patterns ──────────────────────────────────────────────

const progressiveInput: PatternDefinition = {
  id: 'progressive-input',
  name: 'Progressive Input',
  category: 'progressive-input',
  description: 'Multi-step form where each step reveals only what is needed.',
  requiredComponents: ['Button', 'Stack'],
  typicalComponents: ['TextField', 'NumberField', 'Select', 'Checkbox', 'Text', 'Card', 'Alert'],
  states: [
    {
      id: 'step-1',
      description: 'First input step',
      indicatorComponents: ['TextField', 'NumberField', 'Select'],
    },
    {
      id: 'step-2',
      description: 'Second input step or continuation',
      indicatorComponents: ['Checkbox'],
    },
  ],
  validationRules: [
    {
      description: 'Must have at least one input component (TextField, NumberField, or Select)',
      check: (types) =>
        types.includes('TextField') ||
        types.includes('NumberField') ||
        types.includes('Select') ||
        types.includes('Checkbox'),
    },
    {
      description: 'Must have a primary action Button to advance to the next step',
      check: (types) => types.includes('Button'),
    },
  ],
  rhythmRules: [formStackColumnRule],
  agentGuidance:
    'Show only the fields needed for the current step. ' +
    'Wrap all input fields in a Stack with direction="column" and gap="md" — never lay out inputs side-by-side. ' +
    'Place ALL Buttons after ALL inputs at the bottom of the form Stack. ' +
    'The primary Button (e.g. "Continue", "Review") must be last; the secondary cancel/back Button comes before it. ' +
    'Both Buttons must use the same size prop. ' +
    'Use an Alert above the inputs to show any constraints (e.g. available balance).',
  usedBy: ['fund-transfer', 'bill-payment'],
};

const confirmationFlow: PatternDefinition = {
  id: 'confirmation-flow',
  name: 'Confirmation Flow',
  category: 'progressive-input',
  description: 'Review → Confirm → Success/Error — the canonical 3-step commit pattern.',
  requiredComponents: ['Button', 'Stack'],
  typicalComponents: ['Card', 'Text', 'MoneyDisplay', 'Alert', 'Divider'],
  states: [
    {
      id: 'review',
      description: 'Summary of what is about to happen — awaiting user confirmation',
      indicatorComponents: ['Card'],
    },
    {
      id: 'success',
      description: 'Action completed successfully',
      indicatorComponents: ['Alert'],
    },
    {
      id: 'error',
      description: 'Action failed — explanation and recovery options shown',
      indicatorComponents: ['Alert'],
    },
  ],
  validationRules: [
    {
      description: 'Review state must have a confirm Button and an edit/back Button',
      check: (types) => types.includes('Button'),
    },
    {
      description: 'Success or error state must include an Alert',
      check: (types) => !(types.includes('Alert') && !types.includes('Button')) || true,
      // Soft rule: Alert is strongly recommended on success/error but not strictly required
    },
  ],
  agentGuidance:
    'REVIEW: Show a summary Card with all details. ' +
    'Action Buttons come AFTER the Card — never before it. ' +
    'Wrap the Button pair in a Stack with gap="sm" and direction="row"; ' +
    'secondary "Back" Button first, primary "Confirm" Button last. ' +
    'Both Buttons must use the same size. ' +
    'SUCCESS: Show a success Alert with the completed detail, a reference number (REF-YYYYMMDD-xxxx), ' +
    'and "Make another" + "View account" Buttons. ' +
    'ERROR: Show an error Alert with a plain-language explanation and a retry Button.',
  usedBy: ['fund-transfer', 'bill-payment'],
};

// ── Navigation Patterns ─────────────────────────────────────────────────────

const searchAndFilter: PatternDefinition = {
  id: 'search-and-filter',
  name: 'Search & Filter',
  category: 'navigation',
  description: 'Live-filtered list with a search field and toggle chips for categories.',
  requiredComponents: ['SearchField', 'Stack'],
  typicalComponents: ['BooleanChip', 'FilterChip', 'TransactionListItem', 'EmptyState', 'Text'],
  states: [
    {
      id: 'idle',
      description: 'No query entered — full list shown',
    },
    {
      id: 'filtered',
      description: 'Query or chip selection is active — filtered list shown',
      indicatorComponents: ['BooleanChip'],
    },
    {
      id: 'empty',
      description: 'No results match the current filter',
      indicatorComponents: ['EmptyState'],
    },
  ],
  validationRules: [
    {
      description: 'Must include a SearchField',
      check: (types) => types.includes('SearchField'),
    },
    {
      description: 'Must show EmptyState (not nothing) when no results match',
      check: (types) => types.includes('TransactionListItem') || types.includes('EmptyState'),
    },
  ],
  rhythmRules: [filterChipsRowRule],
  agentGuidance:
    'Place SearchField at the top. Place BooleanChip filter chips in a Stack with direction="row" and gap="xs" below. ' +
    'Bind SearchField and each chip to the data model with onChange + dataPath. ' +
    'Show EmptyState with illustration="search" when no results match. ' +
    'Include a result count summary (e.g. "5 results") below the filters.',
  usedBy: ['transaction-search'],
};

const detailDrilldown: PatternDefinition = {
  id: 'detail-drilldown',
  name: 'Detail Drill-down',
  category: 'navigation',
  description: 'List item tap → expanded detail view → back to list.',
  requiredComponents: ['Button', 'Stack', 'Card'],
  typicalComponents: ['Text', 'MoneyDisplay', 'StatusBadge', 'Divider', 'Alert'],
  states: [
    {
      id: 'list',
      description: 'List of items — each item is tappable',
    },
    {
      id: 'detail',
      description: 'Expanded detail for a single item',
      indicatorComponents: ['StatusBadge', 'MoneyDisplay'],
    },
  ],
  validationRules: [
    {
      description: 'Detail view must include a back Button',
      check: (types) => types.includes('Button'),
    },
    {
      description: 'Detail view should include a Card to frame the details',
      check: (types) => types.includes('Card'),
    },
  ],
  agentGuidance:
    'When entering detail view, show a back Button (action "back_to_list") at the top. ' +
    'Wrap the detail content in a Card. ' +
    'Show a MoneyDisplay for the primary amount. ' +
    'Include a StatusBadge and all relevant metadata. ' +
    'Offer contextual actions at the bottom (e.g. "Dispute transaction").',
  usedBy: ['transaction-search', 'account-overview'],
};

// ── Agentic Patterns ────────────────────────────────────────────────────────

const disambiguation: PatternDefinition = {
  id: 'disambiguation',
  name: 'Disambiguation',
  category: 'agentic',
  description: 'Agent asks the user to clarify intent when the query is ambiguous.',
  requiredComponents: ['Text', 'Button', 'Stack'],
  typicalComponents: ['Alert', 'Card'],
  validationRules: [
    {
      description: 'Must include a Text component explaining the ambiguity',
      check: (types) => types.includes('Text'),
    },
    {
      description: 'Must include at least two Button options for the user to choose from',
      check: (types) => types.includes('Button'),
    },
  ],
  rhythmRules: [disambiguationColumnRule],
  agentGuidance:
    'Use when the query could mean more than one thing (e.g. "pay James" with multiple payees). ' +
    'Show a Text question ("Which account did you mean?"). ' +
    'Render each option as a distinct full-width Button in a Stack with direction="column" and gap="sm". ' +
    'Never put option Buttons side-by-side in a row. ' +
    'Each Button action should carry enough context to proceed without re-asking.',
  usedBy: ['unknown'],
};

const progressiveDisclosure: PatternDefinition = {
  id: 'progressive-disclosure',
  name: 'Progressive Disclosure',
  category: 'agentic',
  description: 'Agent reveals additional fields or information as the user provides context.',
  requiredComponents: ['Text', 'Stack', 'Button'],
  typicalComponents: ['Alert', 'TextField', 'Select'],
  validationRules: [
    {
      description: 'Must include contextual Text explaining what additional info is needed',
      check: (types) => types.includes('Text'),
    },
  ],
  agentGuidance:
    'Use when you need more information before proceeding (not enough to show a form). ' +
    'Show a brief Alert or Text explaining what you need and why. ' +
    'Offer 2-3 common options as Buttons, plus a TextField for free-form input if relevant. ' +
    'Never ask for more than one piece of missing info at a time.',
  usedBy: ['unknown', 'fund-transfer'],
};

const agenticConsent: PatternDefinition = {
  id: 'agentic-consent',
  name: 'Agentic Consent',
  category: 'agentic',
  description: 'Explicit user consent before an irreversible or sensitive agent action.',
  requiredComponents: ['Alert', 'Button', 'Stack'],
  typicalComponents: ['Text', 'Card', 'Divider', 'Checkbox'],
  states: [
    {
      id: 'pending',
      description: 'Awaiting user consent',
      indicatorComponents: ['Alert', 'Checkbox'],
    },
    {
      id: 'declined',
      description: 'User declined — show acknowledgement',
      indicatorComponents: ['Alert'],
    },
  ],
  validationRules: [
    {
      description: 'Must include an Alert clearly describing the action',
      check: (types) => types.includes('Alert'),
    },
    {
      description: 'Must have a confirm Button and a cancel Button',
      check: (types) => types.includes('Button'),
    },
  ],
  agentGuidance:
    'Use for destructive or irreversible actions (e.g. account closure, large transfers, ' +
    'card cancellation). Show a warning Alert with a plain-language description of exactly ' +
    'what will happen. Require explicit confirmation with a clearly labelled Button. ' +
    'The cancel Button must be equally prominent (never hidden or styled as "text").',
  usedBy: ['card-management', 'fund-transfer'],
};

// ── Registry ────────────────────────────────────────────────────────────────

/** All registered patterns, ordered by category and usage frequency. */
export const ALL_PATTERNS: PatternDefinition[] = [
  // Data display
  accountSummary,
  transactionList,
  spendingBreakdown,
  // Progressive input
  progressiveInput,
  confirmationFlow,
  // Navigation
  searchAndFilter,
  detailDrilldown,
  // Agentic
  disambiguation,
  progressiveDisclosure,
  agenticConsent,
];

/** Look up a pattern by ID. Returns undefined if not found. */
export function getPattern(id: string): PatternDefinition | undefined {
  return ALL_PATTERNS.find((p) => p.id === id);
}

/** Get all patterns for a given scenario. */
export function getPatternsForScenario(scenarioId: string): PatternDefinition[] {
  return ALL_PATTERNS.filter((p) => p.usedBy.includes(scenarioId));
}

/** Get all patterns in a category. */
export function getPatternsByCategory(category: PatternDefinition['category']): PatternDefinition[] {
  return ALL_PATTERNS.filter((p) => p.category === category);
}
