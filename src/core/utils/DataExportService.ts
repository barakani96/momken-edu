/**
 * DataExportService
 * Institutional Data Export Engine using SheetJS (xlsx)
 * Generates structured, styled Microsoft Excel (.xlsx) and CSV (.csv) files
 * directly from datasets or active module stores with metadata headers, column widths,
 * formula injection sanitization, and enterprise audit logging.
 */

import { auditLogger } from '../auditLogger';
import { createModuleStore } from '../../stores/useModuleStore';

export interface ExportColumnConfig {
  key: string;
  header: string;
  width?: number;
  transform?: (value: any, row: any) => any;
}

export interface BaseExportOptions {
  title?: string;
  moduleName?: string;
  moduleCode?: string;
  columns?: ExportColumnConfig[];
  data?: Record<string, any>[];
  filename?: string;
  institutionName?: string;
}

export interface ExcelExportOptions extends BaseExportOptions {
  sheetName?: string;
}

export interface CsvExportOptions extends BaseExportOptions {
  delimiter?: string;
}

export interface ModuleStoreExportOptions extends BaseExportOptions {
  moduleId: string;
  entityName: string;
  format?: 'xlsx' | 'csv';
  selectedIds?: (string | number)[];
  filterFn?: (item: any) => boolean;
}

export class DataExportService {
  /**
   * Sanitizes string values to protect against CSV/Excel Formula Injection (CWE-1236)
   */
  public sanitizeCellValue(value: any): any {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    if (typeof value === 'number') {
      return value;
    }
    if (value instanceof Date) {
      return value.toISOString().split('T')[0];
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }

    const str = String(value).trim();
    // Neutralize dangerous formula trigger characters
    if (/^[=+\-@\t\r]/.test(str)) {
      return `'${str}`;
    }
    return str;
  }

  /**
   * Resolves columns automatically if not explicitly provided
   */
  public resolveColumns(data: Record<string, any>[], explicitColumns?: ExportColumnConfig[]): ExportColumnConfig[] {
    if (explicitColumns && explicitColumns.length > 0) {
      return explicitColumns;
    }

    if (!data || data.length === 0) {
      return [{ key: 'id', header: 'ID', width: 15 }];
    }

    // Extract keys from first few rows
    const keys = new Set<string>();
    data.slice(0, 10).forEach((row) => {
      Object.keys(row).forEach((k) => {
        if (!k.startsWith('_') && k !== 'password' && k !== 'secret') {
          keys.add(k);
        }
      });
    });

    return Array.from(keys).map((key) => ({
      key,
      header: key
        .replace(/([A-Z])/g, ' $1')
        .replace(/[_-]/g, ' ')
        .replace(/^./, (str) => str.toUpperCase())
        .trim(),
      width: Math.max(15, key.length + 5),
    }));
  }

  /**
   * Generates and triggers download of a Microsoft Excel (.xlsx) file
   */
  public async exportToExcel(options: ExcelExportOptions): Promise<{ filename: string; blob: Blob }> {
    const XLSX = await import('xlsx');
    const {
      title = 'Data Export Report',
      moduleName = 'Institutional Module',
      moduleCode = 'SYS-01',
      columns: explicitCols,
      data = [],
      filename: customFilename,
      sheetName = 'Data',
      institutionName = 'Schools Systems Enterprise Platform',
    } = options;

    const cols = this.resolveColumns(data, explicitCols);
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const finalFilename = customFilename || `${moduleCode}_${sheetName}_${dateStr}.xlsx`;

    // 1. Build 2D rows (AOA - Array of Arrays)
    const aoa: any[][] = [];

    // Header Banner Rows
    aoa.push([institutionName]);
    aoa.push([`Module: ${moduleName} (${moduleCode})`]);
    aoa.push([`Report: ${title}`]);
    aoa.push([`Generated: ${new Date().toLocaleString('en-US')}`]);
    aoa.push([`Total Records: ${data.length}`]);
    aoa.push([]); // Spacer row

    // Column Headers Row (Index 6)
    const headerRow = cols.map((col) => col.header);
    aoa.push(headerRow);

    // Data Rows
    data.forEach((row) => {
      const dataRow = cols.map((col) => {
        let val = row[col.key];
        if (col.transform) {
          val = col.transform(val, row);
        }
        return this.sanitizeCellValue(val);
      });
      aoa.push(dataRow);
    });

    // 2. Create SheetJS Worksheet & Workbook
    const ws = XLSX.utils.aoa_to_sheet(aoa);

    // Auto-compute column widths
    ws['!cols'] = cols.map((col, idx) => {
      let maxLen = (col.header || '').length;
      data.slice(0, 50).forEach((row) => {
        let v = row[col.key];
        if (col.transform) v = col.transform(v, row);
        const strLen = String(v ?? '').length;
        if (strLen > maxLen) maxLen = strLen;
      });
      return { wch: Math.min(60, Math.max(col.width || 12, maxLen + 4)) };
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31)); // Excel 31 char limit

    // 3. Write binary array and create Blob
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // 4. Trigger browser download
    this.triggerDownload(blob, finalFilename);

    // 5. Enterprise Audit Log
    auditLogger.log({
      type: 'EXPORT',
      action: 'EXPORT_EXCEL',
      moduleId: moduleCode,
      details: {
        title,
        filename: finalFilename,
        recordCount: data.length,
        exportedColumns: cols.map((c) => c.key),
      },
    });

    return { filename: finalFilename, blob };
  }

