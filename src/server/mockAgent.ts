/**
 * Mock A2UI Agent — v0.9
 *
 * Simulates an agent that generates A2UI v0.9 messages for a "Transaction Finder" UI.
 * In production, this would be replaced with a real agent (e.g., Gemini via AG-UI).
 *
 * The agent demonstrates:
 * 1. createSurface → incremental updateComponents → results
 * 2. Data model population via updateDataModel
 * 3. Flat component format with string discriminator
 * 4. Streaming message delivery
 */

import type { A2UIMessage } from '../a2ui/types';
import { CATALOG_ID } from '../a2ui/constants';

/**
 * Transaction data for demo - Australian retailers & realistic banking data
 */
const MOCK_TRANSACTIONS = [
  { id: 'tx1', merchant: 'Woolworths', date: '2026-02-10', amount: -87.43, category: 'shopping', status: 'completed' },
  { id: 'tx2', merchant: 'Caltex Epping', date: '2026-02-09', amount: -52.00, category: 'transport', status: 'completed' },
  { id: 'tx3', merchant: 'Netflix Australia', date: '2026-02-08', amount: -22.99, category: 'entertainment', status: 'completed' },
  { id: 'tx4', merchant: 'The Coffee Club', date: '2026-02-08', amount: -6.75, category: 'dining', status: 'completed' },
  { id: 'tx5', merchant: 'Kmart Doncaster', date: '2026-02-07', amount: -42.36, category: 'shopping', status: 'completed' },
  { id: 'tx6', merchant: 'Woolworths Metro', date: '2026-02-07', amount: -34.20, category: 'shopping', status: 'completed' },
  { id: 'tx7', merchant: 'AGL Energy', date: '2026-02-06', amount: -189.50, category: 'bills', status: 'completed' },
  { id: 'tx8', merchant: 'Bunnings Warehouse', date: '2026-02-05', amount: -127.85, category: 'shopping', status: 'completed' },
  { id: 'tx9', merchant: 'Uber Eats', date: '2026-02-04', amount: -28.90, category: 'dining', status: 'completed' },
  { id: 'tx10', merchant: 'JB Hi-Fi', date: '2026-02-03', amount: -299.00, category: 'shopping', status: 'pending' },
];

/** v0.9: createSurface is always the first message */
function generateCreateSurface(): A2UIMessage {
  return {
    createSurface: {
      surfaceId: 'main',
      catalogId: CATALOG_ID,
    },
  };
}

/** Generate the initial UI structure components */
function generateInitialUIMessages(): A2UIMessage[] {
  return [
    {
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'root',
            component: 'Stack',
            direction: 'column',
            gap: 'lg',
            children: ['header', 'search-section', 'filter-section', 'results-section'],
          },
          {
            id: 'header',
            component: 'Text',
            text: 'Transaction finder',
            variant: 'h1',
          },
        ],
      },
    },
  ];
}

/** Generate search section */
function generateSearchSectionMessages(): A2UIMessage[] {
  return [
    {
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'search-section',
            component: 'Stack',
            direction: 'column',
            gap: 'md',
            children: ['search-field', 'search-helper'],
          },
          {
            id: 'search-field',
            component: 'SearchField',
            value: { path: '/query' },
            placeholder: 'Search by merchant, category, or amount',
            onChange: { eventType: 'change', dataPath: 'query' },
          },
          {
            id: 'search-helper',
            component: 'Text',
            text: 'Use filters below to narrow your search',
            variant: 'caption',
          },
        ],
      },
    },
  ];
}

/** Generate filter chip section */
function generateFilterSectionMessages(): A2UIMessage[] {
  return [
    {
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'filter-section',
            component: 'Stack',
            direction: 'column',
            gap: 'sm',
            children: ['filter-label', 'filter-chips'],
          },
          {
            id: 'filter-label',
            component: 'Text',
            text: 'Quick Filters',
            variant: 'h3',
          },
          {
            id: 'filter-chips',
            component: 'Stack',
            direction: 'row',
            gap: 'sm',
            children: ['chip-time', 'chip-direction', 'chip-method'],
          },
          {
            id: 'chip-time',
            component: 'BooleanChip',
            content: 'Last 30 days',
            selected: true,
          },
          {
            id: 'chip-direction',
            component: 'BooleanChip',
            content: 'Money out',
            selected: true,
          },
          {
            id: 'chip-method',
            component: 'BooleanChip',
            content: 'Card',
            selected: false,
          },
        ],
      },
    },
  ];
}

