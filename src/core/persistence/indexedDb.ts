/**
 * IndexedDB Persistence Layer
 * Provides robust offline local caching for module metadata and entity state,
 * ensuring the application remains functional during brief network disconnects.
 */

const DB_NAME = 'SchoolsSystemCache';
const DB_VERSION = 1;

export const STORES = {
  MODULES: 'modules',
  ENTITY_STATE: 'entity_state',
  AUDIT_LOGS: 'audit_logs',
  USER_PREFERENCES: 'user_preferences',
} as const;

export interface CachedModuleMetadata {
  id: string;
  name: string;
  version: string;
  manifest: any;
  cachedAt: number;
}

export interface CachedEntityState<T = any> {
  key: string; // e.g., 'sis.students' or 'academics.courses'
  moduleId: string;
  entityName: string;
  records: T[];
  updatedAt: number;
  isDirty?: boolean;
}

class IndexedDbService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  public async getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment.'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Store for module manifests and schemas
        if (!db.objectStoreNames.contains(STORES.MODULES)) {
          db.createObjectStore(STORES.MODULES, { keyPath: 'id' });
        }

        // Store for entity data records (e.g. students, courses)
        if (!db.objectStoreNames.contains(STORES.ENTITY_STATE)) {
          const entityStore = db.createObjectStore(STORES.ENTITY_STATE, { keyPath: 'key' });
          entityStore.createIndex('moduleId', 'moduleId', { unique: false });
          entityStore.createIndex('entityName', 'entityName', { unique: false });
        }

        // Store for audit logs
        if (!db.objectStoreNames.contains(STORES.AUDIT_LOGS)) {
          const auditStore = db.createObjectStore(STORES.AUDIT_LOGS, { keyPath: 'id' });
          auditStore.createIndex('timestamp', 'timestamp', { unique: false });
          auditStore.createIndex('moduleId', 'moduleId', { unique: false });
        }

        // Store for user preferences and dwell metrics
        if (!db.objectStoreNames.contains(STORES.USER_PREFERENCES)) {
          db.createObjectStore(STORES.USER_PREFERENCES, { keyPath: 'key' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error || new Error('Failed to open IndexedDB'));
      };
    });

    return this.dbPromise;
  }

  // --- Module Metadata Operations ---

  public async saveModuleMetadata(moduleId: string, manifest: any): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORES.MODULES, 'readwrite');
      const store = tx.objectStore(STORES.MODULES);

      const entry: CachedModuleMetadata = {
        id: moduleId,
        name: manifest.name || moduleId,
        version: manifest.version || '1.0.0',
        manifest,
        cachedAt: Date.now(),
      };

      store.put(entry);

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn(`[IndexedDB] Could not save module metadata for ${moduleId}:`, err);
    }
  }

  public async getModuleMetadata(moduleId: string): Promise<CachedModuleMetadata | null> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORES.MODULES, 'readonly');
      const store = tx.objectStore(STORES.MODULES);
      const request = store.get(moduleId);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn(`[IndexedDB] Could not get module metadata for ${moduleId}:`, err);
      return null;
    }
  }

  public async getAllCachedModules(): Promise<CachedModuleMetadata[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORES.MODULES, 'readonly');
      const store = tx.objectStore(STORES.MODULES);
      const request = store.getAll();

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Could not list cached modules:', err);
      return [];
    }
  }

  // --- Entity State Operations ---

  public async saveEntityState<T = any>(
    moduleId: string,
    entityName: string,
    records: T[],
    isDirty: boolean = false
  ): Promise<void> {
    const key = `${moduleId}.${entityName}`;
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORES.ENTITY_STATE, 'readwrite');
      const store = tx.objectStore(STORES.ENTITY_STATE);

      const entry: CachedEntityState<T> = {
        key,
        moduleId,
        entityName,
        records,
        updatedAt: Date.now(),
        isDirty,
      };

      store.put(entry);

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn(`[IndexedDB] Could not save entity state for ${key}:`, err);
    }
  }

  public async getEntityState<T = any>(
    moduleId: string,
    entityName: string
  ): Promise<CachedEntityState<T> | null> {
    const key = `${moduleId}.${entityName}`;
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORES.ENTITY_STATE, 'readonly');
      const store = tx.objectStore(STORES.ENTITY_STATE);
      const request = store.get(key);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn(`[IndexedDB] Could not get entity state for ${key}:`, err);
      return null;
    }
  }

  // --- Generic Preference / Metric Storage ---

  public async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORES.USER_PREFERENCES, 'readwrite');
      const store = tx.objectStore(STORES.USER_PREFERENCES);
      store.put({ key, value, updatedAt: Date.now() });

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn(`[IndexedDB] setItem failed for ${key}:`, err);
    }
  }

  public async getItem<T>(key: string): Promise<T | null> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORES.USER_PREFERENCES, 'readonly');
      const store = tx.objectStore(STORES.USER_PREFERENCES);
      const request = store.get(key);

      return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result ? request.result.value : null);
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn(`[IndexedDB] getItem failed for ${key}:`, err);
      return null;
    }
  }

  // --- Audit Log Storage ---

  public async saveAuditLog(logEntry: any): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORES.AUDIT_LOGS, 'readwrite');
      const store = tx.objectStore(STORES.AUDIT_LOGS);
      store.put(logEntry);

      return new Promise((resolve, reject) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Could not save audit log:', err);
    }
  }

  public async getAuditLogs(limit: number = 50): Promise<any[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(STORES.AUDIT_LOGS, 'readonly');
      const store = tx.objectStore(STORES.AUDIT_LOGS);
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev');
      const results: any[] = [];

      return new Promise((resolve, reject) => {
        request.onsuccess = (e) => {
          const cursor = (e.target as IDBRequest).result as IDBCursorWithValue;
          if (cursor && results.length < limit) {
            results.push(cursor.value);
            cursor.continue();
          } else {
            resolve(results);
          }
        };
        request.onerror = () => reject(request.error);
      });
    } catch (err) {
      console.warn('[IndexedDB] Could not retrieve audit logs:', err);
      return [];
    }
  }

  public async clearAllCache(): Promise<void> {
    try {
      const db = await this.getDB();
      const stores = [STORES.MODULES, STORES.ENTITY_STATE, STORES.AUDIT_LOGS];
      for (const storeName of stores) {
        const tx = db.transaction(storeName, 'readwrite');
        tx.objectStore(storeName).clear();
      }
    } catch (err) {
      console.warn('[IndexedDB] Failed to clear caches:', err);
    }
  }
}

export const indexedDb = new IndexedDbService();
