import React from 'react';
import { Modal } from '@carbon/react';
import { useTranslation } from 'react-i18next';

export interface EntityFormDeleteModalProps {
  isOpen: boolean;
  resourceLabel: string;
  recordId?: string;
  recordTitle?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function EntityFormDeleteModal({
  isOpen,
  resourceLabel,
  recordId,
  recordTitle,
  isDeleting = false,
  onConfirm,
  onClose,
}: EntityFormDeleteModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={isOpen}
      danger
      modalHeading={`Delete ${resourceLabel}?`}
      primaryButtonText={t('ui.actions.delete', 'Delete')}
      secondaryButtonText={t('ui.actions.cancel', 'Cancel')}
      primaryButtonDisabled={isDeleting}
      onRequestSubmit={onConfirm}
      onRequestClose={onClose}
      size="sm"
    >
      <div style={{ padding: '0.5rem 0' }}>
        <p style={{ marginBottom: '1rem', color: 'var(--cds-text-primary)' }}>
          Are you sure you want to permanently delete this {resourceLabel.toLowerCase()}
          {recordTitle ? ` "${recordTitle}"` : ''}
          {recordId ? ` (ID: ${recordId})` : ''}?
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
          This action cannot be undone. All associated data will be removed.
        </p>
      </div>
    </Modal>
  );
}
