// services/studentApi.ts
// Mock service layer for the Student module.
// Swap internals for real fetch() calls without touching any screen.

import type {
  TutorProfilePublic,
  StudentTuitionPost,
  StudentApplication,
  TutorFilters,
  StudentApplicationStatus,
  Review,
} from '../types/student';
import { TUTORS_STORE } from '../mocks/tutors';
import { STUDENT_POSTS_STORE, APPLICATIONS_STORE } from '../mocks/studentPosts';
import { REVIEWS_STORE } from '../mocks/reviews';

export class ApiError extends Error {
  constructor(message: string, public readonly code: number = 500) {
    super(message);
    this.name = 'ApiError';
  }
}

function delay(): Promise<void> {
  return new Promise((res) => setTimeout(res, 400 + Math.random() * 400));
}

// ── GET /tutors ──────────────────────────────────────────────────
export async function getTutors(filters?: TutorFilters): Promise<TutorProfilePublic[]> {
  await delay();
  let results = TUTORS_STORE.filter((t) => t.verification.status === 'verified');
  if (!filters) return results;

  const { search, subject, classLevel, area, minSalary, maxSalary, teachingMethod } = filters;

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.subjects.some((s) => s.toLowerCase().includes(q)) ||
        t.university.toLowerCase().includes(q) ||
        t.areas.some((a) => a.toLowerCase().includes(q)),
    );
  }
  if (subject) results = results.filter((t) => t.subjects.includes(subject));
  if (classLevel) results = results.filter((t) => t.classLevels.includes(classLevel));
  if (area) results = results.filter((t) => t.areas.includes(area));
  if (minSalary !== undefined) results = results.filter((t) => t.expectedSalary >= minSalary);
  if (maxSalary !== undefined) results = results.filter((t) => t.expectedSalary <= maxSalary);
  if (teachingMethod && teachingMethod !== 'Both') {
    results = results.filter(
      (t) => t.teachingMethod === teachingMethod || t.teachingMethod === 'Both',
    );
  }
  return results;
}

// ── GET /tutors/:id ──────────────────────────────────────────────
export async function getTutorById(id: string): Promise<TutorProfilePublic> {
  await delay();
  const tutor = TUTORS_STORE.find((t) => t.id === id);
  if (!tutor) throw new ApiError('Tutor not found.', 404);
  return { ...tutor };
}

// ── GET /tutors/:id/reviews ──────────────────────────────────────
export async function getTutorReviews(tutorId: string): Promise<Review[]> {
  await delay();
  return REVIEWS_STORE.filter((r) => r.tutorId === tutorId).map((r) => ({ ...r }));
}

// ── POST /tutors/:id/reviews ─────────────────────────────────────
export async function submitReview(
  tutorId: string,
  studentId: string,
  studentName: string,
  rating: number,
  comment: string,
): Promise<Review> {
  await delay();
  const existing = REVIEWS_STORE.find(
    (r) => r.tutorId === tutorId && r.studentId === studentId,
  );
  if (existing) throw new ApiError('You have already reviewed this tutor.', 409);

  const newReview: Review = {
    id: `rev-${Date.now()}`,
    tutorId,
    studentId,
    studentName,
    rating,
    comment,
    createdAt: new Date().toISOString(),
  };
  REVIEWS_STORE.push(newReview);

  // Update tutor average rating
  const tutorIndex = TUTORS_STORE.findIndex((t) => t.id === tutorId);
  if (tutorIndex !== -1) {
    const allReviews = REVIEWS_STORE.filter((r) => r.tutorId === tutorId);
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    TUTORS_STORE[tutorIndex] = {
      ...TUTORS_STORE[tutorIndex],
      rating: Math.round(avg * 10) / 10,
      reviewCount: allReviews.length,
    };
  }

  return { ...newReview };
}

// ── POST /student/tuition-posts ──────────────────────────────────
export async function createTuitionPost(
  data: Omit<StudentTuitionPost, 'id' | 'createdAt' | 'applicantCount'>,
): Promise<StudentTuitionPost> {
  await delay();
  const newPost: StudentTuitionPost = {
    ...data,
    id: `spost-${Date.now()}`,
    createdAt: new Date().toISOString(),
    applicantCount: 0,
  };
  STUDENT_POSTS_STORE.push(newPost);
  return { ...newPost };
}

// ── GET /student/tuition-posts ───────────────────────────────────
export async function getMyPosts(studentId: string): Promise<StudentTuitionPost[]> {
  await delay();
  return STUDENT_POSTS_STORE.filter((p) => p.studentId === studentId).map((p) => ({ ...p }));
}

// ── PATCH /student/tuition-posts/:id/status ──────────────────────
export async function updatePostStatus(
  postId: string,
  status: StudentTuitionPost['status'],
): Promise<StudentTuitionPost> {
  await delay();
  const index = STUDENT_POSTS_STORE.findIndex((p) => p.id === postId);
  if (index === -1) throw new ApiError('Post not found.', 404);
  STUDENT_POSTS_STORE[index] = { ...STUDENT_POSTS_STORE[index], status };
  return { ...STUDENT_POSTS_STORE[index] };
}

// ── GET /student/tuition-posts/:id/applicants ────────────────────
export async function getApplicants(postId: string): Promise<StudentApplication[]> {
  await delay();
  return APPLICATIONS_STORE.filter((a) => a.postId === postId).map((a) => ({
    ...a,
    tutor: { ...a.tutor },
  }));
}

// ── PATCH /student/applications/:id/status ───────────────────────
export async function updateApplicationStatus(
  applicationId: string,
  status: StudentApplicationStatus,
): Promise<StudentApplication> {
  await delay();
  const index = APPLICATIONS_STORE.findIndex((a) => a.id === applicationId);
  if (index === -1) throw new ApiError('Application not found.', 404);

  const app = APPLICATIONS_STORE[index];
  if (app.status !== 'pending') {
    throw new ApiError('Only pending applications can be updated.', 409);
  }

  APPLICATIONS_STORE[index] = { ...app, status };
  return {
    ...APPLICATIONS_STORE[index],
    tutor: { ...APPLICATIONS_STORE[index].tutor },
  };
}

// ── POST /bookings ────────────────────────────────────────────────
export async function sendBookingRequest(
  studentId: string,
  tutorId: string,
  teachingMethod: string,
  daysPerWeek: number,
  preferredTime: string,
  message: string,
): Promise<import('../types/student').BookingRequest> {
  await delay();
  const { BOOKINGS_STORE } = await import('../mocks/bookings');
  const tutor = TUTORS_STORE.find((t) => t.id === tutorId);
  if (!tutor) throw new ApiError('Tutor not found.', 404);

  const newBooking: import('../types/student').BookingRequest = {
    id: `booking-${Date.now()}`,
    studentId,
    tutorId,
    tutor: { ...tutor },
    teachingMethod,
    daysPerWeek,
    preferredTime,
    message,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  BOOKINGS_STORE.push(newBooking);
  return { ...newBooking };
}

// ── GET /bookings ─────────────────────────────────────────────────
export async function getMyBookings(
  studentId: string,
): Promise<import('../types/student').BookingRequest[]> {
  await delay();
  const { BOOKINGS_STORE } = await import('../mocks/bookings');
  return BOOKINGS_STORE.filter((b) => b.studentId === studentId).map((b) => ({
    ...b,
    tutor: { ...b.tutor },
  }));
}
