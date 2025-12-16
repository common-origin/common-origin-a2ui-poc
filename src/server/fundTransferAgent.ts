/**
 * Fund Transfer Mock Agent
 * 
 * Generates A2UI messages for a fund transfer UI flow:
 * - Account selection (from/to)
 * - Amount input with validation
 * - Optional memo field
 * - Review and confirmation
 */

import type { A2UIMessage } from '../a2ui/types';

/**
 * Mock account data
 */
const ACCOUNTS = [
  { value: 'checking', label: 'Checking Account (•••• 4532) - $5,280.42' },
  { value: 'savings', label: 'Savings Account (•••• 8291) - $12,450.00' },
  { value: 'money-market', label: 'Money Market (•••• 1847) - $25,000.00' },
];

/**
 * Generate fund transfer form UI messages
 */
export function getFundTransferMessages(): A2UIMessage[] {
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
            children: ['header', 'form-container', 'actions'],
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
              Stack: {
                direction: 'column',
                gap: 'sm',
              },
            },
            children: ['title', 'subtitle'],
          },
          {
            id: 'title',
            component: {
              Text: {
                text: { literalString: 'Transfer Money' },
                variant: 'h1',
              },
            },
          },
          {
            id: 'subtitle',
            component: {
              Text: {
                text: { literalString: 'Move funds between your accounts' },
                variant: 'body',
              },
            },
          },
        ],
      },
    },

    // Form fields
    {
      surfaceUpdate: {
        surfaceId: 'main',
        components: [
          {
            id: 'form-container',
            component: {
              Stack: {
                direction: 'column',
                gap: 'md',
              },
            },
            children: ['from-account', 'to-account', 'amount-field', 'memo-field', 'instant-checkbox'],
          },
        ],
      },
    },

    // From account selector
    {
      surfaceUpdate: {
        surfaceId: 'main',
        components: [
          {
            id: 'from-account',
            component: {
              Select: {
                label: { literalString: 'From Account' },
                options: ACCOUNTS,
                placeholder: 'Select source account',
                required: true,
                onChange: {
                  eventType: 'change',
                  dataPath: 'fromAccount',
                },
              },
            },
          },
        ],
      },
    },

    // To account selector
    {
      surfaceUpdate: {
        surfaceId: 'main',
        components: [
          {
            id: 'to-account',
            component: {
              Select: {
                label: { literalString: 'To Account' },
                options: ACCOUNTS,
                placeholder: 'Select destination account',
                required: true,
                onChange: {
                  eventType: 'change',
                  dataPath: 'toAccount',
                },
              },
            },
          },
        ],
      },
    },

    // Amount field
    {
      surfaceUpdate: {
        surfaceId: 'main',
        components: [
          {
            id: 'amount-field',
            component: {
              NumberField: {
                label: { literalString: 'Amount' },
                helperText: { literalString: 'Enter the amount to transfer' },
                min: 0.01,
                max: 10000,
                step: 0.01,
                required: true,
                onChange: {
                  eventType: 'change',
                  dataPath: 'amount',
                },
              },
            },
          },
        ],
      },
    },

    // Memo field
    {
      surfaceUpdate: {
        surfaceId: 'main',
        components: [
          {
            id: 'memo-field',
            component: {
              TextField: {
                label: { literalString: 'Memo (Optional)' },
                helperText: { literalString: 'Add a note about this transfer' },
                type: 'text',
                onChange: {
                  eventType: 'change',
                  dataPath: 'memo',
                },
              },
            },
          },
        ],
      },
    },

    // Instant transfer checkbox
    {
      surfaceUpdate: {
        surfaceId: 'main',
        components: [
          {
            id: 'instant-checkbox',
            component: {
              Checkbox: {
                label: { literalString: 'Instant transfer (additional fee may apply)' },
                checked: false,
                onChange: {
                  eventType: 'change',
                  dataPath: 'instant',
                },
              },
            },
          },
        ],
      },
    },

    // Action buttons
    {
      surfaceUpdate: {
        surfaceId: 'main',
        components: [
          {
            id: 'actions',
            component: {
              Stack: {
                direction: 'row',
                gap: 'md',
              },
            },
            children: ['cancel-btn', 'submit-btn'],
          },
          {
            id: 'cancel-btn',
            component: {
              Button: {
                label: { literalString: 'Cancel' },
                variant: 'secondary',
                size: 'medium',
              },
            },
          },
          {
            id: 'submit-btn',
            component: {
              Button: {
                label: { literalString: 'Review Transfer' },
                variant: 'primary',
                size: 'medium',
                action: {
                  eventType: 'click',
                },
              },
            },
          },
        ],
      },
    },

    // Info alert
    {
      surfaceUpdate: {
        surfaceId: 'main',
        components: [
          {
            id: 'info-alert',
            component: {
              Alert: {
                content: { literalString: 'Transfers between your accounts are processed immediately and are free of charge. Instant transfers may incur a small fee.' },
                variant: 'info',
                title: { literalString: 'Transfer Information' },
              },
            },
          },
        ],
      },
    },

    // Add alert to root
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
            children: ['header', 'info-alert', 'form-container', 'actions'],
          },
        ],
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
 * Stream fund transfer UI with delays
 */
export async function streamFundTransferUI(
  onMessage: (message: A2UIMessage) => void
): Promise<void> {
  const messages = getFundTransferMessages();

  for (const message of messages) {
    onMessage(message);
    // Simulate streaming delay
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}
