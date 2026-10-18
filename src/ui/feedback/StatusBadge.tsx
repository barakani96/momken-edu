/**
 * @schools/ui/feedback — StatusBadge Component
 * Reusable status badge component representing enrollment states (e.g., Pending, Enrolled, Waitlisted)
 * using Carbon Design System Tag and design tokens.
 */

import React from 'react';
import { Tag } from '@carbon/react';

export type EnrollmentStatusState =
  | 'Pending'
  | 'Enrolled'
  | 'Waitlisted'
  | 'Active'
  | 'Graduated'
  | 'Withdrawn'
  | 'Suspended'
  | 'Rejected'
  | 'approved'
  | 'active'
  | 'enrolled'
  | 'admitted'
  | 'applicant'
  | 'graduated'
  | 'withdrawn'
  | 'suspended';

interface StatusBadgeProps {
  status: EnrollmentStatusState | string;
  label?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, label, size = 'md' }) => {
  const normalized = (status || '').toLowerCase();

  let tagType: 'green' | 'blue' | 'purple' | 'magenta' | 'red' | 'gray' | 'cool-gray' = 'blue';

  if (['enrolled', 'active', 'approved', 'admitted'].includes(normalized)) {
    tagType = 'green';
  } else if (['pending', 'applicant', 'waitlisted'].includes(normalized)) {
    tagType = 'purple';
  } else if (['graduated'].includes(normalized)) {
    tagType = 'blue';
  } else if (['withdrawn', 'rejected', 'suspended'].includes(normalized)) {
    tagType = 'red';
  } else {
    tagType = 'cool-gray';
  }

  const displayLabel = label || status;

  return (
    <Tag type={tagType} size={size}>
      {displayLabel}
    </Tag>
  );
};
