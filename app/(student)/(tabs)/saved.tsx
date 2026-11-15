// app/(student)/saved.tsx
// Saved / Bookmarked tutors screen.

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { getTutors } from '../../../services/studentApi';
import { useBookmarks } from '../../../hooks/useBookmarks';
import type { TutorProfilePublic } from '../../../types/student';
import {
  Colors, Radius, Shadow, Spacing, TouchTarget, Typography,
} from '../../../constants/theme';
import { formatSalary, getInitials } from '../../../utils/format';

export default function SavedTutorsScreen() {
  const { bookmarkedIds, toggleBookmark, isBookmarked } = useBookmarks();
  const [allTutors, setAllTutors] = useState<TutorProfilePublic[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTutors();
      setAllTutors(data);
    } catch {
      setAllTutors([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const ids = bookmarkedIds();
  const saved = allTutors.filter((t) => ids.includes(t.id));

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Saved Tutors</Text>
        <Text style={styles.count}>{ids.length} saved</Text>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : saved.length === 0 ? (
        <View style={styles.center}>
          <Ionicons name="bookmark-outline" size={56} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>No saved tutors</Text>
          <Text style={styles.emptySub}>
            Bookmark tutors from the Find Tutors page to save them here.
          </Text>
          <Pressable
            style={styles.browseBtn}
            onPress={() => router.push('/(student)/home' as never)}
          >
            <Text style={styles.browseBtnText}>Browse Tutors</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={saved}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <SavedCard
              tutor={item}
              onPress={() => router.push(`/(student)/tutor/${item.id}` as never)}
              onRemove={() => toggleBookmark(item.id)}
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
// SavedCard
// ---------------------------------------------------------------------------

function SavedCard({
  tutor, onPress, onRemove,
}: {
  tutor: TutorProfilePublic;
  onPress: () => void;
  onRemove: () => void;
}) {
  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.topRow}>
        <View style={cardStyles.avatar}>
          <Text style={cardStyles.avatarText}>{getInitials(tutor.name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={cardStyles.nameRow}>
            <Text style={cardStyles.name}>{tutor.name}</Text>
            {tutor.verification.status === 'verified' && (
              <Ionicons name="checkmark-circle" size={15} color={Colors.accepted} />
            )}
          </View>
          <Text style={cardStyles.uni} numberOfLines={1}>{tutor.university}</Text>
          <Text style={cardStyles.dept}>{tutor.department} · {tutor.year}</Text>
          {/* Stars */}
          <View style={cardStyles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Ionicons
                key={s}
                name={s <= Math.round(tutor.rating) ? 'star' : 'star-outline'}
                size={12}
                color="#F59E0B"
              />
            ))}
            <Text style={cardStyles.ratingText}>
              {tutor.reviewCount > 0 ? ` ${tutor.rating.toFixed(1)} (${tutor.reviewCount})` : ' New'}
            </Text>
          </View>
        </View>
        {/* Remove bookmark */}
        <Pressable
          onPress={onRemove}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel="Remove bookmark"
        >
          <Ionicons name="bookmark" size={22} color={Colors.primary} />
        </Pressable>
      </View>

      {/* Subjects */}
      <View style={cardStyles.chipsRow}>
        {tutor.subjects.slice(0, 3).map((s) => (
          <View key={s} style={cardStyles.chip}>
            <Text style={cardStyles.chipText}>{s}</Text>
          </View>
        ))}
        {tutor.subjects.length > 3 && (
          <Text style={cardStyles.moreText}>+{tutor.subjects.length - 3}</Text>
        )}
      </View>

      {/* Bottom row */}
      <View style={cardStyles.bottomRow}>
        <View>
          <Text style={cardStyles.salary}>{formatSalary(tutor.expectedSalary)}</Text>
          <View style={cardStyles.areaRow}>
            <Ionicons name="location-outline" size={12} color={Colors.textTertiary} />
            <Text style={cardStyles.areaText}>{tutor.areas.slice(0, 2).join(', ')}</Text>
          </View>
        </View>
        <Pressable style={cardStyles.viewBtn} onPress={onPress}>
          <Text style={cardStyles.viewBtnText}>View Profile</Text>
          <Ionicons name="chevron-forward" size={14} color={Colors.textInverse} />
        </Pressable>
      </View>
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
  },
  title: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  count: { fontSize: Typography.sm, color: Colors.textTertiary },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing['2xl'],
  },
  emptyTitle: { fontSize: Typography.xl, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  emptySub: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: Typography.base * 1.6 },
  browseBtn: {
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
  },
  browseBtnText: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textInverse },
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing['3xl'], paddingTop: Spacing.xs },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
    gap: Spacing.sm,
  },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.primary },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  name: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  uni: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 1 },
  dept: { fontSize: Typography.xs, color: Colors.textTertiary },
  starsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  ratingText: { fontSize: Typography.xs, color: Colors.textSecondary, fontWeight: Typography.medium },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  chip: {
    backgroundColor: Colors.primarySurface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  chipText: { fontSize: Typography.xs, color: Colors.primary, fontWeight: Typography.semiBold },
  moreText: { fontSize: Typography.xs, color: Colors.textTertiary, alignSelf: 'center' },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  salary: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.primary },
  areaRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  areaText: { fontSize: Typography.xs, color: Colors.textSecondary },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
  },
  viewBtnText: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textInverse },
});
