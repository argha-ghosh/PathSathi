// hooks/useTutorProfile.ts
// Fetches and updates the current tutor's profile.

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TutorProfile } from '../types/tutor';
import { getMyProfile, updateMyProfile } from '../services/tutorApi';

interface UseTutorProfileReturn {
  data: TutorProfile | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  saveProfile: (data: Omit<TutorProfile, 'id' | 'verification'>) => Promise<boolean>;
  saving: boolean;
  saveError: string | null;
}

export function useTutorProfile(): UseTutorProfileReturn {
  const [data, setData] = useState<TutorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const profile = await getMyProfile();
      if (mountedRef.current) setData(profile);
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load profile.');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  const saveProfile = useCallback(
    async (
      profileData: Omit<TutorProfile, 'id' | 'verification'>,
    ): Promise<boolean> => {
      setSaving(true);
      setSaveError(null);
      try {
        const updated = await updateMyProfile(profileData);
        if (mountedRef.current) setData(updated);
        return true;
      } catch (err) {
        if (mountedRef.current) {
          setSaveError(
            err instanceof Error ? err.message : 'Failed to save profile.',
          );
        }
        return false;
      } finally {
        if (mountedRef.current) setSaving(false);
      }
    },
    [],
  );

  return {
    data,
    loading,
    error,
    refetch: fetchProfile,
    saveProfile,
    saving,
    saveError,
  };
}

/** Standalone helper – checks whether any required profile field is missing. */
export function checkProfileIncomplete(profile: TutorProfile): boolean {
  return (
    !profile.name.trim() ||
    !profile.university.trim() ||
    !profile.department.trim() ||
    !profile.year.trim() ||
    profile.subjects.length === 0 ||
    profile.classLevels.length === 0 ||
    profile.areas.length === 0 ||
    profile.expectedSalary <= 0
  );
}
