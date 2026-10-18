/**
 * ModuleTabs Component
 * Strictly adheres to IBM Carbon Design System Tab standards.
 * Dynamically renders sub-entity navigation with lazy loading of secondary panels,
 * badge counters, domain status indicators, and keyboard accessibility.
 */

import React, { useState, useMemo, useEffect } from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel, Tag } from '@carbon/react';
import { Catalog } from '@carbon/icons-react';

export interface SubEntityTabDefinition {
  id: string;
  name: string;
  label: string;
  labelPlural?: string;
  icon?: React.ComponentType<any>;
  count?: number;
  isPrimary?: boolean;
  disabled?: boolean;
  contentRenderer?: () => React.ReactNode;
}

export interface ModuleTabsProps {
  tabs: SubEntityTabDefinition[];
  activeTabId?: string;
  onTabChange?: (tabId: string, index: number) => void;
  lazyLoadSecondary?: boolean;
  className?: string;
  children?: (activeTab: SubEntityTabDefinition, isLazyLoaded: boolean) => React.ReactNode;
}

export function ModuleTabs({
  tabs,
  activeTabId,
  onTabChange,
  lazyLoadSecondary = true,
  className = '',
  children,
}: ModuleTabsProps) {
  // Find initial active index
  const initialIndex = useMemo(() => {
    if (!activeTabId) return 0;
    const found = tabs.findIndex((t) => t.id === activeTabId || t.name === activeTabId);
    return found >= 0 ? found : 0;
  }, [activeTabId, tabs]);

  const [selectedIndex, setSelectedIndex] = useState<number>(initialIndex);

  // Sync state if activeTabId prop changes from parent
  useEffect(() => {
    if (activeTabId) {
      const found = tabs.findIndex((t) => t.id === activeTabId || t.name === activeTabId);
      if (found >= 0 && found !== selectedIndex) {
        setSelectedIndex(found);
        if (tabs[found]) {
          setVisitedTabIds((prev) => new Set(prev).add(tabs[found].id));
        }
      }
    }
  }, [activeTabId, tabs]);

  // Keep track of which tabs have been mounted/visited to support lazy loading
  const [visitedTabIds, setVisitedTabIds] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (tabs[initialIndex]) {
      initial.add(tabs[initialIndex].id);
    }
    return initial;
  });

  const handleSelectTab = (event: any) => {
    const idx = typeof event === 'number' ? event : (event?.selectedIndex ?? 0);
    setSelectedIndex(idx);
    const selectedTab = tabs[idx];
    if (selectedTab) {
      setVisitedTabIds((prev) => new Set(prev).add(selectedTab.id));
      if (onTabChange) {
        onTabChange(selectedTab.id, idx);
      }
    }
  };

  const activeTab = tabs[selectedIndex] || tabs[0];

  return (
    <div className={`schools-module-tabs ${className}`}>
      <Tabs selectedIndex={selectedIndex} onChange={handleSelectTab}>
        <TabList aria-label="Sub-entity navigation tabs" contained>
          {tabs.map((tab) => {
            const Icon = tab.icon || Catalog;
            return (
              <Tab
                key={tab.id}
                disabled={tab.disabled}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Icon size={16} />
                  <span>{tab.labelPlural || tab.label}</span>
                  {typeof tab.count === 'number' && (
                    <span
                      style={{
                        padding: '0.1rem 0.4rem',
                        borderRadius: '10px',
                        fontSize: '0.7rem',
                        backgroundColor: 'var(--cds-layer-02, #e0e0e0)',
                        color: 'var(--cds-text-secondary)',
                        fontWeight: 600,
                        marginLeft: '0.25rem',
                      }}
                    >
                      {tab.count}
                    </span>
                  )}
                  {tab.isPrimary && (
                    <Tag size="sm" type="cyan" style={{ marginLeft: '0.25rem' }}>
                      Primary
                    </Tag>
                  )}
                </div>
              </Tab>
            );
          })}
        </TabList>

        <TabPanels>
          {tabs.map((tab, idx) => {
            const isTabActive = idx === selectedIndex;
            const hasBeenVisited = visitedTabIds.has(tab.id);

            // If lazy loading is enabled and tab has never been activated, don't mount inner heavy UI
            const shouldRenderContent = !lazyLoadSecondary || isTabActive || hasBeenVisited;

            return (
              <TabPanel key={tab.id} style={{ padding: '1rem 0' }}>
                {shouldRenderContent ? (
                  children ? (
                    children(tab, hasBeenVisited)
                  ) : tab.contentRenderer ? (
                    tab.contentRenderer()
                  ) : (
                    <div style={{ padding: '1.5rem', color: 'var(--cds-text-secondary)' }}>
                      Sub-entity view: {tab.labelPlural || tab.label}
                    </div>
                  )
                ) : (
                  <div style={{ minHeight: '120px' }} />
                )}
              </TabPanel>
            );
          })}
        </TabPanels>
      </Tabs>
    </div>
  );
}
