// app/(admin)/dashboard.tsx
// AdminDashboardScreen — shows platform statistics as stat cards.
//
// States handled:
//  • loading  → spinner
//  • error    → ErrorView with Retry
//  • success  → 2-column grid of StatCards
//
// Pull-to-refresh reloads the stats.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { getAdminStats } from '../../services/adminApi';
import type { PlatformStats } from '../../types/admin';
import { useAuth } from '../../context/AuthContext';

import StatCard from '../../components/admin/StatCard';
import LoadingView from '../../components/admin/LoadingView';
import ErrorView from '../../components/admin/ErrorView';
import ScreenContainer from '../../components/admin/ScreenContainer';
import {
  Colors,
  Spacing,
  Typography,
  Radius,
  Shadow,
} from '../../constants/theme';

// Config for each stat card: what to show and how to colour it
const STAT_CONFIG = [
  {
    key: 'totalUsers' as keyof PlatformStats,
    label: 'Total Users',
    icon: 'people-outline' as const,
    iconColor: Colors.primary,
    iconBg: Colors.primarySurface,
  },
  {
    key: 'totalTutors' as keyof PlatformStats,
    label: 'Tutors',
    icon: 'school-outline' as const,
    iconColor: '#1D4ED8',
    iconBg: '#EFF6FF',
  },
  {
    key: 'totalStudents' as keyof PlatformStats,
    label: 'Students',
    icon: 'person-outline' as const,
    iconColor: Colors.success,
    iconBg: Colors.successSurface,
  },
  {
    key: 'totalModerators' as keyof PlatformStats,
    label: 'Moderators',
    icon: 'shield-checkmark-outline' as const,
    iconColor: '#6D28D9',
    iconBg: '#F5F3FF',
  },
  {
    key: 'activePosts' as keyof PlatformStats,
    label: 'Active Posts',
    icon: 'document-text-outline' as const,
    iconColor: Colors.warning,
    iconBg: Colors.warningSurface,
  },
  {
    key: 'acceptedApplications' as keyof PlatformStats,
    label: 'Accepted Apps',
    icon: 'checkmark-circle-outline' as const,
    iconColor: Colors.accepted,
    iconBg: Colors.acceptedSurface,
  },
];

export default function AdminDashboardScreen() {
  const { user, logout } = useAuth();

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch stats from the API (or mock)
  const fetchStats = useCallback(async () => {
    setError(null);
    try {
      const data = await getAdminStats();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load statistics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  // Logout: clear auth then navigate to login screen
  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login');
  }

  // Pull-to-refresh handler
  function handleRefresh() {
    setRefreshing(true);
    void fetchStats();
  }

  // ── Loading state ────────────────────────────────────────────
  if (loading) {
    return <LoadingView message="Loading statistics…" />;
  }

  // ── Error state ──────────────────────────────────────────────
  if (error) {
    return (
      <ErrorView
        message={error}
        onRetry={() => {
          setLoading(true);
          void fetchStats();
        }}
      />
    );
  }

  // ── Success state ────────────────────────────────────────────
  return (
    <ScreenContainer padHorizontal={false}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        refreshControl={
          // Pull-to-refresh: spinner colour matches brand
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name ?? 'Admin'}</Text>
          </View>

          {/* Logout button */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            accessibilityLabel="Logout"
            accessibilityRole="button"
          >
            <Ionicons name="log-out-outline" size={22} color={Colors.error} />
          </TouchableOpacity>
        </View>

        {/* ── Section title ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Overview</Text>
          <Text style={styles.sectionSub}>Live statistics</Text>
        </View>

        {/* ── Stat cards in a 2-column grid ── */}
        {/* We use a manual two-per-row layout because RN flexWrap + flex:1 doesn't work reliably */}
        <View style={styles.grid}>
          {STAT_CONFIG.map((cfg) => (
            <View key={cfg.key} style={styles.cardWrapper}>
              <StatCard
                icon={cfg.icon}
                iconColor={cfg.iconColor}
                iconBg={cfg.iconBg}
                value={stats ? stats[cfg.key] : 0}
                label={cfg.label}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.base,
  },
  greeting: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  name: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: Colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  section: {
    marginBottom: Spacing.base,
  },
  sectionTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  sectionSub: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  // 2-column responsive grid — each card takes ~half width minus gap
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  // Each card wrapper is exactly half the grid width
  cardWrapper: {
    width: '48.5%',
  },
});
