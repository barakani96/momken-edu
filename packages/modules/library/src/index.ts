/**
 * @schools/module-library — Authoritative Library & Circulation Module
 * Enforces AGENTS.md §13:
 * - Authoritative Owner of: Book, BookCheckout
 * - References (by ID contract only): Student (owned by @schools/module-sis)
 */

import libraryManifest from '../../../../src/app/modules/definitions/libraryModule.json';
import { DOMAIN_OWNERSHIP_REGISTRY } from '@schools/domain';

export { libraryManifest };
export const LIBRARY_OWNERSHIP_CONTRACT = DOMAIN_OWNERSHIP_REGISTRY.library;

export {
  LibraryView,
  TransportView,
  HostelView,
  ClinicView,
  InventoryView,
  CommunicationsView,
} from '@schools/module-sis';
