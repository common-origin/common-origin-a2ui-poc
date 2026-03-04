'use client';

/**
 * PreferencesPanel
 *
 * A slide-in drawer that lets the user configure personalisation preferences.
 * Uses the Common Origin Sheet component for the overlay/animation shell, and
 * plain styled-components for the internal header/body/footer layout.
 */

import React from 'react';
import styled from 'styled-components';
import { Sheet, BooleanChip, Box, Typography, Button, Checkbox, Stack } from '@common-origin/design-system';
import type { UserPreferences, Theme, Density, FontSize, Persona } from '@/src/lib/userPreferences';

// ─── Styled layout wrappers ─────────────────────────────────────────────────
// Only thin structural wrappers are kept here; all UI elements use the DS.

const ScrollArea = styled.div`
  flex: 1;
  overflow-y: auto;
`;

/** Full-height flex column so header/scroll/footer fill the Sheet shell */
const SheetInner = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
`;

// ─── Helper ───────────────────────────────────────────────────────────────────

function OptionGroup<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <Stack direction="column" gap="sm">
      <Typography variant="small" color="subdued">{label}</Typography>
      <Stack direction="row" wrap gap="xs">
        {options.map(opt => (
          <BooleanChip
            key={opt.value}
            selected={value === opt.value}
            onClick={() => onChange(opt.value)}
            aria-label={opt.label}
          >
            {opt.label}
          </BooleanChip>
        ))}
      </Stack>
    </Stack>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface PreferencesPanelProps {
  isOpen: boolean;
  preferences: UserPreferences;
  onChange: (updated: UserPreferences) => void;
  onClose: () => void;
  onReset: () => void;
}

const THEME_OPTIONS: { value: Theme; label: string }[] = [
  { value: 'system', label: 'System' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
];

const DENSITY_OPTIONS: { value: Density; label: string }[] = [
  { value: 'compact', label: 'Compact' },
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'spacious', label: 'Spacious' },
];

const FONT_SIZE_OPTIONS: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const PERSONA_OPTIONS: { value: Persona; label: string }[] = [
  { value: 'everyday', label: 'Everyday' },
  { value: 'power-user', label: 'Power user' },
  { value: 'accessibility', label: 'Accessibility' },
];

function set<K extends keyof UserPreferences>(
  prefs: UserPreferences,
  key: K,
  value: UserPreferences[K]
): UserPreferences {
  return { ...prefs, [key]: value };
}

export function PreferencesPanel({
  isOpen,
  preferences,
  onChange,
  onClose,
  onReset,
}: PreferencesPanelProps) {
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      variant="sheet"
      width="min(380px, 92vw)"
      title="User preferences"
      closeOnOverlayClick
      closeOnEscape
    >
      <SheetInner>
        <ScrollArea>
          <Typography variant="h2">Personalise your experience</Typography>
          <Typography variant="body" color="subdued">
            Adjust your preferences for theme, layout, and more. Your changes will be saved automatically.
          </Typography>
          <Stack direction="column" gap="xl">
            <OptionGroup<Persona>
              label="Persona"
              options={PERSONA_OPTIONS}
              value={preferences.persona}
              onChange={v => onChange(set(preferences, 'persona', v))}
            />

            <OptionGroup<Theme>
              label="Theme"
              options={THEME_OPTIONS}
              value={preferences.theme}
              onChange={v => onChange(set(preferences, 'theme', v))}
            />

            <OptionGroup<Density>
              label="Layout density"
              options={DENSITY_OPTIONS}
              value={preferences.density}
              onChange={v => onChange(set(preferences, 'density', v))}
            />

            <OptionGroup<FontSize>
              label="Font size"
              options={FONT_SIZE_OPTIONS}
              value={preferences.fontSize}
              onChange={v => onChange(set(preferences, 'fontSize', v))}
            />

            <Stack direction="column" gap="sm">
              <Typography variant="small" color="subdued">Accessibility</Typography>
              <Checkbox
                label="High contrast"
                checked={preferences.highContrast}
                onChange={e => onChange(set(preferences, 'highContrast', e.target.checked))}
              />
              <Checkbox
                label="Reduce motion"
                checked={preferences.reducedMotion}
                onChange={e => onChange(set(preferences, 'reducedMotion', e.target.checked))}
              />
            </Stack>
          </Stack>
        </ScrollArea>
        <Box alignItems="flex-start">
          <Button variant="secondary" onClick={onReset} type="button" size="medium">
            Reset to defaults
          </Button>
        </Box>
      </SheetInner>
    </Sheet>
  );
}
