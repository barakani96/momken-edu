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
} from '@carbon/react';
import { Add, Delivery, Phone, UserAdmin } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';

export const TransportView: React.FC = () => {
  const { students, activeStudentId } = useSisStore();
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const [routes, setRoutes] = useState([
    { id: '1', code: 'RT-101', nameEn: 'Taiz Al-Hawk Circular', bus: 'Bus 12 (Hyundai 30-Seater)', driver: 'Mukhles Al-Omeri', phone: '+967 771 234 567', seats: 30, filled: 28 },
    { id: '2', code: 'RT-102', nameEn: 'Taiz City North West Corridor', bus: 'Bus 08 (Toyota Coaster)', driver: 'Saddam Al-Baadani', phone: '+967 773 998 122', seats: 22, filled: 19 },
    { id: '3', code: 'RT-103', nameEn: 'Sanaa Central Direct shuttle', bus: 'Bus 15 (Golden Dragon)', driver: 'Yahya Al-Qubati', phone: '+967 775 441 332', seats: 45, filled: 41 },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [code, setCode] = useState('');
  const [routeName, setRouteName] = useState('');
  const [driver, setDriver] = useState('');
  const [phone, setPhone] = useState('');

  const handleAddRoute = () => {
    const newRoute = {
      id: Date.now().toString(),
      code: code || `RT-${101 + routes.length}`,
      nameEn: routeName,
      bus: 'Bus 04 (Coaster 22-Seater)',
      driver,
      phone,
      seats: 22,
      filled: 1,
    };
    setRoutes([...routes, newRoute]);
    setModalOpen(false);
    setCode('');
    setRouteName('');
    setDriver('');
    setPhone('');
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-01)', borderLeft: '4px solid var(--cds-interactive-01)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 600 }}>Transport & Fleet Operations</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Assign students to institutional transit corridors, track driver phone numbers, and manage seat capacities.
            </p>
          </div>
          <Button kind="primary" size="sm" renderIcon={Add} onClick={() => setModalOpen(true)}>
            Register Bus Corridor
          </Button>
        </div>
      </Tile>

      <Grid style={{ marginBottom: '1.5rem' }}>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>FTE Active Shuttles</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>14 Vehicles</div>
            <Tag type="green" size="sm">GPS Sync Online</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Transport Enrolled Students</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>186 Students</div>
            <Tag type="blue" size="sm">84.2% Capacity Rate</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Emergency Roadside Hotline</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--cds-support-01)' }}>
              <Phone size={18} />
              +967 4 222 301
            </div>
            <Tag type="red" size="sm">24/7 Dispatch</Tag>
          </Tile>
        </Column>
      </Grid>

      <Tile>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Delivery size={18} />
          Active Transport Routes & Bus Drivers
        </h4>
        <Table size="lg">
          <TableHead>
            <TableRow>
              <TableHeader>Route Code</TableHeader>
              <TableHeader>Corridor Name</TableHeader>
              <TableHeader>Bus Description</TableHeader>
              <TableHeader>Assigned Driver</TableHeader>
              <TableHeader>Driver Contact No.</TableHeader>
              <TableHeader>Seating Capacity</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {routes.map((rt) => (
              <TableRow key={rt.id} style={{ backgroundColor: activeStudent?.address?.street?.toLowerCase()?.includes('hawk') && rt.code === 'RT-101' ? 'var(--cds-layer-02)' : 'transparent' }}>
                <TableCell style={{ fontWeight: 600 }}>{rt.code}</TableCell>
                <TableCell>
                  {rt.nameEn}
                  {activeStudent?.address?.street?.toLowerCase()?.includes('hawk') && rt.code === 'RT-101' && (
                    <Tag type="purple" size="sm" style={{ marginLeft: '0.5rem' }}>Student Assigned Bus</Tag>
                  )}
                </TableCell>
                <TableCell>{rt.bus}</TableCell>
                <TableCell>
                  <Tag type="cool-gray" size="sm">{rt.driver}</Tag>
                </TableCell>
                <TableCell style={{ fontFamily: 'monospace' }}>{rt.phone}</TableCell>
                <TableCell>{rt.filled} / {rt.seats} Seats filled</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Tile>

      <Modal
        open={modalOpen}
        modalHeading="Register Outbound Bus Corridor"
        primaryButtonText="Save Bus Corridor"
        secondaryButtonText="Cancel"
        onRequestClose={() => setModalOpen(false)}
        onRequestSubmit={handleAddRoute}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <TextInput
            id="rt-code"
            labelText="Route Code"
            placeholder="e.g. RT-104"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <TextInput
            id="rt-name"
            labelText="Corridor Coverage Name"
            placeholder="e.g. Taiz Al-Hawk East Sector"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
          />
          <TextInput
            id="rt-driver"
            labelText="Driver Legal Name"
            value={driver}
            onChange={(e) => setDriver(e.target.value)}
          />
          <TextInput
            id="rt-phone"
            labelText="Driver Outbound Cell Phone"
            placeholder="+967 77..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
