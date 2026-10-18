import React from 'react';
import { SkeletonText, RadioButtonSkeleton } from '@carbon/react';

export function SettingsPanelSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading settings"
      style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
    >
      <div>
        <div style={{ marginBottom: '1rem' }}>
          <SkeletonText heading={false} width="110px" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <RadioButtonSkeleton />
          <RadioButtonSkeleton />
        </div>
      </div>

      <div style={{ borderTop: '1px solid var(--cds-border-subtle)', paddingTop: '1.25rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <SkeletonText heading={false} width="130px" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <RadioButtonSkeleton />
          <RadioButtonSkeleton />
        </div>
      </div>
    </div>
  );
}
