import React, { useState } from 'react';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Pagination,
  DataTableSkeleton,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  TableBatchActions,
  TableBatchAction,
  TableSelectAll,
  TableSelectRow,
  Modal,
  Tag,
} from '@carbon/react';
import { EmptyState, EmptyStateType } from '../feedback/EmptyState';
import { ErrorState } from '../feedback/ErrorState';

export interface DataGridColumn<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

export interface DataGridBatchAction {
  id: string;
  label: string;
  icon?: React.ComponentType<any>;
  onClick: (selectedRows: any[]) => void;
  kind?: 'primary' | 'danger' | 'secondary' | 'ghost' | 'tertiary';
}

export interface DataGridProps<T extends { id: string }> {
  title?: string;
  description?: string;
  columns: DataGridColumn<T>[];
  data: T[];
  loading?: boolean;
  error?: boolean;
  emptyType?: EmptyStateType;
  
  // Interactions
  onRowClick?: (row: T) => void;
  onView?: (row: T) => void;
  enableClickToView?: boolean;
  onSearch?: (value: string) => void;
  searchPlaceholder?: string;
  batchActions?: DataGridBatchAction[];
  toolbarActions?: React.ReactNode;
  
  // Pagination
  pagination?: boolean;
  page?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (data: { page: number; pageSize: number }) => void;
}

