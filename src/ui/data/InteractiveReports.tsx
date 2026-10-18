/**
 * InteractiveReports Component
 * Advanced, enterprise-grade reporting engine for Schools Systems built on Carbon Design System v11.
 * Supports multi-column grouping, date-range filtering, aggregate metrics (Sum, Avg, Min, Max),
 * Pivot Table Matrix cross-tabulations, SheetJS Excel/CSV export, and print preview.
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  Tile,
  Button,
  Dropdown,
  Search,
  Tag,
  Accordion,
  AccordionItem,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  DataTableSkeleton,
  InlineNotification,
  ContentSwitcher,
  Switch,
  ProgressBar,
} from '@carbon/react';
import {
  ReportData,
  Download,
  Printer,
  ChevronDown,
  Filter,
  Calendar,
  Grid,
  Catalog,
  Information,
  Table as TableIcon,
  ChartBar,
} from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { dataExportService } from '../../core/utils/DataExportService';
import { useNotification } from '../../core/notifications/NotificationContext';

export interface ReportColumn<T = any> {
  key: string;
  header: string;
  type?: 'text' | 'number' | 'currency' | 'date' | 'select' | 'boolean';
  sortable?: boolean;
  groupable?: boolean;
  aggregatable?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  render?: (row: T, value: any) => React.ReactNode;
}

export interface InteractiveReportsProps<T extends Record<string, any>> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: ReportColumn<T>[];
  dateField?: string;
  defaultGroupBy?: string;
  loading?: boolean;
  resourceName?: string;
  className?: string;
}

export type DateRangePreset =
  | 'all'
  | 'today'
  | 'last7days'
  | 'last30days'
  | 'thisMonth'
  | 'thisQuarter'
  | 'thisAcademicYear'
  | 'custom';

export type ReportViewMode = 'table' | 'pivot' | 'summary';

export function InteractiveReports<T extends Record<string, any>>({
  title,
  subtitle,
  data = [],
  columns,
  dateField,
  defaultGroupBy = 'none',
  loading = false,
  resourceName = 'Report',
  className = '',
}: InteractiveReportsProps<T>) {
  const { t } = useTranslation();
  const { notify } = useNotification();

  // Active View Tab: Table / Pivot Matrix / Visual Summary
  const [viewMode, setViewMode] = useState<ReportViewMode>('table');

  // Search and Grouping State
  const [searchQuery, setSearchQuery] = useState('');
  const [groupBy, setGroupBy] = useState<string>(defaultGroupBy);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Date Range State
  const [datePreset, setDatePreset] = useState<DateRangePreset>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  // Pivot Table Configuration State
  const [pivotRowKey, setPivotRowKey] = useState<string>(() => {
    const firstGroupable = columns.find((c) => c.groupable !== false && c.type !== 'date');
    return firstGroupable ? firstGroupable.key : columns[0]?.key || 'status';
  });

  const [pivotColKey, setPivotColKey] = useState<string>(() => {
    const candidates = columns.filter((c) => c.key !== pivotRowKey && c.type !== 'number' && c.type !== 'currency');
    return candidates.length > 0 ? candidates[0].key : columns[1]?.key || 'status';
  });

  const [pivotMetricKey, setPivotMetricKey] = useState<string>(() => {
    const numCol = columns.find((c) => c.type === 'currency' || c.type === 'number');
    return numCol ? numCol.key : '__count__';
  });

  const [pivotAggType, setPivotAggType] = useState<'sum' | 'avg' | 'count' | 'min' | 'max'>('sum');

  // Identify auto-detected date fields if not specified
  const effectiveDateField = useMemo(() => {
    if (dateField) return dateField;
    const dateCol = columns.find(
      (c) => c.type === 'date' || c.key.toLowerCase().includes('date') || c.key.toLowerCase().includes('enrolled') || c.key.toLowerCase().includes('created')
    );
    return dateCol?.key;
  }, [dateField, columns]);

  // Available groupable columns
  const groupableColumns = useMemo(() => {
    const list = columns.filter((c) => c.groupable !== false && c.type !== 'date' && c.type !== 'currency');
    return [
      { id: 'none', label: '— No Grouping (Flat View) —' },
      ...list.map((c) => ({ id: c.key, label: `Group by: ${c.header}` })),
    ];
  }, [columns]);

  // Available pivot dimensions
  const pivotDimensionItems = useMemo(() => {
    return columns.map((c) => ({ id: c.key, label: c.header }));
  }, [columns]);

  // Available pivot metric targets
  const pivotMetricItems = useMemo(() => {
    const numeric = columns
      .filter((c) => c.type === 'number' || c.type === 'currency' || c.aggregatable)
      .map((c) => ({ id: c.key, label: `${c.header} (${c.type === 'currency' ? '$' : 'Num'})` }));
    return [{ id: '__count__', label: 'Record Count (Frequency)' }, ...numeric];
  }, [columns]);

  // Filter dataset by date range and search query
  const filteredData = useMemo(() => {
    let result = [...data];

    // 1. Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((row) =>
        Object.values(row).some((val) =>
          val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        )
      );
    }

    // 2. Date filtering
    if (effectiveDateField && datePreset !== 'all') {
      const now = new Date();
      let start: Date | null = null;
      let end: Date | null = new Date();

      if (datePreset === 'today') {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (datePreset === 'last7days') {
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (datePreset === 'last30days') {
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      } else if (datePreset === 'thisMonth') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
      } else if (datePreset === 'thisQuarter') {
        const currentQuarterMonth = Math.floor(now.getMonth() / 3) * 3;
        start = new Date(now.getFullYear(), currentQuarterMonth, 1);
      } else if (datePreset === 'thisAcademicYear') {
        const currentYear = now.getFullYear();
        const academicStartYear = now.getMonth() >= 7 ? currentYear : currentYear - 1;
        start = new Date(academicStartYear, 7, 1); // August 1st
        end = new Date(academicStartYear + 1, 6, 31); // July 31st
      } else if (datePreset === 'custom') {
        if (customStartDate) start = new Date(customStartDate);
        if (customEndDate) end = new Date(customEndDate);
      }

      if (start || end) {
        result = result.filter((row) => {
          const rowDateStr = row[effectiveDateField];
          if (!rowDateStr) return true;
          const rowDate = new Date(rowDateStr);
          if (isNaN(rowDate.getTime())) return true;
          if (start && rowDate < start) return false;
          if (end && rowDate > end) return false;
          return true;
        });
      }
    }

    return result;
  }, [data, searchQuery, effectiveDateField, datePreset, customStartDate, customEndDate]);

  // Aggregate KPI Calculations
  const metrics = useMemo(() => {
    const totalRecords = filteredData.length;

    // Numerical and currency columns for totals and averages
    const numericCols = columns.filter((c) => c.type === 'number' || c.type === 'currency' || c.aggregatable);

    const aggregates: Record<string, { sum: number; avg: number; min: number; max: number }> = {};

    numericCols.forEach((col) => {
      let sum = 0;
      let count = 0;
      let min = Infinity;
      let max = -Infinity;

      filteredData.forEach((row) => {
        const val = Number(row[col.key]);
        if (!isNaN(val) && row[col.key] !== null && row[col.key] !== undefined && row[col.key] !== '') {
          sum += val;
          count += 1;
          if (val < min) min = val;
          if (val > max) max = val;
        }
      });

      aggregates[col.key] = {
        sum,
        avg: count > 0 ? sum / count : 0,
        min: count > 0 ? min : 0,
        max: count > 0 ? max : 0,
      };
    });

    return {
      totalRecords,
      aggregates,
    };
  }, [filteredData, columns]);

  // Grouping partitions for table view
  const groupedData = useMemo(() => {
    if (groupBy === 'none' || !groupBy) {
      return { 'All Records': filteredData };
    }

    const groups: Record<string, T[]> = {};
    filteredData.forEach((row) => {
      const rawVal = row[groupBy];
      const key = rawVal !== null && rawVal !== undefined && rawVal !== '' ? String(rawVal) : 'Unassigned';
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(row);
    });

    return groups;
  }, [filteredData, groupBy]);

  const groupKeys = useMemo(() => Object.keys(groupedData), [groupedData]);

  // Pivot Table Matrix Calculation
  const pivotMatrix = useMemo(() => {
    const rowValuesSet = new Set<string>();
    const colValuesSet = new Set<string>();
    const cellData: Record<string, Record<string, number[]>> = {};

    filteredData.forEach((row) => {
      const rRaw = row[pivotRowKey];
      const cRaw = row[pivotColKey];
      const rVal = rRaw !== null && rRaw !== undefined && rRaw !== '' ? String(rRaw) : 'Unassigned';
      const cVal = cRaw !== null && cRaw !== undefined && cRaw !== '' ? String(cRaw) : 'Unassigned';

      rowValuesSet.add(rVal);
      colValuesSet.add(cVal);

      if (!cellData[rVal]) cellData[rVal] = {};
      if (!cellData[rVal][cVal]) cellData[rVal][cVal] = [];

      if (pivotMetricKey === '__count__') {
        cellData[rVal][cVal].push(1);
      } else {
        const num = Number(row[pivotMetricKey]);
        if (!isNaN(num)) {
          cellData[rVal][cVal].push(num);
        }
      }
    });

    const rowLabels = Array.from(rowValuesSet).sort();
    const colLabels = Array.from(colValuesSet).sort();

    const computeAgg = (numbers: number[]): number => {
      if (!numbers || numbers.length === 0) return 0;
      if (pivotMetricKey === '__count__') {
        return numbers.length;
      }
      if (pivotAggType === 'sum') {
        return numbers.reduce((a, b) => a + b, 0);
      }
      if (pivotAggType === 'avg') {
        return numbers.reduce((a, b) => a + b, 0) / numbers.length;
      }
      if (pivotAggType === 'min') {
        return Math.min(...numbers);
      }
      if (pivotAggType === 'max') {
        return Math.max(...numbers);
      }
      return numbers.reduce((a, b) => a + b, 0);
    };

    // Calculate aggregated matrix
    const matrix: Record<string, Record<string, number>> = {};
    const rowTotals: Record<string, number> = {};
    const colTotals: Record<string, number[]> = {};

    rowLabels.forEach((r) => {
      matrix[r] = {};
      const allRowNumbers: number[] = [];
      colLabels.forEach((c) => {
        const nums = cellData[r]?.[c] || [];
        allRowNumbers.push(...nums);
        if (!colTotals[c]) colTotals[c] = [];
        colTotals[c].push(...nums);
        matrix[r][c] = computeAgg(nums);
      });
      rowTotals[r] = computeAgg(allRowNumbers);
    });

    const colTotalsComputed: Record<string, number> = {};
    const allMatrixNumbers: number[] = [];
    colLabels.forEach((c) => {
      const nums = colTotals[c] || [];
      allMatrixNumbers.push(...nums);
      colTotalsComputed[c] = computeAgg(nums);
    });

    const grandTotal = computeAgg(allMatrixNumbers);

    return {
      rowLabels,
      colLabels,
      matrix,
      rowTotals,
      colTotals: colTotalsComputed,
      grandTotal,
    };
  }, [filteredData, pivotRowKey, pivotColKey, pivotMetricKey, pivotAggType]);

  // Bulk expand/collapse all groups
  const toggleAllGroups = useCallback((expand: boolean) => {
    const next: Record<string, boolean> = {};
    groupKeys.forEach((k) => {
      next[k] = expand;
    });
    setExpandedGroups(next);
  }, [groupKeys]);

  // Excel & CSV Exports
  const handleExport = useCallback(
    async (format: 'xlsx' | 'csv') => {
      try {
        const exportCols = columns.map((c) => ({
          key: c.key,
          header: c.header,
          width: c.type === 'currency' ? 14 : 20,
        }));

        if (format === 'xlsx') {
          await dataExportService.exportToExcel({
            data: filteredData,
            columns: exportCols,
            filename: `${resourceName.toLowerCase().replace(/\s+/g, '_')}_report_${new Date().toISOString().split('T')[0]}.xlsx`,
            sheetName: 'Report Summary',
            title: `${title} - Institutional Summary`,
          });
        } else {
          await dataExportService.exportToCsv({
            data: filteredData,
            columns: exportCols,
            filename: `${resourceName.toLowerCase().replace(/\s+/g, '_')}_report_${new Date().toISOString().split('T')[0]}.csv`,
            title: `${title} - Institutional Summary`,
          });
        }

        notify({
          kind: 'success',
          title: 'Export Generated',
          subtitle: `Report successfully downloaded in .${format} format.`,
          timeout: 3000,
        });
      } catch (err: any) {
        notify({
          kind: 'error',
          title: 'Export Failed',
          subtitle: err?.message || 'Could not generate report file.',
          timeout: 5000,
        });
      }
    },
    [filteredData, columns, resourceName, title, notify]
  );

  const handlePrint = () => {
    window.print();
  };

  // Helper renderer for column values
  const renderValue = (row: T, col: ReportColumn<T>) => {
    const val = row[col.key];
    if (col.render) {
      return col.render(row, val);
    }
    if (val === null || val === undefined || val === '') {
      return <span style={{ color: 'var(--cds-text-muted, #8d8d8d)' }}>—</span>;
    }
    if (col.type === 'currency' || (typeof val === 'number' && (col.key.toLowerCase().includes('amount') || col.key.toLowerCase().includes('budget') || col.key.toLowerCase().includes('salary')))) {
      return `$${Number(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    if (col.type === 'boolean') {
      return <Tag type={val ? 'green' : 'gray'} size="sm">{val ? 'Yes' : 'No'}</Tag>;
    }
    if (col.key === 'status') {
      const s = String(val).toLowerCase();
      const tagType = s === 'active' || s === 'paid' || s === 'settled' || s === 'approved' || s === 'available'
        ? 'green'
        : s === 'pending' || s === 'partial' || s === 'trial'
        ? 'blue'
        : s === 'overdue' || s === 'failed' || s === 'rejected' || s === 'inactive'
        ? 'red'
        : 'gray';
      return <Tag type={tagType} size="sm">{String(val)}</Tag>;
    }
    return String(val);
  };

  const isPivotCurrency = useMemo(() => {
    if (pivotMetricKey === '__count__') return false;
    const col = columns.find((c) => c.key === pivotMetricKey);
    return col?.type === 'currency' || pivotMetricKey.toLowerCase().includes('amount') || pivotMetricKey.toLowerCase().includes('budget') || pivotMetricKey.toLowerCase().includes('salary');
  }, [pivotMetricKey, columns]);

  const formatPivotVal = (num: number) => {
    if (pivotMetricKey === '__count__') return num.toLocaleString();
    if (isPivotCurrency) {
      return `$${num.toLocaleString(undefined, { minimumFractionDigits: pivotAggType === 'avg' ? 2 : 0, maximumFractionDigits: 2 })}`;
    }
    return num.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  if (loading) {
    return <DataTableSkeleton columnCount={columns.length} rowCount={8} />;
  }

  return (
    <div
      className={`cds-interactive-reports ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
        color: 'var(--cds-text-primary)',
      }}
    >
      {/* 1. Header Banner & Action Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid var(--cds-border-subtle)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ReportData size={24} style={{ color: 'var(--cds-interactive, #0f62fe)' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>{title}</h2>
          </div>
          {subtitle && (
            <p style={{ margin: '0.25rem 0 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* View Switcher & Export actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <ContentSwitcher
            size="sm"
            selectedIndex={viewMode === 'table' ? 0 : viewMode === 'pivot' ? 1 : 2}
            onChange={(item: any) => {
              const idx = typeof item === 'number' ? item : (item?.index ?? (item?.name === 'pivot' ? 1 : item?.name === 'summary' ? 2 : 0));
              const mode = idx === 1 ? 'pivot' : idx === 2 ? 'summary' : 'table';
              setViewMode(mode);
            }}
          >
            <Switch name="table" text="Grouped Table" onClick={() => setViewMode('table')} />
            <Switch name="pivot" text="Pivot Matrix" onClick={() => setViewMode('pivot')} />
            <Switch name="summary" text="Visual Summary" onClick={() => setViewMode('summary')} />
          </ContentSwitcher>

          <Button
            size="sm"
            kind="ghost"
            renderIcon={Printer}
            onClick={handlePrint}
          >
            Print
          </Button>

          <Button
            size="sm"
            kind="tertiary"
            renderIcon={Download}
            onClick={() => handleExport('csv')}
          >
            CSV
          </Button>

          <Button
            size="sm"
            kind="primary"
            renderIcon={Download}
            onClick={() => handleExport('xlsx')}
          >
            Excel (.xlsx)
          </Button>
        </div>
      </div>

      {/* 2. Top Metric KPI Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
        }}
      >
        <Tile style={{ padding: '1rem', backgroundColor: 'var(--cds-layer-01)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>
            Total Records Analyzed
          </span>
          <div style={{ fontSize: '1.875rem', fontWeight: 700, margin: '0.5rem 0 0.25rem 0' }}>
            {metrics.totalRecords.toLocaleString()}
          </div>
          <span style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>
            {groupBy !== 'none' ? `Partitioned across ${groupKeys.length} categories` : 'Institutional master records'}
          </span>
        </Tile>

        {Object.entries(metrics.aggregates).slice(0, 3).map(([key, agg]) => {
          const col = columns.find((c) => c.key === key);
          const isCurrency = col?.type === 'currency' || key.toLowerCase().includes('amount') || key.toLowerCase().includes('budget') || key.toLowerCase().includes('salary');
          return (
            <Tile key={key} style={{ padding: '1rem', backgroundColor: 'var(--cds-layer-01)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--cds-text-secondary)' }}>
                {col?.header || key} (Total)
              </span>
              <div style={{ fontSize: '1.875rem', fontWeight: 700, margin: '0.5rem 0 0.25rem 0', color: isCurrency ? 'var(--cds-interactive, #0f62fe)' : 'inherit' }}>
                {isCurrency
                  ? `$${agg.sum.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
                  : agg.sum.toLocaleString()}
              </div>
              <span style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>
                Avg: {isCurrency ? `$${agg.avg.toFixed(2)}` : agg.avg.toFixed(2)} | Max: {isCurrency ? `$${agg.max.toLocaleString()}` : agg.max}
              </span>
            </Tile>
          );
        })}
      </div>

      {/* 3. Filter & Grouping Control Toolbar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          padding: '0.75rem 1rem',
          backgroundColor: 'var(--cds-layer-01)',
          border: '1px solid var(--cds-border-subtle)',
          borderRadius: '4px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap', flex: '1 1 300px' }}>
          {/* Search Box */}
          <div style={{ minWidth: '220px', flex: '1 1 220px' }}>
            <Search
              size="sm"
              labelText="Search report data"
              placeholder="Search by keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
            />
          </div>

          {/* Group By Selector (for table view) */}
          {viewMode === 'table' && (
            <div style={{ minWidth: '200px' }}>
              <Dropdown
                id="report-groupby-dropdown"
                size="sm"
                label="Group By Column"
                titleText=""
                hideLabel
                items={groupableColumns}
                itemToString={(item) => item?.label || ''}
                selectedItem={groupableColumns.find((c) => c.id === groupBy) || groupableColumns[0]}
                onChange={({ selectedItem }) => {
                  if (selectedItem) setGroupBy(selectedItem.id);
                }}
              />
            </div>
          )}

          {/* Pivot Controls (for pivot view) */}
          {viewMode === 'pivot' && (
            <>
              <div style={{ minWidth: '160px' }}>
                <Dropdown
                  id="pivot-row-dropdown"
                  size="sm"
                  label="Row Field"
                  titleText=""
                  hideLabel
                  items={pivotDimensionItems}
                  itemToString={(item) => item ? `Row: ${item.label}` : ''}
                  selectedItem={pivotDimensionItems.find((c) => c.id === pivotRowKey) || pivotDimensionItems[0]}
                  onChange={({ selectedItem }) => {
                    if (selectedItem) setPivotRowKey(selectedItem.id);
                  }}
                />
              </div>

              <div style={{ minWidth: '160px' }}>
                <Dropdown
                  id="pivot-col-dropdown"
                  size="sm"
                  label="Column Field"
                  titleText=""
                  hideLabel
                  items={pivotDimensionItems}
                  itemToString={(item) => item ? `Col: ${item.label}` : ''}
                  selectedItem={pivotDimensionItems.find((c) => c.id === pivotColKey) || pivotDimensionItems[1] || pivotDimensionItems[0]}
                  onChange={({ selectedItem }) => {
                    if (selectedItem) setPivotColKey(selectedItem.id);
                  }}
                />
              </div>

              <div style={{ minWidth: '160px' }}>
                <Dropdown
                  id="pivot-metric-dropdown"
                  size="sm"
                  label="Metric"
                  titleText=""
                  hideLabel
                  items={pivotMetricItems}
                  itemToString={(item) => item ? `Metric: ${item.label}` : ''}
                  selectedItem={pivotMetricItems.find((c) => c.id === pivotMetricKey) || pivotMetricItems[0]}
                  onChange={({ selectedItem }) => {
                    if (selectedItem) setPivotMetricKey(selectedItem.id);
                  }}
                />
              </div>

              {pivotMetricKey !== '__count__' && (
                <div style={{ minWidth: '120px' }}>
                  <Dropdown
                    id="pivot-agg-dropdown"
                    size="sm"
                    label="Agg Type"
                    titleText=""
                    hideLabel
                    items={[
                      { id: 'sum', label: 'Sum' },
                      { id: 'avg', label: 'Average' },
                      { id: 'min', label: 'Minimum' },
                      { id: 'max', label: 'Maximum' },
                    ]}
                    itemToString={(item) => item ? `Calc: ${item.label}` : ''}
                    selectedItem={{ id: pivotAggType, label: pivotAggType.toUpperCase() }}
                    onChange={({ selectedItem }) => {
                      if (selectedItem) setPivotAggType(selectedItem.id as any);
                    }}
                  />
                </div>
              )}
            </>
          )}

          {/* Date Filter Preset */}
          {effectiveDateField && (
            <div style={{ minWidth: '180px' }}>
              <Dropdown
                id="report-date-preset-dropdown"
                size="sm"
                label="Date Filter"
                titleText=""
                hideLabel
                items={[
                  { id: 'all', label: 'All Time' },
                  { id: 'today', label: 'Today' },
                  { id: 'last7days', label: 'Last 7 Days' },
                  { id: 'last30days', label: 'Last 30 Days' },
                  { id: 'thisMonth', label: 'This Month' },
                  { id: 'thisQuarter', label: 'This Quarter' },
                  { id: 'thisAcademicYear', label: 'Academic Year 26/27' },
                  { id: 'custom', label: 'Custom Date Range...' },
                ]}
                itemToString={(item) => item?.label || ''}
                selectedItem={{ id: datePreset, label: datePreset }}
                onChange={({ selectedItem }) => {
                  if (selectedItem) setDatePreset(selectedItem.id as DateRangePreset);
                }}
              />
            </div>
          )}
        </div>

        {/* Group Expand/Collapse Helpers (for table view) */}
        {viewMode === 'table' && groupBy !== 'none' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Button size="sm" kind="ghost" onClick={() => toggleAllGroups(true)}>
              Expand All
            </Button>
            <Button size="sm" kind="ghost" onClick={() => toggleAllGroups(false)}>
              Collapse All
            </Button>
          </div>
        )}
      </div>

      {/* Custom Date Range Selector (if selected) */}
      {datePreset === 'custom' && effectiveDateField && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--cds-layer-02)',
            borderRadius: '4px',
            border: '1px solid var(--cds-border-subtle)',
          }}
        >
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Custom Date Range:</span>
          <input
            type="date"
            value={customStartDate}
            onChange={(e) => setCustomStartDate(e.target.value)}
            style={{
              padding: '0.375rem 0.5rem',
              backgroundColor: 'var(--cds-field)',
              color: 'var(--cds-text-primary)',
              border: '1px solid var(--cds-border-strong)',
              borderRadius: '2px',
            }}
          />
          <span>to</span>
          <input
            type="date"
            value={customEndDate}
            onChange={(e) => setCustomEndDate(e.target.value)}
            style={{
              padding: '0.375rem 0.5rem',
              backgroundColor: 'var(--cds-field)',
              color: 'var(--cds-text-primary)',
              border: '1px solid var(--cds-border-strong)',
              borderRadius: '2px',
            }}
          />
        </div>
      )}

      {/* 4. MAIN VIEW CONTENT */}
      {filteredData.length === 0 ? (
        <InlineNotification
          kind="info"
          title="No records match filter"
          subtitle="Try clearing the search query or selecting a broader date range."
          lowContrast
          hideCloseButton
        />
      ) : viewMode === 'pivot' ? (
        /* =================== PIVOT TABLE MATRIX =================== */
        <TableContainer
          title=""
          description={`Cross-tabulated matrix of ${columns.find((c) => c.key === pivotRowKey)?.header || pivotRowKey} (Rows) by ${columns.find((c) => c.key === pivotColKey)?.header || pivotColKey} (Columns)`}
          style={{ backgroundColor: 'var(--cds-layer-01)', border: '1px solid var(--cds-border-subtle)' }}
        >
          <div style={{ overflowX: 'auto' }}>
            <Table size="md" useZebraStyles>
              <TableHead>
                <TableRow>
                  <TableHeader style={{ fontWeight: 700, minWidth: '180px', backgroundColor: 'var(--cds-layer-02)' }}>
                    {columns.find((c) => c.key === pivotRowKey)?.header || pivotRowKey} \ {columns.find((c) => c.key === pivotColKey)?.header || pivotColKey}
                  </TableHeader>
                  {pivotMatrix.colLabels.map((colHeader) => (
                    <TableHeader key={colHeader} style={{ fontWeight: 600, textAlign: 'right', minWidth: '120px' }}>
                      {colHeader}
                    </TableHeader>
                  ))}
                  <TableHeader style={{ fontWeight: 700, textAlign: 'right', minWidth: '130px', backgroundColor: 'var(--cds-layer-02)' }}>
                    Row Total ({pivotMetricKey === '__count__' ? 'Count' : pivotAggType.toUpperCase()})
                  </TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {pivotMatrix.rowLabels.map((r) => (
                  <TableRow key={r}>
                    <TableCell style={{ fontWeight: 600 }}>{r}</TableCell>
                    {pivotMatrix.colLabels.map((c) => {
                      const val = pivotMatrix.matrix[r]?.[c] || 0;
                      return (
                        <TableCell key={c} style={{ textAlign: 'right', fontVariantNumeric: 'tabular-nums' }}>
                          {val > 0 ? (
                            <span style={{ fontWeight: 500 }}>{formatPivotVal(val)}</span>
                          ) : (
                            <span style={{ color: 'var(--cds-text-muted, #8d8d8d)' }}>0</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell style={{ textAlign: 'right', fontWeight: 700, backgroundColor: 'var(--cds-layer-02)', fontVariantNumeric: 'tabular-nums' }}>
                      {formatPivotVal(pivotMatrix.rowTotals[r] || 0)}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Column Totals / Grand Total Summary Row */}
                <TableRow style={{ borderTop: '2px solid var(--cds-border-strong)', backgroundColor: 'var(--cds-layer-02)' }}>
                  <TableCell style={{ fontWeight: 700 }}>Summary Total</TableCell>
                  {pivotMatrix.colLabels.map((c) => (
                    <TableCell key={c} style={{ textAlign: 'right', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                      {formatPivotVal(pivotMatrix.colTotals[c] || 0)}
                    </TableCell>
                  ))}
                  <TableCell style={{ textAlign: 'right', fontWeight: 800, color: 'var(--cds-interactive, #0f62fe)', fontSize: '1rem', fontVariantNumeric: 'tabular-nums' }}>
                    {formatPivotVal(pivotMatrix.grandTotal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </TableContainer>
      ) : viewMode === 'summary' ? (
        /* =================== VISUAL SUMMARY DASHBOARD =================== */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Categorical Distribution Breakdown */}
            <Tile style={{ padding: '1.25rem', backgroundColor: 'var(--cds-layer-01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <ChartBar size={20} style={{ color: 'var(--cds-interactive, #0f62fe)' }} />
                <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Category Distribution ({groupBy !== 'none' ? columns.find((c) => c.key === groupBy)?.header : 'All Items'})</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {groupKeys.slice(0, 8).map((k) => {
                  const count = groupedData[k]?.length || 0;
                  const pct = Math.round((count / (filteredData.length || 1)) * 100);
                  return (
                    <div key={k}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600 }}>{k}</span>
                        <span style={{ color: 'var(--cds-text-secondary)' }}>
                          {count} ({pct}%)
                        </span>
                      </div>
                      <ProgressBar label="" hideLabel value={pct} max={100} size="small" />
                    </div>
                  );
                })}
              </div>
            </Tile>

            {/* Pivot Dimensional Insight Tile */}
            <Tile style={{ padding: '1.25rem', backgroundColor: 'var(--cds-layer-01)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Grid size={20} style={{ color: 'var(--cds-interactive, #0f62fe)' }} />
                <h4 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600 }}>Cross-Tab Top Insights</h4>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {pivotMatrix.rowLabels.slice(0, 5).map((r) => {
                  const total = pivotMatrix.rowTotals[r] || 0;
                  const maxCol = pivotMatrix.colLabels.reduce((prev, curr) => {
                    const prevVal = pivotMatrix.matrix[r]?.[prev] || 0;
                    const currVal = pivotMatrix.matrix[r]?.[curr] || 0;
                    return currVal > prevVal ? curr : prev;
                  }, pivotMatrix.colLabels[0] || '');

                  return (
                    <div
                      key={r}
                      style={{
                        padding: '0.75rem',
                        backgroundColor: 'var(--cds-layer-02)',
                        borderRadius: '4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{r}</div>
                        <div style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)' }}>
                          Top segment: <strong style={{ color: 'var(--cds-text-primary)' }}>{maxCol}</strong> ({formatPivotVal(pivotMatrix.matrix[r]?.[maxCol] || 0)})
                        </div>
                      </div>
                      <Tag type="cyan" size="md">
                        {formatPivotVal(total)}
                      </Tag>
                    </div>
                  );
                })}
              </div>
            </Tile>
          </div>
        </div>
      ) : groupBy === 'none' ? (
        /* =================== FLAT TABLE VIEW =================== */
        <TableContainer title="" style={{ backgroundColor: 'var(--cds-layer-01)', border: '1px solid var(--cds-border-subtle)' }}>
          <Table size="md" useZebraStyles>
            <TableHead>
              <TableRow>
                {columns.map((col) => (
                  <TableHeader key={col.key} style={{ fontWeight: 600 }}>
                    {col.header}
                  </TableHeader>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.map((row, idx) => (
                <TableRow key={row.id ?? idx}>
                  {columns.map((col) => (
                    <TableCell key={col.key}>
                      {renderValue(row, col)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        /* =================== GROUPED ACCORDION VIEW =================== */
        <Accordion size="md">
          {groupKeys.map((groupKey) => {
            const groupRows = groupedData[groupKey];
            const isExpanded = expandedGroups[groupKey] ?? true;

            // Compute sub-aggregates for group
            const groupCurrencySum = groupRows.reduce((acc, r) => {
              const curCol = columns.find((c) => c.type === 'currency' || c.key.toLowerCase().includes('amount') || c.key.toLowerCase().includes('budget') || c.key.toLowerCase().includes('salary'));
              return curCol ? acc + (Number(r[curCol.key]) || 0) : acc;
            }, 0);

            return (
              <AccordionItem
                key={groupKey}
                open={isExpanded}
                onHeadingClick={() =>
                  setExpandedGroups((prev) => ({ ...prev, [groupKey]: !isExpanded }))
                }
                title={
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingRight: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '1rem' }}>{groupKey}</span>
                      <Tag type="cool-gray" size="sm">
                        {groupRows.length} {groupRows.length === 1 ? 'item' : 'items'}
                      </Tag>
                    </div>

                    {groupCurrencySum > 0 && (
                      <span style={{ fontWeight: 600, fontSize: '0.9375rem', color: 'var(--cds-interactive, #0f62fe)' }}>
                        Group Subtotal: ${groupCurrencySum.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    )}
                  </div>
                }
              >
                <div style={{ overflowX: 'auto', margin: '0 -1rem' }}>
                  <Table size="sm" useZebraStyles>
                    <TableHead>
                      <TableRow>
                        {columns.map((col) => (
                          <TableHeader key={col.key} style={{ fontWeight: 600, backgroundColor: 'var(--cds-layer-02)' }}>
                            {col.header}
                          </TableHeader>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {groupRows.map((row, idx) => (
                        <TableRow key={row.id ?? idx}>
                          {columns.map((col) => (
                            <TableCell key={col.key}>
                              {renderValue(row, col)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}
    </div>
  );
}

export default InteractiveReports;
