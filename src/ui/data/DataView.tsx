import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Select,
  SelectItem,
  Button,
  Pagination,
  Tooltip,
} from '@carbon/react';
import {
  Table as TableIcon,
  Grid as GridIcon,
  List as ListIcon,
  TrashCan,
  Export,
  Renew,
  Printer,
  DocumentPdf,
  DocumentExport,
  Document,
} from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import { ColumnDef } from '../../components/dynamic-ui/types';
import { DataViewMode } from '../layout/ModuleHeader';
import { DataGrid, DataGridColumn } from './DataGrid';
import { EntityCardGrid } from './EntityCardGrid';
import { EntityCompactList } from './EntityCompactList';
import { exportTableToPdf } from '../../core/export/pdfExport';
import { exportTableToCsv } from '../../core/export/csvExport';
import { exportTableToExcel } from '../../core/export/excelExport';
import { PrintPreviewModal } from '../../components/ui/PrintPreviewModal';
import { FilterPresetsBar } from '../../components/ui/FilterPresetsBar';
import { useNotification } from '../../core/notifications/NotificationContext';

export type { DataViewMode };

export interface QuickFilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
}

export interface DataViewProps<T = any> {
  data: T[];
  columns: ColumnDef<T>[];
  idField?: string;
  titleField?: string;
  subtitleField?: string;
  statusField?: string;
  icon?: React.ComponentType<any>;
  isLoading?: boolean;
  defaultViewMode?: DataViewMode;
  allowedViewModes?: DataViewMode[];
  /** Search */
  searchPlaceholder?: string;
  searchFields?: string[];
  /** Quick Status Filters */
  statusFilterField?: string;
  statusFilterOptions?: QuickFilterOption[];
  /** Sorting */
  sortableFields?: { field: string; label: string }[];
  defaultSortField?: string;
  defaultSortDirection?: 'ASC' | 'DESC';
  /** Selection */
  selectable?: boolean;
  selectedIds?: (string | number)[];
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  /** Bulk Actions */
  onBulkDelete?: (selectedIds: (string | number)[]) => void;
  onBulkExport?: (selectedIds: (string | number)[]) => void;
  /** Item Actions */
  onRowClick?: (item: T) => void;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onDisable?: (item: T) => void;
  onRefresh?: () => void;
  /** Custom action components */
  toolbarActions?: React.ReactNode;
  /** Document Export & Print */
  title?: string;
  moduleName?: string;
  moduleCode?: string;
  enablePdfExport?: boolean;
  enableExcelExport?: boolean;
  enableCsvExport?: boolean;
  enablePrintPreview?: boolean;
  enableFilterPresets?: boolean;
  /** Pagination */
  pageSize?: number;
  pageSizes?: number[];
  emptyMessage?: string;
  className?: string;
}

