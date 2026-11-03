// mocks/authStore.ts
// Mock user accounts store.
// Simulates a simple email/password auth system in-memory.

export interface MockUser {
  id: string;
  email: string;
  password: string; // plain text – mock only, never do this in production
  name: string;
  role: 'tutor';
}

// Pre-seeded demo account
export const USERS_STORE: MockUser[] = [
  {
    id: 'tutor-001',
    email: 'arif@example.com',
    password: 'password123',
    name: 'Arif Hassan',
    role: 'tutor',
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

export function findUserById(id: string): MockUser | undefined {
  return USERS_STORE.find((u) => u.id === id);
}
