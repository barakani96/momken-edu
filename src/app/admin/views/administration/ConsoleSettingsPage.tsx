/**
 * EduCore Admin Console - Admin Console Preferences & System Information View
 */

import React from 'react';
import { Tile, Tag, Toggle, Button } from '@carbon/react';
import { Renew, Checkmark, Information } from '@carbon/icons-react';

import { useAdminStore } from '../../../../core/admin/adminStore';
import { useAppStore } from '../../../../stores/useAppStore';
import { AdminPage, AdminSection } from '../../../../ui/admin/AdminPage';
import { AdminDetailProperty } from '../../../../ui/admin/AdminDetailPanel';

export function ConsoleSettingsPage() {
  const { resetToDefaults } = useAdminStore();
  const { theme, toggleDarkTheme } = useAppStore();

  return (
    <AdminPage
      title="Admin Console Settings & Information"
      description="Configure local console preferences, view system version information, and manage developer debug modes."
      breadcrumbs={[{ label: 'Admin Console', href: '/admin' }, { label: 'Administration' }, { label: 'Console Settings' }]}
    >
      <AdminSection title="Display & Theme Preferences">
        <div className="cds-flex cds-items-center cds-justify-between" style={{ padding: '0.5rem 0' }}>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
              Dark Theme Mode (IBM Carbon Gray 100)
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
              Switch between High-Contrast White (Light) and Gray 100 (Dark) themes.
            </div>
          </div>
          <Toggle
            id="console-theme-toggle"
            size="sm"
            toggled={theme === 'g90' || theme === 'g100'}
            labelA="Light"
            labelB="Dark"
            onChange={toggleDarkTheme}
          />
        </div>
      </AdminSection>

      <AdminSection title="System Information & Build Details">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <AdminDetailProperty label="Application Name" value="EduCore Enterprise Administration Console" />
          <AdminDetailProperty label="Design System" value="Momken Design System v11 (IBM Carbon React)" />
          <AdminDetailProperty label="Console Version" value="v11.4.2-RELEASE" />
          <AdminDetailProperty label="Core Framework" value="React 18 + Vite + React Router v7" />
          <AdminDetailProperty label="State Engine" value="Zustand + IndexedDB Cache" />
          <AdminDetailProperty label="Audit System" value="Integrated Real-Time Audit Logger" />
        </div>
      </AdminSection>

      <AdminSection title="Data & State Management">
        <div className="cds-flex cds-items-center cds-justify-between">
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
              Reset Admin Console Demo Seed Data
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
              Resets all organizations, users, roles, feature flags, and settings back to initial enterprise seed state.
            </div>
          </div>
          <Button kind="tertiary" renderIcon={Renew} onClick={resetToDefaults}>
            Reset Seed State
          </Button>
        </div>
      </AdminSection>
    </AdminPage>
  );
}
