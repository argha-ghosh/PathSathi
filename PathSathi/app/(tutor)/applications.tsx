// app/(tutor)/applications.tsx
// Screen 3 – My Applications
// Status tabs (All / Pending / Accepted / Rejected / Withdrawn),
// pull-to-refresh, withdraw with confirm Alert.

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import { useMyApplications, filterByStatus } from '../../hooks/useMyApplications';
import { ApplicationCard } from '../../components/tutor/ApplicationCard';
import { SegmentedTabs } from '../../components/tutor/SegmentedTabs';
import { LoadingState } from '../../components/tutor/LoadingState';
import { ErrorState } from '../../components/tutor/ErrorState';
import { EmptyState } from '../../components/tutor/EmptyState';
import { Colors, Typography, Spacing } from '../../constants/theme';
import type { Application, ApplicationStatus } from '../../types/tutor';
import type { Tab } from '../../components/tutor/SegmentedTabs';

type TabKey = ApplicationStatus | 'all';

export default function ApplicationsScreen() {
  const {
    data,
    loading,
    error,
    refetch,
    withdraw,
    withdrawing,
  } = useMyApplications();

  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [refreshing, setRefreshing] = useState(false);

  async function handleRefresh() {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }

  // Count per status for tab badges
  const counts = useMemo(() => {
    return {
      all: data.length,
      pending: data.filter((a) => a.status === 'pending').length,
      accepted: data.filter((a) => a.status === 'accepted').length,
      rejected: data.filter((a) => a.status === 'rejected').length,
      withdrawn: data.filter((a) => a.status === 'withdrawn').length,
    };
  }, [data]);

  const tabs: Tab<TabKey>[] = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'pending', label: 'Pending', count: counts.pending },
    { key: 'accepted', label: 'Accepted', count: counts.accepted },
    { key: 'rejected', label: 'Rejected', count: counts.rejected },
    { key: 'withdrawn', label: 'Withdrawn', count: counts.withdrawn },
  ];

  const filtered = useMemo(
    () => filterByStatus(data, activeTab),
    [data, activeTab],
  );

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
      description:
        "Applications you've been accepted for will appear here.",
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

  function renderCard({ item }: { item: Application }) {
    return (
      <ApplicationCard
        application={item}
        onWithdraw={withdraw}
        onViewPost={(postId) => router.push(`/(tutor)/board/${postId}`)}
        isWithdrawing={withdrawing === item.id}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Applications</Text>
        <Text style={styles.headerSub}>Track your tuition applications</Text>
      </View>

      {/* ── Tabs ── */}
      <View style={styles.tabsRow}>
        <SegmentedTabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
      </View>

      {/* ── Content ── */}
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
          ListEmptyComponent={
            <EmptyState
              icon="document-text-outline"
              title={emptyMessages[activeTab].title}
              description={emptyMessages[activeTab].description}
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
