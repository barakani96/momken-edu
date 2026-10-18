/**
 * WhatsApp Provider Domain Errors
 * Momken Education ERP
 */

export type WhatsAppErrorCode =
  | 'PROVIDER_ERROR'
  | 'MESSAGING_WINDOW_EXPIRED'
  | 'TEMPLATE_NOT_FOUND'
  | 'TEMPLATE_NOT_APPROVED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'AUTHENTICATION_FAILED'
  | 'WEBHOOK_VERIFICATION_FAILED'
  | 'WEBHOOK_SIGNATURE_INVALID'
  | 'INVALID_PHONE_NUMBER'
  | 'MEDIA_UPLOAD_FAILED'
  | 'MEDIA_DOWNLOAD_FAILED'
  | 'CAPABILITY_NOT_SUPPORTED'
  | 'NETWORK_ERROR'
  | 'TENANT_NOT_CONFIGURED';

export class WhatsAppProviderError extends Error {
  public readonly code: WhatsAppErrorCode;
  public readonly statusCode: number;
  public readonly isRetryable: boolean;
  public readonly providerMessageId?: string;
  public readonly details?: unknown;

  constructor(
    message: string,
    options: {
      code?: WhatsAppErrorCode;
      statusCode?: number;
      isRetryable?: boolean;
      providerMessageId?: string;
      details?: unknown;
    } = {}
  ) {
    super(message);
    this.name = 'WhatsAppProviderError';
    this.code = options.code ?? 'PROVIDER_ERROR';
    this.statusCode = options.statusCode ?? 500;
    this.isRetryable = options.isRetryable ?? false;
    this.providerMessageId = options.providerMessageId;
    this.details = options.details;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class WhatsAppMessagingWindowExpiredError extends WhatsAppProviderError {
  constructor(recipientNumber: string, details?: unknown) {
    super(
      `Cannot send free-form message to ${recipientNumber}: the 24-hour customer service window has expired. You must use an approved template message to initiate contact.`,
      {
        code: 'MESSAGING_WINDOW_EXPIRED',
        statusCode: 400,
        isRetryable: false,
        details,
      }
    );
    this.name = 'WhatsAppMessagingWindowExpiredError';
  }
}

export class WhatsAppTemplateNotApprovedError extends WhatsAppProviderError {
  constructor(templateName: string, status: string, details?: unknown) {
    super(
      `WhatsApp template '${templateName}' cannot be dispatched because its status is '${status}' (must be 'APPROVED').`,
      {
        code: 'TEMPLATE_NOT_APPROVED',
        statusCode: 400,
        isRetryable: false,
        details,
      }
    );
    this.name = 'WhatsAppTemplateNotApprovedError';
  }
}

export class WhatsAppRateLimitExceededError extends WhatsAppProviderError {
  public readonly retryAfterSeconds?: number;

  constructor(message: string, retryAfterSeconds?: number, details?: unknown) {
    super(message, {
      code: 'RATE_LIMIT_EXCEEDED',
      statusCode: 429,
      isRetryable: true,
      details,
    });
    this.name = 'WhatsAppRateLimitExceededError';
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class WhatsAppAuthenticationError extends WhatsAppProviderError {
  constructor(message: string, details?: unknown) {
    super(message, {
      code: 'AUTHENTICATION_FAILED',
      statusCode: 401,
      isRetryable: false,
      details,
    });
    this.name = 'WhatsAppAuthenticationError';
  }
}

export class WhatsAppWebhookVerificationError extends WhatsAppProviderError {
  constructor(message: string, details?: unknown) {
    super(message, {
      code: 'WEBHOOK_VERIFICATION_FAILED',
      statusCode: 403,
      isRetryable: false,
      details,
    });
    this.name = 'WhatsAppWebhookVerificationError';
  }
}

export class WhatsAppInvalidPhoneNumberError extends WhatsAppProviderError {
  constructor(phoneNumber: string, details?: unknown) {
    super(
      `Invalid recipient phone number '${phoneNumber}'. Must be formatted according to E.164 international standard with country code (e.g., +966501234567).`,
      {
        code: 'INVALID_PHONE_NUMBER',
        statusCode: 400,
        isRetryable: false,
        details,
      }
    );
    this.name = 'WhatsAppInvalidPhoneNumberError';
  }
}

export class WhatsAppCapabilityNotSupportedError extends WhatsAppProviderError {
  constructor(providerName: string, capability: string) {
    super(`WhatsApp Provider '${providerName}' does not support '${capability}'.`, {
      code: 'CAPABILITY_NOT_SUPPORTED',
      statusCode: 400,
      isRetryable: false,
    });
    this.name = 'WhatsAppCapabilityNotSupportedError';
  }
}
