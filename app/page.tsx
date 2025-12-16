'use client';

/**
 * Main Demo Page
 * 
 * Demonstrates A2UI integration with Common Origin design system:
 * - Generate UI button triggers mock agent
 * - A2UISurface renders agent-generated UI
 * - All components come from trusted catalog
 */

import { useState } from 'react';
import { A2UISurface, useA2UISurface } from '@/src/components/A2UISurface';
import { A2UIErrorBoundary } from '@/src/components/A2UIErrorBoundary';
import { streamTransactionFinderUI } from '@/src/server/mockAgent';
import { streamSpendingSummaryUI } from '@/src/server/spendingSummaryAgent';
import { streamFundTransferUI } from '@/src/server/fundTransferAgent';
import { analyzeQuery, getUnknownQueryResponse } from '@/src/server/queryRouter';
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(to bottom, #f8f9fa, #e9ecef);
  animation: fadeIn 0.5s ease;
  
  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const Header = styled.header`
  max-width: 1200px;
  margin: 0 auto 2rem;
  text-align: center;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #212529;
  
  @media (max-width: 768px) {
    font-size: 1.75rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1.125rem;
  color: #6c757d;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
  }
`;

const ControlPanel = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 0.5rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.variant === 'primary' ? `
    background: #0d6efd;
    color: white;
    
    &:hover:not(:disabled) {
      background: #0b5ed7;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
    }
    
    &:focus-visible {
      outline: 3px solid #0d6efd;
      outline-offset: 2px;
    }
  ` : `
    background: white;
    color: #212529;
    border: 2px solid #dee2e6;
    
    &:hover:not(:disabled) {
      background: #f8f9fa;
      border-color: #adb5bd;
    }
    
    &:focus-visible {
      outline: 3px solid #0d6efd;
      outline-offset: 2px;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &:active:not(:disabled) {
    transform: translateY(0);
  }
`;

const SurfaceContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  min-height: 400px;
  transition: box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    padding: 1rem;
    border-radius: 0.75rem;
    min-height: 300px;
  }
`;

const InfoBanner = styled.div`
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 1rem;
  background: #e7f3ff;
  border: 1px solid #b3d9ff;
  border-radius: 0.5rem;
  color: #004085;
  
  strong {
    font-weight: 600;
  }
  
  code {
    background: rgba(0, 0, 0, 0.05);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-family: 'Monaco', 'Menlo', monospace;
    font-size: 0.875em;
  }
`;

const StatusIndicator = styled.div<{ $isGenerating: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: ${props => props.$isGenerating ? '#fff3cd' : '#d1e7dd'};
  color: ${props => props.$isGenerating ? '#856404' : '#0f5132'};
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1rem;
  transition: all 0.3s ease;
  animation: slideDown 0.3s ease;
  
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.$isGenerating ? '#ffc107' : '#198754'};
    animation: ${props => props.$isGenerating ? 'pulse 1.5s ease-in-out infinite' : 'none'};
  }
  
  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const QueryInputContainer = styled.div`
  max-width: 800px;
  margin: 0 auto 2rem;
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
  }
`;

const QueryInput = styled.input`
  flex: 1;
  padding: 0.875rem 1rem;
  font-size: 1rem;
  border: 2px solid #dee2e6;
  border-radius: 0.5rem;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #0d6efd;
    box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
  }

  &:disabled {
    background: #f8f9fa;
    cursor: not-allowed;
  }

  &::placeholder {
    color: #adb5bd;
  }
`;

const ExampleChips = styled.div`
  max-width: 800px;
  margin: 0 auto 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  justify-content: center;
  
  @media (max-width: 768px) {
    gap: 0.375rem;
  }
`;

const ExampleChip = styled.button`
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  background: white;
  color: #495057;
  border: 1px solid #dee2e6;
  border-radius: 1rem;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f8f9fa;
    border-color: #0d6efd;
    color: #0d6efd;
  }
  
  &:focus-visible {
    outline: 2px solid #0d6efd;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  @media (max-width: 768px) {
    padding: 0.25rem 0.625rem;
    font-size: 0.8125rem;
  }
