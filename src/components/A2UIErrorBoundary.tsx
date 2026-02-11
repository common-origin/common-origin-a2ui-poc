'use client';

/**
 * Error Boundary for A2UI Surface
 * 
 * Catches React errors in the component tree and displays a fallback UI
 * instead of crashing the entire application.
 */

import React, { Component, ReactNode, ErrorInfo } from 'react';
import styled from 'styled-components';
import { createLogger } from '../lib/logger';

const log = createLogger('ErrorBoundary');

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const ErrorContainer = styled.div`
  padding: 2rem;
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 0.5rem;
  color: #856404;
`;

const ErrorTitle = styled.h3`
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #856404;
`;

const ErrorMessage = styled.pre`
  margin: 0;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 0.25rem;
  font-family: 'Monaco', 'Menlo', monospace;
  font-size: 0.875rem;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-word;
`;

const RetryButton = styled.button`
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #ffc107;
  color: #000;
  border: none;
  border-radius: 0.25rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #ffca28;
  }
`;

export class A2UIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    log.error('Caught rendering error', { error: error.message, componentStack: errorInfo.componentStack?.substring(0, 200) });
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorTitle>⚠️ UI Rendering Error</ErrorTitle>
          <p>
            An error occurred while rendering the agent-generated UI. 
            This could be due to an invalid component configuration or data binding issue.
          </p>
          {this.state.error && (
            <ErrorMessage>
              <strong>Error:</strong> {this.state.error.toString()}
              {this.state.errorInfo && (
                <>
                  {'\n\n'}
                  <strong>Component Stack:</strong>
                  {this.state.errorInfo.componentStack}
                </>
              )}
            </ErrorMessage>
          )}
          <RetryButton onClick={this.handleReset}>
            Try Again
          </RetryButton>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}
