/**
 * EduCore Admin Console - Enterprise AdminDataTable Component
 */

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
  TableSelectAll,
  TableSelectRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  TableToolbarMenu,
  TableToolbarAction,
  TableBatchActions,
  TableBatchAction,
  Pagination,
  Button,
} from '@carbon/react';
import { TrashCan, Download, Renew, Filter } from '@carbon/icons-react';
import { useBreakpoint } from '../../hooks';
import { AdminStatusBadge } from './AdminStatusBadge';
import { AdminEmptyState } from './AdminPage';

export interface ColumnDef<T = any> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  isSortable?: boolean;
}

export interface AdminDataTableProps<T extends { id: string | number }> {
  title?: string;
  description?: string;
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  onSearchChange?: (query: string) => void;
  onRefresh?: () => void;
  onDeleteSelected?: (selectedIds: string[]) => void;
  onExport?: () => void;
  actions?: React.ReactNode;
  rowActions?: (row: T) => React.ReactNode;
  pageSize?: number;
}

export function AdminDataTable<T extends { id: string | number }>({
  title,
  description,
  columns,
  data,
  loading = false,
  searchPlaceholder = 'Search records...',
  onSearchChange,
  onRefresh,
  onDeleteSelected,
  onExport,
  actions,
  rowActions,
  pageSize = 10,
}: AdminDataTableProps<T>) {
  const { isMobile } = useBreakpoint();
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageSize, setCurrentPageSize] = useState(pageSize);
  const [searchQuery, setSearchQuery] = useState('');

  // Local search filter if parent didn't bind external onSearchChange
  const filteredData = React.useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();
    return data.filter((row) =>
      Object.values(row).some(
        (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(q)
      )
    );
  }, [data, searchQuery]);

  // Pagination calculation
  const startIndex = (currentPage - 1) * currentPageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + currentPageSize);

  // Carbon DataTable expects headers: [{ key, header }]
  const carbonHeaders = columns.map((col) => ({
    key: col.key,
    header: col.header,
  }));

  // Render cell content dynamically
  const renderCellContent = (colKey: string, row: T) => {
    const colDef = columns.find((c) => c.key === colKey);
    if (colDef && colDef.render) {
      return colDef.render(row);
    }

    const val = (row as any)[colKey];
    if (colKey === 'status') {
      return <AdminStatusBadge status={String(val)} />;
    }
    if (typeof val === 'boolean') {
      return val ? 'Yes' : 'No';
    }
    if (Array.isArray(val)) {
      return val.join(', ');
    }
    return val !== undefined && val !== null ? String(val) : '—';
  };

  return (
    <div style={{ backgroundColor: 'var(--cds-layer-01)', border: '1px solid var(--cds-border-subtle)' }}>
      <DataTable
        rows={paginatedData as any}
        headers={carbonHeaders}
        isSortable
        render={({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getSelectionProps,
          getBatchActionProps,
          selectedRows,
        }) => {
          const selectedIds = selectedRows.map((sr) => String(sr.id));

          return (
            <TableContainer title={title} description={description}>
              <TableToolbar>
                <TableBatchActions {...getBatchActionProps()}>
                  {onDeleteSelected && (
                    <TableBatchAction
                      tabIndex={getBatchActionProps().shouldShowBatchActions ? 0 : -1}
                      renderIcon={TrashCan}
                      onClick={() => onDeleteSelected(selectedIds)}
                    >
                      Delete ({selectedRows.length})
                    </TableBatchAction>
                  )}
                </TableBatchActions>

                <TableToolbarContent>
                  <TableToolbarSearch
                    persistent
                    placeholder={searchPlaceholder}
                    onChange={(e: any) => {
                      const q = e.target.value || '';
                      setSearchQuery(q);
                      if (onSearchChange) onSearchChange(q);
                    }}
                  />

                  {onRefresh && (
                    <Button
                      kind="ghost"
                      size="sm"
                      renderIcon={Renew}
                      hasIconOnly
                      iconDescription="Refresh dataset"
                      onClick={onRefresh}
                    />
                  )}

                  {onExport && (
                    <Button
                      kind="ghost"
                      size="sm"
                      renderIcon={Download}
                      hasIconOnly={isMobile}
                      iconDescription="Export CSV"
                      onClick={onExport}
                    >
                      {!isMobile && "Export CSV"}
                    </Button>
                  )}

                  {actions}
                </TableToolbarContent>
              </TableToolbar>

              <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                <Table size="md" useZebraStyles={false}>
                  <TableHead>
                    <TableRow>
                      {onDeleteSelected && <TableSelectAll {...getSelectionProps()} />}
                      {headers.map((header) => {
                        const { key, ...headerProps } = getHeaderProps({ header });
                        return (
                          <TableHeader key={header.key || key} {...headerProps}>
                            {header.header}
                          </TableHeader>
                        );
                      })}
                      {rowActions && <TableHeader key="row-actions">Actions</TableHeader>}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {rows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={headers.length + (onDeleteSelected ? 1 : 0) + (rowActions ? 1 : 0)}>
                          <AdminEmptyState title="No matching records" description="Try clearing your search query or filters." />
                        </TableCell>
                      </TableRow>
                    ) : (
                      rows.map((row) => {
                        const originalRow = paginatedData.find((r) => String(r.id) === String(row.id));
                        const { key, ...rowProps } = getRowProps({ row });

                        return (
                          <TableRow key={row.id || key} {...rowProps}>
                            {onDeleteSelected && <TableSelectRow {...getSelectionProps({ row })} />}
                            {row.cells.map((cell: any) => (
                              <TableCell key={cell.id}>
                                {originalRow ? renderCellContent(cell.info.header, originalRow) : cell.value}
                              </TableCell>
                            ))}
                            {rowActions && originalRow && (
                              <TableCell key={`actions-${row.id}`}>
                                {rowActions(originalRow)}
                              </TableCell>
                            )}
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </TableContainer>
          );
        }}
      />

      {/* Pagination Bar */}
      <Pagination
        backwardText="Previous page"
        forwardText="Next page"
        itemsPerPageText="Items per page:"
        page={currentPage}
        pageNumberText="Page Number"
        pageSize={currentPageSize}
        pageSizes={[10, 20, 50, 100]}
        totalItems={filteredData.length}
        onChange={({ page, pageSize: newPageSize }) => {
          setCurrentPage(page);
          setCurrentPageSize(newPageSize);
        }}
      />
    </div>
  );
}
