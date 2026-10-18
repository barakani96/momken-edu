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
import { Add, Archive, Printer, CheckmarkOutline } from '@carbon/icons-react';

export const InventoryView: React.FC = () => {
  const [items, setItems] = useState([
    { id: '1', barcode: 'BAR-IT-9011', titleEn: 'ViewSonic 4K Smartboard', category: 'IT Hardware', location: 'Grade 10 Classrooms', quantity: 12, status: 'Audited' },
    { id: '2', barcode: 'BAR-SCI-014', titleEn: 'Advanced Microscope Kit', category: 'Lab Apparatus', location: 'Physics & Chemistry Lab', quantity: 24, status: 'Needs Audit' },
    { id: '3', barcode: 'BAR-LIB-440', titleEn: 'Wooden Library Study Tables', category: 'Furniture', location: 'Main Catalog Hall', quantity: 8, status: 'Audited' },
    { id: '4', barcode: 'BAR-CL-102', titleEn: 'Digital Thermometer & Vital Kit', category: 'Clinic Supplies', location: 'Clinic Ward', quantity: 4, status: 'Audited' },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('IT Hardware');
  const [location, setLocation] = useState('Main Campus');
  const [quantity, setQuantity] = useState(1);

  const handleAddItem = () => {
    const newItem = {
      id: Date.now().toString(),
      barcode: barcode || `BAR-GEN-${Math.floor(1000 + Math.random() * 9000)}`,
      titleEn: title,
      category,
      location,
      quantity: Number(quantity),
      status: 'Audited',
    };
    setItems([...items, newItem]);
    setModalOpen(false);
    setBarcode('');
    setTitle('');
  };

  const handleTriggerAudit = (id: string) => {
    setItems(items.map(it => it.id === id ? { ...it, status: 'Audited' } : it));
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-01)', borderLeft: '4px solid var(--cds-interactive-01)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: 0, fontWeight: 600 }}>Inventory & Institutional Assets</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Track smartboards, physics lab glassware apparatuses, and clinic thermometers with barcode logging.
            </p>
          </div>
          <Button kind="primary" size="sm" renderIcon={Add} onClick={() => setModalOpen(true)}>
            Onboard Asset Stock
          </Button>
        </div>
      </Tile>

      <Grid style={{ marginBottom: '1.5rem' }}>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Valued IT Hardware</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>$24,500.00</div>
            <Tag type="green" size="sm">Capital Assets</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Active Audit Coverage</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>
              {items.filter(it => it.status === 'Audited').length} / {items.length} Items
            </div>
            <Tag type="blue" size="sm">94% Compliant</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Pending Maintenance Orders</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0', color: 'var(--cds-support-01)' }}>1 order</div>
            <Tag type="red" size="sm">Smartboard Recalibration</Tag>
          </Tile>
        </Column>
      </Grid>

      <Tile>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Archive size={18} />
          Master Stock & Apparatus Registry
        </h4>
        <Table size="lg">
          <TableHead>
            <TableRow>
              <TableHeader>Barcode ID</TableHeader>
              <TableHeader>Asset Name</TableHeader>
              <TableHeader>Asset Category</TableHeader>
              <TableHeader>Room Location</TableHeader>
              <TableHeader>Scanned Qty</TableHeader>
              <TableHeader>Audit Status</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((it) => (
              <TableRow key={it.id}>
                <TableCell style={{ fontWeight: 600, fontFamily: 'monospace' }}>{it.barcode}</TableCell>
                <TableCell>{it.titleEn}</TableCell>
                <TableCell>{it.category}</TableCell>
                <TableCell>{it.location}</TableCell>
                <TableCell style={{ fontWeight: 600 }}>{it.quantity} units</TableCell>
                <TableCell>
                  <Tag type={it.status === 'Audited' ? 'green' : 'purple'} size="sm">{it.status}</Tag>
                </TableCell>
                <TableCell>
                  {it.status !== 'Audited' ? (
                    <Button kind="ghost" size="sm" renderIcon={CheckmarkOutline} onClick={() => handleTriggerAudit(it.id)}>
                      Mark Audited
                    </Button>
                  ) : (
                    <Tag type="cool-gray" size="sm">Verified</Tag>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Tile>

      <Modal
        open={modalOpen}
        modalHeading="Onboard Asset / Laboratory Stock"
        primaryButtonText="Onboard Stock"
        secondaryButtonText="Cancel"
        onRequestClose={() => setModalOpen(false)}
        onRequestSubmit={handleAddItem}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <TextInput
            id="item-barcode"
            labelText="Scanned Barcode / Serial ID"
            placeholder="e.g. BAR-SCI-102"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
          />
          <TextInput
            id="item-title"
            labelText="Asset Description Name"
            placeholder="e.g. ViewSonic smartboard, test tubes rack"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Select
            id="item-category"
            labelText="Asset Classification"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <SelectItem value="IT Hardware" text="IT Hardware (Smartboards, Laptops, Projectors)" />
            <SelectItem value="Lab Apparatus" text="Chemical / Physics Lab Apparatus" />
            <SelectItem value="Clinic Supplies" text="Clinic First Aid / Vital Tools" />
            <SelectItem value="Furniture" text="Classroom & Library Furniture" />
          </Select>
          <TextInput
            id="item-location"
            labelText="Target Room Allocation"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <TextInput
            id="item-quantity"
            labelText="Physical Count Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
          />
        </div>
      </Modal>
    </div>
  );
};
