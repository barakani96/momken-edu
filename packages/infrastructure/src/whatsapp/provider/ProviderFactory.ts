/**
 * WhatsApp Provider Factory
 * @schools/infrastructure — Provider Abstraction Pattern
 *
 * Instantiates the correct WhatsAppProvider adapter based on configuration
 * loaded from database records, tenant settings, or environment profiles.
 */

import { WhatsAppProvider, WhatsAppSenderContext } from './WhatsAppProvider';
import { WhatsAppProviderRegistry, whatsappProviderRegistry } from './WhatsAppProviderRegistry';

/**
 * Database configuration representation for a WhatsApp provider account.
 * Matches multi-tenant institutional database records in Momken ERP.
 */
export interface WhatsAppProviderConfig {
  /** Database primary key identifier */
  id: string;
  /** Tenant / School Organization ID */
  tenantId: string;
  /** Optional campus ID for multi-campus isolation */
  campusId?: string;
  /** Provider type (e.g., 'meta_cloud_api', 'infobip', 'twilio', 'mock') */
  providerType: string;
  /** Display label for administrative management */
  name?: string;
  /** Whether this provider configuration is enabled */
  isActive: boolean;
  /** Whether this is the default provider for outbound messages */
  isDefault?: boolean;
  /** WhatsApp Business Account ID (WABA ID) */
  wabaId?: string;
  /** Phone Number ID assigned by provider */
  phoneNumberId?: string;
  /** E.164 verified phone number */
  senderPhoneNumber?: string;
  /** API token / Bearer token / System User token */
  accessToken?: string;
  /** API key / Account SID / Client ID */
  apiKey?: string;
  /** API secret / Auth Token / Client Secret */
  apiSecret?: string;
  /** Webhook verification token or HMAC secret */
  webhookSecret?: string;
  /** Base API endpoint URL (for on-premises or custom proxies) */
  baseUrl?: string;
  /** Additional provider-specific settings or credentials */
  settings?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
  /** Timestamp when last updated */
  updatedAt?: Date | string;
}

/**
 * Options when instantiating or resolving a provider
 */
export interface ProviderFactoryOptions {
  /** Force a fresh instance instead of reading from cache */
  forceRefresh?: boolean;
  /** Custom registry to use instead of default global singleton */
  registry?: WhatsAppProviderRegistry;
}

export class ProviderFactory {
  private readonly registry: WhatsAppProviderRegistry;
  private readonly instanceCache = new Map<string, WhatsAppProvider>();

  constructor(registry: WhatsAppProviderRegistry = whatsappProviderRegistry) {
    this.registry = registry;
  }

  /**
   * Instantiates the appropriate WhatsAppProvider based on a database configuration record.
   * Caches instances per tenant and config ID unless forceRefresh is true.
   */
  public createProvider(
    config: WhatsAppProviderConfig,
    options: ProviderFactoryOptions = {}
  ): WhatsAppProvider {
    if (!config) {
      throw new Error('ProviderFactory: Configuration is required to instantiate a provider.');
    }

    if (!config.providerType) {
      throw new Error('ProviderFactory: config.providerType is required to determine the adapter.');
    }

    const cacheKey = `${config.tenantId || 'global'}:${config.id || config.providerType}`;

    if (!options.forceRefresh && this.instanceCache.has(cacheKey)) {
      return this.instanceCache.get(cacheKey)!;
    }

    const reg = options.registry || this.registry;
    const normalizedType = config.providerType.toLowerCase().trim();

    // 1. Check if registered in registry
    if (reg.has(normalizedType)) {
      const mergedConfig = {
        ...config,
        ...(config.settings || {}),
        ...(config.credentials || {}),
      };
      const instance = reg.get(normalizedType, mergedConfig);
      if (instance) {
        this.instanceCache.set(cacheKey, instance);
        return instance;
      }
    }

    // 2. Built-in fallback instantiations
    const provider = this.createBuiltInProvider(normalizedType, config);
    if (provider) {
      this.instanceCache.set(cacheKey, provider);
      return provider;
    }

    throw new Error(
      `ProviderFactory: No registered adapter or built-in provider found for type "${config.providerType}". ` +
      `Available registered types: [${reg.getRegisteredTypes().join(', ')}].`
    );
  }

