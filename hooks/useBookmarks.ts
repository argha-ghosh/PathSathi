// hooks/useBookmarks.ts
// Global bookmark store with cross-screen sync.
// All hook instances share the same Set and listener list,
// so toggling on one screen immediately updates all others.

import { useCallback, useEffect, useState } from 'react';

// ── Shared state ─────────────────────────────────────────────────
const STORE = new Set<string>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

// ── Hook ─────────────────────────────────────────────────────────
export function useBookmarks() {
  const [, forceUpdate] = useState(0);

  // Subscribe to global changes on mount, unsubscribe on unmount
  useEffect(() => {
    const handler = () => forceUpdate((n) => n + 1);
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  const isBookmarked = useCallback((tutorId: string): boolean => {
    return STORE.has(tutorId);
  }, []);

  const toggleBookmark = useCallback((tutorId: string): void => {
    if (STORE.has(tutorId)) {
      STORE.delete(tutorId);
    } else {
      STORE.add(tutorId);
    }
    notify(); // re-render ALL screens using this hook
  }, []);

  const bookmarkedIds = useCallback((): string[] => {
    return Array.from(STORE);
  }, []);

  const clearAll = useCallback((): void => {
    STORE.clear();
    notify();
  }, []);

  return { isBookmarked, toggleBookmark, bookmarkedIds, clearAll };
}
