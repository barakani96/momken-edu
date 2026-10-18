/**
 * @schools/modules — Institutional Business Modules Aggregator
 * Orchestrates all domain-bounded workspace module packages:
 * - @schools/module-sis
 * - @schools/module-academics
 * - @schools/module-finance
 * - @schools/module-hr
 * - @schools/module-library
 * - @schools/module-admin
 */

import { sisManifest, SIS_OWNERSHIP_CONTRACT } from '@schools/module-sis';
import { academicsManifest, ACADEMICS_OWNERSHIP_CONTRACT } from '@schools/module-academics';
import { financeManifest, FINANCE_OWNERSHIP_CONTRACT } from '@schools/module-finance';
import { hrManifest, HR_OWNERSHIP_CONTRACT } from '@schools/module-hr';
import { libraryManifest, LIBRARY_OWNERSHIP_CONTRACT } from '@schools/module-library';
import { ADMIN_OWNERSHIP_CONTRACT } from '@schools/module-admin';
import { DOMAIN_OWNERSHIP_REGISTRY } from '@schools/domain';

export {
  sisManifest,
  academicsManifest,
  financeManifest,
  hrManifest,
  libraryManifest,
  sisManifest as sisModule,
  academicsManifest as academicsModule,
  financeManifest as financeModule,
  hrManifest as hrModule,
  libraryManifest as libraryModule,
  SIS_OWNERSHIP_CONTRACT,
  ACADEMICS_OWNERSHIP_CONTRACT,
  FINANCE_OWNERSHIP_CONTRACT,
  HR_OWNERSHIP_CONTRACT,
  LIBRARY_OWNERSHIP_CONTRACT,
  ADMIN_OWNERSHIP_CONTRACT,
  DOMAIN_OWNERSHIP_REGISTRY,
};

export const institutionalModules = [
  sisManifest,
  academicsManifest,
  financeManifest,
  hrManifest,
  libraryManifest,
];

export const ALL_MODULES = institutionalModules;

export default institutionalModules;
