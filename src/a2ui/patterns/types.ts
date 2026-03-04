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
}

export interface PatternDetectionResult {
  /** Patterns whose required components are all present. */
  matched: PatternDefinition[];
  /** Patterns with partial matches (some required components present). */
  partial: Array<{ pattern: PatternDefinition; coverage: number }>;
}
