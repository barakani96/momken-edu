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
  Select,
  SelectItem,
  Checkbox,
} from '@carbon/react';
import { Group, Add, TrashCan, Phone, Email, Location } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';

export const GuardianFamilyView: React.FC = () => {
  const { t } = useTranslation();
  const { students, activeStudentId, addGuardian, deleteGuardian } = useSisStore();

  const student = students.find((s) => s.id === activeStudentId) || students[0];

  const [modalOpen, setModalOpen] = useState(false);
  const [guardianName, setGuardianName] = useState('');
  const [relationship, setRelationship] = useState<any>('Father');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);
  const [isEmergency, setIsEmergency] = useState(true);
  const [isFinancial, setIsFinancial] = useState(true);
  const [canPickup, setCanPickup] = useState(true);

  if (!student) {
    return (
      <Tile style={{ padding: '2rem', textAlign: 'center' }}>
        <h3>No active student selected</h3>
      </Tile>
    );
  }

  const handleAddGuardian = () => {
    if (!guardianName) return;
    addGuardian(student.id, {
      guardianName,
      relationship,
      phone,
      email,
      isPrimary,
      isEmergencyContact: isEmergency,
      isFinancialResponsible: isFinancial,
      canPickup,
      preferredLanguage: 'en',
    });
    setModalOpen(false);
    setGuardianName('');
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-01)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 600 }}>{t('sis.guardians.title')}</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Managing family linkages for {student.firstName} {student.lastName} ({student.studentNumber})
            </p>
          </div>
          <Button kind="primary" size="sm" renderIcon={Add} onClick={() => setModalOpen(true)}>
            {t('sis.guardians.addBtn')}
          </Button>
        </div>
      </Tile>

      <Grid>
        {student.guardians.map((g) => (
          <Column key={g.id} sm={4} md={8} lg={8}>
            <Tile style={{ marginBottom: '1rem', position: 'relative' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h4 style={{ margin: 0, fontWeight: 600 }}>{g.guardianName}</h4>
                  <p style={{ margin: '0.25rem 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
                    Relationship: <strong>{g.relationship}</strong>
                  </p>
                </div>
                <Button
                  kind="ghost"
                  className="cds--btn--danger--ghost"
                  size="sm"
                  hasIconOnly
                  iconDescription="Delete Guardian Link"
                  renderIcon={TrashCan}
                  onClick={() => deleteGuardian(student.id, g.id)}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '1rem 0', fontSize: '0.875rem' }}>
                <div><Phone size={16} /> <strong>Phone:</strong> {g.phone}</div>
                <div><Email size={16} /> <strong>Email:</strong> {g.email}</div>
                <div><strong>Preferred Language:</strong> {g.preferredLanguage.toUpperCase()}</div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {g.isPrimary && <Tag type="blue">Primary Guardian</Tag>}
                {g.isEmergencyContact && <Tag type="red">Emergency Contact</Tag>}
                {g.isFinancialResponsible && <Tag type="green">Financial Responsibility</Tag>}
                {g.canPickup && <Tag type="purple">Authorized Pickup</Tag>}
              </div>
            </Tile>
          </Column>
        ))}
      </Grid>

      <Modal
        open={modalOpen}
        modalHeading="Link New Guardian / Family Member"
        primaryButtonText="Save Guardian Link"
        secondaryButtonText="Cancel"
        onRequestClose={() => setModalOpen(false)}
        onRequestSubmit={handleAddGuardian}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <TextInput id="g-name" labelText="Guardian Full Name *" value={guardianName} onChange={(e) => setGuardianName(e.target.value)} />
          <Select id="g-rel" labelText="Relationship *" value={relationship} onChange={(e) => setRelationship(e.target.value as any)}>
            <SelectItem value="Father" text="Father" />
            <SelectItem value="Mother" text="Mother" />
            <SelectItem value="Legal Guardian" text="Legal Guardian" />
            <SelectItem value="Grandparent" text="Grandparent" />
            <SelectItem value="Other" text="Other" />
          </Select>
          <TextInput id="g-phone" labelText="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <TextInput id="g-email" labelText="Email Address *" value={email} onChange={(e) => setEmail(e.target.value)} />

          <Checkbox id="g-pri" labelText="Designate as Primary Guardian" checked={isPrimary} onChange={(_, { checked }) => setIsPrimary(checked)} />
          <Checkbox id="g-emg" labelText="Designate as Emergency Contact" checked={isEmergency} onChange={(_, { checked }) => setIsEmergency(checked)} />
          <Checkbox id="g-fin" labelText="Financial Responsibility" checked={isFinancial} onChange={(_, { checked }) => setIsFinancial(checked)} />
          <Checkbox id="g-pick" labelText="Authorized for School Pickup" checked={canPickup} onChange={(_, { checked }) => setCanPickup(checked)} />
        </div>
      </Modal>
    </div>
  );
};
