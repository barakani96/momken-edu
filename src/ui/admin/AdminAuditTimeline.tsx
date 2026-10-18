/**
 * Admin Console Audit Timeline & Diff Inspector Components
 */

import React from 'react';
import { Tag, Tile } from '@carbon/react';
import { Time, User, Security, Code } from '@carbon/icons-react';

export interface AuditEventItem {
  id: string | number;
  timestamp: string;
  actor: string;
  action: string;
  module?: string;
  details?: any;
}

export function AdminAuditTimeline({ events }: { events: AuditEventItem[] }) {
  if (!events || events.length === 0) {
    return (
      <Tile style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)', margin: 0 }}>
          No audit entries recorded for this entity.
        </p>
      </Tile>
    );
  }

  return (
    <div style={{ position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--cds-border-subtle)' }}>
      {events.map((ev, i) => (
        <div key={ev.id || i} style={{ marginBottom: '1.5rem', position: 'relative' }}>
          {/* Node Bullet */}
          <span
            style={{
              position: 'absolute',
              left: '-2rem',
              top: '0.125rem',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: 'var(--cds-interactive)',
              border: '2px solid var(--cds-layer-01)',
            }}
          />

          <div className="cds-flex cds-items-center cds-justify-between" style={{ marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
              {ev.action}
            </span>
            <div className="cds-flex cds-items-center cds-gap-01" style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)' }}>
              <Time size={12} />
              {new Date(ev.timestamp).toLocaleString()}
            </div>
          </div>

          <div className="cds-flex cds-items-center cds-gap-02" style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>
            <User size={12} />
            <span>Actor: {ev.actor}</span>
            {ev.module && (
              <Tag type="cool-gray" size="sm">
                {ev.module}
              </Tag>
            )}
          </div>

          {ev.details && (
            <pre
              style={{
                marginTop: '0.5rem',
                padding: '0.5rem 0.75rem',
                backgroundColor: 'var(--cds-layer-02)',
                border: '1px solid var(--cds-border-subtle)',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                overflowX: 'auto',
                borderRadius: '2px',
                color: 'var(--cds-text-secondary)',
              }}
            >
              {typeof ev.details === 'string' ? ev.details : JSON.stringify(ev.details, null, 2)}
            </pre>
          )}
        </div>
      ))}
    </div>
  );
}

export function AdminDiffViewer({ oldData, newData }: { oldData: any; newData: any }) {
  return (
    <div className="cds-grid cds-grid-cols-2 cds-gap-02" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-support-error)', marginBottom: '0.25rem' }}>
          Previous State (-)
        </div>
        <pre
          style={{
            padding: '0.75rem',
            backgroundColor: 'var(--cds-layer-02)',
            border: '1px solid var(--cds-border-subtle)',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: 'var(--cds-text-primary)',
            overflowX: 'auto',
            minHeight: '100px',
          }}
        >
          {JSON.stringify(oldData, null, 2)}
        </pre>
      </div>

      <div>
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-support-success)', marginBottom: '0.25rem' }}>
          New State (+)
        </div>
        <pre
          style={{
            padding: '0.75rem',
            backgroundColor: 'var(--cds-layer-02)',
            border: '1px solid var(--cds-border-subtle)',
            fontSize: '0.75rem',
            fontFamily: 'monospace',
            color: 'var(--cds-text-primary)',
            overflowX: 'auto',
            minHeight: '100px',
          }}
        >
          {JSON.stringify(newData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
