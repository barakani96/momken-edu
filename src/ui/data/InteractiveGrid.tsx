import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Button,
  Tag,
  TextInput,
  Select,
  SelectItem,
  Checkbox,
  Pagination,
  DataTableSkeleton,
  InlineNotification,
  Tooltip,
} from '@carbon/react';
import {
  Save,
  Undo,
  Edit,
  Checkmark,
  Warning,
  Reset,
  CheckmarkFilled,
  Close,
  Table as TableIcon,
} from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { useNotification } from '../../core/notifications/NotificationContext';
import { BulkTransactionBar, StagedEditItem } from '../../components/ui/data/BulkTransactionBar';

export interface InteractiveGridColumn<T = any> {
  key: string;
  header: string;
  width?: string;
  editable?: boolean;
  editType?: 'text' | 'number' | 'select' | 'checkbox' | 'date';
  options?: { label: string; value: any }[];
  validate?: (value: any, row: T) => string | null;
  render?: (row: T, isDirty?: boolean, originalValue?: any) => React.ReactNode;
}

export interface InteractiveGridProps<T extends Record<string, any>> {
  columns: InteractiveGridColumn<T>[];
  data: T[];
  idField?: string;
  title?: string;
  description?: string;
  loading?: boolean;
  readOnly?: boolean;
  onSaveBatch?: (modifiedRows: T[], originalRows: T[]) => Promise<void> | void;
  onRollback?: () => void;
  onRowClick?: (row: T) => void;
  pagination?: boolean;
  pageSize?: number;
  pageSizes?: number[];
  searchable?: boolean;
  searchPlaceholder?: string;
  toolbarActions?: React.ReactNode;
  className?: string;
}

interface CellCoordinate {
  rowIndex: number;
  colIndex: number;
  rowId: string;
  colKey: string;
}

interface DirtyCellState {
  original: any;
  current: any;
  error?: string | null;
}

