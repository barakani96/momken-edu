/**
 * Meta Cloud API WhatsApp Provider
 * Momken Education ERP — Multi-Tenant Institutional Communication Engine
 *
 * Official Meta Graph API integration supporting Cloud API v20.0+
 */

import { WhatsAppProvider } from './whatsapp-provider.interface';
import {
  WhatsAppProviderId,
  WhatsAppSenderContext,
  WhatsAppProviderCapabilities,
  WhatsAppProviderHealth,
  WhatsAppSendMessageRequest,
  WhatsAppSendMessageResponse,
  WhatsAppTemplateMessageRequest,
  WhatsAppTextMessageRequest,
  WhatsAppMediaMessageRequest,
  WhatsAppInteractiveMessageRequest,
  WhatsAppReactionMessageRequest,
  WhatsAppLocationMessageRequest,
  WhatsAppContactMessageRequest,
  WhatsAppTemplate,
  WhatsAppTemplateSyncFilter,
  WhatsAppTemplateSyncResult,
  WhatsAppCreateTemplateRequest,
  WhatsAppDeleteTemplateResponse,
  WhatsAppWebhookConfig,
  WebhookSubscriptionVerifyParams,
  WebhookSubscriptionVerifyResult,
  WebhookSignatureVerificationParams,
  WebhookSignatureVerificationResult,
  WhatsAppInboundEvent,
  WhatsAppMediaUploadRequest,
  WhatsAppMediaUploadResponse,
} from './whatsapp.types';
import {
  WhatsAppProviderError,
  WhatsAppRateLimitExceededError,
  WhatsAppAuthenticationError,
  WhatsAppInvalidPhoneNumberError,
} from './whatsapp.errors';
import { isValidE164, verifyMetaSignatureSync } from './whatsapp.security';

export interface MetaCloudApiConfig {
  apiVersion?: string;
  baseUrl?: string;
  systemUserToken?: string;
}

export class MetaCloudWhatsAppProvider implements WhatsAppProvider {
  public readonly id: WhatsAppProviderId = 'meta_cloud_api';
  public readonly name: string = 'Meta WhatsApp Cloud API';
  public readonly version: string = '20.0.0';

  public readonly capabilities: WhatsAppProviderCapabilities = {
    supportsTemplateSync: true,
    supportsInteractiveMessages: true,
    supportsMediaUpload: true,
    supportsReactions: true,
    supportsLocationMessages: true,
    supportsContactMessages: true,
    supportsWebhookSignatureVerification: true,
    supports24HourWindowDetection: true,
    supportsFlows: true,
  };

  private readonly apiVersion: string;
  private readonly baseUrl: string;

  constructor(config?: MetaCloudApiConfig) {
    this.apiVersion = config?.apiVersion || 'v20.0';
    this.baseUrl = config?.baseUrl || 'https://graph.facebook.com';
  }

  /* ========================================================================
   * 1. HEALTH & CONNECTIVITY
   * ======================================================================== */

