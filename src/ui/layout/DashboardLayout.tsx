import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Theme as CarbonTheme,
  Header,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderMenuButton,
  SkipToContent,
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
  Content,
  Breadcrumb,
  BreadcrumbItem,
  Grid,
  Column,
} from '@carbon/react';
import {
  Asleep,
  LightFilled,
  Globe,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Help,
  Notification,
  Development,
  Enterprise,
  UserAdmin,
  Catalog,
  Education,
} from '@carbon/icons-react';

import { useLanguage } from '../../i18n/LanguageProvider';
import { useAppStore } from '../../stores/useAppStore';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { UserProfile } from '../../components/shell/UserProfile';

export interface DashboardSidebarItem {
  id: string;
  label: string;
  arabicLabel?: string;
  path: string;
  icon?: React.ComponentType<any>;
  children?: DashboardSidebarItem[];
}

export interface DashboardLayoutProps {
  /** Main page content */
  children: React.ReactNode;
  /** Optional custom sidebar items. If omitted, default platform navigation is rendered. */
  sidebarItems?: DashboardSidebarItem[];
  /** Optional page header title */
  title?: string;
  /** Optional page header description */
  description?: string;
  /** Breadcrumb path items */
  breadcrumbs?: Array<{ label: string; arabicLabel?: string; path?: string }>;
  /** Action buttons/elements to render in the page header */
  actions?: React.ReactNode;
  /** Determines if the main content area is standard grid-constrained or full-width */
  contentWidth?: 'narrow' | 'default' | 'wide' | 'full';
}

const DEFAULT_SIDEBAR_ITEMS: DashboardSidebarItem[] = [
  {
    id: 'db_overview',
    label: 'Overview Dashboard',
    arabicLabel: 'لوحة التحكم العامة',
    path: '/dashboard',
    icon: DashboardIcon,
  },
  {
    id: 'db_students',
    label: 'Students Directory',
    arabicLabel: 'دليل الطلاب',
    path: '/students',
    icon: Education,
  },
  {
    id: 'db_admissions',
    label: 'Admissions Pipeline',
    arabicLabel: 'طلبات القبول والتسجيل',
    path: '/admissions',
    icon: Catalog,
  },
  {
    id: 'db_courses',
    label: 'Course Catalog',
    arabicLabel: 'دليل المسارات الأكاديمية',
    path: '/courses',
    icon: Enterprise,
  },
  {
    id: 'db_sections',
    label: 'Class Sections',
    arabicLabel: 'الشعب الدراسية والمواعيد',
    path: '/sections',
    icon: UserAdmin,
  },
  {
    id: 'db_showcase',
    label: 'UI Showcase',
    arabicLabel: 'معرض المكونات المرئية',
    path: '/showcase',
    icon: Development,
  },
  {
    id: 'db_settings',
    label: 'System Settings',
    arabicLabel: 'إعدادات النظام واللغة',
    path: '/settings',
    icon: SettingsIcon,
  },
];

