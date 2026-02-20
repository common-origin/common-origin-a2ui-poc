'use client';

/**
 * Main Demo Page
 * 
 * Demonstrates A2UI integration with Common Origin design system:
 * - Generate UI button triggers mock agent
 * - A2UISurface renders agent-generated UI
 * - All components come from trusted catalog
 */

import { useState, useEffect, useCallback } from 'react';
import { A2UISurface, useA2UISurface } from '@/src/components/A2UISurface';
import { A2UIErrorBoundary } from '@/src/components/A2UIErrorBoundary';
import { callAgent, getAgentMode, isRealAgentAvailable, type ConversationTurn } from '@/src/lib/agentClient';
import { analyzeQuery, getUnknownQueryResponse } from '@/src/server/queryRouter';
import { CATALOG_ID } from '@/src/a2ui/catalog';
import { createLogger } from '@/src/lib/logger';
import type { UserActionMessage } from '@/src/a2ui/types';
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
  background: linear-gradient(to bottom, var(--gradient-start), var(--gradient-end));
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

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;

  @media (max-width: 640px) {
    padding: 1rem 0.75rem;
  }
`;

const QueryRow = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  max-width: 800px;
  margin: 0 auto 2rem;

  & > div:first-child {
    flex: 1;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 1.5rem;
  }
`;

const SurfaceContainer = styled.main`
  max-width: 800px;
  margin: 0 auto;
  background: var(--surface);
  border-radius: 1rem;
  padding: 2rem;
  box-shadow: 0 4px 6px var(--shadow);
  border: 1px solid var(--border);
  min-height: 400px;
  transition: box-shadow 0.3s ease;

  @media (max-width: 640px) {
    padding: 1rem;
    border-radius: 0.75rem;
    min-height: 300px;
  }
`;

