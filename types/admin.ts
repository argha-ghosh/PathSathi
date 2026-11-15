// types/admin.ts
// Domain types for the Admin module.
// Imported by admin screens, adminApi, and adminStore.

// All possible roles across the app
export type UserRole = 'student' | 'tutor' | 'moderator' | 'admin';

// Status values for user accounts
export type UserStatus = 'active' | 'suspended' | 'banned';

// Category type — subjects vs class levels
export type CategoryType = 'subject' | 'class_level';

// ── Platform-wide statistics (for the dashboard) ────────────────
export interface PlatformStats {
  totalUsers: number;
  totalTutors: number;
  totalStudents: number;
  totalModerators: number;
  activePosts: number;
  acceptedApplications: number;
}

// ── A user record as seen by the admin ──────────────────────────
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string; // ISO 8601 date string
}

// Filters sent when fetching the user list
export interface UserFilters {
  search: string;
  role: UserRole | 'all';
  status: UserStatus | 'all';
}

// ── A moderator account ──────────────────────────────────────────
export interface Moderator {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

// Form data for creating a new moderator
export interface CreateModeratorForm {
  name: string;
  email: string;
  password: string;
}

// ── A subject or class level category ───────────────────────────
export interface Category {
  id: string;
  name: string;
  type: CategoryType;
}
