// hooks/useTuitionPost.ts
// Fetches a single tuition post by id.

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TuitionPost } from '../types/tutor';
import { getTuitionPost } from '../services/tutorApi';

interface UseTuitionPostReturn {
  data: TuitionPost | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useTuitionPost(id: string): UseTuitionPostReturn {
  const [data, setData] = useState<TuitionPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const post = await getTuitionPost(id);
      if (mountedRef.current) setData(post);
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load post.');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
}
