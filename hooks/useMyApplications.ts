// hooks/useMyApplications.ts
// Fetches the current tutor's applications and handles withdraw.

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Application, ApplicationStatus } from '../types/tutor';
import { getMyApplications, withdrawApplication } from '../services/tutorApi';

interface UseMyApplicationsReturn {
  data: Application[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  withdraw: (id: string) => Promise<boolean>;
  withdrawing: string | null; // id of the application being withdrawn
  withdrawError: string | null;
}

export function useMyApplications(): UseMyApplicationsReturn {
  const [data, setData] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [withdrawing, setWithdrawing] = useState<string | null>(null);
  const [withdrawError, setWithdrawError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apps = await getMyApplications();
      if (mountedRef.current) setData(apps);
    } catch (err) {
      if (mountedRef.current) {
        setError(
          err instanceof Error ? err.message : 'Failed to load applications.',
        );
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  const withdraw = useCallback(async (id: string): Promise<boolean> => {
    setWithdrawing(id);
    setWithdrawError(null);
    try {
      const updated = await withdrawApplication(id);
      if (mountedRef.current) {
        setData((prev) =>
          prev.map((a) => (a.id === updated.id ? { ...updated } : a)),
        );
      }
      return true;
    } catch (err) {
      if (mountedRef.current) {
        setWithdrawError(
          err instanceof Error ? err.message : 'Failed to withdraw application.',
        );
      }
      return false;
    } finally {
      if (mountedRef.current) setWithdrawing(null);
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchApplications,
    withdraw,
    withdrawing,
    withdrawError,
  };
}

/** Filter helper – used by the applications screen for status tabs. */
export function filterByStatus(
  apps: Application[],
  status: ApplicationStatus | 'all',
): Application[] {
  if (status === 'all') return apps;
  return apps.filter((a) => a.status === status);
}
