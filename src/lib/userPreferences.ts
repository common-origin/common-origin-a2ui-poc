/**
 * User Preferences
 *
 * Types, defaults, persistence, and prompt-block builder for the
 * Phase 7 personalisation feature.  Preferences are stored in
 * localStorage and injected into every agent system prompt so the
 * rendered UI adapts to the user's stated context and needs.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark' | 'system';
export type Density = 'compact' | 'comfortable' | 'spacious';
export type FontSize = 'small' | 'medium' | 'large';
export type Persona = 'everyday' | 'power-user' | 'accessibility';

export interface UserPreferences {
  /** Colour scheme.  'system' respects the OS preference. */
  theme: Theme;
  /** Layout density applied via CSS custom properties. */
  density: Density;
  /** Base font-size scale applied via CSS custom properties. */
  fontSize: FontSize;
  /** When true, avoid recommending animated transitions. */
  reducedMotion: boolean;
  /** When true, avoid subtle colours — use high-contrast palettes. */
  highContrast: boolean;
  /**
   * Persona hint that tells the agent how much detail to show.
   * - everyday: simple, clean summaries
   * - power-user: data-dense views with charts and filters
   * - accessibility: large targets, clear labelling, Alert emphasis
   */
  persona: Persona;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  density: 'comfortable',
  fontSize: 'medium',
  reducedMotion: false,
  highContrast: false,
  persona: 'everyday',
};

// ─── Persistence ──────────────────────────────────────────────────────────────

const STORAGE_KEY = 'a2ui_user_preferences';

/**
 * Load preferences from localStorage, merging with defaults to handle
 * partial / stale stored objects gracefully.
 */
export function loadPreferences(): UserPreferences {
  if (typeof window === 'undefined') return { ...DEFAULT_PREFERENCES };
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return { ...DEFAULT_PREFERENCES };
    const parsed = JSON.parse(stored) as Partial<UserPreferences>;
    return { ...DEFAULT_PREFERENCES, ...parsed };
  } catch {
    return { ...DEFAULT_PREFERENCES };
  }
}

/**
 * Persist preferences to localStorage.
 */
export function savePreferences(prefs: UserPreferences): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota / permission errors — preferences are best-effort.
  }
}

// ─── Prompt block ─────────────────────────────────────────────────────────────

const PERSONA_DESCRIPTIONS: Record<Persona, string> = {
  'everyday': 'A typical everyday banking customer who wants simple, clear summaries.',
  'power-user': 'A detail-oriented power user who wants comprehensive data, charts, breakdowns, and advanced filtering options.',
  'accessibility': 'A user with accessibility needs — prefer high-contrast text, large touch targets, clear labelling, and minimal animation.',
};

const DENSITY_GUIDANCE: Record<Density, string> = {
  'compact': 'Use compact layouts — more information per screen, tighter spacing. Prefer TransactionListItem list views over Card grids.',
  'comfortable': 'Use standard spacing and layout. Balance information density with readability.',
  'spacious': 'Use spacious layouts with generous padding and larger touch targets. Fewer items per screen. Prefer Card grids over list views.',
};

const FONT_SIZE_GUIDANCE: Record<FontSize, string> = {
  'small': 'Font size is small — ensure important values remain readable. Use "body" or "caption" variants.',
  'medium': 'Standard font size — use default text variants.',
  'large': 'Font size is large — use larger text variants where possible (e.g. "h3" instead of "body" for monetary amounts).',
};

/**
 * Build a prompt block that the agent system prompt injects so Gemini
 * can adapt its UI output to the user's stated preferences.
 *
 * @param prefs - Current user preferences
 * @returns A formatted multi-line string ready to append to a system prompt
 */
export function buildPreferencesPromptBlock(prefs: UserPreferences): string {
  const lines: string[] = [
    '# USER PREFERENCES',
    '',
    `Persona:   ${prefs.persona} — ${PERSONA_DESCRIPTIONS[prefs.persona]}`,
    `Density:   ${prefs.density} — ${DENSITY_GUIDANCE[prefs.density]}`,
    `Font size: ${prefs.fontSize} — ${FONT_SIZE_GUIDANCE[prefs.fontSize]}`,
  ];

  if (prefs.highContrast) {
    lines.push('High contrast: ON — avoid subtle or muted colour variants. Use only strong foreground/background combinations.');
  }
  if (prefs.reducedMotion) {
    lines.push('Reduced motion: ON — do not suggest animated transitions in component props.');
  }

  lines.push(
    '',
    'Adapt the UI you generate to these preferences. Examples:',
    '- power-user persona → include summary stats, categorical breakdowns, and filter controls',
    '- compact density    → prefer TransactionListItem lists over Card grids',
    '- spacious density   → prefer Card grids, larger amounts text, generous spacing',
    '- accessibility persona → use Alert for important status, clear action button labels',
  );

  return lines.join('\n');
}
