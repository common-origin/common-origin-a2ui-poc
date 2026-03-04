'use client';

/**
 * SurfaceFeedback
 *
 * A lightweight "Was this helpful?" widget rendered below each A2UI surface.
 * Demonstrates the feedback-loop concept from Phase 8 — users signal whether
 * the rendered UI met their need, closing the loop between user experience
 * and pattern refinement.
 *
 * Feedback is kept purely client-side for the demo (console.info log) but
 * the component is structured so a real analytics endpoint can be swapped in.
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import { createLogger } from '@/src/lib/logger';

const log = createLogger('Feedback');

// ─── Styled primitives ────────────────────────────────────────────────────────

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  border-top: 1px solid var(--border, #dee2e6);
  margin-top: 1.5rem;
  flex-wrap: wrap;
`;

const Label = styled.span`
  font-size: 0.875rem;
  color: var(--muted, #6c757d);
  flex-shrink: 0;
`;

const ThumbButton = styled.button<{ $active: boolean; $variant: 'up' | 'down' }>`
  background: none;
  border: 1.5px solid
    ${p =>
      p.$active
        ? p.$variant === 'up'
          ? '#198754'
          : '#dc3545'
        : 'var(--border, #dee2e6)'};
  color: ${p =>
    p.$active
      ? p.$variant === 'up'
        ? '#198754'
        : '#dc3545'
      : 'var(--muted, #6c757d)'};
  border-radius: 999px;
  width: 36px;
  height: 36px;
  font-size: 1rem;
  cursor: ${p => (p.$active ? 'default' : 'pointer')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;

  &:hover:not(:disabled) {
    border-color: ${p => (p.$variant === 'up' ? '#198754' : '#dc3545')};
    color: ${p => (p.$variant === 'up' ? '#198754' : '#dc3545')};
    background: ${p =>
      p.$variant === 'up'
        ? 'rgba(25, 135, 84, 0.06)'
        : 'rgba(220, 53, 69, 0.06)'};
  }

  &:focus-visible {
    outline: 2px solid #0d6efd;
    outline-offset: 2px;
  }
`;

const ThanksText = styled.span`
  font-size: 0.875rem;
  color: #198754;
  font-weight: 600;
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-2px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

// ─── Types ────────────────────────────────────────────────────────────────────

export type FeedbackValue = 'helpful' | 'not-helpful';

export interface SurfaceFeedbackProps {
  /** Identifies which surface this feedback relates to (for analytics). */
  surfaceId: string;
  /** Optional query the surface was responding to. */
  query?: string;
  /** Called when the user submits feedback. */
  onFeedback?: (value: FeedbackValue, surfaceId: string) => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function SurfaceFeedback({ surfaceId, query, onFeedback }: SurfaceFeedbackProps) {
  const [submitted, setSubmitted] = useState<FeedbackValue | null>(null);

  const handleFeedback = (value: FeedbackValue) => {
    if (submitted) return;
    setSubmitted(value);
    log.info('Surface feedback', { surfaceId, value, query });
    onFeedback?.(value, surfaceId);
  };

  return (
    <Container role="group" aria-label="Feedback on generated UI">
      <Label>Was this helpful?</Label>
      <ThumbButton
        $active={submitted === 'helpful'}
        $variant="up"
        onClick={() => handleFeedback('helpful')}
        disabled={submitted !== null}
        aria-label="Yes, this was helpful"
        aria-pressed={submitted === 'helpful'}
        title="Helpful"
      >
        👍
      </ThumbButton>
      <ThumbButton
        $active={submitted === 'not-helpful'}
        $variant="down"
        onClick={() => handleFeedback('not-helpful')}
        disabled={submitted !== null}
        aria-label="No, this was not helpful"
        aria-pressed={submitted === 'not-helpful'}
        title="Not helpful"
      >
        👎
      </ThumbButton>
      {submitted && (
        <ThanksText role="status" aria-live="polite">
          Thanks for your feedback!
        </ThanksText>
      )}
    </Container>
  );
}
