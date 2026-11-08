// mocks/authStore.ts
// Mock user accounts store – supports both tutor and student roles.
// Simulates a simple email/password auth system in-memory.

export interface MockUser {
  id: string;
  email: string;
  password: string; // plain text – mock only, never do this in production
  name: string;
  phone?: string;
  role: 'tutor' | 'student';
}

// Pre-seeded demo accounts
export const USERS_STORE: MockUser[] = [
  {
    id: 'tutor-001',
    email: 'arif@example.com',
    password: 'password123',
    name: 'Arif Hassan',
    role: 'tutor',
  },
  {
    id: 'student-001',
    email: 'rahim@example.com',
    password: 'password123',
    name: 'Rahim Uddin',
    phone: '01712345678',
    role: 'student',
  },
];

let _currentUserId: string | null = null;

export function getCurrentUserId(): string | null {
  return _currentUserId;
}

export function setCurrentUserId(id: string | null): void {
  _currentUserId = id;
}

export function findUserByEmail(email: string): MockUser | undefined {
  return USERS_STORE.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserByEmailAndRole(
  email: string,
  role: 'tutor' | 'student',
): MockUser | undefined {
  return USERS_STORE.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === role,
  );
}

export function findUserById(id: string): MockUser | undefined {
  return USERS_STORE.find((u) => u.id === id);
}

export function updateUserById(
  id: string,
  data: Partial<Pick<MockUser, 'name' | 'phone'>>,
): MockUser | undefined {
  const index = USERS_STORE.findIndex((u) => u.id === id);
  if (index === -1) return undefined;
  USERS_STORE[index] = { ...USERS_STORE[index], ...data };
  return USERS_STORE[index];
}
