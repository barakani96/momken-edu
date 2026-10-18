/**
 * Admin Console Page, Page Header, Section, and State Wrapper Layouts
 */

import React, { ReactNode } from 'react';
import { Breadcrumb, BreadcrumbItem, Button, Loading, InlineNotification, Tile } from '@carbon/react';
import { Warning, Misuse, Information } from '@carbon/icons-react';
import { useBreakpoint } from '../../hooks';

export interface AdminBreadcrumb {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface AdminPageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: AdminBreadcrumb[];
  actions?: ReactNode;
}

export function AdminPageHeader({ title, description, breadcrumbs, actions }: AdminPageHeaderProps) {
  const { isMobile } = useBreakpoint();

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb aria-label="Page breadcrumb navigation" style={{ marginBottom: '0.5rem' }}>
          {breadcrumbs.map((b, idx) => (
            <BreadcrumbItem key={idx} href={b.href} onClick={b.onClick} isCurrentPage={idx === breadcrumbs.length - 1}>
              {b.label}
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      )}

      <div className="cds-flex cds-items-start cds-justify-between cds-gap-03 cds-flex-wrap">
        <div>
          <h1 style={{ fontSize: isMobile ? '1.5rem' : '1.75rem', fontWeight: 600, color: 'var(--cds-text-primary)', margin: 0 }}>
            {title}
          </h1>
          {description && (
            <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', marginTop: '0.375rem', marginBottom: 0, maxWidth: '80ch' }}>
              {description}
            </p>
          )}
        </div>

        {actions && <div className="cds-flex cds-items-center cds-gap-02 cds-flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}

export function AdminPage({
  title,
  description,
  breadcrumbs,
  actions,
  children,
  contentWidth = 'normal',
}: AdminPageHeaderProps & { children: ReactNode; contentWidth?: 'normal' | 'wide' | 'full' }) {
  const { isMobile } = useBreakpoint();
  const maxWidthMap = {
    normal: '1280px',
    wide: '1600px',
    full: '100%',
  };

  return (
    <div
      style={{
        padding: isMobile ? '0.75rem 0' : '1.5rem',
        maxWidth: maxWidthMap[contentWidth],
        margin: '0 auto',
        width: '100%',
      }}
    >
      <AdminPageHeader title={title} description={description} breadcrumbs={breadcrumbs} actions={actions} />
      {children}
    </div>
  );
}

export function AdminSection({
  title,
  description,
  actions,
  children,
  className = '',
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const { isMobile } = useBreakpoint();

  return (
    <div
      className={`admin-section ${className}`}
      style={{
        backgroundColor: 'var(--cds-layer-01)',
        border: '1px solid var(--cds-border-subtle)',
        borderRadius: '2px',
        padding: isMobile ? '1rem' : '1.25rem',
        marginBottom: '1.5rem',
      }}
    >
      {(title || actions) && (
        <div
          className="cds-flex cds-items-start cds-justify-between cds-flex-wrap cds-gap-02"
          style={{ marginBottom: '1rem', paddingBottom: title ? '0.75rem' : 0, borderBottom: title ? '1px solid var(--cds-border-subtle)' : undefined }}
        >
          <div style={{ flex: '1 1 auto', minWidth: '150px' }}>
            {title && (
              <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--cds-text-primary)', margin: 0 }}>
                {title}
              </h3>
            )}
            {description && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', margin: '0.25rem 0 0' }}>
                {description}
              </p>
            )}
          </div>
          {actions && <div className="cds-flex cds-items-center cds-gap-02 cds-flex-wrap" style={{ marginTop: isMobile ? '0.5rem' : 0 }}>{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function AdminEmptyState({
  title = 'No records found',
  description = 'There are no items matching your criteria or no entities have been registered yet.',
  action,
}: {
  title?: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <Tile
      style={{
        textAlign: 'center',
        padding: '3rem 1.5rem',
        backgroundColor: 'var(--cds-layer-01)',
        border: '1px solid var(--cds-border-subtle)',
      }}
    >
      <Information size={32} style={{ color: 'var(--cds-icon-secondary)', marginBottom: '0.75rem' }} />
      <h4 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--cds-text-primary)', margin: '0 0 0.5rem' }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', margin: '0 auto 1.25rem', maxWidth: '50ch' }}>
        {description}
      </p>
      {action}
    </Tile>
  );
}

export function AdminErrorState({
  title = 'Failed to load data',
  message = 'An unexpected server error or authorization failure occurred while processing this request.',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div style={{ marginBottom: '1.5rem' }}>
      <InlineNotification
        kind="error"
        title={title}
        subtitle={message}
      />
      {onRetry && (
        <Button kind="ghost" size="sm" onClick={onRetry} style={{ marginTop: '0.5rem' }}>
          Retry
        </Button>
      )}
    </div>
  );
}

export function AdminLoadingState({ description = 'Loading administration data...' }: { description?: string }) {
  return (
    <div className="cds-flex cds-flex-col cds-items-center cds-justify-center" style={{ padding: '4rem 1.5rem' }}>
      <Loading active withOverlay={false} description={description} />
      <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
        {description}
      </p>
    </div>
  );
}
