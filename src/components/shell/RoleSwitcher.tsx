import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tag } from '@carbon/react';
import {
  ChevronDown,
  Checkmark,
} from '@carbon/icons-react';
import { useAuth } from '../../auth/AuthProvider';
import { useLanguage } from '../../i18n/LanguageProvider';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import {
  getAllPortals,
  getPortalById,
  getPortalByPath,
  PortalDefinition,
} from '../../core/portals/portalRegistry';

export function RoleSwitcher() {
  const { activeRole, setActiveRole } = useAuth();
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const { isMobile } = useBreakpoint();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const portals = getAllPortals();

  // Automatically sync activeRole with location if pathname matches a portal route
  useEffect(() => {
    const matchedPortal = getPortalByPath(location.pathname);
    if (matchedPortal && matchedPortal.role !== activeRole) {
      setActiveRole(matchedPortal.role);
    }
  }, [location.pathname, activeRole, setActiveRole]);

  // Handle outside clicks and keyboard navigation
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

  const currentPortal = getPortalById(activeRole);
  const CurrentIcon = currentPortal.icon;

  const handlePortalSelect = (portal: PortalDefinition) => {
    setIsOpen(false);
    setActiveRole(portal.role);
    navigate(portal.basePath);
  };

  return (
    <div
      ref={containerRef}
      className="role-switcher-container"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        height: '100%',
      }}
    >
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('portals.switchPortal')}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: isMobile ? '0.25rem' : '0.5rem',
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
        <CurrentIcon size={18} style={{ color: 'var(--cds-icon-primary)', flexShrink: 0 }} />

        {!isMobile && (
          <>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                color: 'var(--cds-text-primary)',
              }}
            >
              {t(currentPortal.titleKey)}
            </span>

            <Tag type={currentPortal.tagType} size="sm" style={{ margin: 0 }}>
              {t(currentPortal.badgeKey)}
            </Tag>
          </>
        )}

        <ChevronDown
          size={14}
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            color: 'var(--cds-icon-secondary)',
            flexShrink: 0,
          }}
        />
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div
          className="role-switcher-dropdown-panel"
          style={
            isMobile
              ? {
                  position: 'fixed',
                  top: '3rem',
                  insetInlineStart: '0.5rem',
                  insetInlineEnd: '0.5rem',
                  width: 'auto',
                  maxHeight: 'calc(100dvh - 4rem)',
                  overflowY: 'auto',
                  backgroundColor: 'var(--cds-layer-01)',
                  border: '1px solid var(--cds-border-subtle)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.24)',
                  zIndex: 9999,
                  borderRadius: '0 0 4px 4px',
                  animation: 'fadeIn 0.15s ease',
                }
              : {
                  position: 'absolute',
                  top: '100%',
                  [dir === 'rtl' ? 'left' : 'right']: 0,
                  width: '320px',
                  backgroundColor: 'var(--cds-layer-01)',
                  border: '1px solid var(--cds-border-subtle)',
                  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.18)',
                  zIndex: 9999,
                  marginTop: '1px',
                  borderRadius: '0 0 4px 4px',
                  animation: 'fadeIn 0.15s ease',
                }
          }
        >
          {/* Header Title */}
          <div
            style={{
              padding: '0.75rem 1rem 0.5rem',
              borderBottom: '1px solid var(--cds-border-subtle)',
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--cds-text-secondary)',
            }}
          >
            {t('portals.switchPortal')}
          </div>

          {/* Portal List */}
          <div style={{ padding: '0.25rem 0' }}>
            {portals.map((portal) => {
              const IconComponent = portal.icon;
              const isSelected = portal.id === currentPortal.id;

              return (
                <button
                  key={portal.id}
                  type="button"
                  onClick={() => handlePortalSelect(portal)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    background: isSelected
                      ? 'var(--cds-layer-hover-01, var(--cds-background-hover))'
                      : 'none',
                    border: 'none',
                    textAlign: dir === 'rtl' ? 'right' : 'left',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                    outline: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--cds-background-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected
                      ? 'var(--cds-layer-hover-01, var(--cds-background-hover))'
                      : 'transparent';
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--cds-background-hover)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.backgroundColor = isSelected
                      ? 'var(--cds-layer-hover-01, var(--cds-background-hover))'
                      : 'transparent';
                  }}
                >
                  <div style={{ marginTop: '2px', flexShrink: 0 }}>
                    <IconComponent
                      size={18}
                      style={{
                        color: isSelected
                          ? 'var(--cds-link-primary)'
                          : 'var(--cds-icon-secondary)',
                      }}
                    />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '2px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: isSelected ? 600 : 500,
                          color: 'var(--cds-text-primary)',
                        }}
                      >
                        {t(portal.titleKey)}
                      </span>
                      <Tag
                        type={portal.tagType}
                        size="sm"
                        style={{ margin: 0, padding: '0 4px' }}
                      >
                        {t(portal.badgeKey)}
                      </Tag>
                    </div>

                    <div
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--cds-text-secondary)',
                        lineHeight: 1.3,
                      }}
                    >
                      {t(portal.subtitleKey)}
                    </div>
                  </div>

                  {isSelected && (
                    <div style={{ marginTop: '2px', flexShrink: 0 }}>
                      <Checkmark
                        size={16}
                        style={{ color: 'var(--cds-link-primary)' }}
                      />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
