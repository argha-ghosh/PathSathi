// components/admin/Avatar.tsx
// Displays user initials in a coloured circle.
// Used when no profile photo is available.

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../constants/theme';

interface AvatarProps {
  name: string;
  size?: number;
}

// Pick a consistent background colour based on the first letter
const BG_COLOURS = [
  '#4F46E5', '#7C3AED', '#DB2777', '#DC2626',
  '#D97706', '#059669', '#0891B2', '#2563EB',
];

function getColour(name: string): string {
  const code = name.charCodeAt(0) || 0;
  return BG_COLOURS[code % BG_COLOURS.length];
}

function getInitials(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export default function Avatar({ name, size = 44 }: AvatarProps) {
  const bg = getColour(name);
  const initials = getInitials(name);
  const fontSize = size * 0.38; // scale font proportionally

  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
      ]}
    >
      <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: Colors.textInverse,
    fontWeight: Typography.bold,
  },
});
