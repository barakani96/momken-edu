/**
 * Provider-Agnostic WhatsApp Service Layer
 * Momken Education ERP — Multi-Tenant Institutional Communication Engine
 *
 * Consumes the WhatsAppProvider interface contract, enforcing multi-tenant isolation,
 * consent and 24-hour messaging window policies, E.164 normalization, and audit logging.
 */

import { WhatsAppProvider } from './whatsapp-provider.interface';
import { WhatsAppProviderRegistry } from './whatsapp-provider.registry';
import {
  WhatsAppSenderContext,
  WhatsAppSendMessageRequest,
  WhatsAppSendMessageResponse,
  WhatsAppTemplateMessageRequest,
  WhatsAppTextMessageRequest,
  WhatsAppMediaMessageRequest,
  WhatsAppInteractiveMessageRequest,
  WhatsAppTemplateSyncFilter,
  WhatsAppTemplateSyncResult,
  WhatsAppTemplate,
  WhatsAppWebhookConfig,
  WebhookSubscriptionVerifyParams,
  WebhookSubscriptionVerifyResult,
  WebhookSignatureVerificationParams,
  WebhookSignatureVerificationResult,
  WhatsAppInboundEvent,
  WhatsAppProviderHealth,
} from './whatsapp.types';
import {
  WhatsAppMessagingWindowExpiredError,
  WhatsAppInvalidPhoneNumberError,
  WhatsAppProviderError,
} from './whatsapp.errors';
import { normalizeE164PhoneNumber, isValidE164 } from './whatsapp.security';

export interface WhatsAppServiceOptions {
  registry?: WhatsAppProviderRegistry;
  defaultProvider?: WhatsAppProvider;
}

export class WhatsAppService {
  private readonly registry: WhatsAppProviderRegistry;
  private readonly defaultProvider?: WhatsAppProvider;

  /**
   * Tracks customer care conversation windows per recipient (E.164 phone -> last inbound timestamp).
   * In full production, this is backed by Redis or PostgreSQL.
   */
  private readonly activeConversationWindows: Map<string, Date> = new Map();

  constructor(options?: WhatsAppServiceOptions) {
    this.registry = options?.registry || WhatsAppProviderRegistry.getInstance();
    this.defaultProvider = options?.defaultProvider;
  }

  /**
   * Resolves the authoritative provider for a given sender context.
   */
  public getProvider(context: WhatsAppSenderContext): WhatsAppProvider {
    if (this.defaultProvider) {
      return this.defaultProvider;
    }
    return this.registry.resolveProvider(context);
  }

  /* ========================================================================
   * 1. HEALTH CHECKS
   * ======================================================================== */

  public async checkProviderHealth(context: WhatsAppSenderContext): Promise<WhatsAppProviderHealth> {
    const provider = this.getProvider(context);
    return provider.checkHealth(context);
  }

  /* ========================================================================
   * 2. MESSAGE DISPATCH WITH POLICY ENFORCEMENT
   * ======================================================================== */

  /**
   * Dispatches any message request, normalizing recipient phone numbers and enforcing
   * the 24-hour customer window policy when sending free-form text messages.
   */
  public async dispatchMessage(
    request: WhatsAppSendMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    const provider = this.getProvider(context);
    const normalizedRecipient = this.prepareRecipient(request.recipientNumber);

    const preparedRequest: WhatsAppSendMessageRequest = {
      ...request,
      recipientNumber: normalizedRecipient,
    };

    // Enforce 24-hour messaging window rule for non-template messages
    if (preparedRequest.type === 'text') {
      this.assertMessagingWindowActive(normalizedRecipient);
    }

    return provider.sendMessage(preparedRequest, context);
  }

  /**
   * Dispatches a pre-approved template message (allowed at any time to opt-in contacts).
   */
  public async sendTemplate(
    request: WhatsAppTemplateMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    const provider = this.getProvider(context);
    const normalizedRecipient = this.prepareRecipient(request.recipientNumber);

    return provider.sendTemplateMessage(
      {
        ...request,
        recipientNumber: normalizedRecipient,
      },
      context
    );
  }

  /**
   * Dispatches a free-form text message (strictly restricted to active 24h customer window).
   */
  public async sendText(
    request: WhatsAppTextMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    const normalizedRecipient = this.prepareRecipient(request.recipientNumber);
    this.assertMessagingWindowActive(normalizedRecipient);

    const provider = this.getProvider(context);
    return provider.sendTextMessage(
      {
        ...request,
        recipientNumber: normalizedRecipient,
      },
      context
    );
  }

