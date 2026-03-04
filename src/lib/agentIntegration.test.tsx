// @vitest-environment jsdom
/**
 * Integration tests: AgentInput.onSubmit → handleSubmit → callAgent
 *
 * Verifies the end-to-end wiring in app/page.tsx:
 *   1. AgentInput.onSubmit fires with a transcript payload
 *   2. handleSubmit receives the text, sets isGenerating (surfaces as isSubmitting/disabled)
 *   3. callAgent is invoked with the transcript text
 *   4. isGenerating clears after callAgent resolves
 *
 * Heavy dependencies (DS, A2UISurface, agentClient) are mocked so the test
 * focuses solely on page-level state and wiring logic.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';

// ── Mock: @common-origin/design-system ────────────────────────────────────
// We capture onSubmit so each test can trigger it directly, simulating
// both typed text and voice transcript payloads.
let capturedOnSubmit: ((payload: { text: string }) => void) | null = null;
let capturedOnVoiceError: ((error: { message: string }) => void) | null = null;

vi.mock('@common-origin/design-system', () => ({
  AgentInput: ({
    onSubmit,
    onVoiceError,
    disabled,
    isSubmitting,
    errorMessage,
  }: {
    onSubmit: (p: { text: string }) => void;
    onVoiceError?: (e: { message: string }) => void;
    disabled?: boolean;
    isSubmitting?: boolean;
    errorMessage?: string;
  }) => {
    capturedOnSubmit = onSubmit;
    capturedOnVoiceError = onVoiceError ?? null;
    return (
      <div
        data-testid="agent-input"
        data-disabled={String(disabled ?? false)}
        data-submitting={String(isSubmitting ?? false)}
        data-error={errorMessage ?? ''}
      />
    );
  },
  Box: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Alert: ({ children, content, title }: { children?: React.ReactNode; content?: string; title?: string }) => (
    <div role="alert" data-title={title}>{children ?? content}</div>
  ),
  Sheet: ({ children, isOpen }: { children?: React.ReactNode; isOpen: boolean }) =>
    isOpen ? <div data-testid="sheet">{children}</div> : null,
  BooleanChip: ({ children, onClick }: { children?: React.ReactNode; selected: boolean; onClick: () => void }) => (
    <button onClick={onClick}>{children}</button>
  ),
  Button: ({ children, onClick, type }: { children?: React.ReactNode; onClick?: () => void; type?: string; variant?: string; size?: string }) => (
    <button type={(type as 'button' | 'submit' | 'reset') ?? 'button'} onClick={onClick}>{children}</button>
  ),
  Checkbox: ({ label, checked, onChange }: { label: string; checked?: boolean; onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <input type="checkbox" aria-label={label} checked={checked ?? false} onChange={onChange} />
  ),
  Stack: ({ children }: { children?: React.ReactNode }) => <div>{children}</div>,
  Typography: ({ children }: { children?: React.ReactNode }) => <span>{children}</span>,
}));

// ── Mock: agentClient ─────────────────────────────────────────────────────
const mockCallAgent = vi.fn<
  (msg: string, onChunk: (msg: unknown) => void, scenario: string | undefined, context: Record<string, unknown>) => Promise<void>
>();

vi.mock('@/src/lib/agentClient', () => ({
  callAgent: mockCallAgent,
  getAgentMode: () => 'mock' as const,
}));

// ── Mock: A2UISurface ─────────────────────────────────────────────────────
// Avoids SurfaceContext dependency; sendMessage is a no-op spy.
const mockSendMessage = vi.fn();

vi.mock('@/src/components/A2UISurface', () => ({
  A2UISurface: () => <div data-testid="a2ui-surface" />,
  useA2UISurface: () => ({ sendMessage: mockSendMessage }),
}));

// ── Mock: A2UIErrorBoundary ───────────────────────────────────────────────
vi.mock('@/src/components/A2UIErrorBoundary', () => ({
  A2UIErrorBoundary: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// ── Mock: catalog (CATALOG_ID only) ───────────────────────────────────────
vi.mock('@/src/a2ui/catalog', () => ({
  CATALOG_ID: 'common-origin.design-system:v2.4',
  renderNode: () => null,
}));

// ── Import page under test (after mocks are registered) ───────────────────
// Dynamic so vitest hoists vi.mock() above all imports.
const { default: Home } = await import('../../app/page');

// ── Tests ─────────────────────────────────────────────────────────────────

describe('Home page – AgentInput.onSubmit integration', () => {
  beforeEach(() => {
    capturedOnSubmit = null;
    capturedOnVoiceError = null;
    mockCallAgent.mockReset();
    mockSendMessage.mockReset();
    // Default: resolves immediately
    mockCallAgent.mockResolvedValue(undefined);
  });

  it('renders AgentInput and exposes an onSubmit handler', () => {
    render(<Home />);
    expect(screen.getByTestId('agent-input')).toBeInTheDocument();
    expect(capturedOnSubmit).toBeTypeOf('function');
  });

  it('calls callAgent with the transcript text from onSubmit', async () => {
    render(<Home />);

    await act(async () => {
      capturedOnSubmit!({ text: 'Transfer $200 to savings' });
    });

    expect(mockCallAgent).toHaveBeenCalledTimes(1);
    expect(mockCallAgent.mock.calls[0][0]).toBe('Transfer $200 to savings');
  });

  it('sets isSubmitting=true on AgentInput while callAgent is running', async () => {
    let resolveAgent!: () => void;
    mockCallAgent.mockImplementation(
      () => new Promise<void>((res) => { resolveAgent = res; })
    );

    render(<Home />);
    const input = screen.getByTestId('agent-input');

    // Trigger without awaiting so agent stays pending
    act(() => {
      capturedOnSubmit!({ text: 'Show my accounts' });
    });

    // isGenerating → isSubmitting/disabled should both be "true"
    expect(input.getAttribute('data-submitting')).toBe('true');
    expect(input.getAttribute('data-disabled')).toBe('true');

    // Resolve and confirm state clears
    await act(async () => { resolveAgent(); });

    expect(input.getAttribute('data-submitting')).toBe('false');
    expect(input.getAttribute('data-disabled')).toBe('false');
  });

  it('does not call callAgent when the transcript is empty / whitespace-only', async () => {
    render(<Home />);

    await act(async () => {
      capturedOnSubmit!({ text: '   ' });
    });

    expect(mockCallAgent).not.toHaveBeenCalled();
  });

  it('passes transcript text unmodified to callAgent (voice phrasing)', async () => {
    render(<Home />);

    await act(async () => {
      capturedOnSubmit!({ text: 'Pay my electricity bill' });
    });

    expect(mockCallAgent.mock.calls[0][0]).toBe('Pay my electricity bill');
  });

  it('does not call callAgent again while a previous call is still in progress', async () => {
    let resolveAgent!: () => void;
    mockCallAgent.mockImplementation(
      () => new Promise<void>((res) => { resolveAgent = res; })
    );

    render(<Home />);

    // First submission — stays pending
    act(() => {
      capturedOnSubmit!({ text: 'Show my balance' });
    });

    // Second submission while first is pending — should be ignored
    await act(async () => {
      capturedOnSubmit!({ text: 'Transfer $50' });
    });

    expect(mockCallAgent).toHaveBeenCalledTimes(1);

    await act(async () => { resolveAgent(); });
  });

  it('shows StatusIndicator with "Agent streaming" text after first submit', async () => {
    let resolveAgent!: () => void;
    mockCallAgent.mockImplementation(
      () => new Promise<void>((res) => { resolveAgent = res; })
    );

    render(<Home />);

    act(() => {
      capturedOnSubmit!({ text: 'What is my balance?' });
    });

    expect(await screen.findByText(/agent streaming/i)).toBeInTheDocument();

    await act(async () => { resolveAgent(); });
  });

  it('shows "UI generation complete" status once callAgent has resolved', async () => {
    render(<Home />);

    await act(async () => {
      capturedOnSubmit!({ text: 'Show spending summary' });
    });

    expect(screen.getByText(/UI generation complete/i)).toBeInTheDocument();
  });

  it('surfaces a voice error via errorMessage prop when onVoiceError fires', async () => {
    render(<Home />);
    const input = screen.getByTestId('agent-input');

    act(() => {
      capturedOnVoiceError!({ message: 'Microphone not allowed' });
    });

    expect(input.getAttribute('data-error')).toBe('Microphone not allowed');
  });
});
