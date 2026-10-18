import React from 'react';
import { Tag, InlineLoading } from '@carbon/react';
import {
  CheckmarkFilled,
  WarningFilled,
  ErrorFilled,
  Locked,
} from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { EntityStatusBarProps, ConnectionStatus } from './types';
import { EntityMode } from '../EntityToolbar/types';

export function EntityStatusBar({ status, className = '' }: EntityStatusBarProps) {
  const { t } = useTranslation();

  const getModeTag = (mode: EntityMode, isDisabled: boolean = false) => {
    if (isDisabled) {
      return (
        <Tag type="red" size="sm" renderIcon={Locked} title="Record is locked / disabled">
          LOCKED
        </Tag>
      );
    }
    switch (mode) {
      case 'create':
        return (
          <Tag type="teal" size="sm">
            CREATE
          </Tag>
        );
      case 'edit':
        return (
          <Tag type="blue" size="sm">
            EDIT
          </Tag>
        );
      case 'duplicate':
        return (
          <Tag type="purple" size="sm">
            DUPLICATE
          </Tag>
        );
      case 'view':
      default:
        return (
          <Tag type="gray" size="sm">
            VIEW
          </Tag>
        );
    }
  };

  const getConnectionIndicator = (conn: ConnectionStatus = 'connected') => {
    switch (conn) {
      case 'syncing':
        return (
          <span className="cds-flex cds-items-center cds-gap-02" style={{ color: 'var(--cds-support-info)' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--cds-support-info)',
                display: 'inline-block',
                animation: 'cds-pulse 1.5s infinite',
              }}
            />
            <span style={{ fontSize: '0.75rem' }}>Syncing</span>
          </span>
        );
      case 'offline':
        return (
          <span className="cds-flex cds-items-center cds-gap-02" style={{ color: 'var(--cds-support-warning)' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--cds-support-warning)',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '0.75rem' }}>Offline</span>
          </span>
        );
      case 'error':
        return (
          <span className="cds-flex cds-items-center cds-gap-02" style={{ color: 'var(--cds-support-error)' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--cds-support-error)',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '0.75rem' }}>Connection Error</span>
          </span>
        );
      case 'connected':
      default:
        return (
          <span className="cds-flex cds-items-center cds-gap-02" style={{ color: 'var(--cds-support-success)' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: 'var(--cds-support-success)',
                display: 'inline-block',
              }}
            />
            <span style={{ fontSize: '0.75rem' }}>Connected</span>
          </span>
        );
    }
  };

  const formattedLastModified = status.lastModified
    ? typeof status.lastModified === 'string'
      ? status.lastModified
      : status.lastModified.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <footer
      className={`entity-status-bar cds-flex cds-items-center cds-justify-between ${className}`}
      style={{
        backgroundColor: 'var(--cds-layer-01)',
        borderTop: '1px solid var(--cds-border-subtle)',
        padding: '0.375rem 0.75rem',
        boxSizing: 'border-box',
        width: '100%',
        minHeight: '2rem',
        fontSize: '0.75rem',
        color: 'var(--cds-text-secondary)',
        userSelect: 'none',
        overflowX: 'auto',
      }}
      role="status"
      aria-label="Entity Status"
    >
      {/* Left Section: Form Mode & Record Details */}
      <div className="cds-flex cds-items-center cds-gap-03" style={{ flexWrap: 'nowrap' }}>
        {getModeTag(status.mode, status.isDisabledRecord)}

        {/* Resource & Record Info */}
        {(status.resourceLabel || status.resourceName) && (
          <span className="cds-text-truncate" style={{ fontWeight: 500, color: 'var(--cds-text-primary)' }}>
            {status.resourceLabel || status.resourceName}
            {status.recordId && <span style={{ fontWeight: 400, color: 'var(--cds-text-secondary)' }}> #{status.recordId}</span>}
          </span>
        )}

        {/* Position counter */}
        <span style={{ color: 'var(--cds-text-helper)' }}>
          {status.mode === 'create'
            ? 'New Record'
            : (status.totalRecords ?? 0) > 0
            ? `Record ${(status.recordIndex ?? 0) + 1} of ${status.totalRecords}`
            : ''}
        </span>

        {/* Unsaved / Dirty Indicator */}
        {status.isDirty && status.mode !== 'view' && (
          <Tag type="warm-gray" size="sm" renderIcon={WarningFilled}>
            Unsaved Changes
          </Tag>
        )}

        {!status.isDirty && status.mode !== 'create' && !status.isSaving && (
          <span className="cds-flex cds-items-center cds-gap-01" style={{ color: 'var(--cds-support-success)' }}>
            <CheckmarkFilled size={12} style={{ fill: 'var(--cds-support-success)' }} />
            <span>Saved</span>
          </span>
        )}
      </div>

      {/* Center Section: Saving State & Error Counters */}
      <div className="cds-flex cds-items-center cds-gap-03" style={{ flexWrap: 'nowrap' }}>
        {status.isSaving && (
          <InlineLoading
            status="active"
            description="Saving record..."
            style={{ minHeight: '1.25rem', height: '1.25rem' }}
          />
        )}

        {status.isLoading && !status.isSaving && (
          <InlineLoading
            status="active"
            description="Loading data..."
            style={{ minHeight: '1.25rem', height: '1.25rem' }}
          />
        )}

        {status.errorCount !== undefined && status.errorCount > 0 ? (
          <span className="cds-flex cds-items-center cds-gap-01" style={{ color: 'var(--cds-support-error)' }}>
            <ErrorFilled size={12} style={{ fill: 'var(--cds-support-error)' }} />
            <span>{status.errorCount} Validation Error{status.errorCount > 1 ? 's' : ''}</span>
          </span>
        ) : null}

        {status.errorMessage && (
          <span className="cds-text-truncate" style={{ color: 'var(--cds-support-error)', maxWidth: '16rem' }}>
            {status.errorMessage}
          </span>
        )}
      </div>

      {/* Right Section: Connection Status & Timestamps */}
      <div className="cds-flex cds-items-center cds-gap-04" style={{ flexWrap: 'nowrap' }}>
        {formattedLastModified && (
          <span className="cds-hide-sm" style={{ color: 'var(--cds-text-helper)' }}>
            Updated: {formattedLastModified}
          </span>
        )}

        {getConnectionIndicator(status.connectionStatus)}
      </div>
    </footer>
  );
}
