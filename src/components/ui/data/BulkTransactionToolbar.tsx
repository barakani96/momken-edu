/**
 * BulkTransactionToolbar Component
 * Renders a sticky, floating bar at the bottom of data views, providing
 * 'Save All' and 'Discard Changes' actions for staged edits in the useModuleStore state.
 * Fully styled and accessible according to IBM Carbon Design System.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Button,
  Modal,
  Tag,
  InlineLoading,
} from '@carbon/react';
import {
  Save,
  Undo,
  View,
  CheckmarkOutline,
  WarningFilled,
} from '@carbon/icons-react';
import { useModuleStore, StagedEditRecord } from '../../../stores/useModuleStore';
import { useNotification } from '../../../core/notifications/NotificationContext';

export interface BulkTransactionToolbarProps {
  /** Optional module ID to bind automatically to useModuleStore */
  moduleId?: string;
  /** Optional entity name to bind automatically to useModuleStore */
  entityName?: string;

  /** Manual staged edits list (when not using useModuleStore directly) */
  stagedEdits?: StagedEditRecord[];
  /** Manual count of dirty cells */
  dirtyCellCount?: number;
  /** Manual count of modified rows */
  modifiedRowCount?: number;

  /** Custom save action handler */
  onSaveAll?: () => Promise<void> | void;
  /** Custom discard action handler */
  onDiscardAll?: () => void;

  /** Flag indicating if commit is in progress */
  isSaving?: boolean;
  /** Optional custom CSS class */
  className?: string;
  /** Custom placement offset from bottom */
  bottomOffset?: string;
}

