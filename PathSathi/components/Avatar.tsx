// components/Avatar.tsx
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Colors, Typography } from '../constants/theme';
import { getInitials } from '../utils/format';

interface AvatarProps { name: string; photo?: string; size?: number; }

export function Avatar({ name, photo, size = 48 }: AvatarProps) {
  const radius = size / 2;
  if (photo) {
    return (
      <Image
        source={{ uri: photo }}
        style={{ width: size, height: size, borderRadius: radius }}
        accessibilityLabel={`${name} profile photo`}
      />
    );
  }
  return (
    <View style={[styles.fallback, { width: size, height: size, borderRadius: radius }]}>
      <Text style={[styles.initials, { fontSize: size * 0.35 }]}>{getInitials(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center' },
  initials: { color: Colors.textInverse, fontWeight: Typography.bold },
});
