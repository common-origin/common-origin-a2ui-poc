/**
 * Pattern Validator
 *
 * Validates A2UI surfaces and component trees against the registered
 * banking design system patterns.
 *
 * Usage:
 *   // Detect which patterns a surface conforms to
 *   const { matched } = detectPatterns(componentTypes);
 *
 *   // Validate a specific pattern
 *   const result = validatePattern('confirmation-flow', componentTypes);
 *   if (!result.valid) console.warn(result.failedRules);
 */

import { ALL_PATTERNS, getPattern } from './definitions';
import type {
  PatternDefinition,
  PatternValidationResult,
  PatternDetectionResult,
} from './types';

/**
 * Extract the unique list of component type names from an array of component
 * objects (e.g. the flat component list inside an updateComponents message).
 *
 * Accepts both:
 *  - An array of ComponentNode objects ({ component: string, ... })
 *  - A plain string array (component type names directly)
 */
export function extractComponentTypes(
  components: Array<{ component: string } | string>
): string[] {
  const types = components.map((c) =>
    typeof c === 'string' ? c : c.component
  );
  return [...new Set(types)];
}

/**
 * Validate a surface against a specific registered pattern.
 *
 * @param patternId - The pattern ID to validate against (e.g. 'confirmation-flow')
 * @param componentTypes - Unique component type strings present on the surface
 * @returns PatternValidationResult
 */
export function validatePattern(
  patternId: string,
  componentTypes: string[]
): PatternValidationResult {
  const pattern = getPattern(patternId);

  if (!pattern) {
    return {
      patternId,
      valid: false,
      missingComponents: [],
      failedRules: [`Unknown pattern: "${patternId}"`],
      detectedStates: [],
    };
  }

  const missingComponents = pattern.requiredComponents.filter(
    (c) => !componentTypes.includes(c)
  );

  const failedRules = pattern.validationRules
    .filter((rule) => !rule.check(componentTypes))
    .map((rule) => rule.description);

  const detectedStates = detectStates(pattern, componentTypes);

  return {
    patternId,
    valid: missingComponents.length === 0 && failedRules.length === 0,
    missingComponents,
    failedRules,
    detectedStates,
  };
}

/**
 * Detect which registered patterns a surface conforms to.
 *
 * Returns:
 *  - `matched`: patterns whose required components are all present AND all
 *    validation rules pass
 *  - `partial`: patterns where some (but not all) required components are
 *    present, sorted by coverage percentage descending
 *
 * @param componentTypes - Unique component type strings present on the surface
 */
export function detectPatterns(componentTypes: string[]): PatternDetectionResult {
  const matched: PatternDefinition[] = [];
  const partial: Array<{ pattern: PatternDefinition; coverage: number }> = [];

  for (const pattern of ALL_PATTERNS) {
    const result = validatePattern(pattern.id, componentTypes);

    if (result.valid) {
      matched.push(pattern);
    } else {
      const presentCount = pattern.requiredComponents.filter((c) =>
        componentTypes.includes(c)
      ).length;
      const coverage = presentCount / pattern.requiredComponents.length;
      if (coverage > 0) {
        partial.push({ pattern, coverage });
      }
    }
  }

  partial.sort((a, b) => b.coverage - a.coverage);

  return { matched, partial };
}

/**
 * Determine which interaction states are currently active on the surface.
 */
function detectStates(
  pattern: PatternDefinition,
  componentTypes: string[]
): string[] {
  if (!pattern.states) return [];

  return pattern.states
    .filter((state) => {
      if (!state.indicatorComponents || state.indicatorComponents.length === 0) {
        return false;
      }
      return state.indicatorComponents.some((c) => componentTypes.includes(c));
    })
    .map((state) => state.id);
}

/**
 * Validate all registered patterns against a component type set and return
 * a summary of compliance.  Useful for integration tests and demo dashboards.
 */
export function validateAllPatterns(componentTypes: string[]): PatternValidationResult[] {
  return ALL_PATTERNS.map((p) => validatePattern(p.id, componentTypes));
}
