/**
 * Enterprise Excel (.xlsx) Export Service
 * Formats institutional datasets into native Microsoft Excel (.xlsx) workbooks
 * with metadata banner rows, bold column headers, auto-calculated column widths,
 * and automated audit logging.
 */

import { auditLogger } from '../auditLogger';

export interface ExcelColumnDefinition {
  header: string;
  dataKey: string;
  width?: number;
}

export interface ExcelExportOptions {
  title: string;
  moduleName?: string;
  moduleCode?: string;
  columns: ExcelColumnDefinition[];
  data: Record<string, any>[];
  filename?: string;
  sheetName?: string;
  institutionName?: string;
  onStart?: () => void;
  onComplete?: (filename: string) => void;
  onError?: (error: Error) => void;
}

export async function exportTableToExcel(options: ExcelExportOptions): Promise<{ success: boolean; filename: string }> {
  const XLSX = await import('xlsx');
  const {
    title,
    moduleName = 'Institutional Module',
    moduleCode = 'SYS-01',
    columns,
    data,
    filename: customFilename,
    sheetName = 'Records',
    institutionName = 'Schools Systems Enterprise Platform',
    onStart,
    onComplete,
    onError,
  } = options;

  if (onStart) {
    onStart();
  }

  try {
    const generatedDate = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Create 2D Array of Rows (AOA)
    // 1. Institutional Banner
    const aoa: any[][] = [
      [institutionName],
      [`Module: ${moduleName} (${moduleCode}) | Document: ${title}`],
      [`Generated: ${generatedDate} | Total Records: ${data.length}`],
      [], // Empty spacing row
    ];

    // 2. Table Column Headers
    const headerRow = columns.map((col) => col.header);
    aoa.push(headerRow);

    // 3. Table Data Rows
    for (const record of data) {
      const row = columns.map((col) => {
        const val = record[col.dataKey];
        if (val === null || val === undefined) return '';
        if (typeof val === 'boolean') return val ? 'Yes' : 'No';
        if (typeof val === 'object') return JSON.stringify(val);
        return val;
      });
      aoa.push(row);
    }

    // Convert AOA to Worksheet
    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    // Auto-calculate column widths
    const colWidths = columns.map((col, idx) => {
      let maxLen = col.header.length;
      data.forEach((row) => {
        const cellVal = String(row[col.dataKey] ?? '');
        if (cellVal.length > maxLen) {
          maxLen = Math.min(cellVal.length, 50); // Cap at 50 chars
        }
      });
      return { wch: Math.max(maxLen + 4, 12) };
    });
    worksheet['!cols'] = colWidths;

    // Create Workbook
    const workbook = XLSX.utils.book_new();
    const sanitizedSheetName = sheetName.replace(/[:\\/?*\[\]]/g, '').slice(0, 31) || 'Records';
    XLSX.utils.book_append_sheet(workbook, worksheet, sanitizedSheetName);

    // Generate filename
    const safeModuleName = moduleName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = new Date().toISOString().slice(0, 10);
    const resolvedFilename = customFilename || `${safeModuleName}-export-${timestamp}.xlsx`;

    // Write binary XLSX output
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    // Trigger download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = resolvedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Institutional Audit Log
    auditLogger.log({
      type: 'EXPORT',
      action: 'EXPORT_EXCEL',
      moduleId: moduleCode,
      details: {
        title,
        filename: resolvedFilename,
        recordCount: data.length,
        exportedColumns: columns.map((c) => c.header),
      },
    });

    if (onComplete) {
      onComplete(resolvedFilename);
    }

    return { success: true, filename: resolvedFilename };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    if (onError) {
      onError(err);
    }
    throw err;
  }
}
