/**
 * DataTable Component Wrapper
 * Comprehensive wrapper over IBM Carbon's DataTable component adhering to Carbon v11
 * specifications and common-actions patterns (https://preview.carbondesignsystem.com/building-blocks/core/patterns/common-actions).
 *
 * Implements:
 * - Full batch selection with count badges, Select All, and batch action toolbar
 * - Custom column renderers (cell-level formatting, badge rendering, action buttons)
 * - Built-in Multi-format Export (Excel .xlsx, CSV .csv via DataExportService)
 * - Sorting, Searching, Pagination, Loading Skeletons, and Empty States
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  DataTable as CarbonDataTable,
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
  TableToolbarAction,
  TableToolbarMenu,
  TableBatchActions,
  TableBatchAction,
  TableSelectAll,
  TableSelectRow,
  Pagination,
  DataTableSkeleton,
  Button,
  Modal,
} from '@carbon/react';
import {
  TrashCan,
  DocumentExport,
  Document,
  Edit,
  Add,
  Renew,
  Settings,
  Filter,
} from '@carbon/icons-react';
import { dataExportService } from '../../../core/utils/DataExportService';
import { EmptyState, EmptyStateType } from '../../../ui/feedback/EmptyState';
import { ErrorState } from '../../../ui/feedback/ErrorState';

export interface DataTableColumn<T = any> {
  key: string;
  header: string;
  width?: string | number;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (row: T, value: any, rowIndex: number) => React.ReactNode;
  renderCell?: (value: any, row: T, rowIndex: number) => React.ReactNode;
}

export interface DataTableBatchActionItem<T = any> {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  onClick: (selectedRows: T[], clearSelection: () => void) => void | Promise<void>;
  kind?: 'primary' | 'danger' | 'secondary' | 'ghost' | 'tertiary';
  hasConfirmation?: boolean;
  confirmationTitle?: string;
  confirmationMessage?: string;
}

export interface DataTableProps<T extends Record<string, any> = Record<string, any>> {
  id?: string;
  title?: string;
  description?: string;
  columns: DataTableColumn<T>[];
  data: T[];
  idField?: keyof T;
  
  // States
  loading?: boolean;
  error?: boolean | string | null;
  emptyType?: EmptyStateType;
  emptyTitle?: string;
  emptyDescription?: string;

  // Sizing & Appearance
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  useZebraStyles?: boolean;
  isSortable?: boolean;
  stickyHeader?: boolean;
  
  // Selection & Batch Actions
  selectable?: boolean;
  selectedRowIds?: string[];
  onSelectionChange?: (selectedRows: T[], selectedIds: string[]) => void;
  batchActions?: DataTableBatchActionItem<T>[];
  onBatchDelete?: (selectedRows: T[], clearSelection: () => void) => Promise<void> | void;
  onBatchExport?: (selectedRows: T[], format: 'xlsx' | 'csv') => void;

  // Search & Filtering
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;

  // Toolbar Customization
  toolbarActions?: React.ReactNode;
  filterPresetBar?: React.ReactNode;
  primaryAction?: {
    label: string;
    icon?: React.ComponentType<any>;
    onClick: () => void;
  };

  // Pagination
  pagination?: boolean;
  page?: number;
  pageSize?: number;
  pageSizes?: number[];
  totalItems?: number;
  onPageChange?: (data: { page: number; pageSize: number }) => void;

  // Row Interactions
  onRowClick?: (row: T) => void;
  className?: string;
}

export function DataTable<T extends Record<string, any> = Record<string, any>>({
  id = 'carbon-data-table',
  title,
  description,
  columns,
  data = [],
  idField = 'id' as keyof T,
  loading = false,
  error = null,
  emptyType = 'no-data',
  emptyTitle,
  emptyDescription,
  size = 'md',
  useZebraStyles = false,
  isSortable = true,
  stickyHeader = false,
  selectable = true,
  selectedRowIds,
  onSelectionChange,
  batchActions = [],
  onBatchDelete,
  onBatchExport,
  searchable = true,
  searchPlaceholder = 'Search records...',
  searchValue: controlledSearchValue,
  onSearchChange,
  toolbarActions,
  filterPresetBar,
  primaryAction,
  pagination = false,
  page = 1,
  pageSize = 10,
  pageSizes = [10, 20, 30, 50, 100],
  totalItems,
  onPageChange,
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  const [internalSearch, setInternalSearch] = useState('');
  const [confirmModalAction, setConfirmModalAction] = useState<{
    action: DataTableBatchActionItem<T>;
    selectedRows: T[];
    clearSelection: () => void;
  } | null>(null);

  const activeSearch = controlledSearchValue !== undefined ? controlledSearchValue : internalSearch;

  // Map data to record ID dictionary for quick lookups
  const dataMap = useMemo(() => {
    const map = new Map<string, T>();
    data.forEach((item) => {
      const rowId = String(item[idField] ?? item.id ?? Math.random());
      map.set(rowId, item);
    });
    return map;
  }, [data, idField]);

  // Headers for Carbon DataTable
  const carbonHeaders = useMemo(() => {
    return columns.map((col) => ({
      key: col.key,
      header: col.header,
      sortable: col.sortable !== false,
      align: col.align || 'left',
    }));
  }, [columns]);

  // Carbon Rows mapping
  const carbonRows = useMemo(() => {
    return data.map((item, rowIndex) => {
      const rowId = String(item[idField] ?? item.id ?? rowIndex);
      const rowObj: { id: string; [key: string]: any } = { id: rowId };

      columns.forEach((col) => {
        const rawValue = item[col.key];
        // If a custom renderer exists, we invoke it with (row, rawValue, rowIndex)
        if (col.renderCell) {
          rowObj[col.key] = col.renderCell(rawValue, item, rowIndex);
        } else if (col.render) {
          rowObj[col.key] = col.render(item, rawValue, rowIndex);
        } else {
          rowObj[col.key] = rawValue;
        }
      });

      return rowObj;
    });
  }, [data, columns, idField]);

  // Standard Batch Actions: Delete & Export
  const allBatchActions = useMemo(() => {
    const actions: DataTableBatchActionItem<T>[] = [...batchActions];

    // Built-in batch export if not provided
    if (!actions.some((a) => a.id === 'export-excel')) {
      actions.push({
        id: 'export-excel',
        label: 'Export Excel (.xlsx)',
        icon: DocumentExport,
        onClick: (selected) => {
          if (onBatchExport) {
            onBatchExport(selected, 'xlsx');
          } else {
            dataExportService.exportToExcel({
              title: title || 'Selected Data Export',
              data: selected,
              columns: columns.map((c) => ({ key: c.key, header: c.header })),
            });
          }
        },
      });
    }

    if (!actions.some((a) => a.id === 'export-csv')) {
      actions.push({
        id: 'export-csv',
        label: 'Export CSV (.csv)',
        icon: Document,
        onClick: (selected) => {
          if (onBatchExport) {
            onBatchExport(selected, 'csv');
          } else {
            dataExportService.exportToCsv({
              title: title || 'Selected Data Export',
              data: selected,
              columns: columns.map((c) => ({ key: c.key, header: c.header })),
            });
          }
        },
      });
    }

    // Built-in batch delete if onBatchDelete is provided
    if (onBatchDelete && !actions.some((a) => a.id === 'batch-delete')) {
      actions.unshift({
        id: 'batch-delete',
        label: 'Delete Selected',
        icon: TrashCan,
        kind: 'danger',
        hasConfirmation: true,
        confirmationTitle: 'Confirm Bulk Deletion',
        confirmationMessage: 'Are you sure you want to delete the selected items? This action cannot be undone.',
        onClick: (selected, clear) => onBatchDelete(selected, clear),
      });
    }

    return actions;
  }, [batchActions, onBatchDelete, onBatchExport, title, columns]);

  // Handle Search Input Change
  const handleSearchChange = useCallback(
    (evt: React.ChangeEvent<HTMLInputElement>) => {
      const val = evt.target.value;
      setInternalSearch(val);
      if (onSearchChange) {
        onSearchChange(val);
      }
    },
    [onSearchChange]
  );

  // Render Skeleton on Loading
  if (loading && data.length === 0) {
    return (
      <div id={id} className={`cds-data-table-wrapper ${className}`}>
        <DataTableSkeleton
          columnCount={columns.length + (selectable ? 1 : 0)}
          rowCount={pageSize || 8}
          showHeader={!!title}
          showToolbar={searchable || !!toolbarActions}
        />
      </div>
    );
  }

  // Render Error State
  if (error) {
    return (
      <div
        id={id}
        className={`cds-data-table-wrapper ${className}`}
        style={{ padding: '1.5rem', backgroundColor: 'var(--cds-layer-01)' }}
      >
        <ErrorState
          description={typeof error === 'string' ? error : undefined}
        />
      </div>
    );
  }

  // Render Empty State
  if (!loading && data.length === 0 && !activeSearch) {
    return (
      <div
        id={id}
        className={`cds-data-table-wrapper ${className}`}
        style={{
          backgroundColor: 'var(--cds-layer-01)',
          border: '1px solid var(--cds-border-subtle)',
        }}
      >
        {title && (
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--cds-border-subtle)' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</h4>
            {description && (
              <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>{description}</p>
            )}
          </div>
        )}
        <EmptyState
          type={emptyType}
          title={emptyTitle}
          description={emptyDescription}
          actionText={primaryAction?.label}
          onAction={primaryAction?.onClick}
        />
      </div>
    );
  }

  return (
    <div id={id} className={`cds-data-table-container ${className}`} style={{ width: '100%' }}>
      {/* Optional Preset Filter Bar */}
      {filterPresetBar && <div style={{ marginBottom: '0.5rem' }}>{filterPresetBar}</div>}

      <CarbonDataTable
        rows={carbonRows as any}
        headers={carbonHeaders}
        isSortable={isSortable}
        useZebraStyles={useZebraStyles}
        stickyHeader={stickyHeader}
        size={size}
      >
        {({
          rows,
          headers,
          getHeaderProps,
          getTableProps,
          getRowProps,
          getSelectionProps,
          getToolbarProps,
          getBatchActionProps,
          selectedRows,
          onInputChange,
          selectRow,
        }) => {
          const batchActionProps = getBatchActionProps();
          const selectedItems = selectedRows
            .map((r) => dataMap.get(r.id))
            .filter(Boolean) as T[];

          const clearSelection = () => {
            selectedRows.forEach((r) => selectRow(r.id));
          };

          return (
            <TableContainer title={title} description={description}>
              {/* Table Toolbar & Common Batch Actions */}
              {(searchable || toolbarActions || primaryAction || selectable) && (
                <TableToolbar {...getToolbarProps()} aria-label="Table Toolbar">
                  {selectable && (
                    <TableBatchActions {...batchActionProps}>
                      {allBatchActions.map((action) => (
                        <TableBatchAction
                          key={action.id}
                          tabIndex={batchActionProps.shouldShowBatchActions ? 0 : -1}
                          renderIcon={action.icon}
                          iconDescription={action.label}
                          onClick={() => {
                            if (action.hasConfirmation) {
                              setConfirmModalAction({
                                action,
                                selectedRows: selectedItems,
                                clearSelection,
                              });
                            } else {
                              action.onClick(selectedItems, clearSelection);
                            }
                          }}
                        >
                          {action.label}
                        </TableBatchAction>
                      ))}
                    </TableBatchActions>
                  )}

                  <TableToolbarContent>
                    {searchable && (
                      <TableToolbarSearch
                        persistent
                        placeholder={searchPlaceholder}
                        tabIndex={batchActionProps.shouldShowBatchActions ? -1 : 0}
                        onChange={(e: any) => {
                          handleSearchChange(e);
                          onInputChange(e);
                        }}
                      />
                    )}

                    {toolbarActions}

                    {primaryAction && (
                      <Button
                        size="sm"
                        kind="primary"
                        renderIcon={primaryAction.icon || Add}
                        onClick={primaryAction.onClick}
                      >
                        {primaryAction.label}
                      </Button>
                    )}
                  </TableToolbarContent>
                </TableToolbar>
              )}

              {/* Core Table */}
              <Table {...getTableProps()} size={size}>
                <TableHead>
                  <TableRow>
                    {selectable && <TableSelectAll {...getSelectionProps()} />}
                    {headers.map((header) => {
                      const { key, ...headerProps } = getHeaderProps({ header });
                      return (
                        <TableHeader key={key} {...headerProps}>
                          {header.header}
                        </TableHeader>
                      );
                    })}
                  </TableRow>
                </TableHead>

                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={headers.length + (selectable ? 1 : 0)}>
                        <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                          <EmptyState type="no-results" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    rows.map((row) => {
                      const { key, ...rowProps } = getRowProps({ row });
                      const originalItem = dataMap.get(row.id);

                      return (
                        <TableRow
                          key={key}
                          {...rowProps}
                          onClick={
                            onRowClick && originalItem
                              ? (e) => {
                                  // Don't trigger row click when clicking on checkboxes or interactive elements
                                  const target = e.target as HTMLElement;
                                  if (
                                    target.closest('.cds--checkbox') ||
                                    target.closest('button') ||
                                    target.closest('input') ||
                                    target.closest('select') ||
                                    target.closest('.cds-editable-cell')
                                  ) {
                                    return;
                                  }
                                  onRowClick(originalItem);
                                }
                              : undefined
                          }
                          style={onRowClick ? { cursor: 'pointer' } : {}}
                        >
                          {selectable && <TableSelectRow {...getSelectionProps({ row })} />}
                          {row.cells.map((cell) => {
                            return (
                              <TableCell
                                key={cell.id}
                                style={{
                                  verticalAlign: 'middle',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  maxWidth: '22rem',
                                }}
                              >
                                {cell.value}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          );
        }}
      </CarbonDataTable>

      {/* Pagination Footer */}
      {pagination && (
        <Pagination
          backwardText="Previous page"
          forwardText="Next page"
          itemsPerPageText="Items per page:"
          page={page}
          pageNumberText="Page Number"
          pageSize={pageSize}
          pageSizes={pageSizes}
          totalItems={totalItems || data.length}
          onChange={(pData) => {
            if (onPageChange) {
              onPageChange(pData);
            }
          }}
        />
      )}

      {/* Confirmation Modal for destructive Batch Actions */}
      {confirmModalAction && (
        <Modal
          open={true}
          modalHeading={confirmModalAction.action.confirmationTitle || 'Confirm Action'}
          primaryButtonText="Confirm"
          secondaryButtonText="Cancel"
          danger={confirmModalAction.action.kind === 'danger'}
          onRequestClose={() => setConfirmModalAction(null)}
          onRequestSubmit={async () => {
            await confirmModalAction.action.onClick(
              confirmModalAction.selectedRows,
              confirmModalAction.clearSelection
            );
            setConfirmModalAction(null);
          }}
        >
          <p>
            {confirmModalAction.action.confirmationMessage ||
              `Are you sure you want to proceed with ${confirmModalAction.selectedRows.length} selected item(s)?`}
          </p>
        </Modal>
      )}
    </div>
  );
}
