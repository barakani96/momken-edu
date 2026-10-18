/**
 * Performance Monitoring Hook
 * Tracks and logs render durations and re-render frequency of active module views,
 * detecting potential performance bottlenecks in complex analytical and data-heavy grids.
 */

import { useEffect, useRef } from 'react';
import { auditLogger } from '../core/auditLogger';

export interface PerformanceMetrics {
  renderCount: number;
  lastRenderDuration: number;
  totalRenderDuration: number;
  averageRenderDuration: number;
}

export interface PerformanceMonitorOptions {
  thresholdMs?: number; // Flag slow re-renders if exceeding threshold (default: 50ms)
  initialThresholdMs?: number; // Flag slow initial mounts if exceeding threshold (default: 200ms)
  logToConsole?: boolean;
  logToAudit?: boolean;
}

export function usePerformanceMonitor(
  moduleOrComponentName: string,
  options: PerformanceMonitorOptions = {}
): PerformanceMetrics {
  const {
    thresholdMs = 50,
    initialThresholdMs = 200,
    logToConsole = true,
    logToAudit = false,
  } = options;

  const renderStartTimeRef = useRef<number>(performance.now());
  const renderCountRef = useRef<number>(0);
  const totalDurationRef = useRef<number>(0);
  const lastDurationRef = useRef<number>(0);

  // Mark render initiation before component return
  renderStartTimeRef.current = performance.now();
  renderCountRef.current += 1;

  useEffect(() => {
    const renderEndTime = performance.now();
    const duration = Math.round((renderEndTime - renderStartTimeRef.current) * 100) / 100;
    lastDurationRef.current = duration;
    totalDurationRef.current += duration;

    const count = renderCountRef.current;
    const effectiveThreshold = count === 1 ? initialThresholdMs : thresholdMs;
    const isSlow = duration > effectiveThreshold;

    if (logToConsole) {
      if (isSlow) {
        console.warn(
          `%c[PERF WARNING] %c${moduleOrComponentName} %crender #${count} took %c${duration}ms %c(threshold: ${effectiveThreshold}ms)`,
          'color: #da1e28; font-weight: bold;',
          'color: #0f62fe; font-weight: bold;',
          'color: inherit;',
          'color: #da1e28; font-weight: bold;',
          'color: var(--cds-text-secondary, #8d8d8d);'
        );
      } else if (import.meta.env.DEV) {
        console.debug(
          `%c[PERF] %c${moduleOrComponentName} %crender #${count}: ${duration}ms (avg: ${(totalDurationRef.current / count).toFixed(1)}ms)`,
          'color: #24a148; font-weight: bold;',
          'color: #0f62fe;',
          'color: inherit;'
        );
      }
    }

    if (isSlow && logToAudit) {
      auditLogger.log({
        type: 'ACTION',
        moduleId: moduleOrComponentName,
        action: `Slow render detected: ${duration}ms (render #${count})`,
        durationMs: duration,
        details: { thresholdMs: effectiveThreshold, totalDuration: totalDurationRef.current },
      });
    }
  });

  return {
    renderCount: renderCountRef.current,
    lastRenderDuration: lastDurationRef.current,
    totalRenderDuration: totalDurationRef.current,
    averageRenderDuration:
      renderCountRef.current > 0
        ? Math.round((totalDurationRef.current / renderCountRef.current) * 100) / 100
        : 0,
  };
}
