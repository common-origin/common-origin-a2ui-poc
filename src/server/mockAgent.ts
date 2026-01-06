/**
 * Mock A2UI Agent
 * 
 * Simulates an agent that generates A2UI messages for a "Transaction Finder" UI.
 * In production, this would be replaced with a real agent (e.g., Gemini via AG-UI).
 * 
 * The agent demonstrates:
 * 1. Incremental UI updates (skeleton -> form -> results)
 * 2. Data model population
 * 3. Component catalog usage
 * 4. Streaming message delivery
 */

import type { A2UIMessage } from '../a2ui/types';

/**
 * Transaction data for demo
 */
const MOCK_TRANSACTIONS = [
  {
    id: 'tx1',
    merchant: 'Whole Foods Market',
    date: '2025-12-15',
    amount: -87.43,
    category: 'Groceries',
  },
  {
    id: 'tx2',
    merchant: 'Shell Gas Station',
    date: '2025-12-14',
    amount: -52.00,
    category: 'Transportation',
  },
  {
    id: 'tx3',
    merchant: 'Netflix',
    date: '2025-12-13',
    amount: -15.99,
    category: 'Entertainment',
  },
  {
    id: 'tx4',
    merchant: 'Starbucks',
    date: '2025-12-12',
    amount: -6.75,
    category: 'Food & Drink',
  },
  {
    id: 'tx5',
    merchant: 'Amazon',
    date: '2025-12-11',
    amount: -42.36,
    category: 'Shopping',
  },
];

/**
 * Generate the initial UI structure messages
 */
function generateInitialUIMessages(): A2UIMessage[] {
  return [
    // Define the main container
    {
      surfaceUpdate: {
        surfaceId: 'main',
        components: [
          {
            id: 'root',
            component: {
              Stack: {
                direction: 'column',
                gap: 'lg',
              },
            },
            children: ['header', 'search-section', 'filter-section', 'results-section'],
          },
          {
            id: 'header',
            component: {
              Text: {
                text: { literalString: 'Transaction finder' },
                variant: 'h1',
              },
            },
          },
        ],
      },
    },
  ];
}

/**
 * Generate search section messages
 */
function generateSearchSectionMessages(): A2UIMessage[] {
  return [
    {
      surfaceUpdate: {
        surfaceId: 'main',
        components: [
          {
            id: 'search-section',
            component: {
              Stack: {
                direction: 'column',
                gap: 'md',
              },
            },
            children: ['search-field', 'search-helper'],
          },
          {
            id: 'search-field',
            component: {
              SearchField: {
                value: { path: '/query' },
                placeholder: 'Search by merchant, category, or amount',
                onChange: {
                  eventType: 'change',
                  dataPath: 'query',
                },
              },
            },
          },
          {
            id: 'search-helper',
            component: {
              Text: {
                text: { literalString: 'Use filters below to narrow your search' },
                variant: 'caption',
              },
            },
          },
        ],
      },
    },
  ];
}

/**
 * Generate filter chip section messages
 */
function generateFilterSectionMessages(): A2UIMessage[] {
  return [
    {
      surfaceUpdate: {
        surfaceId: 'main',
        components: [
          {
            id: 'filter-section',
            component: {
              Stack: {
                direction: 'column',
                gap: 'sm',
              },
            },
            children: ['filter-label', 'filter-chips'],
          },
          {
            id: 'filter-label',
            component: {
              Text: {
                text: { literalString: 'Quick Filters' },
                variant: 'h3',
              },
            },
          },
          {
            id: 'filter-chips',
            component: {
              Stack: {
                direction: 'row',
                gap: 'sm',
              },
            },
            children: ['chip-time', 'chip-direction', 'chip-method'],
          },
          {
            id: 'chip-time',
            component: {
              BooleanChip: {
                content: { literalString: 'Last 30 days' },
                selected: true,
              },
            },
          },
          {
            id: 'chip-direction',
            component: {
              BooleanChip: {
                content: { literalString: 'Money out' },
                selected: true,
              },
            },
          },
          {
            id: 'chip-method',
            component: {
              BooleanChip: {
                content: { literalString: 'Card' },
                selected: false,
              },
            },
          },
        ],
      },
    },
  ];
}