  public async checkHealth(context: WhatsAppSenderContext): Promise<WhatsAppProviderHealth> {
    const token = this.resolveAccessToken(context);
    const start = Date.now();

    try {
      const response = await fetch(
        `${this.baseUrl}/${this.apiVersion}/${context.phoneNumberId}?fields=verified_name,code_verification_status,quality_rating`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const latencyMs = Date.now() - start;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          status: 'DOWN',
          latencyMs,
          lastCheckedAt: new Date(),
          error: errorData.error?.message || `HTTP ${response.status} ${response.statusText}`,
          providerDetails: errorData,
        };
      }

      const data = await response.json();
      return {
        status: 'HEALTHY',
        latencyMs,
        lastCheckedAt: new Date(),
        providerDetails: data,
      };
    } catch (err: any) {
      return {
        status: 'DOWN',
        latencyMs: Date.now() - start,
        lastCheckedAt: new Date(),
        error: err.message || 'Network connection to Meta Graph API failed',
      };
    }
  }

  /* ========================================================================
   * 2. MESSAGE HANDLING
   * ======================================================================== */

  public async sendMessage(
    request: WhatsAppSendMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    switch (request.type) {
      case 'template':
        return this.sendTemplateMessage(request, context);
      case 'text':
        return this.sendTextMessage(request, context);
      case 'media':
        return this.sendMediaMessage(request, context);
      case 'interactive':
        return this.sendInteractiveMessage(request, context);
      case 'reaction':
        return this.sendReaction(request, context);
      case 'location':
        return this.sendLocation(request, context);
      case 'contact':
        return this.sendContact(request, context);
      default:
        throw new WhatsAppProviderError(`Unsupported WhatsApp message type: ${(request as any).type}`, {
          code: 'CAPABILITY_NOT_SUPPORTED',
          statusCode: 400,
        });
    }
  }

  public async sendTemplateMessage(
    request: WhatsAppTemplateMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    this.assertValidPhoneNumber(request.recipientNumber);

    const payload: Record<string, unknown> = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.cleanPhoneNumber(request.recipientNumber),
      type: 'template',
      template: {
        name: request.payload.templateName,
        language: request.payload.language,
        components: request.payload.components,
      },
    };

    return this.postToMessagesApi(payload, context, request.recipientNumber, 'UTILITY');
  }

  public async sendTextMessage(
    request: WhatsAppTextMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    this.assertValidPhoneNumber(request.recipientNumber);

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.cleanPhoneNumber(request.recipientNumber),
      type: 'text',
      text: {
        preview_url: request.payload.previewUrl ?? false,
        body: request.payload.body,
      },
    };

    return this.postToMessagesApi(payload, context, request.recipientNumber, 'SERVICE');
  }

  public async sendMediaMessage(
    request: WhatsAppMediaMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    this.assertValidPhoneNumber(request.recipientNumber);

    const mediaObj: Record<string, unknown> = {};
    if (request.payload.mediaId) {
      mediaObj.id = request.payload.mediaId;
    } else if (request.payload.url) {
      mediaObj.link = request.payload.url;
    }

    if (request.payload.caption) {
      mediaObj.caption = request.payload.caption;
    }
    if (request.payload.filename && request.payload.type === 'document') {
      mediaObj.filename = request.payload.filename;
    }

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.cleanPhoneNumber(request.recipientNumber),
      type: request.payload.type,
      [request.payload.type]: mediaObj,
    };

    return this.postToMessagesApi(payload, context, request.recipientNumber, 'SERVICE');
  }

  public async sendInteractiveMessage(
    request: WhatsAppInteractiveMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    this.assertValidPhoneNumber(request.recipientNumber);

    const interactivePayload: Record<string, unknown> = {
      type: request.payload.type,
      body: request.payload.body,
    };

    if (request.payload.header) {
      interactivePayload.header = request.payload.header;
    }
    if (request.payload.footer) {
      interactivePayload.footer = request.payload.footer;
    }
    interactivePayload.action = request.payload.action;

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.cleanPhoneNumber(request.recipientNumber),
      type: 'interactive',
      interactive: interactivePayload,
    };

    return this.postToMessagesApi(payload, context, request.recipientNumber, 'SERVICE');
  }

  public async sendReaction(
    request: WhatsAppReactionMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    this.assertValidPhoneNumber(request.recipientNumber);

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.cleanPhoneNumber(request.recipientNumber),
      type: 'reaction',
      reaction: {
        message_id: request.payload.messageId,
        emoji: request.payload.emoji,
      },
    };

    return this.postToMessagesApi(payload, context, request.recipientNumber, 'SERVICE');
  }

  public async sendLocation(
    request: WhatsAppLocationMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    this.assertValidPhoneNumber(request.recipientNumber);

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.cleanPhoneNumber(request.recipientNumber),
      type: 'location',
      location: request.payload,
    };

    return this.postToMessagesApi(payload, context, request.recipientNumber, 'SERVICE');
  }

  public async sendContact(
    request: WhatsAppContactMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    this.assertValidPhoneNumber(request.recipientNumber);

    const payload = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: this.cleanPhoneNumber(request.recipientNumber),
      type: 'contacts',
      contacts: request.payload.contacts,
    };

    return this.postToMessagesApi(payload, context, request.recipientNumber, 'SERVICE');
  }

  public async markMessageAsRead(messageId: string, context: WhatsAppSenderContext): Promise<boolean> {
    const token = this.resolveAccessToken(context);
    try {
      const response = await fetch(`${this.baseUrl}/${this.apiVersion}/${context.phoneNumberId}/messages`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          status: 'read',
          message_id: messageId,
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  public async uploadMedia(
    request: WhatsAppMediaUploadRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppMediaUploadResponse> {
    const token = this.resolveAccessToken(context);
    const formData = new FormData();
    formData.append('messaging_product', 'whatsapp');

    const blob = request.file instanceof Blob ? request.file : new Blob([request.file as any], { type: request.mimeType });
    formData.append('file', blob, request.filename);
    formData.append('type', request.mimeType);

    const response = await fetch(`${this.baseUrl}/${this.apiVersion}/${context.phoneNumberId}/media`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new WhatsAppProviderError(
        errorData.error?.message || `Failed to upload media to WhatsApp: HTTP ${response.status}`,
        { code: 'MEDIA_UPLOAD_FAILED', statusCode: response.status, details: errorData }
      );
    }

    const data = await response.json();
    return {
      mediaId: data.id,
      mimeType: request.mimeType,
    };
  }

  /* ========================================================================
   * 3. TEMPLATE SYNCHRONIZATION
   * ======================================================================== */

  public async syncTemplates(
    context: WhatsAppSenderContext,
    filter?: WhatsAppTemplateSyncFilter
  ): Promise<WhatsAppTemplateSyncResult> {
    const token = this.resolveAccessToken(context);
    const params = new URLSearchParams();
    params.set('limit', String(filter?.limit || 100));

    if (filter?.cursor) {
      params.set('after', filter.cursor);
    }

    const url = `${this.baseUrl}/${this.apiVersion}/${context.wabaId}/message_templates?${params.toString()}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new WhatsAppProviderError(err.error?.message || `Template sync failed: HTTP ${response.status}`, {
        code: 'PROVIDER_ERROR',
        statusCode: response.status,
        details: err,
      });
    }

    const data = await response.json();
    const rawTemplates: any[] = data.data || [];

    const templates: WhatsAppTemplate[] = rawTemplates.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      language: t.language,
      status: t.status,
      components: t.components || [],
      rejectionReason: t.rejected_reason,
      qualityRating: t.quality_score?.score,
      updatedAt: new Date(),
    }));

    return {
      templates,
      nextCursor: data.paging?.cursors?.after,
      totalCount: templates.length,
      syncedAt: new Date(),
    };
  }

  public async getTemplateByName(
    templateName: string,
    language: string,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppTemplate | null> {
    const token = this.resolveAccessToken(context);
    const params = new URLSearchParams({
      name: templateName,
    });

    const url = `${this.baseUrl}/${this.apiVersion}/${context.wabaId}/message_templates?${params.toString()}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) return null;

    const data = await response.json();
    const match = (data.data || []).find(
      (t: any) => t.name === templateName && t.language === language
    );

    if (!match) return null;

    return {
      id: match.id,
      name: match.name,
      category: match.category,
      language: match.language,
      status: match.status,
      components: match.components || [],
      rejectionReason: match.rejected_reason,
      qualityRating: match.quality_score?.score,
      updatedAt: new Date(),
    };
  }

  public async createTemplate(
    request: WhatsAppCreateTemplateRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppTemplate> {
    const token = this.resolveAccessToken(context);
    const url = `${this.baseUrl}/${this.apiVersion}/${context.wabaId}/message_templates`;

    const body = {
      name: request.name,
      category: request.category,
      language: request.language,
      components: request.components,
      allow_category_change: request.allowCategoryChange ?? true,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new WhatsAppProviderError(err.error?.message || `Failed to create template: HTTP ${response.status}`, {
        code: 'PROVIDER_ERROR',
        statusCode: response.status,
        details: err,
      });
    }

    const data = await response.json();
    return {
      id: data.id,
      name: request.name,
      category: request.category,
      language: request.language,
      status: data.status || 'PENDING',
      components: request.components,
      updatedAt: new Date(),
    };
  }

  public async deleteTemplate(
    templateName: string,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppDeleteTemplateResponse> {
    const token = this.resolveAccessToken(context);
    const params = new URLSearchParams({ name: templateName });
    const url = `${this.baseUrl}/${this.apiVersion}/${context.wabaId}/message_templates?${params.toString()}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json().catch(() => ({}));
    return {
      success: response.ok && data.success === true,
      templateName,
    };
  }

  /* ========================================================================
   * 4. WEBHOOK VERIFICATION & PARSING
   * ======================================================================== */

  public verifyWebhookSubscription(
    params: WebhookSubscriptionVerifyParams,
    config: WhatsAppWebhookConfig
  ): WebhookSubscriptionVerifyResult {
    if (params.mode === 'subscribe' && params.verifyToken === config.verifyToken) {
      return {
        isValid: true,
        challengeResponse: params.challenge,
        statusCode: 200,
      };
    }

    return {
      isValid: false,
      statusCode: 403,
      errorMessage: 'Verification token or mode mismatch for Meta Webhook subscription',
    };
  }

  public verifyWebhookSignature(
    params: WebhookSignatureVerificationParams
  ): WebhookSignatureVerificationResult {
    return verifyMetaSignatureSync(params);
  }

  public parseWebhookPayload(rawPayload: unknown): WhatsAppInboundEvent[] {
    const payload = rawPayload as any;
    const events: WhatsAppInboundEvent[] = [];

    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.entry)) {
      return events;
    }

    for (const entry of payload.entry) {
      if (!Array.isArray(entry.changes)) continue;

      for (const change of entry.changes) {
        const val = change.value;
        if (!val) continue;

        const phoneNumberId = val.metadata?.phone_number_id || 'unknown';

        // Inbound message events
        if (Array.isArray(val.messages)) {
          for (const msg of val.messages) {
            const event: WhatsAppInboundEvent = {
              eventType: 'MESSAGE_RECEIVED',
              providerMessageId: msg.id,
              senderNumber: `+${msg.from}`,
              recipientPhoneNumberId: phoneNumberId,
              timestamp: new Date(Number(msg.timestamp) * 1000 || Date.now()),
              type: msg.type || 'text',
              rawPayload: msg,
            };

            if (msg.text) {
              event.text = { body: msg.text.body };
            }
            if (msg.image || msg.document || msg.audio || msg.video) {
              const m = msg.image || msg.document || msg.audio || msg.video;
              event.media = {
                type: msg.type,
                mediaId: m.id,
                mimeType: m.mime_type,
                sha256: m.sha256,
                caption: m.caption,
                filename: m.filename,
              };
            }
            if (msg.interactive) {
              const reply = msg.interactive.button_reply || msg.interactive.list_reply;
              if (reply) {
                event.interactiveResponse = {
                  type: msg.interactive.type,
                  id: reply.id,
                  title: reply.title,
                  description: reply.description,
                };
              }
            }
            events.push(event);
          }
        }

        // Outbound status update events
        if (Array.isArray(val.statuses)) {
          for (const s of val.statuses) {
            events.push({
              eventType: 'STATUS_UPDATE',
              providerMessageId: s.id,
              recipientNumber: `+${s.recipient_id}`,
              status: s.status.toUpperCase(),
              timestamp: new Date(Number(s.timestamp) * 1000 || Date.now()),
              conversation: s.conversation
                ? {
                    id: s.conversation.id,
                    category: (s.conversation.origin?.type || 'UTILITY').toUpperCase(),
                  }
                : undefined,
              pricing: s.pricing,
              errors: s.errors,
              rawPayload: s,
            });
          }
        }
      }
    }

    return events;
  }

  /* ========================================================================
   * PRIVATE HTTP & SECURITY UTILS
   * ======================================================================== */

  private resolveAccessToken(context: WhatsAppSenderContext): string {
    const customToken = context.providerOptions?.accessToken as string | undefined;
    if (customToken) return customToken;
    return process.env.WHATSAPP_CLOUD_API_TOKEN || '';
  }

  private cleanPhoneNumber(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  private assertValidPhoneNumber(phone: string): void {
    if (!isValidE164(phone)) {
      throw new WhatsAppInvalidPhoneNumberError(phone);
    }
  }

  private async postToMessagesApi(
    payload: Record<string, unknown>,
    context: WhatsAppSenderContext,
    recipientNumber: string,
    defaultCategory: 'UTILITY' | 'SERVICE'
  ): Promise<WhatsAppSendMessageResponse> {
    const token = this.resolveAccessToken(context);
    const url = `${this.baseUrl}/${this.apiVersion}/${context.phoneNumberId}/messages`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (err: any) {
      throw new WhatsAppProviderError(err.message || 'Network request failed', {
        code: 'NETWORK_ERROR',
        statusCode: 503,
        isRetryable: true,
      });
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const err = data.error || {};
      if (response.status === 401) {
        throw new WhatsAppAuthenticationError(err.message || 'WhatsApp API authentication failed', err);
      }
      if (response.status === 429) {
        throw new WhatsAppRateLimitExceededError(err.message || 'WhatsApp API rate limit exceeded', undefined, err);
      }
      return {
        success: false,
        status: 'FAILED',
        timestamp: new Date(),
        recipientNumber,
        rawResponse: data,
        error: {
          code: String(err.code || 'UNKNOWN'),
          message: err.message || `API error ${response.status}`,
          details: err,
        },
      };
    }

    const msgId = data.messages?.[0]?.id;
    return {
      success: true,
      providerMessageId: msgId,
      status: 'ACCEPTED',
      timestamp: new Date(),
      recipientNumber,
      conversationCategory: defaultCategory,
      rawResponse: data,
    };
  }
}
