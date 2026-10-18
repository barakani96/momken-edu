import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tag } from '@carbon/react';
import { Calendar } from '@carbon/icons-react';
import { BaseShell, TopNavLink } from './BaseShell';
import { NavItem } from './EduCoreShell';
import { getPortalById, PortalId } from '../../core/portals/portalRegistry';
import { useAuth } from '../../auth/AuthProvider';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useNavigationMenu } from '../../hooks/useNavigationMenu';
import { resolveCarbonIcon } from './iconResolver';

export interface PortalShellProps {
  portalId: PortalId;
  children: React.ReactNode;
  headerActions?: React.ReactNode;
  topNavigation?: TopNavLink[];
  showBreadcrumbs?: boolean;
}

/**
 * Reusable Portal Shell Layer
 * Connects Portal Registry definitions with IBM Carbon Design System v11 BaseShell,
 * automatic i18n navigation translation, academic term context badge, and responsive 16-column Grid.
 */
export function PortalShell({
  portalId,
  children,
  headerActions,
  topNavigation,
  showBreadcrumbs = false,
}: PortalShellProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const { currentUser } = useAuth();
  const { isMobile } = useBreakpoint();

  const portal = getPortalById(portalId);
  const { menu: dbMenu, items: dbItems } = useNavigationMenu(portalId);

  const navigation: NavItem[] = (dbItems && dbItems.length > 0)
    ? dbItems.map((item) => ({
        id: item.id,
        kind: item.type === 'DIVIDER' ? ('divider' as const) : ('item' as const),
        label: item.label,
        path: item.path || undefined,
        icon: resolveCarbonIcon(item.icon),
        children: item.children?.map((child) => ({
          id: child.id,
          kind: child.type === 'DIVIDER' ? ('divider' as const) : ('item' as const),
          label: child.label,
          path: child.path || undefined,
          icon: resolveCarbonIcon(child.icon),
        })),
      }))
    : portal.getNavigation(currentUser?.permissions).map((item) => ({
        id: item.id,
        kind: item.kind,
        label: item.id
          ? t(`${portal.navTranslationPrefix}.${item.id}`, item.label || '')
          : item.label,
        path: item.path,
        icon: item.icon,
        defaultExpanded: item.defaultExpanded,
        children: item.children?.map((child) => ({
          id: child.id,
          label: t(`${portal.navTranslationPrefix}.${child.id}`, child.label),
          path: child.path,
        })),
      }));

  const pathSegments = location.pathname.split('/').filter(Boolean);
  const breadcrumbs = showBreadcrumbs
    ? [
        { label: t(portal.titleKey), href: portal.basePath },
        ...pathSegments.slice(1).map((segment, index) => {
          const url = `/${pathSegments.slice(0, index + 2).join('/')}`;
          const isLast = index === pathSegments.length - 2;
          return {
            label: t(`portals.breadcrumbs.${segment}`, segment),
            href: isLast ? undefined : url,
          };
        }),
      ]
    : undefined;

  const combinedHeaderActions = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        paddingInlineEnd: '0.5rem',
      }}
    >
      {!isMobile && portal.contextTagKey && (
        <Tag type={portal.tagType} size="sm">
          {t(portal.contextTagKey)}
        </Tag>
      )}
      {!isMobile && (
        <Tag type="cool-gray" size="sm" renderIcon={Calendar}>
          {t('portals.activeTerm')}
        </Tag>
      )}
      {headerActions}
    </div>
  );

  return (
    <BaseShell
      headerName={t(portal.titleKey)}
      navigation={navigation}
      topNavigation={topNavigation}
      homeUrl={portal.basePath}
      breadcrumbs={breadcrumbs}
      headerActions={combinedHeaderActions}
    >
      {children}
    </BaseShell>
  );
}

export default PortalShell;
