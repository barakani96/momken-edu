/**
 * Enterprise CSV Export Service
 * Compliant with RFC 4180 with UTF-8 BOM support, formula injection protection,
 * comprehensive header mapping, and institutional audit logging.
 */

import { auditLogger } from '../auditLogger';

export interface CsvColumnDefinition {
  header: string;
  dataKey: string;
}

export interface CsvExportOptions {
  title: string;
  moduleName?: string;
  moduleCode?: string;
  columns: CsvColumnDefinition[];
  data: Record<string, any>[];
  filename?: string;
  institutionName?: string;
  includeBOM?: boolean;
  onStart?: () => void;
  onComplete?: (filename: string) => void;
  onError?: (error: Error) => void;
}

/**
 * Escapes a cell value according to RFC 4180 rules and mitigates spreadsheet formula injection.
 */
function sanitizeCsvCell(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  let str = String(value);

  // Formula injection defense: If string starts with =, +, -, or @, prepend a single quote
  if (/^[=+\-@]/.test(str)) {
    str = `'${str}`;
  }

  // If cell contains comma, double quote, or newlines, enclose in double quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    str = `"${str.replace(/"/g, '""')}"`;
  }

  return str;
}

export async function exportTableToCsv(options: CsvExportOptions): Promise<{ success: boolean; filename: string }> {
  const {
    title,
    moduleName = 'Institutional Module',
    moduleCode = 'SYS-01',
    columns,
    data,
    filename: customFilename,
    includeBOM = true,
    onStart,
    onComplete,
    onError,
  } = options;

  if (onStart) {
    onStart();
  }

  try {
    const lines: string[] = [];

    // Header row
    const headerLine = columns.map((col) => sanitizeCsvCell(col.header)).join(',');
    lines.push(headerLine);

    // Data rows
    for (const record of data) {
      const rowLine = columns.map((col) => sanitizeCsvCell(record[col.dataKey])).join(',');
      lines.push(rowLine);
    }

    const csvContent = lines.join('\r\n');
    // Prepend UTF-8 BOM (\uFEFF) so Microsoft Excel opens accented and unicode characters correctly
    const blobData = includeBOM ? ['\uFEFF' + csvContent] : [csvContent];
    const blob = new Blob(blobData, { type: 'text/csv;charset=utf-8;' });

    const safeModuleName = moduleName.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = new Date().toISOString().slice(0, 10);
    const resolvedFilename = customFilename || `${safeModuleName}-export-${timestamp}.csv`;

    // Trigger browser download
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = resolvedFilename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Log to institutional audit log
    auditLogger.log({
      type: 'EXPORT',
      action: 'EXPORT_CSV',
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
