// components/tutor/StatusBadge.tsx
// Pill badge for ApplicationStatus values.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Radius, Spacing } from '../../constants/theme';
import type { ApplicationStatus } from '../../types/tutor';

interface StatusBadgeProps {
  status: ApplicationStatus;
}

const LABELS: Record<ApplicationStatus, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

const STATUS_STYLES: Record<
  ApplicationStatus,
  { bg: string; text: string; border: string }
> = {
  pending: {
    bg: Colors.pendingSurface,
    text: Colors.pending,
    border: Colors.pendingBorder,
  },
  accepted: {
    bg: Colors.acceptedSurface,
    text: Colors.accepted,
    border: Colors.acceptedBorder,
  },
  rejected: {
    bg: Colors.rejectedSurface,
    text: Colors.rejected,
    border: Colors.rejectedBorder,
  },
  withdrawn: {
    bg: Colors.withdrawnSurface,
    text: Colors.withdrawn,
    border: Colors.withdrawnBorder,
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { bg, text, border } = STATUS_STYLES[status];
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: bg, borderColor: border },
      ]}
      accessibilityLabel={`Status: ${LABELS[status]}`}
    >
      <Text style={[styles.label, { color: text }]}>{LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  label: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    letterSpacing: 0.3,
  },
});
