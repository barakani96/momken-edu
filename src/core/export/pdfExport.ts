/**
 * Enterprise PDF Export Service
 * Formats and exports data table records into institutional PDF documents
 * with custom branding headers, metadata summary blocks, alternating row colors,
 * page counters, and automated audit logging.
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { auditLogger } from '../auditLogger';

export interface PdfColumnDefinition {
  header: string;
  dataKey: string;
  width?: number;
}

export interface PdfExportOptions {
  title: string;
  moduleName?: string;
  moduleCode?: string;
  columns: PdfColumnDefinition[];
  data: Record<string, any>[];
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  institutionName?: string;
  onStart?: () => void;
  onComplete?: (filename: string) => void;
  onError?: (error: Error) => void;
}

export async function exportTableToPdf(options: PdfExportOptions): Promise<{ success: boolean; filename: string }> {
  const {
    title,
    moduleName = 'Institutional Module',
    moduleCode = 'SYS-01',
    columns,
    data,
    filename: customFilename,
    orientation = 'landscape',
    institutionName = 'Schools Systems Enterprise Platform',
    onStart,
    onComplete,
    onError,
  } = options;

  if (onStart) {
    onStart();
  }

  const generatedDate = new Date();
  const dateStr = generatedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const timeStr = generatedDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const finalFilename = customFilename || `${title.toLowerCase().replace(/\s+/g, '_')}_${generatedDate.toISOString().slice(0, 10)}.pdf`;

  try {
    // 1. Initialize Document
    const doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 2. Institutional Header Banner
    doc.setFillColor(15, 98, 254); // Carbon Blue 60 (#0f62fe)
    doc.rect(0, 0, pageWidth, 16, 'F');

    // Title in Header
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text(institutionName.toUpperCase(), 14, 10.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Official Document • ${moduleCode}`, pageWidth - 14, 10.5, { align: 'right' });

    // 3. Document Title & Meta Information
    doc.setTextColor(22, 22, 22); // Carbon Gray 100 (#161616)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(title, 14, 26);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(105, 112, 119); // Carbon Gray 60

    const metaSummary = `Module: ${moduleName}   |   Exported: ${dateStr} ${timeStr}   |   Total Records: ${data.length}`;
    doc.text(metaSummary, 14, 32);

    // Subtle divider line
    doc.setDrawColor(224, 224, 224);
    doc.setLineWidth(0.4);
    doc.line(14, 35, pageWidth - 14, 35);

    // 4. Format Rows for AutoTable
    const tableBody = data.map((item) =>
      columns.map((col) => {
        const val = item[col.dataKey];
        if (val === null || val === undefined) return '—';
        if (typeof val === 'boolean') return val ? 'Yes' : 'No';
        if (typeof val === 'object') {
          if (Array.isArray(val)) return val.join(', ');
          return JSON.stringify(val);
        }
        return String(val);
      })
    );

    const tableHead = [columns.map((col) => col.header)];

    // 5. Generate Table
    autoTable(doc, {
      head: tableHead,
      body: tableBody,
      startY: 38,
      margin: { left: 14, right: 14, bottom: 20 },
      theme: 'grid',
      headStyles: {
        fillColor: [22, 22, 22], // Carbon dark header
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 9,
        cellPadding: 3,
        halign: 'left',
      },
      bodyStyles: {
        textColor: [57, 57, 57],
        fontSize: 8.5,
        cellPadding: 2.5,
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      styles: {
        overflow: 'linebreak',
        lineColor: [224, 224, 224],
        lineWidth: 0.2,
      },
      didDrawPage: (dataHook) => {
        // Footer on every page
        const currentPage = (doc as any).internal.getNumberOfPages();
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(141, 141, 141);

        // Left footer
        doc.text(
          'Schools Systems • Confidential Institutional Record',
          14,
          pageHeight - 8
        );

        // Right footer (page numbers)
        doc.text(
          `Page ${dataHook.pageNumber}`,
          pageWidth - 14,
          pageHeight - 8,
          { align: 'right' }
        );
      },
    });

    // 6. Save PDF File
    doc.save(finalFilename);

    // 7. Audit Log Entry
    auditLogger.logExport(moduleCode || moduleName, 'PDF', data.length, {
      filename: finalFilename,
      title,
    });

    if (onComplete) {
      onComplete(finalFilename);
    }

    return { success: true, filename: finalFilename };
  } catch (error: any) {
    console.error('[PdfExport] Generation failed:', error);
    if (onError) {
      onError(error);
    }
    throw error;
  }
}
