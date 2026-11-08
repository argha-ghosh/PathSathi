// app/(tutor)/board/index.tsx
// Screen 1 – Tuition Board
// Displays open tuition posts with search, filters, and pull-to-refresh.

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useTuitionPosts } from '../../../hooks/useTuitionPosts';
import { PostCard } from '../../../components/tutor/PostCard';
import { FilterSheet } from '../../../components/tutor/FilterSheet';
import { FilterChips } from '../../../components/tutor/FilterChips';
import { LoadingState } from '../../../components/tutor/LoadingState';
import { ErrorState } from '../../../components/tutor/ErrorState';
import { EmptyState } from '../../../components/tutor/EmptyState';
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadow,
  TouchTarget,
} from '../../../constants/theme';
import type { PostFilters, TuitionPost } from '../../../types/tutor';

export default function BoardScreen() {
  const {
    data,
    loading,
    error,
    filters,
    searchText,
    setSearch,
    setFilter,
    clearFilters,
    refetch,
    hasActiveFilters,
  } = useTuitionPosts();

  const [filterSheetVisible, setFilterSheetVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh handler
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // Apply filters from the sheet
  function handleApplyFilters(sheetFilters: Omit<PostFilters, 'search'>) {
    if (sheetFilters.subject !== filters.subject)
      setFilter('subject', sheetFilters.subject);
    if (sheetFilters.classLevel !== filters.classLevel)
      setFilter('classLevel', sheetFilters.classLevel);
    if (sheetFilters.area !== filters.area)
      setFilter('area', sheetFilters.area);
    if (sheetFilters.minSalary !== filters.minSalary)
      setFilter('minSalary', sheetFilters.minSalary);
    if (sheetFilters.maxSalary !== filters.maxSalary)
      setFilter('maxSalary', sheetFilters.maxSalary);
  }

  // Remove a single chip
  function handleRemoveChip(key: keyof PostFilters) {
    if (key === 'search') {
      setSearch('');
    } else {
      setFilter(key, undefined);
    }
  }

  // Count active non-search filters for the badge on the filter button
  const filterBadgeCount = [
    filters.subject,
    filters.classLevel,
    filters.area,
    filters.minSalary,
    filters.maxSalary,
  ].filter((v) => v !== undefined).length;

  function renderPost({ item }: { item: TuitionPost }) {
    return (
      <PostCard
        post={item}
        onPress={() => router.push(`/(tutor)/board/${item.id}` as never)}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tuition Board</Text>
        <Text style={styles.headerSub}>Find your next student</Text>
      </View>

      {/* ── Search + Filter row ── */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={18}
            color={Colors.textTertiary}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={searchText}
            onChangeText={setSearch}
            placeholder="Search by title, subject, area…"
            placeholderTextColor={Colors.textTertiary}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCorrect={false}
            accessibilityLabel="Search tuition posts"
          />
          {searchText.length > 0 ? (
            <TouchableOpacity
              onPress={() => setSearch('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Clear search"
              accessibilityRole="button"
            >
              <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filter button */}
        <TouchableOpacity
          style={[
            styles.filterButton,
            filterBadgeCount > 0 && styles.filterButtonActive,
          ]}
          onPress={() => setFilterSheetVisible(true)}
          activeOpacity={0.8}
          accessibilityLabel={`Open filters${filterBadgeCount > 0 ? `, ${filterBadgeCount} active` : ''}`}
          accessibilityRole="button"
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={filterBadgeCount > 0 ? Colors.primary : Colors.textSecondary}
          />
          {filterBadgeCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterBadgeCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {/* ── Active filter chips ── */}
      {hasActiveFilters ? (
        <View style={styles.chipsRow}>
          <FilterChips
            filters={filters}
            onRemove={handleRemoveChip}
            onClearAll={clearFilters}
          />
        </View>
      ) : null}

      {/* ── Content ── */}
      {loading && !refreshing ? (
        <LoadingState message="Loading tuition posts…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={[
            styles.listContent,
            data.length === 0 && styles.listContentEmpty,
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
              icon="search-outline"
              title="No tuition posts found"
              description={
                hasActiveFilters
                  ? 'No tuition matches your filters. Try adjusting or clearing them.'
                  : 'There are no open tuition posts right now. Check back later.'
              }
              actionLabel={hasActiveFilters ? 'Clear filters' : undefined}
              onAction={hasActiveFilters ? clearFilters : undefined}
            />
          }
        />
      )}

      {/* ── Filter Sheet ── */}
      <FilterSheet
        visible={filterSheetVisible}
        filters={filters}
        onApply={handleApplyFilters}
        onClose={() => setFilterSheetVisible(false)}
      />
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
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.sm,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.xl,
    paddingHorizontal: Spacing.md,
    height: TouchTarget,
    ...Shadow.sm,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    height: TouchTarget,
    padding: 0,
  },
  filterButton: {
    width: TouchTarget,
    height: TouchTarget,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.sm,
  },
  filterButtonActive: {
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primarySurface,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 16,
    height: 16,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: Typography.bold,
    color: Colors.textInverse,
  },
  chipsRow: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.xs,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['2xl'],
  },
  listContentEmpty: {
    flex: 1,
  },
});
