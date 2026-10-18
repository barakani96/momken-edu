import React, { useState, useEffect } from 'react';
import { PageLayout } from '../../ui/layout/PageLayout';
import { DataGrid } from '../../ui/data/DataGrid';
import { InteractiveGrid } from '../../ui/data/InteractiveGrid';
import { InteractiveReports } from '../../ui/data/InteractiveReports';
import { EntityCardGrid } from '../../ui/data/EntityCardGrid';
import { DataTable, EditableCell } from '../../components/ui/data';
import { useFilterStore } from '../../core/stores/useFilterStore';
import { dataExportService } from '../../core/utils/DataExportService';
import { EmptyState, ErrorState, LoadingState } from '../../ui/feedback';
import { Tile, Tabs, TabList, Tab, TabPanels, TabPanel, Button, TextInput, Modal, Tag } from '@carbon/react';
import {
  Add,
  CheckmarkOutline,
  ErrorFilled,
  WarningAltFilled,
  Education,
  Catalog,
  Money,
  UserAdmin,
  Book,
  Bookmark,
  ReportData,
} from '@carbon/icons-react';
import { useNotification } from '../../core/notifications/NotificationContext';
import { ModuleRuntimePage, ModuleManifestJSON } from '../../components/dynamic-ui/moduleRuntime';
import {
  sisManifest,
  academicsManifest,
  financeManifest,
  hrManifest,
  libraryManifest,
} from '../modules';

const mockData = [
  { id: '1', name: 'Alice Smith', role: 'Admin', status: 'Active' },
  { id: '2', name: 'Bob Jones', role: 'Editor', status: 'Inactive' },
  { id: '3', name: 'Charlie Brown', role: 'Viewer', status: 'Active' },
];

const mockColumns = [
  { key: 'name', header: 'Full Name' },
  { key: 'role', header: 'Assigned Role' },
  { key: 'status', header: 'Current Status' },
];

// Rich institutional sample dataset for Interactive Reports Showcase
const sampleReportRecords = [
  { id: 'REC-001', studentName: 'Sophia Martinez', gradeLevel: 'Grade 10', department: 'STEM', category: 'Tuition', amount: 4850, date: '2026-09-01', status: 'paid', gpa: 3.85 },
  { id: 'REC-002', studentName: 'Ethan Walker', gradeLevel: 'Grade 11', department: 'Humanities', category: 'Tuition', amount: 4850, date: '2026-09-02', status: 'partial', gpa: 3.42 },
  { id: 'REC-003', studentName: 'Liam Zhang', gradeLevel: 'Grade 9', department: 'STEM', category: 'Lab & Tech Fee', amount: 650, date: '2026-09-03', status: 'paid', gpa: 3.98 },
  { id: 'REC-004', studentName: 'Emma Watson', gradeLevel: 'Grade 12', department: 'Arts', category: 'Tuition', amount: 4850, date: '2026-09-04', status: 'paid', gpa: 3.75 },
  { id: 'REC-005', studentName: 'Noah Davis', gradeLevel: 'Grade 10', department: 'STEM', category: 'Athletics Fee', amount: 400, date: '2026-08-15', status: 'pending', gpa: 3.20 },
  { id: 'REC-006', studentName: 'Ava Johnson', gradeLevel: 'Grade 11', department: 'Humanities', category: 'Tuition', amount: 4850, date: '2026-08-20', status: 'overdue', gpa: 3.65 },
  { id: 'REC-007', studentName: 'Lucas Miller', gradeLevel: 'Grade 9', department: 'STEM', category: 'Library Fee', amount: 150, date: '2026-08-28', status: 'paid', gpa: 3.88 },
  { id: 'REC-008', studentName: 'Mia Wilson', gradeLevel: 'Grade 12', department: 'Arts', category: 'Tuition', amount: 4850, date: '2026-09-08', status: 'paid', gpa: 3.92 },
  { id: 'REC-009', studentName: 'Oliver Taylor', gradeLevel: 'Grade 10', department: 'Humanities', category: 'Lab & Tech Fee', amount: 650, date: '2026-09-10', status: 'paid', gpa: 3.50 },
  { id: 'REC-010', studentName: 'Isabella Anderson', gradeLevel: 'Grade 11', department: 'STEM', category: 'Tuition', amount: 4850, date: '2026-09-11', status: 'paid', gpa: 3.95 },
];

