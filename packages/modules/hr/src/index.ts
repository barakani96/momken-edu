/**
 * @schools/module-hr — Authoritative Human Resources & Faculty Module
 * Enforces AGENTS.md §13:
 * - Authoritative Owner of: Staff, FacultyContract, LeaveQuota
 * - References (by ID contract only): Department, User (owned by @schools/module-admin)
 */

import hrManifest from '../../../../src/app/modules/definitions/hrModule.json';
import { DOMAIN_OWNERSHIP_REGISTRY } from '@schools/domain';

export { hrManifest };
export const HR_OWNERSHIP_CONTRACT = DOMAIN_OWNERSHIP_REGISTRY.hr;

export { HrView } from '@schools/module-sis';
