import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Tag, Theme } from '@carbon/react';
import { Logout, Settings, UserAvatar } from '@carbon/icons-react';
import { useAuth } from '../../auth/AuthProvider';
import { useLanguage } from '../../i18n/LanguageProvider';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export function UserProfile() {
  const { currentUser, logout } = useAuth();
  const { i18n, t } = useTranslation();
  const { dir } = useLanguage();
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isAr = i18n.language === 'ar';

  // Toggle dropdown
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    setIsOpen(false);
    navigate('/settings');
  };

  // Extract initials
  const userName = currentUser?.name || (isAr ? 'مدير النظام' : 'Platform Admin');
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const userEmail = currentUser?.email || 'admin@schools.ibm.com';
  const userRole = isAr ? 'مشرف عام' : 'SUPERADMIN';

  const tLabel = (enText: string, arText: string) => (isAr ? arText : enText);

  return (
    <div
      ref={containerRef}
      className="user-profile-menu-container"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        height: '100%',
      }}
    >
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={tLabel('User options menu', 'قائمة خيارات المستخدم')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          background: 'none',
          border: 'none',
          padding: isMobile ? '0 0.5rem' : '0 0.75rem',
          minWidth: '2.75rem',
          height: '100%',
          cursor: 'pointer',
          color: 'var(--cds-text-primary)',
          transition: 'background-color 0.15s ease',
          outline: 'none',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--cds-background-hover)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
        }}
        onFocus={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--cds-background-hover)';
          e.currentTarget.style.boxShadow = 'inset 0 0 0 2px var(--cds-focus)';
        }}
        onBlur={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {/* Styled Avatar Circle with initials */}
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--cds-button-primary)',
            color: 'var(--cds-text-on-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.75rem',
            fontWeight: 600,
            letterSpacing: '0.5px',
            flexShrink: 0,
          }}
        >
          {userInitials}
        </div>

        {/* User Name text (hidden on mobile screens for responsiveness) */}
        {!isMobile && (
          <span
            className="user-profile-display-name"
            style={{
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--cds-text-primary)',
              maxWidth: '120px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {userName}
          </span>
        )}
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div
          className="user-profile-dropdown-panel"
          style={
            isMobile
              ? {
                  position: 'fixed',
                  top: '3rem',
                  insetInlineEnd: '0.5rem',
                  width: 'min(260px, calc(100vw - 1rem))',
                  backgroundColor: 'var(--cds-layer-01)',
                  border: '1px solid var(--cds-border-subtle)',
                  boxShadow: '0 6px 20px rgba(0, 0, 0, 0.22)',
                  zIndex: 9999,
                  animation: 'fadeIn 0.1s ease',
                }
              : {
                  position: 'absolute',
                  top: '100%',
                  [dir === 'rtl' ? 'left' : 'right']: 0,
                  width: '240px',
                  backgroundColor: 'var(--cds-layer-01)',
                  border: '1px solid var(--cds-border-subtle)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                  zIndex: 9999,
                  marginTop: '1px',
                  animation: 'fadeIn 0.1s ease',
                }
          }
        >
          {/* User Info Header Block */}
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid var(--cds-border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.375rem',
            }}
          >
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--cds-text-primary)', wordBreak: 'break-all' }}>
              {userName}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', wordBreak: 'break-all' }}>
              {userEmail}
            </div>
            <div style={{ marginTop: '0.25rem' }}>
              <Tag type="blue" size="sm" style={{ margin: 0 }}>
                {userRole}
              </Tag>
            </div>
          </div>

          {/* Action List Items */}
          <div style={{ padding: '0.25rem 0' }}>
            <button
              onClick={handleSettings}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'none',
                border: 'none',
                textAlign: dir === 'rtl' ? 'right' : 'left',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--cds-text-secondary)',
                transition: 'background-color 0.15s ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--cds-background-hover)';
                e.currentTarget.style.color = 'var(--cds-text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--cds-text-secondary)';
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--cds-background-hover)';
                e.currentTarget.style.color = 'var(--cds-text-primary)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = 'var(--cds-text-secondary)';
              }}
            >
              <Settings size={16} />
              <span>{tLabel('Account Settings', 'إعدادات الحساب')}</span>
            </button>

            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                background: 'none',
                border: 'none',
                textAlign: dir === 'rtl' ? 'right' : 'left',
                cursor: 'pointer',
                fontSize: '0.875rem',
                color: 'var(--cds-support-error)',
                borderTop: '1px solid var(--cds-border-subtle)',
                transition: 'background-color 0.15s ease',
                outline: 'none',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--cds-background-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onFocus={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--cds-background-hover)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Logout size={16} />
              <span>{tLabel('Logout', 'تسجيل الخروج')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
