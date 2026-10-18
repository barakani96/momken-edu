/**
 * System Performance & Telemetry Component
 * Displays real-time institutional runtime performance, query latencies,
 * cache hit rates, and an interactive Full-screen expansion mode for intensive monitoring sessions.
 */

import React, { useState, useEffect } from 'react';
import {
  Tile,
  Button,
  Tag,
  Select,
  SelectItem,
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
} from '@carbon/react';
import {
  Maximize,
  Minimize,
  Renew,
  CheckmarkOutline,
  WarningAlt,
  Activity,
} from '@carbon/icons-react';

interface TelemetryPoint {
  time: string;
  sisLatency: number;
  academicsLatency: number;
  admissionsLatency: number;
  indexedDbLatency: number;
  cacheHitRatio: number;
}

const SAMPLE_TELEMETRY: TelemetryPoint[] = [
  { time: '10:00', sisLatency: 14, academicsLatency: 18, admissionsLatency: 22, indexedDbLatency: 2.1, cacheHitRatio: 94 },
  { time: '10:15', sisLatency: 16, academicsLatency: 15, admissionsLatency: 19, indexedDbLatency: 1.8, cacheHitRatio: 96 },
  { time: '10:30', sisLatency: 22, academicsLatency: 24, admissionsLatency: 31, indexedDbLatency: 2.4, cacheHitRatio: 91 },
  { time: '10:45', sisLatency: 15, academicsLatency: 17, admissionsLatency: 20, indexedDbLatency: 1.9, cacheHitRatio: 95 },
  { time: '11:00', sisLatency: 12, academicsLatency: 14, admissionsLatency: 18, indexedDbLatency: 1.6, cacheHitRatio: 97 },
  { time: '11:15', sisLatency: 18, academicsLatency: 21, admissionsLatency: 25, indexedDbLatency: 2.0, cacheHitRatio: 93 },
  { time: '11:30', sisLatency: 14, academicsLatency: 16, admissionsLatency: 19, indexedDbLatency: 1.7, cacheHitRatio: 96 },
  { time: '11:45', sisLatency: 13, academicsLatency: 15, admissionsLatency: 17, indexedDbLatency: 1.5, cacheHitRatio: 98 },
];

