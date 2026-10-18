/**
 * @schools/module-academics — Authoritative Academics & Curriculum Module
 * Enforces AGENTS.md §13:
 * - Authoritative Owner of: Course, Subject, Assessment, Attendance, TimetableSlot, ExamHallSchedule
 * - References (by ID contract only): Student (owned by @schools/module-sis), Staff (owned by @schools/module-hr)
 */

import academicsManifest from '../../../../src/app/modules/definitions/academicsModule.json';
import { DOMAIN_OWNERSHIP_REGISTRY } from '@schools/domain';

export { academicsManifest };
export const ACADEMICS_OWNERSHIP_CONTRACT = DOMAIN_OWNERSHIP_REGISTRY.academics;

export { AcademicsView, AttendanceView, TimetableView, ExamsView, DisciplineView } from '@schools/module-sis';