/**
 * Generate results section with transactions
 */
function generateResultsSectionMessages(): A2UIMessage[] {
  // Map category strings to valid category types
  const categoryMap: Record<string, 'shopping' | 'dining' | 'transport' | 'entertainment' | 'bills' | 'other'> = {
    'Groceries': 'shopping',
    'Transportation': 'transport',
    'Entertainment': 'entertainment',
    'Food & Drink': 'dining',
    'Shopping': 'shopping',
  };

  const transactionComponents = MOCK_TRANSACTIONS.map((tx, index) => ({
    id: `tx-item-${index}`,
    component: {
      TransactionListItem: {
        merchant: { literalString: tx.merchant },
        amount: tx.amount,
        date: { literalString: tx.date },
        status: 'completed' as const,
        category: categoryMap[tx.category] || 'other',
        currency: 'USD',
      },
    },
  }));

  return [
    {
      surfaceUpdate: {
        surfaceId: 'main',
        components: [
          {
            id: 'results-section',
            component: {
              Stack: {
                direction: 'column',
                gap: 'md',
              },
            },
            children: ['results-header', 'date-group-today', 'date-group-yesterday'],
          },
          {
            id: 'results-header',
            component: {
              Text: {
                text: { literalString: `Found ${MOCK_TRANSACTIONS.length} transactions` },
                variant: 'h3',
              },
            },
          },
          // Today's transactions
          {
            id: 'date-group-today',
            component: {
              DateGroup: {
                date: { literalString: 'Today' },
                format: 'relative',
                showCount: true,
                count: 2,
                currency: 'USD',
              },
            },
            children: ['tx-item-0', 'tx-item-1'],
          },
          // Yesterday's transactions
          {
            id: 'date-group-yesterday',
            component: {
              DateGroup: {
                date: { literalString: 'Yesterday' },
                format: 'relative',
                showCount: true,
                count: 3,
                currency: 'USD',
              },
            },
            children: ['tx-item-2', 'tx-item-3', 'tx-item-4'],
          },
          ...transactionComponents,
        ],
      },
    },
  ];
}

/**
 * Generate empty state messages
 */
function generateEmptyStateMessages(): A2UIMessage[] {
  return [
    {
      surfaceUpdate: {
        surfaceId: 'main',
        components: [
          {
            id: 'results-section',
            component: {
              Stack: {
                direction: 'column',
                gap: 'md',
              },
            },
            children: ['empty-state'],
          },
          {
            id: 'empty-state',
            component: {
              EmptyState: {
                illustration: 'search',
                title: { literalString: 'No transactions found' },
                description: { literalString: 'Try adjusting your search terms or filters to find what you\'re looking for.' },
                variant: 'default',
                size: 'medium',
              },
            },
          },
        ],
      },
    },
  ];
}

/**
 * Stream A2UI messages with simulated delays
 */
export async function streamTransactionFinderUI(
  onMessage: (message: A2UIMessage) => void,
  showEmptyState: boolean = false
): Promise<void> {
  // Helper to send message with delay
  const sendWithDelay = async (messages: A2UIMessage[], delay: number) => {
    await new Promise((resolve) => setTimeout(resolve, delay));
    messages.forEach(onMessage);
  };

  // Phase 1: Initial structure (skeleton)
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

  // Phase 5: Begin rendering
  await sendWithDelay(
    [
      {
        beginRendering: {
          surfaceId: 'main',
          root: 'root',
          catalogId: 'common-origin.design-system:v2.0',
        },
      },
    ],
    200
  );
}

/**
 * Get all messages at once (for non-streaming scenarios)
 */
export function getTransactionFinderUIMessages(showEmptyState: boolean = false): A2UIMessage[] {
  const messages: A2UIMessage[] = [
    ...generateInitialUIMessages(),
    ...generateSearchSectionMessages(),
    ...generateFilterSectionMessages(),
  ];

  if (showEmptyState) {
    messages.push(...generateEmptyStateMessages());
  } else {
    messages.push(...generateResultsSectionMessages());
  }

  messages.push({
    beginRendering: {
      surfaceId: 'main',
      root: 'root',
      catalogId: 'common-origin.design-system:v2.0',
    },
  });

  return messages;
}
