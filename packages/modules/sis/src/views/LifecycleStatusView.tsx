import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tile,
  Grid,
  Column,
  Button,
  Tag,
  Modal,
  Select,
  SelectItem,
  TextInput,
  InlineNotification,
} from '@carbon/react';
import { Flow, Checkmark, Time, Warning } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';
import { StudentStatus } from '../sisTypes';

export const LifecycleStatusView: React.FC = () => {
  const { t } = useTranslation();
  const { students, activeStudentId, changeStudentStatus } = useSisStore();

  const student = students.find((s) => s.id === activeStudentId) || students[0];

  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<StudentStatus>(student?.status || 'active');
  const [reason, setReason] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);

  if (!student) {
    return (
      <Tile style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>No active student selected</h3>
      </Tile>
    );
  }

  const handleUpdateStatus = () => {
    changeStudentStatus(student.id, newStatus, reason || 'Status transition requested', effectiveDate);
    setModalOpen(false);
    setReason('');
  };

  const lifecycleSteps = [
    { key: 'applicant', label: 'Applicant' },
    { key: 'admitted', label: 'Admitted' },
    { key: 'enrolled', label: 'Enrolled' },
    { key: 'active', label: 'Active Roster' },
    { key: 'graduated', label: 'Graduated' },
    { key: 'withdrawn', label: 'Withdrawn' },
  ];

  return (
    <div style={{ padding: '1rem 0' }}>
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-01)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 600 }}>Student Lifecycle & Status Management</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Authoritative status tracking for {student.firstName} {student.lastName} ({student.studentNumber})
            </p>
          </div>
          <Button kind="primary" size="sm" renderIcon={Flow} onClick={() => setModalOpen(true)}>
            Transition Lifecycle Status
          </Button>
        </div>
      </Tile>

      {/* Visual Step Diagram */}
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-01)' }}>
        <h4 style={{ fontWeight: 600, marginBottom: '1.5rem' }}>Lifecycle Step Flow</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', flexWrap: 'wrap', gap: '1rem' }}>
          {lifecycleSteps.map((step, idx) => {
            const isCurrent = student.status === step.key;
            return (
              <div
                key={step.key}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem',
                  borderRadius: '4px',
                  background: isCurrent ? 'var(--cds-layer-02)' : 'transparent',
                  border: isCurrent ? '2px solid var(--cds-interactive-01)' : '1px solid var(--cds-border-subtle-01)',
                  minWidth: '120px',
                }}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: isCurrent ? 'var(--cds-interactive-01)' : 'var(--cds-border-strong-01)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                  }}
                >
                  {idx + 1}
                </div>
                <span style={{ fontSize: '0.875rem', fontWeight: isCurrent ? 600 : 400 }}>{step.label}</span>
                {isCurrent && <Tag type="green" size="sm">Active</Tag>}
              </div>
            );
          })}
        </div>
      </Tile>

      {/* Audit History */}
      <Tile>
        <h4 style={{ fontWeight: 600, marginBottom: '1rem' }}>Status Transition Audit History</h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {student.timeline
            .filter((t) => t.type === 'Status Changed' || t.type === 'Student Created')
            .map((ev) => (
              <Tile key={ev.id} style={{ background: 'var(--cds-layer-02)', fontSize: '0.875rem' }}>
                <div style={{ fontWeight: 600 }}>{ev.title}</div>
                <div style={{ color: 'var(--cds-text-secondary)', margin: '0.25rem 0' }}>{ev.description}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-helper)' }}>
                  Timestamp: {ev.timestamp} | Actor: {ev.actor}
                </div>
              </Tile>
            ))}
        </div>
      </Tile>

      <Modal
        open={modalOpen}
        modalHeading="Transition Student Status"
        primaryButtonText="Confirm Transition"
        secondaryButtonText="Cancel"
        onRequestClose={() => setModalOpen(false)}
        onRequestSubmit={handleUpdateStatus}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select id="status-sel-lifecycle" labelText="Target Lifecycle Status *" value={newStatus} onChange={(e) => setNewStatus(e.target.value as StudentStatus)}>
            <SelectItem value="applicant" text="Applicant" />
            <SelectItem value="admitted" text="Admitted" />
            <SelectItem value="enrolled" text="Enrolled" />
            <SelectItem value="active" text="Active" />
            <SelectItem value="graduated" text="Graduated" />
            <SelectItem value="withdrawn" text="Withdrawn" />
            <SelectItem value="transferred" text="Transferred" />
            <SelectItem value="inactive" text="Inactive" />
          </Select>

          <TextInput id="trans-eff-date" labelText="Effective Date *" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
          <TextInput id="trans-reason" labelText="Reason / Justification *" placeholder="e.g. Document verification completed or Board decision" value={reason} onChange={(e) => setReason(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
};
