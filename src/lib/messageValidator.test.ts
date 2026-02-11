import { describe, it, expect } from 'vitest';
import { validateA2UIMessage } from './messageValidator';

describe('validateA2UIMessage', () => {
  // ── Valid v0.9 messages ──────────────────────────────────────────────

  it('accepts a valid createSurface message', () => {
    const result = validateA2UIMessage({
      createSurface: {
        surfaceId: 'main',
        catalogId: 'common-origin.design-system:v2.4',
      },
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('accepts a valid updateComponents message', () => {
    const result = validateA2UIMessage({
      updateComponents: {
        surfaceId: 'main',
        components: [
          { id: 'root', component: 'Stack', direction: 'column', children: ['h1'] },
          { id: 'h1', component: 'Text', text: 'Hello' },
        ],
      },
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('accepts a valid updateDataModel message', () => {
    const result = validateA2UIMessage({
      updateDataModel: {
        surfaceId: 'main',
        value: { query: 'Woolworths', totalAmount: -87.43 },
      },
    });
    expect(result.valid).toBe(true);
  });

  it('accepts a valid deleteSurface message', () => {
    const result = validateA2UIMessage({
      deleteSurface: { surfaceId: 'main' },
    });
    expect(result.valid).toBe(true);
  });

  // ── Structural errors ───────────────────────────────────────────────

  it('rejects non-object input', () => {
    expect(validateA2UIMessage('hello').valid).toBe(false);
    expect(validateA2UIMessage(null).valid).toBe(false);
    expect(validateA2UIMessage(42).valid).toBe(false);
    expect(validateA2UIMessage([]).valid).toBe(false);
  });

  it('rejects object with no known message type', () => {
    const result = validateA2UIMessage({ foo: 'bar' });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/No known message type/);
  });

  it('rejects multiple message types', () => {
    const result = validateA2UIMessage({
      createSurface: { surfaceId: 'main', catalogId: 'x' },
      updateComponents: { surfaceId: 'main', components: [] },
    });
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toMatch(/Multiple message types/);
  });

  // ── Component validation ────────────────────────────────────────────

  it('rejects unknown component types', () => {
    const result = validateA2UIMessage({
      updateComponents: {
        surfaceId: 'main',
        components: [
          { id: 'evil', component: 'ScriptInjector' },
        ],
      },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('not in catalog'))).toBe(true);
  });

  it('rejects components without id', () => {
    const result = validateA2UIMessage({
      updateComponents: {
        surfaceId: 'main',
        components: [
          { component: 'Text', text: 'no id' },
        ],
      },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('missing "id"'))).toBe(true);
  });

  it('rejects non-string children', () => {
    const result = validateA2UIMessage({
      updateComponents: {
        surfaceId: 'main',
        components: [
          { id: 'root', component: 'Stack', children: [123] },
        ],
      },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('array of strings'))).toBe(true);
  });

  // ── DoS limits ──────────────────────────────────────────────────────

  it('rejects too many components (DoS)', () => {
    const components = Array.from({ length: 101 }, (_, i) => ({
      id: `c${i}`,
      component: 'Text',
      text: `Item ${i}`,
    }));
    const result = validateA2UIMessage({
      updateComponents: { surfaceId: 'main', components },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('Too many components'))).toBe(true);
  });

  it('rejects too many children (DoS)', () => {
    const children = Array.from({ length: 51 }, (_, i) => `child-${i}`);
    const result = validateA2UIMessage({
      updateComponents: {
        surfaceId: 'main',
        components: [
          { id: 'root', component: 'Stack', children },
        ],
      },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('too many children'))).toBe(true);
  });

  it('rejects oversized data model (DoS)', () => {
    const bigValue: Record<string, string> = {};
    for (let i = 0; i < 5000; i++) {
      bigValue[`key${i}`] = 'x'.repeat(100);
    }
    const result = validateA2UIMessage({
      updateDataModel: {
        surfaceId: 'main',
        value: bigValue,
      },
    });
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('too large'))).toBe(true);
  });

  // ── Catalog validation warnings ─────────────────────────────────────

  it('warns on unknown component properties', () => {
    const result = validateA2UIMessage({
      updateComponents: {
        surfaceId: 'main',
        components: [
          { id: 'root', component: 'Text', text: 'Hello', unknownProp: true },
        ],
      },
    });
    expect(result.valid).toBe(true); // Still valid, just warnings
    expect(result.warnings?.some(w => w.includes('unknown property'))).toBe(true);
  });

  it('warns on missing required properties', () => {
    const result = validateA2UIMessage({
      updateComponents: {
        surfaceId: 'main',
        components: [
          { id: 'root', component: 'Text' }, // Missing 'text' required prop
        ],
      },
    });
    // Missing required props are reported as catalog warnings (advisory, not blocking)
    expect(result.warnings?.some(w => w.includes('missing required'))).toBe(true);
  });

  it('warns on invalid enum values', () => {
    const result = validateA2UIMessage({
      updateComponents: {
        surfaceId: 'main',
        components: [
          { id: 'root', component: 'Text', text: 'Hello', variant: 'superbig' },
        ],
      },
    });
    expect(result.warnings?.some(w => w.includes('not in allowed values'))).toBe(true);
  });

  // ── Legacy v0.8 compat ──────────────────────────────────────────────

  it('accepts legacy surfaceUpdate message', () => {
    const result = validateA2UIMessage({
      surfaceUpdate: {
        surfaceId: 'main',
        components: [
          { id: 'root', component: 'Text', text: 'Legacy' },
        ],
      },
    });
    expect(result.valid).toBe(true);
  });

  it('accepts error messages', () => {
    const result = validateA2UIMessage({
      error: { message: 'Something failed', type: 'stream_error' },
    });
    expect(result.valid).toBe(true);
  });
});
