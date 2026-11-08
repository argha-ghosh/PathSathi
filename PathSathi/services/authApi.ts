// services/authApi.ts
// Mock auth service – login, register, logout for both tutor and student roles.
// Swap internals for real API calls later without touching any screen.

import {
  USERS_STORE,
  findUserByEmailAndRole,
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
  role: 'tutor' | 'student';
  phone?: string;
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
  role: 'tutor' | 'student',
): Promise<AuthUser> {
  await delay();

  const user = findUserByEmailAndRole(email, role);
  if (!user || user.password !== password) {
    throw new AuthError('Invalid email or password. Please try again.');
  }

  setCurrentUserId(user.id);
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    phone: user.phone,
  };
}

// POST /auth/register (tutor)
export async function registerTutor(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  await delay();

  const existing = USERS_STORE.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === 'tutor',
  );
  if (existing) {
    throw new AuthError(
      'A tutor account with this email already exists. Please log in.',
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

  // Create a blank profile for the new tutor
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
  return { id: newUser.id, email: newUser.email, name: newUser.name, role: 'tutor' };
}

// POST /auth/register (student)
export async function registerStudent(
  name: string,
  email: string,
  password: string,
  phone: string,
): Promise<AuthUser> {
  await delay();

  const existing = USERS_STORE.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.role === 'student',
  );
  if (existing) {
    throw new AuthError(
      'A student account with this email already exists. Please log in.',
    );
  }

  const newUser: MockUser = {
    id: `student-${Date.now()}`,
    email: email.toLowerCase().trim(),
    password,
    name: name.trim(),
    phone: phone.trim(),
    role: 'student',
  };

  USERS_STORE.push(newUser);
  setCurrentUserId(newUser.id);
  return {
    id: newUser.id,
    email: newUser.email,
    name: newUser.name,
    role: 'student',
    phone: newUser.phone,
  };
}

// POST /auth/logout
export async function logout(): Promise<void> {
  await delay(200);
  setCurrentUserId(null);
}

// PUT /auth/profile
export async function updateProfile(
  id: string,
  data: { name: string; phone?: string },
): Promise<AuthUser> {
  await delay(500);
  const { updateUserById, findUserById } = await import('../mocks/authStore');
  const updated = updateUserById(id, data);
  if (!updated) throw new AuthError('User not found.');
  return {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
    phone: updated.phone,
  };
}
