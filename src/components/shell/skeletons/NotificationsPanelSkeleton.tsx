import React from 'react';
import { SkeletonText, SkeletonPlaceholder, ButtonSkeleton } from '@carbon/react';

export function NotificationsPanelSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading notifications"
      style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            padding: '0.75rem',
            backgroundColor: 'var(--cds-layer)',
            border: '1px solid var(--cds-border-subtle)',
            borderRadius: '2px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
                marginTop: '2px',
              }}
            >
              <SkeletonPlaceholder />
            </div>
            <div style={{ width: '100%' }}>
              <div style={{ marginBottom: '0.5rem' }}>
                <SkeletonText heading={false} width={`${60 + (i * 10)}%`} />
              </div>
              <SkeletonText heading={false} width="35%" />
            </div>
          </div>
        </div>
      ))}
      <div style={{ marginTop: '0.5rem', width: '100%' }}>
        <ButtonSkeleton size="sm" />
      </div>
    </div>
  );
}
