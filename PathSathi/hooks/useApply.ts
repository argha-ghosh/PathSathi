// hooks/useApply.ts
// Handles apply + duplicate-check logic for the detail screen.

import { useState, useCallback, useRef } from 'react';
import type { Application } from '../types/tutor';
import { applyToPost, getMyApplications } from '../services/tutorApi';

interface UseApplyReturn {
  existingApplication: Application | null;
  applying: boolean;
  applyError: string | null;
  apply: (postId: string, message: string) => Promise<boolean>;
  setExistingApplication: (app: Application | null) => void;
}

/**
 * Manages the apply-to-post action and existing-application state.
 * The caller should pass in any pre-fetched existing application,
 * or call checkExisting() after loading the post.
 */
export function useApply(): UseApplyReturn {
  const [existingApplication, setExistingApplication] = useState<Application | null>(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const mountedRef = useRef(true);

  /** Attempts to apply; returns true on success, false on failure. */
  const apply = useCallback(
    async (postId: string, message: string): Promise<boolean> => {
      setApplying(true);
      setApplyError(null);
      try {
        const newApp = await applyToPost(postId, message);
        if (mountedRef.current) {
          setExistingApplication(newApp);
        }
        return true;
      } catch (err) {
        if (mountedRef.current) {
          setApplyError(
            err instanceof Error ? err.message : 'Failed to submit application.',
          );
        }
        return false;
      } finally {
        if (mountedRef.current) setApplying(false);
      }
    },
    [],
  );

  return { existingApplication, applying, applyError, apply, setExistingApplication };
}

/**
 * Utility: checks whether the tutor already has a non-withdrawn application for a post.
 * Call this once after loading the post detail.
 */
export async function findExistingApplication(
  postId: string,
): Promise<Application | null> {
  const apps = await getMyApplications();
  return apps.find((a) => a.postId === postId && a.status !== 'withdrawn') ?? null;
}
