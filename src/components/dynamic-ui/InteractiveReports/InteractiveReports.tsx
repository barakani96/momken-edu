import React, { useState, useEffect, useMemo } from 'react';
import {
  Grid,
  Column,
  Tile,
  Select,
  SelectItem,
  Button,
  Tag,
  ProgressBar,
  DataTable,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import {
  Export,
  Printer,
  Renew,
  ChartLine,
  Report,
  Analytics,
} from '@carbon/icons-react';
import { useTranslation } from 'react-i18next';
import { getResource, hasResource } from '../registry';
import { ResourceDefinition } from '../types';

export interface InteractiveReportsProps {
  resource: string;
  resourceDef?: ResourceDefinition<any>;
  className?: string;
}

export function InteractiveReports({
  resource: resourceName,
  resourceDef: propResourceDef,
  className = '',
}: InteractiveReportsProps) {
  const { t } = useTranslation();

  const resourceDef = useMemo(() => {
    if (propResourceDef) return propResourceDef;
    if (hasResource(resourceName)) return getResource(resourceName);
    return null;
  }, [propResourceDef, resourceName]);

  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [groupByField, setGroupByField] = useState<string>('status');
  const [filterPeriod, setFilterPeriod] = useState<string>('all');

  const loadReportData = async () => {
    if (!resourceDef?.dataProvider) return;
    setIsLoading(true);
    try {
      const res = await resourceDef.dataProvider.list({
        pagination: { page: 1, perPage: 500 },
      });
      setData(res.data || []);
    } catch (err) {
      console.error('Failed to load report data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReportData();
  }, [resourceDef]);

  // Derive groupable fields from columns
  const groupableFields = useMemo(() => {
    if (!resourceDef) return [{ field: 'status', label: 'Status' }];
    const fields = resourceDef.columns
      .filter((c) => (c.key || c.name) !== 'id')
      .map((c) => ({
        field: (c.key || c.name) as string,
        label: c.label || c.header || String(c.key || c.name),
      }));
    return fields.length > 0 ? fields : [{ field: 'status', label: 'Status' }];
  }, [resourceDef]);

  // Aggregation breakdown
  const aggregatedStats = useMemo(() => {
    if (!data.length) return [];
    const counts: Record<string, number> = {};
    data.forEach((item) => {
      const rawVal = item[groupByField] ?? item.status ?? (item.active !== undefined ? (item.active ? 'Active' : 'Inactive') : 'Unassigned');
      const valStr = String(rawVal);
      counts[valStr] = (counts[valStr] || 0) + 1;
    });

    const total = data.length;
    return Object.entries(counts).map(([label, count]) => ({
      label,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    })).sort((a, b) => b.count - a.count);
  }, [data, groupByField]);

  // Export to CSV
  const handleExportCSV = () => {
    if (!data.length) return;
    const keys = Object.keys(data[0]);
    const csvContent = [
      keys.join(','),
      ...data.map((row) =>
        keys.map((k) => `"${String(row[k] ?? '').replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${resourceName}-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resourceLabel = resourceDef?.label || resourceName;
  const resourceLabelPlural = resourceDef?.labelPlural || `${resourceLabel}s`;

  return (
    <div
      className={`interactive-reports-root cds-flex cds-flex-col ${className}`}
      style={{
        backgroundColor: 'var(--cds-layer-01)',
        border: '1px solid var(--cds-border-subtle)',
        borderRadius: '2px',
        overflow: 'hidden',
      }}
    >
      {/* Top Controls Toolbar */}
      <div
        className="reports-toolbar cds-flex cds-items-center cds-justify-between cds-gap-03 cds-flex-wrap"
        style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--cds-border-subtle)',
          backgroundColor: 'var(--cds-layer-01)',
        }}
      >
        <div className="cds-flex cds-items-center cds-gap-03 cds-flex-wrap" style={{ flex: '1 1 20rem' }}>
          <div style={{ width: '14rem' }}>
            <Select
              id="report-group-by"
              labelText="Group Report By"
              size="sm"
              value={groupByField}
              onChange={(e) => setGroupByField(e.target.value)}
            >
              {groupableFields.map((f, i) => (
                <React.Fragment key={f.field || i}>
                  <SelectItem value={f.field} text={f.label} />
                </React.Fragment>
              ))}
            </Select>
          </div>

          <div style={{ width: '12rem' }}>
            <Select
              id="report-period"
              labelText="Reporting Window"
              size="sm"
              value={filterPeriod}
              onChange={(e) => setFilterPeriod(e.target.value)}
            >
              <SelectItem value="all" text="All Time (Lifetime)" />
              <SelectItem value="this-month" text="Current Month" />
              <SelectItem value="last-quarter" text="Last Quarter" />
              <SelectItem value="this-year" text="Current Academic Year" />
            </Select>
          </div>
        </div>

        <div className="cds-flex cds-items-center cds-gap-02">
          <Button
            renderIcon={Renew}
            kind="ghost"
            size="sm"
            disabled={isLoading}
            onClick={loadReportData}
          >
            Refresh
          </Button>

          <Button
            renderIcon={Printer}
            kind="ghost"
            size="sm"
            onClick={() => window.print()}
          >
            Print
          </Button>

          <Button
            renderIcon={Export}
            kind="primary"
            size="sm"
            disabled={!data.length}
            onClick={handleExportCSV}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* Report KPI Summary Tiles */}
      <div style={{ padding: '1.25rem 1.25rem 0' }}>
        <Grid style={{ padding: 0, margin: 0 }}>
          <Column sm={4} md={4} lg={4} style={{ marginBottom: '1rem' }}>
            <Tile style={{ backgroundColor: 'var(--cds-layer-02)', border: '1px solid var(--cds-border-subtle)', padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', textTransform: 'uppercase' }}>
                Total Analyzed Records
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 400, color: 'var(--cds-text-primary)', marginTop: '0.25rem' }}>
                {data.length}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)' }}>Across active data provider</span>
            </Tile>
          </Column>

          <Column sm={4} md={4} lg={4} style={{ marginBottom: '1rem' }}>
            <Tile style={{ backgroundColor: 'var(--cds-layer-02)', border: '1px solid var(--cds-border-subtle)', padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', textTransform: 'uppercase' }}>
                Group Categories
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 400, color: 'var(--cds-text-primary)', marginTop: '0.25rem' }}>
                {aggregatedStats.length}
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)' }}>Distinct values for {groupByField}</span>
            </Tile>
          </Column>

          <Column sm={4} md={4} lg={4} style={{ marginBottom: '1rem' }}>
            <Tile style={{ backgroundColor: 'var(--cds-layer-02)', border: '1px solid var(--cds-border-subtle)', padding: '1rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--cds-text-secondary)', textTransform: 'uppercase' }}>
                Primary Majority
              </span>
              <div style={{ fontSize: '1.75rem', fontWeight: 400, color: 'var(--cds-text-primary)', marginTop: '0.25rem' }}>
                {aggregatedStats[0]?.percentage || 0}%
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)' }}>
                {aggregatedStats[0]?.label || 'None'} ({aggregatedStats[0]?.count || 0} records)
              </span>
            </Tile>
          </Column>
        </Grid>
      </div>

      {/* Aggregate Distribution Breakdown & Table */}
      <div style={{ padding: '0.5rem 1.25rem 1.5rem' }}>
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 600, color: 'var(--cds-text-primary)', marginBottom: '0.75rem' }}>
          Distribution Breakdown by {groupByField.toUpperCase()}
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {aggregatedStats.map((stat, idx) => (
            <div
              key={idx}
              style={{
                backgroundColor: 'var(--cds-layer-02)',
                padding: '0.875rem 1rem',
                borderRadius: '2px',
                border: '1px solid var(--cds-border-subtle)',
              }}
            >
              <div className="cds-flex cds-items-center cds-justify-between" style={{ marginBottom: '0.375rem' }}>
                <div className="cds-flex cds-items-center cds-gap-02">
                  <span style={{ fontWeight: 600, color: 'var(--cds-text-primary)' }}>{stat.label}</span>
                  <Tag type="teal" size="sm">{stat.count} items</Tag>
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>
                  {stat.percentage}%
                </span>
              </div>
              <ProgressBar
                value={stat.percentage}
                max={100}
                label=""
                hideLabel
                status={stat.percentage > 70 ? 'active' : 'finished'}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
