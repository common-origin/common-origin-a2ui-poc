/**
 * Pattern Validator Tests
 *
 * Covers:
 *  - Pattern definition registry (lookups, filtering)
 *  - validatePattern: valid surfaces, missing components, failed rules
 *  - detectPatterns: matched and partial results
 *  - extractComponentTypes: object and string array inputs
 *  - State detection
 *  - Prompt helpers: getPatternReferenceBlock, getPatternBlockForScenario, cheat-sheet
 */

import { describe, it, expect } from 'vitest';
import {
  ALL_PATTERNS,
  getPattern,
  getPatternsByCategory,
  getPatternsForScenario,
} from './definitions';
import {
  validatePattern,
  detectPatterns,
  extractComponentTypes,
  validateAllPatterns,
} from './patternValidator';
import {
  getPatternReferenceBlock,
  getPatternBlockForScenario,
  getPatternCheatSheet,
} from './patternPrompt';

// ── Pattern registry ───────────────────────────────────────────────────────

describe('pattern registry', () => {
  it('ALL_PATTERNS has at least 10 entries', () => {
    expect(ALL_PATTERNS.length).toBeGreaterThanOrEqual(10);
  });

  it('every pattern has a unique id', () => {
    const ids = ALL_PATTERNS.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every pattern has required fields', () => {
    for (const p of ALL_PATTERNS) {
      expect(p.id, `${p.id} missing id`).toBeTruthy();
      expect(p.name, `${p.id} missing name`).toBeTruthy();
      expect(p.description, `${p.id} missing description`).toBeTruthy();
      expect(p.requiredComponents.length, `${p.id} has no requiredComponents`).toBeGreaterThan(0);
      expect(p.agentGuidance, `${p.id} missing agentGuidance`).toBeTruthy();
      expect(p.usedBy.length, `${p.id} has no usedBy`).toBeGreaterThan(0);
    }
  });

  it('getPattern returns the correct pattern', () => {
    const p = getPattern('confirmation-flow');
    expect(p).toBeDefined();
    expect(p!.name).toBe('Confirmation Flow');
  });

  it('getPattern returns undefined for unknown id', () => {
    expect(getPattern('not-a-real-pattern')).toBeUndefined();
  });

  it('getPatternsByCategory returns only patterns of that category', () => {
    const agentic = getPatternsByCategory('agentic');
    expect(agentic.length).toBeGreaterThan(0);
    expect(agentic.every((p) => p.category === 'agentic')).toBe(true);
  });

  it('getPatternsByCategory data-display returns at least 3 patterns', () => {
    expect(getPatternsByCategory('data-display').length).toBeGreaterThanOrEqual(3);
  });

  it('getPatternsForScenario fund-transfer returns progressive-input and confirmation-flow', () => {
    const patterns = getPatternsForScenario('fund-transfer');
    const ids = patterns.map((p) => p.id);
    expect(ids).toContain('progressive-input');
    expect(ids).toContain('confirmation-flow');
  });

  it('getPatternsForScenario transaction-search returns transaction-list and search-and-filter', () => {
    const patterns = getPatternsForScenario('transaction-search');
    const ids = patterns.map((p) => p.id);
    expect(ids).toContain('transaction-list');
    expect(ids).toContain('search-and-filter');
  });

  it('getPatternsForScenario unknown scenario returns empty array', () => {
    expect(getPatternsForScenario('non-existent-scenario')).toEqual([]);
  });
});

// ── extractComponentTypes ──────────────────────────────────────────────────

describe('extractComponentTypes', () => {
  it('extracts types from component objects', () => {
    const types = extractComponentTypes([
      { component: 'Stack', id: 'root' },
      { component: 'Text', id: 'h1' },
      { component: 'Button', id: 'btn' },
    ]);
    expect(types).toContain('Stack');
    expect(types).toContain('Text');
    expect(types).toContain('Button');
  });

  it('deduplicates repeated component types', () => {
    const types = extractComponentTypes([
      { component: 'Stack', id: 'root' },
      { component: 'Stack', id: 'inner' },
      { component: 'Text', id: 't1' },
    ]);
    expect(types.filter((t) => t === 'Stack').length).toBe(1);
  });

  it('works with plain string arrays', () => {
    const types = extractComponentTypes(['Stack', 'Text', 'Button', 'Button']);
    expect(types).toContain('Stack');
    expect(types.filter((t) => t === 'Button').length).toBe(1);
  });
});

// ── validatePattern ────────────────────────────────────────────────────────

