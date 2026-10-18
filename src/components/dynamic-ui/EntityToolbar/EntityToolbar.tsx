import React, { useEffect } from 'react';
import { Button } from '@carbon/react';
import {
  Add,
  Edit,
  Save,
  Search,
  TrashCan,
  Locked,
  Unlocked,
  Printer,
  PageFirst,
  ChevronLeft,
  ChevronRight,
  PageLast,
  Table,
  Close,
  Renew,
} from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { EntityToolbarProps, EntityToolbarActionType } from './types';

export function EntityToolbar({
  mode,
  isDirty = false,
  isSaving = false,
  isLoading = false,
  isDisabledRecord = false,
  currentRecordIndex = 0,
  totalRecords = 0,
  hasRecord = false,
  customActions = [],
  onAction,
  className = '',
}: EntityToolbarProps) {
  const { t } = useTranslation();

  // Global Keyboard Shortcuts (Ctrl+S, Ctrl+N, Ctrl+E, Ctrl+F, Ctrl+P, Esc, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      const target = e.target as HTMLElement;
      const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

      if (modKey && (e.key === 's' || e.key === 'S')) {
        e.preventDefault();
        if (mode !== 'view' && !isSaving && !isLoading) {
          onAction('save');
        }
      } else if (modKey && (e.key === 'n' || e.key === 'N')) {
        if (!isInput) {
          e.preventDefault();
          onAction('new');
        }
      } else if (modKey && (e.key === 'e' || e.key === 'E')) {
        if (!isInput) {
          e.preventDefault();
          if (mode === 'view' && hasRecord) onAction('edit');
        }
      } else if (modKey && (e.key === 'f' || e.key === 'F')) {
        if (!isInput) {
          e.preventDefault();
          onAction('search');
        }
      } else if (modKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        onAction('print');
      } else if (e.key === 'Escape') {
        onAction('exit');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, isSaving, isLoading, hasRecord, onAction]);

  const canSave = mode !== 'view' && !isSaving && !isLoading;
  const canEdit = mode === 'view' && hasRecord && !isLoading;
  const canDelete = hasRecord && !isSaving && !isLoading;
  const hasMultipleRecords = totalRecords > 1;
  const isFirstRecord = currentRecordIndex <= 0;
  const isLastRecord = currentRecordIndex >= totalRecords - 1;

  const renderIconButton = (
    actionType: EntityToolbarActionType,
    label: string,
    tooltip: string,
    Icon: React.ComponentType<any>,
    disabled: boolean = false,
    kind: 'primary' | 'secondary' | 'tertiary' | 'ghost' = 'ghost'
  ) => {
    const isDelete = actionType === 'delete';
    return (
      <Button
        key={actionType}
        hasIconOnly
        renderIcon={Icon}
        iconDescription={tooltip || label}
        tooltipPosition="bottom"
        tooltipAlignment="center"
        kind={kind}
        size="md"
        disabled={disabled || isSaving || isLoading}
        onClick={() => onAction(actionType)}
        className={`entity-toolbar-btn entity-toolbar-action-${actionType} ${isDelete && !disabled ? 'cds--btn--danger' : ''}`}
        style={{
          minWidth: '2.5rem',
          width: '2.5rem',
          height: '2.5rem',
          color: isDelete && !disabled ? 'var(--cds-support-error)' : undefined,
        }}
      />
    );
  };

  return (
    <div
      className={`entity-toolbar cds-flex cds-items-center cds-justify-between ${className}`}
      style={{
        backgroundColor: 'var(--cds-layer-01)',
        borderBottom: '1px solid var(--cds-border-subtle)',
        padding: '0.25rem 0.5rem',
        boxSizing: 'border-box',
        width: '100%',
        minHeight: '3rem',
        overflowX: 'auto',
      }}
      role="toolbar"
      aria-label="Entity Action Bar"
    >
      {/* Left Action Groups: CRUD & Navigation */}
      <div className="cds-flex cds-items-center cds-gap-02" style={{ flexWrap: 'nowrap' }}>
        {/* CRUD Group */}
        <div className="cds-flex cds-items-center cds-gap-01">
          {renderIconButton(
            'new',
            t('ui.actions.create', 'New / Create (Ctrl+N)'),
            `${t('ui.actions.create', 'New / Add')} (Ctrl+N)`,
            Add,
            false,
            'ghost'
          )}

          {renderIconButton(
            'edit',
            t('ui.actions.edit', 'Edit / Update (Ctrl+E)'),
            `${t('ui.actions.edit', 'Edit')} (Ctrl+E)`,
            Edit,
            !canEdit,
            'ghost'
          )}

          {renderIconButton(
            'save',
            t('ui.actions.save', 'Save (Ctrl+S)'),
            `${t('ui.actions.save', 'Save')} (Ctrl+S)`,
            Save,
            !canSave,
            mode !== 'view' ? 'primary' : 'ghost'
          )}

          {renderIconButton(
            'search',
            t('ui.actions.search', 'Search / LOV (Ctrl+F)'),
            `${t('ui.actions.search', 'Search / LOV')} (Ctrl+F)`,
            Search,
            false,
            'ghost'
          )}

          {renderIconButton(
            'delete',
            t('ui.actions.delete', 'Delete Record'),
            t('ui.actions.delete', 'Delete Record'),
            TrashCan,
            !canDelete,
            'ghost'
          )}

          {renderIconButton(
            'disable',
            isDisabledRecord ? 'Enable / Unlock Record' : 'Disable / Lock Record',
            isDisabledRecord ? 'Enable Record' : 'Disable Record',
            isDisabledRecord ? Unlocked : Locked,
            !hasRecord,
            'ghost'
          )}

          {renderIconButton(
            'print',
            t('ui.actions.print', 'Print Record (Ctrl+P)'),
            `${t('ui.actions.print', 'Print')} (Ctrl+P)`,
            Printer,
            !hasRecord,
            'ghost'
          )}
        </div>

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '1.5rem',
            backgroundColor: 'var(--cds-border-subtle)',
            margin: '0 0.25rem',
          }}
          aria-hidden="true"
        />

        {/* Navigation Group */}
        <div className="cds-flex cds-items-center cds-gap-01">
          {renderIconButton(
            'first',
            'First Record (Home)',
            'First Record',
            PageFirst,
            !hasMultipleRecords || isFirstRecord,
            'ghost'
          )}

          {renderIconButton(
            'previous',
            'Previous Record (Alt+Left)',
            'Previous Record',
            ChevronLeft,
            !hasMultipleRecords || isFirstRecord,
            'ghost'
          )}

          {/* Record Position Pill */}
          <span
            className="cds-text-truncate"
            style={{
              padding: '0.25rem 0.5rem',
              fontSize: '0.75rem',
              fontFamily: 'monospace',
              color: 'var(--cds-text-secondary)',
              backgroundColor: 'var(--cds-layer-02)',
              borderRadius: '2px',
              userSelect: 'none',
              minWidth: '4.5rem',
              textAlign: 'center',
            }}
          >
            {totalRecords > 0 ? `${currentRecordIndex + 1} / ${totalRecords}` : mode === 'create' ? 'NEW' : '0 / 0'}
          </span>

          {renderIconButton(
            'next',
            'Next Record (Alt+Right)',
            'Next Record',
            ChevronRight,
            !hasMultipleRecords || isLastRecord,
            'ghost'
          )}

          {renderIconButton(
            'last',
            'Last Record (End)',
            'Last Record',
            PageLast,
            !hasMultipleRecords || isLastRecord,
            'ghost'
          )}
        </div>

        {/* Custom Actions */}
        {customActions.length > 0 && (
          <>
            <div
              style={{
                width: '1px',
                height: '1.5rem',
                backgroundColor: 'var(--cds-border-subtle)',
                margin: '0 0.25rem',
              }}
              aria-hidden="true"
            />
            <div className="cds-flex cds-items-center cds-gap-01">
              {customActions.map((action) => {
                if (action.hidden) return null;
                const Icon = action.icon;
                const safeKind: 'primary' | 'secondary' | 'tertiary' | 'ghost' =
                  action.kind === 'primary' || action.kind === 'secondary' || action.kind === 'tertiary'
                    ? action.kind
                    : 'ghost';
                const isDanger = action.kind === 'danger';
                return (
                  <Button
                    key={action.id}
                    hasIconOnly
                    renderIcon={Icon}
                    iconDescription={action.tooltip || action.label}
                    tooltipPosition="bottom"
                    tooltipAlignment="center"
                    kind={safeKind}
                    size="md"
                    disabled={action.disabled || isSaving || isLoading}
                    onClick={action.onClick}
                    className={`entity-toolbar-btn ${isDanger && !action.disabled ? 'cds--btn--danger' : ''}`}
                    style={{
                      minWidth: '2.5rem',
                      width: '2.5rem',
                      height: '2.5rem',
                      color: isDanger && !action.disabled ? 'var(--cds-support-error)' : undefined,
                    }}
                  />
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Right Action Group: View Context & Exit */}
      <div className="cds-flex cds-items-center cds-gap-01" style={{ flexWrap: 'nowrap' }}>
        {renderIconButton(
          'list',
          t('ui.actions.list', 'List View / Grid (Ctrl+L)'),
          `${t('ui.actions.list', 'List View')} (Ctrl+L)`,
          Table,
          false,
          'ghost'
        )}

        {renderIconButton(
          'exit',
          t('ui.actions.close', 'Exit / Close (Esc)'),
          `${t('ui.actions.close', 'Exit')} (Esc)`,
          Close,
          false,
          'ghost'
        )}
      </div>
    </div>
  );
}
