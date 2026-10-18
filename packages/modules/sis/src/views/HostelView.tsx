import React, { useState } from 'react';
import {
  Tile,
  Grid,
  Column,
  Button,
  Tag,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  Modal,
  TextInput,
  Select,
  SelectItem,
} from '@carbon/react';
import { Add, Printer, Home } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';

export const HostelView: React.FC = () => {
  const { students, activeStudentId } = useSisStore();
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const [beds, setBeds] = useState([
    { id: '1', wing: 'Wing A (Male)', room: 'Room 201', bed: 'Bed A', occupant: 'Zaid bin Mohammed', contact: '+967 771 002 991' },
    { id: '2', wing: 'Wing B (Female)', room: 'Room 104', bed: 'Bed B', occupant: 'Fatima Al-Hamadani', contact: '+967 773 222 111' },
    { id: '3', wing: 'Wing A (Male)', room: 'Room 302', bed: 'Bed C', occupant: 'Suhail Bin Al-Wazir', contact: '+967 775 888 777' },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [wing, setWing] = useState('Wing A (Male)');
  const [room, setRoom] = useState('Room 205');
  const [bedLabel, setBedLabel] = useState('Bed A');
  const [occupant, setOccupant] = useState('');

  const handleAllocateBed = () => {
    const newBed = {
      id: Date.now().toString(),
      wing,
      room,
      bed: bedLabel,
      occupant,
      contact: '+967 77... ',
    };
    setBeds([...beds, newBed]);
    setModalOpen(false);
    setOccupant('');
  };

  const handlePrintBoardingPass = () => {
    const activeBed = beds.find(b => b.occupant.toLowerCase().includes(activeStudent?.firstName?.toLowerCase() || 'zaid')) || beds[0];
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Dormitory Boarding Pass - ${activeStudent?.firstName}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; }
            .pass-card { border: 2px dashed #0f62fe; padding: 30px; max-width: 500px; margin: 0 auto; border-radius: 8px; background: #fafafa; }
            .brand { text-align: center; font-size: 18px; font-weight: bold; color: #0f62fe; margin-bottom: 25px; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 25px; }
          </style>
        </head>
        <body>
          <div class="pass-card">
            <div class="brand">EDUCORE DORMITORY BOARDING PASS</div>
            <div class="grid">
              <div><strong>Student Name:</strong><br/>${activeStudent?.firstName} ${activeStudent?.lastName}</div>
              <div><strong>Student ID:</strong><br/>${activeStudent?.studentNumber || 'STU-1002'}</div>
              <div><strong>Allocated Wing:</strong><br/>${activeBed.wing}</div>
              <div><strong>Room Number:</strong><br/>${activeBed.room}</div>
              <div><strong>Bed Space:</strong><br/>${activeBed.bed}</div>
              <div><strong>Issued Date:</strong><br/>${new Date().toLocaleDateString()}</div>
            </div>
            <div style="font-size: 11px; color: #666; border-top: 1px solid #ddd; padding-top: 15px; text-align: center;">
              This slip confirms dormitory slot reservation. Show this to your wing Warden upon check-in.
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-01)', borderLeft: '4px solid var(--cds-interactive-01)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 600 }}>Hostel & Dormitories</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Allocate dormitory beds, partition male/female wings, and issue printable check-in boarding passes.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button kind="primary" size="sm" renderIcon={Add} onClick={() => setModalOpen(true)}>
              Allocate Bed Space
            </Button>
            <Button kind="secondary" size="sm" renderIcon={Printer} onClick={handlePrintBoardingPass}>
              Print Boarding Pass
            </Button>
          </div>
        </div>
      </Tile>

      <Grid style={{ marginBottom: '1.5rem' }}>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Total Bed Capacity</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>150 Beds</div>
            <Tag type="blue" size="sm">Dual Campus Wings</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Allocated Occupancy</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>112 Rooms filled</div>
            <Tag type="green" size="sm">74.6% Fill Rate</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Pending Maintenance</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0', color: 'var(--cds-support-01)' }}>2 Beds</div>
            <Tag type="red" size="sm">Plumbing Audited</Tag>
          </Tile>
        </Column>
      </Grid>

      <Tile>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Home size={18} />
          Dormitory Bed Allocations Matrix
        </h4>
        <Table size="lg">
          <TableHead>
            <TableRow>
              <TableHeader>Dormitory Wing</TableHeader>
              <TableHeader>Room Number</TableHeader>
              <TableHeader>Bed Space</TableHeader>
              <TableHeader>Active Occupant</TableHeader>
              <TableHeader>Emergency Contact</TableHeader>
              <TableHeader>Status</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {beds.map((b) => (
              <TableRow key={b.id} style={{ backgroundColor: b.occupant.toLowerCase().includes(activeStudent?.firstName?.toLowerCase() || 'zaid') ? 'var(--cds-layer-02)' : 'transparent' }}>
                <TableCell style={{ fontWeight: 600 }}>{b.wing}</TableCell>
                <TableCell>{b.room}</TableCell>
                <TableCell style={{ fontWeight: 600 }}>{b.bed}</TableCell>
                <TableCell>
                  {b.occupant}
                  {b.occupant.toLowerCase().includes(activeStudent?.firstName?.toLowerCase() || 'zaid') && (
                    <Tag type="purple" size="sm" style={{ marginLeft: '0.5rem' }}>Selected Student</Tag>
                  )}
                </TableCell>
                <TableCell style={{ fontFamily: 'monospace' }}>{b.contact}</TableCell>
                <TableCell>
                  <Tag type="green" size="sm">Occupied</Tag>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Tile>

      <Modal
        open={modalOpen}
        modalHeading="Allocate Dormitory Bed Space"
        primaryButtonText="Save Allocation"
        secondaryButtonText="Cancel"
        onRequestClose={() => setModalOpen(false)}
        onRequestSubmit={handleAllocateBed}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <Select
            id="wing-select"
            labelText="Select Campus Wing"
            value={wing}
            onChange={(e) => setWing(e.target.value)}
          >
            <SelectItem value="Wing A (Male)" text="Wing A (Male Dorms)" />
            <SelectItem value="Wing B (Female)" text="Wing B (Female Dorms)" />
          </Select>
          <TextInput
            id="room-no"
            labelText="Room Number"
            placeholder="e.g. Room 204"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
          />
          <TextInput
            id="bed-space"
            labelText="Bed Space Label"
            placeholder="e.g. Bed C"
            value={bedLabel}
            onChange={(e) => setBedLabel(e.target.value)}
          />
          <TextInput
            id="occupant"
            labelText="Occupant Student Name"
            placeholder="e.g. Zaid bin Mohammed"
            value={occupant}
            onChange={(e) => setOccupant(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
