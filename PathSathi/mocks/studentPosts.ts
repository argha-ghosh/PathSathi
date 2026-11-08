// mocks/studentPosts.ts
// In-memory store for student-created tuition posts and received applications.

import type { StudentTuitionPost, StudentApplication } from '../types/student';
import { TUTORS_STORE } from './tutors';

function findTutor(id: string) {
  const t = TUTORS_STORE.find((t) => t.id === id);
  if (!t) throw new Error(`Mock setup error: tutor ${id} not found`);
  return t;
}

export const STUDENT_POSTS_STORE: StudentTuitionPost[] = [
  {
    id: 'spost-001',
    studentId: 'student-001',
    studentName: 'Rahim Uddin',
    title: 'Need Math Tutor for SSC',
    subject: 'Math',
    classLevel: 'SSC',
    numberOfStudents: 1,
    tutorGender: 'Any',
    teachingMethod: 'Home Tuition',
    daysPerWeek: 3,
    preferredTime: 'Evening (5pm–9pm)',
    division: 'Dhaka',
    district: 'Dhaka',
    area: 'Mirpur',
    minSalary: 4000,
    maxSalary: 6000,
    description: 'Looking for a dedicated math tutor for SSC preparation. Need help with algebra and geometry.',
    status: 'open',
    createdAt: '2026-10-20T10:00:00Z',
    applicantCount: 2,
  },
  {
    id: 'spost-002',
    studentId: 'student-001',
    studentName: 'Rahim Uddin',
    title: 'Physics & Chemistry for HSC',
    subject: 'Physics',
    classLevel: 'HSC',
    numberOfStudents: 1,
    tutorGender: 'Female',
    teachingMethod: 'Both',
    daysPerWeek: 4,
    preferredTime: 'Afternoon (12pm–5pm)',
    division: 'Dhaka',
    district: 'Dhaka',
    area: 'Mirpur',
    minSalary: 6000,
    maxSalary: 9000,
    description: 'Need an experienced tutor for HSC Physics and Chemistry combined sessions.',
    status: 'open',
    createdAt: '2026-10-25T09:00:00Z',
    applicantCount: 1,
  },
];

export const APPLICATIONS_STORE: StudentApplication[] = [
  {
    id: 'sapp-001',
    postId: 'spost-001',
    tutorId: 'tutor-001',
    tutor: findTutor('tutor-001'),
    message: 'I am a 3rd-year CSE student with two years of math tutoring experience. I can cover the full SSC math syllabus.',
    status: 'pending',
    appliedAt: '2026-10-21T11:00:00Z',
  },
  {
    id: 'sapp-002',
    postId: 'spost-001',
    tutorId: 'tutor-003',
    tutor: findTutor('tutor-003'),
    message: 'As a BUET graduate specialised in math, I can help your student achieve excellent results in SSC.',
    status: 'pending',
    appliedAt: '2026-10-22T14:00:00Z',
  },
  {
    id: 'sapp-003',
    postId: 'spost-002',
    tutorId: 'tutor-002',
    tutor: findTutor('tutor-002'),
    message: 'I have helped 15+ students score A+ in HSC Physics and Chemistry. I would love to work with your student.',
    status: 'pending',
    appliedAt: '2026-10-26T10:00:00Z',
  },
];
