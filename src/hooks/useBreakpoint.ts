import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  CarbonBreakpoint,
  carbonBreakpoints,
  breakpointOrder,
} from '../ui/design-system/tokens/breakpoints';

export interface UseBreakpointResult {
  /** The current active Carbon breakpoint ('sm' | 'md' | 'lg' | 'xlg' | 'max') */
  breakpoint: CarbonBreakpoint;
  /** True when the viewport matches the 'sm' breakpoint (< 672px / 42rem) */
  isMobile: boolean;
  /** True when the viewport matches the 'md' breakpoint (>= 672px and < 1056px) */
  isTablet: boolean;
  /** True when the viewport matches the 'lg', 'xlg', or 'max' breakpoint (>= 1056px / 66rem) */
  isDesktop: boolean;
  /** Returns true if current viewport is at or above the target Carbon breakpoint */
  isUp: (target: CarbonBreakpoint) => boolean;
  /** Returns true if current viewport is strictly below the target Carbon breakpoint */
  isDown: (target: CarbonBreakpoint) => boolean;
  /** Returns true if current viewport is inclusively between min and max Carbon breakpoints */
  isBetween: (min: CarbonBreakpoint, max: CarbonBreakpoint) => boolean;
  /** The current window inner width in pixels */
  windowWidth: number;
}

/**
 * Calculates the active Carbon breakpoint given a window width in pixels.
 */
function getActiveBreakpoint(width: number): CarbonBreakpoint {
  if (width >= carbonBreakpoints.max.minWidthPx) return 'max';
  if (width >= carbonBreakpoints.xlg.minWidthPx) return 'xlg';
  if (width >= carbonBreakpoints.lg.minWidthPx) return 'lg';
  if (width >= carbonBreakpoints.md.minWidthPx) return 'md';
  return 'sm';
}

/**
 * Hook for responsive layout adjustments adhering to the IBM Carbon Design System 2x Grid.
 * Tracks viewport breakpoint changes using matchMedia for smooth rendering without layout jank.
 */
export function useBreakpoint(): UseBreakpointResult {
  const [windowWidth, setWindowWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1056
  );

  const [breakpoint, setBreakpoint] = useState<CarbonBreakpoint>(() =>
    typeof window !== 'undefined' ? getActiveBreakpoint(window.innerWidth) : 'lg'
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      setBreakpoint(getActiveBreakpoint(width));
    };

    // Use passive listener for performance
    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const currentIndex = useMemo(() => breakpointOrder.indexOf(breakpoint), [breakpoint]);

  const isUp = useCallback(
    (target: CarbonBreakpoint) => {
      const targetIndex = breakpointOrder.indexOf(target);
      return currentIndex >= targetIndex;
    },
    [currentIndex]
  );

  const isDown = useCallback(
    (target: CarbonBreakpoint) => {
      const targetIndex = breakpointOrder.indexOf(target);
      return currentIndex < targetIndex;
    },
    [currentIndex]
  );

  const isBetween = useCallback(
    (min: CarbonBreakpoint, max: CarbonBreakpoint) => {
      const minIndex = breakpointOrder.indexOf(min);
      const maxIndex = breakpointOrder.indexOf(max);
      return currentIndex >= minIndex && currentIndex <= maxIndex;
    },
    [currentIndex]
  );

  return {
    breakpoint,
    isMobile: breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xlg' || breakpoint === 'max',
    isUp,
    isDown,
    isBetween,
    windowWidth,
  };
}
