import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Theme as CarbonTheme,
  HeaderContainer,
  Header,
  HeaderName,
  HeaderNavigation,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderMenuButton,
  SkipToContent,
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
  SideNavDivider,
  Content,
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  Column,
} from '@carbon/react';
import { Globe, Asleep, LightFilled, Search as SearchIcon } from '@carbon/icons-react';
import { useLanguage } from '../../i18n/LanguageProvider';
import { useAppStore } from '../../stores/useAppStore';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { UserProfile } from '../../components/shell/UserProfile';
import { NotificationCenter } from '../../components/shell/NotificationCenter';
import { RoleSwitcher } from '../../components/shell/RoleSwitcher';
import { CommandPalette } from '../../components/shell/CommandPalette';
import { AppLauncher } from '../../components/shell/AppLauncher';
import { NavItem } from './EduCoreShell';
import { MobileBottomNav } from './MobileBottomNav';

export interface TopNavLink {
  id: string;
  label: string;
  path: string;
}

export interface BaseShellProps {
  children: React.ReactNode;
  navigation: NavItem[];
  topNavigation?: TopNavLink[];
  headerPrefix?: string;
  headerName?: string;
  homeUrl?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  headerActions?: React.ReactNode;
  fullWidthGrid?: boolean;
  narrowGrid?: boolean;
  condensedGrid?: boolean;
}

/**
 * Base UI Shell Component built strictly on IBM Carbon Design System v11
 * Composes Carbon's Header, HeaderContainer, SideNav, Content, and 16-column Grid
 * with full Arabic (RTL) and English (LTR) localization support.
 */