export function SystemPerformanceChart() {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [timeRange, setTimeRange] = useState<string>('1h');
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>(SAMPLE_TELEMETRY);
  const [lastUpdated, setLastUpdated] = useState<string>(new Date().toLocaleTimeString());

  // Handle ESC key to exit full screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  const handleRefresh = () => {
    // Generate slight jitter in performance data
    const jittered = SAMPLE_TELEMETRY.map((p) => ({
      ...p,
      sisLatency: Math.max(8, Math.round(p.sisLatency + (Math.random() * 6 - 3))),
      academicsLatency: Math.max(10, Math.round(p.academicsLatency + (Math.random() * 6 - 3))),
      cacheHitRatio: Math.min(99, Math.max(88, Math.round(p.cacheHitRatio + (Math.random() * 4 - 2)))),
    }));
    setTelemetry(jittered);
    setLastUpdated(new Date().toLocaleTimeString());
  };

  const containerStyle: React.CSSProperties = isFullscreen
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9000,
        backgroundColor: 'var(--cds-background, #ffffff)',
        padding: '2rem',
        overflowY: 'auto',
        boxShadow: '0 0 40px rgba(0, 0, 0, 0.35)',
      }
    : {
        marginBottom: '2.5rem',
      };

  return (
    <div style={containerStyle} className="system-performance-chart-wrapper">
      <Tile
        style={{
          padding: '1.5rem',
          backgroundColor: 'var(--cds-layer-01)',
          border: '1px solid var(--cds-border-subtle)',
          borderRadius: '2px',
          height: isFullscreen ? 'calc(100vh - 4rem)' : 'auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header Bar with Full-screen Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
            borderBottom: '1px solid var(--cds-border-subtle)',
            paddingBottom: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Activity size={20} style={{ color: 'var(--cds-interactive, #0f62fe)' }} />
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--cds-text-primary)' }}>
                System Performance & Latency Telemetry
              </h3>
              <Tag type="green" size="sm" renderIcon={CheckmarkOutline}>
                Healthy (99.98% Uptime)
              </Tag>
              {isFullscreen && (
                <Tag type="purple" size="sm">
                  Full-Screen Mode (Press ESC to exit)
                </Tag>
              )}
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--cds-text-secondary)', margin: 0 }}>
              Real-time query durations, IndexedDB client caching latency, and throughput across modules. Last synced at {lastUpdated}.
            </p>
          </div>

          {/* Controls & Full-screen Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ width: '7rem' }}>
              <Select
                id="perf-time-range"
                labelText=""
                hideLabel
                size="sm"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <SelectItem value="1h" text="Last 1 Hour" />
                <SelectItem value="6h" text="Last 6 Hours" />
                <SelectItem value="24h" text="Last 24 Hours" />
                <SelectItem value="7d" text="Last 7 Days" />
              </Select>
            </div>

            <Button
              kind="ghost"
              size="sm"
              renderIcon={Renew}
              onClick={handleRefresh}
              iconDescription="Refresh Telemetry"
            >
              Refresh
            </Button>

            {/* FULL-SCREEN TOGGLE BUTTON */}
            <Button
              kind={isFullscreen ? 'primary' : 'secondary'}
              size="sm"
              renderIcon={isFullscreen ? Minimize : Maximize}
              onClick={() => setIsFullscreen(!isFullscreen)}
              id="fullscreen-toggle-btn"
            >
              {isFullscreen ? 'Exit Full-screen' : 'Full-screen'}
            </Button>
          </div>
        </div>

        {/* Metric Overview Strip */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--cds-layer-02)',
              borderLeft: '4px solid #0f62fe',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>Avg Response Time</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>15.8 ms</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cds-support-success)' }}>-3.2ms vs peak</div>
          </div>

          <div
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--cds-layer-02)',
              borderLeft: '4px solid #8a3ffc',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>IndexedDB Cache Hit</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>95.4 %</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cds-support-success)' }}>Offline Resilient</div>
          </div>

          <div
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--cds-layer-02)',
              borderLeft: '4px solid #007d79',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>Throughput</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>342 req/s</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)' }}>Optimal Bandwidth</div>
          </div>

          <div
            style={{
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--cds-layer-02)',
              borderLeft: '4px solid #24a148',
            }}
          >
            <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)' }}>Error Rate</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--cds-text-primary)' }}>0.01 %</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--cds-support-success)' }}>Zero Critical Failures</div>
          </div>
        </div>

        {/* Visual Latency Chart Visualization */}
        <div
          style={{
            flex: 1,
            minHeight: isFullscreen ? '320px' : '180px',
            backgroundColor: 'var(--cds-layer-02)',
            padding: '1.25rem',
            borderRadius: '2px',
            marginBottom: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--cds-text-secondary)' }}>
              MODULE QUERY LATENCY (MILLISECONDS) OVER {timeRange.toUpperCase()}
            </span>
            <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#0f62fe', borderRadius: '2px' }} />
                SIS Module
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#8a3ffc', borderRadius: '2px' }} />
                Academics Module
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#007d79', borderRadius: '2px' }} />
                Admissions
              </span>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                <span style={{ width: '10px', height: '10px', backgroundColor: '#24a148', borderRadius: '2px' }} />
                IndexedDB Cache
              </span>
            </div>
          </div>

          {/* Bar / Column Chart Representation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: isFullscreen ? '220px' : '120px',
              gap: '0.75rem',
              paddingTop: '1rem',
              borderBottom: '1px solid var(--cds-border-subtle)',
            }}
          >
            {telemetry.map((pt, idx) => {
              const maxScale = 40;
              const sisHeight = `${Math.min(100, (pt.sisLatency / maxScale) * 100)}%`;
              const academicsHeight = `${Math.min(100, (pt.academicsLatency / maxScale) * 100)}%`;
              const admissionsHeight = `${Math.min(100, (pt.admissionsLatency / maxScale) * 100)}%`;

              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                    gap: '0.25rem',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', width: '100%', justifyContent: 'center', height: '100%' }}>
                    {/* SIS Bar */}
                    <div
                      title={`SIS: ${pt.sisLatency}ms`}
                      style={{
                        width: '28%',
                        maxWidth: '18px',
                        height: sisHeight,
                        backgroundColor: '#0f62fe',
                        borderRadius: '2px 2px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                    {/* Academics Bar */}
                    <div
                      title={`Academics: ${pt.academicsLatency}ms`}
                      style={{
                        width: '28%',
                        maxWidth: '18px',
                        height: academicsHeight,
                        backgroundColor: '#8a3ffc',
                        borderRadius: '2px 2px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                    {/* Admissions Bar */}
                    <div
                      title={`Admissions: ${pt.admissionsLatency}ms`}
                      style={{
                        width: '28%',
                        maxWidth: '18px',
                        height: admissionsHeight,
                        backgroundColor: '#007d79',
                        borderRadius: '2px 2px 0 0',
                        transition: 'height 0.3s ease',
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>
                    {pt.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Module Breakdown Table (shows when expanded or on demand) */}
        {isFullscreen && (
          <div style={{ marginTop: '0.5rem', overflowX: 'auto' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--cds-text-primary)' }}>
              Active Module Telemetry Breakdown
            </h4>
            <Table size="sm" useZebraStyles>
              <TableHead>
                <TableRow>
                  <TableHeader>Timestamp</TableHeader>
                  <TableHeader>SIS Latency</TableHeader>
                  <TableHeader>Academics Latency</TableHeader>
                  <TableHeader>Admissions Latency</TableHeader>
                  <TableHeader>IndexedDB Local Cache</TableHeader>
                  <TableHeader>Cache Hit Ratio</TableHeader>
                  <TableHeader>Status</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {telemetry.map((pt, i) => (
                  <TableRow key={i}>
                    <TableCell style={{ fontWeight: 600 }}>{pt.time}</TableCell>
                    <TableCell>{pt.sisLatency} ms</TableCell>
                    <TableCell>{pt.academicsLatency} ms</TableCell>
                    <TableCell>{pt.admissionsLatency} ms</TableCell>
                    <TableCell>{pt.indexedDbLatency} ms</TableCell>
                    <TableCell>{pt.cacheHitRatio} %</TableCell>
                    <TableCell>
                      <Tag size="sm" type="green">
                        Nominal
                      </Tag>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Tile>
    </div>
  );
}
