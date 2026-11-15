// components/EmptyState.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../constants/theme';

interface Props { icon?: keyof typeof Ionicons.glyphMap; title: string; subtitle?: string; }

export function EmptyState({ icon = 'search-outline', title, subtitle }: Props) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color={Colors.textTertiary} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: Spacing['3xl'], gap: 8 },
  title: { fontSize: Typography.md, fontWeight: Typography.semiBold, color: Colors.textSecondary, textAlign: 'center' },
  subtitle: { fontSize: Typography.sm, color: Colors.textTertiary, textAlign: 'center', lineHeight: 20 },
});
