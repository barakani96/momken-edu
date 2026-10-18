import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, Close } from '@carbon/icons-react';
import { NavItem } from './EduCoreShell';

export interface MobileBottomNavProps {
  navigation: NavItem[];
  isSidebarExpanded: boolean;
  onToggleSidebar: () => void;
  onCloseSidebar: () => void;
}

interface FlattenedNavTarget {
  id: string;
  label: string;
  path: string;
  icon?: React.ComponentType<any>;
}

/**
 * Carbon v11 Mobile-First Bottom Navigation Bar
 * Provides ergonomic thumb-zone navigation (44x44px minimum touch hitboxes)
 * on smartphone viewports (< 42rem / 672px) with full Arabic RTL & English LTR support.
 */
export function MobileBottomNav({
  navigation,
  isSidebarExpanded,
  onToggleSidebar,
  onCloseSidebar,
}: MobileBottomNavProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Extract up to 4 primary navigation destinations from the portal's navigation tree
  const quickTargets = useMemo<FlattenedNavTarget[]>(() => {
    const targets: FlattenedNavTarget[] = [];

    for (const item of navigation) {
      if (item.kind === 'divider' || item.kind === 'header') continue;

      if (item.path && (!item.children || item.children.length === 0)) {
        targets.push({
          id: item.id,
          label: item.label || '',
          path: item.path,
          icon: item.icon,
        });
      } else if (item.children && item.children.length > 0) {
        // Pick the first child of each major domain group for quick thumb access
        const firstChild = item.children[0];
        if (firstChild && firstChild.path) {
          targets.push({
            id: firstChild.id,
            label: firstChild.label || item.label || '',
            path: firstChild.path,
            icon: item.icon,
          });
        }
      }

      if (targets.length >= 4) break;
    }

    return targets;
  }, [navigation]);

  const isTargetActive = (targetPath: string) => {
    if (location.pathname === targetPath) return true;
    if (
      targetPath !== '/' &&
      targetPath !== '/admin' &&
      targetPath !== '/sis' &&
      location.pathname.startsWith(targetPath + '/')
    ) {
      return true;
    }
    return false;
  };

  return (
    <nav
      aria-label={t('shell.nav.main')}
      className="cds-mobile-bottom-nav"
      style={{
        position: 'fixed',
        bottom: 0,
        insetInlineStart: 0,
        insetInlineEnd: 0,
        height: '3.5rem',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backgroundColor: 'var(--cds-layer-01)',
        borderTop: '1px solid var(--cds-border-subtle)',
        display: 'grid',
        gridTemplateColumns: `repeat(${quickTargets.length + 1}, minmax(0, 1fr))`,
        alignItems: 'stretch',
        zIndex: 8000,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.08)',
      }}
    >
      {quickTargets.map((target) => {
        const IconComponent = target.icon;
        const active = !isSidebarExpanded && isTargetActive(target.path);

        return (
          <button
            key={target.id}
            type="button"
            aria-current={active ? 'page' : undefined}
            onClick={() => {
              onCloseSidebar();
              navigate(target.path);
            }}
            style={{
              background: 'none',
              border: 'none',
              borderTop: active
                ? '3px solid var(--cds-interactive, #0f62fe)'
                : '3px solid transparent',
              padding: '0.25rem 0.25rem',
              minHeight: '2.75rem',
              minWidth: '2.75rem',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.1875rem',
              cursor: 'pointer',
              color: active
                ? 'var(--cds-interactive, #0f62fe)'
                : 'var(--cds-text-secondary)',
              backgroundColor: active
                ? 'var(--cds-layer-selected-01, rgba(15, 98, 254, 0.08))'
                : 'transparent',
              transition: 'background-color 110ms ease, color 110ms ease',
              overflow: 'hidden',
            }}
          >
            {IconComponent && (
              <IconComponent
                size={20}
                style={{
                  fill: 'currentColor',
                  flexShrink: 0,
                }}
              />
            )}
            <span
              style={{
                fontSize: '0.6875rem',
                fontWeight: active ? 600 : 400,
                lineHeight: 1.1,
                maxWidth: '100%',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {target.label}
            </span>
          </button>
        );
      })}

      {/* 5th Slot: Full SideNav Drawer Toggle */}
      <button
        type="button"
        aria-expanded={isSidebarExpanded}
        aria-label={isSidebarExpanded ? t('shell.closeMenu') : t('shell.openMenu')}
        onClick={onToggleSidebar}
        style={{
          background: 'none',
          border: 'none',
          borderTop: isSidebarExpanded
            ? '3px solid var(--cds-interactive, #0f62fe)'
            : '3px solid transparent',
          padding: '0.25rem 0.25rem',
          minHeight: '2.75rem',
          minWidth: '2.75rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.1875rem',
          cursor: 'pointer',
          color: isSidebarExpanded
            ? 'var(--cds-interactive, #0f62fe)'
            : 'var(--cds-text-secondary)',
          backgroundColor: isSidebarExpanded
            ? 'var(--cds-layer-selected-01, rgba(15, 98, 254, 0.08))'
            : 'transparent',
          transition: 'background-color 110ms ease, color 110ms ease',
          overflow: 'hidden',
        }}
      >
        {isSidebarExpanded ? (
          <Close size={20} style={{ fill: 'currentColor', flexShrink: 0 }} />
        ) : (
          <Menu size={20} style={{ fill: 'currentColor', flexShrink: 0 }} />
        )}
        <span
          style={{
            fontSize: '0.6875rem',
            fontWeight: isSidebarExpanded ? 600 : 400,
            lineHeight: 1.1,
            maxWidth: '100%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {t('portals.mobileNav.menu', 'Menu')}
        </span>
      </button>
    </nav>
  );
}

export default MobileBottomNav;
