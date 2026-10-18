import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in ErrorBoundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            width: '100vw',
            backgroundColor: 'var(--cds-background, #f4f4f4)',
            padding: '2rem',
            boxSizing: 'border-box',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--cds-layer-01, #ffffff)',
              padding: '2rem',
              border: '1px solid var(--cds-border-subtle, #e0e0e0)',
              maxWidth: '600px',
              width: '100%',
            }}
          >
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--cds-text-primary, #161616)', marginBottom: '1rem' }}>
              Application Module Error
            </h1>
            <p style={{ color: 'var(--cds-text-secondary, #525252)', marginBottom: '2rem' }}>
              {this.state.error?.message || 'An unexpected error occurred while loading this module.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: 'var(--cds-button-primary, #0f62fe)',
                color: 'var(--cds-text-on-color, #ffffff)',
                border: 'none',
                padding: '0.75rem 1.5rem',
                fontSize: '0.875rem',
                cursor: 'pointer',
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }

    return (this.props as any).children;
  }
}
