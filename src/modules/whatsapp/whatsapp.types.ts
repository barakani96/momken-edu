/**
 * WhatsApp Business Integration Types & Contracts
 * Momken Education ERP — Multi-Tenant Institutional Communication Engine
 */

export type WhatsAppProviderId = 'meta_cloud_api' | 'meta_on_premises' | 'infobip' | 'twilio' | 'mock' | string;

export type WhatsAppChannelType = 'WHATSAPP_BUSINESS';

/**
 * Institutional sender context for multi-tenant and multi-campus dispatch.
 * Every message dispatch and webhook operation is bounded by tenant isolation.
 */
export interface WhatsAppSenderContext {
  /** Unique tenant/organization identifier in Momken ERP */
  tenantId: string;
  /** Campus identifier if multi-campus isolation applies */
  campusId?: string;
  /** WhatsApp Business Account ID (WABA ID) */
  wabaId: string;
  /** Verified phone number ID assigned by provider */
  phoneNumberId: string;
  /** E.164 formatted sender phone number */
  senderPhoneNumber: string;
  /** Display name configured for the sender number */
  displayPhoneNumberName?: string;
  /** Default language code (e.g., 'en', 'ar') */
  defaultLanguage?: string;
  /** Custom metadata or credentials reference */
  credentialsRef?: string;
  /** Custom provider-specific options */
  providerOptions?: Record<string, unknown>;
}

/**
 * Validated E.164 phone number string (e.g. +966501234567, +201012345678)
 */
export type WhatsAppPhoneNumber = string;

/**
 * Official WhatsApp message category according to Meta/WhatsApp platform rules
 */
export type WhatsAppMessageCategory = 'UTILITY' | 'MARKETING' | 'AUTHENTICATION' | 'SERVICE';

/**
 * Message flow direction
 */
export type WhatsAppMessageDirection = 'OUTBOUND' | 'INBOUND';

/**
 * Message lifecycle delivery states
 */
export type WhatsAppMessageDeliveryStatus =
  | 'ACCEPTED'
  | 'QUEUED'
  | 'SENDING'
  | 'SENT'
  | 'DELIVERED'
  | 'READ'
  | 'FAILED'
  | 'UNDELIVERED'
  | 'DELETED';

/**
 * Media message types supported by WhatsApp Business API
 */
export type WhatsAppMediaType = 'image' | 'document' | 'video' | 'audio' | 'sticker';

/**
 * Base media payload
 */
export interface WhatsAppMediaMessagePayload {
  type: WhatsAppMediaType;
  /** URL to media file accessible by provider */
  url?: string;
  /** Pre-uploaded media ID from provider storage */
  mediaId?: string;
  /** Optional caption for images, documents, and videos */
  caption?: string;
  /** Display file name (required for documents) */
  filename?: string;
  /** MIME type of the media file (e.g. application/pdf, image/jpeg) */
  mimeType?: string;
  /** Size in bytes if known */
  fileSize?: number;
  /** SHA-256 hash for payload verification */
  sha256?: string;
}

/**
 * Free-form text message payload (Session messages within 24h window)
 */
export interface WhatsAppTextMessagePayload {
  body: string;
  /** Whether URLs in the text should generate a link preview */
  previewUrl?: boolean;
}

/**
 * Template variable parameter types
 */
export type WhatsAppTemplateParameterType = 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video' | 'payload';

