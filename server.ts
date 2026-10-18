import express from 'express';
import { PrismaClient } from '@prisma/client';
import { createServer as createViteServer } from 'vite';
import { createNavigationModule } from './src/modules/navigation/navigation.module';
import { seedNavigation } from './src/modules/navigation/navigation.seed';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Initialize Core Foundation Navigation Subsystem
const navigationModule = createNavigationModule(prisma);
app.use('/api/v1/navigation', navigationModule.router);
app.use('/api/navigation', navigationModule.router);

// API Routes for Students
app.get('/api/students', async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        guardians: true,
        documents: true,
        academicRecords: true,
        timelineEvents: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(students);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch students' });
  }
});

app.get('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const student = await prisma.student.findFirst({
      where: {
        OR: [{ id }, { studentNumber: id }],
      },
      include: {
        guardians: true,
        documents: true,
        academicRecords: true,
        timelineEvents: true,
      },
    });
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch student' });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const data = req.body;
    const newStudent = await prisma.student.create({
      data: {
        studentNumber: data.studentNumber || `STU-${Math.floor(100000 + Math.random() * 900000)}`,
        firstName: data.firstName,
        lastName: data.lastName,
        preferredName: data.preferredName,
        firstNameAr: data.firstNameAr,
        lastNameAr: data.lastNameAr,
        gender: data.gender || 'Male',
        dateOfBirth: data.dateOfBirth || '2008-01-01',
        nationalId: data.nationalId || `NAT-${Math.floor(10000000 + Math.random() * 90000000)}`,
        status: data.status || 'active',
        enrollmentStatus: data.enrollmentStatus || 'Enrolled',
        campus: data.campus || 'Main Campus - Riyadh',
        program: data.program || 'International Baccalaureate (IB)',
        gradeLevel: data.gradeLevel || 'Grade 10',
        classSection: data.classSection || '10-A',
        cohort: data.cohort || 'Class of 2028',
        gpa: data.gpa || 3.75,
        enrollmentDate: data.enrollmentDate || new Date().toISOString().substring(0, 10),
        attendanceRate: data.attendanceRate || 98.0,
        email: data.contact?.email || data.email || 'student@schools.edu',
        phone: data.contact?.phone || data.phone || '+966 50 000 0000',
        alternatePhone: data.contact?.alternatePhone || data.alternatePhone,
        street: data.address?.street || data.street || 'King Fahd Road',
        city: data.address?.city || data.city || 'Riyadh',
        state: data.address?.state || data.state || 'Riyadh Province',
        postalCode: data.address?.postalCode || data.postalCode || '12345',
        country: data.address?.country || data.country || 'Saudi Arabia',
        timelineEvents: {
          create: [
            {
              type: 'Student Created',
              title: 'Student Record Created',
              description: `Student ${data.firstName} ${data.lastName} registered in system.`,
              actor: 'Registrar Staff',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            },
          ],
        },
      },
      include: {
        guardians: true,
        documents: true,
        academicRecords: true,
        timelineEvents: true,
      },
    });
    res.status(201).json(newStudent);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create student' });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const updated = await prisma.student.update({
      where: { id },
      data,
      include: {
        guardians: true,
        documents: true,
        academicRecords: true,
        timelineEvents: true,
      },
    });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update student' });
  }
});

// Academic Records
app.get('/api/students/:id/academics', async (req, res) => {
  try {
    const { id } = req.params;
    const records = await prisma.academicRecord.findMany({
      where: { studentId: id },
    });
    res.json(records);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch academic records' });
  }
});

app.post('/api/students/:id/academics', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const record = await prisma.academicRecord.create({
      data: {
        studentId: id,
        code: data.code,
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        term: data.term || 'Fall 2026',
        credits: data.credits || 3,
        courseworkScore: data.courseworkScore || 90,
        finalExamScore: data.finalExamScore || 90,
        totalScore: data.totalScore || 90,
        grade: data.grade || 'A',
        instructor: data.instructor || 'Dr. Faculty',
        status: data.status || 'Completed',
      },
    });
    res.status(201).json(record);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create academic record' });
  }
});

// Documents
app.get('/api/students/:id/documents', async (req, res) => {
  try {
    const { id } = req.params;
    const docs = await prisma.studentDocument.findMany({
      where: { studentId: id },
    });
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to fetch documents' });
  }
});

