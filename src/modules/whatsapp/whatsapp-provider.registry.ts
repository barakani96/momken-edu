/**
 * WhatsApp Provider Registry
 * Momken Education ERP — Multi-Tenant Institutional Communication Engine
 *
 * Enables registering and resolving provider adapters dynamically per tenant
 * or environment without coupling the service layer to any specific vendor.
 */

import { WhatsAppProvider } from './whatsapp-provider.interface';
import { WhatsAppProviderId, WhatsAppSenderContext } from './whatsapp.types';
import { WhatsAppProviderError } from './whatsapp.errors';

export class WhatsAppProviderRegistry {
  private static instance: WhatsAppProviderRegistry;
  private readonly providers: Map<WhatsAppProviderId, WhatsAppProvider> = new Map();
  private defaultProviderId: WhatsAppProviderId | null = null;

  /**
   * Access the global registry singleton
   */
  public static getInstance(): WhatsAppProviderRegistry {
    if (!WhatsAppProviderRegistry.instance) {
      WhatsAppProviderRegistry.instance = new WhatsAppProviderRegistry();
    }
    return WhatsAppProviderRegistry.instance;
  }

  /**
   * Register a new WhatsApp provider adapter
   */
  public register(provider: WhatsAppProvider, isDefault: boolean = false): this {
    this.providers.set(provider.id, provider);
    if (isDefault || !this.defaultProviderId) {
      this.defaultProviderId = provider.id;
    }
    return this;
  }

  /**
   * Unregister a provider by ID
   */
  public unregister(providerId: WhatsAppProviderId): boolean {
    if (this.defaultProviderId === providerId) {
      this.defaultProviderId = null;
    }
    return this.providers.delete(providerId);
  }

  /**
   * Retrieve a registered provider by its identifier
   */
  public get(providerId: WhatsAppProviderId): WhatsAppProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Retrieve a registered provider by ID or throw an error if not found
   */
  public getOrThrow(providerId: WhatsAppProviderId): WhatsAppProvider {
    const provider = this.get(providerId);
    if (!provider) {
      throw new WhatsAppProviderError(
        `WhatsApp provider '${providerId}' is not registered in the provider registry. Available providers: ${this.getRegisteredIds().join(', ')}`,
        { code: 'PROVIDER_ERROR', statusCode: 500 }
      );
    }
    return provider;
  }

  /**
   * Resolve the active provider for a given sender context.
   * Allows tenant-level override (e.g. from context.providerOptions.providerId),
   * falling back to the configured default provider.
   */
  public resolveProvider(context: WhatsAppSenderContext): WhatsAppProvider {
    const specifiedId = context.providerOptions?.providerId as WhatsAppProviderId | undefined;
    if (specifiedId) {
      return this.getOrThrow(specifiedId);
    }

    if (this.defaultProviderId) {
      const defaultProvider = this.get(this.defaultProviderId);
      if (defaultProvider) {
        return defaultProvider;
      }
    }

    // If only one provider is registered, use it
    if (this.providers.size === 1) {
      return this.providers.values().next().value!;
    }

    throw new WhatsAppProviderError(
      `No default WhatsApp provider configured and no specific provider requested in sender context for tenant '${context.tenantId}'.`,
      { code: 'TENANT_NOT_CONFIGURED', statusCode: 500 }
    );
  }

  /**
   * Set the default fallback provider ID
   */
  public setDefaultProvider(providerId: WhatsAppProviderId): void {
    if (!this.providers.has(providerId)) {
      throw new WhatsAppProviderError(
        `Cannot set default provider to '${providerId}': provider is not registered.`,
        { code: 'PROVIDER_ERROR', statusCode: 500 }
      );
    }
    this.defaultProviderId = providerId;
  }

  /**
   * Get all registered provider identifiers
   */
  public getRegisteredIds(): WhatsAppProviderId[] {
    return Array.from(this.providers.keys());
  }

  /**
   * Get list of all registered provider instances with metadata
   */
  public getAll(): WhatsAppProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Check if a specific provider is registered
   */
  public has(providerId: WhatsAppProviderId): boolean {
    return this.providers.has(providerId);
  }

  /**
   * Clear all registered providers (primarily for test teardown)
   */
  public clear(): void {
    this.providers.clear();
    this.defaultProviderId = null;
  }
}
