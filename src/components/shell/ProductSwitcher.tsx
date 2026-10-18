import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Switcher, SwitcherItem, SwitcherDivider, Search, Tag } from '@carbon/react';
import { LAUNCHPAD_APPS, AppLaunchItem } from './AppLauncher';
import { useAuth } from '../../auth/AuthProvider';

export interface ProductSwitcherProps {
  onItemClick?: () => void;
}

export function ProductSwitcher({ onItemClick }: ProductSwitcherProps) {
  const { i18n, t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { setActiveRole } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const isAr = i18n.language === 'ar';

  const handleSelect = (app: AppLaunchItem) => {
    if (app.targetRole) {
      setActiveRole(app.targetRole);
    }
    navigate(app.path);
    if (onItemClick) {
      onItemClick();
    }
  };

  const filteredApps = LAUNCHPAD_APPS.filter((app) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      app.nameEn.toLowerCase().includes(q) ||
      app.nameAr.toLowerCase().includes(q) ||
      app.descEn.toLowerCase().includes(q) ||
      app.descAr.toLowerCase().includes(q)
    );
  });

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        color: 'var(--cds-text-primary)',
      }}
    >
      <div
        style={{
          padding: '0.75rem 1rem',
          borderBottom: '1px solid var(--cds-border-subtle)',
          backgroundColor: 'var(--cds-layer-01)',
        }}
      >
        <Search
          id="product-switcher-search"
          size="sm"
          labelText={isAr ? 'البحث عن تطبيق' : 'Search Applications'}
          placeholder={isAr ? 'ابحث في المنظومة...' : 'Search apps...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onClear={() => setSearchQuery('')}
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        <Switcher aria-label={t('shell.panels.switcher.title')} expanded>
          {filteredApps.map((app) => {
            const isCurrent = location.pathname === app.path || location.pathname.startsWith(app.path + '/');
            const Icon = app.icon;
            return (
              <SwitcherItem
                key={app.id}
                aria-label={isAr ? app.nameAr : app.nameEn}
                isSelected={isCurrent}
                onClick={() => handleSelect(app)}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 1rem',
                    width: '100%',
                  }}
                >
                  <Icon size={20} style={{ color: 'var(--cds-icon-primary)' }} />
                  <div style={{ flex: 1, minWidth: 0, textAlign: isAr ? 'right' : 'left' }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                      {isAr ? app.nameAr : app.nameEn}
                    </div>
                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--cds-text-secondary)',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {isAr ? app.descAr : app.descEn}
                    </div>
                  </div>
                  {app.badgeEn && (
                    <Tag
                      type={app.category === 'student' ? 'teal' : app.category === 'faculty' ? 'purple' : 'blue'}
                      size="sm"
                      style={{ margin: 0 }}
                    >
                      {isAr ? app.badgeAr : app.badgeEn}
                    </Tag>
                  )}
                </div>
              </SwitcherItem>
            );
          })}
        </Switcher>
      </div>
    </div>
  );
}
