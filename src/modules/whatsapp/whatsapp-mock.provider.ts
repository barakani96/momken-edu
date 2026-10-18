/**
 * Mock WhatsApp Provider Implementation
 * Momken Education ERP — Institutional Testing & Development Adapter
 *
 * Implements the full WhatsAppProvider interface contract for automated tests,
 * sandbox trials, and local development.
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
  WhatsAppTemplateNotApprovedError,
  WhatsAppInvalidPhoneNumberError,
} from './whatsapp.errors';

export class MockWhatsAppProvider implements WhatsAppProvider {
  public readonly id: WhatsAppProviderId = 'mock';
  public readonly name: string = 'Momken In-Memory Sandbox WhatsApp Provider';
  public readonly version: string = '1.0.0';

  public readonly capabilities: WhatsAppProviderCapabilities = {
    supportsTemplateSync: true,
    supportsInteractiveMessages: true,
    supportsMediaUpload: true,
    supportsReactions: true,
    supportsLocationMessages: true,
    supportsContactMessages: true,
    supportsWebhookSignatureVerification: true,
    supports24HourWindowDetection: true,
    supportsFlows: false,
  };

  /** In-memory log of dispatched messages */
  public dispatchedMessages: Array<{
    request: WhatsAppSendMessageRequest;
    context: WhatsAppSenderContext;
    timestamp: Date;
    response: WhatsAppSendMessageResponse;
  }> = [];

  /** In-memory template catalog with educational templates in English & Arabic */
  private templates: Map<string, WhatsAppTemplate> = new Map();

  constructor() {
    this.seedDefaultTemplates();
  }

  private seedDefaultTemplates(): void {
    const defaultTemplates: WhatsAppTemplate[] = [
      {
        id: 'tmpl_att_001',
        name: 'student_attendance_absence_alert',
        category: 'UTILITY',
        language: 'ar',
        status: 'APPROVED',
        qualityRating: 'GREEN',
        updatedAt: new Date(),
        components: [
          {
            type: 'HEADER',
            format: 'TEXT',
            text: 'تنبيه غياب طالب — مدارس ممكن الأهلية',
          },
          {
            type: 'BODY',
            text: 'ولي أمر الطالب/ـة {{1}} المحترم، نود إشعاركم بغياب الطالب عن المدرسة اليوم {{2}} في الحصة {{3}}. يرجى التواصل مع إدارة المدرسة أو تقديم عذر عبر البوابة الإلكترونية.',
            example: {
              bodyText: [['أحمد محمد', 'الأربعاء 15 أكتوبر', 'الأولى']],
            },
          },
          {
            type: 'FOOTER',
            text: 'نظام إدارة التعليم الذكي — ممكن',
          },
          {
            type: 'BUTTONS',
            buttons: [
              {
                type: 'URL',
                text: 'تقديم عذر غياب',
                url: 'https://momken.edu.sa/portal/excuses/{{1}}',
              },
            ],
          },
        ],
      },
      {
        id: 'tmpl_att_002',
        name: 'student_attendance_absence_alert',
        category: 'UTILITY',
        language: 'en',
        status: 'APPROVED',
        qualityRating: 'GREEN',
        updatedAt: new Date(),
        components: [
          {
            type: 'HEADER',
            format: 'TEXT',
            text: 'Student Absence Notice — Momken Schools',
          },
          {
            type: 'BODY',
            text: 'Dear Guardian of {{1}}, we would like to notify you that the student was absent today, {{2}}, during period {{3}}. Please submit an excuse via the portal if applicable.',
            example: {
              bodyText: [['Ahmad Mohammad', 'Wednesday Oct 15', 'Period 1']],
            },
          },
          {
            type: 'FOOTER',
            text: 'Momken Education ERP',
          },
          {
            type: 'BUTTONS',
            buttons: [
              {
                type: 'URL',
                text: 'Submit Absence Excuse',
                url: 'https://momken.edu.sa/portal/excuses/{{1}}',
              },
            ],
          },
        ],
      },
      {
        id: 'tmpl_fee_001',
        name: 'tuition_fee_invoice_reminder',
        category: 'UTILITY',
        language: 'ar',
        status: 'APPROVED',
        qualityRating: 'GREEN',
        updatedAt: new Date(),
        components: [
          {
            type: 'HEADER',
            format: 'TEXT',
            text: 'تذكير بسداد الرسوم الدراسية',
          },
          {
            type: 'BODY',
            text: 'السيد/ة {{1}}، نود تذكيركم بموعد استحقاق القسط الدراسي للطالب {{2}} برقم الفاتورة {{3}} وقيمة {{4}} ريال سعودي. تاريخ الاستحقاق: {{5}}.',
            example: {
              bodyText: [['خالد العتيبي', 'سارة خالد', 'INV-2026-9812', '4500', '2026-10-30']],
            },
          },
          {
            type: 'FOOTER',
            text: 'الشؤون المالية — مدارس ممكن',
          },
          {
            type: 'BUTTONS',
            buttons: [
              {
                type: 'URL',
                text: 'سداد الفاتورة إلكترونياً',
                url: 'https://momken.edu.sa/pay/{{1}}',
              },
            ],
          },
        ],
      },
      {
        id: 'tmpl_adm_001',
        name: 'admission_application_status',
        category: 'UTILITY',
        language: 'ar',
        status: 'APPROVED',
        qualityRating: 'GREEN',
        updatedAt: new Date(),
        components: [
          {
            type: 'HEADER',
            format: 'TEXT',
            text: 'حالة طلب القبول والتسجيل',
          },
          {
            type: 'BODY',
            text: 'عزيزي مقدم الطلب {{1}}، يسرنا إعلامكم بتحديث حالة طلب التسجيل للعام الدراسي الجديد إلى: {{2}}. يرجى مراجعة البوابة لاستكمال متطلبات القبول.',
          },
        ],
      },
    ];

    for (const tmpl of defaultTemplates) {
      this.templates.set(`${tmpl.name}_${tmpl.language}`, tmpl);
    }
  }

  /* ========================================================================
   * 1. HEALTH
   * ======================================================================== */

  public async checkHealth(context: WhatsAppSenderContext): Promise<WhatsAppProviderHealth> {
    if (!context.phoneNumberId || !context.wabaId) {
      return {
        status: 'DEGRADED',
        lastCheckedAt: new Date(),
        error: 'Missing WABA ID or Phone Number ID in sender context',
      };
    }
    return {
      status: 'HEALTHY',
      latencyMs: 12,
      lastCheckedAt: new Date(),
      providerDetails: {
        providerId: this.id,
        phoneNumberId: context.phoneNumberId,
        wabaId: context.wabaId,
        sandbox: true,
      },
    };
  }

  /* ========================================================================
   * 2. MESSAGE HANDLING
   * ======================================================================== */

  public async sendMessage(
    request: WhatsAppSendMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    this.validatePhoneNumber(request.recipientNumber);

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
        throw new WhatsAppProviderError(`Unsupported message type: ${(request as any).type}`, {
          code: 'CAPABILITY_NOT_SUPPORTED',
          statusCode: 400,
        });
    }
  }

  public async sendTemplateMessage(
    request: WhatsAppTemplateMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    this.validatePhoneNumber(request.recipientNumber);

    const templateKey = `${request.payload.templateName}_${request.payload.language.code}`;
    const template = this.templates.get(templateKey);

    if (template && template.status !== 'APPROVED') {
      throw new WhatsAppTemplateNotApprovedError(template.name, template.status);
    }

    const providerMessageId = `mock_wamid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const response: WhatsAppSendMessageResponse = {
      success: true,
      providerMessageId,
      status: 'ACCEPTED',
      timestamp: new Date(),
      recipientNumber: request.recipientNumber,
      conversationId: `mock_conv_${request.recipientNumber.replace(/\D/g, '')}`,
      conversationCategory: template ? template.category : 'UTILITY',
      pricingModel: 'CBP',
      rawResponse: {
        messaging_product: 'whatsapp',
        contacts: [{ input: request.recipientNumber, wa_id: request.recipientNumber.replace(/\D/g, '') }],
        messages: [{ id: providerMessageId }],
      },
    };

    this.recordDispatch(request, context, response);
    return response;
  }

  public async sendTextMessage(
    request: WhatsAppTextMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    this.validatePhoneNumber(request.recipientNumber);

    const providerMessageId = `mock_wamid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const response: WhatsAppSendMessageResponse = {
      success: true,
      providerMessageId,
      status: 'ACCEPTED',
      timestamp: new Date(),
      recipientNumber: request.recipientNumber,
      conversationId: `mock_conv_${request.recipientNumber.replace(/\D/g, '')}`,
      conversationCategory: 'SERVICE',
      pricingModel: 'user_initiated',
      rawResponse: {
        messaging_product: 'whatsapp',
        contacts: [{ input: request.recipientNumber, wa_id: request.recipientNumber.replace(/\D/g, '') }],
        messages: [{ id: providerMessageId }],
      },
    };

    this.recordDispatch(request, context, response);
    return response;
  }

  public async sendMediaMessage(
    request: WhatsAppMediaMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    this.validatePhoneNumber(request.recipientNumber);

    const providerMessageId = `mock_wamid_media_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const response: WhatsAppSendMessageResponse = {
      success: true,
      providerMessageId,
      status: 'ACCEPTED',
      timestamp: new Date(),
      recipientNumber: request.recipientNumber,
      conversationId: `mock_conv_${request.recipientNumber.replace(/\D/g, '')}`,
      conversationCategory: 'SERVICE',
      rawResponse: {
        messaging_product: 'whatsapp',
        messages: [{ id: providerMessageId }],
      },
    };

    this.recordDispatch(request, context, response);
    return response;
  }

  public async sendInteractiveMessage(
    request: WhatsAppInteractiveMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    this.validatePhoneNumber(request.recipientNumber);

    const providerMessageId = `mock_wamid_interactive_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const response: WhatsAppSendMessageResponse = {
      success: true,
      providerMessageId,
      status: 'ACCEPTED',
      timestamp: new Date(),
      recipientNumber: request.recipientNumber,
      conversationId: `mock_conv_${request.recipientNumber.replace(/\D/g, '')}`,
      conversationCategory: 'SERVICE',
      rawResponse: {
        messaging_product: 'whatsapp',
        messages: [{ id: providerMessageId }],
      },
    };

    this.recordDispatch(request, context, response);
    return response;
  }

  public async sendReaction(
    request: WhatsAppReactionMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    this.validatePhoneNumber(request.recipientNumber);

    const providerMessageId = `mock_wamid_reaction_${Date.now()}`;
    const response: WhatsAppSendMessageResponse = {
      success: true,
      providerMessageId,
      status: 'ACCEPTED',
      timestamp: new Date(),
      recipientNumber: request.recipientNumber,
    };

    this.recordDispatch(request, context, response);
    return response;
  }

  public async sendLocation(
    request: WhatsAppLocationMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    this.validatePhoneNumber(request.recipientNumber);

    const providerMessageId = `mock_wamid_loc_${Date.now()}`;
    const response: WhatsAppSendMessageResponse = {
      success: true,
      providerMessageId,
      status: 'ACCEPTED',
      timestamp: new Date(),
      recipientNumber: request.recipientNumber,
    };

    this.recordDispatch(request, context, response);
    return response;
  }

  public async sendContact(
    request: WhatsAppContactMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse> {
    this.validatePhoneNumber(request.recipientNumber);

    const providerMessageId = `mock_wamid_contact_${Date.now()}`;
    const response: WhatsAppSendMessageResponse = {
      success: true,
      providerMessageId,
      status: 'ACCEPTED',
      timestamp: new Date(),
      recipientNumber: request.recipientNumber,
    };

    this.recordDispatch(request, context, response);
    return response;
  }

  public async markMessageAsRead(_messageId: string, _context: WhatsAppSenderContext): Promise<boolean> {
    return true;
  }

  public async uploadMedia(
    request: WhatsAppMediaUploadRequest,
    _context: WhatsAppSenderContext
  ): Promise<WhatsAppMediaUploadResponse> {
    return {
      mediaId: `mock_media_${Date.now()}`,
      mimeType: request.mimeType,
      fileSize: 1024,
    };
  }

  public async downloadMedia(
    mediaId: string,
    _context: WhatsAppSenderContext
  ): Promise<{ data: Uint8Array; mimeType: string; filename?: string }> {
    return {
      data: new Uint8Array([1, 2, 3, 4]),
      mimeType: 'application/pdf',
      filename: `doc_${mediaId}.pdf`,
    };
  }

  /* ========================================================================
   * 3. TEMPLATE SYNCHRONIZATION
   * ======================================================================== */

  public async syncTemplates(
    _context: WhatsAppSenderContext,
    filter?: WhatsAppTemplateSyncFilter
  ): Promise<WhatsAppTemplateSyncResult> {
    let list = Array.from(this.templates.values());

    if (filter?.language) {
      list = list.filter((t) => t.language === filter.language);
    }
    if (filter?.category) {
      list = list.filter((t) => t.category === filter.category);
    }
    if (filter?.status) {
      list = list.filter((t) => t.status === filter.status);
    }

    return {
      templates: list,
      totalCount: list.length,
      syncedAt: new Date(),
    };
  }

  public async getTemplateByName(
    templateName: string,
    language: string,
    _context: WhatsAppSenderContext
  ): Promise<WhatsAppTemplate | null> {
    const key = `${templateName}_${language}`;
    return this.templates.get(key) || null;
  }

  public async createTemplate(
    request: WhatsAppCreateTemplateRequest,
    _context: WhatsAppSenderContext
  ): Promise<WhatsAppTemplate> {
    const newTemplate: WhatsAppTemplate = {
      id: `tmpl_${Date.now()}`,
      name: request.name,
      category: request.category,
      language: request.language,
      status: 'PENDING',
      components: request.components,
      updatedAt: new Date(),
    };
    this.templates.set(`${request.name}_${request.language}`, newTemplate);
    return newTemplate;
  }

  public async deleteTemplate(
    templateName: string,
    _context: WhatsAppSenderContext
  ): Promise<WhatsAppDeleteTemplateResponse> {
    let deleted = false;
    for (const [key, t] of this.templates.entries()) {
      if (t.name === templateName) {
        this.templates.delete(key);
        deleted = true;
      }
    }
    return {
      success: deleted,
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
      errorMessage: 'Verification token or mode mismatch',
    };
  }

  public verifyWebhookSignature(
    params: WebhookSignatureVerificationParams
  ): WebhookSignatureVerificationResult {
    // In Mock provider, any signature matching 'mock_valid_sig' or matching secret prefix passes
    if (!params.signatureHeader) {
      return { isValid: false, errorReason: 'Missing signature header' };
    }
    if (params.signatureHeader === 'mock_invalid') {
      return { isValid: false, errorReason: 'Invalid signature digest' };
    }
    return { isValid: true };
  }

  public parseWebhookPayload(rawPayload: unknown): WhatsAppInboundEvent[] {
    const payload = rawPayload as any;
    const events: WhatsAppInboundEvent[] = [];

    if (!payload || typeof payload !== 'object') {
      return events;
    }

    // Standard Meta Graph API webhook structure: { entry: [{ changes: [{ value: { ... } }] }] }
    if (Array.isArray(payload.entry)) {
      for (const entry of payload.entry) {
        if (Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            const value = change.value;
            if (!value) continue;

            const phoneNumberId = value.metadata?.phone_number_id || 'unknown';

            // 1. Inbound messages
            if (Array.isArray(value.messages)) {
              for (const msg of value.messages) {
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
                  const mediaObj = msg.image || msg.document || msg.audio || msg.video;
                  event.media = {
                    type: msg.type,
                    mediaId: mediaObj.id,
                    mimeType: mediaObj.mime_type,
                    sha256: mediaObj.sha256,
                    caption: mediaObj.caption,
                    filename: mediaObj.filename,
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

            // 2. Outbound status updates (sent, delivered, read, failed)
            if (Array.isArray(value.statuses)) {
              for (const statusItem of value.statuses) {
                events.push({
                  eventType: 'STATUS_UPDATE',
                  providerMessageId: statusItem.id,
                  recipientNumber: `+${statusItem.recipient_id}`,
                  status: statusItem.status.toUpperCase(),
                  timestamp: new Date(Number(statusItem.timestamp) * 1000 || Date.now()),
                  conversation: statusItem.conversation
                    ? {
                        id: statusItem.conversation.id,
                        category: (statusItem.conversation.origin?.type || 'UTILITY').toUpperCase(),
                      }
                    : undefined,
                  pricing: statusItem.pricing,
                  errors: statusItem.errors,
                  rawPayload: statusItem,
                });
              }
            }
          }
        }
      }
    }

    return events;
  }

  /* ========================================================================
   * HELPER METHODS
   * ======================================================================== */

  private validatePhoneNumber(phone: string): void {
    // E.164 pattern: + followed by 7-15 digits
    const e164Regex = /^\+[1-9]\d{6,14}$/;
    if (!e164Regex.test(phone.replace(/\s+/g, ''))) {
      throw new WhatsAppInvalidPhoneNumberError(phone);
    }
  }

  private recordDispatch(
    request: WhatsAppSendMessageRequest,
    context: WhatsAppSenderContext,
    response: WhatsAppSendMessageResponse
  ): void {
    this.dispatchedMessages.push({
      request,
      context,
      timestamp: new Date(),
      response,
    });
  }
}
