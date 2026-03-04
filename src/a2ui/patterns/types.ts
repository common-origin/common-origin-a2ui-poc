import type { ComponentNode } from '../types';

/**
 * Pattern Definition Types — A2UI Pattern Layer
 *
 * Patterns are named compositions of components that represent reusable,
 * validated UI structures. They sit between individual components and
 * full-screen layouts — the middle tier of the design system hierarchy:
 *
 *   Layout (full screen)
 *     └── Patterns  ← named compositions with rules
 *           └── Components (atoms/molecules)
 *
 * Patterns are the governance layer that ensures agent-generated UIs are
 * structurally consistent and predictable, even when component selection
 * varies between agent calls.
 */

// ---------------------------------------------------------------------------
// Core types
// ---------------------------------------------------------------------------

export type PatternCategory =
  | 'data-display'     // Read-only information layouts
  | 'progressive-input' // Multi-step forms and input flows
  | 'navigation'       // Browse/drill-down/search flows
  | 'agentic';         // Patterns unique to agent-driven UX

/** A single validation rule for a pattern. */
export interface PatternRule {
  /** Human-readable description of what this rule checks. */
  description: string;
  /**
   * Validator function. Receives the flat list of component TYPE strings
   * present on the surface (e.g. ['Stack', 'Text', 'Button', 'Alert']).
   * Returns true if the rule passes.
   */
  check: (componentTypes: string[]) => boolean;
}

// ---------------------------------------------------------------------------
// Rhythm rules — visual consistency checks that operate on the full tree
// ---------------------------------------------------------------------------

/**
 * Tree-traversal helper passed to every RhythmRule.check call.
 * Build once per surface via buildRhythmContext() in patternValidator.ts.
 */
export interface RhythmContext {
  /** All component nodes keyed by id. */
  nodesById: Map<string, ComponentNode>;
  /** Maps each node id to its parent's id (undefined for root-level nodes). */
  parentId: Map<string, string>;
  /** Returns the resolved child ComponentNodes of the given node id. */
  childrenOf: (id: string) => ComponentNode[];
  /** Returns the sibling ComponentNodes that share the same parent. */
  siblingsOf: (id: string) => ComponentNode[];
}

/**
 * A layout/visual-consistency rule that can inspect component props and
 * tree relationships — not just component type presence.
 *
 * Returning an empty array means the rule passes.
 * Returning one or more strings means those violations were found.
 */
export interface RhythmRule {
  /** Unique slug for this rule, used in violation reports. */
  id: string;
  /** One-line description of what this rule enforces. */
  description: string;
  /**
   * Checker function.
   * @param nodes - Full flat component list for the surface.
   * @param ctx   - Tree-traversal helper (parent map, child lookups, etc.).
   * @returns Array of human-readable violation messages (empty = pass).
   */
  check: (nodes: ComponentNode[], ctx: RhythmContext) => string[];
}

/** A single rhythm rule violation recorded during surface validation. */
export interface RhythmViolation {
  /** ID of the RhythmRule that fired. */
  ruleId: string;
  /** Human-readable rule description. */
  description: string;
  /** Specific messages explaining what was wrong and which components are affected. */
  messages: string[];
}

/** A named state within a pattern's interaction lifecycle. */
export interface PatternState {
  /** Unique identifier for this state (e.g. "form", "review", "success"). */
  id: string;
  /** Human-readable description. */
  description: string;
  /**
   * Component types that signal this state is active.
   * If any of these components is present, the surface is in this state.
   */
  indicatorComponents?: string[];
}

/** Full definition of a design system pattern. */
export interface PatternDefinition {
  /**
   * Unique slug for this pattern (kebab-case).
   * Referenced by name in system prompts.
   * @example 'confirmation-flow'
   */
  id: string;

  /** Display name shown in documentation and tooling. */
  name: string;

  /** Broad category for grouping and filtering. */
  category: PatternCategory;

  /** One-line description of what this pattern does. */
  description: string;

  /**
   * Component types that MUST be present for this pattern.
   * The validator will flag missing required components.
   */
  requiredComponents: string[];

  /**
   * Component types that are conventionally included but not mandatory.
   * Used for suggestions and soft guidance.
   */
  typicalComponents: string[];

  /**
   * Named states in the pattern's interaction lifecycle.
   * Ordered from first state to last.
   */
  states?: PatternState[];

  /**
   * Programmatic validation rules.
   * All rules must pass for the pattern to be considered valid.
   */
  validationRules: PatternRule[];

  /**
   * Per-pattern rhythm rules — layout/visual-consistency checks specific to
   * this pattern that supplement the global GLOBAL_RHYTHM_RULES.
   * Optional: patterns without special layout requirements omit this.
   */
  rhythmRules?: RhythmRule[];

  /**
   * Compact agent guidance injected into system prompts.
   * Written as directive prose (imperative, concise).
   */
  agentGuidance: string;

  /**
   * Scenario IDs that commonly use this pattern.
   * Matches ScenarioType values from queryRouter.ts.
   */
  usedBy: string[];
}

// ---------------------------------------------------------------------------
// Validation result types
// ---------------------------------------------------------------------------

export interface PatternValidationResult {
  patternId: string;
  valid: boolean;
  /** Required components not found on the surface. */
  missingComponents: string[];
  /** Descriptions of rules that failed. */
  failedRules: string[];
  /** States detected as active. */
  detectedStates: string[];
  /** Visual rhythm violations found — non-blocking warnings for layout consistency. */
  rhythmViolations: RhythmViolation[];
}

export interface PatternDetectionResult {
  /** Patterns whose required components are all present. */
  matched: PatternDefinition[];
  /** Patterns with partial matches (some required components present). */
  partial: Array<{ pattern: PatternDefinition; coverage: number }>;
}
