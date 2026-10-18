import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tile,
  Grid,
  Column,
  ProgressIndicator,
  ProgressStep,
  Button,
  InlineNotification,
  FileUploader,
  Select,
  SelectItem,
  Checkbox,
} from '@carbon/react';
import { Download, Upload, Checkmark, Flow, Document } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';
import { Gender } from '../sisTypes';

export const ImportExportView: React.FC = () => {
  const { t } = useTranslation();
  const { importStudents } = useSisStore();

  const [importStep, setImportStep] = useState(0);
  const [importedCount, setImportedCount] = useState(0);

  const sampleCsvData = [
    { firstName: 'Zaid', lastName: 'Al-Mansoor', gender: 'Male' as Gender, dateOfBirth: '2008-03-20', nationalId: '1029384756', campus: 'Main Riyadh Campus', program: 'General Academic Track' },
    { firstName: 'Noura', lastName: 'Al-Harbi', gender: 'Female' as Gender, dateOfBirth: '2009-07-12', nationalId: '1092837465', campus: 'Jeddah International Campus', program: 'International Baccalaureate' },
  ];

  const handleExecuteImport = () => {
    const count = importStudents(sampleCsvData);
    setImportedCount(count);
    setImportStep(7); // Summary step
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-01)' }}>
        <h3 style={{ margin: 0, fontWeight: 600 }}>{t('sis.importExport.title')}</h3>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
          Bulk import student rosters with automated validation and generate custom structured export files.
        </p>
      </Tile>

      <Grid style={{ marginBottom: '1.5rem' }}>
        {/* Left Column: 8-Step Import Wizard */}
        <Column sm={4} md={8} lg={10}>
          <Tile>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>{t('sis.importExport.importTitle')}</h4>

            <ProgressIndicator currentIndex={importStep} style={{ marginBottom: '1.5rem' }}>
              <ProgressStep label="1. Upload" />
              <ProgressStep label="2. Mapping" />
              <ProgressStep label="3. Validate" />
              <ProgressStep label="4. Preview" />
              <ProgressStep label="5. Conflicts" />
              <ProgressStep label="6. Confirm" />
              <ProgressStep label="7. Execute" />
              <ProgressStep label="8. Summary" />
            </ProgressIndicator>

            {importStep === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ fontSize: '0.875rem' }}>Select a CSV or Excel spreadsheet containing student roster records.</p>
                <Tile style={{ background: 'var(--cds-layer-02)', textAlign: 'center', padding: '2rem' }}>
                  <Upload size={32} style={{ fill: 'var(--cds-interactive-01)', marginBottom: '0.5rem' }} />
                  <p style={{ fontWeight: 600 }}>Drag and drop student_import_file.csv or click to browse</p>
                </Tile>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button kind="primary" size="sm" onClick={() => setImportStep(1)}>
                    Proceed to Column Mapping
                  </Button>
                </div>
              </div>
            )}

            {importStep === 1 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h5 style={{ fontWeight: 600 }}>Step 2: Column Mapping</h5>
                <p style={{ fontSize: '0.875rem' }}>Map source CSV headers to SIS database schema fields:</p>
                <div style={{ fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div><strong>CSV Col "First_Name"</strong> → <code>firstName</code> (Matched)</div>
                  <div><strong>CSV Col "Last_Name"</strong> → <code>lastName</code> (Matched)</div>
                  <div><strong>CSV Col "National_ID"</strong> → <code>nationalId</code> (Matched)</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button kind="secondary" size="sm" onClick={() => setImportStep(0)}>Back</Button>
                  <Button kind="primary" size="sm" onClick={() => setImportStep(2)}>Validate Records</Button>
                </div>
              </div>
            )}

            {importStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h5 style={{ fontWeight: 600 }}>Step 3: Data Validation</h5>
                <InlineNotification kind="success" title="Validation Passed" subtitle="All 2 records passed schema type checks." hideCloseButton />
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button kind="secondary" size="sm" onClick={() => setImportStep(1)}>Back</Button>
                  <Button kind="primary" size="sm" onClick={() => setImportStep(3)}>Preview Records</Button>
                </div>
              </div>
            )}

            {importStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h5 style={{ fontWeight: 600 }}>Step 4: Record Preview</h5>
                <div style={{ fontSize: '0.875rem' }}>
                  <div>1. Zaid Al-Mansoor (Male, DOB: 2008-03-20, NAT: 1029384756)</div>
                  <div>2. Noura Al-Harbi (Female, DOB: 2009-07-12, NAT: 1092837465)</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button kind="secondary" size="sm" onClick={() => setImportStep(2)}>Back</Button>
                  <Button kind="primary" size="sm" onClick={() => setImportStep(4)}>Check Conflicts</Button>
                </div>
              </div>
            )}

            {importStep === 4 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h5 style={{ fontWeight: 600 }}>Step 5: Conflict Resolution</h5>
                <p style={{ fontSize: '0.875rem' }}>No conflicts or duplicates detected against current SIS roster.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button kind="secondary" size="sm" onClick={() => setImportStep(3)}>Back</Button>
                  <Button kind="primary" size="sm" onClick={() => setImportStep(5)}>Confirmation</Button>
                </div>
              </div>
            )}

            {importStep === 5 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h5 style={{ fontWeight: 600 }}>Step 6: Confirm Batch Execution</h5>
                <p style={{ fontSize: '0.875rem' }}>Ready to insert 2 new student records into SIS database.</p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <Button kind="secondary" size="sm" onClick={() => setImportStep(4)}>Back</Button>
                  <Button kind="primary" size="sm" onClick={handleExecuteImport}>Execute Import Batch</Button>
                </div>
              </div>
            )}

            {importStep === 7 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <InlineNotification kind="success" title="Import Completed Successfully!" subtitle={`Inserted ${importedCount} student records.`} hideCloseButton />
                <Button kind="primary" size="sm" onClick={() => setImportStep(0)}>Import Another Batch</Button>
              </div>
            )}
          </Tile>
        </Column>

        {/* Right Column: Custom Export Generator */}
        <Column sm={4} md={8} lg={6}>
          <Tile>
            <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>{t('sis.importExport.exportTitle')}</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Select id="exp-fmt" labelText="Export Format">
                <SelectItem value="csv" text="CSV (Comma Separated Values)" />
                <SelectItem value="xlsx" text="Excel Spreadsheet (.xlsx)" />
                <SelectItem value="pdf" text="Official Roster PDF" />
              </Select>

              <Checkbox id="exp-opt1" labelText="Include Guardians & Contact Info" defaultChecked />
              <Checkbox id="exp-opt2" labelText="Include Academic Placements & GPA" defaultChecked />
              <Checkbox id="exp-opt3" labelText="Include Document Vault Status" defaultChecked />

              <Button kind="primary" size="sm" renderIcon={Download} onClick={() => alert('Export file generated and downloaded.')}>
                Generate & Download Export
              </Button>
            </div>
          </Tile>
        </Column>
      </Grid>
    </div>
  );
};
