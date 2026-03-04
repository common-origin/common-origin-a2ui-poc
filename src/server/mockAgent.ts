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

function getRelativeISODate(daysAgo: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

type MockTransactionSeed = {
  merchant: string;
  daysAgo: number;
  amount: number;
  category: 'shopping' | 'dining' | 'transport' | 'entertainment' | 'bills' | 'other';
  status: 'completed' | 'pending' | 'failed';
};

/**
 * Transaction data for demo - Australian retailers & realistic banking data
 * Consistent with Sarah Chen's Everyday Account (••••7890)
 */
const MOCK_TRANSACTION_SEED: MockTransactionSeed[] = [
  { merchant: 'Woolworths Metro CBD', daysAgo: 0, amount: -92.15, category: 'shopping', status: 'completed' },
  { merchant: 'The Coffee Club', daysAgo: 0, amount: -9.20, category: 'dining', status: 'completed' },
  { merchant: 'Uber Eats', daysAgo: 1, amount: -31.60, category: 'dining', status: 'pending' },
  { merchant: 'Myki Top Up', daysAgo: 1, amount: -25.00, category: 'transport', status: 'completed' },
  { merchant: 'Coles Fitzroy', daysAgo: 2, amount: -76.40, category: 'shopping', status: 'completed' },
  { merchant: 'Caltex Epping', daysAgo: 2, amount: -66.80, category: 'transport', status: 'completed' },
  { merchant: 'AGL Energy', daysAgo: 3, amount: -189.00, category: 'bills', status: 'completed' },
  { merchant: "Grill'd Carlton", daysAgo: 4, amount: -28.70, category: 'dining', status: 'completed' },
  { merchant: 'Netflix Australia', daysAgo: 5, amount: -22.99, category: 'entertainment', status: 'completed' },
  { merchant: 'Chemist Warehouse', daysAgo: 5, amount: -34.50, category: 'other', status: 'completed' },
  { merchant: 'Woolworths Doncaster', daysAgo: 6, amount: -68.40, category: 'shopping', status: 'completed' },
  { merchant: 'JB Hi-Fi', daysAgo: 7, amount: -249.00, category: 'shopping', status: 'pending' },
  { merchant: 'Bunnings Warehouse', daysAgo: 8, amount: -112.35, category: 'shopping', status: 'completed' },
  { merchant: 'Kmart Doncaster', daysAgo: 9, amount: -53.20, category: 'shopping', status: 'completed' },
  { merchant: 'The Coffee Club', daysAgo: 10, amount: -7.90, category: 'dining', status: 'completed' },
  { merchant: 'Ampol Northcote', daysAgo: 11, amount: -61.45, category: 'transport', status: 'completed' },
  { merchant: 'Spotify', daysAgo: 12, amount: -13.99, category: 'entertainment', status: 'completed' },
  { merchant: 'Woolworths Metro CBD', daysAgo: 13, amount: -81.35, category: 'shopping', status: 'completed' },
  { merchant: 'Salary Credit - Common Origin Pty', daysAgo: 14, amount: 4250.00, category: 'other', status: 'completed' },
  { merchant: 'Uber', daysAgo: 15, amount: -24.85, category: 'transport', status: 'completed' },
  { merchant: 'Telstra', daysAgo: 16, amount: -139.00, category: 'bills', status: 'completed' },
  { merchant: 'Coles Richmond', daysAgo: 17, amount: -72.10, category: 'shopping', status: 'completed' },
  { merchant: 'Officeworks Richmond', daysAgo: 18, amount: -46.80, category: 'shopping', status: 'failed' },
  { merchant: 'Uber Eats', daysAgo: 19, amount: -33.45, category: 'dining', status: 'completed' },
  { merchant: 'AGL Energy', daysAgo: 20, amount: -197.30, category: 'bills', status: 'completed' },
  { merchant: 'Myki Top Up', daysAgo: 21, amount: -30.00, category: 'transport', status: 'completed' },
  { merchant: 'Woolworths Doncaster', daysAgo: 23, amount: -74.20, category: 'shopping', status: 'completed' },
  { merchant: 'Event Cinemas', daysAgo: 25, amount: -44.00, category: 'entertainment', status: 'completed' },
  { merchant: 'Bunnings Warehouse', daysAgo: 27, amount: -58.30, category: 'shopping', status: 'completed' },
  { merchant: 'The Coffee Club', daysAgo: 29, amount: -10.60, category: 'dining', status: 'completed' },
  { merchant: 'Origin Energy', daysAgo: 31, amount: -86.50, category: 'bills', status: 'completed' },
  { merchant: 'Woolworths Metro CBD', daysAgo: 34, amount: -88.95, category: 'shopping', status: 'completed' },
  { merchant: 'Caltex Epping', daysAgo: 37, amount: -70.15, category: 'transport', status: 'completed' },
  { merchant: 'Netflix Australia', daysAgo: 40, amount: -22.99, category: 'entertainment', status: 'completed' },
  { merchant: 'Coles Fitzroy', daysAgo: 43, amount: -69.80, category: 'shopping', status: 'completed' },
  { merchant: 'Refund - Woolworths Metro CBD', daysAgo: 46, amount: 18.20, category: 'other', status: 'completed' },
  { merchant: 'Myki Top Up', daysAgo: 49, amount: -20.00, category: 'transport', status: 'completed' },
  { merchant: 'AGL Energy', daysAgo: 52, amount: -192.10, category: 'bills', status: 'completed' },
  { merchant: "Grill'd Carlton", daysAgo: 55, amount: -29.40, category: 'dining', status: 'completed' },
  { merchant: 'Kmart Doncaster', daysAgo: 58, amount: -41.55, category: 'shopping', status: 'completed' },
  { merchant: 'Woolworths Doncaster', daysAgo: 61, amount: -82.75, category: 'shopping', status: 'completed' },
  { merchant: 'Telstra', daysAgo: 64, amount: -139.00, category: 'bills', status: 'completed' },
  { merchant: 'Uber', daysAgo: 67, amount: -22.40, category: 'transport', status: 'completed' },
  { merchant: 'JB Hi-Fi', daysAgo: 70, amount: -119.00, category: 'shopping', status: 'completed' },
  { merchant: 'The Coffee Club', daysAgo: 73, amount: -8.80, category: 'dining', status: 'completed' },
  { merchant: 'Salary Credit - Common Origin Pty', daysAgo: 76, amount: 4250.00, category: 'other', status: 'completed' },
  { merchant: 'Bunnings Warehouse', daysAgo: 79, amount: -96.25, category: 'shopping', status: 'completed' },
  { merchant: 'Officeworks Richmond', daysAgo: 82, amount: -28.90, category: 'shopping', status: 'completed' },
  { merchant: 'Origin Energy', daysAgo: 85, amount: -83.10, category: 'bills', status: 'completed' },
  { merchant: 'Event Cinemas', daysAgo: 88, amount: -36.00, category: 'entertainment', status: 'completed' },
];

const MOCK_TRANSACTIONS = MOCK_TRANSACTION_SEED.map((transaction, index) => ({
  id: `tx${index + 1}`,
  merchant: transaction.merchant,
  date: getRelativeISODate(transaction.daysAgo),
  amount: transaction.amount,
  category: transaction.category,
  status: transaction.status,
}));

/** v0.9: createSurface is always the first message */
function generateCreateSurface(): A2UIMessage {
  return {
    createSurface: {
      surfaceId: 'main',
      catalogId: CATALOG_ID,
    },
  };
}

function generateInitialDataModelMessage(): A2UIMessage {
  return {
    updateDataModel: {
      surfaceId: 'main',
      value: {
        query: '',
        filters: {
          last30Days: true,
          moneyOut: true,
          card: false,
        },
      },
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
            selected: { path: '/filters/last30Days' },
            onClick: { eventType: 'change', dataPath: 'filters.last30Days' },
          },
          {
            id: 'chip-direction',
            component: 'BooleanChip',
            content: 'Money out',
            selected: { path: '/filters/moneyOut' },
            onClick: { eventType: 'change', dataPath: 'filters.moneyOut' },
          },
          {
            id: 'chip-method',
            component: 'BooleanChip',
            content: 'Card',
            selected: { path: '/filters/card' },
            onClick: { eventType: 'change', dataPath: 'filters.card' },
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
  // Gate demo delays behind NEXT_PUBLIC_DEMO_TIMING=true so tests and
  // performance benchmarks run at full speed without artificial waits.
  const demoDelay = (ms: number): Promise<void> =>
    process.env.NEXT_PUBLIC_DEMO_TIMING === 'true'
      ? new Promise<void>((resolve) => setTimeout(resolve, ms))
      : Promise.resolve();

  const sendWithDelay = async (messages: A2UIMessage[], delay: number) => {
    await demoDelay(delay);
    messages.forEach(onMessage);
  };

  // Phase 0: Create surface (must be first)
  onMessage(generateCreateSurface());
  onMessage(generateInitialDataModelMessage());

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
    generateInitialDataModelMessage(),
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
