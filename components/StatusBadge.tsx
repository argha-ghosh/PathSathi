// components/StatusBadge.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Typography } from '../constants/theme';

type Status = 'pending' | 'accepted' | 'rejected' | 'open' | 'filled' | 'closed' | 'verified';

interface Props { status: Status; }

const CONFIG: Record<Status, { label: string; bg: string; border: string; text: string }> = {
  pending:  { label: 'Pending',  bg: Colors.pendingSurface,   border: Colors.pendingBorder,   text: Colors.pending },
  accepted: { label: 'Accepted', bg: Colors.acceptedSurface,  border: Colors.acceptedBorder,  text: Colors.accepted },
  rejected: { label: 'Rejected', bg: Colors.rejectedSurface,  border: Colors.rejectedBorder,  text: Colors.rejected },
  open:     { label: 'Open',     bg: Colors.acceptedSurface,  border: Colors.acceptedBorder,  text: Colors.accepted },
  filled:   { label: 'Filled',   bg: Colors.primarySurface,   border: Colors.primaryLight,    text: Colors.primary },
  closed:   { label: 'Closed',   bg: Colors.withdrawnSurface, border: Colors.withdrawnBorder, text: Colors.withdrawn },
  verified: { label: '✓ Verified', bg: Colors.verifiedSurface, border: Colors.verifiedBorder, text: Colors.verified },
};

export function StatusBadge({ status }: Props) {
  const cfg = CONFIG[status];
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[styles.label, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: Radius.full, borderWidth: 1 },
  label: { fontSize: Typography.xs, fontWeight: Typography.semiBold },
});
