// types/student.ts
// Domain types for the Student module.

export interface StudentUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'student';
}

// ── Tutor Profile (read-only from student's perspective) ────────
export type TutorVerificationStatus = 'pending' | 'verified' | 'rejected';

export interface TutorProfilePublic {
  id: string;
  name: string;
  photo?: string;
  university: string;
  department: string;
  year: string;
  subjects: string[];
  classLevels: string[];
  areas: string[];
  expectedSalary: number;
  experience: string;
  availability: string[];
  bio: string;
  teachingMethod: 'Home' | 'Online' | 'Both';
  verification: { status: TutorVerificationStatus; reason?: string };
  rating: number;
  reviewCount: number;
}

// ── Student Tuition Post ─────────────────────────────────────────
export type StudentPostStatus = 'open' | 'filled' | 'closed';
export type TeachingMethod = 'Home Tuition' | 'Online' | 'Both';
export type TutorGender = 'Male' | 'Female' | 'Any';

export interface StudentTuitionPost {
  id: string;
  studentId: string;
  studentName: string;
  title: string;
  subject: string;
  classLevel: string;
  numberOfStudents: number;
  tutorGender: TutorGender;
  teachingMethod: TeachingMethod;
  daysPerWeek: number;
  preferredTime: string;
  division: string;
  district: string;
  area: string;
  minSalary: number;
  maxSalary: number;
  description: string;
  status: StudentPostStatus;
  createdAt: string;
  applicantCount: number;
}

// ── Application (tutor applies to student's post) ───────────────
export type StudentApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface StudentApplication {
  id: string;
  postId: string;
  tutorId: string;
  tutor: TutorProfilePublic;
  message: string;
  status: StudentApplicationStatus;
  appliedAt: string;
}

// ── Rating & Review ─────────────────────────────────────────────
export interface Review {
  id: string;
  tutorId: string;
  studentId: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// ── Filters ─────────────────────────────────────────────────────
export interface TutorFilters {
  search: string;
  subject?: string;
  classLevel?: string;
  area?: string;
  minSalary?: number;
  maxSalary?: number;
  teachingMethod?: string;
}

// ── Booking ──────────────────────────────────────────────────────
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface BookingRequest {
  id: string;
  studentId: string;
  tutorId: string;
  tutor: TutorProfilePublic;
  teachingMethod: string;
  daysPerWeek: number;
  preferredTime: string;
  message: string;
  status: BookingStatus;
  createdAt: string;
}
