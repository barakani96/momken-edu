/**
 * WhatsApp Provider Registry
 * @schools/infrastructure — Provider Abstraction Pattern
 *
 * Maintains a registry of available WhatsApp providers and factories,
 * allowing dynamic provider registration and discovery without hard-coupling
 * core application services to external vendors.
 */

import { WhatsAppProvider } from './WhatsAppProvider';

export type WhatsAppProviderFactoryFn = (config?: Record<string, unknown>) => WhatsAppProvider;
export type WhatsAppProviderConstructor = new (config?: any) => WhatsAppProvider;
export type WhatsAppProviderEntry = WhatsAppProviderFactoryFn | WhatsAppProviderConstructor | WhatsAppProvider;

export class WhatsAppProviderRegistry {
  private readonly providers = new Map<string, WhatsAppProvider>();
  private readonly factories = new Map<string, WhatsAppProviderFactoryFn>();

  /**
   * Registers a provider by type using a factory function, class constructor, or direct instance.
   */
  public register(
    providerType: string,
    entry: WhatsAppProviderEntry
  ): void {
    const normalizedType = providerType.toLowerCase().trim();

    if (typeof entry === 'function') {
      // Check if it's a class constructor (requires 'new') or factory function
      const isConstructor = entry.prototype && entry.prototype.constructor === entry;
      if (isConstructor) {
        const ctor = entry as WhatsAppProviderConstructor;
        this.factories.set(normalizedType, (config?: Record<string, unknown>) => new ctor(config));
      } else {
        this.factories.set(normalizedType, entry as WhatsAppProviderFactoryFn);
      }
    } else if (entry && typeof entry === 'object' && 'providerId' in entry) {
      // Direct provider instance
      this.providers.set(normalizedType, entry);
      this.factories.set(normalizedType, () => entry);
    } else {
      throw new Error(`Invalid provider registration for "${providerType}". Must be a provider instance, class, or factory function.`);
    }
  }

  /**
   * Registers a pre-instantiated provider instance using its own providerId.
   */
  public registerInstance(provider: WhatsAppProvider): void {
    if (!provider || !provider.providerId) {
      throw new Error('Cannot register provider without a valid providerId.');
    }
    this.register(provider.providerId, provider);
  }

  /**
   * Resolves a provider instance by provider type.
   * If an instance already exists, it is returned. If only a factory is registered,
   * an instance is created, cached, and returned.
   */
  public get(providerType: string, config?: Record<string, unknown>): WhatsAppProvider | undefined {
    const normalizedType = providerType.toLowerCase().trim();

    if (this.providers.has(normalizedType) && !config) {
      return this.providers.get(normalizedType);
    }

    const factory = this.factories.get(normalizedType);
    if (factory) {
      const instance = factory(config);
      if (!config) {
        this.providers.set(normalizedType, instance);
      }
      return instance;
    }

    return undefined;
  }

  /**
   * Retrieves the raw factory function for a provider type.
   */
  public getFactory(providerType: string): WhatsAppProviderFactoryFn | undefined {
    return this.factories.get(providerType.toLowerCase().trim());
  }

  /**
   * Checks whether a provider type is registered in the registry.
   */
  public has(providerType: string): boolean {
    const normalizedType = providerType.toLowerCase().trim();
    return this.factories.has(normalizedType) || this.providers.has(normalizedType);
  }

  /**
   * Removes a provider type from the registry.
   */
  public unregister(providerType: string): boolean {
    const normalizedType = providerType.toLowerCase().trim();
    const removedInstance = this.providers.delete(normalizedType);
    const removedFactory = this.factories.delete(normalizedType);
    return removedInstance || removedFactory;
  }

  /**
   * Returns a list of all currently registered provider types.
   */
  public getRegisteredTypes(): string[] {
    const types = new Set<string>([
      ...this.factories.keys(),
      ...this.providers.keys(),
    ]);
    return Array.from(types).sort();
  }

  /**
   * Returns all currently active singleton instances in the registry.
   */
  public list(): WhatsAppProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Clears all registered providers and factories.
   */
  public clear(): void {
    this.providers.clear();
    this.factories.clear();
  }
}

/**
 * Global singleton registry instance
 */
export const whatsappProviderRegistry = new WhatsAppProviderRegistry();
