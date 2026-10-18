/**
 * @schools/infrastructure — Infrastructure Layer Public API
 * Repositories, HTTP client adapters, IndexedDB persistence, and data access abstractions.
 */

export * from './repositories';
export * from './whatsapp';
export { http } from '../../../src/api/axiosClient';
export { indexedDb } from '../../../src/core/persistence/indexedDb';

