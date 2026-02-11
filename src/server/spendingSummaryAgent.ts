/**
 * Spending Summary Mock Agent — v0.9
 *
 * Generates A2UI v0.9 messages for a spending summary UI showing:
 * - Total spending for a period
 * - Category breakdown with amounts
 * - Visual representation (cards/list)
 * - Comparison indicators
 */

import type { A2UIMessage } from '../a2ui/types';
import { CATALOG_ID } from '../a2ui/constants';

/**
 * Spending data by category - Australian context
 */
const SPENDING_DATA = [
  { category: 'Groceries', amount: 487.23, percentage: 28, trend: 'up', transactions: 12 },
  { category: 'Transport', amount: 342.50, percentage: 20, trend: 'down', transactions: 8 },
  { category: 'Entertainment', amount: 215.99, percentage: 12, trend: 'up', transactions: 6 },
  { category: 'Dining', amount: 389.45, percentage: 23, trend: 'up', transactions: 15 },
  { category: 'Shopping', amount: 298.67, percentage: 17, trend: 'same', transactions: 5 },
];

const TOTAL_SPENDING = SPENDING_DATA.reduce((sum, cat) => sum + cat.amount, 0);

/**
 * Generate spending summary UI messages (v0.9)
 */
export function getSpendingSummaryMessages(): A2UIMessage[] {
  return [
    // createSurface must be first
    {
      createSurface: {
        surfaceId: 'main',
        catalogId: CATALOG_ID,
      },
    },

    // Root container
    {
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'root',
            component: 'Stack',
            direction: 'column',
            gap: 'lg',
            children: ['header', 'total-card', 'category-list'],
          },
        ],
      },
    },

    // Header
    {
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'header',
            component: 'Text',
            text: 'Spending summary',
            variant: 'h1',
          },
        ],
      },
    },

    // Total spending card
    {
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'total-card',
            component: 'Stack',
            direction: 'column',
            gap: 'sm',
            children: ['total-label', 'total-amount', 'total-period'],
          },
          {
            id: 'total-label',
            component: 'Text',
            text: 'Total spending',
            variant: 'caption',
          },
          {
            id: 'total-amount',
            component: 'MoneyDisplay',
            amount: -TOTAL_SPENDING,
            currency: 'AUD',
            variant: 'negative',
            size: 'xlarge',
            weight: 'bold',
          },
          {
            id: 'total-period',
            component: 'Text',
            text: 'Last 30 days \u2022 46 transactions',
            variant: 'body',
          },
        ],
      },
    },

    // Category breakdown list
    {
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'category-list',
            component: 'Stack',
            direction: 'column',
            gap: 'md',
            children: ['category-header', ...SPENDING_DATA.map((_, i) => `category-${i}`)],
          },
          {
            id: 'category-header',
            component: 'Text',
            text: 'By category',
            variant: 'h2',
          },
        ],
      },
    },

    // Category breakdown cards
    {
      updateComponents: {
        surfaceId: 'main',
        components: SPENDING_DATA.flatMap((cat, index) => [
          {
            id: `category-${index}`,
            component: 'Stack' as const,
            direction: 'column',
            gap: 'sm',
            children: [
              `cat-${index}-header`,
              `cat-${index}-amount`,
              `cat-${index}-progress`,
              `cat-${index}-details`,
            ],
          },
          {
            id: `cat-${index}-header`,
            component: 'Text' as const,
            text: cat.category,
            variant: 'h3',
          },
          {
            id: `cat-${index}-amount`,
            component: 'MoneyDisplay' as const,
            amount: -cat.amount,
            currency: 'AUD',
            variant: 'negative',
            size: 'medium',
            weight: 'bold',
          },
          {
            id: `cat-${index}-progress`,
            component: 'Progress' as const,
            value: cat.percentage,
            variant: 'linear',
            size: 'medium',
            label: `${cat.percentage}% of total spending`,
          },
          {
            id: `cat-${index}-details`,
            component: 'Text' as const,
            text: `${cat.transactions} transactions \u2022 ${
              cat.trend === 'up' ? '\u2191 Higher' : cat.trend === 'down' ? '\u2193 Lower' : '\u2192 Same'
            } than last month`,
            variant: 'caption',
          },
        ]),
      },
    },
  ];
}

/**
 * Stream spending summary UI with delays
 */
export async function streamSpendingSummaryUI(
  onMessage: (message: A2UIMessage) => void,
): Promise<void> {
  const messages = getSpendingSummaryMessages();

  for (const message of messages) {
    onMessage(message);
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
}