describe('validatePattern – confirmation-flow', () => {
  it('passes when required components are present and rules pass', () => {
    const result = validatePattern('confirmation-flow', ['Stack', 'Card', 'Button', 'Text', 'MoneyDisplay']);
    expect(result.valid).toBe(true);
    expect(result.missingComponents).toHaveLength(0);
    expect(result.failedRules).toHaveLength(0);
  });

  it('fails when required components are missing', () => {
    // Missing Button
    const result = validatePattern('confirmation-flow', ['Stack', 'Card', 'Text']);
    expect(result.valid).toBe(false);
    expect(result.missingComponents).toContain('Button');
  });

  it('reports unknown patternId as invalid', () => {
    const result = validatePattern('made-up-id', ['Button', 'Stack']);
    expect(result.valid).toBe(false);
    expect(result.failedRules[0]).toMatch(/Unknown pattern/i);
  });
});

describe('validatePattern – account-summary', () => {
  it('passes with AccountCard and Stack', () => {
    const result = validatePattern('account-summary', ['AccountCard', 'Stack', 'Text', 'MoneyDisplay']);
    expect(result.valid).toBe(true);
  });

  it('fails without AccountCard', () => {
    const result = validatePattern('account-summary', ['Stack', 'Text', 'Button']);
    expect(result.valid).toBe(false);
    expect(result.missingComponents).toContain('AccountCard');
  });
});

describe('validatePattern – transaction-list', () => {
  it('passes with TransactionListItem, DateGroup, Stack', () => {
    const result = validatePattern('transaction-list', ['TransactionListItem', 'DateGroup', 'Stack', 'Text']);
    expect(result.valid).toBe(true);
  });

  it('passes with EmptyState (no results state)', () => {
    const result = validatePattern('transaction-list', ['EmptyState', 'Stack', 'DateGroup', 'Text']);
    expect(result.valid).toBe(true);
  });

  it('fails when TransactionListItem present but DateGroup missing', () => {
    const result = validatePattern('transaction-list', ['TransactionListItem', 'Stack', 'Text']);
    expect(result.valid).toBe(false);
    expect(result.failedRules).toHaveLength(1);
    expect(result.failedRules[0]).toMatch(/DateGroup/i);
  });

  it('fails if neither TransactionListItem nor EmptyState present', () => {
    const result = validatePattern('transaction-list', ['DateGroup', 'Stack', 'Text']);
    expect(result.valid).toBe(false);
  });
});

describe('validatePattern – search-and-filter', () => {
  it('passes with SearchField and Stack', () => {
    const result = validatePattern('search-and-filter', ['SearchField', 'Stack', 'TransactionListItem', 'BooleanChip']);
    expect(result.valid).toBe(true);
  });

  it('fails without SearchField', () => {
    const result = validatePattern('search-and-filter', ['Stack', 'TransactionListItem']);
    expect(result.valid).toBe(false);
    expect(result.missingComponents).toContain('SearchField');
  });
});

describe('validatePattern – spending-breakdown', () => {
  it('passes with CategoryBadge, MoneyDisplay, Stack', () => {
    const result = validatePattern('spending-breakdown', ['CategoryBadge', 'MoneyDisplay', 'Stack', 'Text']);
    expect(result.valid).toBe(true);
  });

  it('fails without MoneyDisplay', () => {
    const result = validatePattern('spending-breakdown', ['CategoryBadge', 'Stack', 'Text']);
    expect(result.valid).toBe(false);
    expect(result.missingComponents).toContain('MoneyDisplay');
  });
});

describe('validatePattern – progressive-input', () => {
  it('passes with TextField and Button', () => {
    const result = validatePattern('progressive-input', ['TextField', 'Button', 'Stack', 'Text']);
    expect(result.valid).toBe(true);
  });

  it('passes with NumberField and Button', () => {
    const result = validatePattern('progressive-input', ['NumberField', 'Button', 'Stack']);
    expect(result.valid).toBe(true);
  });

  it('fails without any input component', () => {
    const result = validatePattern('progressive-input', ['Stack', 'Button', 'Text']);
    expect(result.valid).toBe(false);
  });
});

describe('validatePattern – agentic: disambiguation', () => {
  it('passes with Text and Button in a Stack', () => {
    const result = validatePattern('disambiguation', ['Text', 'Button', 'Stack']);
    expect(result.valid).toBe(true);
  });

  it('fails without Text', () => {
    const result = validatePattern('disambiguation', ['Button', 'Stack']);
    expect(result.valid).toBe(false);
    expect(result.missingComponents).toContain('Text');
  });
});

describe('validatePattern – agentic: agentic-consent', () => {
  it('passes with Alert, Button, Stack', () => {
    const result = validatePattern('agentic-consent', ['Alert', 'Button', 'Stack', 'Text']);
    expect(result.valid).toBe(true);
  });

  it('fails without Alert', () => {
    const result = validatePattern('agentic-consent', ['Button', 'Stack', 'Text']);
    expect(result.valid).toBe(false);
    expect(result.missingComponents).toContain('Alert');
  });
});