`;

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [query, setQuery] = useState('');
  const { sendMessage } = useA2UISurface('main');

  const handleSubmit = async (userQuery?: string) => {
    const queryToProcess = userQuery || query;
    if (!queryToProcess.trim() || isGenerating) return;

    setIsGenerating(true);
    setHasGenerated(false);
    setQuery('');

    // Reset surface first
    sendMessage({
      deleteSurface: {
        surfaceId: 'main',
      },
    });

    // Analyze query and route to appropriate scenario
    const analysis = analyzeQuery(queryToProcess);
    console.log('[Query Router] Analysis:', analysis);

    try {
      if (analysis.scenario === 'transaction-search') {
        const showEmpty = queryToProcess.toLowerCase().includes('empty');
        await streamTransactionFinderUI(
          (message) => sendMessage(message),
          showEmpty
        );
      } else if (analysis.scenario === 'spending-summary') {
        await streamSpendingSummaryUI(
          (message) => sendMessage(message)
        );
      } else if (analysis.scenario === 'fund-transfer') {
        await streamFundTransferUI(
          (message) => sendMessage(message)
        );
      } else {
        // Unknown query - show help message
        const helpText = getUnknownQueryResponse();
        sendMessage({
          surfaceUpdate: {
            surfaceId: 'main',
            components: [
              {
                id: 'help-alert',
                component: {
                  Alert: {
                    content: { literalString: helpText },
                    variant: 'info',
                    title: { literalString: 'How can I help?' },
                  },
                },
              },
            ],
          },
        });
        sendMessage({
          beginRendering: {
            surfaceId: 'main',
            root: 'help-alert',
            catalogId: 'common-origin.design-system:v2.0',
          },
        });
      }
    } catch (error) {
      console.error('[Demo] Error generating UI:', error);
    }

    setIsGenerating(false);
    setHasGenerated(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isGenerating) {
      handleSubmit();
    }
  };

  const handleExampleClick = (example: string) => {
    setQuery(example);
    handleSubmit(example);
  };

  return (
    <PageContainer>
      <Header role="banner">
        <Title>A2UI + Common Origin Demo</Title>
        <Subtitle>
          Agent-generated UI rendered through a trusted component catalog
        </Subtitle>
      </Header>

      <InfoBanner>
        <strong>🔒 Security Model:</strong> The agent sends only declarative JSON (A2UI messages), 
        not executable code. All UI components are rendered from a pre-approved catalog mapped to{' '}
        <code>@common-origin/design-system</code>. This prevents UI injection attacks and ensures
        consistent design.
      </InfoBanner>

      <ExampleChips role="group" aria-label="Example queries">
        <ExampleChip
          onClick={() => handleExampleClick('Find my Starbucks transactions')}
          disabled={isGenerating}
          aria-label="Find my Starbucks transactions"
        >
          🔍 Find transactions
        </ExampleChip>
        <ExampleChip
          onClick={() => handleExampleClick('Show spending summary')}
          disabled={isGenerating}
          aria-label="Show spending summary"
        >
          📊 Spending summary
        </ExampleChip>
        <ExampleChip
          onClick={() => handleExampleClick('Transfer $100 to savings')}
          disabled={isGenerating}
          aria-label="Transfer $100 to savings"
        >
          💸 Transfer money
        </ExampleChip>
      </ExampleChips>

      <QueryInputContainer role="search" aria-label="Banking query search">
        <QueryInput
          type="text"
          placeholder="Ask me about transactions, spending, or transfers..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isGenerating}
          aria-label="Banking query input"
          aria-describedby="query-help"
        />
        <Button
          variant="primary"
          onClick={() => handleSubmit()}
          disabled={isGenerating || !query.trim()}
          aria-label={isGenerating ? 'Generating UI' : 'Submit query'}
        >
          {isGenerating ? 'Generating...' : 'Submit'}
        </Button>
      </QueryInputContainer>

      <SurfaceContainer role="main" aria-label="Generated UI content">
        {(isGenerating || hasGenerated) && (
          <StatusIndicator 
            $isGenerating={isGenerating}
            role="status"
            aria-live="polite"
            aria-atomic="true"
          >
            {isGenerating ? 'Agent streaming UI updates...' : 'UI generation complete'}
          </StatusIndicator>
        )}
        <A2UIErrorBoundary>
          <A2UISurface surfaceId="main" />
        </A2UIErrorBoundary>
      </SurfaceContainer>
    </PageContainer>
  );
}
