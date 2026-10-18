import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@carbon/react';
import { DocumentBlank, Search, Filter } from '@carbon/icons-react';

export type EmptyStateType = 'no-data' | 'no-results' | 'filtered-results';

export interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  iconSize?: number;
}

export function EmptyState({
  type = 'no-data',
  title,
  description,
  actionText,
  onAction,
  iconSize = 64,
}: EmptyStateProps) {
  const { t } = useTranslation();

  const getIcon = () => {
    switch (type) {
      case 'no-results':
        return <Search size={iconSize} />;
      case 'filtered-results':
        return <Filter size={iconSize} />;
      case 'no-data':
      default:
        return <DocumentBlank size={iconSize} />;
    }
  };

  const getTitle = () => {
    if (title) return title;
    switch (type) {
      case 'no-results':
        return t('ui.empty.noResults');
      case 'filtered-results':
        return t('ui.empty.filteredEmpty');
      case 'no-data':
      default:
        return t('ui.empty.noData');
    }
  };

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
        color: 'var(--cds-text-secondary)',
      }}
    >
      <div style={{ marginBottom: '1.5rem', color: 'var(--cds-icon-secondary)' }}>
        {getIcon()}
      </div>
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
      <p style={{ maxWidth: '400px', marginBottom: '2rem' }}>
        {description || t('ui.empty.description')}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} kind="tertiary">
          {actionText}
        </Button>
      )}
    </div>
  );
}
