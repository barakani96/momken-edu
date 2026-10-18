import React from 'react';
import {
  UserAdmin,
  Identification,
  Network_3,
  Education,
  Group,
} from '@carbon/icons-react';
import { UserRole } from '../../auth/auth.types';
import { getNavigationForRole, NavItemConfig } from '../../config/navigation';

export type PortalId = 'admin' | 'sis' | 'instructor' | 'student' | 'guardian';

export interface PortalDefinition {
  id: PortalId;
  role: UserRole;
  basePath: string;
  titleKey: string;
  subtitleKey: string;
  badgeKey: string;
  contextTagKey?: string;
  tagType: 'purple' | 'magenta' | 'green' | 'teal' | 'blue' | 'cyan';
  icon: React.ComponentType<any>;
  navTranslationPrefix: string;
  getNavigation: (permissions?: string[]) => NavItemConfig[];
}

export const PORTAL_REGISTRY: Record<PortalId, PortalDefinition> = {
  admin: {
    id: 'admin',
    role: 'admin',
    basePath: '/admin',
    titleKey: 'portals.admin.title',
    subtitleKey: 'portals.admin.subtitle',
    badgeKey: 'portals.admin.badge',
    tagType: 'purple',
    icon: UserAdmin,
    navTranslationPrefix: 'admin.nav',
    getNavigation: (permissions = []) => getNavigationForRole('admin', permissions),
  },
  sis: {
    id: 'sis',
    role: 'sis',
    basePath: '/sis',
    titleKey: 'portals.sis.title',
    subtitleKey: 'portals.sis.subtitle',
    badgeKey: 'portals.sis.badge',
    contextTagKey: 'portals.sis.contextTag',
    tagType: 'green',
    icon: Identification,
    navTranslationPrefix: 'sis.nav',
    getNavigation: (permissions = []) => getNavigationForRole('sis', permissions),
  },
  instructor: {
    id: 'instructor',
    role: 'instructor',
    basePath: '/instructor',
    titleKey: 'portals.instructor.title',
    subtitleKey: 'portals.instructor.subtitle',
    badgeKey: 'portals.instructor.badge',
    contextTagKey: 'portals.instructor.departmentTag',
    tagType: 'teal',
    icon: Network_3,
    navTranslationPrefix: 'portals.instructor.nav',
    getNavigation: (permissions = []) => getNavigationForRole('instructor', permissions),
  },
  student: {
    id: 'student',
    role: 'student',
    basePath: '/student',
    titleKey: 'portals.student.title',
    subtitleKey: 'portals.student.subtitle',
    badgeKey: 'portals.student.badge',
    contextTagKey: 'portals.student.programTag',
    tagType: 'blue',
    icon: Education,
    navTranslationPrefix: 'portals.student.nav',
    getNavigation: (permissions = []) => getNavigationForRole('student', permissions),
  },
  guardian: {
    id: 'guardian',
    role: 'guardian',
    basePath: '/guardian',
    titleKey: 'portals.guardian.title',
    subtitleKey: 'portals.guardian.subtitle',
    badgeKey: 'portals.guardian.badge',
    tagType: 'cyan',
    icon: Group,
    navTranslationPrefix: 'portals.guardian.nav',
    getNavigation: (permissions = []) => getNavigationForRole('guardian', permissions),
  },
};

export function getAllPortals(): PortalDefinition[] {
  return Object.values(PORTAL_REGISTRY);
}

export function getPortalById(id: PortalId): PortalDefinition {
  return PORTAL_REGISTRY[id] || PORTAL_REGISTRY.admin;
}

export function getPortalByPath(pathname: string): PortalDefinition {
  if (pathname.startsWith('/sis') || pathname.startsWith('/students')) return PORTAL_REGISTRY.sis;
  if (pathname.startsWith('/student')) return PORTAL_REGISTRY.student;
  if (pathname.startsWith('/instructor')) return PORTAL_REGISTRY.instructor;
  if (pathname.startsWith('/guardian')) return PORTAL_REGISTRY.guardian;
  return PORTAL_REGISTRY.admin;
}