/** Generate results section with transactions */
function generateResultsSectionMessages(): A2UIMessage[] {
  const transactionComponents = MOCK_TRANSACTIONS.map((tx, index) => ({
    id: `tx-item-${index}`,
    component: 'TransactionListItem' as const,
    merchant: tx.merchant,
    amount: tx.amount,
    date: tx.date,
    status: tx.status || 'completed',
    category: tx.category || 'other',
    currency: 'AUD',
  }));

  // Group transactions by date
  const groups = new Map<string, typeof MOCK_TRANSACTIONS>();
  for (const tx of MOCK_TRANSACTIONS) {
    const existing = groups.get(tx.date) || [];
    existing.push(tx);
    groups.set(tx.date, existing);
  }

  const dateGroupComponents: any[] = [];
  const dateGroupIds: string[] = [];
  let groupIdx = 0;

  for (const [date, txs] of groups) {
    const groupId = `date-group-${groupIdx}`;
    dateGroupIds.push(groupId);
    const childIds = txs.map((_, i) => `tx-item-${MOCK_TRANSACTIONS.indexOf(txs[i])}`);
    const totalAmount = txs.reduce((sum, tx) => sum + tx.amount, 0);

    dateGroupComponents.push({
      id: groupId,
      component: 'DateGroup',
      date,
      format: 'relative',
      showCount: true,
      count: txs.length,
      showTotal: true,
      totalAmount,
      currency: 'AUD',
      children: childIds,
    });
    groupIdx++;
  }

  return [
    {
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'results-section',
            component: 'Stack',
            direction: 'column',
            gap: 'md',
            children: ['results-header', ...dateGroupIds],
          },
          {
            id: 'results-header',
            component: 'Text',
            text: `Found ${MOCK_TRANSACTIONS.length} transactions`,
            variant: 'h3',
          },
          ...dateGroupComponents,
          ...transactionComponents,
        ],
      },
    },
  ];
}

/** Generate empty state */
function generateEmptyStateMessages(): A2UIMessage[] {
  return [
    {
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'results-section',
            component: 'Stack',
            direction: 'column',
            gap: 'md',
            children: ['empty-state'],
          },
          {
            id: 'empty-state',
            component: 'EmptyState',
            illustration: 'search',
            title: 'No transactions found',
            description: "Try adjusting your search terms or filters to find what you're looking for.",
            variant: 'default',
            size: 'medium',
          },
        ],
      },
    },
  ];
}

/**
 * Stream A2UI v0.9 messages with simulated delays
 */
export async function streamTransactionFinderUI(
  onMessage: (message: A2UIMessage) => void,
  showEmptyState: boolean = false,
): Promise<void> {
  const sendWithDelay = async (messages: A2UIMessage[], delay: number) => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    messages.forEach(onMessage);
  };

  // Phase 0: Create surface (must be first)
  onMessage(generateCreateSurface());

  // Phase 1: Initial structure
  await sendWithDelay(generateInitialUIMessages(), 100);

  // Phase 2: Search section
  await sendWithDelay(generateSearchSectionMessages(), 300);

  // Phase 3: Filter chips
  await sendWithDelay(generateFilterSectionMessages(), 300);

  // Phase 4: Results or empty state
  if (showEmptyState) {
    await sendWithDelay(generateEmptyStateMessages(), 400);
  } else {
    await sendWithDelay(generateResultsSectionMessages(), 400);
  }
}

/**
 * Get all messages at once (for non-streaming scenarios)
 */
export function getTransactionFinderUIMessages(showEmptyState: boolean = false): A2UIMessage[] {
  const messages: A2UIMessage[] = [
    generateCreateSurface(),
    ...generateInitialUIMessages(),
    ...generateSearchSectionMessages(),
    ...generateFilterSectionMessages(),
  ];

  if (showEmptyState) {
    messages.push(...generateEmptyStateMessages());
  } else {
    messages.push(...generateResultsSectionMessages());
  }

  return messages;
}
