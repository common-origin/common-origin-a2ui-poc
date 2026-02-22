// @vitest-environment jsdom
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { renderNode } from './catalog';
import type { ComponentNode, SurfaceState } from './types';

/**
 * Rendering tests for catalog renderNode().
 * 
 * These tests verify that A2UI component nodes are correctly mapped
 * to Common Origin design system components with the right props.
 * 
 * Focus: Fund Transfer flow components (Stack, Text, TextField, NumberField,
 * Select, Button, Card, MoneyDisplay, Alert, StatusBadge, Divider, Progress).
 */

// ── Helpers ───────────────────────────────────────────────────────────

function makeSurface(
  components: ComponentNode[],
  dataModel: Record<string, unknown> = {}
): SurfaceState {
  const compMap = new Map<string, ComponentNode>();
  for (const c of components) {
    compMap.set(c.id, c);
  }
  return {
    surfaceId: 'test-surface',
    catalogId: 'common-origin.design-system:v2.4',
    root: 'root',
    components: compMap,
    dataModel: new Map(Object.entries(dataModel)),
    rendering: false,
  };
}

function renderComponent(
  node: ComponentNode,
  extraComponents: ComponentNode[] = [],
  dataModel: Record<string, unknown> = {},
  onAction?: (action: any) => void
) {
  const surface = makeSurface([node, ...extraComponents], dataModel);
  const element = renderNode(node, surface, onAction);
  if (!element) throw new Error(`renderNode returned null for ${node.component}`);
  return render(element);
}

// ── Text (Typography) ─────────────────────────────────────────────────

describe('Text component rendering', () => {
  it('renders text content', () => {
    renderComponent({
      id: 'text-1',
      component: 'Text',
      text: 'Transfer funds between your accounts',
      variant: 'h2',
    });
    expect(screen.getByText('Transfer funds between your accounts')).toBeInTheDocument();
  });

  it('renders with default variant when none specified', () => {
    renderComponent({
      id: 'text-2',
      component: 'Text',
      text: 'Body text',
    });
    expect(screen.getByText('Body text')).toBeInTheDocument();
  });

  it('resolves text from data model path', () => {
    renderComponent(
      { id: 'text-3', component: 'Text', text: { path: '/greeting' } },
      [],
      { greeting: 'Welcome back, Sarah' }
    );
    expect(screen.getByText('Welcome back, Sarah')).toBeInTheDocument();
  });
});

// ── Stack (Layout) ────────────────────────────────────────────────────

describe('Stack component rendering', () => {
  it('renders children in a stack', () => {
    const children = [
      { id: 'child-1', component: 'Text', text: 'First item' },
      { id: 'child-2', component: 'Text', text: 'Second item' },
    ];
    renderComponent(
      { id: 'stack-1', component: 'Stack', direction: 'column', gap: 'md', children: ['child-1', 'child-2'] },
      children
    );
    expect(screen.getByText('First item')).toBeInTheDocument();
    expect(screen.getByText('Second item')).toBeInTheDocument();
  });

  it('renders empty stack without errors', () => {
    const { container } = renderComponent({
      id: 'stack-empty',
      component: 'Stack',
      direction: 'column',
      children: [],
    });
    expect(container.firstChild).toBeInTheDocument();
  });

  it('skips missing children gracefully', () => {
    renderComponent(
      { id: 'stack-2', component: 'Stack', children: ['exists', 'missing'] },
      [{ id: 'exists', component: 'Text', text: 'I exist' }]
    );
    expect(screen.getByText('I exist')).toBeInTheDocument();
  });
});

// ── Button ────────────────────────────────────────────────────────────