export function DataGrid<T extends { id: string }>({
  title,
  description,
  columns,
  data,
  loading = false,
  error = false,
  emptyType = 'no-data',
  onRowClick,
  onView,
  enableClickToView = true,
  onSearch,
  searchPlaceholder = 'Search...',
  batchActions = [],
  toolbarActions,
  pagination = false,
  page = 1,
  pageSize = 10,
  totalItems = 0,
  onPageChange,
}: DataGridProps<T>) {
  const [searchValue, setSearchValue] = useState('');
  const [activeViewRow, setActiveViewRow] = useState<T | null>(null);

  const dataMap = React.useMemo(() => {
    const map = new Map<string, T>();
    data.forEach(item => map.set(String(item.id), item));
    return map;
  }, [data]);

  if (error) {
    return (
      <div style={{ padding: '2rem', backgroundColor: 'var(--cds-layer-01)' }}>
        <ErrorState />
      </div>
    );
  }

  if (loading && data.length === 0) {
    return (
      <DataTableSkeleton
        columnCount={columns.length}
        rowCount={pageSize || 5}
        showHeader={true}
        showToolbar={false}
      />
    );
  }

  if (!loading && data.length === 0 && !searchValue) {
    return (
      <div style={{ backgroundColor: 'var(--cds-layer-01)', border: '1px solid var(--cds-border-subtle)' }}>
        {title && (
          <div style={{ padding: '1rem' }}>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 400 }}>{title}</h4>
            {description && <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>{description}</p>}
          </div>
        )}
        <EmptyState type={emptyType} />
      </div>
    );
  }

  const carbonHeaders = columns.map(col => ({
    key: col.key,
    header: col.header,
  }));

  // We must map data objects into Carbon's strict { id: string, ... } format.
  const carbonRows = data.map((row) => {
    const r: { id: string; [key: string]: any } = { id: String(row.id) };
    columns.forEach((col) => {
      r[col.key] = col.render ? col.render(row) : (row as any)[col.key];
    });
    return r;
  });

  const BodyComponent = TableBody as any;
  const hasBatchActions = batchActions && batchActions.length > 0;
  const isClickable = Boolean(onRowClick || onView || enableClickToView);

  return (
    <div style={{ width: '100%', maxWidth: '100%' }}>
      <div className="data-grid-table-wrapper">
        <DataTable rows={carbonRows as any} headers={carbonHeaders} isSortable>
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
            onInputChange
          }) => {
            
            const handleSearchChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
              const val = evt.target.value;
              setSearchValue(val);
              onInputChange(evt);
              if (onSearch) {
                onSearch(val);
              }
            };

            const batchActionProps = getBatchActionProps();

            return (
              <TableContainer title={title} description={description}>
                {(onSearch || hasBatchActions || toolbarActions) && (
                  <TableToolbar {...getToolbarProps()} aria-label="data table toolbar">
                    <TableBatchActions {...batchActionProps}>
                      {batchActions.map(action => (
                        <TableBatchAction
                          key={action.id}
                          tabIndex={batchActionProps.shouldShowBatchActions ? 0 : -1}
                          renderIcon={action.icon}
                          iconDescription={action.label}
                          onClick={() => {
                            const originalSelectedRows = selectedRows.map(r => dataMap.get(r.id)).filter(Boolean) as any[];
                            action.onClick(originalSelectedRows);
                          }}
                        />
                      ))}
                    </TableBatchActions>
                    <TableToolbarContent>
                      {onSearch && (
                        <TableToolbarSearch
                          persistent
                          placeholder={searchPlaceholder}
                          tabIndex={batchActionProps.shouldShowBatchActions ? -1 : 0}
                          onChange={handleSearchChange}
                        />
                      )}
                      {toolbarActions}
                    </TableToolbarContent>
                  </TableToolbar>
                )}
                
                <Table {...getTableProps()} size="md">
                  <TableHead>
                    <TableRow>
                      {hasBatchActions && (
                        <TableSelectAll {...getSelectionProps()} />
                      )}
                      {headers.map((header) => {
                        const { key, ...headerProps } = getHeaderProps({ header });
                        return (
                          <TableHeader
                            key={key}
                            {...headerProps}
                            style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {header.header}
                          </TableHeader>
                        );
                      })}
                    </TableRow>
                  </TableHead>
                  <BodyComponent>
                    {rows.map((row) => {
                      const { key, ...rowProps } = getRowProps({ row });
                      const originalData = dataMap.get(row.id);
                      return (
                        <TableRow
                          key={key}
                          {...rowProps}
                          onClick={(e: React.MouseEvent) => {
                            const target = e.target as HTMLElement;
                            if (
                              target.closest('.cds--checkbox') ||
                              target.closest('button') ||
                              target.closest('a') ||
                              target.closest('input')
                            ) {
                              return;
                            }
                            if (originalData) {
                              if (onRowClick) onRowClick(originalData);
                              if (onView) onView(originalData);
                              if (!onRowClick && !onView && enableClickToView !== false) {
                                setActiveViewRow(originalData);
                              }
                            }
                          }}
                          style={{
                            cursor: isClickable ? 'pointer' : 'default',
                          }}
                        >
                          {hasBatchActions && (
                            <TableSelectRow {...getSelectionProps({ row })} />
                          )}
                          {row.cells.map((cell) => (
                            <TableCell
                              key={cell.id}
                              style={{
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                maxWidth: '22rem',
                                verticalAlign: 'middle',
                              }}
                            >
                              {cell.value}
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </BodyComponent>
                </Table>
              </TableContainer>
            );
          }}
        </DataTable>
      </div>
      
      {pagination && (
        <Pagination
          backwardText="Previous page"
          forwardText="Next page"
          itemsPerPageText="Items per page:"
          page={page}
          pageNumberText="Page Number"
          pageSize={pageSize}
          pageSizes={[10, 20, 30, 40, 50]}
          totalItems={totalItems || data.length}
          onChange={(paginationData) => {
            if (onPageChange) {
              onPageChange(paginationData);
            }
          }}
        />
      )}

      {/* Row Click-to-View Modal */}
      {activeViewRow && (
        <Modal
          open={Boolean(activeViewRow)}
          onRequestClose={() => setActiveViewRow(null)}
          modalHeading={`Record Details: ${activeViewRow.id}`}
          modalLabel="DataGrid Detail View"
          passiveModal
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '0.5rem 0' }}>
            {columns.map((col) => {
              const val = (activeViewRow as any)[col.key];
              return (
                <div key={col.key} style={{ padding: '0.5rem', backgroundColor: 'var(--cds-layer-01)', borderRadius: '2px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>
                    {col.header}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-primary)', marginTop: '0.25rem', wordBreak: 'break-word' }}>
                    {col.render ? (
                      col.render(activeViewRow)
                    ) : typeof val === 'boolean' ? (
                      <Tag type={val ? 'green' : 'red'}>{val ? 'Active / Yes' : 'Inactive / No'}</Tag>
                    ) : val !== undefined && val !== null ? (
                      String(val)
                    ) : (
                      <span style={{ color: 'var(--cds-text-placeholder)' }}>—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}

