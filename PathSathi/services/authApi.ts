// services/authApi.ts
// Mock auth service – login, register, logout.
// Swap internals for real API calls later without touching any screen.

import {
  USERS_STORE,
  findUserByEmail,
  setCurrentUserId,
  type MockUser,
} from '../mocks/authStore';
import { PROFILE_STORE } from '../mocks/tutorProfile';

function delay(ms = 600): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'tutor';
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

// POST /auth/login
export async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  await delay();

  const user = findUserByEmail(email);
  if (!user || user.password !== password) {
    throw new AuthError('Invalid email or password. Please try again.');
  }

  setCurrentUserId(user.id);
  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

// POST /auth/register
export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  await delay();

  const existing = findUserByEmail(email);
  if (existing) {
    throw new AuthError(
      'An account with this email already exists. Please log in.',
    );
  }

  const newUser: MockUser = {
    id: `tutor-${Date.now()}`,
    email: email.toLowerCase().trim(),
    password,
    name: name.trim(),
    role: 'tutor',
  };

  USERS_STORE.push(newUser);

  // Create a blank profile for the new user
  PROFILE_STORE.value = {
    id: newUser.id,
    name: newUser.name,
    university: '',
    department: '',
    year: '',
    subjects: [],
    classLevels: [],
    areas: [],
    expectedSalary: 0,
    experience: '',
    availability: [],
    bio: '',
    verification: { status: 'pending' },
  };

  setCurrentUserId(newUser.id);
  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: newUser.role,
  };
}

// POST /auth/logout
export async function logout(): Promise<void> {
  await delay(200);
  setCurrentUserId(null);
}
