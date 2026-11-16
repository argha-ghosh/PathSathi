// app/(tutor)/board/index.tsx
// Screen 1 — Tuition Board
//
// This is the main listing screen for the Board tab.
// It shows all open tuition posts and lets tutors search and filter them.
//
// Key patterns used (from lab manuals):
//   - FlatList for the post list (Week 2)
//   - Controlled TextInput for search, stored in a state variable (Week 2)
//   - useState for UI-only state: modal visibility and pull-to-refresh (Week 2)
//   - Derived filtering (Week 2 — 'filtered' array computed from state)
//   - router.push() to navigate to the detail screen (Week 3)
//
// All data fetching and filter state lives in the useTuitionPosts() hook.
// This screen only manages UI state (whether the filter sheet is open, etc.)

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    RefreshControl,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Custom hook that owns all tuition-post data, filtering, and fetch logic
import { useTuitionPosts } from '../../../hooks/useTuitionPosts';

// Reusable tutor components
import { EmptyState } from '../../../components/tutor/EmptyState';
import { ErrorState } from '../../../components/tutor/ErrorState';
import { FilterChips } from '../../../components/tutor/FilterChips';
import { FilterSheet } from '../../../components/tutor/FilterSheet';
import { LoadingState } from '../../../components/tutor/LoadingState';
import { PostCard } from '../../../components/tutor/PostCard';

import {
    Colors,
    Radius,
    Spacing,
    TouchTarget,
    Typography
} from '../../../constants/theme';
import type { PostFilters, TuitionPost } from '../../../types/tutor';

