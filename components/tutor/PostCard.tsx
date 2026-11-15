// components/tutor/PostCard.tsx
// Card displayed in the Tuition Board list.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';
import { formatSalary, formatDate } from '../../utils/format';
import type { TuitionPost } from '../../types/tutor';

interface PostCardProps {
  post: TuitionPost;
  onPress: () => void;
}

export function PostCard({ post, onPress }: PostCardProps) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Tuition post: ${post.title}`}
    >
      {/* Header row */}
      <View style={styles.headerRow}>
        <View style={styles.subjectBadge}>
          <Text style={styles.subjectText}>{post.subject}</Text>
        </View>
        <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
      </View>

      {/* Title */}
      <Text style={styles.title} numberOfLines={2}>
        {post.title}
      </Text>

      {/* Meta row */}
      <View style={styles.metaRow}>
        <MetaItem icon="school-outline" label={post.classLevel} />
        <MetaItem icon="location-outline" label={post.area} />
        <MetaItem
          icon="calendar-outline"
          label={`${post.daysPerWeek} days/wk`}
        />
      </View>

      {/* Footer row */}
      <View style={styles.footerRow}>
        <Text style={styles.salary}>{formatSalary(post.salary)}</Text>
        <View style={styles.chevronWrap}>
          <Ionicons
            name="chevron-forward"
            size={18}
            color={Colors.primary}
            accessibilityLabel="View details"
          />
        </View>
      </View>
    </TouchableOpacity>
  );
}

interface MetaItemProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}

function MetaItem({ icon, label }: MetaItemProps) {
  return (
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={13} color={Colors.textTertiary} />
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectBadge: {
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  subjectText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.primary,
  },
  date: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  title: {
    fontSize: Typography.md,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
    lineHeight: Typography.md * Typography.lineHeightNormal,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  salary: {
    fontSize: Typography.md,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  chevronWrap: {
    width: 28,
    height: 28,
    borderRadius: Radius.full,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
