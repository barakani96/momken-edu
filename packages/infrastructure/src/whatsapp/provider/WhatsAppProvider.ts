/**
 * WhatsAppProvider TypeScript Interface Contract
 * @schools/infrastructure — Provider-Agnostic WhatsApp Business Integration Layer
 *
 * Defines the contract that every provider adapter (Meta Cloud API, Meta On-Premises,
 * Infobip, Twilio, Mock, etc.) must implement to decouple business logic from external vendors.
 */

export type WhatsAppProviderType =
  | 'meta_cloud_api'
  | 'meta_on_premises'
  | 'infobip'
  | 'twilio'
  | 'mock'
  | (string & {});

/**
 * Capabilities advertised by a WhatsApp provider implementation
 */
export interface WhatsAppProviderCapabilities {
  supportsTemplates: boolean;
  supportsMedia: boolean;
  supportsInteractive: boolean;
  supportsReaction?: boolean;
  supportsLocation?: boolean;
  supportsContacts?: boolean;
  supportsStatusTracking?: boolean;
  supportsMediaUpload?: boolean;
  supportsWebhookVerification?: boolean;
  supportedMediaTypes: Array<'image' | 'document' | 'video' | 'audio' | 'sticker'>;
  supportedInteractiveTypes: Array<'button' | 'list' | 'cta_url' | 'flow'>;
  maxBatchSize?: number;
  rateLimitPerSecond?: number;
  apiVersion?: string;
  notes?: string;
}

/**
 * Sender context identifying the tenant, WhatsApp Business Account, and phone number
 */
export interface WhatsAppSenderContext {
  tenantId: string;
  campusId?: string;
  wabaId: string;
  phoneNumberId: string;
  senderPhoneNumber: string;
  displayPhoneNumberName?: string;
  defaultLanguage?: string;
  credentialsRef?: string;
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  webhookSecret?: string;
  baseUrl?: string;
  providerOptions?: Record<string, unknown>;
}

/**
 * Text message dispatch parameters (free-form message within 24h window)
 */
export interface WhatsAppSendTextRequest {
  to: string;
  text: string;
  previewUrl?: boolean;
  context?: WhatsAppSenderContext;
  correlationId?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Template variable parameter
 */
export interface WhatsAppTemplateParameter {
  type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video' | 'payload';
  text?: string;
  currency?: {
    fallbackValue: string;
    code: string;
    amount1000: number;
  };
  dateTime?: {
    fallbackValue: string;
  };
  image?: {
    link?: string;
    id?: string;
  };
  document?: {
    link?: string;
    id?: string;
    filename?: string;
  };
  video?: {
    link?: string;
    id?: string;
  };
  payload?: string;
}

/**
 * Template component (header, body, button, carousel)
 */
export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'button' | 'carousel';
  subType?: 'quick_reply' | 'url' | 'catalog';
  index?: number;
  parameters: WhatsAppTemplateParameter[];
}

/**
 * Template message dispatch parameters (required outside 24h window or for official institutional alerts)
 */
