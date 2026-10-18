/**
 * Admin Console Detail Panel & Side Drawer Component
 */

import React, { ReactNode } from 'react';
import { Button } from '@carbon/react';
import { Close } from '@carbon/icons-react';

export interface AdminDrawerProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
  width?: string;
}

export function AdminDrawer({
  isOpen,
  title,
  subtitle,
  onClose,
  children,
  actions,
  width = '480px',
}: AdminDrawerProps) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9000,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: width,
          maxWidth: '100vw',
          height: '100%',
          backgroundColor: 'var(--cds-layer-01)',
          borderLeft: '1px solid var(--cds-border-subtle)',
          boxShadow: '-4px 0 16px rgba(0,0,0,0.2)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 9001,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="cds-flex cds-items-center cds-justify-between"
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--cds-border-subtle)',
            backgroundColor: 'var(--cds-layer-02)',
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--cds-text-primary)', margin: 0 }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', margin: '0.25rem 0 0' }}>
                {subtitle}
              </p>
            )}
          </div>
          <Button
            kind="ghost"
            size="sm"
            renderIcon={Close}
            iconDescription="Close panel"
            hasIconOnly
            onClick={onClose}
          />
        </div>

        {/* Content Body */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '1.5rem',
          }}
        >
          {children}
        </div>

        {/* Action Footer */}
        {actions && (
          <div
            className="cds-flex cds-items-center cds-justify-end cds-gap-02"
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--cds-border-subtle)',
              backgroundColor: 'var(--cds-layer-02)',
            }}
          >
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminDetailProperty({
  label,
  value,
  copyable = false,
}: {
  label: string;
  value: ReactNode;
  copyable?: boolean;
}) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </div>
      <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-primary)', marginTop: '0.25rem', wordBreak: 'break-word' }}>
        {value !== undefined && value !== null && value !== '' ? value : '—'}
      </div>
    </div>
  );
}
