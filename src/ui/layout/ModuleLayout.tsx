import React from 'react';
import { Grid, Column, Tile } from '@carbon/react';
import { ModuleHeader, ModuleHeaderProps } from './ModuleHeader';

export interface ModuleKpiTile {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
  subtitle?: string;
  icon?: React.ComponentType<any>;
  tag?: { label: string; type?: 'teal' | 'green' | 'blue' | 'purple' | 'red' | 'gray' };
}

export interface ModuleLayoutProps {
  /** Header configuration or custom node */
  headerProps?: ModuleHeaderProps;
  customHeader?: React.ReactNode;
  /** Optional top KPI stat summary tiles */
  kpiTiles?: ModuleKpiTile[];
  /** Optional filter bar or secondary control row */
  filterBar?: React.ReactNode;
  /** Layout content width: full | wide | default | narrow */
  contentWidth?: 'full' | 'wide' | 'default' | 'narrow';
  /** Main module content */
  children: React.ReactNode;
  /** Custom class name */
  className?: string;
}

export function ModuleLayout({
  headerProps,
  customHeader,
  kpiTiles = [],
  filterBar,
  contentWidth = 'full',
  children,
  className = '',
}: ModuleLayoutProps) {
  // Determine Column Spans
  const getColSpan = () => {
    switch (contentWidth) {
      case 'narrow':
        return { sm: 4, md: 6, lg: 8, offsetLg: 4 };
      case 'wide':
        return { sm: 4, md: 8, lg: 16 };
      case 'full':
        return { sm: 4, md: 8, lg: 16 };
      case 'default':
      default:
        return { sm: 4, md: 8, lg: 12 };
    }
  };

  const colProps = getColSpan();

  return (
    <div
      className={`module-layout-root cds-flex cds-flex-col ${className}`}
      style={{ minHeight: '100%', width: '100%', boxSizing: 'border-box' }}
    >
      {/* 1. Header (ModuleHeader or Custom) */}
      {customHeader ? (
        customHeader
      ) : headerProps ? (
        <ModuleHeader {...headerProps} />
      ) : null}

      {/* 2. Top KPI Summary Tiles (if provided) */}
      {kpiTiles.length > 0 && (
        <div className="module-kpi-wrapper" style={{ marginBottom: '1.25rem' }}>
          <Grid style={{ padding: 0, margin: 0 }}>
            {kpiTiles.map((kpi) => {
              const KpiIcon = kpi.icon;
              // Distribute columns evenly across 4 or fewer items
              const lgSpan = kpiTiles.length <= 2 ? 8 : kpiTiles.length === 3 ? 5 : 4;
              return (
                <Column key={kpi.id} sm={4} md={4} lg={lgSpan} style={{ marginBottom: '1rem' }}>
                  <Tile
                    style={{
                      height: '100%',
                      backgroundColor: 'var(--cds-layer-01)',
                      border: '1px solid var(--cds-border-subtle)',
                      borderRadius: '2px',
                      padding: '1.25rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div className="cds-flex cds-items-center cds-justify-between" style={{ marginBottom: '0.5rem' }}>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--cds-text-secondary)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.32px',
                        }}
                      >
                        {kpi.title}
                      </span>
                      {KpiIcon && (
                        <div
                          style={{
                            padding: '0.375rem',
                            backgroundColor: 'var(--cds-layer-02)',
                            borderRadius: '2px',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <KpiIcon size={16} style={{ fill: 'var(--cds-icon-primary)' }} />
                        </div>
                      )}
                    </div>

                    <div className="cds-flex cds-items-baseline cds-justify-between cds-gap-02">
                      <span
                        style={{
                          fontSize: '2rem',
                          fontWeight: 400,
                          color: 'var(--cds-text-primary)',
                          lineHeight: 1,
                        }}
                      >
                        {kpi.value}
                      </span>

                      {kpi.change && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: kpi.isPositive ? 'var(--cds-support-success)' : 'var(--cds-support-error)',
                          }}
                        >
                          {kpi.change}
                        </span>
                      )}
                    </div>

                    {kpi.subtitle && (
                      <span
                        style={{
                          fontSize: '0.75rem',
                          color: 'var(--cds-text-helper)',
                          marginTop: '0.5rem',
                        }}
                      >
                        {kpi.subtitle}
                      </span>
                    )}
                  </Tile>
                </Column>
              );
            })}
          </Grid>
        </div>
      )}

      {/* 3. Optional Filter Bar */}
      {filterBar && (
        <div className="module-filter-wrapper" style={{ marginBottom: '1rem' }}>
          {filterBar}
        </div>
      )}

      {/* 4. Main Content Body */}
      <main
        className="module-main-content"
        style={{
          flex: 1,
          paddingBottom: '2rem',
          boxSizing: 'border-box',
          width: '100%',
        }}
      >
        {contentWidth === 'full' ? (
          children
        ) : (
          <Grid style={{ padding: 0, margin: 0 }}>
            <Column
              sm={colProps.sm}
              md={colProps.md}
              lg={colProps.lg}
              {...(colProps.offsetLg ? { lg: { span: colProps.lg, offset: colProps.offsetLg } } : {})}
            >
              {children}
            </Column>
          </Grid>
        )}
      </main>
    </div>
  );
}
