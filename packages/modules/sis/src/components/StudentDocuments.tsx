/**
 * @schools/module-sis — StudentDocuments Component
 * Displays student document metadata, verification status, and vault management.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer, Tag } from '@carbon/react';
import { useSisStore } from '../db/store';

export const StudentDocumentsComponent: React.FC = () => {
  const { t } = useTranslation();
  const students = useSisStore((state) => state.students);

  const allDocuments = students.flatMap((s) => (s.documents || []).map((d) => ({ ...d, studentName: `${s.firstName} ${s.lastName}`, studentNumber: s.studentNumber })));

  const headers = [
    { key: 'studentNumber', header: 'Student No.' },
    { key: 'studentName', header: 'Student Name' },
    { key: 'fileName', header: 'Document Name' },
    { key: 'category', header: 'Category' },
    { key: 'uploadDate', header: 'Upload Date' },
    { key: 'fileSize', header: 'Size' },
    { key: 'status', header: 'Status' }
  ];

  const rows = allDocuments.map((doc, idx) => ({
    id: `${doc.studentId}-${doc.id}-${idx}`,
    studentNumber: doc.studentNumber,
    studentName: doc.studentName,
    fileName: doc.fileName,
    category: doc.category,
    uploadDate: doc.uploadDate,
    fileSize: doc.fileSize,
    status: doc.status
  }));

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{t('sis.nav.documents', 'Document Metadata & Vault')}</h2>
        <p style={{ color: 'var(--cds-text-secondary)' }}>Verified student document metadata, transcripts, certificates, and ID records</p>
      </div>

      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps }: any) => (
          <TableContainer title="Document Vault Index" description="All verified student documents and transcripts">
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header: any) => (
                    <TableHeader key={header.key} {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row: any) => (
                  <TableRow key={row.id} {...getRowProps({ row })}>
                    <TableCell>{row.cells[0].value}</TableCell>
                    <TableCell><strong>{row.cells[1].value}</strong></TableCell>
                    <TableCell>{row.cells[2].value}</TableCell>
                    <TableCell><Tag type="teal">{row.cells[3].value}</Tag></TableCell>
                    <TableCell>{row.cells[4].value}</TableCell>
                    <TableCell>{row.cells[5].value}</TableCell>
                    <TableCell>
                      <Tag type={row.cells[6].value === 'Verified' ? 'green' : 'purple'}>
                        {row.cells[6].value}
                      </Tag>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};
