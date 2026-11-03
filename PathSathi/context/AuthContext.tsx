// context/AuthContext.tsx
// Provides auth state and the tutor profile to the whole app.
// Using a single shared context fixes the stale-profile bug that occurred
// when the edit screen saved and navigated back — the profile view screen
// now reads from the same source and re-renders automatically.

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import type { TutorProfile } from '../types/tutor';
import type { AuthUser } from '../services/authApi';
import {
  login as apiLogin,
  register as apiRegister,
  logout as apiLogout,
} from '../services/authApi';
import {
  getMyProfile,
  updateMyProfile,
} from '../services/tutorApi';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextValue {
  // Auth
  user: AuthUser | null;
  authLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;

  // Profile (shared across all screens)
  profile: TutorProfile | null;
  profileLoading: boolean;
  profileError: string | null;
  refetchProfile: () => Promise<void>;
  saveProfile: (data: Omit<TutorProfile, 'id' | 'verification'>) => Promise<boolean>;
  saving: boolean;
  saveError: string | null;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // Load profile whenever a user logs in
  const fetchProfile = useCallback(async () => {
    setProfileLoading(true);
    setProfileError(null);
    try {
      const p = await getMyProfile();
      if (mountedRef.current) setProfile(p);
    } catch (err) {
      if (mountedRef.current) {
        setProfileError(
          err instanceof Error ? err.message : 'Failed to load profile.',
        );
      }
    } finally {
      if (mountedRef.current) setProfileLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void fetchProfile();
    } else {
      setProfile(null);
      setProfileError(null);
    }
  }, [user, fetchProfile]);

  // ---------------------------------------------------------------------------
  // Auth actions
  // ---------------------------------------------------------------------------

  const login = useCallback(async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const authUser = await apiLogin(email, password);
      if (mountedRef.current) setUser(authUser);
    } finally {
      if (mountedRef.current) setAuthLoading(false);
    }
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      setAuthLoading(true);
      try {
        const authUser = await apiRegister(name, email, password);
        if (mountedRef.current) setUser(authUser);
      } finally {
        if (mountedRef.current) setAuthLoading(false);
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await apiLogout();
    if (mountedRef.current) {
      setUser(null);
      setProfile(null);
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Profile actions
  // ---------------------------------------------------------------------------

  const saveProfile = useCallback(
    async (data: Omit<TutorProfile, 'id' | 'verification'>): Promise<boolean> => {
      setSaving(true);
      setSaveError(null);
      try {
        const updated = await updateMyProfile(data);
        // Update shared state → all screens see the new data immediately
        if (mountedRef.current) setProfile(updated);
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

  const value: AuthContextValue = {
    user,
    authLoading,
    login,
    register,
    logout,
    profile,
    profileLoading,
    profileError,
    refetchProfile: fetchProfile,
    saveProfile,
    saving,
    saveError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