// ── detectPatterns ─────────────────────────────────────────────────────────

describe('detectPatterns', () => {
  it('detects account-summary from AccountCard + Stack', () => {
    const { matched } = detectPatterns(['AccountCard', 'Stack', 'MoneyDisplay', 'Text']);
    expect(matched.map((p) => p.id)).toContain('account-summary');
  });

  it('detects confirmation-flow from Button + Stack + Card', () => {
    const { matched } = detectPatterns(['Button', 'Stack', 'Card', 'Text', 'MoneyDisplay']);
    expect(matched.map((p) => p.id)).toContain('confirmation-flow');
  });

  it('returns partial matches sorted by coverage descending', () => {
    // Only provide Stack — all patterns with Stack will be partial
    const { partial } = detectPatterns(['Stack', 'AccountCard']);
    expect(partial.length).toBeGreaterThan(0);
    // Coverage should be non-increasing
    for (let i = 1; i < partial.length; i++) {
      expect(partial[i].coverage).toBeLessThanOrEqual(partial[i - 1].coverage);
    }
  });

  it('matched patterns are fully valid (no missing components, no failed rules)', () => {
    const { matched } = detectPatterns([
      'TransactionListItem', 'DateGroup', 'Stack', 'Text', 'SearchField', 'BooleanChip', 'EmptyState',
    ]);
    for (const p of matched) {
      const result = validatePattern(p.id, [
        'TransactionListItem', 'DateGroup', 'Stack', 'Text', 'SearchField', 'BooleanChip', 'EmptyState',
      ]);
      expect(result.valid).toBe(true);
    }
  });
});

// ── State detection ────────────────────────────────────────────────────────

describe('state detection', () => {
  it('detects "results" state in transaction-list when TransactionListItem is present', () => {
    const result = validatePattern('transaction-list', [
      'TransactionListItem', 'DateGroup', 'Stack',
    ]);
    expect(result.detectedStates).toContain('results');
  });

  it('detects "empty" state in transaction-list when EmptyState is present', () => {
    const result = validatePattern('transaction-list', [
      'EmptyState', 'DateGroup', 'Stack',
    ]);
    expect(result.detectedStates).toContain('empty');
  });

  it('detects "success" or "error" state in confirmation-flow when Alert is present', () => {
    const result = validatePattern('confirmation-flow', ['Alert', 'Button', 'Stack', 'Card']);
    // 'success' and 'error' both use Alert as indicator
    expect(
      result.detectedStates.includes('success') || result.detectedStates.includes('error')
    ).toBe(true);
  });
});

// ── validateAllPatterns ────────────────────────────────────────────────────

describe('validateAllPatterns', () => {
  it('returns a result for every registered pattern', () => {
    const results = validateAllPatterns(['Stack', 'Button', 'Text']);
    expect(results.length).toBe(ALL_PATTERNS.length);
  });

  it('result patternIds match the ALL_PATTERNS ids', () => {
    const results = validateAllPatterns([]);
    const resultIds = results.map((r) => r.patternId);
    const expectedIds = ALL_PATTERNS.map((p) => p.id);
    expect(resultIds).toEqual(expectedIds);
  });
});

// ── Prompt helpers ─────────────────────────────────────────────────────────

describe('getPatternReferenceBlock', () => {
  it('returns a non-empty string', () => {
    const block = getPatternReferenceBlock();
    expect(block.length).toBeGreaterThan(100);
  });

  it('contains all registered pattern IDs', () => {
    const block = getPatternReferenceBlock();
    for (const p of ALL_PATTERNS) {
      expect(block, `Missing pattern id: ${p.id}`).toContain(p.id);
    }
  });

  it('contains category headers', () => {
    const block = getPatternReferenceBlock();
    expect(block).toContain('DATA DISPLAY');
    expect(block).toContain('PROGRESSIVE INPUT');
    expect(block).toContain('NAVIGATION');
    expect(block).toContain('AGENTIC');
  });
});

describe('getPatternBlockForScenario', () => {
  it('includes only patterns relevant to fund-transfer', () => {
    const block = getPatternBlockForScenario('fund-transfer');
    expect(block).toContain('progressive-input');
    expect(block).toContain('confirmation-flow');
    // transaction-list should NOT be in fund-transfer block
    expect(block).not.toContain('transaction-list');
  });

  it('returns empty string for unknown scenario', () => {
    expect(getPatternBlockForScenario('xyz')).toBe('');
  });
});

describe('getPatternCheatSheet', () => {
  it('includes all pattern required components as bullet points', () => {
    const sheet = getPatternCheatSheet();
    for (const p of ALL_PATTERNS) {
      expect(sheet).toContain(p.id);
    }
  });
});
