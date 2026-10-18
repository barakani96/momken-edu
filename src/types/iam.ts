export interface Permission {
  id: string;
  name: string;
  category: string; // e.g., 'SIS', 'Finance', 'HR', 'IAM'
  action: 'read' | 'write' | 'delete' | 'manage';
  resource: string; // e.g., 'students', 'users', 'invoices'
  descriptionEn: string;
  descriptionAr: string;
}

export interface Role {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  permissions: string[]; // Permission IDs
  isSystemRole: boolean;
  createdAt: string;
}

export interface Group {
  id: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  roleIds: string[];
  memberCount: number;
  createdAt: string;
}

export interface Tenant {
  id: string;
  nameEn: string;
  nameAr: string;
  domain: string;
  code: string;
  status: 'active' | 'suspended' | 'pending';
  plan: 'standard' | 'enterprise' | 'trial';
  createdAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  roleId: string;
  groupIds: string[];
  tenantId: string;
  status: 'active' | 'suspended' | 'pending';
  mfaEnabled: boolean;
  mfaMethod: 'none' | 'totp' | 'sms' | 'email';
  ssoProvider: 'none' | 'google' | 'saml' | 'okta';
  createdAt: string;
  lastLogin: string;
}

export interface ActiveSession {
  id: string;
  userId: string;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface ServiceAccount {
  id: string;
  name: string;
  description: string;
  roleId: string;
  apiKeyHint: string;
  createdAt: string;
  expiresAt: string;
  status: 'active' | 'revoked';
}

export interface SSOProviderConfig {
  id: string;
  name: string;
  type: 'saml' | 'oidc';
  clientId: string;
  metadataUrl: string;
  enabled: boolean;
}

export interface AxeAccessibilityIssue {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  helpUrl: string;
  nodesCount: number;
  selector: string;
}
