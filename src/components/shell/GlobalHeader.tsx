import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Header,
  HeaderMenuButton,
  HeaderName,
  HeaderNavigation,
  HeaderMenu,
  HeaderMenuItem,
  HeaderGlobalBar,
  HeaderGlobalAction,
  SkipToContent,
} from '@carbon/react';
import {
  Notification,
  Help,
  Settings,
  UserAvatar,
  Switcher as SwitcherIcon,
  Asleep,
  LightFilled
} from '@carbon/icons-react';
import { useShell, UtilityPanelType } from './ShellContext';
import { UtilityPanels } from './UtilityPanels';
import { useLanguage } from '../../i18n/LanguageProvider';
import { useAppStore } from '../../stores/useAppStore';
import { UserProfile } from './UserProfile';
import { RoleSwitcher } from './RoleSwitcher';

export interface GlobalHeaderProps {
  isSideNavExpanded?: boolean;
  onToggleSideNav?: () => void;
  activePanel?: UtilityPanelType;
  onTogglePanel?: (panel: UtilityPanelType) => void;
  onClosePanel?: () => void;
  theme?: 'white' | 'g100';
  onThemeChange?: (theme: 'white' | 'g100') => void;
}

export function GlobalHeader(props: GlobalHeaderProps) {
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const shell = useShell();
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleDarkTheme } = useAppStore();

  // Support props override or fallback to centralized shell context
  const isSideNavExpanded = props.isSideNavExpanded ?? shell.isSideNavExpanded;
  const onToggleSideNav = props.onToggleSideNav ?? shell.toggleSideNav;
  const activePanel = props.activePanel ?? shell.activePanel;
  const onTogglePanel = props.onTogglePanel ?? shell.togglePanel;
  const onClosePanel = props.onClosePanel ?? shell.closePanel;

  const handleNavigate = (path: string) => {
    navigate(path);
    onClosePanel();
  };

  const isAdministrationActive = ['/settings'].some((path) =>
    location.pathname.startsWith(path)
  );

  return (
    <Header
      aria-label={`IBM ${t('shell.brandName')}`}
      className={dir === 'rtl' ? 'cds--layout--rtl cds--rtl' : ''}
    >
      {/* Skip to Content for Keyboard Accessibility */}
      <SkipToContent href="#main-content">
        {t('shell.skipToContent')}
      </SkipToContent>

      {/* Main Menu Button (opens product navigation in left panel) */}
      <HeaderMenuButton
        aria-label={isSideNavExpanded ? t('shell.closeMenu') : t('shell.openMenu')}
        onClick={onToggleSideNav}
        isActive={isSideNavExpanded}
        isCollapsible
      />

      {/* Header Name (preceded by Momken, linking strictly to /admin) */}
      <HeaderName
        href="/admin"
        prefix="Momken"
        onClick={(e) => {
          e.preventDefault();
          navigate('/admin');
        }}
      >
        EduCore Admin Console
      </HeaderName>

      {/* Primary Product Navigation */}
      <HeaderNavigation aria-label={t('shell.nav.main')}>
        {/* Dashboard */}
        <HeaderMenuItem
          isActive={location.pathname === '/dashboard'}
          href="/dashboard"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate('/dashboard');
          }}
        >
          {t('shell.nav.dashboard')}
        </HeaderMenuItem>

        {/* UI Showcase */}
        <HeaderMenuItem
          isActive={location.pathname === '/showcase'}
          href="/showcase"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate('/showcase');
          }}
        >
          {t('shell.nav.showcase')}
        </HeaderMenuItem>

        {/* Administration Sub-Menu */}
        <HeaderMenu
          aria-label={t('shell.nav.administration')}
          menuLinkName={t('shell.nav.administration')}
          isActive={isAdministrationActive}
        >
          <HeaderMenuItem
            isActive={location.pathname.startsWith('/settings')}
            href="/settings"
            onClick={(e) => {
              e.preventDefault();
              handleNavigate('/settings');
            }}
          >
            {t('shell.nav.settings')}
          </HeaderMenuItem>
        </HeaderMenu>
      </HeaderNavigation>

      {/* Global Utilities Bar */}
      <HeaderGlobalBar>
        <RoleSwitcher />

        {/* Theme Toggle */}

        <HeaderGlobalAction
          aria-label="Toggle Dark Theme"
          onClick={toggleDarkTheme}
          tooltipAlignment={dir === 'rtl' ? 'start' : 'center'}
        >
          {theme === 'g90' || theme === 'g100' ? <LightFilled size={20} /> : <Asleep size={20} />}
        </HeaderGlobalAction>

        {/* Notifications */}
        <HeaderGlobalAction
          aria-label={t('shell.utilities.notifications')}
          isActive={activePanel === 'notifications'}
          onClick={() => onTogglePanel('notifications')}
          tooltipAlignment={dir === 'rtl' ? 'start' : 'center'}
        >
          <Notification size={20} />
        </HeaderGlobalAction>


        {/* Help & Support */}
        <HeaderGlobalAction
          aria-label={t('shell.utilities.help')}
          isActive={activePanel === 'help'}
          onClick={() => onTogglePanel('help')}
          tooltipAlignment={dir === 'rtl' ? 'start' : 'center'}
        >
          <Help size={20} />
        </HeaderGlobalAction>

        {/* System Settings */}
        <HeaderGlobalAction
          aria-label={t('shell.utilities.settings')}
          isActive={activePanel === 'settings'}
          onClick={() => onTogglePanel('settings')}
          tooltipAlignment={dir === 'rtl' ? 'start' : 'center'}
        >
          <Settings size={20} />
        </HeaderGlobalAction>

        {/* User Account */}
        <UserProfile />

        {/* Product / System Switcher */}
        <HeaderGlobalAction
          aria-label={t('shell.utilities.switcher')}
          isActive={activePanel === 'switcher'}
          onClick={() => onTogglePanel('switcher')}
          tooltipAlignment={dir === 'rtl' ? 'start' : 'end'}
        >
          <SwitcherIcon size={20} />
        </HeaderGlobalAction>
      </HeaderGlobalBar>

      {/* Contextual Slide-out Utility Panels */}
      <UtilityPanels />
    </Header>
  );
}
