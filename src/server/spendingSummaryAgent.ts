/**
 * Spending Summary Mock Agent
 * 
 * Generates A2UI messages for a spending summary UI showing:
 * - Total spending for a period
 * - Category breakdown with amounts
 * - Visual representation (cards/list)
 * - Comparison indicators
 */

import type { A2UIMessage } from '../a2ui/types';

/**
 * Spending data by category
 */
const SPENDING_DATA = [
  {
    category: 'Groceries',
    amount: 487.23,
    percentage: 28,
    trend: 'up',
    transactions: 12,
  },
  {
    category: 'Transportation',
    amount: 342.50,
    percentage: 20,
    trend: 'down',
    transactions: 8,
  },
  {
    category: 'Entertainment',
    amount: 215.99,
    percentage: 12,
    trend: 'up',
    transactions: 6,
  },
  {
    category: 'Food & Drink',
    amount: 389.45,
    percentage: 23,
    trend: 'up',
    transactions: 15,
  },
  {
    category: 'Shopping',
    amount: 298.67,
    percentage: 17,
    trend: 'same',
    transactions: 5,
  },
];

const TOTAL_SPENDING = SPENDING_DATA.reduce((sum, cat) => sum + cat.amount, 0);

/**
 * Generate spending summary UI messages
 */
export function getSpendingSummaryMessages(): A2UIMessage[] {
  return [
    // Root container
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
            children: ['header', 'total-card', 'category-list'],
          },
        ],
      },
    },

    // Header
    {
      surfaceUpdate: {
        surfaceId: 'main',
        components: [
          {
            id: 'header',
            component: {
              Text: {
                text: { literalString: 'Spending summary' },
                variant: 'h1',
              },
            },
          },
        ],
      },
    },

    // Total spending card - use MoneyDisplay instead of formatted string
    {
      surfaceUpdate: {
        surfaceId: 'main',
        components: [
          {
            id: 'total-card',
            component: {
              Stack: {
                direction: 'column',
                gap: 'sm',
              },
            },
            children: ['total-label', 'total-amount', 'total-period'],
          },
          {
            id: 'total-label',
            component: {
              Text: {
                text: { literalString: 'Total spending' },
                variant: 'caption',
              },
            },
          },
          {
            id: 'total-amount',
            component: {
              MoneyDisplay: {
                amount: -TOTAL_SPENDING,
                currency: 'USD',
                variant: 'negative',
                size: 'xlarge',
                weight: 'bold',
              },
            },
          },
          {
            id: 'total-period',
            component: {
              Text: {
                text: { literalString: 'Last 30 days • 46 transactions' },
                variant: 'body',
              },
            },
          },
        ],
      },
    },

    // Category breakdown list
    {
      surfaceUpdate: {
        surfaceId: 'main',
        components: [
          {
            id: 'category-list',
            component: {
              Stack: {
                direction: 'column',
                gap: 'md',
              },
            },
            children: ['category-header', ...SPENDING_DATA.map((_, i) => `category-${i}`)],
          },
          {
            id: 'category-header',
            component: {
              Text: {
                text: { literalString: 'By category' },
                variant: 'h2',
              },
            },
          },
        ],
      },
    },

    // Category breakdown cards - use MoneyDisplay and Progress
    {
      surfaceUpdate: {
        surfaceId: 'main',
        components: SPENDING_DATA.flatMap((cat, index) => [
          {
            id: `category-${index}`,
            component: {
              Stack: {
                direction: 'column',
                gap: 'sm',
              },
            },
            children: [
              `cat-${index}-header`,
              `cat-${index}-amount`,
              `cat-${index}-progress`,
              `cat-${index}-details`,
            ],
          },
          {
            id: `cat-${index}-header`,
            component: {
              Text: {
                text: { literalString: cat.category },
                variant: 'h3',
              },
            },
          },
          {
            id: `cat-${index}-amount`,
            component: {
              MoneyDisplay: {
                amount: -cat.amount,
                currency: 'USD',
                variant: 'negative',
                size: 'medium',
                weight: 'bold',
              },
            },
          },
          {
            id: `cat-${index}-progress`,
            component: {
              Progress: {
                value: cat.percentage,
                variant: 'linear',
                size: 'medium',
                label: { literalString: `${cat.percentage}% of total spending` },
              },
            },
          },
          {
            id: `cat-${index}-details`,
            component: {
              Text: {
                text: {
                  literalString: `${cat.transactions} transactions • ${
                    cat.trend === 'up' ? '↑ Higher' : cat.trend === 'down' ? '↓ Lower' : '→ Same'
                  } than last month`,
                },
                variant: 'caption',
              },
            },
          },
        ]),
      },
    },

    // Begin rendering
    {
      beginRendering: {
        surfaceId: 'main',
        root: 'root',
        catalogId: 'common-origin.design-system:v2.0',
      },
    },
  ];
}

/**
 * Stream spending summary UI with delays
 */
export async function streamSpendingSummaryUI(
  onMessage: (message: A2UIMessage) => void
): Promise<void> {
  const messages = getSpendingSummaryMessages();

  for (const message of messages) {
    onMessage(message);
    // Simulate streaming delay
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
}