export interface WhatsAppTemplateParameter {
  type: WhatsAppTemplateParameterType;
  text?: string;
  currency?: {
    fallbackValue: string;
    code: string;
    amount1000: number;
  };
  dateTime?: {
    fallbackValue: string;
    timestamp?: number;
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

export type WhatsAppTemplateComponentType = 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTON';

export interface WhatsAppTemplateComponentParameter {
  type: WhatsAppTemplateComponentType;
  subType?: 'QUICK_REPLY' | 'URL' | 'CATALOG' | 'COPY_CODE';
  index?: number;
  parameters: WhatsAppTemplateParameter[];
}

/**
 * Pre-approved WhatsApp Template Message Payload
 */
export interface WhatsAppTemplateMessagePayload {
  /** Template name registered and approved in WhatsApp Business Manager */
  templateName: string;
  /** Language configuration */
  language: {
    code: string; // e.g. 'ar', 'en_US'
    policy?: 'deterministic' | 'fallback';
  };
  /** Dynamic component parameters replacing placeholders like {{1}}, {{2}} */
  components?: WhatsAppTemplateComponentParameter[];
  /** Optional namespace if required by on-premises provider */
  namespace?: string;
}

/**
 * Interactive quick reply button item
 */
export interface WhatsAppReplyButton {
  type: 'reply';
  reply: {
    id: string;
    title: string;
  };
}

/**
 * Interactive list section row item
 */
export interface WhatsAppListRow {
  id: string;
  title: string;
  description?: string;
}

/**
 * Interactive list section
 */
export interface WhatsAppListSection {
  title?: string;
  rows: WhatsAppListRow[];
}

/**
 * Interactive message payload (Buttons, Lists, Call-To-Action)
 */
export interface WhatsAppInteractiveMessagePayload {
  type: 'button' | 'list' | 'cta_url';
  header?: {
    type: 'text' | 'image' | 'video' | 'document';
    text?: string;
    mediaUrl?: string;
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action: {
    buttons?: WhatsAppReplyButton[];
    buttonText?: string; // For list messages
    sections?: WhatsAppListSection[];
    ctaUrl?: {
      displayText: string;
      url: string;
    };
  };
}

/**
 * Reaction payload
 */
export interface WhatsAppReactionMessagePayload {
  /** Target message ID to react to */
  messageId: string;
  /** Emoji character or empty string to remove reaction */
  emoji: string;
}

/**
 * Geographic location payload
 */
export interface WhatsAppLocationMessagePayload {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

/**
 * Contact card payload
 */
export interface WhatsAppContactItem {
  name: {
    formattedName: string;
    firstName?: string;
    lastName?: string;
  };
  phones?: Array<{
    phone: string;
    type?: string;
    waId?: string;
  }>;
  emails?: Array<{
    email: string;
    type?: string;
  }>;
  org?: {
    company?: string;
    department?: string;
    title?: string;
  };
}

export interface WhatsAppContactMessagePayload {
  contacts: WhatsAppContactItem[];
}

/**
 * Discriminated union of outbound send requests
 */
export type WhatsAppMessageType =
  | 'text'
  | 'template'
  | 'media'
  | 'interactive'
  | 'reaction'
  | 'location'
  | 'contact';

export interface BaseWhatsAppSendMessageRequest {
  /** Recipient phone number in E.164 format */
  recipientNumber: WhatsAppPhoneNumber;
  /** Unique idempotency key to prevent accidental duplicate dispatch */
  idempotencyKey?: string;
  /** Internal Momken tracking or message ID */
  trackingId?: string;
  /** Associated institutional entity (e.g. Student, Parent, Invoice, Application) */
  entityReference?: {
    entityType: string;
    entityId: string;
  };
  /** Metadata attached to message */
  metadata?: Record<string, unknown>;
}

export interface WhatsAppTextMessageRequest extends BaseWhatsAppSendMessageRequest {
  type: 'text';
  payload: WhatsAppTextMessagePayload;
}

export interface WhatsAppTemplateMessageRequest extends BaseWhatsAppSendMessageRequest {
  type: 'template';
  payload: WhatsAppTemplateMessagePayload;
}

export interface WhatsAppMediaMessageRequest extends BaseWhatsAppSendMessageRequest {
  type: 'media';
  payload: WhatsAppMediaMessagePayload;
}

export interface WhatsAppInteractiveMessageRequest extends BaseWhatsAppSendMessageRequest {
  type: 'interactive';
  payload: WhatsAppInteractiveMessagePayload;
}

export interface WhatsAppReactionMessageRequest extends BaseWhatsAppSendMessageRequest {
  type: 'reaction';
  payload: WhatsAppReactionMessagePayload;
}

export interface WhatsAppLocationMessageRequest extends BaseWhatsAppSendMessageRequest {
  type: 'location';
  payload: WhatsAppLocationMessagePayload;
}

export interface WhatsAppContactMessageRequest extends BaseWhatsAppSendMessageRequest {
  type: 'contact';
  payload: WhatsAppContactMessagePayload;
}

export type WhatsAppSendMessageRequest =
  | WhatsAppTextMessageRequest
  | WhatsAppTemplateMessageRequest
  | WhatsAppMediaMessageRequest
  | WhatsAppInteractiveMessageRequest
  | WhatsAppReactionMessageRequest
  | WhatsAppLocationMessageRequest
  | WhatsAppContactMessageRequest;

/**
 * Standardized provider send response
 */
export interface WhatsAppSendMessageResponse {
  /** Whether the provider accepted the message for dispatch */
  success: boolean;
  /** Provider-assigned unique message ID (e.g., wamid.HBgL...) */
  providerMessageId?: string;
  /** Initial delivery status */
  status: WhatsAppMessageDeliveryStatus;
  /** Timestamp recorded by provider */
  timestamp: Date;
  /** E.164 formatted recipient */
  recipientNumber: WhatsAppPhoneNumber;
  /** Provider conversation identifier */
  conversationId?: string;
  /** Conversation category determined by provider */
  conversationCategory?: WhatsAppMessageCategory;
  /** Pricing or billing model (e.g. 'CBP', 'user_initiated', 'business_initiated') */
  pricingModel?: string;
  /** Raw payload returned by provider for diagnostic/audit trace */
  rawResponse?: unknown;
  /** Error detail if dispatch was rejected */
  error?: {
    code: string;
    message: string;
    details?: unknown;
    isRetryable?: boolean;
  };
}

/* ==========================================================================
 * TEMPLATE SYNCHRONIZATION TYPES
 * ========================================================================== */

export type WhatsAppTemplateStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAUSED'
  | 'DISABLED'
  | 'ARCHIVED';

export type WhatsAppTemplateQualityRating = 'GREEN' | 'YELLOW' | 'RED' | 'UNKNOWN';

export interface WhatsAppTemplateButtonDefinition {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'OTP' | 'COPY_CODE';
  text: string;
  url?: string;
  phoneNumber?: string;
  otpType?: 'COPY_CODE' | 'ONE_TAP';
}

export interface WhatsAppTemplateComponentDefinition {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS';
  format?: 'TEXT' | 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'LOCATION';
  text?: string;
  example?: {
    headerText?: string[];
    bodyText?: string[][];
    headerHandle?: string[];
  };
  buttons?: WhatsAppTemplateButtonDefinition[];
}

export interface WhatsAppTemplate {
  /** Provider assigned template ID */
  id: string;
  /** Template name identifier (lowercase alphanumeric with underscores) */
  name: string;
  /** Primary category */
  category: WhatsAppMessageCategory;
  /** Language tag (e.g., 'ar', 'en') */
  language: string;
  /** Approval status */
  status: WhatsAppTemplateStatus;
  /** Structured template components */
  components: WhatsAppTemplateComponentDefinition[];
  /** Rejection reason provided by WhatsApp reviewers */
  rejectionReason?: string;
  /** Quality rating score */
  qualityRating?: WhatsAppTemplateQualityRating;
  /** Last updated timestamp */
  updatedAt?: Date;
}

export interface WhatsAppTemplateSyncFilter {
  language?: string;
  category?: WhatsAppMessageCategory;
  status?: WhatsAppTemplateStatus;
  limit?: number;
  cursor?: string;
}

export interface WhatsAppTemplateSyncResult {
  templates: WhatsAppTemplate[];
  nextCursor?: string;
  totalCount?: number;
  syncedAt: Date;
}

export interface WhatsAppCreateTemplateRequest {
  name: string;
  category: WhatsAppMessageCategory;
  language: string;
  components: WhatsAppTemplateComponentDefinition[];
  allowCategoryChange?: boolean;
}

export interface WhatsAppDeleteTemplateResponse {
  success: boolean;
  templateName: string;
}

/* ==========================================================================
 * WEBHOOK VERIFICATION & EVENT TYPES
 * ========================================================================== */

export interface WhatsAppWebhookConfig {
  /** Hub verification token configured in Meta App Dashboard / Provider */
  verifyToken: string;
  /** App secret or signature key used for HMAC-SHA256 signature verification */
  appSecret: string;
  /** Webhook callback endpoint URL */
  callbackUrl?: string;
}

export interface WebhookSubscriptionVerifyParams {
  /** Mode sent by provider (e.g. 'subscribe') */
  mode: string;
  /** Verification token supplied in the query */
  verifyToken: string;
  /** Challenge string to echo back if verification succeeds */
  challenge: string;
}

export interface WebhookSubscriptionVerifyResult {
  /** Whether the token and mode match requirements */
  isValid: boolean;
  /** Challenge response string to return with 200 OK */
  challengeResponse?: string;
  /** Recommended HTTP status code */
  statusCode: number;
  /** Error message if verification failed */
  errorMessage?: string;
}

export interface WebhookSignatureVerificationParams {
  /** Raw request body as string or Uint8Array */
  rawBody: string | Uint8Array;
  /** Signature header (e.g. 'x-hub-signature-256') */
  signatureHeader: string;
  /** App secret / signing secret */
  secret: string;
  /** Signature algorithm (defaults to 'sha256') */
  algorithm?: 'sha256';
}

export interface WebhookSignatureVerificationResult {
  isValid: boolean;
  errorReason?: string;
}

/**
 * Normalized Inbound Event Types
 */
export type WhatsAppInboundEventType =
  | 'MESSAGE_RECEIVED'
  | 'STATUS_UPDATE'
  | 'TEMPLATE_STATUS_UPDATE'
  | 'PHONE_NUMBER_QUALITY_UPDATE'
  | 'ACCOUNT_ALERT';

export interface WhatsAppInboundMessageEvent {
  eventType: 'MESSAGE_RECEIVED';
  providerMessageId: string;
  senderNumber: WhatsAppPhoneNumber;
  recipientPhoneNumberId: string;
  timestamp: Date;
  type: WhatsAppMessageType;
  text?: {
    body: string;
  };
  media?: {
    type: WhatsAppMediaType;
    mediaId: string;
    mimeType: string;
    sha256?: string;
    caption?: string;
    filename?: string;
  };
  interactiveResponse?: {
    type: 'button_reply' | 'list_reply';
    id: string;
    title: string;
    description?: string;
  };
  location?: WhatsAppLocationMessagePayload;
  contacts?: WhatsAppContactItem[];
  rawPayload: unknown;
}

export interface WhatsAppStatusUpdateEvent {
  eventType: 'STATUS_UPDATE';
  providerMessageId: string;
  recipientNumber: WhatsAppPhoneNumber;
  status: WhatsAppMessageDeliveryStatus;
  timestamp: Date;
  conversation?: {
    id: string;
    category: WhatsAppMessageCategory;
    expirationTimestamp?: Date;
  };
  pricing?: {
    billable: boolean;
    pricingModel: string;
    category: string;
  };
  errors?: Array<{
    code: number | string;
    title: string;
    message?: string;
    errorData?: unknown;
  }>;
  rawPayload: unknown;
}

export interface WhatsAppTemplateUpdateEvent {
  eventType: 'TEMPLATE_STATUS_UPDATE';
  templateId: string;
  templateName: string;
  language: string;
  status: WhatsAppTemplateStatus;
  reason?: string;
  timestamp: Date;
  rawPayload: unknown;
}

export interface WhatsAppAccountAlertEvent {
  eventType: 'PHONE_NUMBER_QUALITY_UPDATE' | 'ACCOUNT_ALERT';
  phoneNumberId: string;
  eventDescription: string;
  currentStatus: string;
  timestamp: Date;
  rawPayload: unknown;
}

export type WhatsAppInboundEvent =
  | WhatsAppInboundMessageEvent
  | WhatsAppStatusUpdateEvent
  | WhatsAppTemplateUpdateEvent
  | WhatsAppAccountAlertEvent;

/* ==========================================================================
 * MEDIA OPERATIONS
 * ========================================================================== */

export interface WhatsAppMediaUploadRequest {
  file: Uint8Array | Buffer | Blob;
  mimeType: string;
  filename: string;
  category?: WhatsAppMediaType;
}

export interface WhatsAppMediaUploadResponse {
  mediaId: string;
  mimeType: string;
  fileSize?: number;
}

/* ==========================================================================
 * PROVIDER CAPABILITIES & HEALTH
 * ========================================================================== */

export interface WhatsAppProviderCapabilities {
  supportsTemplateSync: boolean;
  supportsInteractiveMessages: boolean;
  supportsMediaUpload: boolean;
  supportsReactions: boolean;
  supportsLocationMessages: boolean;
  supportsContactMessages: boolean;
  supportsWebhookSignatureVerification: boolean;
  supports24HourWindowDetection: boolean;
  supportsFlows?: boolean;
}

export interface WhatsAppProviderHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  latencyMs?: number;
  lastCheckedAt: Date;
  error?: string;
  providerDetails?: Record<string, unknown>;
}
