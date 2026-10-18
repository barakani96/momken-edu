import React from 'react';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { HeaderContainer, Theme, Content, Grid, Column } from '@carbon/react';
import { GlobalHeader } from './GlobalHeader';
import { ProductSideNav } from './ProductSideNav';
import { GlobalLoadingOverlay } from './GlobalLoadingOverlay';
import { ShellProvider, useShell } from './ShellContext';
import { useLanguage } from '../../i18n/LanguageProvider';
import { GlobalStatusBar } from './GlobalStatusBar';
import { ShellKeyboardBindings } from './ShellKeyboardBindings';
import { ShellContextMenu } from './ShellContextMenu';
import { CommandPalette } from './CommandPalette';
import { useAppStore } from '../../stores/useAppStore';
import { useBreakpoint } from '../../hooks/useBreakpoint';

function AppShellContent() {
  const { dir } = useLanguage();
  const { isSideNavExpanded, toggleSideNav, setSideNavExpanded } = useShell();
  const theme = useAppStore((state) => state.theme);
  const { isMobile, isTablet } = useBreakpoint();

  // Automatically adjust side navigation state based on viewport sizes
  useEffect(() => {
    if (isMobile || isTablet) {
      setSideNavExpanded(false);
    } else {
      setSideNavExpanded(true);
    }
  }, [isMobile, isTablet, setSideNavExpanded]);

  const marginStartKey = dir === 'rtl' ? 'marginRight' : 'marginLeft';
  const marginEndKey = dir === 'rtl' ? 'marginLeft' : 'marginRight';
  const marginStartValue = isMobile || isTablet ? '0px' : (isSideNavExpanded ? '16rem' : '3rem');

  return (
    <Theme
      theme={theme}
      dir={dir}
      className={dir === 'rtl' ? 'cds--layout--rtl cds--rtl' : ''}
    >
      <ShellKeyboardBindings />
      <ShellContextMenu />
      <CommandPalette />
      {/* Global Loading Spinner Overlay on React Router page transitions */}
      <GlobalLoadingOverlay />

      <HeaderContainer
        isSideNavExpanded={isSideNavExpanded}
        render={({ isSideNavExpanded: headerSideNavExpanded, onClickSideNavExpand }) => {
          // Keep HeaderContainer internal state and shell context synchronized
          const expanded = headerSideNavExpanded ?? isSideNavExpanded;
          const handleToggleSideNav = () => {
            if (onClickSideNavExpand) {
              onClickSideNavExpand();
            }
            toggleSideNav();
          };

          return (
            <>
              {/* Persistent Global Header across all application routes */}
              <GlobalHeader
                isSideNavExpanded={expanded}
                onToggleSideNav={handleToggleSideNav}
              />

              {/* Side Navigation Menu */}
              <ProductSideNav
                isExpanded={expanded}
                onOverlayClick={() => {
                  if (onClickSideNavExpand) {
                    onClickSideNavExpand();
                  }
                  setSideNavExpanded(false);
                }}
              />

              {/* Carbon UI Shell Main Content wrapping React Router v7 Outlet with Carbon 16-column Grid */}
              <Content
                id="main-content"
                key={dir + '-' + theme}
                tabIndex={-1}
                dir={dir}
                className={`app-main-content theme-transition-active ${dir === 'rtl' ? 'cds--content--rtl' : ''}`}
                style={{
                  backgroundColor: 'var(--cds-background)',
                  color: 'var(--cds-text-primary)',
                  marginBottom: '32px', // Space for GlobalStatusBar
                  [marginStartKey]: marginStartValue,
                  [marginEndKey]: '0px',
                  width: isMobile || isTablet ? '100%' : `calc(100% - ${marginStartValue})`,
                  maxWidth: isMobile || isTablet ? '100%' : `calc(100% - ${marginStartValue})`,
                  paddingTop: '4.5rem',
                  transition: 'margin 0.15s ease, width 0.15s ease',
                  boxSizing: 'border-box',
                }}
              >
                <Grid fullWidth className="app-main-grid" style={{ width: '100%', maxWidth: '100%' }}>
                  <Column sm={4} md={8} lg={16} className="app-main-column">
                    <Outlet />
                  </Column>
                </Grid>
              </Content>
              <GlobalStatusBar />
            </>
          );
        }}
      />
    </Theme>
  );
}

export function AppShell() {
  return (
    <ShellProvider>
      <AppShellContent />
    </ShellProvider>
  );
}

export default AppShell;


