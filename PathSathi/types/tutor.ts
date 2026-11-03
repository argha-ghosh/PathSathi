// types/tutor.ts
// Shared domain types for the Tutor module.
// Other modules should NOT import from here; share via a team-level types file when integrating.

export type PostStatus = 'open' | 'closed';
export type ApplicationStatus = 'pending' | 'accepted' | 'rejected' | 'withdrawn';
export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export interface TuitionPost {
  id: string;
  title: string;
  subject: string;
  classLevel: string;
  area: string;
  salary: number;
  daysPerWeek: number;
  description: string;
  status: PostStatus;
  guardianName: string;
  createdAt: string;
}

export interface Application {
  id: string;
  postId: string;
  message: string;
  status: ApplicationStatus;
  appliedAt: string;
  post: TuitionPost;
}

export interface TutorProfile {
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
  verification: { status: VerificationStatus; reason?: string };
}

export interface PostFilters {
  search: string;
  subject?: string;
  classLevel?: string;
  area?: string;
  minSalary?: number;
  maxSalary?: number;
}
