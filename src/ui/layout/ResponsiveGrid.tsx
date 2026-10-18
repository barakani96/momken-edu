import React from 'react';
import { CarbonBreakpoint } from '../design-system/tokens/breakpoints';
import { SpacingKey, spacingVars } from '../design-system/tokens/spacing';

export interface ResponsiveGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Number of columns across breakpoints: default is 1 (sm), 2 (md), 3 (lg), 4 (xlg) */
  columns?: Partial<Record<CarbonBreakpoint, number>>;
  /** Spacing gap token between grid items: default is 'spacing05' (1rem/16px) */
  gap?: SpacingKey;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Mobile-first responsive Grid component utilizing IBM Carbon Design System tokens.
 * Automatically adapts column counts per Carbon breakpoint with consistent spacing.
 */
export function ResponsiveGrid({
  children,
  columns = { sm: 1, md: 2, lg: 3, xlg: 4 },
  gap = 'spacing05',
  className = '',
  style,
  ...rest
}: ResponsiveGridProps) {
  const gapValue = spacingVars[gap] || 'var(--cds-spacing-05, 1rem)';

  const gridClass = [
    'cds-responsive-grid-container',
    columns.sm ? `cols-sm-${columns.sm}` : 'cols-sm-1',
    columns.md ? `cols-md-${columns.md}` : 'cols-md-2',
    columns.lg ? `cols-lg-${columns.lg}` : 'cols-lg-3',
    columns.xlg ? `cols-xlg-${columns.xlg}` : 'cols-xlg-4',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={gridClass}
      style={{
        display: 'grid',
        gap: gapValue,
        width: '100%',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
