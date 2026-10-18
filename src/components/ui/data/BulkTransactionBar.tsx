/**
 * BulkTransactionBar Component
 * Floating sticky transaction action bar for batch inline editing in InteractiveGrid and DataViews.
 * Provides live change metrics, instant bulk commit, revert all, and an interactive review changes modal.
 */

import React, { useState } from 'react';
import {
  Button,
  Modal,
  Tag,
  InlineLoading,
} from '@carbon/react';
import {
  Save,
  Undo,
  WarningAlt,
  CheckmarkOutline,
  View,
  List,
} from '@carbon/icons-react';

export interface StagedEditItem {
  rowId: string | number;
  rowLabel?: string;
  field: string;
  fieldLabel?: string;
  originalValue: any;
  newValue: any;
}

export interface BulkTransactionBarProps {
  dirtyCellCount: number;
  modifiedRowCount: number;
  stagedEdits?: StagedEditItem[];
  isSaving?: boolean;
  onSaveAll: () => Promise<void> | void;
  onDiscardAll: () => void;
  entityName?: string;
  className?: string;
}

export const BulkTransactionBar: React.FC<BulkTransactionBarProps> = ({
  dirtyCellCount,
  modifiedRowCount,
  stagedEdits = [],
  isSaving = false,
  onSaveAll,
  onDiscardAll,
  entityName = 'records',
  className = '',
}) => {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isConfirmDiscardOpen, setIsConfirmDiscardOpen] = useState(false);

  if (dirtyCellCount === 0 && modifiedRowCount === 0) {
    return null;
  }

  return (
    <>
      <div
        className={`cds-bulk-transaction-bar ${className}`}
        role="region"
        aria-live="polite"
        aria-label="Pending batch changes"
        style={{
          position: 'sticky',
          bottom: '1rem',
          zIndex: 900,
          margin: '1rem auto 0 auto',
          width: 'calc(100% - 2rem)',
          maxWidth: '1200px',
          backgroundColor: 'var(--cds-layer-02, #393939)',
          color: 'var(--cds-text-inverse, #ffffff)',
          borderRadius: '4px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.28)',
          border: '1px solid var(--cds-border-inverse, #525252)',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          animation: 'cds-fade-in 200ms cubic-bezier(0, 0, 0.2, 1)',
        }}
      >
        {/* Left info & status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--cds-interactive, #0f62fe)',
                color: '#fff',
                borderRadius: '50%',
                width: '24px',
                height: '24px',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              {modifiedRowCount}
            </span>
            <span style={{ fontWeight: 600, fontSize: '0.9375rem' }}>
              Unsaved Changes ({modifiedRowCount} {entityName} modified, {dirtyCellCount} {dirtyCellCount === 1 ? 'cell' : 'cells'})
            </span>
          </div>

          <Tag type="blue" size="md">
            Pending Transaction
          </Tag>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {stagedEdits.length > 0 && (
            <Button
              size="sm"
              kind="ghost"
              renderIcon={View}
              onClick={() => setIsReviewOpen(true)}
              style={{ color: 'var(--cds-text-inverse, #ffffff)' }}
            >
              Review Edits
            </Button>
          )}

          <Button
            size="sm"
            kind="secondary"
            renderIcon={Undo}
            onClick={() => setIsConfirmDiscardOpen(true)}
            disabled={isSaving}
          >
            Discard All
          </Button>

          <Button
            size="sm"
            kind="primary"
            renderIcon={Save}
            onClick={onSaveAll}
            disabled={isSaving}
          >
            {isSaving ? <InlineLoading description="Saving..." /> : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Review Modal */}
      {isReviewOpen && (
        <Modal
          open={isReviewOpen}
          modalHeading={`Review Staged Edits (${stagedEdits.length})`}
          primaryButtonText="Save Changes"
          secondaryButtonText="Close Review"
          onRequestSubmit={() => {
            setIsReviewOpen(false);
            onSaveAll();
          }}
          onRequestClose={() => setIsReviewOpen(false)}
          size="lg"
        >
          <p style={{ marginBottom: '1rem', color: 'var(--cds-text-secondary)' }}>
            The following table lists all fields modified during this editing session. Verify before committing.
          </p>

          <div
            style={{
              maxHeight: '400px',
              overflowY: 'auto',
              border: '1px solid var(--cds-border-subtle)',
              borderRadius: '2px',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--cds-layer-02)', borderBottom: '1px solid var(--cds-border-subtle)' }}>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Row / ID</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Field</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Original Value</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>New Staged Value</th>
                </tr>
              </thead>
              <tbody>
                {stagedEdits.map((edit, idx) => (
                  <tr
                    key={`${edit.rowId}-${edit.field}-${idx}`}
                    style={{
                      borderBottom: '1px solid var(--cds-border-subtle)',
                      backgroundColor: idx % 2 === 0 ? 'var(--cds-layer-01)' : 'transparent',
                    }}
                  >
                    <td style={{ padding: '0.5rem 0.75rem', fontWeight: 600 }}>
                      {edit.rowLabel || String(edit.rowId)}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem' }}>
                      {edit.fieldLabel || edit.field}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--cds-text-secondary)', textDecoration: 'line-through' }}>
                      {String(edit.originalValue ?? '—')}
                    </td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--cds-support-success)', fontWeight: 600 }}>
                      {String(edit.newValue ?? '—')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}

      {/* Discard Confirmation Modal */}
      {isConfirmDiscardOpen && (
        <Modal
          open={isConfirmDiscardOpen}
          modalHeading="Discard All Unsaved Edits?"
          primaryButtonText="Discard Changes"
          secondaryButtonText="Keep Editing"
          danger
          onRequestSubmit={() => {
            setIsConfirmDiscardOpen(false);
            onDiscardAll();
          }}
          onRequestClose={() => setIsConfirmDiscardOpen(false)}
        >
          <p>
            Are you sure you want to discard all <strong>{dirtyCellCount}</strong> staged edit(s) across{' '}
            <strong>{modifiedRowCount}</strong> record(s)? All uncommitted changes will be restored to their initial values.
          </p>
        </Modal>
      )}
    </>
  );
};
