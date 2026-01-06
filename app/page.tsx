'use client';

/**
 * Main Demo Page
 * 
 * Demonstrates A2UI integration with Common Origin design system:
 * - Generate UI button triggers mock agent
 * - A2UISurface renders agent-generated UI
 * - All components come from trusted catalog
 */

import { useState, useEffect } from 'react';
import { A2UISurface, useA2UISurface } from '@/src/components/A2UISurface';
import { A2UIErrorBoundary } from '@/src/components/A2UIErrorBoundary';
import { callAgent, getAgentMode, isRealAgentAvailable } from '@/src/lib/agentClient';
import { analyzeQuery, getUnknownQueryResponse } from '@/src/server/queryRouter';
import styled from 'styled-components';
import {
  Button,
  Typography,
  Stack,
  Box,
  Chip,
  Alert,
  TextField,
} from '@common-origin/design-system';

// Custom wrapper for page-level styling and animation
const PageWrapper = styled.div`
  min-height: 100vh;
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
`;

// Custom status indicator with animation
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

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [agentMode, setAgentMode] = useState<'mock' | 'real'>(getAgentMode());
  const [realAgentAvailable, setRealAgentAvailable] = useState(false);
  const { sendMessage } = useA2UISurface('main');

  // Check if real agent is available on mount
  useEffect(() => {
    isRealAgentAvailable().then(setRealAgentAvailable);
  }, []);

  const handleSubmit = async (userQuery?: string) => {
    const queryToProcess = userQuery || query;
    if (!queryToProcess.trim() || isGenerating) return;

    setIsGenerating(true);
    setHasGenerated(false);
    setError(null);
    setQuery('');

    // Reset surface first
    sendMessage({
      deleteSurface: {
        surfaceId: 'main',
      },
    });

    // Analyze query and get scenario hint
    const analysis = analyzeQuery(queryToProcess);
    console.log('[Query Router] Analysis:', analysis);

    // Map scenario to agent hint
    let scenarioHint: string | undefined;
    if (analysis.scenario === 'transaction-search') {
      scenarioHint = 'transaction-finder';
    } else if (analysis.scenario === 'spending-summary') {
      scenarioHint = 'spending-summary';
    } else if (analysis.scenario === 'fund-transfer') {
      scenarioHint = 'fund-transfer';
    }

    try {
      // Call unified agent interface
      await callAgent(
        queryToProcess,
        (message) => {
          console.log('[Demo] Received message from agent:', Object.keys(message)[0]);
          console.log('[Demo] Full message:', message);
          sendMessage(message);
        },
        scenarioHint,
        {
          forceMode: agentMode,
          onError: (err) => {
            console.error('[Demo] Agent error:', err);
            setError(err.message);
          },
          retryOnError: true, // Fallback to mock if real agent fails
        }
      );
    } catch (error) {
      console.error('[Demo] Error generating UI:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate UI');
      
      // Show error message in UI
      sendMessage({
        surfaceUpdate: {
          surfaceId: 'main',
          components: [
            {
              id: 'error-alert',
              component: {
                Alert: {
                  content: { 
                    literalString: error instanceof Error 
                      ? error.message 
                      : 'Failed to generate UI. Please try again.' 
                  },
                  variant: 'error',
                  title: { literalString: 'Error' },
                },
              },
            },
          ],
        },
      });
      sendMessage({
        beginRendering: {
          surfaceId: 'main',
          root: 'error-alert',
          catalogId: 'common-origin.design-system:v2.3',
        },
      });
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
    <PageWrapper>
      <Box style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem 1rem' }}>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <Typography variant="h1">
              A2UI + Common Origin Demo
            </Typography>
          </div>
          <div style={{ color: '#6c757d', fontSize: '1.125rem' }}>
            <Typography variant="body">
              Agent-generated UI rendered through a trusted component catalog
            </Typography>
          </div>
        </header>

        {/* Agent Mode Toggle */}
        {realAgentAvailable && (
          <Box style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: '#6c757d', fontWeight: 500 }}>
              Agent Mode:
            </span>
            <Stack direction="row" gap="xs">
              <Chip
                onClick={() => setAgentMode('mock')}
                variant={agentMode === 'mock' ? 'emphasis' : 'subtle'}
                aria-label="Use mock agent"
                aria-pressed={agentMode === 'mock'}
              >
                Mock
              </Chip>
              <Chip
                onClick={() => setAgentMode('real')}
                variant={agentMode === 'real' ? 'emphasis' : 'subtle'}
                aria-label="Use real Gemini agent"
                aria-pressed={agentMode === 'real'}
              >
                Real (Gemini)
              </Chip>
            </Stack>
          </Box>
        )}

        {/* Security Info Banner */}
        <Box style={{ marginBottom: '2rem' }}>
          <Alert variant="info" title="Security Model">
            The agent sends only declarative JSON (A2UI messages), not executable code. 
            All UI components are rendered from a pre-approved catalog mapped to{' '}
            <code>@common-origin/design-system</code>. This prevents UI injection attacks 
            and ensures consistent design.
          </Alert>
        </Box>

        {/* Error Display */}
        {error && !isGenerating && (
          <Box style={{ marginBottom: '1rem' }}>
            <Alert variant="error" title="Agent Error">
              {error}
              {' '}
              {agentMode === 'real' && (
                <span>The mock agent was used as fallback.</span>
              )}
            </Alert>
          </Box>
        )}

        {/* Example Query Chips */}
        <div style={{ marginBottom: '1rem' }}>
          <Stack 
            direction="row" 
            gap="sm" 
            justifyContent="center"
            wrap={true}
          >
            <Chip
              onClick={!isGenerating ? () => handleExampleClick('Find my Starbucks transactions') : undefined}
              aria-label="Find my Starbucks transactions"
              disabled={isGenerating}
            >
              Find transactions
            </Chip>
            <Chip
              onClick={!isGenerating ? () => handleExampleClick('Show spending summary') : undefined}
              aria-label="Show spending summary"
              disabled={isGenerating}
            >
              Spending summary
            </Chip>
            <Chip
              onClick={!isGenerating ? () => handleExampleClick('Transfer $100 to savings') : undefined}
              aria-label="Transfer $100 to savings"
              disabled={isGenerating}
            >
              Transfer money
            </Chip>
          </Stack>
        </div>

        {/* Query Input */}
        <div style={{ maxWidth: '800px', margin: '0 auto 2rem' }}>
          <Stack 
            direction="row" 
            gap="md" 
            alignItems="flex-end"
          >
            <div style={{ flex: 1 }}>
              <TextField
                type="text"
                placeholder="Ask me about transactions, spending, or transfers..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isGenerating}
                label="Banking query"
                aria-describedby="query-help"
              />
            </div>
            <Button
              variant="primary"
              onClick={() => handleSubmit()}
              disabled={isGenerating || !query.trim()}
              aria-label={isGenerating ? 'Generating UI' : 'Submit query'}
            >
              {isGenerating ? 'Generating...' : 'Submit'}
            </Button>
          </Stack>
        </div>

        {/* Surface Container */}
        <main 
          aria-label="Generated UI content"
          style={{
            maxWidth: '800px',
            margin: '0 auto',
            background: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            minHeight: '400px',
            transition: 'box-shadow 0.3s ease',
          }}
        >
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
        </main>
      </Box>
    </PageWrapper>
  );
}
