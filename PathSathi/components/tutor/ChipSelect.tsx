// components/tutor/ChipSelect.tsx
// A horizontally scrollable row of toggleable chip buttons.
//
// Used in the Edit Profile form for multi-select fields (Subjects, Class Levels,
// Areas) and can also operate in single-select mode (single={true}).
//
// Props:
//   options   — the full list of string options to show as chips
//   selected  — the currently selected values (controlled by parent state)
//   onToggle  — callback fired when a chip is tapped; receives the chip's value
//   single    — if true, the component acts as a radio group (default: false)
//   error     — validation error string shown below the row (optional)
//
// Key concept: this is a CONTROLLED component — the parent owns `selected`
// (via useState) and updates it through onToggle. The component itself has no
// internal state. This is the same controlled pattern as TextInput with
// value + onChangeText (Week 2 / Week 4).

import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import {
    Colors,
    Radius,
    Spacing,
    TouchTarget,
    Typography,
} from '../../constants/theme';

// ---------------------------------------------------------------------------
// Props interface
// ---------------------------------------------------------------------------
interface ChipSelectProps {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  /** Single-select mode: selecting a chip deselects all others. */
  single?: boolean;
  error?: string | null;
  accessibilityHint?: string;
}

// ---------------------------------------------------------------------------
// ChipSelect component
// ---------------------------------------------------------------------------
export function ChipSelect({
  options,
  selected,
  onToggle,
  single = false,
  error,
  accessibilityHint,
}: ChipSelectProps) {
  // Convenience helper to check if a value is selected
  const isSelected = (v: string) => selected.includes(v);

  // ARIA role: radio for single-select, checkbox for multi-select
  const chipRole = single ? ('radio' as const) : ('checkbox' as const);

  return (
    <View style={styles.wrapper}>
      {/* Horizontal ScrollView so the chip row scrolls when there are many options.
          This is the standard horizontal tag/badge layout (Week 1 skills section). */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        accessibilityHint={accessibilityHint}
      >
        {/* Map over all options to render a chip for each one.
            Same .map() pattern as Week 1's skills list and Week 2's FlatList. */}
        {options.map((option) => {
          const active = isSelected(option);
          return (
            <TouchableOpacity
              key={option}
              // Conditional style array — active chip gets a filled background.
              // Same pattern as Week 1's Follow button styles.
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onToggle(option)}
              activeOpacity={0.75}
              accessibilityRole={chipRole}
              accessibilityState={{ checked: active }}
              accessibilityLabel={option}
              hitSlop={{ top: 4, bottom: 4, left: 2, right: 2 }}
            >
              {/* Show a checkmark icon only when the chip is selected */}
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

      {/* Inline error text — same pattern as FormField (Week 4) */}
      {error ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.xs,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'nowrap',  // chips stay on one line and scroll horizontally
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
  // Active chip: filled primary colour background — conditional style (Week 1)
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