export interface WhatsAppSendTemplateRequest {
  to: string;
  templateName: string;
  languageCode: string;
  components?: WhatsAppTemplateComponent[];
  namespace?: string;
  context?: WhatsAppSenderContext;
  correlationId?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Media message dispatch parameters
 */
export interface WhatsAppSendMediaRequest {
  to: string;
  mediaType: 'image' | 'document' | 'video' | 'audio' | 'sticker';
  url?: string;
  mediaId?: string;
  caption?: string;
  filename?: string;
  mimeType?: string;
  context?: WhatsAppSenderContext;
  correlationId?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Interactive button item
 */
export interface WhatsAppInteractiveButton {
  type: 'reply';
  reply: {
    id: string;
    title: string;
  };
}

/**
 * Interactive list section item
 */
export interface WhatsAppInteractiveListRow {
  id: string;
  title: string;
  description?: string;
}

/**
 * Interactive list section
 */
export interface WhatsAppInteractiveListSection {
  title?: string;
  rows: WhatsAppInteractiveListRow[];
}

/**
 * Interactive message payload (buttons, list picker, CTA URL, flow)
 */
export interface WhatsAppInteractivePayload {
  type: 'button' | 'list' | 'cta_url' | 'flow';
  header?: {
    type: 'text' | 'image' | 'video' | 'document';
    text?: string;
    mediaUrl?: string;
    mediaId?: string;
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action: {
    button?: string;
    buttons?: WhatsAppInteractiveButton[];
    sections?: WhatsAppInteractiveListSection[];
    name?: string;
    parameters?: Record<string, unknown>;
  };
}

/**
 * Interactive message dispatch parameters
 */
export interface WhatsAppSendInteractiveRequest {
  to: string;
  interactive: WhatsAppInteractivePayload;
  context?: WhatsAppSenderContext;
  correlationId?: string;
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Standard message dispatch result
 */
export interface WhatsAppMessageResponse {
  success: boolean;
  messageId: string;
  providerMessageId?: string;
  status: 'accepted' | 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | string;
  timestamp: Date;
  recipientId?: string;
  error?: {
    code: string;
    message: string;
    details?: unknown;
    retriable?: boolean;
  };
  rawResponse?: unknown;
}

/**
 * Media upload parameters
 */
export interface WhatsAppUploadMediaRequest {
  file: Blob | Buffer | Uint8Array | ArrayBuffer | string;
  filename: string;
  mimeType: string;
  type?: 'image' | 'document' | 'video' | 'audio' | 'sticker' | string;
  context?: WhatsAppSenderContext;
}

/**
 * Media upload result
 */
export interface WhatsAppUploadMediaResponse {
  mediaId: string;
  url?: string;
  mimeType?: string;
  fileSize?: number;
  expiresAt?: Date;
  rawResponse?: unknown;
}

/**
 * Message delivery status check response
 */
export interface WhatsAppMessageStatusResponse {
  messageId: string;
  providerMessageId?: string;
  status: 'accepted' | 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'undelivered' | string;
  timestamp: Date;
  recipientId?: string;
  pricing?: {
    billable: boolean;
    category?: string;
    pricingModel?: string;
  };
  conversation?: {
    id: string;
    expirationTimestamp?: Date;
    originType?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  rawResponse?: unknown;
}

/**
 * Webhook signature verification parameters
 */
export interface WhatsAppWebhookVerificationParams {
  rawBody: string | Buffer | Uint8Array;
  signature?: string;
  secret?: string;
  headers?: Record<string, string | string[] | undefined>;
  query?: Record<string, string | string[] | undefined>;
}

/**
 * Webhook verification result
 */
export interface WhatsAppWebhookVerificationResult {
  isValid: boolean;
  challenge?: string;
  reason?: string;
}

/**
 * Normalized incoming webhook event
 */
export interface WhatsAppNormalizedEvent {
  eventId: string;
  type: 'message' | 'status' | 'template_status' | 'billing' | 'account_alert' | 'unknown';
  timestamp: Date;
  tenantId?: string;
  wabaId?: string;
  phoneNumberId?: string;
  message?: {
    id: string;
    from: string;
    timestamp: Date;
    type: 'text' | 'image' | 'document' | 'video' | 'audio' | 'interactive' | 'button' | 'location' | 'contact' | 'unknown';
    text?: { body: string };
    media?: { id: string; mimeType?: string; caption?: string; filename?: string; sha256?: string };
    interactive?: { type: string; buttonReply?: { id: string; title: string }; listReply?: { id: string; title: string } };
    context?: { from: string; id: string };
  };
  status?: {
    id: string;
    recipientId: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    timestamp: Date;
    pricing?: { billable: boolean; category: string };
    conversation?: { id: string; expirationTimestamp?: Date };
    errors?: Array<{ code: number; title: string; message?: string }>;
  };
  rawEvent?: unknown;
}

/**
 * Parsed webhook payload result
 */
export interface WhatsAppParsedWebhookPayload {
  events: WhatsAppNormalizedEvent[];
  rawPayload: unknown;
}

/**
 * WhatsAppProvider TypeScript Interface
 *
 * Core provider-agnostic interface required across Momken Education ERP.
 */
export interface WhatsAppProvider {
  /** Unique provider identifier (e.g., 'meta_cloud_api', 'infobip', 'twilio', 'mock') */
  readonly providerId: string;

  /** Human-readable provider name */
  readonly providerName: string;

  /** Provider version or API version */
  readonly version?: string;

  /**
   * Retrieves provider capabilities and supported features
   */
  getCapabilities(): WhatsAppProviderCapabilities | Promise<WhatsAppProviderCapabilities>;

  /**
   * Sends a plain text message to a recipient (24h customer service window)
   */
  sendText(
    params: WhatsAppSendTextRequest,
    context?: WhatsAppSenderContext
  ): Promise<WhatsAppMessageResponse>;

  /**
   * Sends an approved WhatsApp template message
   */
  sendTemplate(
    params: WhatsAppSendTemplateRequest,
    context?: WhatsAppSenderContext
  ): Promise<WhatsAppMessageResponse>;

  /**
   * Sends a media message (image, document, video, audio, sticker)
   */
  sendMedia(
    params: WhatsAppSendMediaRequest,
    context?: WhatsAppSenderContext
  ): Promise<WhatsAppMessageResponse>;

  /**
   * Sends an interactive message (quick reply buttons, list selection, CTA URL)
   */
  sendInteractive(
    params: WhatsAppSendInteractiveRequest,
    context?: WhatsAppSenderContext
  ): Promise<WhatsAppMessageResponse>;

  /**
   * Optional: Uploads media binary to provider media store to obtain media ID
   */
  uploadMedia?(
    params: WhatsAppUploadMediaRequest,
    context?: WhatsAppSenderContext
  ): Promise<WhatsAppUploadMediaResponse>;

  /**
   * Optional: Retrieves the latest delivery or read status for a message
   */
  getMessageStatus?(
    messageId: string,
    context?: WhatsAppSenderContext
  ): Promise<WhatsAppMessageStatusResponse>;

  /**
   * Optional: Verifies incoming webhook subscription handshake or payload signature
   */
  verifyWebhook?(
    params: WhatsAppWebhookVerificationParams
  ): Promise<WhatsAppWebhookVerificationResult> | WhatsAppWebhookVerificationResult;

  /**
   * Optional: Parses raw incoming provider webhook payload into normalized events
   */
  parseWebhook?(
    rawPayload: unknown,
    headers?: Record<string, string | string[] | undefined>
  ): Promise<WhatsAppParsedWebhookPayload> | WhatsAppParsedWebhookPayload;
}
