import React from 'react';
import { SkeletonText, SkeletonPlaceholder } from '@carbon/react';

export function HelpPanelSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading help and support"
      style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
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
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <SkeletonPlaceholder />
            </div>
            <SkeletonText heading={false} width={`${50 + i * 15}%`} />
          </div>
          <SkeletonText paragraph lineCount={2} width="100%" />
        </div>
      ))}
    </div>
  );
}