// Custom status indicator with animation
const StatusIndicator = styled.div<{ $isGenerating: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  background: ${props => props.$isGenerating ? 'var(--status-generating-bg)' : 'var(--status-done-bg)'};
  color: ${props => props.$isGenerating ? 'var(--status-generating-text)' : 'var(--status-done-text)'};
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
    background: ${props => props.$isGenerating ? 'var(--status-generating-dot)' : 'var(--status-done-dot)'};
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

const log = createLogger('Demo');

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [agentMode, setAgentMode] = useState<'mock' | 'real'>(getAgentMode());
  const [realAgentAvailable, setRealAgentAvailable] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
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
    log.info('Query analysis', { query: queryToProcess, scenario: analysis.scenario, intent: analysis.intent });

    // Map scenario to agent hint — must match ScenarioType values
    let scenarioHint: string | undefined;
    if (analysis.scenario === 'transaction-search') {
      scenarioHint = 'transaction-search';
    } else if (analysis.scenario === 'spending-summary') {
      scenarioHint = 'spending-summary';
    } else if (analysis.scenario === 'fund-transfer') {
      scenarioHint = 'fund-transfer';
    }

    // Record the user turn in conversation history
    const updatedHistory: ConversationTurn[] = [
      ...conversationHistory,
      { role: 'user', content: queryToProcess },
    ];

    try {
      // Call unified agent interface
      await callAgent(
        queryToProcess,
        (message) => {
          log.debug('Received message', { type: Object.keys(message)[0] });
          sendMessage(message);
        },
        scenarioHint,
        {
          forceMode: agentMode,
          onError: (err) => {
            log.error('Agent error', { message: err.message });
            setError(err.message);
          },
          retryOnError: true,
          history: conversationHistory,
        }
      );

      // Record the agent turn (summary of what was generated)
      setConversationHistory([
        ...updatedHistory,
        { role: 'agent', content: `Generated ${analysis.scenario} UI for: "${queryToProcess}"` },
      ]);
    } catch (error) {
      log.error('Error generating UI', { error: error instanceof Error ? error.message : String(error) });
      setError(error instanceof Error ? error.message : 'Failed to generate UI');
      
      // Show error message in UI (v0.9 format)
      sendMessage({
        createSurface: {
          surfaceId: 'main',
          catalogId: CATALOG_ID,
        },
      });
      sendMessage({
        updateComponents: {
          surfaceId: 'main',
          components: [
            {
              id: 'root',
              component: 'Alert',
              content: error instanceof Error
                ? error.message
                : 'Failed to generate UI. Please try again.',
              variant: 'error',
              title: 'Error',
            },
          ],
        },
      });
    }

    setIsGenerating(false);
    setHasGenerated(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isGenerating) {
      handleSubmit();
    }
  };

  /**
   * Handle UserAction from the A2UISurface (v0.9 spec action-to-agent feedback loop).
   *
   * When a user clicks a Button that has a spec-format action (name + context),
   * the catalog resolves the context paths from the data model and produces
   * a UserActionMessage. We convert that into a natural-language follow-up
   * prompt and send it back to the agent so it can generate the next UI.
   */
  const handleUserAction = useCallback(async (action: unknown) => {
    // Only handle v0.9 spec UserActionMessages
    const msg = action as UserActionMessage;
    if (!msg?.userAction?.name) return;

    const { name, context, surfaceId } = msg.userAction;
    log.info('UserAction received', { name, context });

    // Compose a natural-language follow-up prompt describing the user action
    const contextDescription = Object.entries(context)
      .filter(([, v]) => v !== undefined && v !== '')
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    const followUpQuery = `The user performed action "${name}"${contextDescription ? ` with the following details: ${contextDescription}` : ''}. Generate the appropriate next UI screen.`;

    // Send as a follow-up to the agent
    setIsGenerating(true);
    setError(null);

    // Reset surface for new content
    sendMessage({
      deleteSurface: {
        surfaceId: 'main',
      },
    });

    // Add the user action as a conversation turn
    const updatedHistory: ConversationTurn[] = [
      ...conversationHistory,
      { role: 'user', content: followUpQuery },
    ];

    try {
      await callAgent(
        followUpQuery,
        (message) => {
          log.debug('Action follow-up message', { type: Object.keys(message)[0] });
          sendMessage(message);
        },
        undefined, // Let the agent figure out the scenario from context
        {
          forceMode: agentMode,
          onError: (err) => {
            log.error('Action follow-up error', { message: err.message });
            setError(err.message);
          },
          retryOnError: true,
          history: conversationHistory,
        }
      );

      setConversationHistory([
        ...updatedHistory,
        { role: 'agent', content: `Handled action "${name}" — generated follow-up UI` },
      ]);
    } catch (error) {
      log.error('Action follow-up failed', { error: error instanceof Error ? error.message : String(error) });
      setError(error instanceof Error ? error.message : 'Failed to process action');

      sendMessage({
        createSurface: {
          surfaceId: 'main',
          catalogId: CATALOG_ID,
        },
      });
      sendMessage({
        updateComponents: {
          surfaceId: 'main',
          components: [
            {
              id: 'root',
              component: 'Alert',
              content: error instanceof Error ? error.message : 'Failed to process your action. Please try again.',
              variant: 'error',
              title: 'Error',
            },
          ],
        },
      });
    }

    setIsGenerating(false);
    setHasGenerated(true);
  }, [agentMode, conversationHistory, sendMessage]);

  const handleExampleClick = (example: string) => {
    setQuery(example);
    handleSubmit(example);
  };

  return (
    <PageWrapper>
      <PageContainer>
        {/* Header */}
        <header style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <Typography variant="h1">
              A2UI + Common Origin Demo
            </Typography>
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '1.125rem' }}>
            <Typography variant="body">
              Agent-generated UI rendered through a trusted component catalog
            </Typography>
          </div>
        </header>

        {/* Agent Mode Toggle */}
        {realAgentAvailable && (
          <Box style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center', gap: '1rem', alignItems: 'center' }} role="group" aria-labelledby="agent-mode-label">
            <span id="agent-mode-label" style={{ fontSize: '0.875rem', color: 'var(--muted)', fontWeight: 500 }}>
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
        <div style={{ marginBottom: '1rem' }} role="group" aria-label="Example queries">
          <Stack 
            direction="row" 
            gap="sm" 
            justifyContent="center"
            wrap={true}
          >
            <Chip
              onClick={!isGenerating ? () => handleExampleClick('Find my Woolworths transactions') : undefined}
              aria-label="Find my Woolworths transactions"
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
        <QueryRow>
          <div>
            <TextField
              type="text"
              placeholder="Ask me about transactions, spending, or transfers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isGenerating}
              label="Banking query"
              aria-describedby="query-help"
            />
            <span id="query-help" style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: '0.25rem', display: 'block' }}>
              Try asking about transactions, spending, or transfers
            </span>
          </div>
          <Button
            variant="primary"
            onClick={() => handleSubmit()}
            disabled={isGenerating || !query.trim()}
            aria-label={isGenerating ? 'Generating UI' : 'Submit query'}
          >
            {isGenerating ? 'Generating...' : 'Submit'}
          </Button>
        </QueryRow>

        {/* Surface Container */}
        <SurfaceContainer
          aria-label="Generated UI content"
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
            <A2UISurface surfaceId="main" onAction={handleUserAction} />
          </A2UIErrorBoundary>
        </SurfaceContainer>
      </PageContainer>
    </PageWrapper>
  );
}
