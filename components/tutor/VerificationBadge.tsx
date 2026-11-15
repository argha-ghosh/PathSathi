// components/tutor/VerificationBadge.tsx
// Displays tutor verification status as a pill badge.
// Rejected state shows the reason in a highlighted box — rendered separately
// on the Profile screen; this component is just the badge pill.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Radius, Spacing } from '../../constants/theme';
import type { VerificationStatus } from '../../types/tutor';

interface VerificationBadgeProps {
  status: VerificationStatus;
}

const LABELS: Record<VerificationStatus, string> = {
  pending: 'Verification Pending',
  verified: 'Verified',
  rejected: 'Verification Rejected',
};

const CONFIG: Record<
  VerificationStatus,
  { bg: string; text: string; border: string; icon: string }
> = {
  pending: {
    bg: Colors.pendingSurface,
    text: Colors.pending,
    border: Colors.pendingBorder,
    icon: 'time-outline',
  },
  verified: {
    bg: Colors.verifiedSurface,
    text: Colors.verified,
    border: Colors.verifiedBorder,
    icon: 'checkmark-circle',
  },
  rejected: {
    bg: Colors.rejectedSurface,
    text: Colors.rejected,
    border: Colors.rejectedBorder,
    icon: 'close-circle',
  },
};

export function VerificationBadge({ status }: VerificationBadgeProps) {
  const { bg, text, border, icon } = CONFIG[status];
  return (
    <View
      style={[styles.badge, { backgroundColor: bg, borderColor: border }]}
      accessibilityLabel={`Verification status: ${LABELS[status]}`}
    >
      <Ionicons
        name={icon as React.ComponentProps<typeof Ionicons>['name']}
        size={13}
        color={text}
        style={styles.icon}
      />
      <Text style={[styles.label, { color: text }]}>{LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    gap: 4,
  },
  icon: {
    marginTop: 0,
  },
  label: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    letterSpacing: 0.3,
  },
});
