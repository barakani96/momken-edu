/**
 * Admin Console Status Badge Component
 */

import React from 'react';
import { Tag } from '@carbon/react';

export type StatusKind =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'suspended'
  | 'locked'
  | 'archived'
  | 'draft'
  | 'closed'
  | 'healthy'
  | 'degraded'
  | 'unavailable'
  | 'connected'
  | 'disconnected'
  | 'error'
  | 'running'
  | 'completed'
  | 'failed';

interface AdminStatusBadgeProps {
  status: StatusKind | string;
  size?: 'sm' | 'md';
  className?: string;
}

export function AdminStatusBadge({ status, size = 'sm', className = '' }: AdminStatusBadgeProps) {
  const norm = (status || 'unknown').toLowerCase();

  let tagType: any = 'cool-gray';
  let label = status;

  switch (norm) {
    case 'active':
    case 'connected':
    case 'healthy':
    case 'completed':
    case 'enabled':
      tagType = 'green';
      label = status === 'active' ? 'Active' : status.toUpperCase();
      break;
    case 'inactive':
    case 'disconnected':
    case 'disabled':
    case 'draft':
      tagType = 'cool-gray';
      label = norm.toUpperCase();
      break;
    case 'pending':
    case 'investigating':
    case 'running':
    case 'degraded':
    case 'testing':
      tagType = 'warm-gray';
      label = norm.toUpperCase();
      break;
    case 'suspended':
    case 'locked':
    case 'closed':
      tagType = 'purple';
      label = norm.toUpperCase();
      break;
    case 'failed':
    case 'error':
    case 'unavailable':
    case 'critical':
    case 'high':
      tagType = 'red';
      label = norm.toUpperCase();
      break;
    case 'archived':
      tagType = 'teal';
      label = 'ARCHIVED';
      break;
    default:
      tagType = 'cyan';
      label = status;
      break;
  }

  return (
    <Tag type={tagType} size={size} className={className}>
      {label}
    </Tag>
  );
}