  /**
   * Generates and triggers download of a CSV (.csv) file with UTF-8 BOM encoding
   */
  public async exportToCsv(options: CsvExportOptions): Promise<{ filename: string; blob: Blob }> {
    const {
      title = 'Data Export',
      moduleName = 'Institutional Module',
      moduleCode = 'SYS-01',
      columns: explicitCols,
      data = [],
      filename: customFilename,
      delimiter = ',',
    } = options;

    const cols = this.resolveColumns(data, explicitCols);
    const dateStr = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const finalFilename = customFilename || `${moduleCode}_${dateStr}.csv`;

    const csvLines: string[] = [];

    // Helper for escaping CSV field values
    const escapeCsvField = (raw: any): string => {
      const sanitized = this.sanitizeCellValue(raw);
      const str = String(sanitized);
      if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Header line
    csvLines.push(cols.map((col) => escapeCsvField(col.header)).join(delimiter));

    // Data lines
    data.forEach((row) => {
      const rowFields = cols.map((col) => {
        let val = row[col.key];
        if (col.transform) {
          val = col.transform(val, row);
        }
        return escapeCsvField(val);
      });
      csvLines.push(rowFields.join(delimiter));
    });

    // Prepend UTF-8 Byte Order Mark (BOM) so Excel opens UTF-8 encoded text correctly
    const csvContent = '\uFEFF' + csvLines.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Trigger download
    this.triggerDownload(blob, finalFilename);

    // Audit log
    auditLogger.log({
      type: 'EXPORT',
      action: 'EXPORT_CSV',
      moduleId: moduleCode,
      details: {
        title,
        filename: finalFilename,
        recordCount: data.length,
        exportedColumns: cols.map((c) => c.key),
      },
    });

    return { filename: finalFilename, blob };
  }

  /**
   * Directly exports records from a Zustand module store
   */
  public async exportFromModuleStore(
    moduleId: string,
    entityName: string,
    format: 'xlsx' | 'csv' = 'xlsx',
    options?: Omit<ModuleStoreExportOptions, 'moduleId' | 'entityName' | 'format'>
  ): Promise<{ filename: string; count: number }> {
    const store = createModuleStore(moduleId);
    const state = store.getState();
    let records = state.getRecords(entityName) || [];

    // Filter by selected IDs if requested
    if (options?.selectedIds && options.selectedIds.length > 0) {
      const idSet = new Set(options.selectedIds.map(String));
      records = records.filter((r: any) => idSet.has(String(r.id)));
    }

    // Apply custom predicate filter if provided
    if (options?.filterFn) {
      records = records.filter(options.filterFn);
    }

    const title = options?.title || `${moduleId.toUpperCase()} ${entityName} Export`;
    const exportConfig: BaseExportOptions = {
      title,
      moduleName: moduleId.toUpperCase(),
      moduleCode: moduleId,
      columns: options?.columns,
      data: records,
      filename: options?.filename,
      institutionName: options?.institutionName,
    };

    let resultFilename = '';
    if (format === 'xlsx') {
      const res = await this.exportToExcel(exportConfig);
      resultFilename = res.filename;
    } else {
      const res = await this.exportToCsv(exportConfig);
      resultFilename = res.filename;
    }

    return { filename: resultFilename, count: records.length };
  }

  /**
   * Triggers a client-side file download for a Blob
   */
  private triggerDownload(blob: Blob, filename: string): void {
    if (typeof window === 'undefined') return;

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    }, 150);
  }
}

export const dataExportService = new DataExportService();
