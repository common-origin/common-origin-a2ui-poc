/**
 * Skeleton Component for A2UI Catalog
 * 
 * Provides loading state placeholders while agent generates UI.
 * Used to improve perceived performance during UI generation.
 */

import React from 'react';

export interface SkeletonComponent {
  variant?: 'text' | 'rect' | 'circle' | 'card' | 'list';
  width?: string;
  height?: string;
  count?: number;
}

/**
 * Render a skeleton loading placeholder
 */
export function renderSkeleton(
  variant: 'text' | 'rect' | 'circle' | 'card' | 'list' = 'rect',
  width: string = '100%',
  height: string = '20px',
  count: number = 1,
  key?: string
): React.ReactElement {
  const skeletons = [];

  for (let i = 0; i < count; i++) {
    const itemKey = key ? `${key}-${i}` : `skeleton-${i}`;

    if (variant === 'text') {
      skeletons.push(
        React.createElement('div', {
          key: itemKey,
          style: {
            width: i === count - 1 ? '60%' : width,
            height: '16px',
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            marginBottom: '8px',
            animation: 'pulse 1.5s ease-in-out infinite',
          },
        })
      );
    } else if (variant === 'circle') {
      skeletons.push(
        React.createElement('div', {
          key: itemKey,
          style: {
            width: width,
            height: width,
            backgroundColor: '#e0e0e0',
            borderRadius: '50%',
            animation: 'pulse 1.5s ease-in-out infinite',
          },
        })
      );
    } else if (variant === 'card') {
      skeletons.push(
        React.createElement(
          'div',
          {
            key: itemKey,
            style: {
              width: width,
              padding: '16px',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px',
              marginBottom: '12px',
            },
          },
          React.createElement('div', {
            style: {
              width: '40%',
              height: '20px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              marginBottom: '12px',
              animation: 'pulse 1.5s ease-in-out infinite',
            },
          }),
          React.createElement('div', {
            style: {
              width: '100%',
              height: '14px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              marginBottom: '8px',
              animation: 'pulse 1.5s ease-in-out infinite',
            },
          }),
          React.createElement('div', {
            style: {
              width: '80%',
              height: '14px',
              backgroundColor: '#e0e0e0',
              borderRadius: '4px',
              animation: 'pulse 1.5s ease-in-out infinite',
            },
          })
        )
      );
    } else if (variant === 'list') {
      skeletons.push(
        React.createElement(
          'div',
          {
            key: itemKey,
            style: {
              width: width,
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 0',
              borderBottom: '1px solid #f0f0f0',
            },
          },
          React.createElement('div', {
            style: {
              width: '40px',
              height: '40px',
              backgroundColor: '#e0e0e0',
              borderRadius: '50%',
              flexShrink: 0,
              animation: 'pulse 1.5s ease-in-out infinite',
            },
          }),
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement('div', {
              style: {
                width: '60%',
                height: '14px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                marginBottom: '8px',
                animation: 'pulse 1.5s ease-in-out infinite',
              },
            }),
            React.createElement('div', {
              style: {
                width: '40%',
                height: '12px',
                backgroundColor: '#e0e0e0',
                borderRadius: '4px',
                animation: 'pulse 1.5s ease-in-out infinite',
              },
            })
          )
        )
      );
    } else {
      // Default rect variant
      skeletons.push(
        React.createElement('div', {
          key: itemKey,
          style: {
            width: width,
            height: height,
            backgroundColor: '#e0e0e0',
            borderRadius: '4px',
            marginBottom: '8px',
            animation: 'pulse 1.5s ease-in-out infinite',
          },
        })
      );
    }
  }

  return React.createElement(
    'div',
    {
      key: key || 'skeleton-container',
      style: {
        width: '100%',
      },
    },
    React.createElement('style', {
      dangerouslySetInnerHTML: {
        __html: `
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.5;
            }
          }
        `,
      },
    }),
    ...skeletons
  );
}
