// hooks/useTuitionPosts.ts
// Manages the tuition board list with filter state and 300 ms debounced search.

import { useState, useEffect, useCallback, useRef } from 'react';
import type { TuitionPost, PostFilters } from '../types/tutor';
import { getTuitionPosts } from '../services/tutorApi';

interface UseTuitionPostsReturn {
  data: TuitionPost[];
  loading: boolean;
  error: string | null;
  filters: PostFilters;
  /** Raw (non-debounced) search text – bind to TextInput value. */
  searchText: string;
  setSearch: (search: string) => void;
  setFilter: (
    key: keyof Omit<PostFilters, 'search'>,
    value: string | number | undefined,
  ) => void;
  clearFilters: () => void;
  refetch: () => void;
  hasActiveFilters: boolean;
}

const EMPTY_FILTERS: PostFilters = { search: '' };

export function useTuitionPosts(): UseTuitionPostsReturn {
  const [data, setData] = useState<TuitionPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PostFilters>(EMPTY_FILTERS);

  // Raw search text shown in the TextInput (debounced before hitting the API)
  const [searchText, setSearchText] = useState('');

  // Track mounted state to prevent setState after unmount
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Debounce search text changes into the filters object (300 ms)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setSearch = useCallback((text: string) => {
    setSearchText(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setFilters((prev) => ({ ...prev, search: text }));
      }
    }, 300);
  }, []);

  const setFilter = useCallback(
    (
      key: keyof Omit<PostFilters, 'search'>,
      value: string | number | undefined,
    ) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const clearFilters = useCallback(() => {
    setSearchText('');
    setFilters(EMPTY_FILTERS);
  }, []);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const posts = await getTuitionPosts(filters);
      if (mountedRef.current) setData(posts);
    } catch (err) {
      if (mountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load posts.');
      }
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetchPosts();
  }, [fetchPosts]);

  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.subject !== undefined ||
    filters.classLevel !== undefined ||
    filters.area !== undefined ||
    filters.minSalary !== undefined ||
    filters.maxSalary !== undefined;

  return {
    data,
    loading,
    error,
    filters,
    searchText,
    setSearch,
    setFilter,
    clearFilters,
    refetch: fetchPosts,
    hasActiveFilters,
  };
}
