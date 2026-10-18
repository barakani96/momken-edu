/**
 * EditableCell Component
 * Carbon Design System inline editable table cell with keyboard navigation,
 * direct and batch transaction modes, dirty state tracking, and integration with useModuleStore.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  TextInput,
  NumberInput,
  Select,
  SelectItem,
  Checkbox,
  Tooltip,
} from '@carbon/react';
import { Edit, Checkmark, Undo, Warning } from '@carbon/icons-react';
import { createModuleStore } from '../../../stores/useModuleStore';

export type EditableCellType = 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'currency';

export interface SelectOption {
  label: string;
  value: string | number;
}

export interface EditableCellProps<T = any> {
  value: any;
  row: T;
  columnKey: string;
  moduleId?: string;
  entityName?: string;
  type?: EditableCellType;
  options?: SelectOption[];
  editable?: boolean;
  disabled?: boolean;
  isBatchMode?: boolean;
  isDirty?: boolean;
  originalValue?: any;
  stagedValue?: any;
  validate?: (val: any, row: T) => string | null;
  onCommit?: (columnKey: string, newValue: any, row: T) => Promise<void> | void;
  onStage?: (columnKey: string, newValue: any, originalValue: any, row: T) => void;
  onRevert?: (columnKey: string, row: T) => void;
  onNavigate?: (direction: 'up' | 'down' | 'left' | 'right' | 'next' | 'prev', e?: React.KeyboardEvent) => void;
  cellCoordinates?: { rowIndex: number; colIndex: number };
  renderDisplay?: (value: any, row: T) => React.ReactNode;
  placeholder?: string;
  className?: string;
  currencySymbol?: string;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  value,
  row,
  columnKey,
  moduleId,
  entityName,
  type = 'text',
  options = [],
  editable = true,
  disabled = false,
  isBatchMode = false,
  isDirty = false,
  originalValue,
  stagedValue,
  validate,
  onCommit,
  onStage,
  onRevert,
  onNavigate,
  cellCoordinates,
  renderDisplay,
  placeholder = 'Click to edit...',
  className = '',
  currencySymbol = '$',
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentVal, setCurrentVal] = useState<any>(stagedValue !== undefined ? stagedValue : value);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  // Sync internal state when external value changes
  useEffect(() => {
    if (stagedValue !== undefined) {
      setCurrentVal(stagedValue);
    } else {
      setCurrentVal(value);
    }
  }, [value, stagedValue]);

  // Focus the input when entering editing mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if ('select' in inputRef.current && typeof (inputRef.current as HTMLInputElement).select === 'function') {
        (inputRef.current as HTMLInputElement).select();
      }
    }
  }, [isEditing]);

  const handleStartEditing = () => {
    if (!editable || disabled) return;
    setIsEditing(true);
    setValidationError(null);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
    setCurrentVal(stagedValue !== undefined ? stagedValue : value);
    setValidationError(null);
  };

  const handleSave = async (newValueToSave: any) => {
    if (validate) {
      const error = validate(newValueToSave, row);
      if (error) {
        setValidationError(error);
        return;
      }
    }

    setValidationError(null);

    // If batch mode is active, stage the value
    if (isBatchMode) {
      setIsEditing(false);
      if (onStage) {
        onStage(columnKey, newValueToSave, originalValue !== undefined ? originalValue : value, row);
      }
      return;
    }

    // Direct mode - commit immediately
    setIsSaving(true);
    try {
      if (onCommit) {
        await onCommit(columnKey, newValueToSave, row);
      } else if (moduleId && entityName && (row as any)?.id) {
        const store = createModuleStore(moduleId);
        await store.getState().updateRecord(entityName, (row as any).id, {
          [columnKey]: newValueToSave,
        });
      }
      setIsEditing(false);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isEditing) {
      if (e.key === 'Enter' || e.key === 'F2') {
        e.preventDefault();
        handleStartEditing();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        onNavigate?.('up', e);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        onNavigate?.('down', e);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        onNavigate?.('left', e);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        onNavigate?.('right', e);
      }
      return;
    }

    // Inside Edit Mode
    if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEditing();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSave(currentVal);
      onNavigate?.('down', e);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleSave(currentVal);
      onNavigate?.(e.shiftKey ? 'prev' : 'next', e);
    }
  };

  // Render display value in view mode
  const renderFormattedDisplay = () => {
    const displayVal = stagedValue !== undefined ? stagedValue : value;

    if (renderDisplay) {
      return renderDisplay(displayVal, row);
    }

    if (displayVal === null || displayVal === undefined || displayVal === '') {
      return <span style={{ color: 'var(--cds-text-placeholder)', fontStyle: 'italic' }}>—</span>;
    }

    if (type === 'checkbox') {
      return (
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            color: displayVal ? 'var(--cds-support-success)' : 'var(--cds-text-secondary)',
          }}
        >
          {displayVal ? <Checkmark size={16} /> : 'No'}
        </span>
      );
    }

    if (type === 'currency') {
      const num = Number(displayVal);
      return isNaN(num) ? String(displayVal) : `${currencySymbol}${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }

    if (type === 'select') {
      const opt = options.find((o) => String(o.value) === String(displayVal));
      return opt ? opt.label : String(displayVal);
    }

    return String(displayVal);
  };

  return (
    <div
      ref={containerRef}
      tabIndex={editable && !disabled ? 0 : -1}
      className={`cds-editable-cell ${className}`}
      onDoubleClick={handleStartEditing}
      onKeyDown={handleKeyDown}
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        minHeight: '2rem',
        padding: '0.125rem 0.25rem',
        borderRadius: '2px',
        outline: 'none',
        backgroundColor: isEditing
          ? 'var(--cds-layer-01)'
          : isDirty
          ? 'var(--cds-layer-selected-01)'
          : 'transparent',
        cursor: editable && !disabled ? (isEditing ? 'text' : 'pointer') : 'default',
        transition: 'background-color 120ms ease',
      }}
      role="gridcell"
      aria-readonly={!editable || disabled}
      aria-invalid={!!validationError}
    >
      {/* Dirty indicator top-left badge with tooltip */}
      {isDirty && !isEditing && (
        <div
          title={`Modified: Original was "${originalValue ?? 'empty'}"`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            borderStyle: 'solid',
            borderWidth: '7px 7px 0 0',
            borderColor: 'var(--cds-interactive) transparent transparent transparent',
          }}
        />
      )}

      {isEditing ? (
        <div
          style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
          onClick={(e) => e.stopPropagation()}
        >
          {type === 'select' ? (
            <select
              ref={inputRef as React.RefObject<HTMLSelectElement>}
              value={currentVal}
              onChange={(e) => {
                const newVal = e.target.value;
                setCurrentVal(newVal);
                handleSave(newVal);
              }}
              onBlur={() => handleSave(currentVal)}
              style={{
                width: '100%',
                height: '1.75rem',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                padding: '0 0.5rem',
                border: validationError ? '1px solid var(--cds-support-error)' : '1px solid var(--cds-focus)',
                backgroundColor: 'var(--cds-field-01, #fff)',
                color: 'var(--cds-text-primary)',
                borderRadius: '0',
                outline: 'none',
              }}
            >
              {options.map((opt) => (
                <option key={String(opt.value)} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : type === 'checkbox' ? (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type="checkbox"
              checked={!!currentVal}
              onChange={(e) => {
                const newVal = e.target.checked;
                setCurrentVal(newVal);
                handleSave(newVal);
              }}
              onBlur={() => handleSave(currentVal)}
              style={{
                accentColor: 'var(--cds-interactive)',
                width: '1rem',
                height: '1rem',
                cursor: 'pointer',
              }}
            />
          ) : (
            <input
              ref={inputRef as React.RefObject<HTMLInputElement>}
              type={type === 'number' || type === 'currency' ? 'number' : type === 'date' ? 'date' : 'text'}
              value={currentVal ?? ''}
              onChange={(e) => setCurrentVal(e.target.value)}
              onBlur={() => handleSave(currentVal)}
              placeholder={placeholder}
              style={{
                width: '100%',
                height: '1.75rem',
                fontSize: '0.875rem',
                fontFamily: 'inherit',
                padding: '0 0.5rem',
                border: validationError ? '1px solid var(--cds-support-error)' : '1px solid var(--cds-focus)',
                backgroundColor: 'var(--cds-field-01, #fff)',
                color: 'var(--cds-text-primary)',
                borderRadius: '0',
                outline: 'none',
              }}
            />
          )}

          {validationError && (
            <div title={validationError} style={{ color: 'var(--cds-support-error)', display: 'flex' }}>
              <Warning size={16} />
            </div>
          )}
        </div>
      ) : (
        <>
          <div
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              flex: 1,
            }}
          >
            {renderFormattedDisplay()}
          </div>

          {/* Quick inline action icon on hover / dirty */}
          {editable && !disabled && (
            <div
              className="cds-cell-actions"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                opacity: isDirty ? 1 : 0.4,
              }}
            >
              {isDirty && onRevert && (
                <button
                  type="button"
                  title="Revert Cell Edit"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRevert(columnKey, row);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--cds-text-secondary)',
                    padding: '2px',
                    display: 'flex',
                  }}
                >
                  <Undo size={14} />
                </button>
              )}
              <span style={{ color: 'var(--cds-icon-secondary)' }}>
                <Edit size={12} />
              </span>
            </div>
          )}
        </>
      )}
    </div>
  );
};