  /**
   * Instantiates a provider directly by type with arbitrary configuration dictionary.
   */
  public createFromType(
    providerType: string,
    options?: Record<string, unknown>
  ): WhatsAppProvider {
    const config: WhatsAppProviderConfig = {
      id: `adhoc_${providerType}`,
      tenantId: 'default',
      providerType,
      isActive: true,
      settings: options,
    };
    return this.createProvider(config, { forceRefresh: true });
  }

  /**
   * Constructs an institutional WhatsAppSenderContext from a database provider configuration.
   */
  public createSenderContext(config: WhatsAppProviderConfig): WhatsAppSenderContext {
    return {
      tenantId: config.tenantId,
      campusId: config.campusId,
      wabaId: config.wabaId || '',
      phoneNumberId: config.phoneNumberId || '',
      senderPhoneNumber: config.senderPhoneNumber || '',
      displayPhoneNumberName: config.name,
      accessToken: config.accessToken,
      apiKey: config.apiKey,
      apiSecret: config.apiSecret,
      webhookSecret: config.webhookSecret,
      baseUrl: config.baseUrl,
      providerOptions: config.settings,
    };
  }

  /**
   * Clears cached provider instances (e.g. when database credentials change).
   */
  public clearCache(tenantId?: string): void {
    if (!tenantId) {
      this.instanceCache.clear();
      return;
    }

    for (const key of Array.from(this.instanceCache.keys())) {
      if (key.startsWith(`${tenantId}:`)) {
        this.instanceCache.delete(key);
      }
    }
  }

  /**
   * Creates a built-in provider adapter when external registry has not overridden it.
   */
  private createBuiltInProvider(
    normalizedType: string,
    config: WhatsAppProviderConfig
  ): WhatsAppProvider | null {
    switch (normalizedType) {
      case 'mock':
        return createMockWhatsAppProvider(config);
      case 'meta_cloud_api':
      case 'meta':
        return createMetaCloudWhatsAppProvider(config);
      default:
        return null;
    }
  }
}

/**
 * Lightweight built-in mock provider for local development, testing, and sandbox environments.
 */
function createMockWhatsAppProvider(config: WhatsAppProviderConfig): WhatsAppProvider {
  return {
    providerId: 'mock',
    providerName: 'Mock WhatsApp Provider',
    version: '1.0.0',
    getCapabilities() {
      return {
        supportsTemplates: true,
        supportsMedia: true,
        supportsInteractive: true,
        supportsReaction: true,
        supportsLocation: true,
        supportsContacts: true,
        supportsStatusTracking: true,
        supportsMediaUpload: true,
        supportsWebhookVerification: true,
        supportedMediaTypes: ['image', 'document', 'video', 'audio', 'sticker'],
        supportedInteractiveTypes: ['button', 'list', 'cta_url', 'flow'],
        maxBatchSize: 100,
        rateLimitPerSecond: 50,
      };
    },
    async sendText(params, ctx) {
      const msgId = `mock_txt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return {
        success: true,
        messageId: msgId,
        providerMessageId: `wamid.${msgId}`,
        status: 'sent',
        timestamp: new Date(),
        recipientId: params.to,
        rawResponse: { mock: true, payload: params, context: ctx || config },
      };
    },
    async sendTemplate(params, ctx) {
      const msgId = `mock_tmpl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return {
        success: true,
        messageId: msgId,
        providerMessageId: `wamid.${msgId}`,
        status: 'sent',
        timestamp: new Date(),
        recipientId: params.to,
        rawResponse: { mock: true, payload: params, context: ctx || config },
      };
    },
    async sendMedia(params, ctx) {
      const msgId = `mock_med_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return {
        success: true,
        messageId: msgId,
        providerMessageId: `wamid.${msgId}`,
        status: 'sent',
        timestamp: new Date(),
        recipientId: params.to,
        rawResponse: { mock: true, payload: params, context: ctx || config },
      };
    },
    async sendInteractive(params, ctx) {
      const msgId = `mock_int_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      return {
        success: true,
        messageId: msgId,
        providerMessageId: `wamid.${msgId}`,
        status: 'sent',
        timestamp: new Date(),
        recipientId: params.to,
        rawResponse: { mock: true, payload: params, context: ctx || config },
      };
    },
    async uploadMedia(params) {
      const mediaId = `mock_media_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return {
        mediaId,
        url: `https://mock.storage.schools.internal/media/${mediaId}`,
        mimeType: params.mimeType,
        fileSize: 1024,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    },
    async getMessageStatus(messageId) {
      return {
        messageId,
        providerMessageId: `wamid.${messageId}`,
        status: 'delivered',
        timestamp: new Date(),
      };
    },
    verifyWebhook(params) {
      if (params.query && params.query['hub.mode'] === 'subscribe') {
        const verifyToken = params.secret || config.webhookSecret;
        if (params.query['hub.verify_token'] === verifyToken) {
          return { isValid: true, challenge: String(params.query['hub.challenge']) };
        }
      }
      return { isValid: true };
    },
    parseWebhook(rawPayload) {
      return {
        events: [],
        rawPayload,
      };
    },
  };
}

