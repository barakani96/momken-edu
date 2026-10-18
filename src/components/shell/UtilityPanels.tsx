import React, { useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  HeaderPanel,
  Button,
  RadioButtonGroup,
  RadioButton,
  Tile,
} from '@carbon/react';

const PanelContainer = HeaderPanel as any;
import {
  Close,
  Checkmark,
  Information,
  HelpFilled,
  Logout,
  Renew,
} from '@carbon/icons-react';
import { useAuth } from '../../auth/AuthProvider';
import { useLanguage } from '../../i18n/LanguageProvider';
import { ProductSwitcher } from './ProductSwitcher';
import { UtilityPanelType, useShell } from './ShellContext';
import {
  NotificationsPanelSkeleton,
  HelpPanelSkeleton,
  SettingsPanelSkeleton,
} from './skeletons';

export type { UtilityPanelType };

export function UtilityPanels() {
  const { t } = useTranslation();
  const { currentUser, logout } = useAuth();
  const { language, changeLanguage, dir } = useLanguage();
  const {
    activePanel,
    closePanel,
    theme,
    setTheme,
    panelLoading,
    refreshPanel,
  } = useShell();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close panel on Escape key or outside click
  useEffect(() => {
    if (!activePanel) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closePanel();
      }
    };

    const handlePointerDown = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        const target = event.target as HTMLElement;
        if (!target.closest('.cds--header__action')) {
          closePanel();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [activePanel, closePanel]);

  const handleLogout = () => {
    closePanel();
    logout();
    navigate('/login');
  };

  if (!activePanel) {
    return null;
  }

  const renderPanelHeader = (
    title: string,
    panelType?: 'notifications' | 'help' | 'settings'
  ) => (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.875rem 1rem',
        borderBottom: '1px solid var(--cds-border-subtle)',
        backgroundColor: 'var(--cds-layer-01)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>{title}</h3>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
        {panelType && (
          <Button
            kind="ghost"
            size="sm"
            hasIconOnly
            iconDescription={t('shell.refresh') || 'Refresh'}
            renderIcon={Renew}
            onClick={() => refreshPanel(panelType)}
          />
        )}
        <Button
          kind="ghost"
          size="sm"
          hasIconOnly
          iconDescription={t('shell.panels.close')}
          renderIcon={Close}
          onClick={closePanel}
        />
      </div>
    </div>
  );

  return (
    <div ref={panelRef} >
      {/* Notifications Panel */}
      {activePanel === 'notifications' && (
        <PanelContainer
          aria-label={t('shell.panels.notifications.title')}
          expanded
          
          style={{
            inlineSize: '22rem',
            maxHeight: 'calc(100vh - 3rem)',
            overflowY: 'auto',
            borderInlineStart: dir === 'rtl' ? 'none' : '1px solid var(--cds-border-subtle)',
            borderInlineEnd: dir === 'rtl' ? '1px solid var(--cds-border-subtle)' : 'none',
          }}
        >
          {renderPanelHeader(t('shell.panels.notifications.title'), 'notifications')}
          {panelLoading.notifications ? (
            <NotificationsPanelSkeleton />
          ) : (
            <div
              style={{
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              <Tile style={{ padding: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <Information
                    size={18}
                    style={{
                      color: 'var(--cds-support-info)',
                      marginTop: '2px',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {t('shell.panels.notifications.item1Title')}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                      {t('shell.panels.notifications.item1Time')}
                    </span>
                  </div>
                </div>
              </Tile>

              <Tile style={{ padding: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <Information
                    size={18}
                    style={{
                      color: 'var(--cds-support-warning)',
                      marginTop: '2px',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {t('shell.panels.notifications.item2Title')}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                      {t('shell.panels.notifications.item2Time')}
                    </span>
                  </div>
                </div>
              </Tile>

              <Tile style={{ padding: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <Checkmark
                    size={18}
                    style={{
                      color: 'var(--cds-support-success)',
                      marginTop: '2px',
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                      {t('shell.panels.notifications.item3Title')}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>
                      {t('shell.panels.notifications.item3Time')}
                    </span>
                  </div>
                </div>
              </Tile>

              <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                <Button kind="ghost" size="sm" style={{ width: '100%' }}>
                  {t('shell.panels.notifications.markAllRead')}
                </Button>
              </div>
            </div>
          )}
        </PanelContainer>
      )}

      {/* Help Panel */}
      {activePanel === 'help' && (
        <PanelContainer
          aria-label={t('shell.panels.help.title')}
          expanded
          
          style={{
            inlineSize: '22rem',
            maxHeight: 'calc(100vh - 3rem)',
            overflowY: 'auto',
            borderInlineStart: dir === 'rtl' ? 'none' : '1px solid var(--cds-border-subtle)',
            borderInlineEnd: dir === 'rtl' ? '1px solid var(--cds-border-subtle)' : 'none',
          }}
        >
          {renderPanelHeader(t('shell.panels.help.title'), 'help')}
          {panelLoading.help ? (
            <HelpPanelSkeleton />
          ) : (
            <div
              style={{
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
              }}
            >
              <Tile style={{ padding: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                  <HelpFilled size={20} style={{ color: 'var(--cds-interactive)', flexShrink: 0 }} />
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      {t('shell.panels.help.docsTitle')}
                    </h4>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>
                      {t('shell.panels.help.docsDesc')}
                    </p>
                  </div>
                </div>
              </Tile>

              <Tile style={{ padding: '0.75rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  {t('shell.panels.help.supportTitle')}
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>
                  {t('shell.panels.help.supportDesc')}
                </p>
              </Tile>

              <Tile style={{ padding: '0.75rem' }}>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  {t('shell.panels.help.shortcutsTitle')}
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>
                  {t('shell.panels.help.shortcutsDesc')}
                </p>
              </Tile>
            </div>
          )}
        </PanelContainer>
      )}

      {/* Settings Panel */}
      {activePanel === 'settings' && (
        <PanelContainer
          aria-label={t('shell.panels.settings.title')}
          expanded
          
          style={{
            inlineSize: '22rem',
            maxHeight: 'calc(100vh - 3rem)',
            overflowY: 'auto',
            borderInlineStart: dir === 'rtl' ? 'none' : '1px solid var(--cds-border-subtle)',
            borderInlineEnd: dir === 'rtl' ? '1px solid var(--cds-border-subtle)' : 'none',
          }}
        >
          {renderPanelHeader(t('shell.panels.settings.title'), 'settings')}
          {panelLoading.settings ? (
            <SettingsPanelSkeleton />
          ) : (
            <div
              style={{
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
              }}
            >
              {/* Appearance Theme */}
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.32px',
                    color: 'var(--cds-text-secondary)',
                    marginBottom: '0.75rem',
                  }}
                >
                  {t('shell.panels.settings.appearance')}
                </span>
                <RadioButtonGroup
                  name="theme-selection"
                  valueSelected={theme}
                  onChange={(val) => setTheme(val as 'white' | 'g100')}
                  orientation="vertical"
                >
                  <RadioButton
                    id="theme-white"
                    labelText={t('shell.panels.settings.themeLight')}
                    value="white"
                  />
                  <RadioButton
                    id="theme-g100"
                    labelText={t('shell.panels.settings.themeDark')}
                    value="g100"
                  />
                </RadioButtonGroup>
              </div>

              {/* Language & Direction */}
              <div
                style={{
                  borderTop: '1px solid var(--cds-border-subtle)',
                  paddingTop: '1.25rem',
                }}
              >
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.32px',
                    color: 'var(--cds-text-secondary)',
                    marginBottom: '0.75rem',
                  }}
                >
                  {t('shell.panels.settings.language')}
                </span>
                <RadioButtonGroup
                  name="language-selection"
                  valueSelected={language}
                  onChange={(val) => changeLanguage(val as string)}
                  orientation="vertical"
                >
                  <RadioButton
                    id="lang-en"
                    labelText={t('shell.panels.settings.langEn')}
                    value="en"
                  />
                  <RadioButton
                    id="lang-ar"
                    labelText={t('shell.panels.settings.langAr')}
                    value="ar"
                  />
                </RadioButtonGroup>
              </div>
            </div>
          )}
        </PanelContainer>
      )}

      {/* User Account Panel */}
      {activePanel === 'user' && (
        <PanelContainer
          aria-label={t('shell.panels.user.title')}
          expanded
          
          style={{
            inlineSize: '22rem',
            maxHeight: 'calc(100vh - 3rem)',
            overflowY: 'auto',
            borderInlineStart: dir === 'rtl' ? 'none' : '1px solid var(--cds-border-subtle)',
            borderInlineEnd: dir === 'rtl' ? '1px solid var(--cds-border-subtle)' : 'none',
          }}
        >
          {renderPanelHeader(t('shell.panels.user.title'))}
          <div
            style={{
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--cds-layer-accent-01)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--cds-text-primary)',
                  fontWeight: 600,
                  fontSize: '1.25rem',
                }}
              >
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: '1rem', margin: 0 }}>
                  {currentUser?.name || 'Administrator'}
                </p>
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--cds-text-secondary)',
                    margin: '2px 0 0 0',
                  }}
                >
                  {currentUser?.email || 'admin@schools.ibm.com'}
                </p>
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '0.375rem',
                    fontSize: '0.75rem',
                    backgroundColor: 'var(--cds-layer-02)',
                    padding: '2px 6px',
                    borderRadius: '2px',
                    color: 'var(--cds-text-secondary)',
                  }}
                >
                  {t('shell.panels.user.role')}
                </span>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--cds-border-subtle)', paddingTop: '1rem' }}>
              <Button
                kind="danger"
                size="md"
                renderIcon={Logout}
                onClick={handleLogout}
                style={{ width: '100%', justifyContent: 'flex-start' }}
              >
                {t('shell.panels.user.logout')}
              </Button>
            </div>
          </div>
        </PanelContainer>
      )}

      {/* Product Switcher Panel */}
      {activePanel === 'switcher' && (
        <PanelContainer
          aria-label={t('shell.panels.switcher.title')}
          expanded
          
          style={{
            inlineSize: '22rem',
            maxHeight: 'calc(100vh - 3rem)',
            overflowY: 'auto',
            borderInlineStart: dir === 'rtl' ? 'none' : '1px solid var(--cds-border-subtle)',
            borderInlineEnd: dir === 'rtl' ? '1px solid var(--cds-border-subtle)' : 'none',
          }}
        >
          {renderPanelHeader(t('shell.panels.switcher.title'))}
          <ProductSwitcher onItemClick={closePanel} />
        </PanelContainer>
      )}
    </div>
  );
}