export const BulkTransactionToolbar: React.FC<BulkTransactionToolbarProps> = ({
  moduleId,
  entityName,
  stagedEdits: customStagedEdits,
  dirtyCellCount: customDirtyCellCount,
  modifiedRowCount: customModifiedRowCount,
  onSaveAll: customOnSaveAll,
  onDiscardAll: customOnDiscardAll,
  isSaving: customIsSaving = false,
  className = '',
  bottomOffset = '1rem',
}) => {
  const { notify } = useNotification();
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [isConfirmDiscardOpen, setIsConfirmDiscardOpen] = useState(false);
  const [internalSaving, setInternalSaving] = useState(false);

  // Bind to module store if moduleId and entityName are provided
  const store = moduleId ? useModuleStore(moduleId) : null;

  const storeEdits: StagedEditRecord[] = (store && entityName) ? store.getStagedEdits(entityName) : [];
  const storeCounts = (store && entityName)
    ? store.getStagedCount(entityName)
    : store
    ? store.getStagedCount()
    : { dirtyCells: 0, modifiedRows: 0 };

  const effectiveEdits: StagedEditRecord[] = customStagedEdits || storeEdits;
  const effectiveDirtyCount: number = customDirtyCellCount !== undefined
    ? customDirtyCellCount
    : (customStagedEdits ? customStagedEdits.length : storeCounts.dirtyCells);
  const effectiveModifiedRowCount: number = customModifiedRowCount !== undefined
    ? customModifiedRowCount
    : (customStagedEdits
      ? new Set(customStagedEdits.map((e) => String(e.rowId))).size
      : storeCounts.modifiedRows);

  const isSaving = customIsSaving || internalSaving;

  const handleSave = useCallback(async () => {
    try {
      setInternalSaving(true);
      if (customOnSaveAll) {
        await customOnSaveAll();
      } else if (store && entityName) {
        await store.commitStagedEdits(entityName);
        notify({
          kind: 'success',
          title: 'Changes Saved',
          subtitle: `Successfully saved ${effectiveDirtyCount} staged edit(s) for ${entityName}.`,
        });
      }
    } catch (err: any) {
      notify({
        kind: 'error',
        title: 'Save Failed',
        subtitle: err?.message || 'An error occurred while saving staged transactions.',
      });
    } finally {
      setInternalSaving(false);
      setIsReviewOpen(false);
    }
  }, [customOnSaveAll, store, entityName, effectiveDirtyCount, notify]);

  const handleDiscard = useCallback(() => {
    if (customOnDiscardAll) {
      customOnDiscardAll();
    } else if (store && entityName) {
      store.discardStagedEdits(entityName);
      notify({
        kind: 'info',
        title: 'Edits Discarded',
        subtitle: `Restored initial values for ${entityName}.`,
      });
    } else if (store) {
      store.discardAllStagedEdits();
    }
    setIsConfirmDiscardOpen(false);
    setIsReviewOpen(false);
  }, [customOnDiscardAll, store, entityName, notify]);

  // Keyboard shortcut support (Ctrl+S / Cmd+S to save all, Esc to cancel modals)
  useEffect(() => {
    if (effectiveDirtyCount === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (!isSaving) {
          handleSave();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [effectiveDirtyCount, isSaving, handleSave]);

  if (effectiveDirtyCount === 0 && effectiveModifiedRowCount === 0) {
    return null;
  }

  return (
    <>
      <div
        id="bulk-transaction-toolbar"
        className={`cds-bulk-transaction-toolbar ${className}`}
        role="region"
        aria-live="polite"
        aria-label="Pending staged transactions"
        style={{
          position: 'sticky',
          bottom: bottomOffset,
          zIndex: 900,
          margin: '1.25rem auto 0 auto',
          width: 'calc(100% - 2rem)',
          maxWidth: '1240px',
          backgroundColor: 'var(--cds-layer-02, #262626)',
          color: 'var(--cds-text-inverse, #ffffff)',
          borderRadius: '4px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
          border: '1px solid var(--cds-border-inverse, #525252)',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          animation: 'cds-fade-in 180ms cubic-bezier(0, 0, 0.2, 1)',
        }}
      >
        {/* Left Information Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--cds-interactive, #0f62fe)',
                color: '#ffffff',
                borderRadius: '50%',
                minWidth: '24px',
                height: '24px',
                padding: '0 6px',
                fontWeight: 700,
                fontSize: '0.75rem',
              }}
            >
              {effectiveModifiedRowCount}
            </span>
            <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: '#ffffff' }}>
              Unsaved Changes ({effectiveModifiedRowCount} {effectiveModifiedRowCount === 1 ? 'row' : 'rows'} modified, {effectiveDirtyCount} {effectiveDirtyCount === 1 ? 'cell' : 'cells'})
            </span>
          </div>

          <Tag type="blue" size="md">
            Staged in Memory
          </Tag>

          <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary, #c6c6c6)' }}>
            Press <kbd style={{ padding: '2px 4px', backgroundColor: '#393939', borderRadius: '3px', border: '1px solid #525252' }}>Ctrl+S</kbd> to save
          </span>
        </div>

        {/* Right Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {effectiveEdits.length > 0 && (
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
            kind="danger"
            renderIcon={Undo}
            onClick={() => setIsConfirmDiscardOpen(true)}
            disabled={isSaving}
          >
            Discard Changes
          </Button>

          <Button
            size="sm"
            kind="primary"
            renderIcon={Save}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? <InlineLoading description="Saving..." /> : 'Save All'}
          </Button>
        </div>
      </div>

      {/* Audit & Review Modal */}
      {isReviewOpen && (
        <Modal
          open={isReviewOpen}
          modalHeading={`Review Staged Edits (${effectiveEdits.length})`}
          primaryButtonText="Save All Changes"
          secondaryButtonText="Close Review"
          onRequestSubmit={handleSave}
          onRequestClose={() => setIsReviewOpen(false)}
          size="lg"
        >
          <p style={{ marginBottom: '1rem', color: 'var(--cds-text-secondary)' }}>
            Below is the comprehensive ledger of all staged cell changes prior to transactional persistence.
          </p>

          <div
            style={{
              maxHeight: '380px',
              overflowY: 'auto',
              border: '1px solid var(--cds-border-subtle)',
              borderRadius: '2px',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--cds-layer-02)', borderBottom: '1px solid var(--cds-border-subtle)' }}>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Record / ID</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Field Name</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>Original Value</th>
                  <th style={{ padding: '0.5rem 0.75rem', textAlign: 'left', fontWeight: 600 }}>New Value</th>
                </tr>
              </thead>
              <tbody>
                {effectiveEdits.map((edit, idx) => (
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
          modalHeading="Discard Staged Changes?"
          primaryButtonText="Discard Changes"
          secondaryButtonText="Keep Editing"
          danger
          onRequestSubmit={handleDiscard}
          onRequestClose={() => setIsConfirmDiscardOpen(false)}
        >
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
            <WarningFilled size={24} style={{ color: 'var(--cds-support-error)', flexShrink: 0 }} />
            <p>
              Are you sure you want to discard all <strong>{effectiveDirtyCount}</strong> staged edit(s) across{' '}
              <strong>{effectiveModifiedRowCount}</strong> record(s)? All uncommitted changes will be immediately restored to their original values in memory and persistence.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
};
