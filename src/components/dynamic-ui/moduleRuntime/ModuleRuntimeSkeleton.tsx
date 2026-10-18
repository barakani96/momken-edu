/**
 * Global Skeleton Screen Component for Module Runtime Page
 * Strictly adheres to IBM Carbon Design System skeleton tokens and layouts,
 * eliminating layout shift while sub-entities, configurations, and remote records resolve.
 */

import React from 'react';
import {
  DataTableSkeleton,
  SkeletonText,
  SkeletonPlaceholder,
  Tile,
} from '@carbon/react';
import { ResponsiveGrid } from '../../../ui/layout/ResponsiveGrid';

export interface ModuleRuntimeSkeletonProps {
  showKpis?: boolean;
  columnCount?: number;
  rowCount?: number;
  className?: string;
}

export function ModuleRuntimeSkeleton({
  showKpis = true,
  columnCount = 5,
  rowCount = 6,
  className = '',
}: ModuleRuntimeSkeletonProps) {
  return (
    <div className={`module-runtime-skeleton cds-theme-container ${className}`} style={{ padding: '1.5rem' }}>
      {/* 1. Header & Navigation Breadcrumb Skeleton */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <SkeletonText width="60px" />
          <span style={{ color: 'var(--cds-text-muted)' }}>/</span>
          <SkeletonText width="90px" />
          <span style={{ color: 'var(--cds-text-muted)' }}>/</span>
          <SkeletonText width="120px" />
        </div>

        {/* Title & Actions Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '1px solid var(--cds-border-subtle)',
            paddingBottom: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <SkeletonPlaceholder style={{ width: '40px', height: '40px' }} />
            <div>
              <div style={{ marginBottom: '0.25rem' }}>
                <SkeletonText heading width="220px" />
              </div>
              <SkeletonText width="320px" />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <SkeletonPlaceholder style={{ width: '90px', height: '32px' }} />
            <SkeletonPlaceholder style={{ width: '110px', height: '32px' }} />
          </div>
        </div>
      </div>

      {/* 2. Sub-Entity Navigation Tabs Skeleton */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          borderBottom: '1px solid var(--cds-border-subtle)',
          marginBottom: '1.5rem',
          paddingBottom: '0.5rem',
        }}
      >
        <SkeletonText width="80px" />
        <SkeletonText width="100px" />
        <SkeletonText width="90px" />
        <SkeletonText width="75px" />
      </div>

      {/* 3. KPI Metric Cards Skeleton (optional) */}
      {showKpis && (
        <div style={{ marginBottom: '1.5rem' }}>
          <ResponsiveGrid columns={{ sm: 1, md: 2, lg: 4, xlg: 4 }} gap="spacing05">
            {[1, 2, 3, 4].map((idx) => (
              <Tile key={idx} className="cds-tile-responsive" style={{ padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <SkeletonText width="80px" />
                  <SkeletonPlaceholder style={{ width: '20px', height: '20px', borderRadius: '50%' }} />
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <SkeletonText heading width="70px" />
                </div>
                <SkeletonText width="110px" />
              </Tile>
            ))}
          </ResponsiveGrid>
        </div>
      )}

      {/* 4. Table Grid Skeleton */}
      <div
        style={{
          backgroundColor: 'var(--cds-layer-01)',
          border: '1px solid var(--cds-border-subtle)',
        }}
      >
        <DataTableSkeleton
          columnCount={columnCount}
          rowCount={rowCount}
          headers={[
            { key: 'col1', header: 'Identifier' },
            { key: 'col2', header: 'Title / Name' },
            { key: 'col3', header: 'Category' },
            { key: 'col4', header: 'Status' },
            { key: 'col5', header: 'Actions' },
          ]}
          showHeader
          showToolbar
        />
      </div>
    </div>
  );
}
