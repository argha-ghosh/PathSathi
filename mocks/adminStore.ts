// mocks/adminStore.ts
// In-memory data stores for the Admin module (Phase 1).
// Phase 2: replace these with real API calls in services/adminApi.ts.

import type {
  AdminUser,
  Moderator,
  Category,
  PlatformStats,
} from '../types/admin';

// ── Users ────────────────────────────────────────────────────────
// Mix of roles and statuses so every filter combination shows results.
export let ADMIN_USERS_STORE: AdminUser[] = [
  {
    id: 'student-001',
    name: 'Rahim Uddin',
    email: 'rahim@example.com',
    phone: '01712345678',
    role: 'student',
    status: 'active',
    joinedAt: '2026-01-12T08:00:00.000Z',
  },
  {
    id: 'student-002',
    name: 'Sumaiya Begum',
    email: 'sumaiya@example.com',
    phone: '01845678901',
    role: 'student',
    status: 'suspended',
    joinedAt: '2026-02-20T10:30:00.000Z',
  },
  {
    id: 'student-003',
    name: 'Karim Hossain',
    email: 'karim@example.com',
    phone: '01911223344',
    role: 'student',
    status: 'active',
    joinedAt: '2026-03-05T14:00:00.000Z',
  },
  {
    id: 'student-004',
    name: 'Nasrin Akter',
    email: 'nasrin@example.com',
    role: 'student',
    status: 'banned',
    joinedAt: '2026-04-18T09:15:00.000Z',
  },
  {
    id: 'tutor-001',
    name: 'Arif Hassan',
    email: 'arif@example.com',
    role: 'tutor',
    status: 'active',
    joinedAt: '2026-01-05T07:00:00.000Z',
  },
  {
    id: 'tutor-002',
    name: 'Tamanna Islam',
    email: 'tamanna@example.com',
    phone: '01799887766',
    role: 'tutor',
    status: 'active',
    joinedAt: '2026-02-14T11:00:00.000Z',
  },
  {
    id: 'tutor-003',
    name: 'Rashed Khan',
    email: 'rashed@example.com',
    role: 'tutor',
    status: 'suspended',
    joinedAt: '2026-03-22T16:45:00.000Z',
  },
  {
    id: 'tutor-004',
    name: 'Nadia Sultana',
    email: 'nadia@example.com',
    role: 'tutor',
    status: 'active',
    joinedAt: '2026-05-01T08:30:00.000Z',
  },
  {
    id: 'mod-001',
    name: 'Fatima Noor',
    email: 'fatima@pathsathi.com',
    role: 'moderator',
    status: 'active',
    joinedAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'admin-001',
    name: 'Platform Admin',
    email: 'admin@pathsathi.com',
    role: 'admin',
    status: 'active',
    joinedAt: '2026-01-01T00:00:00.000Z',
  },
];

// ── Moderators ───────────────────────────────────────────────────
export let MODERATORS_STORE: Moderator[] = [
  {
    id: 'mod-001',
    name: 'Fatima Noor',
    email: 'fatima@pathsathi.com',
    joinedAt: '2026-03-01T09:00:00.000Z',
  },
  {
    id: 'mod-002',
    name: 'Jahangir Alam',
    email: 'jahangir@pathsathi.com',
    joinedAt: '2026-04-10T10:00:00.000Z',
  },
  {
    id: 'mod-003',
    name: 'Rubina Parvin',
    email: 'rubina@pathsathi.com',
    joinedAt: '2026-06-15T12:00:00.000Z',
  },
];

// ── Categories — Subjects ────────────────────────────────────────
export let SUBJECTS_STORE: Category[] = [
  { id: 'subj-01', name: 'Math', type: 'subject' },
  { id: 'subj-02', name: 'Physics', type: 'subject' },
  { id: 'subj-03', name: 'Chemistry', type: 'subject' },
  { id: 'subj-04', name: 'Biology', type: 'subject' },
  { id: 'subj-05', name: 'English', type: 'subject' },
  { id: 'subj-06', name: 'ICT', type: 'subject' },
  { id: 'subj-07', name: 'Accounting', type: 'subject' },
  { id: 'subj-08', name: 'Bangla', type: 'subject' },
  { id: 'subj-09', name: 'Higher Math', type: 'subject' },
];

// ── Categories — Class Levels ────────────────────────────────────
export let CLASS_LEVELS_STORE: Category[] = [
  { id: 'cl-01', name: 'Class 6', type: 'class_level' },
  { id: 'cl-02', name: 'Class 7', type: 'class_level' },
  { id: 'cl-03', name: 'Class 8', type: 'class_level' },
  { id: 'cl-04', name: 'Class 9', type: 'class_level' },
  { id: 'cl-05', name: 'Class 10', type: 'class_level' },
  { id: 'cl-06', name: 'SSC', type: 'class_level' },
  { id: 'cl-07', name: 'HSC', type: 'class_level' },
];

// ── Stats ────────────────────────────────────────────────────────
// Derived from the above stores so numbers stay consistent.
export function getStats(): PlatformStats {
  const users = ADMIN_USERS_STORE.filter((u) => u.role !== 'admin');
  return {
    totalUsers: users.length,
    totalTutors: users.filter((u) => u.role === 'tutor').length,
    totalStudents: users.filter((u) => u.role === 'student').length,
    totalModerators: users.filter((u) => u.role === 'moderator').length,
    activePosts: 12,         // matches tuitionPosts mock
    acceptedApplications: 1, // matches applications mock
  };
}
