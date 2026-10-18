/**
 * Print Preview Overlay Component
 * Displays data tables in a clean, print-optimized institutional document layout
 * before exporting to PDF or dispatching to physical printer.
 */

import React, { useRef } from 'react';
import {
  Modal,
  Button,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Tag,
} from '@carbon/react';
import { Printer, DocumentPdf, Close } from '@carbon/icons-react';
import { exportTableToPdf, PdfColumnDefinition } from '../../core/export/pdfExport';
import { useNotification } from '../../core/notifications/NotificationContext';

export interface PrintPreviewModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  moduleName?: string;
  moduleCode?: string;
  columns: Array<{ key: string; header: string; width?: string }>;
  data: Record<string, any>[];
}

export function PrintPreviewModal({
  open,
  onClose,
  title,
  moduleName = 'Institutional Module',
  moduleCode = 'MOD-SYS',
  columns,
  data,
}: PrintPreviewModalProps) {
  const { notify } = useNotification();
  const printAreaRef = useRef<HTMLDivElement>(null);

  const handleNativePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    notify({
      kind: 'info',
      title: 'Generating PDF',
      subtitle: `Preparing document export for ${data.length} records...`,
      timeout: 3000,
    });

    try {
      const pdfCols: PdfColumnDefinition[] = columns.map((c) => ({
        header: c.header,
        dataKey: c.key,
      }));

      const res = await exportTableToPdf({
        title,
        moduleName,
        moduleCode,
        columns: pdfCols,
        data,
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
        subtitle: err?.message || 'Could not generate PDF document.',
        timeout: 6000,
      });
    }
  };

  const tableHeaders = columns.map((col) => ({
    key: col.key,
    header: col.header,
  }));

  const tableRows = data.map((item, idx) => ({
    id: String(item.id || `row_${idx}`),
    ...item,
  }));

  return (
    <Modal
      open={open}
      onRequestClose={onClose}
      modalHeading="Print & Export Preview"
      primaryButtonText="Export PDF"
      secondaryButtonText="Print (Ctrl+P)"
      onRequestSubmit={handleExportPdf}
      onSecondarySubmit={handleNativePrint}
      size="lg"
      className="print-preview-modal"
    >
      <div
        ref={printAreaRef}
        className="printable-document-area"
        style={{
          backgroundColor: '#ffffff',
          color: '#161616',
          padding: '1.5rem',
          border: '1px solid var(--cds-border-subtle)',
          borderRadius: '2px',
          maxHeight: '60vh',
          overflowY: 'auto',
        }}
      >
        {/* Document Header */}
        <div
          style={{
            borderBottom: '2px solid #0f62fe',
            paddingBottom: '0.75rem',
            marginBottom: '1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#0f62fe', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Schools Systems Enterprise Platform
            </div>
            <h2 style={{ fontSize: '1.375rem', fontWeight: 700, margin: '0.25rem 0', color: '#161616' }}>
              {title}
            </h2>
            <div style={{ fontSize: '0.8125rem', color: '#525252' }}>
              Module: {moduleName} ({moduleCode})
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <Tag size="sm" type="cool-gray">
              {data.length} Records
            </Tag>
            <div style={{ fontSize: '0.75rem', color: '#6f6f6f', marginTop: '0.25rem' }}>
              Date: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable rows={tableRows} headers={tableHeaders}>
          {({ rows, headers, getTableProps, getHeaderProps, getRowProps }) => (
            <Table {...getTableProps()} size="sm" useZebraStyles>
              <TableHead>
                <TableRow>
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
                {rows.map((row) => {
                  const { key, ...rowProps } = getRowProps({ row });
                  return (
                    <TableRow key={key} {...rowProps}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>
                          {cell.value !== null && cell.value !== undefined ? String(cell.value) : '—'}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DataTable>

        {/* Footer */}
        <div
          style={{
            marginTop: '1.5rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#8d8d8d',
          }}
        >
          <span>Official Institutional Document</span>
          <span>Confidential • Internal Distribution Only</span>
        </div>
      </div>
    </Modal>
  );
}
