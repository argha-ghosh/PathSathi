// components/tutor/ChipSelect.tsx
// Scrollable row of toggleable chip buttons for multi-select (and single-select) fields.

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius, TouchTarget } from '../../constants/theme';

interface ChipSelectProps {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  /** If true, selecting a chip deselects all others (single-select mode). */
  single?: boolean;
  error?: string | null;
  accessibilityHint?: string;
}

export function ChipSelect({
  options,
  selected,
  onToggle,
  single = false,
  error,
  accessibilityHint,
}: ChipSelectProps) {
  const isSelected = (v: string) => selected.includes(v);
  // single-select: aria role is "radio"; multi-select: "checkbox"
  const chipRole = single ? ('radio' as const) : ('checkbox' as const);

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        accessibilityHint={accessibilityHint}
      >
        {options.map((option) => {
          const active = isSelected(option);
          return (
            <TouchableOpacity
              key={option}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onToggle(option)}
              activeOpacity={0.75}
              accessibilityRole={chipRole}
              accessibilityState={{ checked: active }}
              accessibilityLabel={option}
              hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
            >
              {active ? (
                <Ionicons
                  name="checkmark"
                  size={12}
                  color={Colors.textInverse}
                  style={styles.checkIcon}
                />
              ) : null}
              <Text style={[styles.label, active && styles.labelActive]}>
                {option}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
      {error ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    minHeight: TouchTarget - 8,
    gap: 4,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkIcon: {
    marginRight: 2,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.textInverse,
    fontWeight: Typography.semiBold,
  },
  errorText: {
    fontSize: Typography.xs,
    color: Colors.error,
    paddingHorizontal: 2,
  },
});
