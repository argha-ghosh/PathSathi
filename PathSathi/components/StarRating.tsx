// components/StarRating.tsx — display + interactive star rating
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Typography } from '../constants/theme';

// ── Display only (read-only) ─────────────────────────────────────
interface DisplayProps {
  rating: number;
  reviewCount?: number;
  size?: number;
  showCount?: boolean;
}

export function StarRatingDisplay({
  rating,
  reviewCount,
  size = 14,
  showCount = true,
}: DisplayProps) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((i) => {
        const name: React.ComponentProps<typeof Ionicons>['name'] =
          i <= fullStars
            ? 'star'
            : i === fullStars + 1 && hasHalf
            ? 'star-half'
            : 'star-outline';
        return (
          <Ionicons key={i} name={name} size={size} color="#F59E0B" />
        );
      })}
      {showCount && (
        <Text style={[styles.count, { fontSize: size - 2 }]}>
          {rating.toFixed(1)}{reviewCount !== undefined ? ` (${reviewCount})` : ''}
        </Text>
      )}
    </View>
  );
}

// ── Interactive (for submitting a review) ───────────────────────
interface InteractiveProps {
  value: number;
  onChange: (v: number) => void;
  size?: number;
}

export function StarRatingInput({ value, onChange, size = 32 }: InteractiveProps) {
  return (
    <View style={styles.inputRow}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity
          key={i}
          onPress={() => onChange(i)}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
          accessibilityLabel={`${i} star${i !== 1 ? 's' : ''}`}
          accessibilityRole="radio"
          accessibilityState={{ checked: value === i }}
        >
          <Ionicons
            name={i <= value ? 'star' : 'star-outline'}
            size={size}
            color={i <= value ? '#F59E0B' : Colors.border}
          />
        </TouchableOpacity>
      ))}
      {value > 0 && (
        <Text style={styles.selectedLabel}>
          {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][value]}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  count: { color: Colors.textSecondary, marginLeft: 4, fontWeight: Typography.medium },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  selectedLabel: { marginLeft: Spacing.sm, fontSize: Typography.base, fontWeight: Typography.semiBold, color: '#F59E0B' },
});