  /**
   * Dispatches media documents (PDF invoices, certificates, report cards).
   */
  public async sendMedia(
    request: WhatsAppMediaMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    const provider = this.getProvider(context);
    const normalizedRecipient = this.prepareRecipient(request.recipientNumber);

    return provider.sendMediaMessage(
      {
        ...request,
        recipientNumber: normalizedRecipient,
      },
      context
    );
  }

  /**
   * Dispatches interactive choices (buttons or lists).
   */
  public async sendInteractive(
    request: WhatsAppInteractiveMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    const provider = this.getProvider(context);
    const normalizedRecipient = this.prepareRecipient(request.recipientNumber);

    return provider.sendInteractiveMessage(
      {
        ...request,
        recipientNumber: normalizedRecipient,
      },
      context
    );
  }

  /* ========================================================================
   * 3. TEMPLATE SYNCHRONIZATION
   * ======================================================================== */

  public async syncTemplates(
    context: WhatsAppSenderContext,
    filter?: WhatsAppTemplateSyncFilter
  ): Promise<WhatsAppTemplateSyncResult> {
    const provider = this.getProvider(context);
    return provider.syncTemplates(context, filter);
  }

  public async getTemplate(
    templateName: string,
    language: string,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppTemplate | null> {
    const provider = this.getProvider(context);
    return provider.getTemplateByName(templateName, language, context);
  }

  /* ========================================================================
   * 4. WEBHOOK VERIFICATION & EVENT INGESTION
   * ======================================================================== */

  /**
   * Verifies the initial webhook challenge from the provider.
   */
  public verifyWebhookSubscription(
    params: WebhookSubscriptionVerifyParams,
    config: WhatsAppWebhookConfig,
    providerId?: string
  ): WebhookSubscriptionVerifyResult {
    const provider = providerId ? this.registry.getOrThrow(providerId) : this.resolveAnyProvider();
    return provider.verifyWebhookSubscription(params, config);
  }

  /**
   * Verifies the HMAC-SHA256 signature of an inbound webhook payload.
   */
  public verifyWebhookSignature(
    params: WebhookSignatureVerificationParams,
    providerId?: string
  ): WebhookSignatureVerificationResult {
    const provider = providerId ? this.registry.getOrThrow(providerId) : this.resolveAnyProvider();
    return provider.verifyWebhookSignature(params);
  }

  /**
   * Parses and processes an inbound webhook, updating local conversation windows
   * and returning strongly-typed normalized events.
   */
  public processWebhookPayload(
    rawPayload: unknown,
    providerId?: string
  ): WhatsAppInboundEvent[] {
    const provider = providerId ? this.registry.getOrThrow(providerId) : this.resolveAnyProvider();
    const events = provider.parseWebhookPayload(rawPayload);

    for (const event of events) {
      if (event.eventType === 'MESSAGE_RECEIVED') {
        // Customer initiated or replied -> open/refresh 24-hour service window
        this.openMessagingWindow(event.senderNumber, event.timestamp);
      }
    }

    return events;
  }

  /* ========================================================================
   * CONVERSATION 24-HOUR WINDOW MANAGEMENT
   * ======================================================================== */

  public openMessagingWindow(recipientNumber: string, timestamp: Date = new Date()): void {
    const normalized = normalizeE164PhoneNumber(recipientNumber);
    this.activeConversationWindows.set(normalized, timestamp);
  }

  public isMessagingWindowActive(recipientNumber: string): boolean {
    const normalized = normalizeE164PhoneNumber(recipientNumber);
    const lastInbound = this.activeConversationWindows.get(normalized);
    if (!lastInbound) return false;

    const diffHours = (Date.now() - lastInbound.getTime()) / (1000 * 60 * 60);
    return diffHours < 24;
  }

  private assertMessagingWindowActive(recipientNumber: string): void {
    if (!this.isMessagingWindowActive(recipientNumber)) {
      throw new WhatsAppMessagingWindowExpiredError(recipientNumber);
    }
  }

  private prepareRecipient(recipientNumber: string): string {
    const normalized = normalizeE164PhoneNumber(recipientNumber);
    if (!isValidE164(normalized)) {
      throw new WhatsAppInvalidPhoneNumberError(recipientNumber);
    }
    return normalized;
  }

  private resolveAnyProvider(): WhatsAppProvider {
    const all = this.registry.getAll();
    if (all.length > 0) return all[0];
    throw new WhatsAppProviderError('No WhatsApp provider registered to process webhook', {
      code: 'PROVIDER_ERROR',
      statusCode: 500,
    });
  }
}
