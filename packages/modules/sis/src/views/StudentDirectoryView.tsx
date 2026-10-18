import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableSelectAll,
  TableSelectRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  TableBatchActions,
  TableBatchAction,
  Button,
  Tag,
  Tile,
  Search,
  Select,
  SelectItem,
  Modal,
  TextInput,
  Pagination,
} from '@carbon/react';
import {
  UserFollow,
  Filter,
  Download,
  Edit,
  TrashCan,
  Grid as GridIcon,
  Table as TableIcon,
  User,
} from '@carbon/icons-react';
import { useSisStore } from '../sisStore';
import { StudentStatus } from '../sisTypes';
import { useBreakpoint } from '@schools/ui';

export const StudentDirectoryView: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isMobile } = useBreakpoint();
  const {
    students,
    selectedStudentIds,
    setSelectedStudentIds,
    setActiveStudentId,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    statusFilter,
    gradeFilter,
    campusFilter,
    setFilters,
    resetFilters,
    bulkStatusChange,
    deleteStudent,
  } = useSisStore();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [userOverrodeView, setUserOverrodeView] = useState(false);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>(() =>
    isMobile ? 'cards' : 'table'
  );
  const [bulkStatusModalOpen, setBulkStatusModalOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<StudentStatus>('active');
  const [statusReason, setStatusReason] = useState('');

  useEffect(() => {
    if (!userOverrodeView) {
      setViewMode(isMobile ? 'cards' : 'table');
    }
  }, [isMobile, userOverrodeView]);

  // Filter students
  const filteredStudents = students.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      s.firstName.toLowerCase().includes(q) ||
      s.lastName.toLowerCase().includes(q) ||
      s.studentNumber.toLowerCase().includes(q) ||
      s.nationalId.toLowerCase().includes(q) ||
      s.campus.toLowerCase().includes(q) ||
      s.program.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;
    const matchesGrade = gradeFilter === 'all' || s.gradeLevel === gradeFilter;
    const matchesCampus = campusFilter === 'all' || s.campus === campusFilter;

    return matchesSearch && matchesStatus && matchesGrade && matchesCampus;
  });

  const paginatedStudents = filteredStudents.slice((page - 1) * pageSize, page * pageSize);

  const headers = [
    { key: 'studentNumber', header: t('sis.table.studentNumber') },
    { key: 'fullName', header: t('sis.table.fullName') },
    { key: 'campus', header: t('sis.table.campus') },
    { key: 'gradeLevel', header: t('sis.table.gradeLevel') },
    { key: 'program', header: t('sis.table.program') },
    { key: 'status', header: t('sis.table.status') },
    { key: 'gpa', header: t('sis.table.gpa') },
    { key: 'actions', header: t('sis.table.actions') },
  ];

  const rows = paginatedStudents.map((s) => ({
    id: s.id,
    studentNumber: s.studentNumber,
    fullName: `${s.firstName} ${s.lastName}`,
    campus: s.campus,
    gradeLevel: s.gradeLevel,
    program: s.program,
    status: s.status,
    gpa: s.gpa ? s.gpa.toFixed(2) : 'N/A',
  }));

  const handleApplyBulkStatus = () => {
    if (selectedStudentIds.length > 0) {
      bulkStatusChange(selectedStudentIds, targetStatus, statusReason || 'Bulk administrative update');
      setBulkStatusModalOpen(false);
      setStatusReason('');
    }
  };

  const getStatusTagType = (status: string) => {
    if (status === 'active' || status === 'enrolled') return 'green';
    if (status === 'applicant') return 'warm-gray';
    if (status === 'graduated') return 'purple';
    if (status === 'withdrawn') return 'red';
    return 'blue';
  };

  const showFilters = !isMobile || isFilterOpen;

  return (
    <div style={{ padding: '0.5rem 0 1rem' }}>
      {/* Mobile-First Control & Filter Bar */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          marginBottom: '1rem',
          background: 'var(--cds-layer-01)',
          border: '1px solid var(--cds-border-subtle-01)',
          padding: '0.75rem 1rem',
        }}
      >
        {/* Top Row: Search (in cards mode), Filter Toggle (on mobile), View Switcher & Count */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          {viewMode === 'cards' && (
            <div style={{ flex: '1 1 14rem', minWidth: '12rem' }}>
              <Search
                id="sis-directory-card-search"
                size="sm"
                labelText={t('sis.searchPlaceholder')}
                placeholder={t('sis.searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                onClear={() => setSearchQuery('')}
              />
            </div>
          )}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginInlineStart: 'auto',
              flexWrap: 'wrap',
            }}
          >
            {isMobile && (
              <Button
                kind={isFilterOpen ? 'secondary' : 'ghost'}
                size="sm"
                renderIcon={Filter}
                onClick={() => setIsFilterOpen((prev) => !prev)}
              >
                {isFilterOpen
                  ? t('portals.mobileNav.hideFilters', 'Hide Filters')
                  : t('portals.mobileNav.filters', 'Filters')}
              </Button>
            )}

            <div
              style={{
                display: 'inline-flex',
                border: '1px solid var(--cds-border-subtle-01)',
                backgroundColor: 'var(--cds-layer-02)',
                padding: '2px',
              }}
            >
              <Button
                kind={viewMode === 'cards' ? 'primary' : 'ghost'}
                size="sm"
                hasIconOnly
                renderIcon={GridIcon}
                iconDescription={t('portals.mobileNav.cardsView', 'Cards')}
                onClick={() => {
                  setUserOverrodeView(true);
                  setViewMode('cards');
                }}
              />
              <Button
                kind={viewMode === 'table' ? 'primary' : 'ghost'}
                size="sm"
                hasIconOnly
                renderIcon={TableIcon}
                iconDescription={t('portals.mobileNav.tableView', 'Table')}
                onClick={() => {
                  setUserOverrodeView(true);
                  setViewMode('table');
                }}
              />
            </div>

            <span
              style={{
                fontSize: '0.8125rem',
                color: 'var(--cds-text-secondary)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {filteredStudents.length} / {students.length}
            </span>
          </div>
        </div>

        {/* Collapsible / Responsive Filter Controls */}
        {showFilters && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(160px, 1fr))',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <Select
              id="status-filter"
              labelText=""
              hideLabel
              size="sm"
              value={statusFilter}
              onChange={(e) => setFilters({ status: e.target.value })}
            >
              <SelectItem value="all" text="All Statuses" />
              <SelectItem value="active" text="Active" />
              <SelectItem value="enrolled" text="Enrolled" />
              <SelectItem value="applicant" text="Applicant" />
              <SelectItem value="admitted" text="Admitted" />
              <SelectItem value="graduated" text="Graduated" />
              <SelectItem value="withdrawn" text="Withdrawn" />
            </Select>

            <Select
              id="grade-filter"
              labelText=""
              hideLabel
              size="sm"
              value={gradeFilter}
              onChange={(e) => setFilters({ grade: e.target.value })}
            >
              <SelectItem value="all" text="All Grades" />
              <SelectItem value="Grade 9" text="Grade 9" />
              <SelectItem value="Grade 10" text="Grade 10" />
              <SelectItem value="Grade 11" text="Grade 11" />
              <SelectItem value="Grade 12" text="Grade 12" />
            </Select>

            <Select
              id="campus-filter"
              labelText=""
              hideLabel
              size="sm"
              value={campusFilter}
              onChange={(e) => setFilters({ campus: e.target.value })}
            >
              <SelectItem value="all" text="All Campuses" />
              <SelectItem value="Main Riyadh Campus" text="Main Riyadh Campus" />
              <SelectItem value="Jeddah International Campus" text="Jeddah International Campus" />
              <SelectItem value="Dammam Academy" text="Dammam Academy" />
            </Select>

            <Button
              kind="ghost"
              size="sm"
              onClick={resetFilters}
              style={{ width: isMobile ? '100%' : 'auto', justifyContent: 'center' }}
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* View Mode 1: Mobile-First Responsive Student Cards */}
      {viewMode === 'cards' ? (
        <div>
          <div className="cds-grid-responsive" style={{ marginBottom: '1rem' }}>
            {paginatedStudents.map((s) => (
              <Tile
                key={s.id}
                style={{
                  border: '1px solid var(--cds-border-subtle-01)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '0.75rem',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div
                        style={{
                          width: '2.5rem',
                          height: '2.5rem',
                          borderRadius: '50%',
                          backgroundColor: 'var(--cds-interactive-01, #0f62fe)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '0.875rem',
                          flexShrink: 0,
                        }}
                      >
                        {s.firstName[0]}
                        {s.lastName[0]}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--cds-text-primary)' }}>
                          {s.firstName} {s.lastName}
                        </div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--cds-text-secondary)',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {s.studentNumber}
                        </div>
                      </div>
                    </div>

                    <Tag type={getStatusTagType(s.status)} size="sm">
                      {s.status.toUpperCase()}
                    </Tag>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '0.375rem 0.75rem',
                      fontSize: '0.8125rem',
                      color: 'var(--cds-text-secondary)',
                      padding: '0.5rem 0',
                      borderTop: '1px solid var(--cds-border-subtle-01)',
                      borderBottom: '1px solid var(--cds-border-subtle-01)',
                    }}
                  >
                    <div>
                      <strong>{t('sis.table.gradeLevel')}:</strong> {s.gradeLevel} ({s.classSection})
                    </div>
                    <div style={{ fontVariantNumeric: 'tabular-nums' }}>
                      <strong>{t('sis.table.gpa')}:</strong> {s.gpa ? s.gpa.toFixed(2) : 'N/A'}
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>{t('sis.table.campus')}:</strong> {s.campus}
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <strong>{t('sis.table.program')}:</strong> {s.program}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Button
                    kind="primary"
                    size="sm"
                    renderIcon={User}
                    onClick={() => {
                      setActiveStudentId(s.id);
                      setActiveTab('profile');
                      navigate('/sis/profile');
                    }}
                    style={{ flex: 1, maxWidth: '100%', minHeight: '2.5rem' }}
                  >
                    {t('portals.sis.profileBtn', '360° Profile')}
                  </Button>
                  <Button
                    kind="ghost"
                    className="cds--btn--danger--ghost"
                    size="sm"
                    iconDescription="Delete Student"
                    hasIconOnly
                    renderIcon={TrashCan}
                    onClick={() => deleteStudent(s.id)}
                  />
                </div>
              </Tile>
            ))}
          </div>

          <Pagination
            totalItems={filteredStudents.length}
            pageSize={pageSize}
            pageSizes={[5, 10, 20, 50]}
            page={page}
            onChange={({ page, pageSize }) => {
              setPage(page);
              setPageSize(pageSize);
            }}
          />
        </div>
      ) : (
        /* View Mode 2: Carbon Data Table */
        <div className="data-grid-table-wrapper">
          <DataTable rows={rows} headers={headers}>
            {({
              rows,
              headers,
              getHeaderProps,
              getRowProps,
              getSelectionProps,
              getBatchActionProps,
              selectedRows,
            }) => {
              const batchActionProps = getBatchActionProps();

              return (
                <TableContainer title={t('sis.nav.directory')}>
                  <TableToolbar>
                    <TableBatchActions {...batchActionProps}>
                      <TableBatchAction
                        renderIcon={Edit}
                        onClick={() => {
                          const ids = selectedRows.map((r) => r.id);
                          setSelectedStudentIds(ids);
                          setBulkStatusModalOpen(true);
                        }}
                      >
                        Bulk Change Status
                      </TableBatchAction>
                      <TableBatchAction
                        renderIcon={Download}
                        onClick={() => {
                          const ids = selectedRows.map((r) => r.id);
                          setSelectedStudentIds(ids);
                        }}
                      >
                        Export Selected ({selectedRows.length})
                      </TableBatchAction>
                    </TableBatchActions>

                    <TableToolbarContent>
                      <TableToolbarSearch
                        placeholder={t('sis.searchPlaceholder')}
                        onChange={(e: any) => {
                          if (e && e.target) setSearchQuery(e.target.value);
                        }}
                      />
                      <Button
                        kind="primary"
                        size="sm"
                        renderIcon={UserFollow}
                        onClick={() => {
                          setActiveTab('registration');
                          navigate('/sis/registration');
                        }}
                      >
                        {t('sis.registerStudent')}
                      </Button>
                    </TableToolbarContent>
                  </TableToolbar>

                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableSelectAll {...getSelectionProps()} />
                        {headers.map((header) => {
                          const { key, ...headerProps } = getHeaderProps({ header });
                          return (
                            <TableHeader key={header.key || key} {...headerProps}>
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
                          <TableRow key={row.id || key} {...rowProps}>
                            <TableSelectRow {...getSelectionProps({ row })} />
                            <TableCell>
                              <span style={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                                {row.cells[0].value}
                              </span>
                            </TableCell>
                            <TableCell>{row.cells[1].value}</TableCell>
                            <TableCell>{row.cells[2].value}</TableCell>
                            <TableCell>{row.cells[3].value}</TableCell>
                            <TableCell>{row.cells[4].value}</TableCell>
                            <TableCell>
                              <Tag type={getStatusTagType(row.cells[5].value as string)}>
                                {(row.cells[5].value as string).toUpperCase()}
                              </Tag>
                            </TableCell>
                            <TableCell style={{ fontVariantNumeric: 'tabular-nums' }}>
                              {row.cells[6].value}
                            </TableCell>
                            <TableCell>
                              <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <Button
                                  kind="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setActiveStudentId(row.id);
                                    setActiveTab('profile');
                                    navigate('/sis/profile');
                                  }}
                                >
                                  Profile
                                </Button>
                                <Button
                                  kind="ghost"
                                  className="cds--btn--danger--ghost"
                                  size="sm"
                                  iconDescription="Delete Student"
                                  hasIconOnly
                                  renderIcon={TrashCan}
                                  onClick={() => deleteStudent(row.id)}
                                />
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>

                  <Pagination
                    totalItems={filteredStudents.length}
                    pageSize={pageSize}
                    pageSizes={[5, 10, 20, 50]}
                    page={page}
                    onChange={({ page, pageSize }) => {
                      setPage(page);
                      setPageSize(pageSize);
                    }}
                  />
                </TableContainer>
              );
            }}
          </DataTable>
        </div>
      )}

      {/* Bulk Status Change Modal */}
      <Modal
        open={bulkStatusModalOpen}
        modalHeading="Bulk Update Student Lifecycle Status"
        primaryButtonText="Apply Status Change"
        secondaryButtonText="Cancel"
        onRequestClose={() => setBulkStatusModalOpen(false)}
        onRequestSubmit={handleApplyBulkStatus}
      >
        <p style={{ marginBottom: '1rem', color: 'var(--cds-text-secondary)' }}>
          You are updating status for {selectedStudentIds.length} selected student records.
        </p>

        <Select
          id="target-status"
          labelText="Select New Target Status *"
          value={targetStatus}
          onChange={(e) => setTargetStatus(e.target.value as StudentStatus)}
          style={{ marginBottom: '1rem' }}
        >
          <SelectItem value="active" text="Active" />
          <SelectItem value="enrolled" text="Enrolled" />
          <SelectItem value="admitted" text="Admitted" />
          <SelectItem value="applicant" text="Applicant" />
          <SelectItem value="graduated" text="Graduated" />
          <SelectItem value="withdrawn" text="Withdrawn" />
        </Select>

        <TextInput
          id="status-reason"
          labelText="Reason / Administrative Note"
          placeholder="e.g. Mass term promotion or administrative review clearance"
          value={statusReason}
          onChange={(e) => setStatusReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};
