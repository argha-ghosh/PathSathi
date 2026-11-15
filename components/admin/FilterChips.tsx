// components/admin/FilterChips.tsx
// Horizontal scrollable row of filter chip buttons.
// Only one chip is active at a time (single-select).

import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Colors, Spacing, Radius, Typography } from '../../constants/theme';

interface Option<T extends string> {
  label: string;
  value: T;
}

interface FilterChipsProps<T extends string> {
  label?: string;           // optional row label (e.g. "Role:")
  options: Option<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

// Generic component so the same chip row works for Role, Status, etc.
export default function FilterChips<T extends string>({
  label,
  options,
  selected,
  onSelect,
}: FilterChipsProps<T>) {
  return (
    <View style={styles.row}>
      {label ? <Text style={styles.label}>{label}</Text> : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {options.map((opt) => {
          const isActive = opt.value === selected;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.chip, isActive && styles.chipActive]}
              onPress={() => onSelect(opt.value)}
              accessibilityRole="button"
              accessibilityLabel={opt.label}
              accessibilityState={{ selected: isActive }}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { gap: Spacing.xs },
  label: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
    paddingLeft: Spacing.xs,
  },
  scroll: { gap: Spacing.xs, paddingVertical: 2 },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.textInverse,
  },
});
