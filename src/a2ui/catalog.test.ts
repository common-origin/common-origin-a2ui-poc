import { describe, it, expect } from 'vitest';
import { sanitizeUrl, isValidComponent, VALID_COMPONENT_TYPES, getCatalogMetadata } from './catalog';

describe('sanitizeUrl', () => {
  // ── Safe URLs ───────────────────────────────────────────────────────

  it('allows https URLs', () => {
    expect(sanitizeUrl('https://example.com/logo.png')).toBe('https://example.com/logo.png');
  });

  it('allows http URLs', () => {
    expect(sanitizeUrl('http://cdn.example.com/image.jpg')).toBe('http://cdn.example.com/image.jpg');
  });

  it('allows data:image URIs', () => {
    const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUh';
    expect(sanitizeUrl(dataUri)).toBe(dataUri);
  });

  it('allows relative paths', () => {
    expect(sanitizeUrl('/images/logo.svg')).toBe('/images/logo.svg');
    expect(sanitizeUrl('images/logo.svg')).toBe('images/logo.svg');
  });

  // ── Blocked URLs ────────────────────────────────────────────────────

  it('blocks javascript: URIs', () => {
    expect(sanitizeUrl('javascript:alert(1)')).toBe('');
  });

  it('blocks javascript: with mixed case', () => {
    expect(sanitizeUrl('JavaScript:alert(1)')).toBe('');
  });

  it('blocks data:text/html URIs', () => {
    expect(sanitizeUrl('data:text/html,<script>alert(1)</script>')).toBe('');
  });

  it('blocks vbscript: URIs', () => {
    expect(sanitizeUrl('vbscript:msgbox("pwned")')).toBe('');
  });

  it('blocks unknown protocols', () => {
    expect(sanitizeUrl('ftp://evil.com/payload')).toBe('');
  });

  // ── Edge cases ──────────────────────────────────────────────────────

  it('returns empty string for non-string input', () => {
    expect(sanitizeUrl(undefined)).toBe('');
    expect(sanitizeUrl(null)).toBe('');
    expect(sanitizeUrl(42)).toBe('');
    expect(sanitizeUrl({})).toBe('');
  });

  it('preserves original case for safe URLs', () => {
    const url = 'HTTPS://Example.COM/Logo.PNG';
    expect(sanitizeUrl(url)).toBe(url);
  });
});

describe('isValidComponent', () => {
  it('accepts known component types', () => {
    expect(isValidComponent('Text')).toBe(true);
    expect(isValidComponent('Stack')).toBe(true);
    expect(isValidComponent('Button')).toBe(true);
    expect(isValidComponent('Card')).toBe(true);
    expect(isValidComponent('TransactionListItem')).toBe(true);
  });

  it('rejects unknown component types', () => {
    expect(isValidComponent('ScriptTag')).toBe(false);
    expect(isValidComponent('IFrame')).toBe(false);
    expect(isValidComponent('')).toBe(false);
  });

  it('handles non-string input', () => {
    expect(isValidComponent(null)).toBe(false);
    expect(isValidComponent(undefined)).toBe(false);
    expect(isValidComponent(123)).toBe(false);
  });
});

describe('VALID_COMPONENT_TYPES', () => {
  it('contains all 28 Common Origin components', () => {
    expect(VALID_COMPONENT_TYPES.size).toBe(28);
  });

  it('includes core layout components', () => {
    expect(VALID_COMPONENT_TYPES.has('Stack')).toBe(true);
    expect(VALID_COMPONENT_TYPES.has('Divider')).toBe(true);
    expect(VALID_COMPONENT_TYPES.has('Card')).toBe(true);
  });

  it('includes banking-specific components', () => {
    expect(VALID_COMPONENT_TYPES.has('TransactionListItem')).toBe(true);
    expect(VALID_COMPONENT_TYPES.has('AccountCard')).toBe(true);
    expect(VALID_COMPONENT_TYPES.has('MoneyDisplay')).toBe(true);
    expect(VALID_COMPONENT_TYPES.has('CategoryBadge')).toBe(true);
  });
});

describe('getCatalogMetadata', () => {
  it('returns catalog info', () => {
    const meta = getCatalogMetadata();
    expect(meta.catalogId).toContain('common-origin');
    expect(meta.components).toHaveLength(28);
    expect(meta.components[0].name).toBe('Text');
    expect(meta.components.some(c => c.name === 'TransactionListItem')).toBe(true);
  });
});
