// app/(tutor)/applications.tsx
// Screen 3 — My Applications
//
// This screen lists all tuition applications the tutor has submitted.
// A segmented tab bar at the top lets the tutor filter by status:
//   All | Pending | Accepted | Rejected | Withdrawn
//
// Key patterns used (from lab manuals):
//   - useState for the active tab key (Week 1)
//   - useState for pull-to-refresh (Week 2)
//   - useMemo to derive per-tab counts and the filtered list from data (Week 2)
//     (same concept as the 'filtered' array in StudentDirectory)
//   - FlatList with ListEmptyComponent and RefreshControl (Week 2)
//   - router.push() for navigation (Week 3)
//   - Conditional rendering for loading / error / data states (Week 2)

import { router } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Custom hook that fetches and manages application data
import { filterByStatus, useMyApplications } from '../../hooks/useMyApplications';

// Reusable tutor components
import { ApplicationCard } from '../../components/tutor/ApplicationCard';
import { EmptyState } from '../../components/tutor/EmptyState';
import { ErrorState } from '../../components/tutor/ErrorState';
import { LoadingState } from '../../components/tutor/LoadingState';
import { SegmentedTabs } from '../../components/tutor/SegmentedTabs';

import type { Tab } from '../../components/tutor/SegmentedTabs';
import { Colors, Spacing, Typography } from '../../constants/theme';
import type { Application, ApplicationStatus } from '../../types/tutor';

// A tab key is either a specific status or 'all' for the unfiltered view
type TabKey = ApplicationStatus | 'all';

export default function ApplicationsScreen() {
  // ---------------------------------------------------------------------------
  // Data hook
  // ---------------------------------------------------------------------------
  // useMyApplications() fetches the tutor's applications and exposes:
  //   data        — the full array of Application objects
  //   loading     — true during the first fetch
  //   error       — error message, or null
  //   refetch     — async function to reload the data
  //   withdraw    — async function to withdraw a pending application
  //   withdrawing — the id of the application currently being withdrawn (or null)
  const {
    data,
    loading,
    error,
    refetch,
    withdraw,
    withdrawing,
  } = useMyApplications();

  // ---------------------------------------------------------------------------
  // Local UI state
  // ---------------------------------------------------------------------------
  // Active tab — 'all' by default. When this changes, the filtered list
  // is recomputed via useMemo (see below).
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  // Controls the RefreshControl spinner during pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // ---------------------------------------------------------------------------
  // Pull-to-refresh handler
  // ---------------------------------------------------------------------------
  async function handleRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  // ---------------------------------------------------------------------------
  // Derived values — useMemo
  // ---------------------------------------------------------------------------
  // useMemo re-runs the callback only when `data` changes, not on every render.
  // This avoids re-counting every application on each keystroke or state change.
  //
  // Note: `counts` is NOT state — it is computed from `data`, which IS state
  // (inside the hook). This is the same "derived value" pattern as the
  // `filtered` array in Week 2: React re-renders when `data` changes, and
  // `counts` is re-computed at that point.
  const counts = useMemo(() => {
    return {
      all:       data.length,
      pending:   data.filter((a) => a.status === 'pending').length,
      accepted:  data.filter((a) => a.status === 'accepted').length,
      rejected:  data.filter((a) => a.status === 'rejected').length,
      withdrawn: data.filter((a) => a.status === 'withdrawn').length,
    };
  }, [data]);

  // Tab definitions — built from the counts above.
  // The Tab<TabKey> array is passed to SegmentedTabs to render the pill row.
  const tabs: Tab<TabKey>[] = [
    { key: 'all',       label: 'All',       count: counts.all },
    { key: 'pending',   label: 'Pending',   count: counts.pending },
    { key: 'accepted',  label: 'Accepted',  count: counts.accepted },
    { key: 'rejected',  label: 'Rejected',  count: counts.rejected },
    { key: 'withdrawn', label: 'Withdrawn', count: counts.withdrawn },
  ];

  // Filter the list for the active tab.
  // filterByStatus is a pure function exported from useMyApplications.ts —
  // when activeTab is 'all' it returns the full list; otherwise it filters by
  // status. Same idea as Week 2's filter: data.filter(s => s.name.includes(query)).
  const filtered = useMemo(
    () => filterByStatus(data, activeTab),
    [data, activeTab],
  );

  // ---------------------------------------------------------------------------
  // Empty state messages — one for each tab key
  // ---------------------------------------------------------------------------
  const emptyMessages: Record<TabKey, { title: string; description: string }> = {
    all: {
      title: 'No applications yet',
      description:
        'Browse the Tuition Board and apply to posts that match your skills.',
    },
    pending: {
      title: 'No pending applications',
      description: 'You have no applications waiting for a response right now.',
    },
    accepted: {
      title: 'No accepted applications',
      description: "Applications you've been accepted for will appear here.",
    },
    rejected: {
      title: 'No rejected applications',
      description: "Applications that weren't accepted will appear here.",
    },
    withdrawn: {
      title: 'No withdrawn applications',
      description: "Applications you've withdrawn will appear here.",
    },
  };

  // ---------------------------------------------------------------------------
  // renderItem for FlatList
  // ---------------------------------------------------------------------------
  // Called by FlatList for each application in `filtered`.
  // ApplicationCard handles the withdraw confirmation Alert internally.
  function renderCard({ item }: { item: Application }) {
    return (
      <ApplicationCard
        application={item}
        onWithdraw={withdraw}
        // Navigate to the post detail screen when the card is tapped
        onViewPost={(postId) => router.push(`/(tutor)/board/${postId}`)}
        isWithdrawing={withdrawing === item.id}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Page header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Applications</Text>
        <Text style={styles.headerSub}>Track your tuition applications</Text>
      </View>

      {/* ── Status tabs ──
          SegmentedTabs renders the pill row. When the user taps a tab,
          setActiveTab updates state, which causes the filtered list to
          recompute via useMemo and FlatList to re-render. */}
      <View style={styles.tabsRow}>
        <SegmentedTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </View>

      {/* ── Content ──
          Three mutually exclusive states (same pattern as Week 2):
            1. Loading (not a pull-to-refresh): show spinner
            2. Error: show error screen with retry button
            3. Data ready: show FlatList */}
      {loading && !refreshing ? (
        <LoadingState message="Loading applications…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={renderCard}
          contentContainerStyle={[
            styles.listContent,
            filtered.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          // ListEmptyComponent renders when filtered is an empty array.
          // The message and action change based on the active tab.
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title={emptyMessages[activeTab].title}
              description={emptyMessages[activeTab].description}
              // On the 'all' tab, offer a shortcut to browse the Board
              actionLabel={activeTab === 'all' ? 'Browse Board' : undefined}
              onAction={
                activeTab === 'all'
                  ? () => router.push('/(tutor)/board')
                  : undefined
              }
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography['3xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tabsRow: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing['2xl'],
  },
  listContentEmpty: {
    flex: 1,
  },
});