describe('Button component rendering', () => {
  it('renders button with label', () => {
    renderComponent({
      id: 'btn-1',
      component: 'Button',
      label: 'Review Transfer',
      variant: 'primary',
    });
    expect(screen.getByRole('button', { name: 'Review Transfer' })).toBeInTheDocument();
  });

  it('renders secondary variant', () => {
    renderComponent({
      id: 'btn-2',
      component: 'Button',
      label: 'Cancel',
      variant: 'secondary',
    });
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('renders disabled button', () => {
    renderComponent({
      id: 'btn-3',
      component: 'Button',
      label: 'Submit',
      disabled: true,
    });
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('fires v0.9 spec action on click', () => {
    const onAction = vi.fn();
    renderComponent(
      {
        id: 'btn-confirm',
        component: 'Button',
        label: 'Confirm Transfer',
        action: {
          name: 'confirm_transfer',
          context: [
            { key: 'amount', value: { path: '/transfer/amount' } },
            { key: 'source', value: 'review_screen' },
          ],
        },
      },
      [],
      { transfer: { amount: 500 } },
      onAction
    );

    fireEvent.click(screen.getByRole('button', { name: 'Confirm Transfer' }));
    expect(onAction).toHaveBeenCalledTimes(1);

    const action = onAction.mock.calls[0][0];
    expect(action.userAction.name).toBe('confirm_transfer');
    expect(action.userAction.context.amount).toBe('500');
    expect(action.userAction.context.source).toBe('review_screen');
  });

  it('fires legacy action on click', () => {
    const onAction = vi.fn();
    renderComponent(
      {
        id: 'btn-legacy',
        component: 'Button',
        label: 'Old Button',
        onClick: { eventType: 'click', dataPath: '/some/path' },
      },
      [],
      {},
      onAction
    );

    fireEvent.click(screen.getByRole('button', { name: 'Old Button' }));
    expect(onAction).toHaveBeenCalledWith({ eventType: 'click', dataPath: '/some/path' });
  });

  it('resolves label from data model', () => {
    renderComponent(
      { id: 'btn-bound', component: 'Button', label: { path: '/action/label' } },
      [],
      { action: { label: 'Dynamic Label' } }
    );
    expect(screen.getByRole('button', { name: 'Dynamic Label' })).toBeInTheDocument();
  });
});

// ── TextField ─────────────────────────────────────────────────────────

describe('TextField component rendering', () => {
  it('renders with label', () => {
    renderComponent({
      id: 'tf-1',
      component: 'TextField',
      label: 'Description',
      type: 'text',
    });
    // TextField renders an input with associated label
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  it('renders with default value', () => {
    renderComponent({
      id: 'tf-2',
      component: 'TextField',
      label: 'Reference',
      value: 'Transfer to savings',
    });
    const input = screen.getByLabelText('Reference');
    expect(input).toHaveValue('Transfer to savings');
  });

  it('fires onChange action', () => {
    const onAction = vi.fn();
    renderComponent(
      {
        id: 'tf-3',
        component: 'TextField',
        label: 'Note',
        value: '',
        onChange: { eventType: 'change', dataPath: '/note' },
      },
      [],
      {},
      onAction
    );

    const input = screen.getByLabelText('Note');
    fireEvent.change(input, { target: { value: 'Rent payment' } });
    expect(onAction).toHaveBeenCalledTimes(1);
    expect(onAction.mock.calls[0][0].value).toBe('Rent payment');
  });
});

// ── MoneyDisplay ──────────────────────────────────────────────────────

describe('MoneyDisplay component rendering', () => {
  it('renders a monetary amount', () => {
    const { container } = renderComponent({
      id: 'money-1',
      component: 'MoneyDisplay',
      amount: 1500.50,
      currency: 'AUD',
      variant: 'default',
    });
    // MoneyDisplay should render the formatted amount
    expect(container.textContent).toMatch(/1[,.]?500/);
  });

  it('resolves amount from data model', () => {
    const { container } = renderComponent(
      { id: 'money-2', component: 'MoneyDisplay', amount: { path: '/balance' } },
      [],
      { balance: 42350 }
    );
    expect(container.textContent).toMatch(/42[,.]?350/);
  });

  it('renders negative amount for debits', () => {
    const { container } = renderComponent({
      id: 'money-3',
      component: 'MoneyDisplay',
      amount: -89.99,
      variant: 'negative',
      showSign: true,
    });
    expect(container.textContent).toMatch(/89/);
  });
});

// ── Alert ─────────────────────────────────────────────────────────────

describe('Alert component rendering', () => {
  it('renders success alert', () => {
    renderComponent({
      id: 'alert-1',
      component: 'Alert',
      variant: 'success',
      title: 'Transfer Complete',
      content: 'Your transfer of $500.00 has been processed.',
    });
    expect(screen.getByText('Transfer Complete')).toBeInTheDocument();
    expect(screen.getByText('Your transfer of $500.00 has been processed.')).toBeInTheDocument();
  });

  it('renders info alert with default variant', () => {
    renderComponent({
      id: 'alert-2',
      component: 'Alert',
      content: 'Transfers may take up to 24 hours.',
    });
    expect(screen.getByText('Transfers may take up to 24 hours.')).toBeInTheDocument();
  });
});

// ── StatusBadge ───────────────────────────────────────────────────────

describe('StatusBadge component rendering', () => {
  it('renders completed status', () => {
    const { container } = renderComponent({
      id: 'status-1',
      component: 'StatusBadge',
      status: 'completed',
      label: 'Completed',
    });
    expect(container.textContent).toMatch(/Completed/i);
  });

  it('renders pending status', () => {
    const { container } = renderComponent({
      id: 'status-2',
      component: 'StatusBadge',
      status: 'pending',
      label: 'Processing',
    });
    expect(container.textContent).toMatch(/Processing/i);
  });
});

// ── Select (Dropdown) ─────────────────────────────────────────────────

describe('Select component rendering', () => {
  it('renders dropdown with label', () => {
    renderComponent({
      id: 'select-1',
      component: 'Select',
      label: 'From Account',
      value: '',
      options: [
        { value: 'everyday', label: 'Everyday Account' },
        { value: 'savings', label: 'Savings Account' },
      ],
    });
    expect(screen.getByText('From Account')).toBeInTheDocument();
  });
});

// ── NumberField (NumberInput) ─────────────────────────────────────────

describe('NumberField component rendering', () => {
  it('renders with label', () => {
    renderComponent({
      id: 'num-1',
      component: 'NumberField',
      label: 'Amount',
      min: 1,
      max: 10000,
      step: 0.01,
    });
    expect(screen.getByLabelText('Amount')).toBeInTheDocument();
  });
});

// ── Divider ───────────────────────────────────────────────────────────

describe('Divider component rendering', () => {
  it('renders horizontal divider', () => {
    const { container } = renderComponent({
      id: 'div-1',
      component: 'Divider',
      orientation: 'horizontal',
    });
    expect(container.firstChild).toBeInTheDocument();
  });
});

// ── Card ──────────────────────────────────────────────────────────────

describe('Card component rendering', () => {
  it('renders card without children using CardLarge (title and excerpt)', () => {
    renderComponent({
      id: 'card-1',
      component: 'Card',
      title: 'Transfer Summary',
      excerpt: 'Review your transfer details below',
    });
    expect(screen.getByText('Transfer Summary')).toBeInTheDocument();
    expect(screen.getByText('Review your transfer details below')).toBeInTheDocument();
  });

  it('renders card with children using Box container', () => {
    renderComponent(
      {
        id: 'card-2',
        component: 'Card',
        variant: 'outlined',
        children: ['card-child'],
      },
      [{ id: 'card-child', component: 'Text', text: 'Child content inside card' }]
    );
    // Children should now be rendered (Box supports children, CardLarge did not)
    expect(screen.getByText('Child content inside card')).toBeInTheDocument();
  });

  it('renders card with children and title using Box', () => {
    renderComponent(
      {
        id: 'card-3',
        component: 'Card',
        title: 'Summary',
        variant: 'outlined',
        children: ['card-text'],
      },
      [{ id: 'card-text', component: 'Text', text: 'Transfer details here' }]
    );
    expect(screen.getByText('Summary')).toBeInTheDocument();
    expect(screen.getByText('Transfer details here')).toBeInTheDocument();
  });

  it('resolves title from data model', () => {
    renderComponent(
      { id: 'card-4', component: 'Card', title: { path: '/card/title' }, excerpt: 'ok' },
      [],
      { card: { title: 'Dynamic Card' } }
    );
    expect(screen.getByText('Dynamic Card')).toBeInTheDocument();
  });
});

// ── Progress ──────────────────────────────────────────────────────────

describe('Progress component rendering', () => {
  it('renders progress bar with label', () => {
    const { container } = renderComponent({
      id: 'prog-1',
      component: 'Progress',
      label: 'Transfer progress',
      value: 75,
      variant: 'linear',
    });
    expect(container.textContent).toMatch(/Transfer progress/);
  });
});

// ── CategoryBadge ─────────────────────────────────────────────────────

describe('CategoryBadge component rendering', () => {
  it('renders with label prop (primary)', () => {
    renderComponent({
      id: 'badge-1',
      component: 'CategoryBadge',
      label: 'Shopping',
      color: 'blue',
    });
    expect(screen.getByText('Shopping')).toBeInTheDocument();
  });

  it('falls back to content prop (deprecated alias)', () => {
    renderComponent({
      id: 'badge-2',
      component: 'CategoryBadge',
      content: 'Groceries',
      color: 'green',
    });
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('prefers label over content when both provided', () => {
    renderComponent({
      id: 'badge-3',
      component: 'CategoryBadge',
      label: 'Primary',
      content: 'Fallback',
      color: 'red',
    });
    expect(screen.getByText('Primary')).toBeInTheDocument();
  });
});

// ── Edge Cases ────────────────────────────────────────────────────────

describe('renderNode edge cases', () => {
  it('returns null for unknown component type', () => {
    const surface = makeSurface([
      { id: 'unknown', component: 'ScriptTag', text: 'evil' },
    ]);
    const result = renderNode(
      { id: 'unknown', component: 'ScriptTag', text: 'evil' },
      surface
    );
    expect(result).toBeNull();
  });

  it('caps tree depth at 10', () => {
    // Create a deeply nested structure
    const components: ComponentNode[] = [];
    for (let i = 0; i <= 12; i++) {
      components.push({
        id: `depth-${i}`,
        component: 'Stack',
        children: i < 12 ? [`depth-${i + 1}`] : [],
      });
    }
    // The deepest one should have visible text
    components.push({
      id: 'depth-12',
      component: 'Text',
      text: 'Should not render',
      children: [],
    });

    const surface = makeSurface(components);
    const element = renderNode(components[0], surface);
    const { container } = render(element!);
    
    // Content past depth 10 should be hidden
    expect(container.textContent).not.toContain('Should not render');
  });
});
