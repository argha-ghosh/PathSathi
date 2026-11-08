// mocks/reviews.ts
// In-memory store for tutor reviews submitted by students.

import type { Review } from '../types/student';

export const REVIEWS_STORE: Review[] = [
  {
    id: 'rev-001',
    tutorId: 'tutor-001',
    studentId: 'student-demo-01',
    studentName: 'Karim Miah',
    rating: 5,
    comment: 'Arif bhai is an excellent teacher. My son improved a lot in math within just 2 months.',
    createdAt: '2026-09-15T10:00:00Z',
  },
  {
    id: 'rev-002',
    tutorId: 'tutor-001',
    studentId: 'student-demo-02',
    studentName: 'Sultana Begum',
    rating: 4,
    comment: 'Very patient and explains concepts clearly. Highly recommended.',
    createdAt: '2026-10-01T09:00:00Z',
  },
  {
    id: 'rev-003',
    tutorId: 'tutor-002',
    studentId: 'student-demo-03',
    studentName: 'Ahmed Hossain',
    rating: 5,
    comment: 'Nadia apu is amazing! My daughter got A+ in HSC Physics thanks to her.',
    createdAt: '2026-10-10T11:00:00Z',
  },
  {
    id: 'rev-004',
    tutorId: 'tutor-003',
    studentId: 'student-demo-04',
    studentName: 'Razia Khatun',
    rating: 5,
    comment: 'Best math tutor in Uttara. Very experienced and professional.',
    createdAt: '2026-09-20T14:00:00Z',
  },
];
