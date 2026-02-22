import { describe, it, expect, vi } from 'vitest';
import { resolveBinding, resolveNumber, resolveAction, isSpecAction } from './catalog';

// ── resolveBinding ────────────────────────────────────────────────────

describe('resolveBinding', () => {
  const emptyDM = new Map<string, unknown>();

  describe('plain values', () => {
    it('returns a plain string as-is', () => {
      expect(resolveBinding('Hello', emptyDM)).toBe('Hello');
    });

    it('converts a plain number to string', () => {
      expect(resolveBinding(42, emptyDM)).toBe('42');
    });

    it('returns empty string for undefined', () => {
      expect(resolveBinding(undefined, emptyDM)).toBe('');
    });

    it('returns empty string for null', () => {
      expect(resolveBinding(null as any, emptyDM)).toBe('');
    });

    it('returns empty string for empty string', () => {
      expect(resolveBinding('', emptyDM)).toBe('');
    });
  });

  describe('path references', () => {
    const dm = new Map<string, unknown>([
      ['transfer', { from: 'Everyday', to: 'Savings', amount: 500 }],
      ['user', { name: 'Sarah Chen', location: 'Melbourne' }],
    ]);

    it('resolves a simple path', () => {
      expect(resolveBinding({ path: '/user/name' }, dm)).toBe('Sarah Chen');
    });

    it('resolves a nested path', () => {
      expect(resolveBinding({ path: '/transfer/from' }, dm)).toBe('Everyday');
    });

    it('resolves a numeric value from path to string', () => {
      expect(resolveBinding({ path: '/transfer/amount' }, dm)).toBe('500');
    });

    it('returns empty string for non-existent path', () => {
      expect(resolveBinding({ path: '/nonexistent/key' }, dm)).toBe('');
    });

    it('returns empty string for partially valid path', () => {
      expect(resolveBinding({ path: '/transfer/nonexistent' }, dm)).toBe('');
    });
  });

  describe('legacy literalString format', () => {
    it('resolves literalString objects', () => {
      expect(resolveBinding({ literalString: 'Legacy value' } as any, emptyDM)).toBe('Legacy value');
    });
  });
});

// ── resolveNumber ─────────────────────────────────────────────────────

describe('resolveNumber', () => {
  const emptyDM = new Map<string, unknown>();

  it('returns a plain number as-is', () => {
    expect(resolveNumber(42, emptyDM)).toBe(42);
  });

  it('returns 0 for undefined', () => {
    expect(resolveNumber(undefined, emptyDM)).toBe(0);
  });

  it('returns 0 for null', () => {
    expect(resolveNumber(null as any, emptyDM)).toBe(0);
  });

  it('resolves a number from path reference', () => {
    const dm = new Map<string, unknown>([
      ['transfer', { amount: 250.50 }],
    ]);
    expect(resolveNumber({ path: '/transfer/amount' }, dm)).toBe(250.50);
  });

  it('returns 0 for non-numeric path value', () => {
    const dm = new Map<string, unknown>([
      ['transfer', { from: 'Everyday' }],
    ]);
    expect(resolveNumber({ path: '/transfer/from' }, dm)).toBe(0);
  });

  it('handles negative numbers', () => {
    expect(resolveNumber(-45.99, emptyDM)).toBe(-45.99);
  });

  it('handles zero', () => {
    expect(resolveNumber(0, emptyDM)).toBe(0);
  });
});

// ── resolveAction ─────────────────────────────────────────────────────

describe('resolveAction', () => {
  it('produces a UserActionMessage with resolved context', () => {
    const dm = new Map<string, unknown>([
      ['transfer', { from: 'Everyday', to: 'Savings', amount: 500 }],
    ]);

    const action = {
      name: 'confirm_transfer',
      context: [
        { key: 'fromAccount', value: { path: '/transfer/from' } },
        { key: 'toAccount', value: { path: '/transfer/to' } },
        { key: 'amount', value: { path: '/transfer/amount' } },
        { key: 'source', value: 'transfer_form' },
      ],
    };

    const result = resolveAction(action, 'btn-confirm', 'surface-1', dm);

    expect(result.userAction.name).toBe('confirm_transfer');
    expect(result.userAction.surfaceId).toBe('surface-1');
    expect(result.userAction.sourceComponentId).toBe('btn-confirm');
    expect(result.userAction.context).toEqual({
      fromAccount: 'Everyday',
      toAccount: 'Savings',
      amount: '500',
      source: 'transfer_form',
    });
    expect(result.userAction.timestamp).toBeDefined();
  });

  it('handles action with no context', () => {
    const dm = new Map<string, unknown>();
    const action = { name: 'cancel' };

    const result = resolveAction(action, 'btn-cancel', 'surface-1', dm);

    expect(result.userAction.name).toBe('cancel');
    expect(result.userAction.context).toEqual({});
  });

  it('handles action with empty context array', () => {
    const dm = new Map<string, unknown>();
    const action = { name: 'refresh', context: [] };

    const result = resolveAction(action, 'btn-refresh', 'surface-1', dm);

    expect(result.userAction.name).toBe('refresh');
    expect(result.userAction.context).toEqual({});
  });

  it('handles mixed literal and path context values', () => {
    const dm = new Map<string, unknown>([
      ['account', { id: 'ACC-001' }],
    ]);

    const action = {
      name: 'view_details',
      context: [
        { key: 'accountId', value: { path: '/account/id' } },
        { key: 'view', value: 'detailed' },
        { key: 'showGraph', value: true },
      ],
    };

    const result = resolveAction(action, 'card-1', 'surface-1', dm);

    expect(result.userAction.context).toEqual({
      accountId: 'ACC-001',
      view: 'detailed',
      showGraph: true,
    });
  });

  it('produces ISO 8601 timestamp', () => {
    const dm = new Map<string, unknown>();
    const result = resolveAction({ name: 'test' }, 'comp-1', 'surface-1', dm);
    // ISO 8601 format check
    expect(result.userAction.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
  });
});

// ── isSpecAction ──────────────────────────────────────────────────────

describe('isSpecAction', () => {
  it('returns true for v0.9 spec actions', () => {
    expect(isSpecAction({ name: 'confirm_transfer' })).toBe(true);
    expect(isSpecAction({ name: 'view_details', context: [] })).toBe(true);
  });

  it('returns false for legacy actions', () => {
    expect(isSpecAction({ eventType: 'click', dataPath: '/some/path' })).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isSpecAction(null)).toBe(false);
    expect(isSpecAction(undefined)).toBe(false);
  });

  it('returns false for non-objects', () => {
    expect(isSpecAction('click')).toBe(false);
    expect(isSpecAction(42)).toBe(false);
    expect(isSpecAction(true)).toBe(false);
  });

  it('returns false for objects without name string', () => {
    expect(isSpecAction({ name: 42 })).toBe(false);
    expect(isSpecAction({ name: null })).toBe(false);
    expect(isSpecAction({})).toBe(false);
  });
});
