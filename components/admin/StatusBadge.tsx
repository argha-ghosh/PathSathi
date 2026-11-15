// components/admin/StatusBadge.tsx
// Coloured pill badge for user/account status values.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';

type BadgeStatus =
  | 'active'
  | 'suspended'
  | 'banned'
  | 'pending'
  | 'verified'
  | 'rejected'
  | 'student'
  | 'tutor'
  | 'moderator'
  | 'admin';

interface StatusBadgeProps {
  status: BadgeStatus;
  // Optional override label (defaults to capitalised status)
  label?: string;
}

// Map each status to a background + text colour pair
const BADGE_STYLES: Record<BadgeStatus, { bg: string; text: string }> = {
  active:    { bg: Colors.acceptedSurface,  text: Colors.accepted },
  verified:  { bg: Colors.verifiedSurface,  text: Colors.verified },
  suspended: { bg: Colors.pendingSurface,   text: Colors.pending },
  pending:   { bg: Colors.pendingSurface,   text: Colors.pending },
  banned:    { bg: Colors.rejectedSurface,  text: Colors.rejected },
  rejected:  { bg: Colors.rejectedSurface,  text: Colors.rejected },
  student:   { bg: Colors.primarySurface,   text: Colors.primary },
  tutor:     { bg: '#EFF6FF',               text: '#1D4ED8' },
  moderator: { bg: '#F5F3FF',               text: '#6D28D9' },
  admin:     { bg: '#FFF7ED',               text: '#C2410C' },
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  const { bg, text } = BADGE_STYLES[status] ?? { bg: Colors.border, text: Colors.textSecondary };
  const displayLabel = label ?? status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: text }]}>{displayLabel}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
  },
});
