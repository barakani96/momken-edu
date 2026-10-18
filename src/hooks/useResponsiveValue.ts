import { useMemo } from 'react';
import { useBreakpoint } from './useBreakpoint';
import { CarbonBreakpoint, breakpointOrder } from '../ui/design-system/tokens/breakpoints';

export type ResponsiveValues<T> = Partial<Record<CarbonBreakpoint, T>>;

/**
 * Mobile-first hook that selects the appropriate value for the current Carbon breakpoint.
 * It cascades up from smaller breakpoints ('sm' -> 'md' -> 'lg' -> 'xlg' -> 'max')
 * until a matching specified value is found.
 *
 * @example
 * const columns = useResponsiveValue({ sm: 1, md: 2, lg: 4 });
 * const padding = useResponsiveValue({ sm: 'var(--cds-spacing-03)', lg: 'var(--cds-spacing-06)' });
 */
export function useResponsiveValue<T>(
  values: ResponsiveValues<T>,
  defaultValue?: T
): T | undefined {
  const { breakpoint } = useBreakpoint();

  return useMemo(() => {
    const currentIndex = breakpointOrder.indexOf(breakpoint);

    // Search from current breakpoint down to 'sm' for the closest defined value
    for (let i = currentIndex; i >= 0; i--) {
      const bp = breakpointOrder[i];
      if (values[bp] !== undefined) {
        return values[bp];
      }
    }

    // If nothing lower was found, check if a higher breakpoint was set
    for (let i = currentIndex + 1; i < breakpointOrder.length; i++) {
      const bp = breakpointOrder[i];
      if (values[bp] !== undefined) {
        return values[bp];
      }
    }

    return defaultValue;
  }, [breakpoint, values, defaultValue]);
}
