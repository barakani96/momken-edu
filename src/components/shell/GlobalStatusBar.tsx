import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguage } from '../../i18n/LanguageProvider';
import { useShell } from './ShellContext';

export function GlobalStatusBar() {
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const { activeContext } = useShell();

  const statusBarStyle: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '32px',
    backgroundColor: 'var(--cds-layer-01, #f4f4f4)',
    borderTop: '1px solid var(--cds-border-subtle, #e0e0e0)',
    display: 'flex',
    alignItems: 'center',
    padding: '0 1rem',
    fontSize: '0.75rem',
    color: 'var(--cds-text-secondary, #525252)',
    zIndex: 6000, // Carbon header is typically around 8000
    justifyContent: 'space-between',
  };

  return (
    <div style={statusBarStyle} dir={dir}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <span>System Status: <strong>Online</strong></span>
        <span style={{ color: 'var(--cds-border-subtle, #e0e0e0)' }}>|</span>
        <span>Component: <strong>{activeContext.component}</strong></span>
        <span style={{ color: 'var(--cds-border-subtle, #e0e0e0)' }}>|</span>
        <span>Entity: <strong>{activeContext.entity}</strong></span>
      </div>
      <div>
        <span>Environment: <strong>Production</strong></span>
        <span style={{ margin: '0 0.5rem', color: 'var(--cds-border-subtle, #e0e0e0)' }}>|</span>
        <span>v1.0.0</span>
      </div>
    </div>
  );
}