export function DashboardLayout({
  children,
  sidebarItems = DEFAULT_SIDEBAR_ITEMS,
  title,
  description,
  breadcrumbs,
  actions,
  contentWidth = 'full',
}: DashboardLayoutProps) {
  const { t, i18n } = useTranslation();
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

  const isAr = language === 'ar';

  // Automatically adjust sidebar state based on mobile/tablet viewports on load/resize
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

  const getTranslatedLabel = (item: DashboardSidebarItem) => {
    if (isAr && item.arabicLabel) {
      return item.arabicLabel;
    }
    return item.label;
  };

  const isRouteActive = (item: DashboardSidebarItem) => {
    if (location.pathname === item.path) return true;
    if (item.children?.some((child) => location.pathname === child.path)) return true;
    return false;
  };

  // Safe RTL margin and spacing keys
  const marginStartKey = dir === 'rtl' ? 'marginRight' : 'marginLeft';
  const marginEndKey = dir === 'rtl' ? 'marginLeft' : 'marginRight';
  const marginStartValue = isSidebarExpanded ? '16rem' : isMobile ? '0' : '3rem';

  return (
    <CarbonTheme
      theme={theme}
      dir={dir}
      className={dir === 'rtl' ? 'cds--layout--rtl cds--rtl' : ''}
    >
      <div
        className="dashboard-layout-container"
        style={{
          minHeight: '100vh',
          backgroundColor: 'var(--cds-background)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Top Navigation Header */}
        <Header aria-label="Schools Management System Header">
          <SkipToContent href="#dashboard-main-content">
            {t('shell.skipToContent', 'Skip to main content')}
          </SkipToContent>

          {/* Collapsible main menu toggle */}
          <HeaderMenuButton
            aria-label={isSidebarExpanded ? t('shell.closeMenu', 'Close menu') : t('shell.openMenu', 'Open menu')}
            onClick={toggleSidebar}
            isActive={isSidebarExpanded}
            isCollapsible
          />

          {/* Platform Branding */}
          <HeaderName
            href="/dashboard"
            prefix="EduCore"
            onClick={(e) => {
              e.preventDefault();
              navigate('/dashboard');
            }}
          >
            {isAr ? 'إدارة الأنظمة المدرسية' : 'Schools Systems'}
          </HeaderName>

          {/* Right Header Operations */}
          <HeaderGlobalBar>
            {/* Language Toggle Switcher */}
            <HeaderGlobalAction
              aria-label={isAr ? 'Switch to English' : 'تحويل للغة العربية'}
              onClick={handleLanguageToggle}
              tooltipAlignment="center"
            >
              <Globe size={20} />
            </HeaderGlobalAction>

            {/* Dark/Light Theme Custom Switcher */}
            <HeaderGlobalAction
              aria-label={t('shell.theme', 'Switch Theme')}
              onClick={toggleDarkTheme}
              tooltipAlignment="center"
            >
              {theme === 'g90' || theme === 'g100' ? <LightFilled size={20} /> : <Asleep size={20} />}
            </HeaderGlobalAction>

            {/* User Account avatar block */}
            <UserProfile />
          </HeaderGlobalBar>
        </Header>

        {/* Sidebar Navigation */}
        <SideNav
          aria-label="Dashboard Side Navigation"
          expanded={isSidebarExpanded}
          isRail={true}
          isPersistent={false}
          onOverlayClick={() => setSidebarExpanded(false)}
          className={dir === 'rtl' ? 'cds--side-nav--rtl' : ''}
        >
          <SideNavItems>
            {sidebarItems.map((item) => {
              const ItemIcon = item.icon || DashboardIcon;
              const hasSubmenu = item.children && item.children.length > 0;
              const isActive = isRouteActive(item);

              if (hasSubmenu && item.children) {
                return (
                  <SideNavMenu
                    key={item.id}
                    title={getTranslatedLabel(item)}
                    renderIcon={ItemIcon}
                    isActive={isActive}
                    defaultExpanded={isActive}
                  >
                    {item.children.map((child) => (
                      <SideNavMenuItem
                        key={child.id}
                        href={child.path}
                        onClick={(e) => {
                          e.preventDefault();
                          navigate(child.path);
                          if (isMobile) setSidebarExpanded(false);
                        }}
                        isActive={location.pathname === child.path}
                      >
                        {getTranslatedLabel(child)}
                      </SideNavMenuItem>
                    ))}
                  </SideNavMenu>
                );
              }

              return (
                <SideNavLink
                  key={item.id}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                    if (isMobile) setSidebarExpanded(false);
                  }}
                  renderIcon={ItemIcon}
                  isActive={location.pathname === item.path}
                >
                  {getTranslatedLabel(item)}
                </SideNavLink>
              );
            })}
          </SideNavItems>
        </SideNav>

        {/* Main Content Area */}
        <Content
          id="dashboard-main-content"
          tabIndex={-1}
          dir={dir}
          className={`app-main-content theme-transition-active ${dir === 'rtl' ? 'cds--content--rtl' : ''}`}
          style={{
            backgroundColor: 'var(--cds-background)',
            color: 'var(--cds-text-primary)',
            paddingTop: '4.5rem',
            paddingBottom: '3rem',
            [marginStartKey]: marginStartValue,
            [oppositeMarginKey(marginStartKey)]: '0px',
            width: isMobile || isTablet ? '100%' : `calc(100% - ${marginStartValue})`,
            maxWidth: isMobile || isTablet ? '100%' : `calc(100% - ${marginStartValue})`,
            transition: 'margin 0.15s ease, width 0.15s ease',
            minHeight: '100vh',
            boxSizing: 'border-box',
          }}
        >
          {/* 1. Header with Title, Description, Actions and Breadcrumbs */}
          {(title || breadcrumbs) && (
            <div
              style={{
                marginBottom: '2rem',
                borderBottom: '1px solid var(--cds-border-subtle)',
                paddingBottom: '1.5rem',
              }}
            >
              <Grid fullWidth style={{ padding: 0, margin: 0 }}>
                <Column sm={4} md={8} lg={16}>
                  {/* Breadcrumb row */}
                  {breadcrumbs && breadcrumbs.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <Breadcrumb noTrailingSlash aria-label="Breadcrumb navigation">
                        {breadcrumbs.map((bc, idx) => {
                          const label = isAr && bc.arabicLabel ? bc.arabicLabel : bc.label;
                          const isLast = idx === breadcrumbs.length - 1;

                          return (
                            <BreadcrumbItem key={idx} isCurrentPage={isLast}>
                              {isLast || !bc.path ? (
                                <span>{label}</span>
                              ) : (
                                <Link to={bc.path}>{label}</Link>
                              )}
                            </BreadcrumbItem>
                          );
                        })}
                      </Breadcrumb>
                    </div>
                  )}

                  {/* Title and Action elements */}
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <div>
                      {title && (
                        <h1
                          style={{
                            fontSize: '1.75rem',
                            fontWeight: 400,
                            lineHeight: 1.25,
                            color: 'var(--cds-text-primary)',
                            margin: 0,
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
                            marginTop: '0.375rem',
                            marginRight: 0,
                            marginLeft: 0,
                            marginBottom: 0,
                            maxWidth: '750px',
                          }}
                        >
                          {description}
                        </p>
                      )}
                    </div>

                    {actions && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.75rem',
                        }}
                      >
                        {actions}
                      </div>
                    )}
                  </div>
                </Column>
              </Grid>
            </div>
          )}

          {/* 2. Children Layout content area */}
          <div className="dashboard-content-body" style={{ width: '100%' }}>
            {contentWidth === 'full' ? (
              children
            ) : (
              <Grid fullWidth style={{ padding: 0, margin: 0 }}>
                <Column
                  sm={4}
                  md={8}
                  lg={contentWidth === 'narrow' ? 8 : contentWidth === 'wide' ? 14 : 12}
                  offsetLg={contentWidth === 'narrow' ? 4 : contentWidth === 'wide' ? 1 : 2}
                >
                  {children}
                </Column>
              </Grid>
            )}
          </div>
        </Content>
      </div>
    </CarbonTheme>
  );
}

// Utility to switch active margin keys easily
function oppositeMarginKey(key: 'marginLeft' | 'marginRight'): 'marginLeft' | 'marginRight' {
  return key === 'marginLeft' ? 'marginRight' : 'marginLeft';
}

export default DashboardLayout;
