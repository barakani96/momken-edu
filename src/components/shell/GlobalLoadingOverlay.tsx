import React, { useEffect, useState, useRef } from 'react';
import { useNavigation, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loading } from '@carbon/react';
import { useShell } from './ShellContext';
import { useLanguage } from '../../i18n/LanguageProvider';

export interface GlobalLoadingOverlayProps {
  /** Optional override to force the loading overlay state */
  active?: boolean;
  /** Custom accessible description for screen readers */
  description?: string;
  /** Transition display duration in ms on location change (default: 240ms) */
  transitionDuration?: number;
}

/**
 * Global Loading Overlay component based on the IBM Carbon Design System.
 * Automatically displays whenever React Router navigation is transitioning between routes
 * or when asynchronous route data loading is in progress.
 */
export function GlobalLoadingOverlay({
  active: forcedActive,
  description: customDescription,
  transitionDuration = 240,
}: GlobalLoadingOverlayProps) {
  const { t } = useTranslation();
  const { dir } = useLanguage();
  const navigation = useNavigation();
  const location = useLocation();
  const { isPageNavigating } = useShell();

  // Route transition state on location path change
  const [isRouteChanging, setIsRouteChanging] = useState(false);
  const previousLocationRef = useRef<string>(location.pathname + location.search);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const currentLocation = location.pathname + location.search;
    if (previousLocationRef.current !== currentLocation) {
      previousLocationRef.current = currentLocation;
      setIsRouteChanging(true);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      timerRef.current = setTimeout(() => {
        setIsRouteChanging(false);
      }, transitionDuration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [location.pathname, location.search, transitionDuration]);

  // Determine if navigation is in progress
  const isRouterTransitioning =
    navigation.state === 'loading' || navigation.state === 'submitting';

  const isVisible =
    forcedActive ?? (isRouterTransitioning || isRouteChanging || isPageNavigating);

  if (!isVisible) {
    return null;
  }

  const accessibleDescription =
    customDescription || t('shell.pageLoading') || t('ui.loading') || 'Loading page...';

  return (
    <div
      dir={dir}
      className={dir === 'rtl' ? 'cds--layout--rtl cds--rtl' : ''}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        pointerEvents: 'auto',
      }}
      role="status"
      aria-live="assertive"
      aria-busy="true"
    >
      <Loading
        withOverlay
        active={true}
        description={accessibleDescription}
      />
    </div>
  );
}
