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
import { Add, Catalog, Printer, CheckmarkOutline } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';

export const LibraryView: React.FC = () => {
  const { students, activeStudentId } = useSisStore();
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const [books, setBooks] = useState([
    { id: '1', isbn: '978-0131103627', titleEn: 'The C Programming Language', titleAr: 'لغة البرمجة سي', author: 'Kernighan & Ritchie', category: 'Computer Science', copies: 4 },
    { id: '2', isbn: '978-0486600452', titleEn: 'Calculus Refresher', titleAr: 'مراجعة حساب التفاضل والتكامل', author: 'A. A. Klaf', category: 'Mathematics', copies: 2 },
    { id: '3', isbn: '978-0060935467', titleEn: 'To Kill a Mockingbird', titleAr: 'أن تقتل طائراً محاكياً', author: 'Harper Lee', category: 'Literature', copies: 5 },
  ]);

  const [checkouts, setCheckouts] = useState([
    { id: '1', isbn: '978-0131103627', title: 'The C Programming Language', checkoutDate: '2026-09-01', dueDate: '2026-09-15', fine: 0, returned: false },
    { id: '2', isbn: '978-0486600452', title: 'Calculus Refresher', checkoutDate: '2026-08-20', dueDate: '2026-09-03', fine: 3500, returned: false },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [isbn, setIsbn] = useState('');
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [category, setCategory] = useState('Computer Science');

  const handleAddBook = () => {
    const newBook = {
      id: Date.now().toString(),
      isbn,
      titleEn: title,
      titleAr: '',
      author,
      category,
      copies: 3,
    };
    setBooks([...books, newBook]);
    setModalOpen(false);
    setIsbn('');
    setTitle('');
    setAuthor('');
  };

  const handleReturnBook = (id: string) => {
    setCheckouts(checkouts.map(c => c.id === id ? { ...c, returned: true, fine: 0 } : c));
  };

  const handlePrintLibraryCard = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Library Membership Card</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background: #eee; }
            .badge { border: 2px solid #0f62fe; border-radius: 12px; padding: 25px; width: 450px; background: #fff; box-shadow: 0 4px 10px rgba(0,0,0,0.15); font-size: 14px; position: relative; }
            .header { border-bottom: 2px solid #0f62fe; padding-bottom: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; }
            .tag { font-size: 10px; color: #fff; background: #0f62fe; padding: 3px 8px; border-radius: 20px; font-weight: bold; }
            .details { display: grid; grid-template-columns: 1fr; gap: 8px; }
            .barcode { margin-top: 20px; text-align: center; font-family: 'Libre Barcode 39', monospace; font-size: 32px; letter-spacing: 5px; }
          </style>
        </head>
        <body>
          <div class="badge">
            <div class="header">
              <strong style="font-size: 16px; color: #0f62fe;">EDUCORE LIBRARY CARD</strong>
              <div class="tag">ACTIVE VISITOR</div>
            </div>
            <div class="details">
              <div><strong>Student Name:</strong> ${activeStudent?.firstName} ${activeStudent?.lastName}</div>
              <div><strong>Student ID:</strong> ${activeStudent?.studentNumber || 'STU-1002'}</div>
              <div><strong>Grade / Section:</strong> ${activeStudent?.gradeLevel || 'Grade 10'} (${activeStudent?.classSection || 'Sec-10A'})</div>
              <div><strong>Max Book Quota:</strong> 4 Registered Books</div>
            </div>
            <div class="barcode">
              *LIB-${activeStudent?.studentNumber || 'STU-1002'}*
            </div>
            <div style="font-size: 9px; color: #777; text-align: center; margin-top: 10px;">
              Present this barcode at the circulation desk for checking out books.
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
            <h3 style={{ margin: 0, fontWeight: 600 }}>Library & Resources</h3>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
              Search school literature catalogs by ISBN, manage student checkout durations, and print member access cards.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button kind="primary" size="sm" renderIcon={Add} onClick={() => setModalOpen(true)}>
              Catalog New Book
            </Button>
            <Button kind="secondary" size="sm" renderIcon={Printer} onClick={handlePrintLibraryCard}>
              Print Library Pass Card
            </Button>
          </div>
        </div>
      </Tile>

      <Grid style={{ marginBottom: '1.5rem' }}>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Library Catalog Headcount</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0' }}>1,250 Volumes</div>
            <Tag type="blue" size="sm">Indexed by ISBN</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Active Checkouts</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0', color: 'var(--cds-support-03)' }}>
              {checkouts.filter(c => !c.returned).length} Loans
            </div>
            <Tag type="warm-gray" size="sm">Outstanding Circulation</Tag>
          </Tile>
        </Column>
        <Column sm={4} md={4} lg={4}>
          <Tile>
            <span style={{ fontSize: '0.875rem', color: 'var(--cds-text-secondary)' }}>Pending Overdue Fines</span>
            <div style={{ fontSize: '2rem', fontWeight: 600, margin: '0.5rem 0', color: 'var(--cds-support-01)' }}>
              {checkouts.reduce((acc, curr) => acc + curr.fine, 0).toLocaleString()} YER
            </div>
            <Tag type="red" size="sm">Awaiting Settlement</Tag>
          </Tile>
        </Column>
      </Grid>

      <Grid>
        <Column sm={4} md={8} lg={8}>
          <Tile style={{ height: '100%' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Catalog size={18} />
              ISBN Catalog Registry
            </h4>
            <Table size="lg">
              <TableHead>
                <TableRow>
                  <TableHeader>ISBN Code</TableHeader>
                  <TableHeader>Book Title (EN)</TableHeader>
                  <TableHeader>Author</TableHeader>
                  <TableHeader>Category</TableHeader>
                  <TableHeader>Copies</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {books.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell style={{ fontWeight: 600 }}>{b.isbn}</TableCell>
                    <TableCell>{b.titleEn}</TableCell>
                    <TableCell>{b.author}</TableCell>
                    <TableCell>{b.category}</TableCell>
                    <TableCell>{b.copies} In-Stock</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Tile>
        </Column>

        <Column sm={4} md={8} lg={8}>
          <Tile style={{ height: '100%' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem' }}>Circulation & Active Loans</h4>
            <Table size="lg">
              <TableHead>
                <TableRow>
                  <TableHeader>Borrowed Book</TableHeader>
                  <TableHeader>Due Date</TableHeader>
                  <TableHeader>Fines</TableHeader>
                  <TableHeader>Status</TableHeader>
                  <TableHeader>Action</TableHeader>
                </TableRow>
              </TableHead>
              <TableBody>
                {checkouts.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell style={{ fontWeight: 600 }}>{c.title}</TableCell>
                    <TableCell>{c.dueDate}</TableCell>
                    <TableCell style={{ color: c.fine > 0 ? 'var(--cds-support-01)' : 'var(--cds-text-primary)' }}>
                      {c.fine > 0 ? `${c.fine.toLocaleString()} YER` : 'None'}
                    </TableCell>
                    <TableCell>
                      <Tag type={c.returned ? 'green' : c.fine > 0 ? 'red' : 'purple'} size="sm">
                        {c.returned ? 'Returned' : c.fine > 0 ? 'Overdue Loan' : 'On Loan'}
                      </Tag>
                    </TableCell>
                    <TableCell>
                      {!c.returned && (
                        <Button kind="ghost" size="sm" renderIcon={CheckmarkOutline} onClick={() => handleReturnBook(c.id)}>
                          Check-in Book
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Tile>
        </Column>
      </Grid>

      <Modal
        open={modalOpen}
        modalHeading="Catalog New Book Volume"
        primaryButtonText="Index Book"
        secondaryButtonText="Cancel"
        onRequestClose={() => setModalOpen(false)}
        onRequestSubmit={handleAddBook}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
          <TextInput
            id="book-isbn"
            labelText="ISBN Serial Barcode"
            placeholder="e.g. 978-3-16-148410-0"
            value={isbn}
            onChange={(e) => setIsbn(e.target.value)}
          />
          <TextInput
            id="book-title"
            labelText="Book English Title"
            placeholder="e.g. Introduction to Algorithms"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextInput
            id="book-author"
            labelText="Author / Compiler"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>
      </Modal>
    </div>
  );
};