export function DataView<T extends Record<string, any>>({
  data = [],
  columns = [],
  idField = 'id',
  titleField,
  subtitleField,
  statusField = 'status',
  icon,
  isLoading = false,
  defaultViewMode = 'table',
  allowedViewModes = ['table', 'cards', 'list'],
  searchPlaceholder,
  searchFields,
  statusFilterField = 'status',
  statusFilterOptions,
  sortableFields,
  defaultSortField,
  defaultSortDirection = 'ASC',
  selectable = true,
  selectedIds: propSelectedIds,
  onSelectionChange: propOnSelectionChange,
  onBulkDelete,
  onBulkExport,
  onRowClick,
  onView,
  onEdit,
  onDelete,
  onDisable,
  onRefresh,
  toolbarActions,
  title,
  moduleName,
  moduleCode,
  enablePdfExport = true,
  enableExcelExport = true,
  enableCsvExport = true,
  enablePrintPreview = true,
  enableFilterPresets = true,
  pageSize: propPageSize = 10,
  pageSizes = [10, 25, 50, 100],
  emptyMessage,
  className = '',
}: DataViewProps<T>) {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const { isMobile } = useBreakpoint();

  // Local State: mobile-first default to cards view on small screens
  const [userOverrodeViewMode, setUserOverrodeViewMode] = useState(false);
  const [viewMode, setViewModeState] = useState<DataViewMode>(() =>
    isMobile && allowedViewModes.includes('cards') ? 'cards' : defaultViewMode
  );

  useEffect(() => {
    if (!userOverrodeViewMode) {
      if (isMobile && allowedViewModes.includes('cards')) {
        setViewModeState('cards');
      } else {
        setViewModeState(defaultViewMode);
      }
    }
  }, [isMobile, defaultViewMode, userOverrodeViewMode, allowedViewModes]);

  const setViewMode = (mode: DataViewMode) => {
    setUserOverrodeViewMode(true);
    setViewModeState(mode);
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatusFilter, setActiveStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<string>(
    defaultSortField || (columns[0]?.key as string) || (columns[0]?.name as string) || ''
  );
  const [sortDir, setSortDir] = useState<'ASC' | 'DESC'>(defaultSortDirection);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(propPageSize);
  const [localSelectedIds, setLocalSelectedIds] = useState<(string | number)[]>([]);
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const [previewRecords, setPreviewRecords] = useState<any[]>([]);

  // Selection sync
  const selectedIds = propSelectedIds !== undefined ? propSelectedIds : localSelectedIds;
  const handleSelectionChange = (newSelected: (string | number)[]) => {
    if (propOnSelectionChange) propOnSelectionChange(newSelected);
    else setLocalSelectedIds(newSelected);
  };

  // Derive sort fields from columns if not explicitly provided
  const availableSortFields = useMemo(() => {
    if (sortableFields && sortableFields.length > 0) return sortableFields;
    return columns.map((col) => ({
      field: (col.key || col.name) as string,
      label: col.label || col.header || String(col.key || col.name),
    }));
  }, [sortableFields, columns]);

  // Dynamic quick status filter options if not passed
  const quickFilters = useMemo(() => {
    if (statusFilterOptions) return statusFilterOptions;

    // Auto-detect status counts
    const counts: Record<string, number> = {};
    data.forEach((item) => {
      const st = String(
        item[statusFilterField] || (item.active !== undefined ? (item.active ? 'active' : 'inactive') : 'unknown')
      ).toLowerCase();
      counts[st] = (counts[st] || 0) + 1;
    });

    const opts: QuickFilterOption[] = [
      { id: 'ALL', label: 'All', value: 'ALL', count: data.length },
    ];

    Object.keys(counts).forEach((st) => {
      opts.push({
        id: st,
        label: st.charAt(0).toUpperCase() + st.slice(1),
        value: st,
        count: counts[st],
      });
    });

    return opts;
  }, [statusFilterOptions, data, statusFilterField]);

  // Filtering Logic
  const filteredData = useMemo(() => {
    let result = [...data];

    // Status filter
    if (activeStatusFilter !== 'ALL') {
      result = result.filter((item) => {
        const val = String(
          item[statusFilterField] || (item.active !== undefined ? (item.active ? 'active' : 'inactive') : '')
        ).toLowerCase();
        return val === activeStatusFilter.toLowerCase();
      });
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((item) => {
        if (searchFields && searchFields.length > 0) {
          return searchFields.some((f) => {
            const v = item[f];
            return v !== undefined && v !== null && String(v).toLowerCase().includes(q);
          });
        }
        // General search across all item properties
        return Object.values(item).some((val) => {
          if (val === undefined || val === null) return false;
          if (typeof val === 'object') return false;
          return String(val).toLowerCase().includes(q);
        });
      });
    }

    // Sort Logic
    if (sortField) {
      result.sort((a, b) => {
        const valA = a[sortField];
        const valB = b[sortField];
        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        let cmp = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
          cmp = valA - valB;
        } else {
          cmp = String(valA).localeCompare(String(valB));
        }
        return sortDir === 'DESC' ? -cmp : cmp;
      });
    }

    return result;
  }, [data, activeStatusFilter, searchQuery, searchFields, statusFilterField, sortField, sortDir]);

  // Paginated Slice
  const totalItems = filteredData.length;
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page, pageSize]);

  // Standardize columns for DataGrid
  const dataGridColumns: DataGridColumn<{ id: string; [key: string]: any }>[] = useMemo(() => {
    return columns.map((col) => ({
      key: (col.key || col.name) as string,
      header: col.label || col.header || String(col.key || col.name),
      render: col.renderCell
        ? (row: any) => col.renderCell!(row[(col.key || col.name) as string], row)
        : col.render
        ? (row: any) => col.render!(row)
        : undefined,
    }));
  }, [columns]);

  const gridRows = useMemo(() => {
    return paginatedData.map((d) => ({
      ...d,
      id: String(d[idField] ?? d.id),
    }));
  }, [paginatedData, idField]);

  const handleExportExcel = async (idsToExport?: (string | number)[]) => {
    const recordsToExport = idsToExport && idsToExport.length > 0
      ? data.filter((d) => idsToExport.includes(d[idField] ?? d.id))
      : filteredData;

    notify({
      kind: 'info',
      title: 'Excel Export Started',
      subtitle: `Exporting ${recordsToExport.length} record(s) to Microsoft Excel (.xlsx)...`,
      timeout: 3000,
    });

    try {
      const excelCols = columns.map((col) => ({
        header: col.label || col.header || String(col.key || col.name),
        dataKey: String(col.key || col.name),
        width: col.width ? parseInt(col.width, 10) : undefined,
      }));

      const res = await exportTableToExcel({
        title: title || 'Institutional Records Export',
        moduleName: moduleName || 'Academic System',
        moduleCode: moduleCode || 'MOD-SYS',
        columns: excelCols,
        data: recordsToExport,
      });

      notify({
        kind: 'success',
        title: 'Excel Export Complete',
        subtitle: `Spreadsheet successfully saved as ${res.filename}`,
        timeout: 5000,
      });
    } catch (err: any) {
      notify({
        kind: 'error',
        title: 'Excel Export Failed',
        subtitle: err?.message || 'Failed to generate Excel workbook.',
        timeout: 6000,
      });
    }
  };

  const handleExportCsv = async (idsToExport?: (string | number)[]) => {
    const recordsToExport = idsToExport && idsToExport.length > 0
      ? data.filter((d) => idsToExport.includes(d[idField] ?? d.id))
      : filteredData;

    notify({
      kind: 'info',
      title: 'CSV Export Started',
      subtitle: `Exporting ${recordsToExport.length} record(s) to CSV (.csv)...`,
      timeout: 3000,
    });

    try {
      const csvCols = columns.map((col) => ({
        header: col.label || col.header || String(col.key || col.name),
        dataKey: String(col.key || col.name),
      }));

      const res = await exportTableToCsv({
        title: title || 'Institutional Records Export',
        moduleName: moduleName || 'Academic System',
        moduleCode: moduleCode || 'MOD-SYS',
        columns: csvCols,
        data: recordsToExport,
      });

      notify({
        kind: 'success',
        title: 'CSV Export Complete',
        subtitle: `CSV file successfully saved as ${res.filename}`,
        timeout: 5000,
      });
    } catch (err: any) {
      notify({
        kind: 'error',
        title: 'CSV Export Failed',
        subtitle: err?.message || 'Failed to generate CSV file.',
        timeout: 6000,
      });
    }
  };

  const handleExportPdf = async (idsToExport?: (string | number)[]) => {
    const recordsToExport = idsToExport && idsToExport.length > 0
      ? data.filter((d) => idsToExport.includes(d[idField] ?? d.id))
      : filteredData;

    notify({
      kind: 'info',
      title: 'Export Started',
      subtitle: `Generating institutional PDF for ${recordsToExport.length} records...`,
      timeout: 3000,
    });

    try {
      const pdfCols = columns.map((col) => ({
        header: col.label || col.header || String(col.key || col.name),
        dataKey: String(col.key || col.name),
      }));

      const res = await exportTableToPdf({
        title: title || 'Institutional Records Export',
        moduleName: moduleName || 'Academic System',
        moduleCode: moduleCode || 'MOD-SYS',
        columns: pdfCols,
        data: recordsToExport,
      });

      notify({
        kind: 'success',
        title: 'Export Complete',
        subtitle: `Document successfully downloaded as ${res.filename}`,
        timeout: 5000,
      });
    } catch (err: any) {
      notify({
        kind: 'error',
        title: 'Export Failed',
        subtitle: err?.message || 'Failed to render PDF export document.',
        timeout: 6000,
      });
    }
  };

  const handleOpenPrintPreview = (idsToPreview?: (string | number)[]) => {
    const records = idsToPreview && idsToPreview.length > 0
      ? data.filter((d) => idsToPreview.includes(d[idField] ?? d.id))
      : filteredData;
    setPreviewRecords(records);
    setIsPrintPreviewOpen(true);
  };

  return (
    <div
      className={`data-view-container cds-flex cds-flex-col ${className}`}
      style={{
        backgroundColor: 'var(--cds-layer-01)',
        border: '1px solid var(--cds-border-subtle)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}
    >
      {/* 0. Saved Filter Presets Bar */}
      {enableFilterPresets !== false && (
        <FilterPresetsBar
          presetStorageKey={moduleCode || moduleName || title || 'default'}
          currentFilters={{
            searchQuery,
            activeStatusFilter,
            sortField,
            sortDir,
          }}
          onApplyPreset={(preset) => {
            if (preset.searchQuery !== undefined) setSearchQuery(preset.searchQuery);
            if (preset.activeStatusFilter !== undefined) setActiveStatusFilter(preset.activeStatusFilter);
            if (preset.sortField) setSortField(preset.sortField);
            if (preset.sortDir) setSortDir(preset.sortDir);
            setPage(1);
          }}
          onResetFilters={() => {
            setSearchQuery('');
            setActiveStatusFilter('ALL');
            setPage(1);
          }}
        />
      )}
      {/* 1. Master Toolbar Bar */}
      {viewMode !== 'table' && (
        <div
          className="data-view-toolbar"
          style={{
            padding: '0.875rem 1rem',
            borderBottom: '1px solid var(--cds-border-subtle)',
            backgroundColor: selectedIds.length > 0 ? 'var(--cds-layer-selected-01)' : 'var(--cds-layer-01)',
            transition: 'background-color 0.15s ease',
          }}
        >
          {selectedIds.length > 0 ? (
            /* Batch Selection Toolbar (Only for cards/list mode) */
            <div className="cds-flex cds-items-center cds-justify-between cds-gap-03 cds-flex-wrap">
              <div className="cds-flex cds-items-center cds-gap-02">
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                  {selectedIds.length} {selectedIds.length === 1 ? 'record selected' : 'records selected'}
                </span>
                <Button
                  kind="ghost"
                  size="sm"
                  onClick={() => handleSelectionChange([])}
                >
                  Clear Selection
                </Button>
              </div>

              <div className="cds-flex cds-items-center cds-gap-02">
                {enableExcelExport !== false && (
                  <Button
                    renderIcon={DocumentExport}
                    kind="secondary"
                    size="sm"
                    onClick={() => handleExportExcel(selectedIds)}
                  >
                    Excel (.xlsx)
                  </Button>
                )}

                {enableCsvExport !== false && (
                  <Button
                    renderIcon={Document}
                    kind="secondary"
                    size="sm"
                    onClick={() => handleExportCsv(selectedIds)}
                  >
                    CSV (.csv)
                  </Button>
                )}

                {enablePdfExport !== false && (
                  <Button
                    renderIcon={DocumentPdf}
                    kind="secondary"
                    size="sm"
                    onClick={() => handleExportPdf(selectedIds)}
                  >
                    PDF (.pdf)
                  </Button>
                )}

                {enablePrintPreview !== false && (
                  <Button
                    renderIcon={Printer}
                    kind="ghost"
                    size="sm"
                    onClick={() => handleOpenPrintPreview(selectedIds)}
                  >
                    Print Preview
                  </Button>
                )}

                {onBulkExport && (
                  <Button
                    renderIcon={Export}
                    kind="secondary"
                    size="sm"
                    onClick={() => onBulkExport(selectedIds)}
                  >
                    Export Selected
                  </Button>
                )}

                {onBulkDelete && (
                  <Button
                    renderIcon={TrashCan}
                    kind="danger"
                    size="sm"
                    onClick={() => onBulkDelete(selectedIds)}
                  >
                    Delete Selected
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Standard Search & Controls Toolbar (Only for cards/list mode) */
            <div className="cds-flex cds-items-center cds-justify-between cds-gap-03 cds-flex-wrap">
              {/* Left: Search input & Status Filter Chips */}
              <div className="cds-flex cds-items-center cds-gap-03 cds-flex-wrap" style={{ flex: '1 1 24rem' }}>
                <div style={{ maxWidth: '18rem', flex: 1, minWidth: '12rem' }}>
                  <Search
                    size="md"
                    placeholder={searchPlaceholder || t('ui.search.placeholder', 'Search records...')}
                    labelText="Search records"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setPage(1);
                    }}
                    onClear={() => setSearchQuery('')}
                  />
                </div>

                {/* Quick Status Filters */}
                {quickFilters.length > 1 && (
                  <div className="cds-flex cds-items-center cds-gap-01 cds-flex-wrap">
                    {quickFilters.map((flt) => {
                      const isActive = activeStatusFilter === flt.value;
                      return (
                        <button
                          key={flt.id}
                          type="button"
                          onClick={() => {
                            setActiveStatusFilter(flt.value);
                            setPage(1);
                          }}
                          style={{
                            background: isActive ? 'var(--cds-layer-02)' : 'transparent',
                            border: isActive ? '1px solid var(--cds-border-interactive)' : '1px solid transparent',
                            borderRadius: '12px',
                            padding: '0.125rem 0.625rem',
                            cursor: 'pointer',
                            fontSize: '0.75rem',
                            fontWeight: isActive ? 600 : 400,
                            color: isActive ? 'var(--cds-text-primary)' : 'var(--cds-text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                          }}
                        >
                          <span>{flt.label}</span>
                          {flt.count !== undefined && (
                            <span style={{ opacity: 0.75, fontSize: '0.6875rem' }}>({flt.count})</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Right: Sort controls, View Switcher & Action buttons */}
              <div className="cds-flex cds-items-center cds-gap-02 cds-flex-wrap">
                {/* Sort By Dropdown */}
                {availableSortFields.length > 0 && (
                  <div style={{ width: '10rem' }}>
                    <Select
                      id="dataview-sort"
                      labelText=""
                      hideLabel
                      size="sm"
                      value={sortField}
                      onChange={(e) => setSortField(e.target.value)}
                    >
                      {availableSortFields.map((s, i) => (
                        <React.Fragment key={s.field || i}>
                          <SelectItem value={s.field} text={`Sort: ${s.label}`} />
                        </React.Fragment>
                      ))}
                    </Select>
                  </div>
                )}

                {/* Sort Direction Toggle */}
                {sortField && (
                  <Button
                    kind="ghost"
                    size="sm"
                    onClick={() => setSortDir(sortDir === 'ASC' ? 'DESC' : 'ASC')}
                    style={{ minWidth: '3.5rem', padding: '0 0.5rem' }}
                  >
                    {sortDir === 'ASC' ? '▲ Asc' : '▼ Desc'}
                  </Button>
                )}

                {/* Multi-Format Export Quick Actions for Cards/List */}
                {enableExcelExport !== false && (
                  <Tooltip align="bottom" label="Export Excel (.xlsx)">
                    <Button
                      hasIconOnly
                      renderIcon={DocumentExport}
                      iconDescription="Export Excel (.xlsx)"
                      kind="ghost"
                      size="sm"
                      onClick={() => handleExportExcel()}
                      style={{ width: '2rem', minWidth: '2rem' }}
                    />
                  </Tooltip>
                )}
                {enableCsvExport !== false && (
                  <Tooltip align="bottom" label="Export CSV (.csv)">
                    <Button
                      hasIconOnly
                      renderIcon={Document}
                      iconDescription="Export CSV (.csv)"
                      kind="ghost"
                      size="sm"
                      onClick={() => handleExportCsv()}
                      style={{ width: '2rem', minWidth: '2rem' }}
                    />
                  </Tooltip>
                )}
                {enablePdfExport !== false && (
                  <Tooltip align="bottom" label="Export PDF">
                    <Button
                      hasIconOnly
                      renderIcon={DocumentPdf}
                      iconDescription="Export PDF"
                      kind="ghost"
                      size="sm"
                      onClick={() => handleExportPdf()}
                      style={{ width: '2rem', minWidth: '2rem' }}
                    />
                  </Tooltip>
                )}
                {enablePrintPreview !== false && (
                  <Tooltip align="bottom" label="Print Preview">
                    <Button
                      hasIconOnly
                      renderIcon={Printer}
                      iconDescription="Print Preview"
                      kind="ghost"
                      size="sm"
                      onClick={() => handleOpenPrintPreview()}
                      style={{ width: '2rem', minWidth: '2rem' }}
                    />
                  </Tooltip>
                )}

                {/* View Switcher (Table / Cards / List) */}
                {allowedViewModes.length > 1 && (
                  <div
                    className="data-view-switcher cds-flex cds-items-center"
                    style={{
                      backgroundColor: 'var(--cds-layer-02)',
                      border: '1px solid var(--cds-border-subtle)',
                      borderRadius: '2px',
                      padding: '2px',
                    }}
                  >
                    {allowedViewModes.includes('table') && (
                      <Tooltip align="bottom" label="Table / Grid">
                        <Button
                          hasIconOnly
                          renderIcon={TableIcon}
                          iconDescription="Table View"
                          kind={(viewMode as string) === 'table' ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('table')}
                          style={{ width: '2rem', height: '2rem', minWidth: '2rem' }}
                        />
                      </Tooltip>
                    )}

                    {allowedViewModes.includes('cards') && (
                      <Tooltip align="bottom" label="Cards / Tile">
                        <Button
                          hasIconOnly
                          renderIcon={GridIcon}
                          iconDescription="Cards View"
                          kind={viewMode === 'cards' ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('cards')}
                          style={{ width: '2rem', height: '2rem', minWidth: '2rem' }}
                        />
                      </Tooltip>
                    )}

                    {allowedViewModes.includes('list') && (
                      <Tooltip align="bottom" label="Compact List">
                        <Button
                          hasIconOnly
                          renderIcon={ListIcon}
                          iconDescription="List View"
                          kind={viewMode === 'list' ? 'primary' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('list')}
                          style={{ width: '2rem', height: '2rem', minWidth: '2rem' }}
                        />
                      </Tooltip>
                    )}
                  </div>
                )}

                {/* Refresh */}
                {onRefresh && (
                  <Tooltip align="bottom" label="Refresh Data">
                    <Button
                      hasIconOnly
                      renderIcon={Renew}
                      iconDescription="Refresh"
                      kind="ghost"
                      size="sm"
                      disabled={isLoading}
                      onClick={onRefresh}
                      style={{ width: '2rem', minWidth: '2rem' }}
                    />
                  </Tooltip>
                )}

                {toolbarActions}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Main Content Mode Switcher */}
      <div className="data-view-body" style={{ minHeight: '16rem', padding: viewMode === 'cards' ? '1rem' : '0' }}>
        {viewMode === 'table' && (
          <DataGrid
            data={gridRows}
            columns={dataGridColumns}
            loading={isLoading}
            onRowClick={onRowClick as any}
            onSearch={(val) => {
              setSearchQuery(val);
              setPage(1);
            }}
            searchPlaceholder={searchPlaceholder || t('ui.search.placeholder', 'Search records...')}
            batchActions={[
              ...(enableExcelExport !== false ? [{
                id: 'export-excel',
                label: 'Export Selected to Excel (.xlsx)',
                icon: DocumentExport,
                onClick: (rows: any[]) => handleExportExcel(rows.map((r) => r.id)),
              }] : []),
              ...(enableCsvExport !== false ? [{
                id: 'export-csv',
                label: 'Export Selected to CSV (.csv)',
                icon: Document,
                onClick: (rows: any[]) => handleExportCsv(rows.map((r) => r.id)),
              }] : []),
              ...(enablePdfExport !== false ? [{
                id: 'export-pdf',
                label: 'Export Selected to PDF',
                icon: DocumentPdf,
                onClick: (rows: any[]) => handleExportPdf(rows.map((r) => r.id)),
              }] : []),
              ...(enablePrintPreview !== false ? [{
                id: 'print-preview',
                label: 'Print Preview Selected',
                icon: Printer,
                onClick: (rows: any[]) => handleOpenPrintPreview(rows.map((r) => r.id)),
              }] : []),
              ...(onBulkExport ? [{
                id: 'export',
                label: 'Export Selected',
                icon: Export,
                onClick: (rows: any[]) => onBulkExport(rows.map(r => r.id))
              }] : []),
              ...(onBulkDelete ? [{
                id: 'delete',
                label: 'Delete Selected',
                icon: TrashCan,
                kind: 'danger' as any,
                onClick: (rows: any[]) => onBulkDelete(rows.map(r => r.id))
              }] : [])
            ]}
            toolbarActions={
              <div className="cds-flex cds-items-center cds-gap-03">
                {/* Multi-Format Export & Print Preview Quick Actions */}
                {enableExcelExport !== false && (
                  <Button
                    hasIconOnly
                    renderIcon={DocumentExport}
                    iconDescription="Export Excel (.xlsx)"
                    kind="ghost"
                    size="sm"
                    onClick={() => handleExportExcel()}
                  />
                )}
                {enableCsvExport !== false && (
                  <Button
                    hasIconOnly
                    renderIcon={Document}
                    iconDescription="Export CSV (.csv)"
                    kind="ghost"
                    size="sm"
                    onClick={() => handleExportCsv()}
                  />
                )}
                {enablePdfExport !== false && (
                  <Button
                    hasIconOnly
                    renderIcon={DocumentPdf}
                    iconDescription="Export PDF"
                    kind="ghost"
                    size="sm"
                    onClick={() => handleExportPdf()}
                  />
                )}
                {enablePrintPreview !== false && (
                  <Button
                    hasIconOnly
                    renderIcon={Printer}
                    iconDescription="Print Preview"
                    kind="ghost"
                    size="sm"
                    onClick={() => handleOpenPrintPreview()}
                  />
                )}
                {/* View Switcher for Table Mode embedded in toolbar */}
                {allowedViewModes.length > 1 && (
                  <div
                    className="cds-flex cds-items-center"
                    style={{
                      backgroundColor: 'transparent',
                      padding: '2px',
                    }}
                  >
                    {allowedViewModes.includes('table') && (
                      <Button
                        hasIconOnly
                        renderIcon={TableIcon}
                        iconDescription="Table View"
                        kind={(viewMode as string) === 'table' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('table')}
                      />
                    )}
                    {allowedViewModes.includes('cards') && (
                      <Button
                        hasIconOnly
                        renderIcon={GridIcon}
                        iconDescription="Cards View"
                        kind={(viewMode as string) === 'cards' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('cards')}
                      />
                    )}
                    {allowedViewModes.includes('list') && (
                      <Button
                        hasIconOnly
                        renderIcon={ListIcon}
                        iconDescription="List View"
                        kind={(viewMode as string) === 'list' ? 'secondary' : 'ghost'}
                        size="sm"
                        onClick={() => setViewMode('list')}
                      />
                    )}
                  </div>
                )}
                {onRefresh && (
                  <Button
                    hasIconOnly
                    renderIcon={Renew}
                    iconDescription="Refresh"
                    kind="ghost"
                    size="sm"
                    disabled={isLoading}
                    onClick={onRefresh}
                  />
                )}
                {toolbarActions}
              </div>
            }
          />
        )}

        {viewMode === 'cards' && (
          <EntityCardGrid
            data={paginatedData}
            columns={columns}
            idField={idField}
            titleField={titleField}
            subtitleField={subtitleField}
            statusField={statusField}
            icon={icon}
            isLoading={isLoading}
            selectable={selectable}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            onCardClick={onRowClick}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onDisable={onDisable}
            emptyMessage={emptyMessage}
          />
        )}

        {viewMode === 'list' && (
          <EntityCompactList
            data={paginatedData}
            columns={columns}
            idField={idField}
            titleField={titleField}
            subtitleField={subtitleField}
            statusField={statusField}
            icon={icon}
            isLoading={isLoading}
            selectable={selectable}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            onItemClick={onRowClick}
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            onDisable={onDisable}
            emptyMessage={emptyMessage}
          />
        )}
      </div>

      {/* 3. Pagination Footer */}
      {totalItems > 0 && (
        <div style={{ borderTop: '1px solid var(--cds-border-subtle)' }}>
          <Pagination
            totalItems={totalItems}
            pageSize={pageSize}
            pageSizes={pageSizes}
            page={page}
            onChange={({ page: newPage, pageSize: newPageSize }) => {
              setPage(newPage);
              setPageSize(newPageSize);
            }}
          />
        </div>
      )}

      {/* Print Preview & Export Document Modal */}
      {enablePrintPreview !== false && (
        <PrintPreviewModal
          open={isPrintPreviewOpen}
          onClose={() => setIsPrintPreviewOpen(false)}
          title={title || 'Institutional Records'}
          moduleName={moduleName || 'Academic System'}
          moduleCode={moduleCode || 'MOD-SYS'}
          columns={columns.map((col) => ({
            key: String(col.key || col.name),
            header: col.label || col.header || String(col.key || col.name),
            width: col.width,
          }))}
          data={previewRecords.length > 0 ? previewRecords : filteredData}
        />
      )}
    </div>
  );
}
