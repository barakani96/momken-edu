import React from 'react';
import { Tile, Tag, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@carbon/react';
import { Calendar } from '@carbon/icons-react';
import { useSisStore } from '../sisStore';

export const TimetableView: React.FC = () => {
  const { students, activeStudentId } = useSisStore();
  const activeStudent = students.find((s) => s.id === activeStudentId) || students[0];

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday'];
  const periods = [
    { name: 'Period 1', time: '08:00 AM - 08:45 AM' },
    { name: 'Period 2', time: '08:45 AM - 09:30 AM' },
    { name: 'Break', time: '09:30 AM - 10:00 AM' },
    { name: 'Period 3', time: '10:00 AM - 10:45 AM' },
    { name: 'Period 4', time: '10:45 AM - 11:30 AM' },
    { name: 'Period 5', time: '11:30 AM - 12:15 PM' },
  ];

  const schedule: Record<string, Record<string, { subject: string, room: string, teacher: string }>> = {
    Sunday: {
      'Period 1': { subject: 'Mathematics I', room: 'Room 201', teacher: 'Eng. Ahmed Al-Sabri' },
      'Period 2': { subject: 'General Science', room: 'Lab B', teacher: 'Dr. Sarah Al-Waseem' },
      'Period 3': { subject: 'Arabic Language', room: 'Room 105', teacher: 'Mr. Waleed Al-Hakimi' },
      'Period 4': { subject: 'English Grammar', room: 'Room 201', teacher: 'Ms. Emily Smith' },
      'Period 5': { subject: 'Islamic History', room: 'Room 105', teacher: 'Sheikh Mansour' },
    },
    Monday: {
      'Period 1': { subject: 'Arabic Language', room: 'Room 105', teacher: 'Mr. Waleed Al-Hakimi' },
      'Period 2': { subject: 'Mathematics I', room: 'Room 201', teacher: 'Eng. Ahmed Al-Sabri' },
      'Period 3': { subject: 'General Science', room: 'Lab B', teacher: 'Dr. Sarah Al-Waseem' },
      'Period 4': { subject: 'Computer Programming', room: 'IT Lab 1', teacher: 'Eng. Ahmed Al-Sabri' },
      'Period 5': { subject: 'Physical Education', room: 'Playground', teacher: 'Coach Fahad' },
    },
    Tuesday: {
      'Period 1': { subject: 'Mathematics I', room: 'Room 201', teacher: 'Eng. Ahmed Al-Sabri' },
      'Period 2': { subject: 'Islamic Studies', room: 'Room 105', teacher: 'Sheikh Mansour' },
      'Period 3': { subject: 'English Grammar', room: 'Room 201', teacher: 'Ms. Emily Smith' },
      'Period 4': { subject: 'General Science', room: 'Lab B', teacher: 'Dr. Sarah Al-Waseem' },
      'Period 5': { subject: 'Arabic Language', room: 'Room 105', teacher: 'Mr. Waleed Al-Hakimi' },
    },
    Wednesday: {
      'Period 1': { subject: 'Islamic History', room: 'Room 105', teacher: 'Sheikh Mansour' },
      'Period 2': { subject: 'English Grammar', room: 'Room 201', teacher: 'Ms. Emily Smith' },
      'Period 3': { subject: 'Mathematics I', room: 'Room 201', teacher: 'Eng. Ahmed Al-Sabri' },
      'Period 4': { subject: 'General Science', room: 'Lab B', teacher: 'Dr. Sarah Al-Waseem' },
      'Period 5': { subject: 'Chemistry Basics', room: 'Chemistry Lab', teacher: 'Dr. Sarah Al-Waseem' },
    },
    Thursday: {
      'Period 1': { subject: 'Computer Programming', room: 'IT Lab 1', teacher: 'Eng. Ahmed Al-Sabri' },
      'Period 2': { subject: 'Arabic Literature', room: 'Room 105', teacher: 'Mr. Waleed Al-Hakimi' },
      'Period 3': { subject: 'Islamic Studies', room: 'Room 105', teacher: 'Sheikh Mansour' },
      'Period 4': { subject: 'Weekly Academic Quiz', room: 'Exam Hall', teacher: 'Rotational Staff' },
      'Period 5': { subject: 'Free Study Period', room: 'Library', teacher: 'Librarian' },
    },
  };

  return (
    <div style={{ padding: '1rem 0' }}>
      <Tile style={{ marginBottom: '1.5rem', background: 'var(--cds-layer-01)', borderLeft: '4px solid var(--cds-interactive-01)' }}>
        <h3 style={{ margin: 0, fontWeight: 600 }}>Weekly Timetable Grid Matrix</h3>
        <p style={{ margin: '0.25rem 0 0', color: 'var(--cds-text-secondary)', fontSize: '0.875rem' }}>
          Interactive calendar period matrix designed for school sections. Highlights the active student’s core class schedule (Sunday to Thursday sequence).
        </p>
      </Tile>

      <Tile>
        <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} />
          Current Term Schedule ({activeStudent?.gradeLevel || 'Grade 10'} — {activeStudent?.classSection || 'Sec-10A'})
        </h4>
        
        <Table size="lg">
          <TableHead>
            <TableRow>
              <TableHeader style={{ width: '150px' }}>Period Hours</TableHeader>
              {days.map(day => (
                <TableHeader key={day} style={{ fontWeight: 600 }}>{day}</TableHeader>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {periods.map((p) => (
              <TableRow key={p.name} style={{ height: p.name === 'Break' ? '50px' : '90px' }}>
                <TableCell style={{ fontWeight: 600, borderRight: '1px solid var(--cds-border-subtle-01)' }}>
                  <div>{p.name}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--cds-text-secondary)' }}>{p.time}</div>
                </TableCell>
                {days.map((day) => {
                  if (p.name === 'Break') {
                    return (
                      <TableCell key={day} style={{ backgroundColor: 'var(--cds-layer-01)', textAlign: 'center', color: 'var(--cds-text-secondary)', fontSize: '0.875rem', fontStyle: 'italic' }}>
                        Recess Break
                      </TableCell>
                    );
                  }
                  const slot = schedule[day]?.[p.name];
                  if (!slot) return <TableCell key={day}>—</TableCell>;
                  return (
                    <TableCell key={day} style={{ verticalAlign: 'top', borderRight: '1px solid var(--cds-border-subtle-01)', padding: '0.5rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{slot.subject}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cds-text-secondary)', marginTop: '0.25rem' }}>{slot.room}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--cds-interactive-01)', marginTop: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {slot.teacher}
                      </div>
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Tile>
    </div>
  );
};
