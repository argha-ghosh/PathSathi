// context/AuthContext.tsx
// Unified auth context for both Tutor and Student roles.
// User session is persisted in AsyncStorage so login survives app restarts.

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { TutorProfile } from '../types/tutor';
import type { AuthUser } from '../services/authApi';
import {
  login as apiLogin,
  registerTutor as apiRegisterTutor,
  registerStudent as apiRegisterStudent,
  logout as apiLogout,
} from '../services/authApi';
import { setCurrentUserId } from '../mocks/authStore';
import {
  getMyProfile,
  updateMyProfile,
} from '../services/tutorApi';

const SESSION_KEY = '@pathsathi_user';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextValue {
  user: AuthUser | null;
  // true while restoring session OR during login/register
  authLoading: boolean;

  login: (email: string, password: string, role: 'tutor' | 'student' | 'admin' | 'moderator') => Promise<void>;
  registerTutor: (name: string, email: string, password: string) => Promise<void>;
  registerStudent: (name: string, email: string, password: string, phone: string) => Promise<void>;
  logout: () => Promise<void>;

  // Tutor Profile (only populated when role === 'tutor')
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
  // Start true — we're restoring session on mount
  const [authLoading, setAuthLoading] = useState(true);

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

  // ── Restore session on mount ──────────────────────────────────
  useEffect(() => {
    async function restoreSession() {
      try {
        const stored = await AsyncStorage.getItem(SESSION_KEY);
        if (stored) {
          const restored: AuthUser = JSON.parse(stored);
          // Re-sync the in-memory mock store so API calls work
          setCurrentUserId(restored.id);
          if (mountedRef.current) setUser(restored);
        }
      } catch {
        // Corrupted storage — ignore and stay logged out
        await AsyncStorage.removeItem(SESSION_KEY);
      } finally {
        if (mountedRef.current) setAuthLoading(false);
      }
    }
    void restoreSession();
  }, []);

  // ── Persist user whenever it changes ─────────────────────────
  useEffect(() => {
    if (user) {
      void AsyncStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      void AsyncStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  // ── Load tutor profile whenever a tutor is set ───────────────
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
    if (user?.role === 'tutor') {
      void fetchProfile();
    } else {
      setProfile(null);
      setProfileError(null);
    }
  }, [user, fetchProfile]);

  // ---------------------------------------------------------------------------
  // Auth actions
  // ---------------------------------------------------------------------------

  const login = useCallback(async (
    email: string,
    password: string,
    role: 'tutor' | 'student' | 'admin' | 'moderator',
  ) => {
    setAuthLoading(true);
    try {
      const authUser = await apiLogin(email, password, role);
      if (mountedRef.current) setUser(authUser);
    } finally {
      if (mountedRef.current) setAuthLoading(false);
    }
  }, []);

  const registerTutor = useCallback(
    async (name: string, email: string, password: string) => {
      setAuthLoading(true);
      try {
        const authUser = await apiRegisterTutor(name, email, password);
        if (mountedRef.current) setUser(authUser);
      } finally {
        if (mountedRef.current) setAuthLoading(false);
      }
    },
    [],
  );

  const registerStudent = useCallback(
    async (name: string, email: string, password: string, phone: string) => {
      setAuthLoading(true);
      try {
        const authUser = await apiRegisterStudent(name, email, password, phone);
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
  // Tutor Profile actions
  // ---------------------------------------------------------------------------

  const saveProfile = useCallback(
    async (data: Omit<TutorProfile, 'id' | 'verification'>): Promise<boolean> => {
      setSaving(true);
      setSaveError(null);
      try {
        const updated = await updateMyProfile(data);
        if (mountedRef.current) {
          setProfile(updated);
          // Also update the stored user name if it changed
          setUser((prev) =>
            prev ? { ...prev, name: updated.name } : prev,
          );
        }
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
    registerTutor,
    registerStudent,
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
