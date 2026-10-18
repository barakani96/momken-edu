/**
 * EduCore Admin Console - Global Command Palette & Search (`Ctrl + K` / `/`)
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, Search, Tile, Tag } from '@carbon/react';
import { Search as SearchIcon, User, Group, Settings, Flag, Security, Building, Application } from '@carbon/icons-react';
import { useAdminStore } from '../../core/admin/adminStore';

export interface AdminCommandSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminCommandSearch({ isOpen, onClose }: AdminCommandSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { users, roles, organizations, systemSettings, featureFlags } = useAdminStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Search indexing across administrative domains
  const matchingUsers = q
    ? users.filter((u) => u.fullName.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.username.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const matchingRoles = q
    ? roles.filter((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const matchingOrgs = q
    ? organizations.filter((o) => o.name.toLowerCase().includes(q) || o.code.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const matchingSettings = q
    ? systemSettings.filter((s) => s.key.toLowerCase().includes(q) || s.description.toLowerCase().includes(q)).slice(0, 4)
    : [];

  const matchingFlags = q
    ? featureFlags.filter((f) => f.key.toLowerCase().includes(q) || f.name.toLowerCase().includes(q)).slice(0, 4)
    : [];

  // Navigation shortcuts
  const quickNav = [
    { label: 'Admin Dashboard Overview', path: '/admin', icon: Application },
    { label: 'User Directory', path: '/admin/identity/users', icon: User },
    { label: 'Role & Permissions Matrix', path: '/admin/access/roles', icon: Group },
    { label: 'System Settings', path: '/admin/system/general', icon: Settings },
    { label: 'Audit Log Trail', path: '/admin/audit/logs', icon: Security },
    { label: 'Feature Flags', path: '/admin/feature-management/flags', icon: Flag },
  ].filter((n) => !q || n.label.toLowerCase().includes(q));

  const handleSelect = (path: string) => {
    onClose();
    setQuery('');
    navigate(path);
  };

  return (
    <Modal
      open={isOpen}
      modalHeading="Global Admin Command & Search"
      modalLabel="EduCore Command Palette (Esc to close)"
      passiveModal
      onRequestClose={() => {
        setQuery('');
        onClose();
      }}
      size="md"
    >
      <div style={{ padding: '0.5rem 0' }}>
        <Search
          id="admin-command-palette-input"
          labelText="Search command palette"
          placeholder="Type to search users, roles, settings, flags, or commands..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          size="lg"
          autoFocus
        />

        <div style={{ marginTop: '1.25rem', maxHeight: '420px', overflowY: 'auto' }}>
          {/* Quick Navigation Links */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              Navigation & Modules
            </div>
            {quickNav.map((nav, i) => {
              const IconComp = nav.icon;
              return (
                <div
                  key={i}
                  className="cds-flex cds-items-center cds-justify-between"
                  style={{
                    padding: '0.625rem 0.875rem',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    backgroundColor: 'var(--cds-layer-01)',
                    marginBottom: '0.25rem',
                    border: '1px solid var(--cds-border-subtle)',
                  }}
                  onClick={() => handleSelect(nav.path)}
                >
                  <div className="cds-flex cds-items-center cds-gap-02">
                    <IconComp size={16} style={{ color: 'var(--cds-icon-primary)' }} />
                    <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--cds-text-primary)' }}>
                      {nav.label}
                    </span>
                  </div>
                  <Tag type="cool-gray" size="sm">
                    {nav.path}
                  </Tag>
                </div>
              );
            })}
          </div>

          {/* Users */}
          {matchingUsers.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Users
              </div>
              {matchingUsers.map((u) => (
                <div
                  key={u.id}
                  className="cds-flex cds-items-center cds-justify-between"
                  style={{
                    padding: '0.625rem 0.875rem',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    backgroundColor: 'var(--cds-layer-01)',
                    marginBottom: '0.25rem',
                    border: '1px solid var(--cds-border-subtle)',
                  }}
                  onClick={() => handleSelect(`/admin/identity/users/${u.id}`)}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                      {u.fullName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                      {u.email} • {u.title || 'User'}
                    </div>
                  </div>
                  <Tag type="purple" size="sm">
                    User
                  </Tag>
                </div>
              ))}
            </div>
          )}

          {/* Roles */}
          {matchingRoles.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Roles
              </div>
              {matchingRoles.map((r) => (
                <div
                  key={r.id}
                  className="cds-flex cds-items-center cds-justify-between"
                  style={{
                    padding: '0.625rem 0.875rem',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    backgroundColor: 'var(--cds-layer-01)',
                    marginBottom: '0.25rem',
                    border: '1px solid var(--cds-border-subtle)',
                  }}
                  onClick={() => handleSelect('/admin/access/roles')}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                      {r.name} ({r.code})
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                      {r.description}
                    </div>
                  </div>
                  <Tag type="blue" size="sm">
                    Role
                  </Tag>
                </div>
              ))}
            </div>
          )}

          {/* Settings */}
          {matchingSettings.length > 0 && (
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                System Settings
              </div>
              {matchingSettings.map((s) => (
                <div
                  key={s.id}
                  className="cds-flex cds-items-center cds-justify-between"
                  style={{
                    padding: '0.625rem 0.875rem',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    backgroundColor: 'var(--cds-layer-01)',
                    marginBottom: '0.25rem',
                    border: '1px solid var(--cds-border-subtle)',
                  }}
                  onClick={() => handleSelect('/admin/system/general')}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                      {s.key}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                      {s.description}
                    </div>
                  </div>
                  <Tag type="teal" size="sm">
                    Setting
                  </Tag>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
