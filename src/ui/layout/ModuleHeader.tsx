import React from 'react';
import {
  Tag,
  Tabs,
  TabList,
  Tab,
  Button,
  IconButton,
  Tooltip,
} from '@carbon/react';
import {
  Add,
  Renew,
  Export,
  Settings,
  Table,
  Grid,
  List,
  Filter,
} from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { BreadcrumbPath, PageHeader } from './PageHeader';

export type DataViewMode = 'table' | 'cards' | 'list';

export interface ModuleHeaderTab {
  id: string;
  label: string;
  count?: number;
  icon?: React.ComponentType<any>;
}

export interface ModuleHeaderKpi {
  label: string;
  value: string | number;
  type?: 'teal' | 'blue' | 'green' | 'gray' | 'purple' | 'red' | 'warm-gray';
}

export interface ModuleHeaderProps {
  /** Module Title (e.g. "Students", "Course Management") */
  title: string;
  /** Subtitle / Description */
  description?: string;
  /** Category badge (e.g. "Academic", "Operations", "System") */
  category?: string;
  /** Breadcrumb navigation */
  breadcrumbs?: BreadcrumbPath[];
  /** Optional icon for module */
  icon?: React.ComponentType<any>;
  /** Active Tab Index */
  activeTab?: number;
  /** Tabs list (e.g. Records, Analytics, Reports, Settings) */
  tabs?: ModuleHeaderTab[];
  /** Tab switch callback */
  onTabChange?: (tabIndex: number, tabId: string) => void;
  /** Active View Mode (table | cards | list) */
  viewMode?: DataViewMode;
  /** View mode switch callback */
  onViewModeChange?: (mode: DataViewMode) => void;
  /** Summary KPI chips */
  kpis?: ModuleHeaderKpi[];
  /** Primary Action Button (e.g., Create Record) */
  primaryActionLabel?: string;
  onPrimaryAction?: () => void;
  /** Optional secondary actions */
  onRefresh?: () => void;
  onExport?: () => void;
  onSettings?: () => void;
  onFilterToggle?: () => void;
  isFilterActive?: boolean;
  isLoading?: boolean;
  /** Custom extra actions */
  extraActions?: React.ReactNode;
  className?: string;
}

