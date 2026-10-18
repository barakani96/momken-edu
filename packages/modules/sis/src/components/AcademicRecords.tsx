/**
 * @schools/module-sis — AcademicRecords Component
 * Displays system-wide academic records, GPA distribution, and course performance metrics.
 */

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tile, Grid, Column, DataTable, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, TableContainer, Tag } from '@carbon/react';
import { useSisStore } from '../db/store';

export const AcademicRecordsComponent: React.FC = () => {
  const { t } = useTranslation();
  const students = useSisStore((state) => state.students);

  const allRecords = students.flatMap((s) => (s.academicRecords || []).map((r) => ({ ...r, studentId: s.id, studentName: `${s.firstName} ${s.lastName}`, studentNumber: s.studentNumber })));

  const headers = [
    { key: 'studentNumber', header: 'Student No.' },
    { key: 'studentName', header: 'Student Name' },
    { key: 'code', header: 'Course Code' },
    { key: 'nameEn', header: 'Course Name' },
    { key: 'term', header: 'Term' },
    { key: 'grade', header: 'Grade' },
    { key: 'totalScore', header: 'Score (%)' },
    { key: 'status', header: 'Status' }
  ];

  const rows = allRecords.map((rec, idx) => ({
    id: `${rec.studentId}-${rec.code}-${idx}`,
    studentNumber: rec.studentNumber,
    studentName: rec.studentName,
    code: rec.code,
    nameEn: rec.nameEn,
    term: rec.term,
    grade: rec.grade,
    totalScore: `${rec.totalScore}%`,
    status: rec.status
  }));

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{t('sis.nav.academics', 'Academic Records')}</h2>
        <p style={{ color: 'var(--cds-text-secondary)' }}>System-wide academic performance, course grades, and term scores</p>
      </div>

      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps }: any) => (
          <TableContainer title="Academic Transcripts & Grades" description="All student course grades across terms">
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
                    <TableCell>{row.cells[3].value}</TableCell>
                    <TableCell>{row.cells[4].value}</TableCell>
                    <TableCell><Tag type="cyan">{row.cells[5].value}</Tag></TableCell>
                    <TableCell>{row.cells[6].value}</TableCell>
                    <TableCell>
                      <Tag type={row.cells[7].value === 'Completed' ? 'green' : 'blue'}>
                        {row.cells[7].value}
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
