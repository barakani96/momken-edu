export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  channel: 'email' | 'sms' | 'in-app' | 'push';
  triggerEvent: string;
  subject?: string;
  body: string;
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryLog {
  id: string;
  templateId: string;
  recipient: string;
  channel: 'email' | 'sms' | 'in-app' | 'push';
  status: 'delivered' | 'failed' | 'pending';
  sentAt: string;
  error?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  triggerEvent: string;
  owner: string;
  status: 'active' | 'draft' | 'deprecated';
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStep {
  id: string;
  stepOrder: number;
  type: 'approval' | 'notification' | 'system_action';
  approverRole?: string;
  autoApproveAfterHours?: number;
}
