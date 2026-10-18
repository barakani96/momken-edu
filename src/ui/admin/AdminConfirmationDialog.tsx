/**
 * Admin Console Confirmation & Typed Deletion Modal Dialogs
 */

import React, { useState } from 'react';
import { Modal, TextInput, InlineNotification } from '@carbon/react';
import { Warning } from '@carbon/icons-react';

export interface AdminConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  bodyText: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  typedConfirmationText?: string; // e.g. "CONFIRM_DELETE"
  onConfirm: () => void;
  onClose: () => void;
}

export function AdminConfirmationDialog({
  isOpen,
  title,
  subtitle,
  bodyText,
  confirmLabel = 'Confirm Action',
  cancelLabel = 'Cancel',
  danger = false,
  typedConfirmationText,
  onConfirm,
  onClose,
}: AdminConfirmationDialogProps) {
  const [typedValue, setTypedValue] = useState('');

  const isConfirmedDisabled = typedConfirmationText
    ? typedValue.trim() !== typedConfirmationText
    : false;

  const handleModalSubmit = () => {
    if (isConfirmedDisabled) return;
    onConfirm();
    setTypedValue('');
  };

  return (
    <Modal
      open={isOpen}
      modalHeading={title}
      modalLabel={subtitle || 'Administrative Action'}
      primaryButtonText={confirmLabel}
      secondaryButtonText={cancelLabel}
      danger={danger}
      primaryButtonDisabled={isConfirmedDisabled}
      onRequestSubmit={handleModalSubmit}
      onRequestClose={() => {
        setTypedValue('');
        onClose();
      }}
    >
      <div style={{ padding: '0.5rem 0' }}>
        {danger && (
          <InlineNotification
            kind="error"
            title="High-Risk Action"
            subtitle="This administrative action may cause permanent data modification or access loss."
            hideCloseButton
            style={{ marginBottom: '1rem' }}
          />
        )}

        <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-primary)', marginBottom: '1rem' }}>
          {bodyText}
        </p>

        {typedConfirmationText && (
          <div style={{ marginTop: '1rem' }}>
            <TextInput
              id="typed-confirm-input"
              labelText={`To confirm, type "${typedConfirmationText}" below:`}
              placeholder={typedConfirmationText}
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
            />
          </div>
        )}
      </div>
    </Modal>
  );
}

export function AdminDeleteDialog({
  isOpen,
  entityName,
  entityType = 'record',
  typedConfirmation = false,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  entityName: string;
  entityType?: string;
  typedConfirmation?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AdminConfirmationDialog
      isOpen={isOpen}
      title={`Delete ${entityType}: "${entityName}"?`}
      subtitle="Permanent Administrative Action"
      bodyText={`Are you sure you want to delete ${entityType} "${entityName}"? This action cannot be undone and will trigger an audit trail entry.`}
      confirmLabel="Delete Permanently"
      cancelLabel="Keep Record"
      danger
      typedConfirmationText={typedConfirmation ? 'CONFIRM_DELETE' : undefined}
      onConfirm={onConfirm}
      onClose={onClose}
    />
  );
}
