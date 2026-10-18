/**
 * IBM Carbon Design System Breakpoint Tokens
 * Official reference: https://carbondesignsystem.com/guidelines/2x-grid/overview/#breakpoints
 */

export type CarbonBreakpoint = 'sm' | 'md' | 'lg' | 'xlg' | 'max';

export interface BreakpointConfig {
  width: string;
  minWidthPx: number;
  columns: number;
  margin: string;
}

export const carbonBreakpoints: Record<CarbonBreakpoint, BreakpointConfig> = {
  sm: {
    width: '20rem',
    minWidthPx: 320,
    columns: 4,
    margin: '0',
  },
  md: {
    width: '42rem',
    minWidthPx: 672,
    columns: 8,
    margin: '1rem',
  },
  lg: {
    width: '66rem',
    minWidthPx: 1056,
    columns: 16,
    margin: '1rem',
  },
  xlg: {
    width: '82rem',
    minWidthPx: 1312,
    columns: 16,
    margin: '1rem',
  },
  max: {
    width: '99rem',
    minWidthPx: 1584,
    columns: 16,
    margin: '1.5rem',
  },
};

export const breakpointOrder: CarbonBreakpoint[] = ['sm', 'md', 'lg', 'xlg', 'max'];

export const mediaQueries = {
  sm: '(min-width: 20rem)',
  md: '(min-width: 42rem)',
  lg: '(min-width: 66rem)',
  xlg: '(min-width: 82rem)',
  max: '(min-width: 99rem)',
  // Max width queries (for down matching)
  smMax: '(max-width: 41.999rem)',
  mdMax: '(max-width: 65.999rem)',
  lgMax: '(max-width: 81.999rem)',
  xlgMax: '(max-width: 98.999rem)',
} as const;
