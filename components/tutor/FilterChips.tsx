// components/tutor/FilterChips.tsx
// Horizontal scrollable row of active filter chips + "Clear all" button.

import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';
import type { PostFilters } from '../../types/tutor';

interface FilterChip {
  key: keyof PostFilters;
  label: string;
}

interface FilterChipsProps {
  filters: PostFilters;
  onRemove: (key: keyof PostFilters) => void;
  onClearAll: () => void;
}

/** Build the active chip list from the current filters object. */
function buildChips(filters: PostFilters): FilterChip[] {
  const chips: FilterChip[] = [];

  if (filters.search.trim()) {
    chips.push({ key: 'search', label: `"${filters.search.trim()}"` });
  }
  if (filters.subject) {
    chips.push({ key: 'subject', label: filters.subject });
  }
  if (filters.classLevel) {
    chips.push({ key: 'classLevel', label: filters.classLevel });
  }
  if (filters.area) {
    chips.push({ key: 'area', label: filters.area });
  }
  if (filters.minSalary !== undefined) {
    chips.push({
      key: 'minSalary',
      label: `Min ৳${filters.minSalary.toLocaleString()}`,
    });
  }
  if (filters.maxSalary !== undefined) {
    chips.push({
      key: 'maxSalary',
      label: `Max ৳${filters.maxSalary.toLocaleString()}`,
    });
  }

  return chips;
}

export function FilterChips({ filters, onRemove, onClearAll }: FilterChipsProps) {
  const chips = buildChips(filters);

  if (chips.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {chips.map((chip) => (
        <View key={chip.key} style={styles.chip}>
          <Text style={styles.chipLabel} numberOfLines={1}>
            {chip.label}
          </Text>
          <TouchableOpacity
            onPress={() => onRemove(chip.key)}
            hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
            accessibilityLabel={`Remove ${chip.label} filter`}
            accessibilityRole="button"
          >
            <Ionicons name="close" size={14} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      ))}

      {/* Clear all */}
      <TouchableOpacity
        style={styles.clearAll}
        onPress={onClearAll}
        activeOpacity={0.7}
        accessibilityLabel="Clear all filters"
        accessibilityRole="button"
      >
        <Text style={styles.clearAllText}>Clear all</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.xs,
    paddingHorizontal: 2,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primarySurface,
    borderWidth: 1,
    borderColor: Colors.primaryLight,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  chipLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.medium,
    color: Colors.primary,
    maxWidth: 120,
  },
  clearAll: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  clearAllText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
  },
});
