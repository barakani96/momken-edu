/**
 * Module Dwell Time & Visit Tracker Hook
 * Tracks active dwell time and engagement frequency across institutional modules,
 * powering the 'Most Visited' quick-launch section in the Command Palette.
 */

import { useEffect, useRef } from 'react';

export interface ModuleVisitStat {
  moduleId: string;
  moduleName: string;
  path: string;
  iconName?: string;
  visitCount: number;
  totalSecondsSpent: number;
  lastVisited: number;
}

const STORAGE_KEY = 'schools_module_visit_metrics';

// Default initial metrics so Command Palette has sensible initial suggestions
const DEFAULT_METRICS: ModuleVisitStat[] = [
  {
    moduleId: 'sis',
    moduleName: 'Student Information System',
    path: '/students',
    iconName: 'Education',
    visitCount: 18,
    totalSecondsSpent: 1240,
    lastVisited: Date.now() - 3600000,
  },
  {
    moduleId: 'academics',
    moduleName: 'Academics & Curriculum',
    path: '/courses',
    iconName: 'Catalog',
    visitCount: 14,
    totalSecondsSpent: 920,
    lastVisited: Date.now() - 7200000,
  },
  {
    moduleId: 'admissions',
    moduleName: 'Admissions Pipeline',
    path: '/admissions',
    iconName: 'DocumentAdd',
    visitCount: 9,
    totalSecondsSpent: 540,
    lastVisited: Date.now() - 10800000,
  },
  {
    moduleId: 'sections',
    moduleName: 'Class Sections & Timetable',
    path: '/sections',
    iconName: 'Building',
    visitCount: 7,
    totalSecondsSpent: 420,
    lastVisited: Date.now() - 14400000,
  },
];

export function getStoredVisitStats(): ModuleVisitStat[] {
  if (typeof window === 'undefined') return DEFAULT_METRICS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_METRICS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_METRICS;
  } catch (err) {
    return DEFAULT_METRICS;
  }
}

export function saveVisitStats(stats: ModuleVisitStat[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Failed to save module visit metrics:', err);
  }
}

export function recordModuleVisit(
  moduleId: string,
  moduleName: string,
  path: string,
  dwellSeconds: number = 0,
  iconName?: string
): void {
  const current = getStoredVisitStats();
  const existingIndex = current.findIndex((s) => s.moduleId === moduleId || s.path === path);

  if (existingIndex >= 0) {
    const existing = current[existingIndex];
    current[existingIndex] = {
      ...existing,
      moduleName,
      path,
      iconName: iconName || existing.iconName,
      visitCount: existing.visitCount + 1,
      totalSecondsSpent: existing.totalSecondsSpent + Math.max(0, dwellSeconds),
      lastVisited: Date.now(),
    };
  } else {
    current.push({
      moduleId,
      moduleName,
      path,
      iconName,
      visitCount: 1,
      totalSecondsSpent: Math.max(0, dwellSeconds),
      lastVisited: Date.now(),
    });
  }

  // Sort by weighted engagement: visit count + dwell time factor
  current.sort((a, b) => {
    const scoreA = a.visitCount * 10 + Math.min(a.totalSecondsSpent / 60, 50);
    const scoreB = b.visitCount * 10 + Math.min(b.totalSecondsSpent / 60, 50);
    return scoreB - scoreA;
  });

  saveVisitStats(current.slice(0, 10));
}

export function getMostVisitedModules(limit: number = 4): ModuleVisitStat[] {
  const stats = getStoredVisitStats();
  return stats.slice(0, limit);
}

/**
 * Hook to automatically track dwell time for a mounted module page
 */
export function useModuleDwellTracker(
  moduleId: string,
  moduleName: string,
  path: string,
  iconName?: string
) {
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();

    // Increment visit count immediately on mount
    recordModuleVisit(moduleId, moduleName, path, 0, iconName);

    return () => {
      const elapsedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (elapsedSeconds > 1) {
        // Record accrued dwell time on unmount
        const current = getStoredVisitStats();
        const item = current.find((s) => s.moduleId === moduleId || s.path === path);
        if (item) {
          item.totalSecondsSpent += elapsedSeconds;
          saveVisitStats(current);
        }
      }
    };
  }, [moduleId, moduleName, path, iconName]);
}

/** Alias for convenient import */
export const useModuleDwellTime = (
  moduleId: string,
  moduleName: string,
  path: string = window.location.pathname,
  iconName?: string
) => useModuleDwellTracker(moduleId, moduleName, path, iconName);