app.post('/api/students/:id/documents', async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const doc = await prisma.studentDocument.create({
      data: {
        studentId: id,
        category: data.category || 'other',
        documentType: data.documentType || 'Document',
        fileName: data.fileName || 'file.pdf',
        fileSize: data.fileSize || '1.2 MB',
        uploadDate: new Date().toISOString().substring(0, 10),
        uploadedBy: data.uploadedBy || 'System User',
        status: data.status || 'Pending',
        serialNumber: data.serialNumber,
        academicYear: data.academicYear,
        expiryDate: data.expiryDate,
        summary: data.summary,
      },
    });
    res.status(201).json(doc);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to upload document' });
  }
});

// Seed endpoint for initial test data
app.post('/api/seed', async (req, res) => {
  try {
    const count = await prisma.student.count();
    if (count > 0) {
      return res.json({ message: 'Database already seeded', count });
    }

    const student1 = await prisma.student.create({
      data: {
        studentNumber: 'STU-2026-001',
        firstName: 'Tariq',
        lastName: 'Al-Hashemi',
        firstNameAr: 'طارق',
        lastNameAr: 'الهاشمي',
        gender: 'Male',
        dateOfBirth: '2008-05-14',
        nationalId: '1098234712',
        status: 'active',
        enrollmentStatus: 'Enrolled',
        campus: 'Main Campus - Riyadh',
        program: 'International Baccalaureate (IB)',
        gradeLevel: 'Grade 10',
        classSection: '10-A',
        cohort: 'Class of 2028',
        gpa: 3.85,
        enrollmentDate: '2024-08-25',
        attendanceRate: 98.2,
        email: 'tariq.hashemi@schools.edu',
        phone: '+966 50 123 4567',
        street: 'King Fahd Road, Al-Olaya',
        city: 'Riyadh',
        state: 'Riyadh Province',
        postalCode: '12211',
        country: 'Saudi Arabia',
        guardians: {
          create: [
            {
              guardianName: 'Dr. Faisal Al-Hashemi',
              relationship: 'Father',
              phone: '+966 50 987 6543',
              email: 'faisal.hashemi@gmail.com',
              isPrimary: true,
              isEmergencyContact: true,
              isFinancialResponsible: true,
            },
          ],
        },
        academicRecords: {
          create: [
            {
              code: 'MATH-301',
              nameEn: 'Advanced Calculus & Analytical Geometry',
              nameAr: 'التفاضل والتكامل المتقدم',
              term: 'Fall 2026',
              credits: 4,
              courseworkScore: 95,
              finalExamScore: 93,
              totalScore: 94,
              grade: 'A+',
              instructor: 'Dr. Ibrahim Al-Mansoor',
              status: 'In Progress',
            },
            {
              code: 'PHYS-302',
              nameEn: 'Honors Electromagnetism & Mechanics',
              nameAr: 'الكهرومغناطيسية والميكانيكا',
              term: 'Fall 2026',
              credits: 4,
              courseworkScore: 91,
              finalExamScore: 89,
              totalScore: 90,
              grade: 'A',
              instructor: 'Eng. Tariq Al-Subaie',
              status: 'In Progress',
            },
          ],
        },
        documents: {
          create: [
            {
              category: 'academic_transcripts',
              documentType: 'Official Transcript',
              fileName: 'Transcript_Grade9_Final.pdf',
              fileSize: '2.4 MB',
              uploadDate: '2025-06-12',
              uploadedBy: 'Registrar Office',
              status: 'Verified',
              academicYear: '2024-2025',
            },
            {
              category: 'id_documents',
              documentType: 'National ID / Iqama',
              fileName: 'National_ID_Tariq.pdf',
              fileSize: '1.1 MB',
              uploadDate: '2024-08-20',
              uploadedBy: 'Parent Portal',
              status: 'Verified',
              serialNumber: 'NAT-9988271',
            },
          ],
        },
        timelineEvents: {
          create: [
            {
              type: 'Student Created',
              title: 'Student Record Created',
              description: 'Student Tariq Al-Hashemi registered in SIS.',
              actor: 'Registrar Staff',
              timestamp: '2024-08-25 08:30',
            },
          ],
        },
      },
    });

    res.json({ message: 'Database seeded successfully', seededStudent: student1 });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to seed database' });
  }
});

// Vite middleware setup
async function startServer() {
  try {
    await seedNavigation(prisma);
  } catch (err) {
    console.warn('Navigation auto-seed check:', err);
  }

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${port}`);
  });
}

startServer();
