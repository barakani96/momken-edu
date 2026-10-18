import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Grid,
  Column,
  Tile,
  Tag,
  Button,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  InlineNotification,
} from '@carbon/react';
import {
  Education,
  Calendar,
  Catalog,
  Chat,
  CheckmarkOutline,
  Download,
} from '@carbon/icons-react';

export function GuardianDashboard() {
  const { t } = useTranslation();
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600 }}>
          {t('portals.guardian.dashboard.title')}
        </h1>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
          {t('portals.guardian.dashboard.description')}
        </p>
      </div>

      {noticeMessage && (
        <div style={{ marginBottom: '1rem' }}>
          <InlineNotification
            kind="success"
            title={noticeMessage}
            onCloseButtonClick={() => setNoticeMessage(null)}
            lowContrast
          />
        </div>
      )}

      <Grid style={{ marginBottom: '1.5rem' }}>
        <Column sm={4} md={4} lg={4}>
          <Tile style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                {t('portals.guardian.dashboard.enrolledChildren')}
              </span>
              <Education size={20} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>2</div>
            <Tag type="cyan" size="sm">Grade 11 & Grade 8</Tag>
          </Tile>
        </Column>

        <Column sm={4} md={4} lg={4}>
          <Tile style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                {t('portals.guardian.dashboard.avgAttendance')}
              </span>
              <CheckmarkOutline size={20} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>98.5%</div>
            <Tag type="green" size="sm">Exemplary</Tag>
          </Tile>
        </Column>

        <Column sm={4} md={4} lg={4}>
          <Tile style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                {t('portals.guardian.dashboard.currentGpa')}
              </span>
              <Catalog size={20} />
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>3.92</div>
            <Tag type="blue" size="sm">Honor Roll</Tag>
          </Tile>
        </Column>

        <Column sm={4} md={4} lg={4}>
          <Tile style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>
                {t('portals.guardian.dashboard.outstandingBalance')}
              </span>
              <Calendar size={20} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 600, margin: '0.5rem 0' }}>SAR 4,250</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <Button
                kind="primary"
                size="sm"
                onClick={() => setNoticeMessage(t('portals.guardian.dashboard.paymentSuccess'))}
              >
                {t('portals.guardian.dashboard.payNow')}
              </Button>
              <Button
                kind="ghost"
                size="sm"
                renderIcon={Download}
                onClick={() => setNoticeMessage(t('portals.guardian.dashboard.paymentSuccess'))}
              >
                {t('portals.guardian.dashboard.DownloadReceipt')}
              </Button>
            </div>
          </Tile>
        </Column>
      </Grid>

      <Grid>
        <Column sm={4} md={8} lg={8}>
          <Tile style={{ height: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontWeight: 600 }}>
                {t('portals.guardian.dashboard.academicPerformance')}
              </h4>
              <Button
                kind="ghost"
                size="sm"
                renderIcon={Chat}
                onClick={() => setNoticeMessage(t('portals.guardian.dashboard.messageSent'))}
              >
                {t('portals.guardian.dashboard.sendNote')}
              </Button>
            </div>
            <Table size="md">
              <TableHead>
                <TableRow>
                  <TableHeader>Student</TableHeader>
                  <TableHeader>Subject</TableHeader>
                  <TableHeader>Score</TableHeader>
                  <TableHeader>Status</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Ahmed Al-Mansoor (STU-1001)</TableCell>
                  <TableCell>Advanced Mathematics</TableCell>
                  <TableCell>96 / 100 (A+)</TableCell>
                  <TableCell><Tag type="green" size="sm">Verified</Tag></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Ahmed Al-Mansoor (STU-1001)</TableCell>
                  <TableCell>Physics & Lab</TableCell>
                  <TableCell>93 / 100 (A)</TableCell>
                  <TableCell><Tag type="green" size="sm">Verified</Tag></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sara Al-Mansoor (STU-1004)</TableCell>
                  <TableCell>Computer Science</TableCell>
                  <TableCell>98 / 100 (A+)</TableCell>
                  <TableCell><Tag type="green" size="sm">Verified</Tag></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Tile>
        </Column>

        <Column sm={4} md={8} lg={8}>
          <Tile style={{ height: '100%' }}>
            <h4 style={{ margin: '0 0 1rem', fontWeight: 600 }}>
              {t('portals.guardian.dashboard.recentAttendance')}
            </h4>
            <Table size="md">
              <TableHead>
                <TableRow>
                  <TableHeader>Date</TableHeader>
                  <TableHeader>Student</TableHeader>
                  <TableHeader>Check-In</TableHeader>
                  <TableHeader>Status</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>2026-10-08</TableCell>
                  <TableCell>Ahmed Al-Mansoor</TableCell>
                  <TableCell>07:22 AM</TableCell>
                  <TableCell><Tag type="green" size="sm">Present</Tag></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2026-10-08</TableCell>
                  <TableCell>Sara Al-Mansoor</TableCell>
                  <TableCell>07:24 AM</TableCell>
                  <TableCell><Tag type="green" size="sm">Present</Tag></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>2026-10-07</TableCell>
                  <TableCell>Ahmed Al-Mansoor</TableCell>
                  <TableCell>07:19 AM</TableCell>
                  <TableCell><Tag type="green" size="sm">Present</Tag></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Tile>
        </Column>
      </Grid>
    </div>
  );
}

export default GuardianDashboard;
