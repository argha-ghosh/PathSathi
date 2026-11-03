// components/tutor/Avatar.tsx
// Displays a circular avatar with a photo or initials fallback.

import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Typography } from '../../constants/theme';
import { getInitials } from '../../utils/format';

interface AvatarProps {
  name: string;
  photo?: string;
  size?: number;
}

export function Avatar({ name, photo, size = 64 }: AvatarProps) {
  const initials = getInitials(name);
  const fontSize = Math.round(size * 0.36);

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
      accessibilityLabel={`Avatar for ${name}`}
    >
      {photo ? (
        <Image
          source={{ uri: photo }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          resizeMode="cover"
        />
      ) : (
        <Text style={[styles.initials, { fontSize }]}>{initials}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  initials: {
    color: Colors.textInverse,
    fontWeight: Typography.bold,
    letterSpacing: 1,
  },
});
