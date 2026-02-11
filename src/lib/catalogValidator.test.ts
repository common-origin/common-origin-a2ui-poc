import { describe, it, expect } from 'vitest';
import { validateComponent, validateComponentsMessage } from './catalogValidator';

describe('validateComponent', () => {
  // ── Known & unknown types ───────────────────────────────────────────

  it('accepts a valid Text component', () => {
    const result = validateComponent(
      { id: 'h1', component: 'Text', text: 'Hello', variant: 'heading-lg' },
      0
    );
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('accepts a valid Stack component', () => {
    const result = validateComponent(
      { id: 'root', component: 'Stack', direction: 'column', gap: 'lg', children: ['c1'] },
      0
    );
    expect(result.valid).toBe(true);
  });

  it('rejects an unknown component type', () => {
    const result = validateComponent(
      { id: 'x', component: 'EvilWidget', text: 'pwned' },
      0
    );
    expect(result.valid).toBe(false);
    expect(result.errors[0]).toContain('Unknown component type');
  });

  it('rejects a component with no type', () => {
    const result = validateComponent({ id: 'x' }, 0);
    expect(result.valid).toBe(false);
  });

  // ── Required properties ────────────────────────────────────────────

  it('errors on missing required props for Text', () => {
    const result = validateComponent(
      { id: 'h1', component: 'Text' },
      0
    );
    // Text requires 'text' prop
    expect(result.errors.some(e => e.includes('missing required'))).toBe(true);
  });

  it('errors on missing required props for Button', () => {
    const result = validateComponent(
      { id: 'b1', component: 'Button' },
      0
    );
    // Button requires 'label'
    expect(result.errors.some(e => e.includes('missing required'))).toBe(true);
  });

  it('passes when required props are present', () => {
    const result = validateComponent(
      { id: 'b1', component: 'Button', label: 'Click me', action: { type: 'submit' } },
      0
    );
    expect(result.valid).toBe(true);
  });

  // ── Unknown properties ─────────────────────────────────────────────

  it('warns on unknown properties', () => {
    const result = validateComponent(
      { id: 'h1', component: 'Text', text: 'Hello', dangerousProp: 'x' },
      0
    );
    expect(result.valid).toBe(true); // Warnings don't invalidate
    expect(result.warnings.some(w => w.includes('unknown property'))).toBe(true);
  });

  // ── Enum validation ────────────────────────────────────────────────

  it('warns on invalid enum values', () => {
    const result = validateComponent(
      { id: 'h1', component: 'Text', text: 'Hello', variant: 'super-mega-heading' },
      0
    );
    expect(result.warnings.some(w => w.includes('not in allowed values'))).toBe(true);
  });

  it('does not warn on valid enum values', () => {
    const result = validateComponent(
      { id: 'h1', component: 'Text', text: 'Hello', variant: 'body' },
      0
    );
    expect(result.warnings.filter(w => w.includes('not in allowed values'))).toHaveLength(0);
  });
});

describe('validateComponentsMessage', () => {
  it('returns summary for a batch of mixed components', () => {
    const result = validateComponentsMessage([
      { id: 'h1', component: 'Text', text: 'Hello' },
      { id: 'bad', component: 'UnknownWidget' },
      { id: 'h2', component: 'Text', text: 'World', variant: 'badValue' },
    ]);

    expect(result.totalComponents).toBe(3);
    expect(result.validComponents).toBe(2); // Text + Text (bad variant is just a warning)
    expect(result.errors.length).toBeGreaterThan(0); // UnknownWidget
    expect(result.warnings.length).toBeGreaterThan(0); // bad variant
  });

  it('returns clean result for all valid components', () => {
    const result = validateComponentsMessage([
      { id: 'root', component: 'Stack', direction: 'column', children: ['t1'] },
      { id: 't1', component: 'Text', text: 'OK' },
    ]);
    expect(result.totalComponents).toBe(2);
    expect(result.validComponents).toBe(2);
    expect(result.errors).toHaveLength(0);
  });

  it('handles empty array', () => {
    const result = validateComponentsMessage([]);
    expect(result.totalComponents).toBe(0);
    expect(result.validComponents).toBe(0);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings).toHaveLength(0);
  });
});
