'use client';

/**
 * Main Demo Page
 * 
 * Demonstrates A2UI integration with Common Origin design system:
 * - Generate UI button triggers mock agent
 * - A2UISurface renders agent-generated UI
 * - All components come from trusted catalog
 */

import { useState, useCallback, type ComponentType } from 'react';
import { A2UISurface, useA2UISurface } from '@/src/components/A2UISurface';
import { A2UIErrorBoundary } from '@/src/components/A2UIErrorBoundary';
import { callAgent, getAgentMode, type ConversationTurn } from '@/src/lib/agentClient';
import { pipelineTimer } from '@/src/lib/latencyTracker';
import { analyzeQuery } from '@/src/server/queryRouter';
import { CATALOG_ID } from '@/src/a2ui/catalog';
import { createLogger } from '@/src/lib/logger';
import type { UserActionMessage } from '@/src/a2ui/types';
import styled from 'styled-components';
import * as CommonOriginDesignSystem from '@common-origin/design-system';
import {
  Box,
  Alert,
  Button,
} from '@common-origin/design-system';

type AgentInputSubmitPayload = { text: string };
type AgentInputVoiceErrorPayload = { message: string };

type AgentInputCompatProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (payload: AgentInputSubmitPayload) => void;
  placeholder?: string;
  disabled?: boolean;
  isSubmitting?: boolean;
  enableVoice?: boolean;
  voiceLanguage?: string;
  noSpeechTimeoutMs?: number;
  label?: string;
  statusMessage?: string;
  errorMessage?: string;
  onVoiceStart?: () => void;
  onVoiceError?: (error: AgentInputVoiceErrorPayload) => void;
};

const AgentInput = (CommonOriginDesignSystem as unknown as {
  AgentInput: ComponentType<AgentInputCompatProps>;
}).AgentInput;

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
  min-height: 100vh;

  @media (max-width: 640px) {
    padding: 1rem 0.75rem;
  }
`;

const InputStage = styled.div<{ $hasSubmitted: boolean }>`
  min-height: ${props => (props.$hasSubmitted ? '3rem' : '60vh')};
  display: flex;
  align-items: center;
  transition: min-height 0.4s ease-in-out;

  @media (max-width: 640px) {
    min-height: ${props => (props.$hasSubmitted ? '2rem' : '55vh')};
  }
`;

const QueryRow = styled.div<{ $hasSubmitted: boolean }>`
  display: flex;
  gap: 0.75rem;
  align-items: flex-end;
  max-width: 800px;
  margin: 0 auto ${props => (props.$hasSubmitted ? '2rem' : '0')};
  width: 100%;
  transition: margin 0.3s ease;

  & > div:first-child {
    flex: 1;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 1.5rem;
  }
`;

const TopRightControls = styled.div`
  position: fixed;
  top: 1rem;
  right: 1.25rem;
  z-index: 100;
`;

const SurfaceContainer = styled.main<{ $visible: boolean }>`
  max-width: 800px;
  margin: 0 auto;
  background: var(--surface);
  border-radius: 1rem;
  padding: ${props => (props.$visible ? '2rem' : '0')};
  box-shadow: ${props => (props.$visible ? '0 4px 6px var(--shadow)' : 'none')};
  border: ${props => (props.$visible ? '1px solid var(--border)' : '0')};
  min-height: ${props => (props.$visible ? '400px' : '0')};
  max-height: ${props => (props.$visible ? '1200px' : '0')};
  overflow: hidden;
  pointer-events: ${props => (props.$visible ? 'auto' : 'none')};
  opacity: ${props => (props.$visible ? 1 : 0)};
  transform: ${props => (props.$visible ? 'translateY(0)' : 'translateY(8px)')};
  transition: opacity 0.35s ease, transform 0.35s ease, max-height 0.35s ease, padding 0.35s ease, box-shadow 0.3s ease;

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
  transition: background 0.3s ease, color 0.3s ease;
  
  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${props => props.$isGenerating ? 'var(--status-generating-dot)' : 'var(--status-done-dot)'};
    animation: ${props => props.$isGenerating ? 'pulse 1.5s ease-in-out infinite' : 'none'};
    transition: background 0.3s ease;
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
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [query, setQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [agentMode] = useState<'mock' | 'real'>(getAgentMode());
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const { sendMessage } = useA2UISurface('main');

  const handleSubmit = async (userQuery?: string) => {
    const queryToProcess = userQuery || query;
    if (!queryToProcess.trim() || isGenerating) return;

    pipelineTimer.reset();
    pipelineTimer.mark('submit');
    setHasSubmitted(true);
    setIsGenerating(true);
    setHasGenerated(false);
    setError(null);
    setSpeechError(null);
    setQuery('');
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
    pipelineTimer.logReport('A2UI pipeline');
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

    const { name, context } = msg.userAction;
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

  return (
    <PageWrapper>
      {/* Future: browsing-token personalisation hook point — see STRATEGY.md */}
      <TopRightControls>
        <Button variant="naked" size="small" onClick={() => {}} aria-label="Preferences (coming soon)">
          Preferences
        </Button>
      </TopRightControls>
      <PageContainer>
        {/* Query Input */}
        <InputStage $hasSubmitted={hasSubmitted}>
          <QueryRow $hasSubmitted={hasSubmitted}>
            <div>
              <AgentInput
                value={query}
                onChange={setQuery}
                onSubmit={(payload: AgentInputSubmitPayload) => handleSubmit(payload.text)}
                placeholder="Ask a banking question"
                disabled={isGenerating}
                isSubmitting={isGenerating}
                enableVoice={true}
                voiceLanguage="en-AU"
                noSpeechTimeoutMs={8000}
                label="Banking query"
                statusMessage={isGenerating ? 'Generating UI...' : undefined}
                errorMessage={speechError ?? undefined}
                onVoiceStart={() => setSpeechError(null)}
                onVoiceError={(voiceError: AgentInputVoiceErrorPayload) => setSpeechError(voiceError.message)}
              />
            </div>
          </QueryRow>
        </InputStage>

        {hasSubmitted && (
          <>

            {/* Agent Mode Toggle */}
            {/* {realAgentAvailable && (
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
            )} */}

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
          </>
        )}

        {/* Surface Container */}
        <SurfaceContainer
          $visible={hasSubmitted}
          aria-label="Generated UI content"
          aria-hidden={!hasSubmitted}
        >
          {hasSubmitted && (isGenerating || hasGenerated) && (
            <StatusIndicator
              $isGenerating={isGenerating}
              role="status"
              aria-live="polite"
              aria-atomic="true"
            >
              {isGenerating ? 'Agent streaming UI updates...' : 'UI generation complete'}
            </StatusIndicator>
          )}
          {/*
           * A2UISurface is always mounted (not gated behind hasSubmitted).
           *
           * Reason: the surface registers its message handler in a useEffect.
           * If it were only mounted after hasSubmitted=true, the mock agent
           * (which is near-synchronous) would dispatch messages before the
           * useEffect fires, the dispatch() call in SurfaceContext would find
           * no registered handler, and the messages would be silently dropped.
           * SurfaceContext's pending-queue provides a second safety net, but
           * keeping the surface always mounted is the primary fix.
           */}
          <A2UIErrorBoundary>
            <A2UISurface surfaceId="main" onAction={handleUserAction} />
          </A2UIErrorBoundary>
        </SurfaceContainer>
      </PageContainer>
    </PageWrapper>
  );
}
