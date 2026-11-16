// components/tutor/ApplicationCard.tsx
// A single card displayed in the My Applications FlatList.
//
// Shows the post subject, title, area, salary, the tutor's application message
// preview, applied date, current status badge, and (for pending applications)
// a Withdraw button.
//
// Props:
//   application   — the Application object to display
//   onWithdraw    — callback fired after the user confirms withdrawal
//   onViewPost    — callback fired when the card is tapped (navigates to post)
//   isWithdrawing — true while the withdraw API call for this card is in progress
//
// Lab concept: reusable list-item component with conditional rendering (Week 1 & 2)

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    Colors,
    Radius,
    Shadow,
    Spacing,
    TouchTarget,
    Typography,
} from '../../constants/theme';
import type { Application } from '../../types/tutor';
import { formatDate, formatSalary, truncate } from '../../utils/format';
import { StatusBadge } from './StatusBadge';

// ---------------------------------------------------------------------------
// Props interface
// ---------------------------------------------------------------------------
interface ApplicationCardProps {
  application: Application;
  onWithdraw: (id: string) => void;
  onViewPost: (postId: string) => void;
  isWithdrawing: boolean;
}

// ---------------------------------------------------------------------------
// ApplicationCard component
// ---------------------------------------------------------------------------
export function ApplicationCard({
  application,
  onWithdraw,
  onViewPost,
  isWithdrawing,
}: ApplicationCardProps) {
  const { post } = application;

  // ---------------------------------------------------------------------------
  // Withdraw confirmation
  // ---------------------------------------------------------------------------
  // Alert.alert() shows a native dialog before performing the destructive action.
  // Same pattern as the "Remove Student" alert in Week 5's StudentDetail.
  function handleWithdraw() {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',         // renders in red on iOS
          onPress: () => onWithdraw(application.id),
        },
      ],
    );
  }

  return (
    // The whole card is tappable — takes the user to the post detail screen
    <TouchableOpacity
      style={styles.card}
      onPress={() => onViewPost(application.postId)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Application for ${post.title}`}
    >
      {/* ── Header: subject badge (left) + status badge (right) ──
          flexDirection: 'row' + justifyContent: 'space-between' (Week 2) */}
      <View style={styles.headerRow}>
        <View style={styles.subjectBadge}>
          <Text style={styles.subjectText}>{post.subject}</Text>
        </View>
        {/* StatusBadge shows pending / accepted / rejected / withdrawn */}
        <StatusBadge status={application.status} />
      </View>

      {/* ── Post title ── */}
      <Text style={styles.title} numberOfLines={2}>
        {post.title}
      </Text>

      {/* ── Meta: area and salary ── */}
      <View style={styles.metaRow}>
        <MetaItem icon="location-outline" label={post.area} />
        <MetaItem icon="cash-outline"     label={formatSalary(post.salary)} />
      </View>

      {/* ── Message preview ──
          Shows the first ~120 characters of the tutor's application message. */}
      <View style={styles.messageBox}>
        <Text style={styles.messageLabel}>Your message</Text>
        <Text style={styles.messageText} numberOfLines={2}>
          {truncate(application.message, 120)}
        </Text>
      </View>

      {/* ── Footer: applied date (left) + Withdraw button (right) ──
          The Withdraw button only renders for pending applications —
          conditional rendering with a ternary (Week 1). */}
      <View style={styles.footerRow}>
        <Text style={styles.dateText}>
          Applied {formatDate(application.appliedAt)}
        </Text>

        {/* Only pending applications can be withdrawn */}
        {application.status === 'pending' ? (
          <TouchableOpacity
            style={styles.withdrawButton}
            onPress={handleWithdraw}
            disabled={isWithdrawing}
            activeOpacity={0.8}
            accessibilityLabel="Withdraw application"
            accessibilityRole="button"
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            {/* Show spinner while this specific card's withdraw is in progress */}
            {isWithdrawing ? (
              <ActivityIndicator size="small" color={Colors.rejected} />
            ) : (
              <>
                <Ionicons
                  name="close-circle-outline"
                  size={14}
                  color={Colors.rejected}
                />
                <Text style={styles.withdrawText}>Withdraw</Text>
              </>
            )}
          </TouchableOpacity>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ---------------------------------------------------------------------------
// MetaItem sub-component
// ---------------------------------------------------------------------------
// Icon + label row — defined here because only this card uses it.
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
  messageBox: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    gap: 2,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  messageLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  messageText: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * Typography.lineHeightNormal,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
    marginTop: Spacing.xs,
  },
  dateText: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.rejectedBorder,
    backgroundColor: Colors.rejectedSurface,
    minHeight: TouchTarget - 12,
  },
  withdrawText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.rejected,
  },
});
