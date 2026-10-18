/**
 * WhatsApp Provider Contract Verification Suite
 * Momken Education ERP — Multi-Tenant Institutional Communication Engine
 */

import { WhatsAppProvider } from '../whatsapp-provider.interface';
import {
  WhatsAppSenderContext,
  WhatsAppTemplateMessageRequest,
  WhatsAppTextMessageRequest,
  WhatsAppMediaMessageRequest,
  WhatsAppInteractiveMessageRequest,
} from '../whatsapp.types';
import { MockWhatsAppProvider } from '../whatsapp-mock.provider';
import { WhatsAppProviderRegistry } from '../whatsapp-provider.registry';
import { WhatsAppService } from '../whatsapp.service';
import { normalizeE164PhoneNumber, isValidE164 } from '../whatsapp.security';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

export async function runWhatsAppContractVerification(): Promise<{ passed: boolean; results: string[] }> {
  const results: string[] = [];

  const provider: WhatsAppProvider = new MockWhatsAppProvider();
  const registry = WhatsAppProviderRegistry.getInstance();
  registry.clear();
  registry.register(provider, true);
  const service = new WhatsAppService({ registry });

  const mockContext: WhatsAppSenderContext = {
    tenantId: 'tenant_riyadh_01',
    campusId: 'campus_boys_high',
    wabaId: 'waba_9988776655',
    phoneNumberId: 'phone_id_112233',
    senderPhoneNumber: '+966112345678',
    displayPhoneNumberName: 'Momken International School',
    defaultLanguage: 'ar',
  };

  // 1. Provider Contract & Health
  assert(provider.id === 'mock', 'provider id must be mock');
  assert(provider.capabilities.supportsTemplateSync === true, 'must support template sync');
  assert(provider.capabilities.supportsInteractiveMessages === true, 'must support interactive');

  const health = await service.checkProviderHealth(mockContext);
  assert(health.status === 'HEALTHY', 'health check must be HEALTHY');
  results.push('✓ Provider metadata, capabilities, and health check verified');

  // 2. Phone Normalization & E.164
  assert(normalizeE164PhoneNumber('0501234567', '+966') === '+966501234567', 'local 050 normalized to +966');
  assert(normalizeE164PhoneNumber('00966501234567') === '+966501234567', '00 prefix normalized to +');
  assert(isValidE164('+966501234567'), '+966501234567 is valid E.164');
  assert(!isValidE164('0501234567'), 'national number without prefix is not E.164');
  results.push('✓ Phone number normalization and E.164 validation verified');

  // 3. Message Handling - Template
  const templateReq: WhatsAppTemplateMessageRequest = {
    type: 'template',
    recipientNumber: '+966501234567',
    payload: {
      templateName: 'student_attendance_absence_alert',
      language: { code: 'ar' },
      components: [
        {
          type: 'BODY',
          parameters: [
            { type: 'text', text: 'فهد العتيبي' },
            { type: 'text', text: 'اليوم' },
            { type: 'text', text: 'الثانية' },
          ],
        },
      ],
    },
  };
  const templateRes = await service.sendTemplate(templateReq, mockContext);
  assert(templateRes.success === true, 'template send must succeed');
  assert(templateRes.status === 'ACCEPTED', 'status must be ACCEPTED');
  results.push('✓ Template message dispatch verified');

  // 4. Message Handling - 24h Window Enforcement
  const recipient = '+966509876543';
  const textReq: WhatsAppTextMessageRequest = {
    type: 'text',
    recipientNumber: recipient,
    payload: {
      body: 'مرحباً بكم في مدارس ممكن الأهلية',
    },
  };

  let threwWindowError = false;
  try {
    await service.sendText(textReq, mockContext);
  } catch (err: any) {
    if (err.name === 'WhatsAppMessagingWindowExpiredError' || err.code === 'MESSAGING_WINDOW_EXPIRED') {
      threwWindowError = true;
    }
  }
  assert(threwWindowError, 'Free-form message outside 24h window must be rejected');

  // Open window
  service.openMessagingWindow(recipient, new Date());
  assert(service.isMessagingWindowActive(recipient), 'Window must be active');
  const textRes = await service.sendText(textReq, mockContext);
  assert(textRes.success === true, 'Session message within window must succeed');
  results.push('✓ 24-hour customer messaging window policy enforcement verified');

  // 5. Media & Interactive
  const mediaReq: WhatsAppMediaMessageRequest = {
    type: 'media',
    recipientNumber: '+966501234567',
    payload: {
      type: 'document',
      url: 'https://momken.edu.sa/documents/receipt_102.pdf',
      filename: 'tuition_receipt.pdf',
      caption: 'إشعار سداد الرسوم الدراسية',
    },
  };
  const mediaRes = await service.sendMedia(mediaReq, mockContext);
  assert(mediaRes.success === true, 'media send must succeed');

  const interactiveReq: WhatsAppInteractiveMessageRequest = {
    type: 'interactive',
    recipientNumber: '+966501234567',
    payload: {
      type: 'button',
      body: { text: 'هل تؤكد التسجيل؟' },
      action: {
        buttons: [{ type: 'reply', reply: { id: 'btn_confirm', title: 'تأكيد التسجيل' } }],
      },
    },
  };
  const interactiveRes = await service.sendInteractive(interactiveReq, mockContext);
  assert(interactiveRes.success === true, 'interactive send must succeed');
  results.push('✓ Media and interactive message dispatch verified');

  // 6. Template Synchronization
  const syncRes = await service.syncTemplates(mockContext, { language: 'ar' });
  assert(syncRes.templates.length > 0, 'templates must be returned');
  const arTemplate = await service.getTemplate('student_attendance_absence_alert', 'ar', mockContext);
  assert(arTemplate?.status === 'APPROVED', 'arabic template status must be APPROVED');
  results.push('✓ Template synchronization and language filtering verified');

  // 7. Webhook Verification & Parsing
  const webhookConfig = {
    verifyToken: 'momken_token_2026',
    appSecret: 'secret_123',
  };
  const challengeRes = service.verifyWebhookSubscription(
    { mode: 'subscribe', verifyToken: 'momken_token_2026', challenge: 'challenge_code_99' },
    webhookConfig
  );
  assert(challengeRes.isValid === true && challengeRes.challengeResponse === 'challenge_code_99', 'challenge must match');

  const inboundPayload = {
    entry: [
      {
        changes: [
          {
            value: {
              metadata: { phone_number_id: 'phone_id_112233' },
              messages: [
                {
                  from: '966551122334',
                  id: 'wamid_test_inbound',
                  timestamp: Math.floor(Date.now() / 1000).toString(),
                  type: 'text',
                  text: { body: 'استفسار عن القبول' },
                },
              ],
            },
          },
        ],
      },
    ],
  };
  const events = service.processWebhookPayload(inboundPayload);
  assert(events.length === 1, '1 event parsed');
  assert(events[0].eventType === 'MESSAGE_RECEIVED', 'event type is MESSAGE_RECEIVED');
  assert(service.isMessagingWindowActive('+966551122334'), 'inbound must activate 24h window for sender');
  results.push('✓ Webhook challenge verification, payload transformation, and inbound window activation verified');

  return { passed: true, results };
}
