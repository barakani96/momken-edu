/**
 * Admin Console Metric Card & Health Indicator Components
 */

import React, { ReactNode } from 'react';
import { Tile, Tag, Button } from '@carbon/react';
import { Renew } from '@carbon/icons-react';

export interface AdminMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  kind?: 'default' | 'warning' | 'error' | 'success' | 'info';
  onRefresh?: () => void;
  onClick?: () => void;
  loading?: boolean;
}

export function AdminMetricCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  kind = 'default',
  onRefresh,
  onClick,
  loading = false,
}: AdminMetricCardProps) {
  let borderLeftColor = 'transparent';
  if (kind === 'warning') borderLeftColor = 'var(--cds-support-warning)';
  if (kind === 'error') borderLeftColor = 'var(--cds-support-error)';
  if (kind === 'success') borderLeftColor = 'var(--cds-support-success)';
  if (kind === 'info') borderLeftColor = 'var(--cds-interactive)';

  return (
    <Tile
      style={{
        backgroundColor: 'var(--cds-layer-01)',
        border: '1px solid var(--cds-border-subtle)',
        borderLeft: borderLeftColor !== 'transparent' ? `4px solid ${borderLeftColor}` : undefined,
        padding: '1.25rem',
        borderRadius: '2px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
      }}
      onClick={onClick}
    >
      <div>
        <div className="cds-flex cds-items-center cds-justify-between" style={{ marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cds-text-secondary)' }}>
            {title}
          </span>
          <div className="cds-flex cds-items-center cds-gap-01">
            {icon}
            {onRefresh && (
              <Button
                kind="ghost"
                size="sm"
                renderIcon={Renew}
                iconDescription="Refresh"
                hasIconOnly
                onClick={(e) => {
                  e.stopPropagation();
                  onRefresh();
                }}
              />
            )}
          </div>
        </div>

        <div style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--cds-text-primary)', lineHeight: 1.2 }}>
          {loading ? '...' : value}
        </div>

        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)', margin: '0.375rem 0 0' }}>
            {subtitle}
          </p>
        )}
      </div>

      {trend && (
        <div style={{ marginTop: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid var(--cds-border-subtle)' }}>
          <Tag type={trend.isPositive ? 'green' : 'red'} size="sm">
            {trend.value}
          </Tag>
        </div>
      )}
    </Tile>
  );
}

export function AdminHealthIndicator({
  status,
  label,
  latencyMs,
}: {
  status: 'healthy' | 'degraded' | 'unavailable' | 'unknown';
  label: string;
  latencyMs?: number;
}) {
  let color = 'var(--cds-support-success)';
  if (status === 'degraded') color = 'var(--cds-support-warning)';
  if (status === 'unavailable') color = 'var(--cds-support-error)';
  if (status === 'unknown') color = 'var(--cds-icon-secondary)';

  return (
    <div className="cds-flex cds-items-center cds-gap-02">
      <span
        style={{
          width: '10px',
          height: '10px',
          borderRadius: '50%',
          backgroundColor: color,
          display: 'inline-block',
        }}
      />
      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
        {label}
      </span>
      {latencyMs !== undefined && (
        <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)', marginLeft: '0.25rem' }}>
          ({latencyMs}ms)
        </span>
      )}
    </div>
  );
}
