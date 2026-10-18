/**
 * @schools/module-finance — Authoritative Finance & Billing Module
 * Enforces AGENTS.md §13:
 * - Authoritative Owner of: Invoice, PaymentReceipt, InstallmentPlan, FeeStructure
 * - References (by ID contract only): Student, Guardian (owned by @schools/module-sis)
 */

import financeManifest from '../../../../src/app/modules/definitions/financeModule.json';
import { DOMAIN_OWNERSHIP_REGISTRY } from '@schools/domain';

export { financeManifest };
export const FINANCE_OWNERSHIP_CONTRACT = DOMAIN_OWNERSHIP_REGISTRY.finance;

export { FinanceView } from '@schools/module-sis';
