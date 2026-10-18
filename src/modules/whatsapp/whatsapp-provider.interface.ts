/**
 * WhatsAppProvider TypeScript Interface Contract
 * Momken Education ERP — Multi-Tenant Institutional Communication Engine
 *
 * This contract defines the strict provider-agnostic interface that all WhatsApp
 * adapters (Meta Cloud API, Meta On-Premises, Infobip, Twilio, Mock / Test)
 * must implement.
 */

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

export interface WhatsAppProvider {
  /**
   * Unique machine identifier for this provider implementation
   * (e.g. 'meta_cloud_api', 'meta_on_premises', 'infobip', 'twilio', 'mock')
   */
  readonly id: WhatsAppProviderId;

  /**
   * Human-readable provider title for administration and display
   */
  readonly name: string;

  /**
   * Semantic version of this provider adapter
   */
  readonly version: string;

  /**
   * Explicit capabilities supported by this provider
   */
  readonly capabilities: WhatsAppProviderCapabilities;

  /* ========================================================================
   * 1. HEALTH & CONNECTIVITY
   * ======================================================================== */

  /**
   * Check connection and authentication health for a given tenant/sender context.
   */
  checkHealth(context: WhatsAppSenderContext): Promise<WhatsAppProviderHealth>;

  /* ========================================================================
   * 2. MESSAGE HANDLING
   * ======================================================================== */

  /**
   * Unified message dispatcher capable of routing any valid WhatsApp message request.
   */
  sendMessage(
    request: WhatsAppSendMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse>;

  /**
   * Dispatches a pre-approved WhatsApp template message (e.g. fee reminder,
   * attendance alert, admission confirmation). Mandatory for outbound notifications
   * outside the 24h customer support window.
   */
  sendTemplateMessage(
    request: WhatsAppTemplateMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse>;

  /**
   * Dispatches a free-form text message (session message).
   * Note: WhatsApp platform rules strictly require this to occur within the 24-hour window
   * initiated by an inbound message from the recipient.
   */
  sendTextMessage(
    request: WhatsAppTextMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse>;

  /**
   * Dispatches a rich media message (document, PDF receipt, report card, image, video, voice note).
   */
  sendMediaMessage(
    request: WhatsAppMediaMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse>;

  /**
   * Dispatches an interactive message with quick-reply buttons, sectioned list pickers,
   * or call-to-action links (e.g. parent consent buttons, course survey, campus inquiry menu).
   */
  sendInteractiveMessage(
    request: WhatsAppInteractiveMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse>;

  /**
   * Sends an emoji reaction to an existing message (optional provider capability).
   */
  sendReaction?(
    request: WhatsAppReactionMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse>;

  /**
   * Sends a geographic location pin (e.g. school campus, bus pickup stop).
   */
  sendLocation?(
    request: WhatsAppLocationMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse>;

  /**
   * Sends institutional or contact vCard cards (e.g. Dean, counselor, registrar contact).
   */
  sendContact?(
    request: WhatsAppContactMessageRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppSendMessageResponse>;

  /**
   * Marks an incoming message as read, sending read receipts to the recipient.
   */
  markMessageAsRead?(
    messageId: string,
    context: WhatsAppSenderContext
  ): Promise<boolean>;

  /**
   * Uploads binary media directly to the WhatsApp provider repository to acquire a media ID.
   */
  uploadMedia?(
    request: WhatsAppMediaUploadRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppMediaUploadResponse>;

  /**
   * Downloads incoming or hosted media by media ID.
   */
  downloadMedia?(
    mediaId: string,
    context: WhatsAppSenderContext
  ): Promise<{ data: Uint8Array; mimeType: string; filename?: string }>;

  /* ========================================================================
   * 3. TEMPLATE SYNCHRONIZATION
   * ======================================================================== */

  /**
   * Synchronizes message templates from the WhatsApp Business Account into the local
   * ERP database cache, fetching status updates (APPROVED, REJECTED, PAUSED) and quality ratings.
   */
  syncTemplates(
    context: WhatsAppSenderContext,
    filter?: WhatsAppTemplateSyncFilter
  ): Promise<WhatsAppTemplateSyncResult>;

  /**
   * Retrieves an individual template definition and approval status by name and language code.
   */
  getTemplateByName(
    templateName: string,
    language: string,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppTemplate | null>;

  /**
   * Submits a newly created template to WhatsApp Business Manager for review (optional capability).
   */
  createTemplate?(
    request: WhatsAppCreateTemplateRequest,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppTemplate>;

  /**
   * Deletes a template from the provider account by name (optional capability).
   */
  deleteTemplate?(
    templateName: string,
    context: WhatsAppSenderContext
  ): Promise<WhatsAppDeleteTemplateResponse>;

  /* ========================================================================
   * 4. WEBHOOK VERIFICATION & PARSING
   * ======================================================================== */

  /**
   * Verifies the initial webhook registration subscription handshake
   * (e.g. GET hub.mode, hub.verify_token, hub.challenge from Meta Graph API).
   */
  verifyWebhookSubscription(
    params: WebhookSubscriptionVerifyParams,
    config: WhatsAppWebhookConfig
  ): WebhookSubscriptionVerifyResult;

  /**
   * Cryptographically verifies inbound webhook payload authenticity and integrity
   * using HMAC-SHA256 signature verification (e.g. X-Hub-Signature-256 header).
   */
  verifyWebhookSignature(
    params: WebhookSignatureVerificationParams
  ): WebhookSignatureVerificationResult;

  /**
   * Ingests and transforms raw provider webhook payloads into strongly typed, normalized
   * WhatsAppInboundEvents (InboundMessage, StatusUpdate, TemplateUpdate, AccountAlert).
   */
  parseWebhookPayload(rawPayload: unknown): WhatsAppInboundEvent[];
}