/**
 * Built-in Meta Cloud API provider adapter
 */
function createMetaCloudWhatsAppProvider(config: WhatsAppProviderConfig): WhatsAppProvider {
  const apiVersion = (config.settings?.apiVersion as string) || 'v20.0';
  const baseUrl = config.baseUrl || 'https://graph.facebook.com';

  return {
    providerId: 'meta_cloud_api',
    providerName: 'Meta Cloud API (Official WhatsApp Business)',
    version: apiVersion,
    getCapabilities() {
      return {
        supportsTemplates: true,
        supportsMedia: true,
        supportsInteractive: true,
        supportsReaction: true,
        supportsLocation: true,
        supportsContacts: true,
        supportsStatusTracking: true,
        supportsMediaUpload: true,
        supportsWebhookVerification: true,
        supportedMediaTypes: ['image', 'document', 'video', 'audio', 'sticker'],
        supportedInteractiveTypes: ['button', 'list', 'cta_url', 'flow'],
        maxBatchSize: 1,
        rateLimitPerSecond: 80,
        apiVersion,
      };
    },
    async sendText(params, ctx) {
      const effectivePhoneNumberId = ctx?.phoneNumberId || config.phoneNumberId;
      const effectiveToken = ctx?.accessToken || config.accessToken;

      if (!effectivePhoneNumberId) {
        throw new Error('MetaCloudWhatsAppProvider: phoneNumberId is required to send text messages.');
      }
      if (!effectiveToken) {
        throw new Error('MetaCloudWhatsAppProvider: accessToken is required to send text messages.');
      }

      const endpoint = `${baseUrl}/${apiVersion}/${effectivePhoneNumberId}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: params.to.replace(/[^\d+]/g, ''),
        type: 'text',
        text: {
          preview_url: Boolean(params.previewUrl),
          body: params.text,
        },
      };

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${effectiveToken}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
          const errMsg = data?.error?.message || `Meta API HTTP error: ${response.status}`;
          return {
            success: false,
            messageId: `failed_${Date.now()}`,
            status: 'failed',
            timestamp: new Date(),
            recipientId: params.to,
            error: {
              code: String(data?.error?.code || 'META_API_ERROR'),
              message: errMsg,
              details: data?.error,
            },
            rawResponse: data,
          };
        }

        const msgObj = data.messages?.[0];
        return {
          success: true,
          messageId: msgObj?.id || `meta_${Date.now()}`,
          providerMessageId: msgObj?.id,
          status: 'accepted',
          timestamp: new Date(),
          recipientId: params.to,
          rawResponse: data,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          messageId: `err_${Date.now()}`,
          status: 'failed',
          timestamp: new Date(),
          recipientId: params.to,
          error: {
            code: 'NETWORK_ERROR',
            message,
          },
        };
      }
    },
    async sendTemplate(params, ctx) {
      const effectivePhoneNumberId = ctx?.phoneNumberId || config.phoneNumberId;
      const effectiveToken = ctx?.accessToken || config.accessToken;

      if (!effectivePhoneNumberId || !effectiveToken) {
        throw new Error('MetaCloudWhatsAppProvider: phoneNumberId and accessToken are required.');
      }

      const endpoint = `${baseUrl}/${apiVersion}/${effectivePhoneNumberId}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: params.to.replace(/[^\d+]/g, ''),
        type: 'template',
        template: {
          name: params.templateName,
          language: {
            code: params.languageCode,
          },
          components: params.components,
        },
      };

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${effectiveToken}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
          return {
            success: false,
            messageId: `failed_${Date.now()}`,
            status: 'failed',
            timestamp: new Date(),
            recipientId: params.to,
            error: {
              code: String(data?.error?.code || 'META_TEMPLATE_ERROR'),
              message: data?.error?.message || 'Meta template dispatch failed',
              details: data?.error,
            },
            rawResponse: data,
          };
        }

        const msgObj = data.messages?.[0];
        return {
          success: true,
          messageId: msgObj?.id || `meta_${Date.now()}`,
          providerMessageId: msgObj?.id,
          status: 'accepted',
          timestamp: new Date(),
          recipientId: params.to,
          rawResponse: data,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          messageId: `err_${Date.now()}`,
          status: 'failed',
          timestamp: new Date(),
          recipientId: params.to,
          error: { code: 'NETWORK_ERROR', message },
        };
      }
    },
    async sendMedia(params, ctx) {
      const effectivePhoneNumberId = ctx?.phoneNumberId || config.phoneNumberId;
      const effectiveToken = ctx?.accessToken || config.accessToken;

      if (!effectivePhoneNumberId || !effectiveToken) {
        throw new Error('MetaCloudWhatsAppProvider: phoneNumberId and accessToken are required.');
      }

      const endpoint = `${baseUrl}/${apiVersion}/${effectivePhoneNumberId}/messages`;
      const mediaObject: Record<string, unknown> = {};
      if (params.mediaId) {
        mediaObject.id = params.mediaId;
      } else if (params.url) {
        mediaObject.link = params.url;
      }
      if (params.caption) {
        mediaObject.caption = params.caption;
      }
      if (params.filename) {
        mediaObject.filename = params.filename;
      }

      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: params.to.replace(/[^\d+]/g, ''),
        type: params.mediaType,
        [params.mediaType]: mediaObject,
      };

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${effectiveToken}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
          return {
            success: false,
            messageId: `failed_${Date.now()}`,
            status: 'failed',
            timestamp: new Date(),
            recipientId: params.to,
            error: {
              code: String(data?.error?.code || 'META_MEDIA_ERROR'),
              message: data?.error?.message || 'Meta media dispatch failed',
              details: data?.error,
            },
            rawResponse: data,
          };
        }

        const msgObj = data.messages?.[0];
        return {
          success: true,
          messageId: msgObj?.id || `meta_${Date.now()}`,
          providerMessageId: msgObj?.id,
          status: 'accepted',
          timestamp: new Date(),
          recipientId: params.to,
          rawResponse: data,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          messageId: `err_${Date.now()}`,
          status: 'failed',
          timestamp: new Date(),
          recipientId: params.to,
          error: { code: 'NETWORK_ERROR', message },
        };
      }
    },
    async sendInteractive(params, ctx) {
      const effectivePhoneNumberId = ctx?.phoneNumberId || config.phoneNumberId;
      const effectiveToken = ctx?.accessToken || config.accessToken;

      if (!effectivePhoneNumberId || !effectiveToken) {
        throw new Error('MetaCloudWhatsAppProvider: phoneNumberId and accessToken are required.');
      }

      const endpoint = `${baseUrl}/${apiVersion}/${effectivePhoneNumberId}/messages`;
      const payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: params.to.replace(/[^\d+]/g, ''),
        type: 'interactive',
        interactive: params.interactive,
      };

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${effectiveToken}`,
          },
          body: JSON.stringify(payload),
        });

        const data = await response.json();
        if (!response.ok) {
          return {
            success: false,
            messageId: `failed_${Date.now()}`,
            status: 'failed',
            timestamp: new Date(),
            recipientId: params.to,
            error: {
              code: String(data?.error?.code || 'META_INTERACTIVE_ERROR'),
              message: data?.error?.message || 'Meta interactive dispatch failed',
              details: data?.error,
            },
            rawResponse: data,
          };
        }

        const msgObj = data.messages?.[0];
        return {
          success: true,
          messageId: msgObj?.id || `meta_${Date.now()}`,
          providerMessageId: msgObj?.id,
          status: 'accepted',
          timestamp: new Date(),
          recipientId: params.to,
          rawResponse: data,
        };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        return {
          success: false,
          messageId: `err_${Date.now()}`,
          status: 'failed',
          timestamp: new Date(),
          recipientId: params.to,
          error: { code: 'NETWORK_ERROR', message },
        };
      }
    },
    verifyWebhook(params) {
      if (params.query && params.query['hub.mode'] === 'subscribe') {
        const verifyToken = params.secret || config.webhookSecret;
        if (params.query['hub.verify_token'] === verifyToken) {
          return { isValid: true, challenge: String(params.query['hub.challenge']) };
        }
        return { isValid: false, reason: 'Webhook verification token mismatch.' };
      }
      return { isValid: true };
    },
  };
}

/**
 * Global singleton ProviderFactory instance
 */
export const providerFactory = new ProviderFactory();
