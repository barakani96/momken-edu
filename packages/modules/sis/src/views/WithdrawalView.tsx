import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Tile,
  Grid,
  Column,
  Button,
  Tag,
  Modal,
  TextInput,
  TextArea,
} from '@carbon/react';
import { Add, Checkmark, Close } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';

export const WithdrawalView: React.FC = () => {
  const { t } = useTranslation();
  const { students, activeStudentId, initiateWithdrawal, updateWithdrawalStatus } = useSisStore();

  const student = students.find((s) => s.id === activeStudentId) || students[0];

  const [modalOpen, setModalOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [effectiveDate, setEffectiveDate] = useState(new Date().toISOString().split('T')[0]);
  const [destination, setDestination] = useState('');

  if (!student) {
    return (
      <Tile style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>No active student selected</h3>
      </Tile>
    );
  }

  const handleInitiateWithdrawal = () => {
    initiateWithdrawal({
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      reason,
      effectiveDate,
      destination,
      requestedBy: 'Student Affairs Officer',
    });
    setModalOpen(false);
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-01)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 600 }}>{t('sis.withdrawal.title')}</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Clearance & withdrawal workflows for {student.firstName} {student.lastName} ({student.studentNumber})
            </p>
          </div>
          <Button kind="danger" size="sm" renderIcon={Add} onClick={() => setModalOpen(true)}>
            {t('sis.withdrawal.initiateBtn')}
          </Button>
        </div>
      </Tile>

      <Grid>
        {student.withdrawals.length === 0 ? (
          <Column sm={4} md={8} lg={16}>
            <Tile style={{ textAlign: 'center', padding: '2rem' }}>
              <h4>No Active Withdrawal Records</h4>
              <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                This student record is currently in good standing with zero withdrawal proceedings.
              </p>
            </Tile>
          </Column>
        ) : (
          student.withdrawals.map((w) => (
            <Column key={w.id} sm={4} md={8} lg={8}>
              <Tile style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 600 }}>Withdrawal Request ({w.effectiveDate})</h4>
                    <p style={{ margin: '0.25rem 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                      Initiated by {w.requestedBy}
                    </p>
                  </div>
                  <Tag type={w.status === 'completed' ? 'red' : 'warm-gray'}>
                    {w.status.toUpperCase()}
                  </Tag>
                </div>

                <div style={{ margin: '1rem 0', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div><strong>Reason:</strong> {w.reason}</div>
                  <div><strong>Destination School:</strong> {w.destination}</div>
                  {w.reviewedBy && <div><strong>Approved By:</strong> {w.reviewedBy} ({w.approvalDate})</div>}
                </div>

                {(w.status === 'initiated' || w.status === 'under_review') && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      kind="primary"
                      size="sm"
                      renderIcon={Checkmark}
                      onClick={() => updateWithdrawalStatus(student.id, w.id, 'approved', 'Clearance verified by Finance and Library')}
                    >
                      {t('sis.withdrawal.approveBtn')}
                    </Button>
                  </div>
                )}

                {w.status === 'approved' && (
                  <Button
                    kind="danger"
                    size="sm"
                    renderIcon={Checkmark}
                    onClick={() => updateWithdrawalStatus(student.id, w.id, 'completed', 'Final transcript released & student record status set to Withdrawn')}
                  >
                    {t('sis.withdrawal.completeBtn')}
                  </Button>
                )}
              </Tile>
            </Column>
          ))
        )}
      </Grid>

      <Modal
        open={modalOpen}
        modalHeading="Initiate Student Withdrawal & Clearance"
        primaryButtonText="Submit Request"
        secondaryButtonText="Cancel"
        onRequestClose={() => setModalOpen(false)}
        onRequestSubmit={handleInitiateWithdrawal}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TextArea id="w-reason" labelText="Withdrawal Reason *" placeholder="e.g. Overseas relocation or medical leave" value={reason} onChange={(e) => setReason(e.target.value)} />
          <TextInput id="w-date" labelText="Effective Withdrawal Date *" value={effectiveDate} onChange={(e) => setEffectiveDate(e.target.value)} />
          <TextInput id="w-dest" labelText="Destination School / Institution" placeholder="e.g. International School of London" value={destination} onChange={(e) => setDestination(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
};