export function Showcase() {
  const { notify } = useNotification();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeModuleId, setActiveModuleId] = useState<'sis' | 'academics' | 'finance' | 'hr' | 'library'>('sis');

  // Interactive EditableCell demonstration state
  const [editableRows, setEditableRows] = useState([
    { id: '1', name: 'Sophia Martinez', gradeLevel: 'Grade 10', gpa: 3.85, status: 'active', tuitionPaid: 4500 },
    { id: '2', name: 'Ethan Walker', gradeLevel: 'Grade 11', gpa: 3.42, status: 'probation', tuitionPaid: 2200 },
    { id: '3', name: 'Liam Zhang', gradeLevel: 'Grade 9', gpa: 3.98, status: 'active', tuitionPaid: 5000 },
    { id: '4', name: 'Emma Watson', gradeLevel: 'Grade 12', gpa: 3.75, status: 'graduated', tuitionPaid: 4800 },
  ]);

  // useFilterStore demonstration
  const { loadPresets, presets, activePresetId, setActivePreset, savePreset } = useFilterStore();
  const showcaseViewKey = 'showcase.students';

  useEffect(() => {
    loadPresets(showcaseViewKey);
  }, [loadPresets]);

  const activePresetsList = presets[showcaseViewKey] || [];
  const currentPresetId = activePresetId[showcaseViewKey];

  const handleUpdateCell = (rowId: string, colKey: string, newVal: any) => {
    setEditableRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, [colKey]: newVal } : r))
    );
    notify({
      kind: 'success',
      title: 'Cell Updated',
      subtitle: `Updated ${colKey} to "${newVal}" on row ${rowId}`,
      timeout: 2500,
    });
  };

  const getModuleManifest = () => {
    switch (activeModuleId) {
      case 'sis':
        return sisManifest;
      case 'academics':
        return academicsManifest;
      case 'finance':
        return financeManifest;
      case 'hr':
        return hrManifest;
      case 'library':
        return libraryManifest;
      default:
        return sisManifest;
    }
  };

  return (
    <PageLayout
      title="UI Showcase & Design System"
      description="Interactive documentation and showcase of all custom Carbon-based UI Primitives and Dynamic Components."
      breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Showcase' }]}
    >
      <Tabs>
        <TabList aria-label="Showcase categories">
          <Tab>Full Module Runtime (5 Blueprints)</Tab>
          <Tab>Interactive Reports Engine</Tab>
          <Tab>Interactive Grid & Bulk Toolbar</Tab>
          <Tab>Data Presentation</Tab>
          <Tab>Feedback States</Tab>
          <Tab>Layout & Structural</Tab>
        </TabList>
        <TabPanels>
          {/* Full Module Runtime (JSON Driven) */}
          <TabPanel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
              {/* Module Switcher Bar */}
              <Tile style={{ padding: '1rem 1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                    Active Module Blueprint (JSON):
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Button
                      size="sm"
                      kind={activeModuleId === 'sis' ? 'primary' : 'secondary'}
                      renderIcon={Education}
                      onClick={() => setActiveModuleId('sis')}
                    >
                      SIS
                    </Button>
                    <Button
                      size="sm"
                      kind={activeModuleId === 'academics' ? 'primary' : 'secondary'}
                      renderIcon={Catalog}
                      onClick={() => setActiveModuleId('academics')}
                    >
                      Academics
                    </Button>
                    <Button
                      size="sm"
                      kind={activeModuleId === 'finance' ? 'primary' : 'secondary'}
                      renderIcon={Money}
                      onClick={() => setActiveModuleId('finance')}
                    >
                      Finance
                    </Button>
                    <Button
                      size="sm"
                      kind={activeModuleId === 'hr' ? 'primary' : 'secondary'}
                      renderIcon={UserAdmin}
                      onClick={() => setActiveModuleId('hr')}
                    >
                      HR & Faculty
                    </Button>
                    <Button
                      size="sm"
                      kind={activeModuleId === 'library' ? 'primary' : 'secondary'}
                      renderIcon={Book}
                      onClick={() => setActiveModuleId('library')}
                    >
                      Library
                    </Button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Tag type="cyan">100% Declarative JSON</Tag>
                  <Tag type="outline">Carbon Design System</Tag>
                </div>
              </Tile>

              {/* Full Module Runtime Container */}
              <ModuleRuntimePage
                key={activeModuleId}
                manifest={getModuleManifest() as unknown as ModuleManifestJSON}
              />
            </div>
          </TabPanel>

          {/* Interactive Reports Engine */}
          <TabPanel>
            <div style={{ marginTop: '1rem' }}>
              <InteractiveReports
                title="Institutional Analytics & Revenue Summary"
                subtitle="Cross-department financial and academic metrics with dynamic grouping, date range filters, and export"
                data={sampleReportRecords}
                defaultGroupBy="category"
                dateField="date"
                resourceName="Institutional_Report"
                columns={[
                  { key: 'id', header: 'Record ID' },
                  { key: 'studentName', header: 'Student Name' },
                  { key: 'gradeLevel', header: 'Grade Level', groupable: true },
                  { key: 'department', header: 'Department', groupable: true },
                  { key: 'category', header: 'Fee Category', groupable: true },
                  { key: 'amount', header: 'Fee Amount', type: 'currency', aggregatable: 'sum' },
                  { key: 'gpa', header: 'GPA', type: 'number', aggregatable: 'avg' },
                  { key: 'date', header: 'Transaction Date', type: 'date' },
                  { key: 'status', header: 'Payment Status', groupable: true },
                ]}
              />
            </div>
          </TabPanel>

          {/* Interactive Grid & Bulk Toolbar */}
          <TabPanel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
              <Tile style={{ padding: '1rem 1.25rem' }}>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
                  Live InteractiveGrid with BulkTransactionBar
                </h3>
                <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                  Double click any cell or press Enter to stage an edit. When cells are modified, a floating sticky <strong>BulkTransactionBar</strong> emerges from the bottom with live staged edit counts, an expandable "Review Edits" audit modal, and one-click batch commit or discard.
                </p>
              </Tile>

              <InteractiveGrid
                title="Student Academic & Tuition Records"
                description="Inline editable grid with validation, batch save, and floating transaction footer."
                data={editableRows}
                columns={[
                  { key: 'id', header: 'Student ID', editable: false },
                  { key: 'name', header: 'Full Name', editable: true, editType: 'text' },
                  {
                    key: 'gradeLevel',
                    header: 'Grade Level',
                    editable: true,
                    editType: 'select',
                    options: [
                      { label: 'Grade 9', value: 'Grade 9' },
                      { label: 'Grade 10', value: 'Grade 10' },
                      { label: 'Grade 11', value: 'Grade 11' },
                      { label: 'Grade 12', value: 'Grade 12' },
                    ],
                  },
                  {
                    key: 'gpa',
                    header: 'Cumulative GPA',
                    editable: true,
                    editType: 'number',
                    validate: (val) => {
                      const n = Number(val);
                      if (isNaN(n) || n < 0 || n > 4.0) return 'GPA must be between 0.0 and 4.0';
                      return null;
                    },
                  },
                  {
                    key: 'status',
                    header: 'Enrollment Status',
                    editable: true,
                    editType: 'select',
                    options: [
                      { label: 'Active', value: 'active' },
                      { label: 'Probation', value: 'probation' },
                      { label: 'Graduated', value: 'graduated' },
                    ],
                  },
                  { key: 'tuitionPaid', header: 'Tuition Paid ($)', editable: true, editType: 'number' },
                ]}
                onSaveBatch={async (modified) => {
                  setEditableRows(modified as typeof editableRows);
                  notify({
                    kind: 'success',
                    title: 'Batch Saved',
                    subtitle: `Committed ${modified.length} records into database.`,
                  });
                }}
              />
            </div>
          </TabPanel>

          {/* Data Presentation */}
          <TabPanel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
              {/* New DataTable Wrapper Component */}
              <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>DataTable Wrapper with Batch Selection & Custom Renderers</h2>
                    <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                      Carbon v11 Table wrapper with multi-item batch selection, Tag badge formatting, custom column renderers, and SheetJS Excel/CSV export.
                    </p>
                  </div>
                  <Tag type="blue">Carbon v11 Common Actions Pattern</Tag>
                </div>

                <DataTable
                  id="showcase-carbon-datatable"
                  title="Enrolled Student Directory"
                  description="Demonstrates batch actions, search, custom Tag renderers, and multi-format export."
                  data={editableRows}
                  columns={[
                    { key: 'name', header: 'Student Name' },
                    { key: 'gradeLevel', header: 'Grade Level' },
                    {
                      key: 'gpa',
                      header: 'Cumulative GPA',
                      renderCell: (val) => (
                        <span style={{ fontWeight: 600, color: val >= 3.8 ? 'var(--cds-support-success)' : 'inherit' }}>
                          {Number(val).toFixed(2)}
                        </span>
                      ),
                    },
                    {
                      key: 'status',
                      header: 'Enrollment Status',
                      renderCell: (val) => {
                        const type = val === 'active' ? 'green' : val === 'probation' ? 'red' : 'purple';
                        return <Tag type={type}>{String(val).toUpperCase()}</Tag>;
                      },
                    },
                    {
                      key: 'tuitionPaid',
                      header: 'Tuition Paid',
                      renderCell: (val) => `$${Number(val).toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
                    },
                  ]}
                  searchable
                  selectable
                  pagination
                  pageSize={5}
                  onBatchDelete={(selected, clear) => {
                    notify({
                      kind: 'info',
                      title: 'Batch Delete Triggered',
                      subtitle: `Deleted ${selected.length} items from view.`,
                    });
                    clear();
                  }}
                  onBatchExport={(selected, format) => {
                    if (format === 'xlsx') {
                      dataExportService.exportToExcel({
                        title: 'Selected Students Export',
                        data: selected,
                      });
                    } else {
                      dataExportService.exportToCsv({
                        title: 'Selected Students Export',
                        data: selected,
                      });
                    }
                  }}
                />
              </section>

              {/* Saved Filter Presets with useFilterStore */}
              <section>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Saved Filter Presets (useFilterStore & IndexedDB)</h2>
                    <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                      Named filter configurations stored in IndexedDB, allowing users to persist custom search, status, and sorting views.
                    </p>
                  </div>
                  <Tag type="purple">IndexedDB Persistent</Tag>
                </div>

                <Tile style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <Bookmark size={16} />
                    <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>Available View Presets:</span>
                    {activePresetsList.map((preset) => {
                      const isSel = preset.id === currentPresetId;
                      return (
                        <Tag
                          key={preset.id}
                          type={isSel ? 'blue' : 'cool-gray'}
                          size="md"
                          style={{ cursor: 'pointer' }}
                          onClick={() => {
                          setActivePreset(showcaseViewKey, preset.id);
                          notify({
                            kind: 'info',
                            title: `Preset Applied: ${preset.name}`,
                            subtitle: `Search: "${preset.searchQuery || 'none'}", Status: "${preset.activeStatus || 'all'}"`,
                          });
                        }}
                      >
                        {preset.name}
                      </Tag>
                    );
                  })}

                  <Button
                    size="sm"
                    kind="ghost"
                    renderIcon={Add}
                    onClick={() => {
                      const name = prompt('Enter a name for this custom filter preset:');
                      if (name) {
                        savePreset(showcaseViewKey, {
                          name,
                          searchQuery: 'Honors',
                          activeStatus: 'active',
                          sortField: 'gpa',
                          sortDir: 'DESC',
                        });
                        notify({
                          kind: 'success',
                          title: 'Preset Saved',
                          subtitle: `Saved preset "${name}" to IndexedDB.`,
                        });
                      }
                    }}
                  >
                    Save Current View
                  </Button>
                  </div>
                </Tile>
              </section>

              {/* DataGrid & EntityCardGrid */}
              <section>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Legacy DataGrid</h2>
                <p style={{ marginBottom: '1rem', color: 'var(--cds-text-secondary)' }}>
                  A wrapper around Carbon's DataTable supporting searching, batch actions, and dynamic rendering.
                </p>
                <DataGrid
                  data={mockData}
                  columns={mockColumns}
                  searchPlaceholder="Search mock data..."
                  onRowClick={(item: any) => console.log('Clicked', item)}
                />
              </section>

              <section>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>EntityCardGrid</h2>
                <p style={{ marginBottom: '1rem', color: 'var(--cds-text-secondary)' }}>
                  A responsive card-based layout for visualizing entities visually, ideal for fluid layouts.
                </p>
                <EntityCardGrid
                  data={mockData}
                  onCardClick={(item: any) => console.log('Card Clicked', item)}
                />
              </section>
            </div>
          </TabPanel>

          {/* Feedback States */}
          <TabPanel>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
              <Tile>
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Empty State</h3>
                <div style={{ position: 'relative', minHeight: '300px', border: '1px dashed var(--cds-border-subtle)' }}>
                  <EmptyState 
                    title="No Records Found" 
                    description="There are currently no items to display in this view."
                    actionText="Create New"
                    onAction={() => alert('Action clicked')}
                  />
                </div>
              </Tile>
              
              <Tile>
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Error State</h3>
                <div style={{ position: 'relative', minHeight: '300px', border: '1px dashed var(--cds-border-subtle)' }}>
                  <ErrorState 
                    title="Failed to Load Data"
                    description="The server responded with a 500 Internal Error."
                    onRetry={() => alert('Retrying...')}
                  />
                </div>
              </Tile>
              
              <Tile>
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem', fontWeight: 600 }}>Loading State</h3>
                <div style={{ position: 'relative', minHeight: '300px', border: '1px dashed var(--cds-border-subtle)' }}>
                  <LoadingState 
                    description="Fetching data from server..."
                  />
                </div>
              </Tile>
            </div>
          </TabPanel>

          {/* Layout & Structural */}
          <TabPanel>
             <Tile>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 600 }}>Page Layout</h2>
                <p style={{ color: 'var(--cds-text-secondary)' }}>
                  You are currently viewing this page inside the <code>PageLayout</code> component, which handles the header, breadcrumbs, and standardized margins automatically based on Carbon grid principles.
                </p>
             </Tile>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </PageLayout>
  );
}

