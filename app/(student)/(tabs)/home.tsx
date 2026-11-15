// app/(student)/home.tsx
// Browse tutors screen – clean white design matching the reference image.

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../../context/AuthContext';
import { getTutors } from '../../../services/studentApi';
import { useBookmarks } from '../../../hooks/useBookmarks';
import type { TutorProfilePublic, TutorFilters } from '../../../types/student';
import {
  Colors, Radius, Shadow, Spacing, TouchTarget, Typography,
} from '../../../constants/theme';
import { getInitials } from '../../../utils/format';

export default function StudentHomeScreen() {
  const { user, logout } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const [tutors, setTutors] = useState<TutorProfilePublic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const fetchTutors = useCallback(async (filters: TutorFilters) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getTutors(filters);
      setTutors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tutors.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTutors({ search: '' });
  }, [fetchTutors]);

  function handleSearch(text: string) {
    setSearch(text);
    void fetchTutors({ search: text });
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0]} 👋</Text>
          <Text style={styles.subtitle}>Find the right tutor for you</Text>
        </View>
        <Pressable
          style={styles.logoutBtn}
          onPress={async () => { await logout(); router.replace('/(auth)/login' as never); }}
          accessibilityLabel="Logout"
        >
          <Ionicons name="log-out-outline" size={22} color={Colors.textSecondary} />
        </Pressable>
      </View>

      {/* ── Search bar ── */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={handleSearch}
          placeholder="Search by name, subject, area..."
          placeholderTextColor={Colors.textTertiary}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {search.length > 0 && (
          <Pressable onPress={() => handleSearch('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="close-circle" size={18} color={Colors.textTertiary} />
          </Pressable>
        )}
      </View>

      {/* ── Post a requirement CTA ── */}
      <Pressable
        style={styles.ctaBanner}
        onPress={() => router.push('/(student)/posts' as never)}
        accessibilityRole="button"
      >
        <Ionicons name="add-circle-outline" size={20} color={Colors.primary} />
        <Text style={styles.ctaText}>Post a tuition requirement</Text>
        <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
      </Pressable>

      {/* ── Content ── */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.retryBtn} onPress={() => fetchTutors({ search })}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : tutors.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="people-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.emptyText}>No tutors found</Text>
          <Text style={styles.emptySubText}>Try a different search term</Text>
        </View>
      ) : (
        <FlatList
          data={tutors}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TutorCard
              tutor={item}
              bookmarked={isBookmarked(item.id)}
              onBookmark={() => toggleBookmark(item.id)}
              onPress={() => router.push(`/(student)/tutor/${item.id}` as never)}
            />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// TutorCard — matches reference image exactly
// ---------------------------------------------------------------------------

function TutorCard({
  tutor, bookmarked, onBookmark, onPress,
}: {
  tutor: TutorProfilePublic;
  bookmarked: boolean;
  onBookmark: () => void;
  onPress: () => void;
}) {
  return (
    <View style={card.wrap}>
      {/* Row 1: avatar + name block + bookmark */}
      <View style={card.topRow}>
        <View style={card.avatar}>
          <Text style={card.avatarText}>{getInitials(tutor.name)}</Text>
        </View>

        <View style={{ flex: 1 }}>
          {/* Name + rating */}
          <View style={card.nameRatingRow}>
            <Text style={card.name}>{tutor.name}</Text>
            <View style={card.ratingPill}>
              <Ionicons name="star" size={12} color="#F59E0B" />
              <Text style={card.ratingText}>
                {tutor.reviewCount > 0 ? tutor.rating.toFixed(1) : 'New'}
              </Text>
            </View>
          </View>
          <Text style={card.uni} numberOfLines={1}>{tutor.university}</Text>
          <Text style={card.dept} numberOfLines={1}>
            {tutor.department} · {tutor.year}
          </Text>
        </View>

        <Pressable
          onPress={onBookmark}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark tutor'}
        >
          <Ionicons
            name={bookmarked ? 'bookmark' : 'bookmark-outline'}
            size={20}
            color={bookmarked ? Colors.primary : Colors.textTertiary}
          />
        </Pressable>
      </View>

      {/* Row 2: subject chips */}
      <View style={card.chipsRow}>
        {tutor.subjects.slice(0, 3).map((s) => (
          <View key={s} style={card.chip}>
            <Text style={card.chipText}>{s}</Text>
          </View>
        ))}
        {tutor.subjects.length > 3 && (
          <Text style={card.more}>+{tutor.subjects.length - 3}</Text>
        )}
      </View>

      {/* Row 3: area · salary · method */}
      <View style={card.metaRow}>
        <MetaItem icon="location-outline" label={tutor.areas.slice(0, 2).join(', ')} />
        <MetaItem icon="cash-outline" label={`৳ ${tutor.expectedSalary.toLocaleString()} / month`} />
        <MetaItem icon="desktop-outline" label={tutor.teachingMethod} />
      </View>
    </View>
  );
}

function MetaItem({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  return (
    <View style={card.metaItem}>
      <Ionicons name={icon} size={12} color={Colors.textTertiary} />
      <Text style={card.metaText} numberOfLines={1}>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  greeting: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  logoutBtn: {
    width: TouchTarget,
    height: TouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },

  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginHorizontal: Spacing.base,
    paddingHorizontal: Spacing.md,
    height: 46,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    height: 46,
    padding: 0,
  },

  ctaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primarySurface,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
  },
  ctaText: {
    flex: 1,
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.primary,
  },

  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorText: { fontSize: Typography.base, color: Colors.error, textAlign: 'center' },
  retryBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
  },
  retryText: { fontSize: Typography.base, color: Colors.textInverse, fontWeight: Typography.semiBold },
  emptyText: { fontSize: Typography.lg, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  emptySubText: { fontSize: Typography.base, color: Colors.textSecondary },
  list: { paddingHorizontal: Spacing.base, paddingTop: Spacing.sm, paddingBottom: Spacing['3xl'] },
});

const card = StyleSheet.create({
  wrap: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
    gap: Spacing.sm,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  nameRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    flex: 1,
  },
  ratingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: '#92400E',
  },
  uni: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dept: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    backgroundColor: Colors.primarySurface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: Typography.xs,
    color: Colors.primary,
    fontWeight: Typography.semiBold,
  },
  more: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    alignSelf: 'center',
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: Typography.xs,
    color: Colors.textSecondary,
  },
});
