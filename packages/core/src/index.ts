/**
 * @schools/core — Core Package Public API
 * Re-exports cross-cutting core concerns, monorepo workspace registry,
 * store abstractions, security helpers, and platform utilities.
 */

export * from './types';
export * from './workspaceRegistry';
export * from '../../../src/core/logger';
export * from '../../../src/core/auditLogger';
export * from '../../../src/core/moduleRegistry';
export * from '../../../src/core/moduleSchema';
export * from '../../../src/core/moduleLoader';
export * from '../../../src/core/portals/portalRegistry';
export * from '../../../src/core/admin/adminStore';
export * from '../../../src/core/admin/adminTypes';
export * from '../../../src/core/platform/platformStore';
export {
  type DeliveryLog,
  type WorkflowStep,
} from '../../../src/core/platform/platformTypes';
export * from '../../../src/application/encryption';
export * from '../../../src/application/rbac';