export function InteractiveGrid<T extends Record<string, any>>({
  columns,
  data: initialData = [],
  idField = 'id',
  title,
  description,
  loading = false,
  readOnly = false,
  onSaveBatch,
  onRollback,
  onRowClick,
  pagination = true,
  pageSize: initialPageSize = 10,
  pageSizes = [10, 20, 30, 50],
  searchable = true,
  searchPlaceholder = 'Search grid...',
  toolbarActions,
  className = '',
}: InteractiveGridProps<T>) {
  const { t } = useTranslation();
  const { notify } = useNotification();

  // Grid working dataset
  const [gridData, setGridData] = useState<T[]>(initialData);
  const [dirtyCells, setDirtyCells] = useState<Map<string, DirtyCellState>>(new Map());
  const [modifiedRowIds, setModifiedRowIds] = useState<Set<string>>(new Set());

  // Focus & Editing State
  const [focusedCell, setFocusedCell] = useState<CellCoordinate | null>(null);
  const [editingCell, setEditingCell] = useState<CellCoordinate | null>(null);
  const [editValue, setEditValue] = useState<any>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const containerRef = useRef<HTMLDivElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  // Sync grid data when initialData changes from external refresh
  useEffect(() => {
    setGridData(initialData);
    setDirtyCells(new Map());
    setModifiedRowIds(new Set());
    setFocusedCell(null);
    setEditingCell(null);
  }, [initialData]);

  // Focus input automatically when entering edit mode
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      if (typeof editValue === 'string') {
        editInputRef.current.select();
      }
    }
  }, [editingCell]);

  // Filtered & Paginated records
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return gridData;
    const q = searchQuery.toLowerCase().trim();
    return gridData.filter((item) =>
      Object.values(item).some((v) =>
        v !== null && v !== undefined && String(v).toLowerCase().includes(q)
      )
    );
  }, [gridData, searchQuery]);

  const paginatedData = useMemo(() => {
    if (!pagination) return filteredData;
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize, pagination]);

  // Editable columns index map
  const editableColIndices = useMemo(() => {
    const indices: number[] = [];
    columns.forEach((col, idx) => {
      if (col.editable !== false && !readOnly) {
        indices.push(idx);
      }
    });
    return indices;
  }, [columns, readOnly]);

  const getCellKey = (rowId: string, colKey: string) => `${rowId}:::${colKey}`;

  // Start editing a specific cell
  const startEditing = useCallback(
    (rowId: string, colKey: string, rowIndex: number, colIndex: number) => {
      if (readOnly) return;
      const col = columns[colIndex];
      if (col.editable === false) return;

      const row = gridData.find((r) => String(r[idField] ?? r.id) === String(rowId));
      if (!row) return;

      const cellKey = getCellKey(rowId, colKey);
      const dirty = dirtyCells.get(cellKey);
      const currentValue = dirty !== undefined ? dirty.current : row[colKey];

      setFocusedCell({ rowIndex, colIndex, rowId, colKey });
      setEditingCell({ rowIndex, colIndex, rowId, colKey });
      setEditValue(currentValue ?? '');
      setValidationError(null);
    },
    [readOnly, columns, gridData, idField, dirtyCells]
  );

  // Commit current cell edit
  const commitEdit = useCallback(() => {
    if (!editingCell) return true;

    const { rowId, colKey, colIndex } = editingCell;
    const col = columns[colIndex];
    const originalRow = initialData.find((r) => String(r[idField] ?? r.id) === String(rowId));
    if (!originalRow) {
      setEditingCell(null);
      return true;
    }

    let parsedVal = editValue;
    if (col.editType === 'number') {
      parsedVal = editValue === '' ? null : Number(editValue);
    } else if (col.editType === 'checkbox') {
      parsedVal = Boolean(editValue);
    }

    // Validation check
    let error: string | null = null;
    if (col.validate) {
      error = col.validate(parsedVal, originalRow);
    }

    if (error) {
      setValidationError(error);
      return false;
    }

    const cellKey = getCellKey(rowId, colKey);
    const originalVal = originalRow[colKey];

    // Check if value actually changed compared to original
    const isValueChanged = String(parsedVal ?? '') !== String(originalVal ?? '');

    setDirtyCells((prev) => {
      const next = new Map(prev);
      if (isValueChanged) {
        next.set(cellKey, {
          original: originalVal,
          current: parsedVal,
          error: null,
        });
      } else {
        next.delete(cellKey);
      }
      return next;
    });

    setModifiedRowIds((prev) => {
      const next = new Set(prev);
      if (isValueChanged) {
        next.add(rowId);
      } else {
        // Check if any other cell in this row is dirty
        const hasOtherDirty = Array.from(dirtyCells.keys()).some(
          (k) => k.startsWith(`${rowId}:::`) && k !== cellKey
        );
        if (!hasOtherDirty) {
          next.delete(rowId);
        }
      }
      return next;
    });

    // Update in working dataset
    setGridData((prev) =>
      prev.map((r) => {
        if (String(r[idField] ?? r.id) === String(rowId)) {
          return { ...r, [colKey]: parsedVal };
        }
        return r;
      })
    );

    setEditingCell(null);
    setValidationError(null);
    return true;
  }, [editingCell, columns, initialData, idField, editValue, dirtyCells]);

  // Cancel current cell edit
  const cancelEdit = useCallback(() => {
    setEditingCell(null);
    setValidationError(null);
  }, []);

  // Revert a single dirty cell
  const revertCell = useCallback(
    (rowId: string, colKey: string) => {
      const cellKey = getCellKey(rowId, colKey);
      const originalRow = initialData.find((r) => String(r[idField] ?? r.id) === String(rowId));
      if (!originalRow) return;

      const originalVal = originalRow[colKey];

      setDirtyCells((prev) => {
        const next = new Map(prev);
        next.delete(cellKey);
        return next;
      });

      // Update grid data
      setGridData((prev) =>
        prev.map((r) => {
          if (String(r[idField] ?? r.id) === String(rowId)) {
            return { ...r, [colKey]: originalVal };
          }
          return r;
        })
      );

      // Check remaining dirty cells for row
      setModifiedRowIds((prev) => {
        const next = new Set(prev);
        const hasOther = Array.from(dirtyCells.keys()).some(
          (k) => k.startsWith(`${rowId}:::`) && k !== cellKey
        );
        if (!hasOther) next.delete(rowId);
        return next;
      });
    },
    [initialData, idField, dirtyCells]
  );

  // Rollback all pending changes (Transaction Discard)
  const handleRollbackAll = useCallback(() => {
    setGridData(initialData);
    setDirtyCells(new Map());
    setModifiedRowIds(new Set());
    setEditingCell(null);
    setFocusedCell(null);

    notify({
      kind: 'info',
      title: 'Changes Reverted',
      subtitle: 'All uncommitted inline edits have been rolled back to original values.',
      timeout: 3000,
    });

    if (onRollback) {
      onRollback();
    }
  }, [initialData, onRollback, notify]);

  // Save all modified rows (Transaction Commit)
  const handleSaveAll = useCallback(async () => {
    // If currently editing, commit it first
    if (editingCell) {
      const success = commitEdit();
      if (!success) return;
    }

    if (dirtyCells.size === 0 || modifiedRowIds.size === 0) {
      notify({
        kind: 'info',
        title: 'No Changes',
        subtitle: 'There are no pending edits to save.',
        timeout: 2500,
      });
      return;
    }

    setIsSaving(true);
    const modifiedRows = gridData.filter((r) =>
      modifiedRowIds.has(String(r[idField] ?? r.id))
    );
    const originalRows = initialData.filter((r) =>
      modifiedRowIds.has(String(r[idField] ?? r.id))
    );

    try {
      if (onSaveBatch) {
        await onSaveBatch(modifiedRows, originalRows);
      }

      setDirtyCells(new Map());
      setModifiedRowIds(new Set());

      notify({
        kind: 'success',
        title: 'Transaction Saved',
        subtitle: `Successfully saved ${modifiedRows.length} record(s) with ${dirtyCells.size} cell modifications.`,
        timeout: 4000,
      });
    } catch (err: any) {
      notify({
        kind: 'error',
        title: 'Save Failed',
        subtitle: err?.message || 'Failed to save batch edits to the server.',
        timeout: 6000,
      });
    } finally {
      setIsSaving(false);
    }
  }, [editingCell, commitEdit, dirtyCells, modifiedRowIds, gridData, initialData, idField, onSaveBatch, notify]);

  // Keyboard navigation handler across rows and columns
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      // Global Save Shortcut (Ctrl+S / Cmd+S)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSaveAll();
        return;
      }

      // Global Rollback Shortcut (Ctrl+Z / Cmd+Z) when not in edit mode
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !editingCell) {
        e.preventDefault();
        handleRollbackAll();
        return;
      }

      if (!focusedCell) return;

      const { rowIndex, colIndex, rowId, colKey } = focusedCell;
      const totalRows = paginatedData.length;
      const totalCols = columns.length;

      // When actively editing inside a cell
      if (editingCell) {
        if (e.key === 'Enter') {
          e.preventDefault();
          const success = commitEdit();
          if (success && rowIndex < totalRows - 1) {
            // Move down to next row
            const nextRow = paginatedData[rowIndex + 1];
            const nextRowId = String(nextRow[idField] ?? nextRow.id);
            setFocusedCell({ rowIndex: rowIndex + 1, colIndex, rowId: nextRowId, colKey });
          }
          return;
        }

        if (e.key === 'Escape') {
          e.preventDefault();
          cancelEdit();
          return;
        }

        if (e.key === 'Tab') {
          e.preventDefault();
          const success = commitEdit();
          if (success) {
            if (e.shiftKey) {
              // Move backward
              let prevCol = colIndex - 1;
              let prevRow = rowIndex;
              if (prevCol < 0) {
                prevCol = totalCols - 1;
                prevRow = Math.max(0, rowIndex - 1);
              }
              const targetRow = paginatedData[prevRow];
              const targetRowId = String(targetRow[idField] ?? targetRow.id);
              const targetColKey = columns[prevCol].key;
              setFocusedCell({ rowIndex: prevRow, colIndex: prevCol, rowId: targetRowId, colKey: targetColKey });
              startEditing(targetRowId, targetColKey, prevRow, prevCol);
            } else {
              // Move forward
              let nextCol = colIndex + 1;
              let nextRow = rowIndex;
              if (nextCol >= totalCols) {
                nextCol = 0;
                nextRow = Math.min(totalRows - 1, rowIndex + 1);
              }
              const targetRow = paginatedData[nextRow];
              const targetRowId = String(targetRow[idField] ?? targetRow.id);
              const targetColKey = columns[nextCol].key;
              setFocusedCell({ rowIndex: nextRow, colIndex: nextCol, rowId: targetRowId, colKey: targetColKey });
              startEditing(targetRowId, targetColKey, nextRow, nextCol);
            }
          }
          return;
        }

        return;
      }

      // Not editing - Navigation Mode
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (rowIndex > 0) {
            const targetRow = paginatedData[rowIndex - 1];
            const targetRowId = String(targetRow[idField] ?? targetRow.id);
            setFocusedCell({ rowIndex: rowIndex - 1, colIndex, rowId: targetRowId, colKey });
          }
          break;

        case 'ArrowDown':
          e.preventDefault();
          if (rowIndex < totalRows - 1) {
            const targetRow = paginatedData[rowIndex + 1];
            const targetRowId = String(targetRow[idField] ?? targetRow.id);
            setFocusedCell({ rowIndex: rowIndex + 1, colIndex, rowId: targetRowId, colKey });
          }
          break;

        case 'ArrowLeft':
          e.preventDefault();
          if (colIndex > 0) {
            const targetCol = columns[colIndex - 1];
            setFocusedCell({ rowIndex, colIndex: colIndex - 1, rowId, colKey: targetCol.key });
          }
          break;

        case 'ArrowRight':
          e.preventDefault();
          if (colIndex < totalCols - 1) {
            const targetCol = columns[colIndex + 1];
            setFocusedCell({ rowIndex, colIndex: colIndex + 1, rowId, colKey: targetCol.key });
          }
          break;

        case 'Tab':
          e.preventDefault();
          if (e.shiftKey) {
            let prevCol = colIndex - 1;
            let prevRow = rowIndex;
            if (prevCol < 0) {
              prevCol = totalCols - 1;
              prevRow = Math.max(0, rowIndex - 1);
            }
            const targetRow = paginatedData[prevRow];
            const targetRowId = String(targetRow[idField] ?? targetRow.id);
            const targetColKey = columns[prevCol].key;
            setFocusedCell({ rowIndex: prevRow, colIndex: prevCol, rowId: targetRowId, colKey: targetColKey });
          } else {
            let nextCol = colIndex + 1;
            let nextRow = rowIndex;
            if (nextCol >= totalCols) {
              nextCol = 0;
              nextRow = Math.min(totalRows - 1, rowIndex + 1);
            }
            const targetRow = paginatedData[nextRow];
            const targetRowId = String(targetRow[idField] ?? targetRow.id);
            const targetColKey = columns[nextCol].key;
            setFocusedCell({ rowIndex: nextRow, colIndex: nextCol, rowId: targetRowId, colKey: targetColKey });
          }
          break;

        case 'Enter':
        case 'F2':
          e.preventDefault();
          startEditing(rowId, colKey, rowIndex, colIndex);
          break;

        case 'Delete':
        case 'Backspace':
          // Revert cell if dirty
          if (dirtyCells.has(getCellKey(rowId, colKey))) {
            revertCell(rowId, colKey);
          }
          break;

        default:
          // Typing directly enters edit mode
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            startEditing(rowId, colKey, rowIndex, colIndex);
            setEditValue(e.key);
          }
          break;
      }
    },
    [
      focusedCell,
      editingCell,
      commitEdit,
      cancelEdit,
      handleSaveAll,
      handleRollbackAll,
      paginatedData,
      columns,
      idField,
      startEditing,
      dirtyCells,
      revertCell,
    ]
  );

  if (loading && gridData.length === 0) {
    return (
      <DataTableSkeleton
        columnCount={columns.length}
        rowCount={pageSize || 5}
        showHeader={Boolean(title)}
        showToolbar={false}
      />
    );
  }

  const hasDirtyCells = dirtyCells.size > 0;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`interactive-grid-container cds-flex cds-flex-col ${className}`}
      style={{
        width: '100%',
        backgroundColor: 'var(--cds-layer-01)',
        border: '1px solid var(--cds-border-subtle)',
        borderRadius: '2px',
        outline: 'none',
        position: 'relative',
      }}
    >
      {/* 1. Transaction Status Strip (When edits exist) */}
      {hasDirtyCells && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.625rem 1rem',
            backgroundColor: 'var(--cds-layer-selected-01, #edf5ff)',
            borderBottom: '1px solid var(--cds-border-interactive, #0f62fe)',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Tag type="blue" size="md" style={{ margin: 0 }}>
              <span style={{ fontWeight: 600 }}>
                {dirtyCells.size} {dirtyCells.size === 1 ? 'modified cell' : 'modified cells'}
              </span>
            </Tag>
            <span style={{ fontSize: '0.8125rem', color: 'var(--cds-text-primary)' }}>
              across <strong>{modifiedRowIds.size}</strong> record(s) staged in current transaction.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button
              kind="ghost"
              size="sm"
              renderIcon={Undo}
              onClick={handleRollbackAll}
              disabled={isSaving}
              style={{ fontSize: '0.8125rem' }}
            >
              Rollback All (Discard)
            </Button>
            <Button
              kind="primary"
              size="sm"
              renderIcon={Save}
              onClick={handleSaveAll}
              disabled={isSaving}
              style={{ fontSize: '0.8125rem' }}
            >
              {isSaving ? 'Saving...' : 'Save All Changes (Ctrl+S)'}
            </Button>
          </div>
        </div>
      )}

      {/* 2. Validation Error Notification (if active) */}
      {validationError && (
        <div style={{ padding: '0.5rem 1rem' }}>
          <InlineNotification
            kind="error"
            title="Validation Error:"
            subtitle={validationError}
            lowContrast
            hideCloseButton
          />
        </div>
      )}

      {/* 3. Table Toolbar & Actions */}
      <TableContainer title={title} description={description}>
        {(searchable || toolbarActions || title) && (
          <TableToolbar aria-label="interactive grid toolbar">
            <TableToolbarContent>
              {searchable && (
                <TableToolbarSearch
                  persistent
                  placeholder={searchPlaceholder}
                  value={searchQuery}
                  onChange={(e: any) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  onClear={() => setSearchQuery('')}
                />
              )}

              {toolbarActions}

              {/* Quick Save / Rollback in toolbar */}
              {hasDirtyCells && !title && (
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <Button
                    hasIconOnly
                    renderIcon={Undo}
                    iconDescription="Rollback Edits"
                    kind="secondary"
                    size="sm"
                    onClick={handleRollbackAll}
                  />
                  <Button
                    hasIconOnly
                    renderIcon={Save}
                    iconDescription="Save Changes"
                    kind="primary"
                    size="sm"
                    onClick={handleSaveAll}
                  />
                </div>
              )}
            </TableToolbarContent>
          </TableToolbar>
        )}

        {/* 4. Grid Table */}
        <Table size="md" useZebraStyles>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableHeader key={col.key} style={{ width: col.width }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <span>{col.header}</span>
                    {col.editable !== false && !readOnly && (
                      <span style={{ opacity: 0.45 }} title="Editable column">
                        <Edit size={12} />
                      </span>
                    )}
                  </div>
                </TableHeader>
              ))}
              {hasDirtyCells && (
                <TableHeader style={{ width: '80px', textAlign: 'center' }}>
                  Status
                </TableHeader>
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {paginatedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length + (hasDirtyCells ? 1 : 0)}>
                  <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--cds-text-secondary)' }}>
                    {searchQuery ? 'No matching records found for current search.' : 'No records available in this grid.'}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedData.map((row, rowIndex) => {
                const rowId = String(row[idField] ?? row.id);
                const isRowModified = modifiedRowIds.has(rowId);

                return (
                  <TableRow
                    key={rowId}
                    style={{
                      backgroundColor: isRowModified ? 'var(--cds-layer-selected-01, #edf5ff)' : undefined,
                    }}
                    onClick={onRowClick ? () => onRowClick(row) : undefined}
                  >
                    {columns.map((col, colIndex) => {
                      const colKey = col.key;
                      const cellKey = getCellKey(rowId, colKey);
                      const isDirty = dirtyCells.has(cellKey);
                      const dirtyInfo = dirtyCells.get(cellKey);
                      const cellValue = isDirty ? dirtyInfo?.current : row[colKey];
                      const isFocused =
                        focusedCell?.rowId === rowId && focusedCell?.colKey === colKey;
                      const isEditing =
                        editingCell?.rowId === rowId && editingCell?.colKey === colKey;
                      const isEditable = col.editable !== false && !readOnly;

                      return (
                        <TableCell
                          key={colKey}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFocusedCell({ rowIndex, colIndex, rowId, colKey });
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            if (isEditable) {
                              startEditing(rowId, colKey, rowIndex, colIndex);
                            }
                          }}
                          style={{
                            position: 'relative',
                            cursor: isEditable ? 'cell' : 'default',
                            outline: isFocused ? '2px solid var(--cds-focus, #0f62fe)' : 'none',
                            outlineOffset: '-2px',
                            backgroundColor: isDirty
                              ? 'var(--cds-layer-selected-01, #edf5ff)'
                              : undefined,
                            padding: isEditing ? '0.25rem' : undefined,
                          }}
                        >
                          {/* Corner Dirty Indicator */}
                          {isDirty && !isEditing && (
                            <div
                              style={{
                                position: 'absolute',
                                top: 2,
                                right: 2,
                                width: 0,
                                height: 0,
                                borderTop: '6px solid var(--cds-interactive, #0f62fe)',
                                borderLeft: '6px solid transparent',
                              }}
                              title={`Original: ${String(dirtyInfo?.original ?? 'empty')}`}
                            />
                          )}

                          {/* Cell Content: Editor vs Viewer */}
                          {isEditing ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                              {col.editType === 'select' && col.options ? (
                                <Select
                                  id={`edit-select-${cellKey}`}
                                  labelText=""
                                  hideLabel
                                  size="sm"
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={commitEdit}
                                  autoFocus
                                >
                                  {col.options.map((opt) => (
                                    <SelectItem key={String(opt.value)} value={opt.value} text={opt.label} />
                                  ))}
                                </Select>
                              ) : col.editType === 'checkbox' ? (
                                <Checkbox
                                  id={`edit-chk-${cellKey}`}
                                  labelText=""
                                  checked={Boolean(editValue)}
                                  onChange={(_e, { checked }) => {
                                    setEditValue(checked);
                                  }}
                                  onBlur={commitEdit}
                                />
                              ) : (
                                <TextInput
                                  id={`edit-input-${cellKey}`}
                                  ref={editInputRef}
                                  labelText=""
                                  hideLabel
                                  size="sm"
                                  type={col.editType === 'number' ? 'number' : col.editType === 'date' ? 'date' : 'text'}
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  onBlur={commitEdit}
                                  style={{ width: '100%', minWidth: '80px' }}
                                />
                              )}
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                              <span style={{ fontWeight: isDirty ? 600 : 400 }}>
                                {col.render
                                  ? col.render(row, isDirty, dirtyInfo?.original)
                                  : cellValue !== null && cellValue !== undefined
                                  ? typeof cellValue === 'boolean'
                                    ? cellValue
                                      ? 'Yes'
                                      : 'No'
                                    : String(cellValue)
                                  : '—'}
                              </span>

                              {/* Quick Revert Icon Button on hover when dirty */}
                              {isDirty && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    revertCell(rowId, colKey);
                                  }}
                                  title="Revert this cell edit"
                                  style={{
                                    border: 'none',
                                    background: 'transparent',
                                    cursor: 'pointer',
                                    color: 'var(--cds-text-secondary)',
                                    padding: '2px',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                  }}
                                >
                                  <Close size={12} />
                                </button>
                              )}
                            </div>
                          )}
                        </TableCell>
                      );
                    })}

                    {/* Row Modified Status Indicator */}
                    {hasDirtyCells && (
                      <TableCell style={{ textAlign: 'center', padding: '0.25rem' }}>
                        {isRowModified ? (
                          <Tag type="blue" size="sm">
                            Staged
                          </Tag>
                        ) : (
                          <span style={{ color: 'var(--cds-text-muted)', fontSize: '0.75rem' }}>—</span>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* 5. Pagination */}
      {pagination && filteredData.length > 0 && (
        <div style={{ borderTop: '1px solid var(--cds-border-subtle)' }}>
          <Pagination
            totalItems={filteredData.length}
            pageSize={pageSize}
            pageSizes={pageSizes}
            page={page}
            onChange={({ page: newPage, pageSize: newPageSize }) => {
              setPage(newPage);
              setPageSize(newPageSize);
              setFocusedCell(null);
              setEditingCell(null);
            }}
          />
        </div>
      )}

      {/* 6. Floating Sticky Bulk Transaction Bar */}
      <BulkTransactionBar
        dirtyCellCount={dirtyCells.size}
        modifiedRowCount={modifiedRowIds.size}
        stagedEdits={Array.from(dirtyCells.entries()).map(([cellKey, dirty]) => {
          const [rowId, colKey] = cellKey.split(':::');
          const col = columns.find((c) => c.key === colKey);
          const row = gridData.find((r) => String(r[idField] ?? r.id) === String(rowId));
          return {
            rowId,
            rowLabel: (row as any)?.name || (row as any)?.title || (row as any)?.invoiceNumber || (row as any)?.facultyId || (row as any)?.isbn || `Row ${rowId}`,
            field: colKey,
            fieldLabel: col?.header || colKey,
            originalValue: dirty.original,
            newValue: dirty.current,
          };
        })}
        isSaving={isSaving}
        onSaveAll={handleSaveAll}
        onDiscardAll={handleRollbackAll}
        entityName="records"
      />
    </div>
  );
}
