import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Breadcrumb, BreadcrumbItem, ContentSwitcher, Switch } from '@carbon/react';
import { useAuth } from '../../auth/AuthProvider';

export interface BreadcrumbPath {
  label: string;
  href?: string;
}

export type BreadcrumbItem = BreadcrumbPath;

export interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbPath[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumbs, actions }: PageHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { setActiveRole } = useAuth();

  const isAdmin = location.pathname.startsWith('/admin');
  const selectedIndex = isAdmin ? 1 : 0;

  const handleEnvironmentChange = (item: any) => {
    const idx = typeof item === 'number' ? item : (item?.index ?? (item?.name === 'admin' ? 1 : 0));
    if (idx === 1) {
      setActiveRole('admin');
      navigate('/admin');
    } else {
      setActiveRole('student');
      navigate('/student');
    }
  };

  return (
    <header
      className="page-header-responsive"
      style={{
        padding: '0.75rem 0 1.25rem 0',
        marginBottom: '1rem',
        borderBottom: '1px solid var(--cds-border-subtle)',
        boxSizing: 'border-box',
      }}
    >
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb noTrailingSlash style={{ marginBottom: '0.75rem' }}>
          {breadcrumbs.map((crumb, i) => (
            <BreadcrumbItem key={i} href={crumb.href} isCurrentPage={!crumb.href}>
              {crumb.label}
            </BreadcrumbItem>
          ))}
        </Breadcrumb>
      )}
      
      <div
        id="page-header-container-row"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          padding: '0.875rem 1rem',
          borderRadius: '4px',
          backgroundColor: 'var(--cds-layer-01)',
          border: '1px solid var(--cds-border-subtle)',
          transition: 'all 0.2s ease-in-out',
        }}
      >
        <div style={{ flex: '1 1 16rem', minWidth: 0 }}>
          {title && (
            <h1
              className="page-header-title"
              style={{
                fontSize: '1.75rem',
                fontWeight: 400,
                color: 'var(--cds-text-primary)',
                margin: 0,
                lineHeight: 1.25,
                letterSpacing: 0,
              }}
            >
              {title}
            </h1>
          )}
          {description && (
            <p
              style={{
                fontSize: '0.875rem',
                color: 'var(--cds-text-secondary)',
                maxWidth: '48rem',
                margin: title ? '0.375rem 0 0 0' : 0,
                lineHeight: 1.5,
              }}
            >
              {description}
            </p>
          )}
        </div>

        {/* Responsive Environment Switcher Component */}
        <div
          className="environment-switcher-wrapper"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.75rem',
            maxWidth: '100%',
          }}
        >
          <ContentSwitcher
            selectedIndex={selectedIndex}
            onChange={handleEnvironmentChange}
            size="sm"
          >
            <Switch
              name="education"
              text={t('shell.nav.educationPlatform', 'Education Platform')}
              onClick={() => handleEnvironmentChange(0)}
            />
            <Switch
              name="admin"
              text={t('shell.nav.adminConsole', 'Admin Console')}
              onClick={() => handleEnvironmentChange(1)}
            />
          </ContentSwitcher>
        </div>

        {actions && (
          <div className="page-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            {actions}
          </div>
        )}
      </div>
    </header>
  );
}
