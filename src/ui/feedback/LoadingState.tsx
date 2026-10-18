import React from 'react';
import { Loading, InlineLoading } from '@carbon/react';
import { useTranslation } from 'react-i18next';

export interface LoadingStateProps {
  variant?: 'fullscreen' | 'inline' | 'overlay';
  description?: string;
  withOverlay?: boolean;
}

export function LoadingState({
  variant = 'fullscreen',
  description,
  withOverlay = true,
}: LoadingStateProps) {
  const { t } = useTranslation();
  const desc = description || t('ui.loading');

  if (variant === 'inline') {
    return <InlineLoading description={desc} status="active" />;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: variant === 'fullscreen' ? '100vh' : '100%',
        width: '100%',
        minHeight: '200px',
        position: variant === 'overlay' ? 'absolute' : 'relative',
        top: 0,
        left: 0,
        backgroundColor: variant === 'overlay' ? 'var(--cds-overlay)' : 'transparent',
        zIndex: variant === 'overlay' ? 9000 : 'auto',
      }}
    >
      <Loading
        description={desc}
        withOverlay={withOverlay && variant === 'fullscreen'}
      />
    </div>
  );
}
