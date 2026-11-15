// mocks/applications.ts
// Seed applications in 4 different statuses for demo purposes.
// The in-memory store is mutated by applyToPost and withdrawApplication.

import type { Application } from '../types/tutor';
import { POSTS_STORE } from './tuitionPosts';

// Helper to find a post by id (safe – throws at dev time if mock data drifts)
function findPost(id: string) {
  const post = POSTS_STORE.find((p) => p.id === id);
  if (!post) throw new Error(`Mock setup error: post ${id} not found`);
  return post;
}

export const APPLICATIONS_STORE: Application[] = [
  {
    id: 'app-01',
    postId: 'post-03',
    message:
      'I am a 3rd-year CSE student at AIUB with two years of tutoring experience. I have helped multiple students improve their English writing and grammar skills for the SSC exam. I can provide structured lessons and weekly mock tests.',
    status: 'pending',
    appliedAt: '2026-10-28T10:00:00Z',
    post: findPost('post-03'),
  },
  {
    id: 'app-02',
    postId: 'post-05',
    message:
      'I have strong ICT knowledge and have been teaching computer fundamentals to junior students for over a year. I can cover the full Class 8 ICT syllabus and help with practical exercises.',
    status: 'accepted',
    appliedAt: '2026-10-24T14:30:00Z',
    post: findPost('post-05'),
  },
  {
    id: 'app-03',
    postId: 'post-09',
    message:
      "I have experience tutoring Class 7 math and science. My approach focuses on building confidence through simple explanations and plenty of practice problems tailored to the student's pace.",
    status: 'rejected',
    appliedAt: '2026-10-22T08:00:00Z',
    post: findPost('post-09'),
  },
  {
    id: 'app-04',
    postId: 'post-10',
    message:
      'I can help with Class 6 English and Bangla. I understand the challenges of adapting to a new school environment and will ensure the student catches up smoothly with a friendly approach.',
    status: 'withdrawn',
    appliedAt: '2026-10-20T09:00:00Z',
    post: findPost('post-10'),
  },
];
