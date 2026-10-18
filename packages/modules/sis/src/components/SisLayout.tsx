/**
 * @schools/module-sis — SisLayout
 * Core layout and navigation component for the Student Information System module.
 * Composes IBM Carbon UI Shell components and i18n localization.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
  Content,
  Grid,
  Column,
  Tile,
  Button
} from '@carbon/react';
import {
  UserMultiple,
  User,
  Document,
  Book,
  CheckmarkOutline,
  Calendar,
  Security
} from '@carbon/icons-react';

interface SisLayoutProps {
  activeView: string;
  onSelectView: (view: string) => void;
  children?: React.ReactNode;
}

export const SisLayout: React.FC<SisLayoutProps> = ({ activeView, onSelectView, children }) => {
  const { t } = useTranslation();
  const [isSideNavExpanded, setIsSideNavExpanded] = useState(true);

  return (
    <div className="sis-layout-container" style={{ minHeight: '100vh', backgroundColor: 'var(--cds-background)' }}>
      <Header aria-label={t('sis.moduleTitle', 'Student Information System')}>
        <HeaderName prefix="IBM" onClick={() => onSelectView('directory')} style={{ cursor: 'pointer' }}>
          {t('sis.moduleTitle', 'Student Information System')}
        </HeaderName>
        <HeaderNavigation aria-label={t('sis.moduleTitle')}>
          <HeaderMenuItem onClick={() => onSelectView('directory')} isActive={activeView === 'directory'}>
            {t('sis.nav.directory', 'Student Directory')}
          </HeaderMenuItem>
          <HeaderMenuItem onClick={() => onSelectView('academics')} isActive={activeView === 'academics'}>
            {t('sis.nav.academics', 'Academic Records')}
          </HeaderMenuItem>
          <HeaderMenuItem onClick={() => onSelectView('documents')} isActive={activeView === 'documents'}>
            {t('sis.nav.documents', 'Document Vault')}
          </HeaderMenuItem>
        </HeaderNavigation>
      </Header>

      <SideNav
        aria-label={t('shell.sideNavLabel', 'Side Navigation')}
        expanded={isSideNavExpanded}
        isRail={false}
      >
        <SideNavItems>
          <SideNavLink
            renderIcon={UserMultiple}
            isActive={activeView === 'directory'}
            onClick={() => onSelectView('directory')}
          >
            {t('sis.nav.directory', 'Student Directory')}
          </SideNavLink>
          <SideNavLink
            renderIcon={User}
            isActive={activeView === 'profile'}
            onClick={() => onSelectView('profile')}
          >
            {t('sis.nav.profile', 'Student Profile (360)')}
          </SideNavLink>
          <SideNavLink
            renderIcon={Book}
            isActive={activeView === 'academics'}
            onClick={() => onSelectView('academics')}
          >
            {t('sis.nav.academics', 'Academic Records')}
          </SideNavLink>
          <SideNavLink
            renderIcon={Document}
            isActive={activeView === 'documents'}
            onClick={() => onSelectView('documents')}
          >
            {t('sis.nav.documents', 'Document Vault')}
          </SideNavLink>
          <SideNavLink
            renderIcon={CheckmarkOutline}
            isActive={activeView === 'enrollment'}
            onClick={() => onSelectView('enrollment')}
          >
            {t('sis.nav.enrollment', 'Enrollments & Placements')}
          </SideNavLink>
          <SideNavLink
            renderIcon={Calendar}
            isActive={activeView === 'attendance'}
            onClick={() => onSelectView('attendance')}
          >
            {t('sis.nav.attendance', 'Attendance & Behavior')}
          </SideNavLink>
          <SideNavLink
            renderIcon={Security}
            isActive={activeView === 'graduation'}
            onClick={() => onSelectView('graduation')}
          >
            {t('sis.nav.graduation', 'Graduation & Clearance')}
          </SideNavLink>
        </SideNavItems>
      </SideNav>

      <Content style={{ marginLeft: isSideNavExpanded ? '256px' : '48px', paddingTop: '48px', transition: 'margin-left 0.1s ease-in-out' }}>
        <div style={{ padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: 'var(--cds-text-primary)', marginBottom: '0.5rem' }}>
              {t('sis.moduleTitle', 'Student Information System')}
            </h1>
            <p style={{ color: 'var(--cds-text-secondary)', fontSize: '1rem' }}>
              {t('sis.subtitle', 'Authoritative Student Directory, Profiles, Academic Records & Document Vault')}
            </p>
          </div>
          {children}
        </div>
      </Content>
    </div>
  );
};
