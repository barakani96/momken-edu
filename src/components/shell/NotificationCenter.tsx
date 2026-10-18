import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  HeaderGlobalAction,
  HeaderPanel,
  Tile,
  Button,
} from '@carbon/react';
import { Notification, NotificationNew, Information, Checkmark, Warning } from '@carbon/icons-react';
import { useNotification, Alert } from '../../core/notifications/NotificationContext';
import { useLanguage } from '../../i18n/LanguageProvider';
import { useBreakpoint } from '../../hooks/useBreakpoint';

const PanelContainer = HeaderPanel as any;

export function NotificationCenter() {
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const { isMobile } = useBreakpoint();
  const { alerts, markAsRead, markAllAsRead } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = alerts.filter(a => !a.read).length;
  const hasUnread = unreadCount > 0;

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        // Also check if the click was on the toggle button
        const isToggleButton = (event.target as Element).closest('[aria-label="Notifications"]');
        if (!isToggleButton) {
          setIsOpen(false);
        }
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const getIconForKind = (kind: string) => {
    switch (kind) {
      case 'info':
      case 'info-square':
        return <Information size={18} style={{ color: 'var(--cds-support-info)' }} />;
      case 'success':
        return <Checkmark size={18} style={{ color: 'var(--cds-support-success)' }} />;
      case 'warning':
      case 'warning-alt':
        return <Warning size={18} style={{ color: 'var(--cds-support-warning)' }} />;
      case 'error':
        return <Warning size={18} style={{ color: 'var(--cds-support-error)' }} />;
      default:
        return <Information size={18} style={{ color: 'var(--cds-support-info)' }} />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hr ago`;
    return `${diffDays} days ago`;
  };

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      <HeaderGlobalAction
        aria-label="Notifications"
        onClick={togglePanel}
        isActive={isOpen}
        tooltipAlignment="center"
      >
        {hasUnread ? <NotificationNew size={20} /> : <Notification size={20} />}
      </HeaderGlobalAction>

      {isOpen && (
        <div
          style={
            isMobile
              ? {
                  position: 'fixed',
                  top: '3rem',
                  insetInlineStart: 0,
                  insetInlineEnd: 0,
                  zIndex: 10000,
                }
              : {
                  position: 'absolute',
                  top: '100%',
                  right: dir === 'rtl' ? 'auto' : 0,
                  left: dir === 'rtl' ? 0 : 'auto',
                  zIndex: 10000,
                }
          }
        >
          <PanelContainer
            aria-label="Notifications Panel"
            expanded={isOpen}
            style={{
              position: 'relative',
              right: 0,
              top: 0,
              width: isMobile ? '100vw' : '22rem',
              maxWidth: '100vw',
              maxHeight: 'calc(100dvh - 3rem)',
              overflowY: 'auto',
              borderInlineStart: dir === 'rtl' ? 'none' : '1px solid var(--cds-border-subtle)',
              borderInlineEnd: dir === 'rtl' ? '1px solid var(--cds-border-subtle)' : 'none',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--cds-border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: 0 }}>Notifications</h3>
              {hasUnread && (
                <span style={{ fontSize: '0.75rem', backgroundColor: 'var(--cds-support-info)', color: '#fff', padding: '0.125rem 0.5rem', borderRadius: '1rem' }}>
                  {unreadCount} New
                </span>
              )}
            </div>
            
            <div
              style={{
                padding: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {alerts.length === 0 ? (
                <p style={{ color: 'var(--cds-text-secondary)', textAlign: 'center', padding: '2rem 0' }}>No notifications</p>
              ) : (
                alerts.map((alert: Alert) => (
                  <Tile
                    key={alert.id}
                    style={{
                      padding: '0.75rem',
                      borderInlineStart: !alert.read ? '3px solid var(--cds-support-info)' : '3px solid transparent',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      if (!alert.read) markAsRead(alert.id);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div style={{ marginTop: '2px', flexShrink: 0 }}>
                        {getIconForKind(alert.kind)}
                      </div>
                      <div style={{ flexGrow: 1 }}>
                        <p style={{ fontWeight: !alert.read ? 600 : 400, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                          {alert.title}
                        </p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginBottom: '0.5rem' }}>
                          {alert.subtitle}
                        </p>
                        <span style={{ fontSize: '0.675rem', color: 'var(--cds-text-placeholder)' }}>
                          {formatTime(alert.timestamp)}
                        </span>
                      </div>
                    </div>
                  </Tile>
                ))
              )}
              {alerts.length > 0 && (
                <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                  <Button kind="ghost" size="sm" style={{ width: '100%' }} onClick={() => markAllAsRead()}>
                    Mark all as read
                  </Button>
                </div>
              )}
            </div>
          </PanelContainer>
        </div>
      )}
    </div>
  );
}
