// @vitest-environment jsdom
/**
 * Tests for userPreferences utilities
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  DEFAULT_PREFERENCES,
  loadPreferences,
  savePreferences,
  buildPreferencesPromptBlock,
  type UserPreferences,
} from './userPreferences';

// Use the real jsdom localStorage provided by the vitest jsdom environment.
// Just clear it between tests so state doesn't leak.

// ─── loadPreferences ──────────────────────────────────────────────────────────

describe('loadPreferences', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns defaults when nothing is stored', () => {
    const prefs = loadPreferences();
    expect(prefs).toEqual(DEFAULT_PREFERENCES);
  });

  it('merges stored partial prefs with defaults', () => {
    localStorage.setItem('a2ui_user_preferences', JSON.stringify({ theme: 'dark', density: 'compact' }));
    const prefs = loadPreferences();
    expect(prefs.theme).toBe('dark');
    expect(prefs.density).toBe('compact');
    // Defaults fill in the rest
    expect(prefs.fontSize).toBe('medium');
    expect(prefs.persona).toBe('everyday');
  });

  it('returns defaults for invalid JSON', () => {
    localStorage.setItem('a2ui_user_preferences', 'not-json{{{');
    const prefs = loadPreferences();
    expect(prefs).toEqual(DEFAULT_PREFERENCES);
  });

  it('returns fresh default objects (no shared reference)', () => {
    const a = loadPreferences();
    const b = loadPreferences();
    a.theme = 'dark';
    expect(b.theme).toBe('system');
  });
});

// ─── savePreferences ──────────────────────────────────────────────────────────

describe('savePreferences', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('serialises preferences to localStorage', () => {
    const prefs: UserPreferences = { ...DEFAULT_PREFERENCES, theme: 'dark', density: 'spacious' };
    savePreferences(prefs);
    const stored = JSON.parse(localStorage.getItem('a2ui_user_preferences')!);
    expect(stored.theme).toBe('dark');
    expect(stored.density).toBe('spacious');
  });

  it('round-trips through load', () => {
    const prefs: UserPreferences = {
      theme: 'dark',
      density: 'compact',
      fontSize: 'large',
      reducedMotion: true,
      highContrast: true,
      persona: 'power-user',
    };
    savePreferences(prefs);
    const loaded = loadPreferences();
    expect(loaded).toEqual(prefs);
  });
});

// ─── buildPreferencesPromptBlock ─────────────────────────────────────────────

describe('buildPreferencesPromptBlock', () => {
  it('includes the USER PREFERENCES header', () => {
    const block = buildPreferencesPromptBlock(DEFAULT_PREFERENCES);
    expect(block).toContain('# USER PREFERENCES');
  });

  it('includes persona label and description', () => {
    const block = buildPreferencesPromptBlock({ ...DEFAULT_PREFERENCES, persona: 'power-user' });
    expect(block).toContain('power-user');
    expect(block).toContain('detail-oriented');
  });

  it('includes density guidance', () => {
    const block = buildPreferencesPromptBlock({ ...DEFAULT_PREFERENCES, density: 'compact' });
    expect(block).toContain('compact');
    expect(block).toContain('TransactionListItem');
  });

  it('includes font size guidance', () => {
    const block = buildPreferencesPromptBlock({ ...DEFAULT_PREFERENCES, fontSize: 'large' });
    expect(block).toContain('large');
    expect(block).toContain('h3');
  });

  it('includes high-contrast line when enabled', () => {
    const block = buildPreferencesPromptBlock({ ...DEFAULT_PREFERENCES, highContrast: true });
    expect(block).toContain('High contrast: ON');
  });

  it('omits high-contrast line when disabled', () => {
    const block = buildPreferencesPromptBlock({ ...DEFAULT_PREFERENCES, highContrast: false });
    expect(block).not.toContain('High contrast');
  });

  it('includes reduced-motion line when enabled', () => {
    const block = buildPreferencesPromptBlock({ ...DEFAULT_PREFERENCES, reducedMotion: true });
    expect(block).toContain('Reduced motion: ON');
  });

  it('omits reduced-motion line when disabled', () => {
    const block = buildPreferencesPromptBlock({ ...DEFAULT_PREFERENCES, reducedMotion: false });
    expect(block).not.toContain('Reduced motion');
  });

  it('includes accessibility guidance for accessibility persona', () => {
    const block = buildPreferencesPromptBlock({ ...DEFAULT_PREFERENCES, persona: 'accessibility' });
    expect(block).toContain('accessibility needs');
    expect(block).toContain('accessibility persona');
  });

  it('includes adaption examples for every default config', () => {
    const block = buildPreferencesPromptBlock(DEFAULT_PREFERENCES);
    expect(block).toContain('Adapt the UI');
  });
});
