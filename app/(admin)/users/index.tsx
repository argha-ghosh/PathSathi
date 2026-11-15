// app/(admin)/users/index.tsx
// ManageUsersScreen — searchable, filterable list of all platform users.
//
// States: loading → ErrorView → EmptyView → FlatList of users
// Tapping a row navigates to UserDetailScreen via stack push.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { getUsers } from '../../../services/adminApi';
import type { AdminUser, UserFilters, UserRole, UserStatus } from '../../../types/admin';

import SearchBar from '../../../components/admin/SearchBar';
import FilterChips from '../../../components/admin/FilterChips';
import Avatar from '../../../components/admin/Avatar';
import StatusBadge from '../../../components/admin/StatusBadge';
import ErrorView from '../../../components/admin/ErrorView';
import EmptyView from '../../../components/admin/EmptyView';
import ScreenContainer from '../../../components/admin/ScreenContainer';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../../constants/theme';

// Options for the role and status filter chips
const ROLE_OPTIONS: { label: string; value: UserRole | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Student', value: 'student' },
  { label: 'Tutor', value: 'tutor' },
  { label: 'Moderator', value: 'moderator' },
];

const STATUS_OPTIONS: { label: string; value: UserStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Banned', value: 'banned' },
];

export default function ManageUsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state — search text is separate so we can debounce it
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');

  // Debounce ref: we wait 400ms after the user stops typing before fetching
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Track whether the component is still mounted to avoid state-on-unmount warnings
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchUsers = useCallback(
    async (filters: UserFilters) => {
      setError(null);
      try {
        const data = await getUsers(filters);
        if (mountedRef.current) setUsers(data);
      } catch (err) {
        if (mountedRef.current)
          setError(err instanceof Error ? err.message : 'Failed to load users.');
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [],
  );

  // Re-fetch whenever role or status filter changes immediately
  useEffect(() => {
    setLoading(true);
    void fetchUsers({ search: searchText, role: roleFilter, status: statusFilter });
  }, [roleFilter, statusFilter, fetchUsers]);

  // Debounce search text so we don't call the API on every keystroke.
  // roleFilter and statusFilter are intentionally excluded — the effect above
  // handles those changes immediately without debouncing.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      void fetchUsers({ search: searchText, role: roleFilter, status: statusFilter });
    }, 400);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchText]);

  function handleRetry() {
    setLoading(true);
    void fetchUsers({ search: searchText, role: roleFilter, status: statusFilter });
  }

  // ── Render a single user row ─────────────────────────────────
  function renderUser({ item }: { item: AdminUser }) {
    return (
      <TouchableOpacity
        style={styles.row}
        onPress={() => router.push(`/(admin)/users/${item.id}` as never)}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`View ${item.name}`}
      >
        <Avatar name={item.name} size={44} />

        <View style={styles.rowContent}>
          <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.rowEmail} numberOfLines={1}>{item.email}</Text>
          <View style={styles.rowBadges}>
            <StatusBadge status={item.role} />
            <StatusBadge status={item.status} />
          </View>
        </View>

        <Ionicons name="chevron-forward" size={20} color={Colors.textTertiary} />
      </TouchableOpacity>
    );
  }

  if (error && !loading) {
    return <ErrorView message={error} onRetry={handleRetry} />;
  }

  return (
    <ScreenContainer padHorizontal={false}>
      {/* Search + filters sit above the list */}
      <View style={styles.filterArea}>
        <SearchBar
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search by name or email…"
        />
        <FilterChips
          label="Role"
          options={ROLE_OPTIONS}
          selected={roleFilter}
          onSelect={setRoleFilter}
        />
        <FilterChips
          label="Status"
          options={STATUS_OPTIONS}
          selected={statusFilter}
          onSelect={setStatusFilter}
        />
      </View>

      {/* Loading overlay inside the list area */}
      {loading ? (
        <View style={styles.listLoading}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={renderUser}
          contentContainerStyle={[
            styles.listContent,
            users.length === 0 && styles.listEmpty,
          ]}
          ListEmptyComponent={
            <EmptyView
              icon="people-outline"
              title="No users found"
              subtitle="Try adjusting your search or filters."
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  filterArea: {
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  listLoading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['3xl'],
  },
  listEmpty: { flex: 1 },
  separator: { height: Spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  rowContent: { flex: 1, gap: 3 },
  rowName: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  rowEmail: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  rowBadges: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginTop: 4,
  },
});
