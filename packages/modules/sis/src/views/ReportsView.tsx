import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tile,
  Grid,
  Column,
  Button,
  Tag,
  Select,
  SelectItem,
  ClickableTile,
} from '@carbon/react';
import { Download, ChartBar, Document, Group } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';

export const ReportsView: React.FC = () => {
  const { t } = useTranslation();
  const { students } = useSisStore();

  const [activeReport, setActiveReport] = useState<'census' | 'capacity' | 'mobility' | 'quality'>('census');

  const reportCatalog = [
    { key: 'census', title: t('sis.reports.censusReport'), desc: 'Demographics, gender ratio, age distribution, and national ID breakdown.' },
    { key: 'capacity', title: t('sis.reports.enrollmentReport'), desc: 'Term capacity, section utilization, and program enrollment totals.' },
    { key: 'mobility', title: t('sis.reports.transfersReport'), desc: 'Inter-campus transfers, external transfers, and withdrawal reasons.' },
    { key: 'quality', title: t('sis.reports.qualityReport'), desc: 'Missing guardians, unverified documents, and incomplete addresses.' },
  ];

  return (
    <div style={{ padding: '1rem 0' }}>
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-01)' }}>
        <h3 style={{ margin: 0, fontWeight: 600 }}>{t('sis.reports.title')}</h3>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
          Comprehensive institutional reporting catalog and data quality auditing.
        </p>
      </Tile>

      <Grid style={{ marginBottom: '1.5rem' }}>
        {reportCatalog.map((rep) => (
          <Column key={rep.key} sm={4} md={4} lg={4}>
            <ClickableTile
              onClick={() => setActiveReport(rep.key as any)}
              style={{
                height: '100%',
                background: activeReport === rep.key ? 'var(--cds-layer-02)' : 'var(--cds-layer-01)',
                borderLeft: activeReport === rep.key ? '4px solid var(--cds-interactive-01)' : 'none',
              }}
            >
              <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.5rem' }}>{rep.title}</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>{rep.desc}</p>
            </ClickableTile>
          </Column>
        ))}
      </Grid>

      {/* Selected Report Output Preview */}
      <Tile style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, fontWeight: 600 }}>
            Report Output Preview: {reportCatalog.find((r) => r.key === activeReport)?.title}
          </h4>
          <Button kind="primary" size="sm" renderIcon={Download} onClick={() => alert('Downloading official report PDF.')}>
            {t('sis.reports.generateBtn')}
          </Button>
        </div>

        {activeReport === 'census' && (
          <div style={{ fontSize: '0.875rem' }}>
            <p style={{ marginBottom: '0.5rem' }}>Total Student Population: <strong>{students.length}</strong></p>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--cds-border-subtle-01)' }}>
                  <th style={{ padding: '0.5rem' }}>Campus</th>
                  <th style={{ padding: '0.5rem' }}>Grade 9</th>
                  <th style={{ padding: '0.5rem' }}>Grade 10</th>
                  <th style={{ padding: '0.5rem' }}>Grade 11</th>
                  <th style={{ padding: '0.5rem' }}>Grade 12</th>
                  <th style={{ padding: '0.5rem' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--cds-border-subtle-01)' }}>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>Main Riyadh Campus</td>
                  <td style={{ padding: '0.5rem' }}>{students.filter((s) => s.campus === 'Main Riyadh Campus' && s.gradeLevel === 'Grade 9').length}</td>
                  <td style={{ padding: '0.5rem' }}>{students.filter((s) => s.campus === 'Main Riyadh Campus' && s.gradeLevel === 'Grade 10').length}</td>
                  <td style={{ padding: '0.5rem' }}>{students.filter((s) => s.campus === 'Main Riyadh Campus' && s.gradeLevel === 'Grade 11').length}</td>
                  <td style={{ padding: '0.5rem' }}>{students.filter((s) => s.campus === 'Main Riyadh Campus' && s.gradeLevel === 'Grade 12').length}</td>
                  <td style={{ padding: '0.5rem', fontWeight: 600 }}>{students.filter((s) => s.campus === 'Main Riyadh Campus').length}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeReport === 'quality' && (
          <div style={{ fontSize: '0.875rem' }}>
            <p style={{ marginBottom: '1rem', color: 'var(--cds-support-01)' }}>
              Data Quality Audit Summary: High integrity score (94.2%) across mandatory fields.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div>• Students with Unverified Documents: <strong>{students.filter((s) => s.documents.some((d) => d.status === 'Pending')).length}</strong></div>
              <div>• Students Missing Primary Guardians: <strong>{students.filter((s) => s.guardians.length === 0).length}</strong></div>
              <div>• Students Missing National ID: <strong>{students.filter((s) => !s.nationalId).length}</strong></div>
            </div>
          </div>
        )}
      </Tile>
    </div>
  );
};
