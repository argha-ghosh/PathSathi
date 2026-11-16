// components/tutor/PostCard.tsx
// A single card displayed in the Tuition Board FlatList.
//
// This component is reusable — BoardScreen passes each TuitionPost from its
// FlatList renderItem into this card. Same concept as StudentItem in Week 2:
// you write the card once, then FlatList uses it for every item in the array.
//
// Props:
//   post    — the TuitionPost data to display
//   onPress — callback fired when the card is tapped (navigates to detail)
//
// Lab concept: reusable list-item component with props (Week 1 & 2)

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
    Colors,
    Radius,
    Shadow,
    Spacing,
    Typography,
} from '../../constants/theme';
import type { TuitionPost } from '../../types/tutor';
import { formatDate, formatSalary } from '../../utils/format';

// ---------------------------------------------------------------------------
// Props interface
// ---------------------------------------------------------------------------
interface PostCardProps {
  post: TuitionPost;
  onPress: () => void;
}

// ---------------------------------------------------------------------------
// PostCard component
// ---------------------------------------------------------------------------
export function PostCard({ post, onPress }: PostCardProps) {
  return (
    // TouchableOpacity makes the entire card tappable (Week 2 — same as
    // the row press in StudentItem).
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Tuition post: ${post.title}`}
    >
      {/* Header row: subject badge (left) + posted date (right)
          flexDirection: 'row' + justifyContent: 'space-between' puts them
          on opposite ends — the standard row-layout pattern from Week 2. */}
      <View style={styles.headerRow}>
        <View style={styles.subjectBadge}>
          <Text style={styles.subjectText}>{post.subject}</Text>
        </View>
        <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
      </View>

      {/* Post title — numberOfLines={2} truncates long titles with '…' */}
      <Text style={styles.title} numberOfLines={2}>
        {post.title}
      </Text>

      {/* Meta row: class level, area, days per week.
          Each is a MetaItem sub-component (icon + label side by side). */}
      <View style={styles.metaRow}>
        <MetaItem icon="school-outline"   label={post.classLevel} />
        <MetaItem icon="location-outline" label={post.area} />
        <MetaItem
          icon="calendar-outline"
          label={`${post.daysPerWeek} days/wk`}
        />
      </View>

      {/* Footer: salary (left) + chevron button (right) */}
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

// ---------------------------------------------------------------------------
// MetaItem sub-component
// ---------------------------------------------------------------------------
// A small icon + text pair used in the meta row.
// Defining it here (not in a separate file) because it is only used in
// this card — same approach as the sub-components in Week 3's ArticleDetail.
interface MetaItemProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
}

function MetaItem({ icon, label }: MetaItemProps) {
  return (
    // flexDirection: 'row' aligns the icon and text horizontally (Week 2)
    <View style={styles.metaItem}>
      <Ionicons name={icon} size={13} color={Colors.textTertiary} />
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
    ...Shadow.md,
  },
  // flexDirection: 'row' + justifyContent: 'space-between' — Week 2 Flexbox
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
  // flexWrap: 'wrap' lets meta items spill onto a second line on small screens
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
