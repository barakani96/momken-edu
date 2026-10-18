import React from 'react';
import { CarbonBreakpoint } from '../design-system/tokens/breakpoints';
import { SpacingKey, spacingVars } from '../design-system/tokens/spacing';

export interface ResponsiveStackProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Breakpoint at which the stack switches from column to row (default: 'md') */
  switchAt?: CarbonBreakpoint;
  /** Reverse direction on mobile if true (column-reverse -> row) */
  reverseMobile?: boolean;
  /** Spacing gap between items using Carbon token (default: 'spacing05') */
  gap?: SpacingKey;
  /** Vertical alignment when horizontal */
  align?: 'flex-start' | 'center' | 'flex-end' | 'stretch';
  /** Horizontal distribution when horizontal */
  justify?: 'flex-start' | 'center' | 'flex-end' | 'space-between' | 'space-around';
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Mobile-first flex stack component following Carbon Design System conventions.
 * Stacks items vertically on mobile viewports and switches to a horizontal row at the specified breakpoint.
 */
export function ResponsiveStack({
  children,
  switchAt = 'md',
  reverseMobile = false,
  gap = 'spacing05',
  align = 'center',
  justify = 'flex-start',
  className = '',
  style,
  ...rest
}: ResponsiveStackProps) {
  const gapValue = spacingVars[gap] || 'var(--cds-spacing-05, 1rem)';

  const stackClass = [
    'cds-responsive-stack-container',
    reverseMobile ? 'reverse-mobile' : '',
    `switch-${switchAt}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={stackClass}
      style={{
        display: 'flex',
        gap: gapValue,
        alignItems: align,
        justifyContent: justify,
        width: '100%',
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
