// services/tutorApi.ts
// Mock service layer that mimics a real REST API.
// Each function is async with a realistic delay (400-900 ms).
// Swap the internals for real fetch() calls later without touching any screen.

import type {
  TuitionPost,
  Application,
  TutorProfile,
  PostFilters,
  ApplicationStatus,
} from '../types/tutor';
import { POSTS_STORE } from '../mocks/tuitionPosts';
import { APPLICATIONS_STORE } from '../mocks/applications';
import { PROFILE_STORE } from '../mocks/tutorProfile';

// ---------------------------------------------------------------------------
// ApiError
// ---------------------------------------------------------------------------

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly code: number = 500,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// ---------------------------------------------------------------------------
// Dev toggle – call setMockFailure(true) to make every call throw
// ---------------------------------------------------------------------------

let _mockFailure = false;

/** Toggle simulated API failures for demoing error states. */
export function setMockFailure(fail: boolean): void {
  _mockFailure = fail;
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Simulates network latency between 400 and 900 ms. */
function delay(): Promise<void> {
  const ms = 400 + Math.random() * 500;
  return new Promise((res) => setTimeout(res, ms));
}

async function simulate(): Promise<void> {
  await delay();
  if (_mockFailure) {
    throw new ApiError('Network error. Please check your connection and try again.', 503);
  }
}

// ---------------------------------------------------------------------------
// Service functions
// ---------------------------------------------------------------------------

// GET /tuition-posts
/** Fetches all tuition posts, optionally filtered. Only returns open posts by default. */
export async function getTuitionPosts(
  filters?: PostFilters,
): Promise<TuitionPost[]> {
  await simulate();

  let results = POSTS_STORE.filter((p) => p.status === 'open');

  if (!filters) return results;

  const { search, subject, classLevel, area, minSalary, maxSalary } = filters;

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.subject.toLowerCase().includes(q) ||
        p.area.toLowerCase().includes(q),
    );
  }

  if (subject) {
    results = results.filter((p) => p.subject === subject);
  }

  if (classLevel) {
    results = results.filter((p) => p.classLevel === classLevel);
  }

  if (area) {
    results = results.filter((p) => p.area === area);
  }

  if (minSalary !== undefined) {
    results = results.filter((p) => p.salary >= minSalary);
  }

  if (maxSalary !== undefined) {
    results = results.filter((p) => p.salary <= maxSalary);
  }

  return results;
}

// GET /tuition-posts/:id
/** Fetches a single tuition post by ID. Throws 404 if not found. */
export async function getTuitionPost(id: string): Promise<TuitionPost> {
  await simulate();

  const post = POSTS_STORE.find((p) => p.id === id);
  if (!post) {
    throw new ApiError(`Tuition post not found.`, 404);
  }
  return { ...post };
}

// POST /applications
/** Applies to a tuition post with a message. Rejects duplicates and closed posts. */
export async function applyToPost(
  postId: string,
  message: string,
): Promise<Application> {
  await simulate();

  const post = POSTS_STORE.find((p) => p.id === postId);
  if (!post) {
    throw new ApiError('Tuition post not found.', 404);
  }

  if (post.status === 'closed') {
    throw new ApiError('This tuition post is no longer accepting applications.', 409);
  }

  const existing = APPLICATIONS_STORE.find(
    (a) => a.postId === postId && a.status !== 'withdrawn',
  );
  if (existing) {
    throw new ApiError('You have already applied to this post.', 409);
  }

  const newApp: Application = {
    id: `app-${Date.now()}`,
    postId,
    message,
    status: 'pending' as ApplicationStatus,
    appliedAt: new Date().toISOString(),
    post: { ...post },
  };

  APPLICATIONS_STORE.push(newApp);
  return { ...newApp };
}

// GET /applications/me
/** Fetches the current tutor's applications. */
export async function getMyApplications(): Promise<Application[]> {
  await simulate();
  // Return copies to avoid external mutation
  return APPLICATIONS_STORE.map((a) => ({ ...a, post: { ...a.post } }));
}

// PATCH /applications/:id
/** Withdraws a pending application. Throws if the application is not pending. */
export async function withdrawApplication(id: string): Promise<Application> {
  await simulate();

  const index = APPLICATIONS_STORE.findIndex((a) => a.id === id);
  if (index === -1) {
    throw new ApiError('Application not found.', 404);
  }

  const app = APPLICATIONS_STORE[index];
  if (app.status !== 'pending') {
    throw new ApiError('Only pending applications can be withdrawn.', 409);
  }

  APPLICATIONS_STORE[index] = { ...app, status: 'withdrawn' };
  return { ...APPLICATIONS_STORE[index], post: { ...APPLICATIONS_STORE[index].post } };
}

// GET /tutors/me
/** Fetches the current tutor's profile. */
export async function getMyProfile(): Promise<TutorProfile> {
  await simulate();
  return {
    ...PROFILE_STORE.value,
    verification: { ...PROFILE_STORE.value.verification },
    subjects: [...PROFILE_STORE.value.subjects],
    classLevels: [...PROFILE_STORE.value.classLevels],
    areas: [...PROFILE_STORE.value.areas],
    availability: [...PROFILE_STORE.value.availability],
  };
}

// PUT /tutors/me
/** Updates the current tutor's profile fields (excludes id and verification). */
export async function updateMyProfile(
  data: Omit<TutorProfile, 'id' | 'verification'>,
): Promise<TutorProfile> {
  await simulate();

  PROFILE_STORE.value = {
    ...PROFILE_STORE.value,
    ...data,
    subjects: [...data.subjects],
    classLevels: [...data.classLevels],
    areas: [...data.areas],
    availability: [...data.availability],
  };

  return {
    ...PROFILE_STORE.value,
    verification: { ...PROFILE_STORE.value.verification },
  };
}