export function BaseShell({
  children,
  navigation,
  topNavigation = [],
  headerPrefix,
  headerName,
  homeUrl = '/',
  breadcrumbs,
  headerActions,
  fullWidthGrid = true,
  narrowGrid = false,
  condensedGrid = false,
}: BaseShellProps) {
  const { t } = useTranslation();
  const { dir, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { isMobile, isTablet } = useBreakpoint();

  const {
    theme,
    toggleDarkTheme,
    isSidebarExpanded,
    setSidebarExpanded,
    toggleSidebar,
  } = useAppStore();

  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const isAr = language === 'ar';

  useEffect(() => {
    if (isMobile || isTablet) {
      setSidebarExpanded(false);
    } else {
      setSidebarExpanded(true);
    }
  }, [isMobile, isTablet, setSidebarExpanded]);

  const handleLanguageToggle = () => {
    const nextLang = language === 'ar' ? 'en' : 'ar';
    changeLanguage(nextLang);
  };

  const isPathActive = (targetPath?: string) => {
    if (!targetPath) return false;
    if (location.pathname === targetPath) return true;
    if (
      targetPath !== '/' &&
      targetPath !== '/admin' &&
      targetPath !== '/sis' &&
      location.pathname.startsWith(targetPath + '/')
    ) {
      return true;
    }
    if (targetPath.startsWith('/sis/')) {
      const subviewName = targetPath.replace('/sis/', '');
      if (subviewName && location.pathname.endsWith('/' + subviewName)) {
        return true;
      }
    }
    return false;
  };

  const isRouteActive = (item: NavItem) => {
    if (isPathActive(item.path) && (!item.children || item.children.length === 0)) return true;
    if (item.children?.some((child) => isPathActive(child.path))) return true;
    return false;
  };

  const resolvedPrefix = headerPrefix ?? t('shell.prefix');
  const resolvedHeaderName = headerName ?? t('shell.brandName');
  const marginStartValue = isSidebarExpanded ? '16rem' : isMobile ? '0' : '3rem';

  return (
    <CarbonTheme
      theme={theme}
      dir={dir}
      className={dir === 'rtl' ? 'cds--layout--rtl cds--rtl' : ''}
    >
      <HeaderContainer
        isSideNavExpanded={isSidebarExpanded}
        render={({ onClickSideNavExpand }) => {
          const expanded = isSidebarExpanded;
          const handleMenuToggle = () => {
            if (onClickSideNavExpand) {
              onClickSideNavExpand();
            }
            toggleSidebar();
          };

          return (
            <div
              className="base-shell-container"
              style={{
                minHeight: '100vh',
                backgroundColor: 'var(--cds-background)',
                color: 'var(--cds-text-primary)',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Carbon Global Header */}
              <Header aria-label={t('shell.headerLabel')}>
                <SkipToContent href="#base-shell-main-content">
                  {t('shell.skipToContent')}
                </SkipToContent>

                <HeaderMenuButton
                  aria-label={expanded ? t('shell.closeMenu') : t('shell.openMenu')}
                  onClick={handleMenuToggle}
                  isActive={expanded}
                  isCollapsible
                />

                <HeaderName
                  href={homeUrl}
                  prefix={resolvedPrefix}
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    navigate(homeUrl);
                  }}
                >
                  {resolvedHeaderName}
                </HeaderName>

                {topNavigation.length > 0 && (
                  <HeaderNavigation aria-label={t('shell.nav.main')}>
                    {topNavigation.map((link) => (
                      <HeaderMenuItem
                        key={link.id}
                        href={link.path}
                        isActive={
                          location.pathname === link.path ||
                          location.pathname.startsWith(link.path + '/')
                        }
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          navigate(link.path);
                        }}
                      >
                        {link.label}
                      </HeaderMenuItem>
                    ))}
                  </HeaderNavigation>
                )}

                <HeaderGlobalBar>
                  {headerActions}

                  <AppLauncher />

                  <HeaderGlobalAction
                    aria-label={t('shell.commandSearch')}
                    onClick={() => setIsCommandPaletteOpen(true)}
                    tooltipAlignment="center"
                  >
                    <SearchIcon size={20} />
                  </HeaderGlobalAction>

                  <RoleSwitcher />

                  <HeaderGlobalAction
                    aria-label={isAr ? t('shell.switchToEnglish') : t('shell.switchToArabic')}
                    onClick={handleLanguageToggle}
                    tooltipAlignment="center"
                  >
                    <Globe size={20} />
                  </HeaderGlobalAction>

                  <HeaderGlobalAction
                    aria-label={t('shell.theme')}
                    onClick={toggleDarkTheme}
                    tooltipAlignment="center"
                  >
                    {theme === 'g90' || theme === 'g100' ? (
                      <LightFilled size={20} />
                    ) : (
                      <Asleep size={20} />
                    )}
                  </HeaderGlobalAction>

                  <NotificationCenter />
                  <UserProfile />
                </HeaderGlobalBar>
              </Header>

              {/* Mobile & Tablet SideNav Backdrop Overlay */}
              {expanded && (isMobile || isTablet) && (
                <div
                  aria-hidden="true"
                  onClick={() => setSidebarExpanded(false)}
                  style={{
                    position: 'fixed',
                    top: '3rem',
                    inset: '3rem 0 0 0',
                    backgroundColor: 'rgba(22, 22, 22, 0.5)',
                    zIndex: 5900,
                  }}
                />
              )}

              {/* Carbon SideNav */}
              <SideNav
                aria-label={t('shell.sideNavLabel')}
                expanded={expanded}
                isRail={!isMobile && !isTablet}
                isPersistent={!isMobile && !isTablet}
                isFixedNav={!isMobile && !isTablet && expanded}
                onOverlayClick={() => setSidebarExpanded(false)}
                className={dir === 'rtl' ? 'cds--side-nav--rtl' : ''}
              >
                <SideNavItems>
                  {navigation.map((item) => {
                    if (item.kind === 'divider') {
                      return <SideNavDivider key={item.id} />;
                    }

                    if (item.kind === 'header') {
                      return (
                        <div
                          key={item.id}
                          className="side-nav-section-header"
                          style={{
                            padding: '0.75rem 1rem 0.25rem',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: 'var(--cds-text-secondary)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.32px',
                          }}
                        >
                          {item.label}
                        </div>
                      );
                    }

                    if (item.children && item.children.length > 0) {
                      const active = isRouteActive(item);
                      return (
                        <SideNavMenu
                          key={`${item.id}-${active ? 'active' : 'idle'}`}
                          renderIcon={item.icon}
                          title={item.label || ''}
                          defaultExpanded={active || Boolean(item.defaultExpanded)}
                          isActive={active}
                        >
                          {item.children.map((child) => {
                            const childActive = isPathActive(child.path);
                            return (
                              <SideNavMenuItem
                                key={child.id}
                                href={child.path || '#'}
                                isActive={childActive}
                                aria-current={childActive ? 'page' : undefined}
                                onClick={(e: React.MouseEvent) => {
                                  e.preventDefault();
                                  if (child.path) navigate(child.path);
                                  if (isMobile || isTablet) setSidebarExpanded(false);
                                }}
                              >
                                {child.label}
                              </SideNavMenuItem>
                            );
                          })}
                        </SideNavMenu>
                      );
                    }

                    const linkActive = isPathActive(item.path);
                    return (
                      <SideNavLink
                        key={item.id}
                        href={item.path || '#'}
                        renderIcon={item.icon}
                        isActive={linkActive}
                        aria-current={linkActive ? 'page' : undefined}
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          if (item.path) navigate(item.path);
                          if (isMobile || isTablet) setSidebarExpanded(false);
                        }}
                      >
                        {item.label}
                      </SideNavLink>
                    );
                  })}
                </SideNavItems>
              </SideNav>

              {/* Main Content Area with Carbon 16-Column Responsive Grid */}
              <Content
                id="base-shell-main-content"
                tabIndex={-1}
                dir={dir}
                style={{
                  marginTop: '3rem',
                  marginLeft: dir === 'rtl' ? '0px' : marginStartValue,
                  marginRight: dir === 'rtl' ? marginStartValue : '0px',
                  width: isMobile || isTablet ? '100%' : `calc(100% - ${marginStartValue})`,
                  maxWidth: isMobile || isTablet ? '100%' : `calc(100% - ${marginStartValue})`,
                  transition: 'margin 110ms cubic-bezier(0.2, 0, 0.38, 0.9), width 110ms cubic-bezier(0.2, 0, 0.38, 0.9)',
                  minHeight: 'calc(100vh - 3rem)',
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: 'var(--cds-background)',
                  padding: 0,
                  boxSizing: 'border-box',
                }}
              >
                {breadcrumbs && breadcrumbs.length > 0 && (
                  <div
                    style={{
                      padding: isMobile ? '0.625rem 0 0' : '1rem 0 0',
                      backgroundColor: 'var(--cds-layer-01)',
                      borderBottom: '1px solid var(--cds-border-subtle)',
                      overflowX: 'auto',
                    }}
                  >
                    <Grid fullWidth={fullWidthGrid} narrow={narrowGrid} condensed={condensedGrid}>
                      <Column sm={4} md={8} lg={16}>
                        <div style={{ paddingBottom: isMobile ? '0.5rem' : '0.75rem' }}>
                          <Breadcrumb noTrailingSlash>
                            {breadcrumbs.map((crumb, idx) => (
                              <BreadcrumbItem key={idx}>
                                {crumb.href ? (
                                  <Link to={crumb.href} className="cds--link">
                                    {crumb.label}
                                  </Link>
                                ) : (
                                  <span>{crumb.label}</span>
                                )}
                              </BreadcrumbItem>
                            ))}
                          </Breadcrumb>
                        </div>
                      </Column>
                    </Grid>
                  </div>
                )}

                <div
                  style={{
                    flex: 1,
                    padding: isMobile ? '1rem 0 5rem' : '1.5rem 0 3rem',
                    width: '100%',
                  }}
                >
                  <Grid fullWidth={fullWidthGrid} narrow={narrowGrid} condensed={condensedGrid}>
                    <Column sm={4} md={8} lg={16}>
                      {children}
                    </Column>
                  </Grid>
                </div>
              </Content>

              {isMobile && (
                <MobileBottomNav
                  navigation={navigation}
                  isSidebarExpanded={expanded}
                  onToggleSidebar={handleMenuToggle}
                  onCloseSidebar={() => setSidebarExpanded(false)}
                />
              )}

              <CommandPalette
                isOpen={isCommandPaletteOpen}
                onClose={() => setIsCommandPaletteOpen(false)}
              />
            </div>
          );
        }}
      />
    </CarbonTheme>
  );
}

export default BaseShell;
