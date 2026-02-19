/**
 * Fund Transfer Mock Agent — v0.9
 *
 * Generates A2UI v0.9 messages for a fund transfer UI flow:
 * - Account selection (from/to)
 * - Amount input with validation
 * - Optional memo field
 * - Review and confirmation
 */

import type { A2UIMessage } from '../a2ui/types';
import { CATALOG_ID } from '../a2ui/constants';

/**
 * Mock account data - Australian bank accounts
 * Consistent with Sarah Chen's accounts
 */
const ACCOUNTS = [
  { value: 'transaction', label: 'Everyday Account (••••7890) - $3,247.85' },
  { value: 'savings', label: 'Goal Saver (••••4567) - $12,450.00' },
  { value: 'offset', label: 'Offset Account (••••1847) - $25,000.00' },
];

/**
 * Generate fund transfer form UI messages (v0.9)
 */
export function getFundTransferMessages(): A2UIMessage[] {
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
            children: ['header', 'form-container', 'actions'],
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
            component: 'Stack',
            direction: 'column',
            gap: 'sm',
            children: ['title', 'subtitle'],
          },
          {
            id: 'title',
            component: 'Text',
            text: 'Transfer money',
            variant: 'h1',
          },
          {
            id: 'subtitle',
            component: 'Text',
            text: 'Move funds between your accounts',
            variant: 'body',
          },
        ],
      },
    },

    // Form fields
    {
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'form-container',
            component: 'Stack',
            direction: 'column',
            gap: 'md',
            children: ['from-account', 'to-account', 'amount-field', 'memo-field', 'instant-checkbox'],
          },
        ],
      },
    },

    // From account selector
    {
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'from-account',
            component: 'Select',
            label: 'From Account',
            options: ACCOUNTS,
            placeholder: 'Select source account',
            required: true,
            onChange: { eventType: 'change', dataPath: 'fromAccount' },
          },
        ],
      },
    },

    // To account selector
    {
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'to-account',
            component: 'Select',
            label: 'To Account',
            options: ACCOUNTS,
            placeholder: 'Select destination account',
            required: true,
            onChange: { eventType: 'change', dataPath: 'toAccount' },
          },
        ],
      },
    },

    // Amount field
    {
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'amount-field',
            component: 'NumberField',
            label: 'Amount',
            helperText: 'Enter the amount to transfer',
            min: 0.01,
            max: 10000,
            step: 0.01,
            required: true,
            onChange: { eventType: 'change', dataPath: 'amount' },
          },
        ],
      },
    },

    // Memo field
    {
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'memo-field',
            component: 'TextField',
            label: 'Memo (Optional)',
            helperText: 'Add a note about this transfer',
            type: 'text',
            onChange: { eventType: 'change', dataPath: 'memo' },
          },
        ],
      },
    },

    // Instant transfer checkbox
    {
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'instant-checkbox',
            component: 'Checkbox',
            label: 'Instant transfer (additional fee may apply)',
            checked: false,
            onChange: { eventType: 'change', dataPath: 'instant' },
          },
        ],
      },
    },

    // Action buttons
    {
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'actions',
            component: 'Stack',
            direction: 'row',
            gap: 'md',
            children: ['cancel-btn', 'submit-btn'],
          },
          {
            id: 'cancel-btn',
            component: 'Button',
            label: 'Cancel',
            variant: 'secondary',
            size: 'medium',
            action: { name: 'cancel', context: [] },
          },
          {
            id: 'submit-btn',
            component: 'Button',
            label: 'Review Transfer',
            variant: 'primary',
            size: 'medium',
            action: {
              name: 'review_transfer',
              context: [
                { key: 'fromAccount', value: { path: '/fromAccount' } },
                { key: 'toAccount', value: { path: '/toAccount' } },
                { key: 'amount', value: { path: '/amount' } },
                { key: 'memo', value: { path: '/memo' } },
                { key: 'instant', value: { path: '/instant' } },
              ],
            },
          },
        ],
      },
    },

    // Info alert + update root to include it
    {
      updateComponents: {
        surfaceId: 'main',
        components: [
          {
            id: 'info-alert',
            component: 'Alert',
            content: 'Transfers between your accounts are processed immediately and are free of charge. Instant transfers may incur a small fee.',
            variant: 'info',
            title: 'Transfer information',
          },
          {
            id: 'root',
            component: 'Stack',
            direction: 'column',
            gap: 'lg',
            children: ['header', 'info-alert', 'form-container', 'actions'],
          },
        ],
      },
    },
  ];
}

/**
 * Stream fund transfer UI with delays
 */
export async function streamFundTransferUI(
  onMessage: (message: A2UIMessage) => void,
): Promise<void> {
  const messages = getFundTransferMessages();

  for (const message of messages) {
    onMessage(message);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
