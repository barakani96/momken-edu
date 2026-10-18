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
  RadioButtonGroup,
  RadioButton,
} from '@carbon/react';
import { Add, Printer, Wallet } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';

export const FinanceView: React.FC = () => {
  const { students, activeStudentId } = useSisStore();
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const [invoices, setInvoices] = useState([
    { id: '1', number: 'INV-2026-0041', date: '2026-09-01', amount: 450000, paid: 150000, currency: 'YER', status: 'Partial' },
    { id: '2', number: 'INV-2026-0042', date: '2026-09-05', amount: 2500, paid: 2500, currency: 'SAR', status: 'Paid' },
    { id: '3', number: 'INV-2026-0043', date: '2026-09-10', amount: 800, paid: 0, currency: 'USD', status: 'Pending' },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [currency, setCurrency] = useState('USD');
  const [amount, setAmount] = useState(1000);
  const [invoiceNo, setInvoiceNo] = useState('');

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [payAmount, setPayAmount] = useState(200);
  const [payMethod, setPayMethod] = useState('POS Card');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('1');

  const handleAddInvoice = () => {
    const newInv = {
      id: Date.now().toString(),
      number: invoiceNo || `INV-2026-00${invoices.length + 41}`,
      date: new Date().toISOString().split('T')[0],
      amount: Number(amount),
      paid: 0,
      currency,
      status: 'Pending',
    };
    setInvoices([...invoices, newInv]);
    setModalOpen(false);
    setInvoiceNo('');
  };

  const handleMakePayment = () => {
    setInvoices(invoices.map(inv => {
      if (inv.id === selectedInvoiceId) {
        const totalPaid = inv.paid + Number(payAmount);
        const status = totalPaid >= inv.amount ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Pending';
        return { ...inv, paid: totalPaid, status };
      }
      return inv;
    }));
    setPaymentModalOpen(false);

    // Print Receipt Immediately
    const selectedInv = invoices.find(inv => inv.id === selectedInvoiceId);
    if (!selectedInv) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Payment Receipt - ${activeStudent?.firstName} ${activeStudent?.lastName}</title>
          <style>
            body { font-family: 'Arial', sans-serif; padding: 40px; line-height: 1.5; color: #333; }
            .receipt-box { border: 2px dashed #000; padding: 25px; max-width: 600px; margin: 0 auto; }
            .title { text-align: center; font-size: 20px; font-weight: bold; text-transform: uppercase; margin-bottom: 20px; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; font-size: 14px; }
            .total-row { border-top: 1px solid #000; padding-top: 10px; font-weight: bold; font-size: 16px; margin-top: 10px; }
          </style>
        </head>
        <body>
          <div class="receipt-box">
            <div class="title">Official Payment Receipt / سند قبض مالي</div>
            <div style="text-align: center; font-size: 12px; color: #555; margin-bottom: 25px;">EDUCORE SCHOOL SYSTEMS CO. LTD.</div>
            
            <div class="details">
              <div><strong>Receipt No:</strong> REC-${Date.now().toString().substring(7)}</div>
              <div><strong>Payment Date:</strong> ${new Date().toLocaleString()}</div>
              <div><strong>Student ID:</strong> ${activeStudent?.studentNumber || 'STU-1002'}</div>
              <div><strong>Student Name:</strong> ${activeStudent?.firstName} ${activeStudent?.lastName}</div>
              <div><strong>Invoice Reference:</strong> ${selectedInv.number}</div>
              <div><strong>Payment Method:</strong> ${payMethod}</div>
            </div>

            <div class="total-row" style="display: flex; justify-content: space-between;">
              <span>Amount Paid / المبلغ المدفوع:</span>
              <span>${payAmount} ${selectedInv.currency}</span>
            </div>
            
            <div style="display: flex; justify-content: space-between; font-size: 13px; color: #555; margin-top: 15px;">
              <span>Remaining Balance:</span>
              <span>${selectedInv.amount - (selectedInv.paid + Number(payAmount))} ${selectedInv.currency}</span>
            </div>

            <div style="margin-top: 50px; display: flex; justify-content: space-between; font-size: 12px;">
              <div>Cashier / أمين الصندوق:<br/><strong>Systems Desk</strong></div>
              <div>Signature & Stamp:<br/>_________________</div>
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
            <h3 style={{ margin: 0, fontWeight: 600 }}>Finance & Billing Hub</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Issue institutional bills in YER, SAR, or USD. Structure flexible installment milestones and record cashier transactions.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button kind="primary" size="sm" renderIcon={Wallet} onClick={() => setPaymentModalOpen(true)}>
              Record Cashier Receipt
            </Button>
            <Button kind="secondary" size="sm" renderIcon={Add} onClick={() => setModalOpen(true)}>
              Issue Fee Invoice
            </Button>
          </div>
        </div>
      </Tile>

      <Grid style={{ marginBottom: '1.5rem' }}>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Total Invoice Balance (USD)</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>$1,800.00</div>
            <Tag type="red" size="sm">Action Required</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Collected Revenue</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0', color: 'var(--cds-support-02)' }}>$1,000.00</div>
            <Tag type="green" size="sm">Cleared Funds</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Payment Compliance Rate</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>82.4%</div>
            <Tag type="blue" size="sm">Standard Performance</Tag>
          </Tile>
        </Column>
      </Grid>

      <Tile>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Active Fee Invoices</h4>
        <Table size="lg">
          <TableHead>
            <TableRow>
              <TableHeader>Invoice Number</TableHeader>
              <TableHeader>Issue Date</TableHeader>
              <TableHeader>Billed Amount</TableHeader>
              <TableHeader>Paid Amount</TableHeader>
              <TableHeader>Currency</TableHeader>
              <TableHeader>Outstanding Balance</TableHeader>
              <TableHeader>Status</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {invoices.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell style={{ fontWeight: 600 }}>{inv.number}</TableCell>
                <TableCell>{inv.date}</TableCell>
                <TableCell>{inv.amount.toLocaleString()}</TableCell>
                <TableCell style={{ color: 'var(--cds-support-02)' }}>{inv.paid.toLocaleString()}</TableCell>
                <TableCell style={{ fontWeight: 600 }}>{inv.currency}</TableCell>
                <TableCell style={{ color: 'var(--cds-support-01)', fontWeight: 600 }}>
                  {(inv.amount - inv.paid).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Tag type={inv.status === 'Paid' ? 'green' : inv.status === 'Partial' ? 'blue' : 'red'} size="sm">
                    {inv.status}
                  </Tag>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Tile>

      {/* Issue Invoice Modal */}
      <Modal
        open={modalOpen}
        modalHeading="Issue Fee Invoice"
        primaryButtonText="Generate Invoice"
        secondaryButtonText="Cancel"
        onRequestClose={() => setModalOpen(false)}
        onRequestSubmit={handleAddInvoice}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <TextInput
            id="inv-no"
            labelText="Custom Invoice Number (Optional)"
            placeholder="e.g. INV-2026-0044"
            value={invoiceNo}
            onChange={(e) => setInvoiceNo(e.target.value)}
          />
          <TextInput
            id="inv-amount"
            labelText="Billed Total"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
          />
          <Select
            id="inv-currency"
            labelText="Billing Currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <SelectItem value="USD" text="USD - United States Dollar" />
            <SelectItem value="SAR" text="SAR - Saudi Riyal" />
            <SelectItem value="YER" text="YER - Yemeni Rial" />
          </Select>
        </div>
      </Modal>

      {/* Record Payment Cashier Receipt Modal */}
      <Modal
        open={paymentModalOpen}
        modalHeading="Record Cashier Payment & Print Voucher"
        primaryButtonText="Record Receipt & Print"
        secondaryButtonText="Cancel"
        onRequestClose={() => setPaymentModalOpen(false)}
        onRequestSubmit={handleMakePayment}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <Select
            id="pay-invoice-select"
            labelText="Apply to Invoice"
            value={selectedInvoiceId}
            onChange={(e) => setSelectedInvoiceId(e.target.value)}
          >
            {invoices.map((inv) => (
              <SelectItem key={inv.id} value={inv.id} text={`${inv.number} (Billed: ${inv.amount} ${inv.currency})`} />
            ))}
          </Select>

          <TextInput
            id="pay-amount-input"
            labelText="Voucher Cash Amount Received"
            type="number"
            value={payAmount}
            onChange={(e) => setPayAmount(Number(e.target.value))}
          />

          <Select
            id="pay-method-select"
            labelText="Payment Channel"
            value={payMethod}
            onChange={(e) => setPayMethod(e.target.value)}
          >
            <SelectItem value="Cash" text="Cash" />
            <SelectItem value="Bank Transfer" text="Bank Transfer" />
            <SelectItem value="POS Card" text="POS Card" />
            <SelectItem value="Check" text="Paper Check" />
          </Select>
        </div>
      </Modal>
    </div>
  );
};
