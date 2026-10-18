import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Modal } from '@carbon/react';
import {
  Dashboard,
  Settings,
  Help,
  Copy,
  CheckmarkOutline,
  Time,
  Flash,
  ChevronRight,
  Keyboard,
} from '@carbon/icons-react';
import { useShell } from './ShellContext';
import { useTranslation } from 'react-i18next';

export function ShellContextMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [copied, setCopied] = useState(false);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  
  const navigate = useNavigate();
  const { togglePanel } = useShell();
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = useCallback((e: MouseEvent) => {
    // Avoid overriding context menu in input fields
    const target = e.target as HTMLElement;
    if (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target.isContentEditable ||
      isShortcutsModalOpen // Don't show context menu if modal is already open
    ) {
      return;
    }
    
    e.preventDefault();
    
    // Prevent menu from flowing off screen
    let x = e.clientX;
    let y = e.clientY;
    
    // Approximate menu dimensions
    const menuWidth = 240; 
    const menuHeight = 360; 

    if (x + menuWidth > window.innerWidth) x = window.innerWidth - menuWidth - 10;
    if (y + menuHeight > window.innerHeight) y = window.innerHeight - menuHeight - 10;

    setPosition({ x, y });
    setIsOpen(true);
    setCopied(false);
    setHoveredItem(null);
  }, [isShortcutsModalOpen]);

  const handleClick = useCallback((e: MouseEvent) => {
    if (isOpen) setIsOpen(false);
  }, [isOpen]);

  useEffect(() => {
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('click', handleClick);
    };
  }, [handleContextMenu, handleClick]);

  const copyUrlToClipboard = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setIsOpen(false), 800); // Close shortly after copying
    } catch (err) {
      console.error('Failed to copy URL: ', err);
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const MenuItem = ({ 
    icon: Icon, 
    label, 
    shortcut, 
    onClick,
    id,
    hasSubmenu = false
  }: { 
    icon: any, 
    label: string, 
    shortcut?: string, 
    onClick?: (e: React.MouseEvent) => void,
    id: string,
    hasSubmenu?: boolean
  }) => (
    <div
      onClick={onClick}
      onMouseEnter={() => setHoveredItem(id)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.5rem 1rem',
        cursor: 'pointer',
        backgroundColor: hoveredItem === id ? 'var(--cds-layer-hover-01, #e5e5e5)' : 'transparent',
        color: 'var(--cds-text-primary)',
        fontSize: '0.875rem',
        transition: 'background-color 0.1s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Icon size={16} style={{ fill: 'var(--cds-icon-secondary)' }} />
        <span>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {shortcut && (
          <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)' }}>
            {shortcut}
          </span>
        )}
        {hasSubmenu && <ChevronRight size={16} style={{ fill: 'var(--cds-icon-secondary)' }} />}
      </div>
    </div>
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={menuRef}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            style={{
              position: 'fixed',
              top: position.y,
              left: position.x,
              zIndex: 9999,
              backgroundColor: 'var(--cds-layer-01)',
              border: '1px solid var(--cds-border-subtle)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
              minWidth: '240px',
              padding: '0.5rem 0',
              userSelect: 'none',
            }}
          >
            <MenuItem 
              id="dashboard"
              icon={Dashboard} 
              label="Dashboard" 
              shortcut="Ctrl+D" 
              onClick={() => handleNavigate('/')} 
            />
            
            <div style={{ 
              height: '1px', 
              backgroundColor: 'var(--cds-border-subtle)', 
              margin: '0.25rem 0' 
            }} />

            {/* Dynamic Sub-menus pseudo-implementation */}
            <div style={{ position: 'relative' }}>
              <MenuItem 
                id="recent"
                icon={Time} 
                label="Recent Pages" 
                hasSubmenu 
              />
              {hoveredItem === 'recent' && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '100%',
                    backgroundColor: 'var(--cds-layer-01)',
                    border: '1px solid var(--cds-border-subtle)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    minWidth: '180px',
                    padding: '0.5rem 0',
                  }}
                >
                  <MenuItem id="r1" icon={Time} label="Students Management" onClick={() => handleNavigate('/students')} />
                  <MenuItem id="r2" icon={Time} label="Analytics Engine" onClick={() => handleNavigate('/reports')} />
                </motion.div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <MenuItem 
                id="actions"
                icon={Flash} 
                label="Quick Actions" 
                hasSubmenu 
              />
              {hoveredItem === 'actions' && (
                <motion.div
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '100%',
                    backgroundColor: 'var(--cds-layer-01)',
                    border: '1px solid var(--cds-border-subtle)',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    minWidth: '180px',
                    padding: '0.5rem 0',
                  }}
                >
                  <MenuItem id="q1" icon={Flash} label="New Enrollment" onClick={() => handleNavigate('/students/new')} />
                  <MenuItem id="q2" icon={Flash} label="Refresh Data" shortcut="R" onClick={() => window.location.reload()} />
                </motion.div>
              )}
            </div>

            <div style={{ 
              height: '1px', 
              backgroundColor: 'var(--cds-border-subtle)', 
              margin: '0.25rem 0' 
            }} />

            <MenuItem 
              id="settings"
              icon={Settings} 
              label="System Settings" 
              onClick={() => handleNavigate('/settings')} 
            />
            <MenuItem 
              id="shortcuts"
              icon={Keyboard} 
              label="Keyboard Shortcuts" 
              onClick={(e) => {
                e.stopPropagation();
                setIsShortcutsModalOpen(true);
                setIsOpen(false);
              }} 
            />
            <MenuItem 
              id="help"
              icon={Help} 
              label="Help & Support" 
              onClick={() => togglePanel('help')} 
            />

            <div style={{ 
              height: '1px', 
              backgroundColor: 'var(--cds-border-subtle)', 
              margin: '0.25rem 0' 
            }} />

            <MenuItem 
              id="copy"
              icon={copied ? CheckmarkOutline : Copy} 
              label={copied ? "Copied!" : "Copy Current URL"} 
              onClick={copyUrlToClipboard} 
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        open={isShortcutsModalOpen}
        onRequestClose={() => setIsShortcutsModalOpen(false)}
        modalHeading="Keyboard Shortcuts"
        passiveModal
        size="sm"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
          {[
            { action: 'Global Search / Focus Search', keys: 'Ctrl + K' },
            { action: 'Navigate to Dashboard', keys: 'Ctrl + D' },
            { action: 'Refresh Data', keys: 'R' },
          ].map((shortcut, index) => (
            <div 
              key={index} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem 0',
                borderBottom: '1px solid var(--cds-border-subtle)' 
              }}
            >
              <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-primary)' }}>
                {shortcut.action}
              </span>
              <span 
                style={{ 
                  backgroundColor: 'var(--cds-layer-02)', 
                  padding: '0.25rem 0.5rem', 
                  borderRadius: '4px', 
                  fontFamily: 'monospace',
                  fontSize: '0.75rem',
                  color: 'var(--cds-text-secondary)',
                  border: '1px solid var(--cds-border-subtle)'
                }}
              >
                {shortcut.keys}
              </span>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
