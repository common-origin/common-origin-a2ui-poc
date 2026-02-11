/**
 * A2UI Message Validator — v0.9
 *
 * Validates parsed JSON objects against the v0.9 A2UI message schema.
 * Also accepts legacy v0.8 message names for backward compatibility.
 */

import { isValidComponent } from '@/src/a2ui/catalog';
import { validateComponentsMessage } from '@/src/lib/catalogValidator';
import type { A2UIMessage } from '@/src/a2ui/types';

// ── DoS Limits ────────────────────────────────────────────────────────────
/** Maximum components per updateComponents message. */
const MAX_COMPONENTS = 100;
/** Maximum children per component. */
const MAX_CHILDREN = 50;
/** Maximum data model payload size in bytes. */
const MAX_DATA_MODEL_BYTES = 51200; // 50 KB

export interface ValidationResult {
  valid: boolean;
  message?: A2UIMessage;
  errors: string[];
  warnings?: string[];
}

/** Known top-level message type keys (v0.9 + v0.8 legacy) */
const MESSAGE_TYPES = [
  // v0.9
  'createSurface',
  'updateComponents',
  'updateDataModel',
  'deleteSurface',
  // v0.8 legacy (still accepted)
  'surfaceUpdate',
  'dataModelUpdate',
  'beginRendering',
] as const;

type MessageTypeKey = (typeof MESSAGE_TYPES)[number];

/**
 * Validate that a parsed object is a well-formed A2UI message.
 */
export function validateA2UIMessage(parsed: unknown): ValidationResult {
  const errors: string[] = [];

  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return { valid: false, errors: ['Message must be a JSON object'] };
  }

  const obj = parsed as Record<string, unknown>;
  const keys = Object.keys(obj);
  const warnings: string[] = [];

  const matchedTypes = keys.filter((k) =>
    MESSAGE_TYPES.includes(k as MessageTypeKey)
  );

  if (matchedTypes.length === 0) {
    if ('error' in obj) {
      return { valid: true, message: obj as unknown as A2UIMessage, errors: [] };
    }
    return {
      valid: false,
      errors: [`No known message type found. Keys: ${keys.join(', ')}`],
    };
  }

  if (matchedTypes.length > 1) {
    return {
      valid: false,
      errors: [`Multiple message types in one object: ${matchedTypes.join(', ')}`],
    };
  }

  const type = matchedTypes[0] as MessageTypeKey;
  const body = obj[type];

  if (!body || typeof body !== 'object') {
    return { valid: false, errors: [`"${type}" body must be an object`] };
  }

  const bodyObj = body as Record<string, unknown>;

  if (!('surfaceId' in bodyObj) || typeof bodyObj.surfaceId !== 'string') {
    errors.push(`"${type}.surfaceId" must be a string`);
  }

  switch (type) {
    // v0.9 messages
    case 'createSurface':
      errors.push(...validateCreateSurface(bodyObj));
      break;
    case 'updateComponents': {
      errors.push(...validateUpdateComponents(bodyObj));
      // Deep catalog validation — warn on unknown props, missing required, bad enums
      if (Array.isArray(bodyObj.components)) {
        const catalogResult = validateComponentsMessage(bodyObj.components as Record<string, unknown>[]);
        warnings.push(...catalogResult.warnings);
        // Catalog errors are advisory — they log but don't block rendering
        if (catalogResult.errors.length > 0) {
          warnings.push(...catalogResult.errors.map(e => `[catalog] ${e}`));
        }
      }
      break;
    }
    case 'updateDataModel': {
      // DoS: cap data model payload size
      const dataStr = JSON.stringify(bodyObj.value ?? bodyObj);
      if (dataStr.length > MAX_DATA_MODEL_BYTES) {
        errors.push(`Data model payload too large (${dataStr.length} bytes). Maximum is ${MAX_DATA_MODEL_BYTES}`);
      }
      break;
    }
    case 'deleteSurface':
      break;
    // v0.8 legacy
    case 'surfaceUpdate': {
      errors.push(...validateUpdateComponents(bodyObj));
      if (Array.isArray(bodyObj.components)) {
        const catalogResult = validateComponentsMessage(bodyObj.components as Record<string, unknown>[]);
        warnings.push(...catalogResult.warnings);
        if (catalogResult.errors.length > 0) {
          warnings.push(...catalogResult.errors.map(e => `[catalog] ${e}`));
        }
      }
      break;
    }
    case 'dataModelUpdate':
      // Legacy contents array — accept as-is
      break;
    case 'beginRendering':
      errors.push(...validateBeginRendering(bodyObj));
      break;
  }

  if (errors.length > 0) {
    return { valid: false, errors, warnings };
  }

  return { valid: true, message: obj as unknown as A2UIMessage, errors: [], warnings };
}

function validateCreateSurface(body: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof body.catalogId !== 'string' || !body.catalogId) {
    errors.push('"createSurface.catalogId" must be a non-empty string');
  }
  return errors;
}

function validateUpdateComponents(body: Record<string, unknown>): string[] {
  const errors: string[] = [];

  if (!Array.isArray(body.components)) {
    errors.push('"components" must be an array');
    return errors;
  }

  // DoS: cap component count
  if (body.components.length > MAX_COMPONENTS) {
    errors.push(`Too many components (${body.components.length}). Maximum is ${MAX_COMPONENTS}`);
    return errors;
  }

  for (let i = 0; i < body.components.length; i++) {
    const comp = body.components[i] as Record<string, unknown>;

    if (!comp || typeof comp !== 'object') {
      errors.push(`Component [${i}] must be an object`);
      continue;
    }

    if (typeof comp.id !== 'string' || !comp.id) {
      errors.push(`Component [${i}] missing "id" string`);
    }

    // v0.9: component is a string discriminator
    if (typeof comp.component === 'string') {
      if (!isValidComponent(comp.component)) {
        errors.push(`Component [${i}] type "${comp.component}" not in catalog`);
      }
    }
    // v0.8 legacy: component is an object like { Text: {...} }
    else if (comp.component && typeof comp.component === 'object') {
      if (!isValidComponent(comp.component)) {
        const compType = Object.keys(comp.component as object)[0] || 'unknown';
        errors.push(`Component [${i}] type "${compType}" not in catalog`);
      }
    }
    else {
      errors.push(`Component [${i}] "component" must be a string (v0.9) or object (v0.8)`);
    }

    if (comp.children !== undefined) {
      if (!Array.isArray(comp.children)) {
        errors.push(`Component [${i}] "children" must be an array`);
      } else {
        if (!comp.children.every((c: unknown) => typeof c === 'string')) {
          errors.push(`Component [${i}] "children" must be an array of strings`);
        }
        if (comp.children.length > MAX_CHILDREN) {
          errors.push(`Component [${i}] has too many children (${comp.children.length}). Maximum is ${MAX_CHILDREN}`);
        }
      }
    }
  }

  return errors;
}

function validateBeginRendering(body: Record<string, unknown>): string[] {
  const errors: string[] = [];
  if (typeof body.root !== 'string' || !body.root) {
    errors.push('"beginRendering.root" must be a non-empty string');
  }
  if (typeof body.catalogId !== 'string' || !body.catalogId) {
    errors.push('"beginRendering.catalogId" must be a non-empty string');
  }
  return errors;
}
