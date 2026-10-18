/**
 * EduCore Admin Console - Database-Backed Dynamic Product Side Navigation
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
  SideNavDivider,
  SkeletonText,
} from '@carbon/react';
import { useLanguage } from '../../i18n/LanguageProvider';
import { useNavigationMenu } from '../../hooks/useNavigationMenu';
import { resolveCarbonIcon } from '../../ui/layout/iconResolver';

export interface ProductSideNavProps {
  isExpanded: boolean;
  onOverlayClick?: () => void;
}

export function ProductSideNav({ isExpanded, onOverlayClick }: ProductSideNavProps) {
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  // Authoritative Database Navigation Store
  const { items: navItems, loading, error } = useNavigationMenu('admin');

  const handleNavigate = (path?: string | null) => {
    if (!path) return;
    navigate(path);
    if (onOverlayClick) {
      onOverlayClick();
    }
  };

  const currentPath = location.pathname;

  const isPathActive = (targetPath?: string | null) => {
    if (!targetPath) return false;
    if (currentPath === targetPath) return true;
    if (targetPath !== '/' && targetPath !== '/admin' && currentPath.startsWith(targetPath)) {
      return true;
    }
    return false;
  };

  const { isMobile, isTablet } = { isMobile: false, isTablet: false };

  return (
    <SideNav
      aria-label="EduCore Admin Console Navigation"
      expanded={isExpanded}
      isRail={true}
      isPersistent={!isMobile && !isTablet}
      isFixedNav={!isMobile && !isTablet && isExpanded}
      onOverlayClick={onOverlayClick}
      className={dir === 'rtl' ? 'cds--side-nav--rtl' : ''}
    >
      <SideNavItems>
        {loading ? (
          <div style={{ padding: '1rem' }}>
            <SkeletonText paragraph />
          </div>
        ) : error ? (
          <div style={{ padding: '1rem', color: 'var(--cds-support-error)', fontSize: '0.85rem' }}>
            {error.message || 'Failed to load navigation'}
          </div>
        ) : (
          navItems.map((item) => {
            if (item.type === 'DIVIDER') {
              return <SideNavDivider key={item.id} />;
            }

            const IconComponent = resolveCarbonIcon(item.icon);

            if (item.children && item.children.length > 0) {
              const anyChildActive = item.children.some((child) => isPathActive(child.path));
              return (
                <SideNavMenu
                  key={item.id}
                  renderIcon={IconComponent}
                  title={item.label}
                  isActive={anyChildActive}
                  defaultExpanded={anyChildActive}
                >
                  {item.children.map((child) => {
                    const childActive = isPathActive(child.path);
                    return (
                      <SideNavMenuItem
                        key={child.id}
                        isActive={childActive}
                        onClick={() => handleNavigate(child.path)}
                      >
                        {child.label}
                      </SideNavMenuItem>
                    );
                  })}
                </SideNavMenu>
              );
            }

            const active = isPathActive(item.path);
            return (
              <SideNavLink
                key={item.id}
                renderIcon={IconComponent}
                isActive={active}
                onClick={() => handleNavigate(item.path)}
              >
                {item.label}
              </SideNavLink>
            );
          })
        )}
      </SideNavItems>
    </SideNav>
  );
}

export default ProductSideNav;
