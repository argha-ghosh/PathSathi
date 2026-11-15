// services/adminApi.ts
// Mock admin API — simulates real network calls with delay, success, and error states.
// Phase 2: replace each function body with a real fetch() call.
// All function signatures stay the same — screens never need to change.

import type {
  AdminUser,
  Category,
  CategoryType,
  CreateModeratorForm,
  Moderator,
  PlatformStats,
  UserFilters,
  UserStatus,
} from '../types/admin';
import {
  ADMIN_USERS_STORE,
  CLASS_LEVELS_STORE,
  MODERATORS_STORE,
  SUBJECTS_STORE,
  getStats,
} from '../mocks/adminStore';

// Simulated network delay in milliseconds
function delay(ms = 700): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

// Custom error class — mirrors what a real API client would throw on 4xx/5xx
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ── GET /api/admin/stats ─────────────────────────────────────────
export async function getAdminStats(): Promise<PlatformStats> {
  await delay(800);
  return { ...getStats() }; // return a copy so callers can't mutate the store
}

// ── GET /api/admin/users?search=&role=&status= ───────────────────
export async function getUsers(filters: UserFilters): Promise<AdminUser[]> {
  await delay();

  let results = [...ADMIN_USERS_STORE];

  // Filter by search text (name or email, case-insensitive)
  if (filters.search.trim()) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }

  // Filter by role
  if (filters.role !== 'all') {
    results = results.filter((u) => u.role === filters.role);
  }

  // Filter by status
  if (filters.status !== 'all') {
    results = results.filter((u) => u.status === filters.status);
  }

  return results.map((u) => ({ ...u })); // return copies
}

// ── GET /api/admin/users/:id ─────────────────────────────────────
export async function getUserById(id: string): Promise<AdminUser> {
  await delay(500);

  const user = ADMIN_USERS_STORE.find((u) => u.id === id);
  if (!user) throw new ApiError(404, 'User not found.');
  return { ...user };
}

// ── PATCH /api/admin/users/:id/status ───────────────────────────
export async function updateUserStatus(
  id: string,
  status: UserStatus,
): Promise<AdminUser> {
  await delay(600);

  const index = ADMIN_USERS_STORE.findIndex((u) => u.id === id);
  if (index === -1) throw new ApiError(404, 'User not found.');

  // Mutate the in-memory store
  ADMIN_USERS_STORE[index] = { ...ADMIN_USERS_STORE[index], status };
  return { ...ADMIN_USERS_STORE[index] };
}

// ── GET /api/admin/moderators ────────────────────────────────────
export async function getModerators(): Promise<Moderator[]> {
  await delay();
  return MODERATORS_STORE.map((m) => ({ ...m }));
}

// ── POST /api/admin/moderators ───────────────────────────────────
export async function createModerator(
  form: CreateModeratorForm,
): Promise<Moderator> {
  await delay(800);

  // Check for duplicate email
  const exists = MODERATORS_STORE.find(
    (m) => m.email.toLowerCase() === form.email.toLowerCase(),
  );
  if (exists) throw new ApiError(409, 'A moderator with this email already exists.');

  const newMod: Moderator = {
    id: `mod-${Date.now()}`,
    name: form.name.trim(),
    email: form.email.toLowerCase().trim(),
    joinedAt: new Date().toISOString(),
  };

  MODERATORS_STORE.unshift(newMod); // add to front so it appears at the top
  return { ...newMod };
}

// ── DELETE /api/admin/moderators/:id ────────────────────────────
export async function deleteModerator(id: string): Promise<void> {
  await delay(600);

  const index = MODERATORS_STORE.findIndex((m) => m.id === id);
  if (index === -1) throw new ApiError(404, 'Moderator not found.');

  MODERATORS_STORE.splice(index, 1);
}

// ── GET /api/admin/categories?type= ─────────────────────────────
export async function getCategories(type: CategoryType): Promise<Category[]> {
  await delay(500);

  const store = type === 'subject' ? SUBJECTS_STORE : CLASS_LEVELS_STORE;
  return store.map((c) => ({ ...c }));
}

// ── POST /api/admin/categories ───────────────────────────────────
export async function createCategory(
  name: string,
  type: CategoryType,
): Promise<Category> {
  await delay(600);

  const store = type === 'subject' ? SUBJECTS_STORE : CLASS_LEVELS_STORE;

  // Duplicate check (case-insensitive)
  const dup = store.find((c) => c.name.toLowerCase() === name.trim().toLowerCase());
  if (dup) throw new ApiError(409, `"${name}" already exists in this category.`);

  const prefix = type === 'subject' ? 'subj' : 'cl';
  const newCat: Category = {
    id: `${prefix}-${Date.now()}`,
    name: name.trim(),
    type,
  };

  store.push(newCat);
  return { ...newCat };
}

// ── PATCH /api/admin/categories/:id ─────────────────────────────
export async function updateCategory(
  id: string,
  name: string,
): Promise<Category> {
  await delay(600);

  // Search both stores
  for (const store of [SUBJECTS_STORE, CLASS_LEVELS_STORE]) {
    const index = store.findIndex((c) => c.id === id);
    if (index !== -1) {
      // Duplicate check within same store
      const dup = store.find(
        (c) => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== id,
      );
      if (dup) throw new ApiError(409, `"${name}" already exists in this category.`);

      store[index] = { ...store[index], name: name.trim() };
      return { ...store[index] };
    }
  }

  throw new ApiError(404, 'Category not found.');
}

// ── DELETE /api/admin/categories/:id ────────────────────────────
export async function deleteCategory(id: string): Promise<void> {
  await delay(500);

  for (const store of [SUBJECTS_STORE, CLASS_LEVELS_STORE]) {
    const index = store.findIndex((c) => c.id === id);
    if (index !== -1) {
      store.splice(index, 1);
      return;
    }
  }

  throw new ApiError(404, 'Category not found.');
}
