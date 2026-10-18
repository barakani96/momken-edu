import { create } from 'zustand';
import { NotificationTemplate, DeliveryLog, WorkflowDefinition } from './platformTypes';

interface PlatformStore {
  templates: NotificationTemplate[];
  deliveryLogs: DeliveryLog[];
  workflows: WorkflowDefinition[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchTemplates: () => Promise<void>;
  fetchDeliveryLogs: () => Promise<void>;
  fetchWorkflows: () => Promise<void>;
  createTemplate: (data: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  createWorkflow: (data: Omit<WorkflowDefinition, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
}

// Mock Data
const MOCK_TEMPLATES: NotificationTemplate[] = [
  {
    id: 'tpl_01',
    name: 'Welcome Email (Student)',
    description: 'Sent when a new student account is fully provisioned.',
    channel: 'email',
    triggerEvent: 'user.provisioned.student',
    subject: 'Welcome to EduCore Platform',
    body: 'Dear {{name}}, your account has been provisioned...',
    status: 'active',
    createdAt: '2025-01-10T10:00:00Z',
    updatedAt: '2025-01-15T12:00:00Z',
  },
  {
    id: 'tpl_02',
    name: 'Emergency Closure Alert',
    description: 'Broadcast SMS for sudden campus closures.',
    channel: 'sms',
    triggerEvent: 'campus.emergency.closure',
    body: 'URGENT: Campus {{campus_name}} is closed on {{date}} due to {{reason}}.',
    status: 'active',
    createdAt: '2025-02-01T08:00:00Z',
    updatedAt: '2025-02-01T08:00:00Z',
  }
];

const MOCK_LOGS: DeliveryLog[] = [
  {
    id: 'log_101',
    templateId: 'tpl_01',
    recipient: 'student1@educore.edu',
    channel: 'email',
    status: 'delivered',
    sentAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'log_102',
    templateId: 'tpl_02',
    recipient: '+1234567890',
    channel: 'sms',
    status: 'failed',
    error: 'Invalid phone number format',
    sentAt: new Date(Date.now() - 7200000).toISOString(),
  }
];

const MOCK_WORKFLOWS: WorkflowDefinition[] = [
  {
    id: 'wf_01',
    name: 'Final Grade Override',
    description: 'Approval chain required when an instructor attempts to override a published final grade.',
    triggerEvent: 'grade.override.requested',
    owner: 'registrar_office',
    status: 'active',
    steps: [
      { id: 'st_1', stepOrder: 1, type: 'approval', approverRole: 'department_head' },
      { id: 'st_2', stepOrder: 2, type: 'approval', approverRole: 'registrar_admin' },
      { id: 'st_3', stepOrder: 3, type: 'notification' }
    ],
    createdAt: '2025-01-12T09:00:00Z',
    updatedAt: '2025-03-01T11:00:00Z',
  },
  {
    id: 'wf_02',
    name: 'Staff Leave Request',
    description: 'Standard HR workflow for faculty and staff leave requests.',
    triggerEvent: 'hr.leave.requested',
    owner: 'hr_department',
    status: 'active',
    steps: [
      { id: 'st_4', stepOrder: 1, type: 'approval', approverRole: 'manager' },
      { id: 'st_5', stepOrder: 2, type: 'system_action' }
    ],
    createdAt: '2025-01-20T10:00:00Z',
    updatedAt: '2025-01-20T10:00:00Z',
  }
];

export const usePlatformStore = create<PlatformStore>((set, get) => ({
  templates: MOCK_TEMPLATES,
  deliveryLogs: MOCK_LOGS,
  workflows: MOCK_WORKFLOWS,
  loading: false,
  error: null,

  fetchTemplates: async () => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 600));
    set({ templates: MOCK_TEMPLATES, loading: false });
  },

  fetchDeliveryLogs: async () => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 400));
    set({ deliveryLogs: MOCK_LOGS, loading: false });
  },

  fetchWorkflows: async () => {
    set({ loading: true, error: null });
    await new Promise(resolve => setTimeout(resolve, 600));
    set({ workflows: MOCK_WORKFLOWS, loading: false });
  },

  createTemplate: async (data) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 800));
    const newTpl: NotificationTemplate = {
      ...data,
      id: `tpl_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set({ templates: [newTpl, ...get().templates], loading: false });
  },

  createWorkflow: async (data) => {
    set({ loading: true });
    await new Promise(resolve => setTimeout(resolve, 800));
    const newWf: WorkflowDefinition = {
      ...data,
      id: `wf_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    set({ workflows: [newWf, ...get().workflows], loading: false });
  }
}));
