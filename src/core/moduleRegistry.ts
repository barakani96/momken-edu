/**
 * Enterprise Module Registry
 * Dynamically validates, registers, and loads module configurations from JSON,
 * providing dependency injection for shared platform services (Logging, Notifications, Storage, HTTP).
 */

import { ModuleConfigSchema, validateModuleConfig } from './moduleSchema';
import { auditLogger } from './auditLogger';
import { indexedDb } from './persistence/indexedDb';
import { http } from '../api/axiosClient';

export interface SharedServices {
  logger: typeof auditLogger;
  storage: typeof indexedDb;
  http: typeof http;
  notifications?: {
    notify: (notification: { kind: string; title: string; subtitle?: any; timeout?: number }) => void;
  };
}

export interface InjectedModuleContext {
  module: ModuleConfigSchema;
  services: SharedServices;
}

export type ModuleEventListener = (module: ModuleConfigSchema) => void;

class ModuleRegistryService {
  private modules = new Map<string, ModuleConfigSchema>();
  private activeContexts = new Map<string, InjectedModuleContext>();
  private listeners: Set<ModuleEventListener> = new Set();

  private sharedServices: SharedServices = {
    logger: auditLogger,
    storage: indexedDb,
    http: http,
  };

  /**
   * Injects or updates shared services for dependency injection
   */
  public configureSharedServices(services: Partial<SharedServices>): void {
    this.sharedServices = {
      ...this.sharedServices,
      ...services,
    };

    // Update active module contexts with new services
    this.activeContexts.forEach((ctx, moduleId) => {
      this.activeContexts.set(moduleId, {
        ...ctx,
        services: this.sharedServices,
      });
    });
  }

  /**
   * Dynamically validates and registers a module configuration from raw JSON
   */
  public registerModule(rawConfig: unknown): {
    success: boolean;
    module?: ModuleConfigSchema;
    errors: string[];
    warnings: string[];
  } {
    const validation = validateModuleConfig(rawConfig);

    if (!validation.valid || !validation.validatedConfig) {
      console.error('[ModuleRegistry] Validation failed for module configuration:', validation.errors);
      auditLogger.log({
        type: 'ERROR',
        action: 'Module validation failed on registration',
        details: { errors: validation.errors },
      });
      return {
        success: false,
        errors: validation.errors,
        warnings: validation.warnings,
      };
    }

    const validated = validation.validatedConfig;
    this.modules.set(validated.id, validated);

    // Create Injected Context
    this.activeContexts.set(validated.id, {
      module: validated,
      services: this.sharedServices,
    });

    // Cache locally in IndexedDB for offline resilience
    indexedDb.saveModuleMetadata(validated.id, validated).catch((err) => {
      console.warn(`[ModuleRegistry] Failed to cache module ${validated.id} in IndexedDB:`, err);
    });

    auditLogger.log({
      type: 'ACTION',
      moduleId: validated.id,
      action: `Module registered: ${validated.name} (v${validated.version})`,
      details: {
        entityCount: validated.entities.length,
        entities: validated.entities.map((e) => e.name),
      },
    });

    // Notify listeners
    this.listeners.forEach((fn) => {
      try {
        fn(validated);
      } catch (err) {
        console.error('[ModuleRegistry] Error in listener:', err);
      }
    });

    return {
      success: true,
      module: validated,
      errors: [],
      warnings: validation.warnings,
    };
  }

  /**
   * Retrieves a module by its identifier
   */
  public getModule(id: string): ModuleConfigSchema | undefined {
    return this.modules.get(id);
  }

  /**
   * Checks if a module is registered
   */
  public hasModule(id: string): boolean {
    return this.modules.has(id);
  }

  /**
   * Returns all currently registered modules
   */
  public listModules(): ModuleConfigSchema[] {
    return Array.from(this.modules.values());
  }

  /**
   * Retrieves the injected context containing module metadata and platform services
   */
  public getInjectedContext(id: string): InjectedModuleContext | undefined {
    const ctx = this.activeContexts.get(id);
    if (ctx) return ctx;

    const mod = this.modules.get(id);
    if (!mod) return undefined;

    const newCtx: InjectedModuleContext = {
      module: mod,
      services: this.sharedServices,
    };
    this.activeContexts.set(id, newCtx);
    return newCtx;
  }

  /**
   * Asynchronously loads a module, trying memory first, then IndexedDB cache
   */
  public async loadModule(id: string): Promise<ModuleConfigSchema | null> {
    if (this.modules.has(id)) {
      return this.modules.get(id)!;
    }

    // Attempt retrieval from IndexedDB persistence cache
    try {
      const cached = await indexedDb.getModuleMetadata(id);
      if (cached && cached.manifest) {
        const registration = this.registerModule(cached.manifest);
        if (registration.success && registration.module) {
          return registration.module;
        }
      }
    } catch (e) {
      console.warn(`[ModuleRegistry] Failed to load module ${id} from cache:`, e);
    }

    return null;
  }

  /**
   * Subscribes to module registration events
   */
  public onModuleRegistered(listener: ModuleEventListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}

export const moduleRegistry = new ModuleRegistryService();
