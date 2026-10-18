/**
 * @schools/module-sis — StudentDirectory
 * Directory component for displaying student records using Carbon DataTable and Search.
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  TableContainer,
  Button,
  Tag,
  Tile,
  Grid,
  Column
} from '@carbon/react';
import { Add, View } from '@carbon/icons-react';
import { useSisStore } from '../db/store';
import { StudentRecord } from '../types';

interface StudentDirectoryProps {
  onSelectStudent: (studentId: string) => void;
  onAddNew: () => void;
}

export const StudentDirectory: React.FC<StudentDirectoryProps> = ({ onSelectStudent, onAddNew }) => {
  const { t } = useTranslation();
  const students = useSisStore((state) => state.students);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(
    (s) =>
      s.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.nationalId.includes(searchTerm)
  );

  const headers = [
    { key: 'studentNumber', header: 'Student Number' },
    { key: 'name', header: 'Full Name' },
    { key: 'gradeLevel', header: 'Grade' },
    { key: 'campus', header: 'Campus' },
    { key: 'gpa', header: 'GPA' },
    { key: 'status', header: 'Status' },
    { key: 'actions', header: 'Actions' }
  ];

  const rows = filteredStudents.map((student) => ({
    id: student.id,
    studentNumber: student.studentNumber,
    name: `${student.firstName} ${student.lastName} ${student.firstNameAr ? `(${student.firstNameAr})` : ''}`,
    gradeLevel: student.gradeLevel,
    campus: student.campus,
    gpa: student.gpa.toFixed(2),
    status: student.status,
    actions: student.id
  }));

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>{t('sis.directory.title', 'Student Directory')}</h2>
        <Button renderIcon={Add} onClick={onAddNew}>
          Register New Student
        </Button>
      </div>

      <Grid className="cds--grid" style={{ padding: 0, marginBottom: '1.5rem' }}>
        <Column sm={4} md={4} lg={4}>
          <Tile style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>{t('sis.directory.totalStudents', 'Total Students')}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.25rem' }}>{students.length}</div>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>{t('sis.directory.activeCount', 'Active Students')}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.25rem' }}>
              {students.filter((s) => s.status === 'active' || s.status === 'enrolled').length}
            </div>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile style={{ padding: '1rem' }}>
            <div style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>{t('sis.directory.averageGpa', 'Average GPA')}</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, marginTop: '0.25rem' }}>
              {students.length > 0
                ? (students.reduce((acc, s) => acc + s.gpa, 0) / students.length).toFixed(2)
                : '0.00'}
            </div>
          </Tile>
        </Column>
      </Grid>

      <DataTable rows={rows} headers={headers}>
        {({ rows, headers, getHeaderProps, getRowProps, getTableProps }: any) => (
          <TableContainer title={t('sis.directory.title', 'Student Directory')} description="Comprehensive directory of registered students">
            <TableToolbar>
              <TableToolbarContent>
                <TableToolbarSearch
                  persistent
                  placeholder={t('sis.directory.searchPlaceholder', 'Search by student name, number, national ID...')}
                  onChange={(e: any) => setSearchTerm(e.target.value)}
                />
              </TableToolbarContent>
            </TableToolbar>
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
                {rows.map((row: any) => {
                  const studentData = filteredStudents.find((s) => s.id === row.id);
                  return (
                    <TableRow key={row.id} {...getRowProps({ row })}>
                      <TableCell>{row.cells[0].value}</TableCell>
                      <TableCell>
                        <strong>{row.cells[1].value}</strong>
                      </TableCell>
                      <TableCell>{row.cells[2].value}</TableCell>
                      <TableCell>{row.cells[3].value}</TableCell>
                      <TableCell>{row.cells[4].value}</TableCell>
                      <TableCell>
                        <Tag type={row.cells[5].value === 'active' ? 'green' : 'blue'}>
                          {row.cells[5].value}
                        </Tag>
                      </TableCell>
                      <TableCell>
                        <Button
                          kind="ghost"
                          size="sm"
                          renderIcon={View}
                          onClick={() => onSelectStudent(row.id)}
                        >
                          View Profile
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};
