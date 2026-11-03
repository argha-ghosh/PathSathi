// components/tutor/ApplicationCard.tsx
// Card shown in the My Applications list.

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, Shadow, TouchTarget } from '../../constants/theme';
import { formatSalary, formatDate, truncate } from '../../utils/format';
import { StatusBadge } from './StatusBadge';
import type { Application } from '../../types/tutor';

interface ApplicationCardProps {
  application: Application;
  onWithdraw: (id: string) => void;
  onViewPost: (postId: string) => void;
  isWithdrawing: boolean;
}

export function ApplicationCard({
  application,
  onWithdraw,
  onViewPost,
  isWithdrawing,
}: ApplicationCardProps) {
  const { post } = application;

  function handleWithdraw() {
    Alert.alert(
      'Withdraw Application',
      'Are you sure you want to withdraw this application? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: () => onWithdraw(application.id),
        },
      ],
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onViewPost(application.postId)}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Application for ${post.title}`}
    >
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.subjectBadge}>
          <Text style={styles.subjectText}>{post.subject}</Text>
        </View>
        <StatusBadge status={application.status} />
      </View>

      {/* Post title */}
      <Text style={styles.title} numberOfLines={2}>
        {post.title}
      </Text>

      {/* Meta */}
      <View style={styles.metaRow}>
        <MetaItem icon="location-outline" label={post.area} />
        <MetaItem icon="cash-outline" label={formatSalary(post.salary)} />
      </View>

      {/* Message preview */}
      <View style={styles.messageBox}>
        <Text style={styles.messageLabel}>Your message</Text>
        <Text style={styles.messageText} numberOfLines={2}>
          {truncate(application.message, 120)}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footerRow}>
        <Text style={styles.dateText}>
          Applied {formatDate(application.appliedAt)}
        </Text>

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
