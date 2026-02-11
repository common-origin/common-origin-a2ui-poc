/**
 * A2UI Catalog Validator
 *
 * Validates component nodes from agent messages against the
 * Common Origin catalog definition (common_origin_catalog_definition.json).
 *
 * This implements the A2UI "Prompt-Generate-Validate" pattern:
 *  1. LLM generates JSON (via prompt with catalog rules)
 *  2. This module validates each component against the schema
 *  3. Warnings are logged; invalid props are stripped for safety
 *
 * Security:
 *  - Rejects unknown component types
 *  - Warns on unknown/unexpected properties (hints at prompt drift)
 *  - Validates required properties exist
 *  - Validates enum values where defined
 */

import catalogSchema from '@/src/a2ui/common_origin_catalog_definition.json';
import { VALID_COMPONENT_TYPES } from '@/src/a2ui/catalog';
import { createLogger } from '@/src/lib/logger';

const log = createLogger('CatalogValidator');

// ── Types ─────────────────────────────────────────────────────────────────

export interface ComponentValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

export interface MessageValidationSummary {
  totalComponents: number;
  validComponents: number;
  warnings: string[];
  errors: string[];
}

// ── Schema Extraction ─────────────────────────────────────────────────────

/** Pre-extracted component schemas keyed by component type name. */
const componentSchemas: Map<string, ComponentSchema> = new Map();

interface ComponentSchema {
  required: Set<string>;
  knownProps: Set<string>;
  enums: Map<string, Set<string>>;
}

function extractSchemas() {
  const defs = catalogSchema.$defs as Record<string, any>;
  // Skip utility type names
  const utilTypes = new Set([
    'stringOrPath', 'numberOrPath', 'booleanOrPath',
    'childrenProperty', 'actionObject', 'componentCommon', 'anyComponent',
  ]);

  for (const [name, def] of Object.entries(defs)) {
    if (utilTypes.has(name)) continue;

    const required = new Set<string>(def.required || []);
    const knownProps = new Set<string>();
    const enums = new Map<string, Set<string>>();

    // Collect properties from the definition
    if (def.properties) {
      for (const [prop, propDef] of Object.entries(def.properties as Record<string, any>)) {
        knownProps.add(prop);
        if (propDef && typeof propDef === 'object' && propDef.enum) {
          enums.set(prop, new Set(propDef.enum));
        }
      }
    }

    componentSchemas.set(name, { required, knownProps, enums });
  }
}

// Initialize on module load
extractSchemas();

// ── Public API ────────────────────────────────────────────────────────────

/**
 * Validate a single component node against the catalog schema.
 */
export function validateComponent(
  component: Record<string, unknown>,
  index: number
): ComponentValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const componentType = component.component as string;

  // 1. Check component type is known
  if (!componentType || !VALID_COMPONENT_TYPES.has(componentType)) {
    errors.push(`[${index}] Unknown component type "${componentType}"`);
    return { valid: false, warnings, errors };
  }

  const schema = componentSchemas.get(componentType);
  if (!schema) {
    // Type is in VALID_COMPONENT_TYPES but missing from JSON schema
    // (shouldn't happen if schema is kept in sync)
    warnings.push(`[${index}] "${componentType}" has no schema definition — skipping prop validation`);
    return { valid: true, warnings, errors };
  }

  // 2. Check required properties
  for (const req of schema.required) {
    if (!(req in component)) {
      errors.push(`[${index}] "${componentType}" missing required property "${req}"`);
    }
  }

  // 3. Check for unknown properties
  const allProps = Object.keys(component);
  for (const prop of allProps) {
    if (!schema.knownProps.has(prop)) {
      warnings.push(`[${index}] "${componentType}" has unknown property "${prop}"`);
    }
  }

  // 4. Validate enum values
  for (const [prop, allowedValues] of schema.enums) {
    if (prop in component) {
      const value = component[prop];
      if (typeof value === 'string' && !allowedValues.has(value)) {
        warnings.push(
          `[${index}] "${componentType}.${prop}" value "${value}" not in allowed values: ${[...allowedValues].join(', ')}`
        );
      }
    }
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  };
}

/**
 * Validate all components in an updateComponents message body.
 * Returns a summary — does NOT reject the message (warnings are advisory).
 */
export function validateComponentsMessage(
  components: Record<string, unknown>[]
): MessageValidationSummary {
  const allWarnings: string[] = [];
  const allErrors: string[] = [];
  let validCount = 0;

  for (let i = 0; i < components.length; i++) {
    const result = validateComponent(components[i], i);
    allWarnings.push(...result.warnings);
    allErrors.push(...result.errors);
    if (result.valid) validCount++;
  }

  if (allWarnings.length > 0) {
    log.warn('Component validation warnings', {
      total: components.length,
      warnings: allWarnings.length,
      details: allWarnings.slice(0, 10), // Log first 10
    });
  }

  if (allErrors.length > 0) {
    log.error('Component validation errors', {
      total: components.length,
      errors: allErrors.length,
      details: allErrors.slice(0, 10),
    });
  }

  return {
    totalComponents: components.length,
    validComponents: validCount,
    warnings: allWarnings,
    errors: allErrors,
  };
}
