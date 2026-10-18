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
import { Add, Locked, View, ViewOff, Printer } from '@carbon/icons-react';
import { encryptPII, decryptPII, maskSensitivePII } from '../../../../../src/application/encryption';

export const HrView: React.FC = () => {
  const [showSalary, setShowSalary] = useState<Record<string, boolean>>({});
  
  const [faculty, setFaculty] = useState([
    { id: '1', empId: 'EMP-9021', nameEn: 'Eng. Ahmed Al-Sabri', role: 'Teacher', dept: 'Mathematics', salary: encryptPII('750000 YER'), workload: 22 },
    { id: '2', empId: 'EMP-9022', nameEn: 'Dr. Sarah Al-Waseem', role: 'Teacher', dept: 'General Science', salary: encryptPII('1200 USD'), workload: 18 },
    { id: '3', empId: 'EMP-9023', nameEn: 'Mr. Waleed Al-Hakimi', role: 'Registrar', dept: 'Admissions Office', salary: encryptPII('650000 YER'), workload: 0 },
    { id: '4', empId: 'EMP-9024', nameEn: 'Ms. Arwa Sharaf', role: 'Principal/Tenant Admin', dept: 'Executive Office', salary: encryptPII('2500 USD'), workload: 4 },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Teacher');
  const [dept, setDept] = useState('Mathematics');
  const [salaryRaw, setSalaryRaw] = useState('800 USD');
  const [workload, setWorkload] = useState(20);

  const handleAddFaculty = () => {
    const encryptedSalary = encryptPII(salaryRaw);
    const newFac = {
      id: Date.now().toString(),
      empId: `EMP-${Math.floor(9000 + Math.random() * 999)}`,
      nameEn: name,
      role,
      dept,
      salary: encryptedSalary,
      workload: Number(workload),
    };
    setFaculty([...faculty, newFac]);
    setModalOpen(false);
    setName('');
    setSalaryRaw('800 USD');
  };

  const toggleSalaryVisibility = (id: string) => {
    setShowSalary(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handlePrintPayslip = (fac: typeof faculty[0]) => {
    const decSalary = decryptPII(fac.salary);
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Institutional Payslip - ${fac.nameEn}</title>
          <style>
            body { font-family: monospace; padding: 50px; line-height: 1.6; }
            .border-box { border: 2px solid #333; padding: 30px; max-width: 650px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px; margin-bottom: 30px; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #ddd; }
          </style>
        </head>
        <body>
          <div class="border-box">
            <div class="header">
              <h2>EDUCORE INSTITUTIONAL PAYSLIP</h2>
              <p>CONFIDENTIAL EMP PAYROLL DISBURSEMENT VOUCHER</p>
            </div>
            <div class="meta-grid">
              <div><strong>Employee ID:</strong> ${fac.empId}</div>
              <div><strong>Disbursement Date:</strong> ${new Date().toLocaleDateString()}</div>
              <div><strong>Faculty Name:</strong> ${fac.nameEn}</div>
              <div><strong>Assigned Department:</strong> ${fac.dept}</div>
              <div><strong>Core Role:</strong> ${fac.role}</div>
              <div><strong>Teaching Workload:</strong> ${fac.workload} Hrs/Week</div>
            </div>
            
            <div style="font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #333;">SALARY BREAKDOWN</div>
            <div class="row">
              <span>Basic Base Salary (Decrypted AES-256):</span>
              <strong>${decSalary}</strong>
            </div>
            <div class="row">
              <span>Classroom Load Premium Allowance:</span>
              <span>${fac.workload > 15 ? 'Included' : 'N/A'}</span>
            </div>
            <div class="row">
              <span>Taxes & Retirement Pension (1.5%):</span>
              <span>- Deducted at Source</span>
            </div>
            <div class="row" style="font-weight: bold; font-size: 16px; border-top: 1px solid #000; margin-top: 20px;">
              <span>Net Take-home Disbursement:</span>
              <span>${decSalary}</span>
            </div>

            <p style="margin-top: 40px; font-size: 11px; text-align: center; color: #666;">
              CONFIDENTIAL: Encrypted under AES-256 standards. Unauthorized distribution violates ERP governance policy.
            </p>
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
            <h3 style={{ margin: 0, fontWeight: 600 }}>HR & Faculty Directory</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Administer staff contracts. Teacher salaries are encrypted using AES-256 at rest, and accessed with Zero-Trust compliance.
            </p>
          </div>
          <Button kind="primary" size="sm" renderIcon={Add} onClick={() => setModalOpen(true)}>
            Onboard Faculty Staff
          </Button>
        </div>
      </Tile>

      <Grid style={{ marginBottom: '1.5rem' }}>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>FTE Teachers Onboarded</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>{faculty.filter(f => f.role === 'Teacher').length} Staff</div>
            <Tag type="green" size="sm">Fully Staffed</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Overloaded Faculty Workloads</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0', color: 'var(--cds-support-03)' }}>
              {faculty.filter(f => f.workload > 20).length} Overloaded
            </div>
            <Tag type="purple" size="sm">Review Required</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile style={{ position: 'relative' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Zero-Trust Cryptographic Status</span>
            <div style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0.5rem 0', color: 'var(--cds-support-02)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Locked size={20} />
              AES-256 ACTIVE
            </div>
            <Tag type="blue" size="sm">Military Grade Protection</Tag>
          </Tile>
        </Column>
      </Grid>

      <Tile>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Faculty & Staff Directory</h4>
        <Table size="lg">
          <TableHead>
            <TableRow>
              <TableHeader>Staff ID</TableHeader>
              <TableHeader>Staff Name</TableHeader>
              <TableHeader>Role</TableHeader>
              <TableHeader>Department</TableHeader>
              <TableHeader>Workload</TableHeader>
              <TableHeader>AES Encrypted Base Salary</TableHeader>
              <TableHeader>Actions</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {faculty.map((fac) => (
              <TableRow key={fac.id}>
                <TableCell style={{ fontWeight: 600 }}>{fac.empId}</TableCell>
                <TableCell>{fac.nameEn}</TableCell>
                <TableCell>
                  <Tag type={fac.role === 'Teacher' ? 'blue' : 'warm-gray'} size="sm">{fac.role}</Tag>
                </TableCell>
                <TableCell>{fac.dept}</TableCell>
                <TableCell>{fac.workload > 0 ? `${fac.workload} Hrs/Week` : 'N/A'}</TableCell>
                <TableCell style={{ fontFamily: 'monospace', letterSpacing: '0.5px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem' }}>
                      {showSalary[fac.id] ? decryptPII(fac.salary) : maskSensitivePII(fac.salary)}
                    </span>
                    <Button
                      kind="ghost"
                      size="sm"
                      hasIconOnly
                      renderIcon={showSalary[fac.id] ? ViewOff : View}
                      iconDescription="Toggle Salary Visibility"
                      onClick={() => toggleSalaryVisibility(fac.id)}
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <Button kind="ghost" size="sm" renderIcon={Printer} onClick={() => handlePrintPayslip(fac)}>
                    Disburse Payslip
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Tile>

      <Modal
        open={modalOpen}
        modalHeading="Onboard Faculty / Staff Member"
        primaryButtonText="Complete Onboarding"
        secondaryButtonText="Cancel"
        onRequestClose={() => setModalOpen(false)}
        onRequestSubmit={handleAddFaculty}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <TextInput
            id="fac-name"
            labelText="Faculty Full Name"
            placeholder="e.g. Eng. Ahmed Al-Sabri"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Select
            id="fac-role"
            labelText="Core Institutional Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <SelectItem value="Teacher" text="Academic Teacher" />
            <SelectItem value="Registrar" text="Registrar Office Officer" />
            <SelectItem value="Staff" text="General Staff Support" />
            <SelectItem value="Principal/Tenant Admin" text="Principal / Executive Office" />
          </Select>
          <TextInput
            id="fac-dept"
            labelText="Assigned Department"
            placeholder="e.g. Mathematics, IT Services, Admissions"
            value={dept}
            onChange={(e) => setDept(e.target.value)}
          />
          <TextInput
            id="fac-salary"
            labelText="Sensitive Base Salary (AES-256 Encrypted on disk)"
            placeholder="e.g. 1500 USD, 850000 YER"
            value={salaryRaw}
            onChange={(e) => setSalaryRaw(e.target.value)}
          />
          <TextInput
            id="fac-workload"
            labelText="Target Weekly Teaching Workload Hours"
            type="number"
            value={workload}
            onChange={(e) => setWorkload(Number(e.target.value))}
          />
        </div>
      </Modal>
    </div>
  );
};