export default function BoardScreen() {
  // ---------------------------------------------------------------------------
  // Data & filter state (all managed inside the hook)
  // ---------------------------------------------------------------------------
  // useTuitionPosts() owns the fetched list, loading/error state, and all
  // filter state. The hook also debounces the search text so we don't refetch
  // on every keystroke.
  const {
    data,            // the filtered list of TuitionPost objects to display
    loading,         // true while the first fetch is in progress
    error,           // error message string, or null if no error
    filters,         // current filter values (subject, classLevel, area, salary)
    searchText,      // the raw (un-debounced) text in the search box
    setSearch,       // call this when the user types in the search bar
    setFilter,       // call this to set a single filter key
    clearFilters,    // call this to reset all filters at once
    refetch,         // async function to reload the post list
    hasActiveFilters,// true if any filter besides search is currently set
  } = useTuitionPosts();

  // ---------------------------------------------------------------------------
  // Local UI state
  // ---------------------------------------------------------------------------
  // These values only affect this screen's UI — they don't need to be in a
  // shared context. This is the same pattern as Week 2's 'selectedStudent'.

  // Controls whether the bottom-sheet filter panel is visible
  const [filterSheetVisible, setFilterSheetVisible] = useState(false);

  // Controls the RefreshControl spinner during pull-to-refresh
  const [refreshing, setRefreshing] = useState(false);

  // ---------------------------------------------------------------------------
  // Pull-to-refresh handler
  // ---------------------------------------------------------------------------
  // useCallback memoises the function so the RefreshControl reference is stable.
  // Without useCallback, a new function reference would be created on every
  // render — not harmful here but a good habit for performance.
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  // ---------------------------------------------------------------------------
  // Filter sheet handlers
  // ---------------------------------------------------------------------------
  // The FilterSheet manages its own draft state internally. When the user taps
  // "Apply Filters", it calls onApply with the final values and we commit them.
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

  // Tapping the × on a chip removes just that filter
  function handleRemoveChip(key: keyof PostFilters) {
    if (key === 'search') {
      setSearch('');
    } else {
      setFilter(key, undefined);
    }
  }

  // Count how many non-search filters are active so we can show a badge
  const filterBadgeCount = [
    filters.subject,
    filters.classLevel,
    filters.area,
    filters.minSalary,
    filters.maxSalary,
  ].filter((v) => v !== undefined).length;

  // ---------------------------------------------------------------------------
  // renderItem for FlatList
  // ---------------------------------------------------------------------------
  // This function is called by FlatList for each item in `data`.
  // We use router.push() with a dynamic path — the same pattern as
  // ArticleList → ArticleDetail in Week 3.
  function renderPost({ item }: { item: TuitionPost }) {
    return (
      <PostCard
        post={item}
        onPress={() => router.push(`/(tutor)/board/${item.id}` as never)}
      />
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* ── Page header ──
          A custom title bar (not the Stack header) — same approach as the
          'Student Directory' title bar built in Week 2. */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tuition Board</Text>
        <Text style={styles.headerSub}>Find your next student</Text>
      </View>

      {/* ── Search bar + filter button ──
          The TextInput is a controlled component: its value comes from
          searchText (state inside the hook) and every keystroke calls setSearch.
          This is the same pattern as SearchBar in Week 2. */}
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
            clearButtonMode="while-editing"  // iOS: shows × to clear the input
            autoCorrect={false}
            accessibilityLabel="Search tuition posts"
          />
          {/* Show a clear button on Android (iOS uses clearButtonMode) */}
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

        {/* Filter button — shows a badge when any filter is active */}
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
          {/* Badge only renders when at least one filter is active —
              this is conditional rendering with &&, same as Week 1's
              skills section: {skills && skills.length > 0 && (<View>…</View>)} */}
          {filterBadgeCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{filterBadgeCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {/* ── Active filter chips ──
          Only shown when at least one filter is set.
          Tapping × on a chip calls handleRemoveChip. */}
      {hasActiveFilters ? (
        <View style={styles.chipsRow}>
          <FilterChips
            filters={filters}
            onRemove={handleRemoveChip}
            onClearAll={clearFilters}
          />
        </View>
      ) : null}

      {/* ── Main content area ──
          Three mutually exclusive states, same pattern as Week 2:
            1. Loading (first fetch, not a pull-to-refresh): show spinner
            2. Error: show error screen with retry button
            3. Data ready: show FlatList */}
      {loading && !refreshing ? (
        <LoadingState message="Loading tuition posts…" />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        // FlatList — the right tool for long, scrollable lists (Week 2).
        // Using FlatList instead of ScrollView+map() gives us virtualisation:
        // only the rows on screen are rendered, keeping memory usage low.
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={renderPost}
          contentContainerStyle={[
            styles.listContent,
            // When the list is empty, we want the EmptyState to fill the screen.
            // Setting flex: 1 on the content container achieves that.
            data.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
          // Pull-to-refresh: the RefreshControl spinner shows while refreshing
          // is true, and calls handleRefresh when the user pulls down.
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
          // ListEmptyComponent renders when `data` is an empty array.
          // The message changes depending on whether filters are active —
          // same idea as the Week 2 "No students match" message.
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

      {/* ── Filter Sheet (bottom modal) ──
          Controlled by filterSheetVisible state. The sheet is always mounted
          but only visible when filterSheetVisible is true, so its internal
          animation state is preserved. */}
      <FilterSheet
        visible={filterSheetVisible}
        filters={filters}
        onApply={handleApplyFilters}
        onClose={() => setFilterSheetVisible(false)}
      />
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
  // Dark title bar — the same style pattern as Week 2's titleBar
  header: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
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
  // Search row: search box + filter button side by side (flexDirection: 'row')
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  searchBox: {
    flex: 1,          // takes all remaining space in the row (Week 2 pattern)
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.sm,
    height: TouchTarget - 4,
    gap: Spacing.xs,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  searchIcon: {
    marginLeft: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    height: '100%',
  },
  filterButton: {
    width: TouchTarget,
    height: TouchTarget - 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterButtonActive: {
    backgroundColor: Colors.primarySurface,
    borderColor: Colors.primaryLight,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterBadgeText: {
    fontSize: 9,
    fontWeight: Typography.bold,
    color: Colors.textInverse,
  },
  chipsRow: {
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing['2xl'],
  },
  listContentEmpty: {
    flex: 1,
  },
});
