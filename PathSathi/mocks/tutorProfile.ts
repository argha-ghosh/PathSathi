// mocks/tutorProfile.ts
// The signed-in tutor's profile.
// Verification is set to 'rejected' by default so the rejection state is immediately visible.
// To test other states, change INITIAL_VERIFICATION below:
//   'pending'  → shows pending badge + complete-profile banner (if fields empty)
//   'verified' → shows verified badge
//   'rejected' → shows rejected badge + rejection reason box

import type { TutorProfile } from '../types/tutor';

const INITIAL_VERIFICATION: TutorProfile['verification'] = {
  status: 'rejected',
  reason:
    'Your national ID document was not clearly visible. Please re-upload a high-quality scan.',
};

// Mutable in-memory store – updateMyProfile replaces this object
export const PROFILE_STORE: { value: TutorProfile } = {
  value: {
    id: 'tutor-001',
    name: 'Arif Hassan',
    university: 'American International University-Bangladesh (AIUB)',
    department: 'Computer Science and Engineering',
    year: '3rd Year',
    subjects: ['Math', 'Physics', 'ICT'],
    classLevels: ['Class 8', 'Class 9', 'Class 10', 'SSC'],
    areas: ['Mirpur', 'Dhanmondi', 'Mohammadpur'],
    expectedSalary: 5000,
    experience:
      'Two years of tutoring experience with 8 students. Specialise in helping students build problem-solving skills for board exams.',
    availability: ['Sat', 'Sun', 'Mon', 'Wed'],
    bio: 'CSE student at AIUB passionate about teaching. I believe every student can excel with the right guidance and practice.',
    verification: INITIAL_VERIFICATION,
  },
};