export function ModuleHeader({
  title,
  description,
  category,
  breadcrumbs,
  icon: ModuleIcon,
  activeTab = 0,
  tabs = [],
  onTabChange,
  viewMode,
  onViewModeChange,
  kpis = [],
  primaryActionLabel,
  onPrimaryAction,
  onRefresh,
  onExport,
  onSettings,
  onFilterToggle,
  isFilterActive = false,
  isLoading = false,
  extraActions,
  className = '',
}: ModuleHeaderProps) {
  const { t } = useTranslation();

  return (
    <header
      className={`module-header-container cds-flex cds-flex-col ${className}`}
      style={{
        backgroundColor: 'var(--cds-layer-01)',
        borderBottom: '1px solid var(--cds-border-subtle)',
        padding: '1.25rem 1.25rem 0.5rem 1.25rem',
        marginBottom: '1rem',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Breadcrumb Bar */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div style={{ marginBottom: '0.75rem' }}>
          <PageHeader title="" breadcrumbs={breadcrumbs} />
        </div>
      )}

      {/* Main Title & Action Bar Row */}
      <div className="cds-flex cds-items-start cds-justify-between cds-gap-04 cds-flex-wrap" style={{ marginBottom: '1rem' }}>
        {/* Left: Icon, Category Badge, Title, Description */}
        <div className="cds-flex cds-items-start cds-gap-03" style={{ minWidth: 0, flex: '1 1 20rem' }}>
          {ModuleIcon && (
            <div
              className="module-header-icon-box cds-flex cds-items-center cds-justify-center"
              style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: 'var(--cds-layer-02)',
                borderRadius: '4px',
                border: '1px solid var(--cds-border-subtle)',
                flexShrink: 0,
                marginTop: '0.125rem',
              }}
            >
              <ModuleIcon size={24} style={{ fill: 'var(--cds-icon-primary)' }} />
            </div>
          )}

          <div style={{ minWidth: 0 }}>
            <div className="cds-flex cds-items-center cds-gap-02 cds-flex-wrap" style={{ marginBottom: '0.25rem' }}>
              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 400,
                  color: 'var(--cds-text-primary)',
                  margin: 0,
                  lineHeight: 1.25,
                }}
              >
                {title}
              </h1>
              {category && (
                <Tag type="teal" size="sm" style={{ margin: 0 }}>
                  {category}
                </Tag>
              )}
            </div>

            {description && (
              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--cds-text-secondary)',
                  margin: 0,
                  lineHeight: 1.4,
                  maxWidth: '48rem',
                }}
              >
                {description}
              </p>
            )}

            {/* KPI Summary Chips Row */}
            {kpis.length > 0 && (
              <div className="cds-flex cds-items-center cds-gap-02 cds-flex-wrap" style={{ marginTop: '0.625rem' }}>
                {kpis.map((kpi, idx) => (
                  <Tag key={idx} type={kpi.type || 'gray'} size="sm">
                    <strong>{kpi.value}</strong> {kpi.label}
                  </Tag>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Actions & View Switcher */}
        <div className="cds-flex cds-items-center cds-gap-02 cds-flex-wrap" style={{ alignSelf: 'flex-start' }}>
          {/* View Switcher (Table / Cards / List) */}
          {viewMode && onViewModeChange && (
            <div
              className="module-view-switcher cds-flex cds-items-center"
              style={{
                backgroundColor: 'var(--cds-layer-02)',
                border: '1px solid var(--cds-border-subtle)',
                borderRadius: '2px',
                padding: '2px',
              }}
            >
              <Tooltip align="bottom" label="Table / Grid View">
                <Button
                  hasIconOnly
                  renderIcon={Table}
                  iconDescription="Table View"
                  kind={viewMode === 'table' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('table')}
                  style={{ width: '2rem', height: '2rem', minWidth: '2rem' }}
                />
              </Tooltip>

              <Tooltip align="bottom" label="Cards / Tile View">
                <Button
                  hasIconOnly
                  renderIcon={Grid}
                  iconDescription="Cards View"
                  kind={viewMode === 'cards' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('cards')}
                  style={{ width: '2rem', height: '2rem', minWidth: '2rem' }}
                />
              </Tooltip>

              <Tooltip align="bottom" label="Compact List View">
                <Button
                  hasIconOnly
                  renderIcon={List}
                  iconDescription="List View"
                  kind={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => onViewModeChange('list')}
                  style={{ width: '2rem', height: '2rem', minWidth: '2rem' }}
                />
              </Tooltip>
            </div>
          )}

          {/* Quick Filter Toggle */}
          {onFilterToggle && (
            <Tooltip align="bottom" label="Filter Records">
              <Button
                hasIconOnly
                renderIcon={Filter}
                iconDescription="Filter"
                kind={isFilterActive ? 'secondary' : 'ghost'}
                size="md"
                onClick={onFilterToggle}
                style={{ width: '2.5rem', minWidth: '2.5rem' }}
              />
            </Tooltip>
          )}

          {/* Refresh Action */}
          {onRefresh && (
            <Tooltip align="bottom" label="Refresh Data">
              <Button
                hasIconOnly
                renderIcon={Renew}
                iconDescription="Refresh"
                kind="ghost"
                size="md"
                disabled={isLoading}
                onClick={onRefresh}
                style={{ width: '2.5rem', minWidth: '2.5rem' }}
              />
            </Tooltip>
          )}

          {/* Export Action */}
          {onExport && (
            <Tooltip align="bottom" label="Export Data">
              <Button
                hasIconOnly
                renderIcon={Export}
                iconDescription="Export"
                kind="ghost"
                size="md"
                onClick={onExport}
                style={{ width: '2.5rem', minWidth: '2.5rem' }}
              />
            </Tooltip>
          )}

          {/* Settings Action */}
          {onSettings && (
            <Tooltip align="bottom" label="Module Settings">
              <Button
                hasIconOnly
                renderIcon={Settings}
                iconDescription="Settings"
                kind="ghost"
                size="md"
                onClick={onSettings}
                style={{ width: '2.5rem', minWidth: '2.5rem' }}
              />
            </Tooltip>
          )}

          {extraActions}

          {/* Primary Create / Add Button */}
          {primaryActionLabel && onPrimaryAction && (
            <Button
              renderIcon={Add}
              kind="primary"
              size="md"
              onClick={onPrimaryAction}
            >
              {primaryActionLabel}
            </Button>
          )}
        </div>
      </div>

      {/* Bottom Tabs Navigation */}
      {tabs.length > 0 && (
        <div style={{ marginTop: '0.5rem', width: '100%' }}>
          <Tabs
            selectedIndex={activeTab}
            onChange={(evt: any) => {
              if (onTabChange) {
                const selectedIndex = typeof evt === 'number' ? evt : (evt?.selectedIndex ?? 0);
                const tabId = tabs[selectedIndex]?.id || '';
                onTabChange(selectedIndex, tabId);
              }
            }}
          >
            <TabList aria-label={`${title} Module Navigation`} contained={false}>
              {tabs.map((tab) => {
                const TabIcon = tab.icon;
                return (
                  <Tab key={tab.id}>
                    <span className="cds-flex cds-items-center cds-gap-02">
                      {TabIcon && <TabIcon size={16} />}
                      <span>{tab.label}</span>
                      {tab.count !== undefined && (
                        <Tag type="gray" size="sm" style={{ marginLeft: '0.25rem', padding: '0 0.375rem' }}>
                          {tab.count}
                        </Tag>
                      )}
                    </span>
                  </Tab>
                );
              })}
            </TabList>
          </Tabs>
        </div>
      )}
    </header>
  );
}
