import React from 'react';
import { useTranslation } from 'react-i18next';
import { InlineNotification, Button } from '@carbon/react';
import { WarningAlt } from '@carbon/icons-react';

export type ErrorStateType = 'network' | 'permission' | 'general';

export interface ErrorStateProps {
  type?: ErrorStateType;
  title?: string;
  description?: string;
  inline?: boolean;
  onRetry?: () => void;
}

export function ErrorState({
  type = 'general',
  title,
  description,
  inline = false,
  onRetry,
}: ErrorStateProps) {
  const { t } = useTranslation();

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case 'network':
        return t('ui.error.network');
      case 'permission':
        return t('ui.error.permission');
      case 'general':
      default:
        return t('ui.error.title');
    }
  };

  const desc = description || t('ui.error.description');

  if (inline) {
    return (
      <InlineNotification
        kind="error"
        title={getTitle()}
        subtitle={desc}
        lowContrast
        hideCloseButton
      />
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '3rem 1rem',
        minHeight: '300px',
      }}
    >
      <WarningAlt size={64} style={{ color: 'var(--cds-support-error)', marginBottom: '1.5rem' }} />
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 400,
          color: 'var(--cds-text-primary)',
          marginBottom: '0.5rem',
        }}
      >
        {getTitle()}
      </h3>
      <p style={{ maxWidth: '400px', color: 'var(--cds-text-secondary)', marginBottom: '2rem' }}>
        {desc}
      </p>
      {onRetry && (
        <Button onClick={onRetry} kind="tertiary">
          {t('ui.actions.retry')}
        </Button>
      )}
    </div>
  );
}
