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
  TextArea,
} from '@carbon/react';
import { Flow, Checkmark, Close, Add } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';
import { TransferType } from '../sisTypes';

export const TransferView: React.FC = () => {
  const { t } = useTranslation();
  const { students, activeStudentId, initiateTransfer, updateTransferStatus } = useSisStore();

  const student = students.find((s) => s.id === activeStudentId) || students[0];

  const [modalOpen, setModalOpen] = useState(false);
  const [transferType, setTransferType] = useState<TransferType>('internal');
  const [sourceCampus, setSourceCampus] = useState(student?.campus || 'Main Riyadh Campus');
  const [destinationCampus, setDestinationCampus] = useState('Jeddah International Campus');
  const [reason, setReason] = useState('');
  const [academicContext, setAcademicContext] = useState('');

  if (!student) {
    return (
      <Tile style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>No active student selected</h3>
      </Tile>
    );
  }

  const handleInitiateTransfer = () => {
    initiateTransfer({
      studentId: student.id,
      studentName: `${student.firstName} ${student.lastName}`,
      transferType,
      sourceCampus,
      destinationCampus,
      effectiveDate: new Date().toISOString().split('T')[0],
      reason,
      academicContext,
      requestedBy: 'Admissions & Transfer Officer',
    });
    setModalOpen(false);
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-01)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 600 }}>{t('sis.transfers.title')}</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Campus transfer requests & mobility history for {student.firstName} {student.lastName} ({student.studentNumber})
            </p>
          </div>
          <Button kind="primary" size="sm" renderIcon={Add} onClick={() => setModalOpen(true)}>
            {t('sis.transfers.initiateBtn')}
          </Button>
        </div>
      </Tile>

      <Grid>
        {student.transfers.length === 0 ? (
          <Column sm={4} md={8} lg={16}>
            <Tile style={{ textAlign: 'center', padding: '2rem' }}>
              <Flow size={32} style={{ fill: 'var(--cds-text-secondary)', marginBottom: '0.5rem' }} />
              <h4>No Campus Transfer Requests</h4>
              <p style={{ color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                There are no active or historical transfer requests registered for this student.
              </p>
            </Tile>
          </Column>
        ) : (
          student.transfers.map((tr) => (
            <Column key={tr.id} sm={4} md={8} lg={8}>
              <Tile style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 600 }}>
                      {tr.transferType.toUpperCase()} TRANSFER: {tr.sourceCampus} → {tr.destinationCampus}
                    </h4>
                    <p style={{ margin: '0.25rem 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                      Requested by {tr.requestedBy} on {tr.effectiveDate}
                    </p>
                  </div>
                  <Tag
                    type={
                      tr.status === 'approved' || tr.status === 'completed'
                        ? 'green'
                        : tr.status === 'rejected'
                        ? 'red'
                        : 'warm-gray'
                    }
                  >
                    {tr.status.toUpperCase()}
                  </Tag>
                </div>

                <div style={{ margin: '1rem 0', fontSize: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div><strong>Reason:</strong> {tr.reason}</div>
                  <div><strong>Academic Context:</strong> {tr.academicContext}</div>
                  {tr.reviewedBy && <div><strong>Reviewed By:</strong> {tr.reviewedBy} ({tr.approvalDate})</div>}
                </div>

                {(tr.status === 'initiated' || tr.status === 'under_review') && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button
                      kind="primary"
                      size="sm"
                      renderIcon={Checkmark}
                      onClick={() => updateTransferStatus(student.id, tr.id, 'approved', 'Transfer approved by Registrar Committee')}
                    >
                      {t('sis.transfers.approveBtn')}
                    </Button>
                    <Button
                      kind="danger--ghost"
                      size="sm"
                      renderIcon={Close}
                      onClick={() => updateTransferStatus(student.id, tr.id, 'rejected', 'Transfer rejected due to class section capacity limits')}
                    >
                      {t('sis.transfers.rejectBtn')}
                    </Button>
                  </div>
                )}

                {tr.status === 'approved' && (
                  <Button
                    kind="tertiary"
                    size="sm"
                    renderIcon={Checkmark}
                    onClick={() => updateTransferStatus(student.id, tr.id, 'completed', 'Campus placement transferred successfully')}
                  >
                    {t('sis.transfers.completeBtn')}
                  </Button>
                )}
              </Tile>
            </Column>
          ))
        )}
      </Grid>

      <Modal
        open={modalOpen}
        modalHeading="Initiate Campus Transfer Request"
        primaryButtonText="Submit Transfer Request"
        secondaryButtonText="Cancel"
        onRequestClose={() => setModalOpen(false)}
        onRequestSubmit={handleInitiateTransfer}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Select id="tr-type" labelText="Transfer Type *" value={transferType} onChange={(e) => setTransferType(e.target.value as TransferType)}>
            <SelectItem value="internal" text="Internal Campus Transfer" />
            <SelectItem value="external" text="External School Transfer" />
          </Select>

          <TextInput id="tr-src" labelText="Source Campus *" value={sourceCampus} onChange={(e) => setSourceCampus(e.target.value)} />
          <TextInput id="tr-dst" labelText="Destination Campus *" value={destinationCampus} onChange={(e) => setDestinationCampus(e.target.value)} />
          <TextArea id="tr-reason" labelText="Reason for Transfer *" placeholder="e.g. Family residential relocation" value={reason} onChange={(e) => setReason(e.target.value)} />
          <TextInput id="tr-ctx" labelText="Academic Context / Requested Program" placeholder="e.g. Honor STEM Grade 11 Placement" value={academicContext} onChange={(e) => setAcademicContext(e.target.value)} />
        </div>
      </Modal>
    </div>
  );
};
