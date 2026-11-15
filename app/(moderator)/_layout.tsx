// app/(moderator)/_layout.tsx
// PLACEHOLDER — owned by the Moderator module teammate.
// Replace this file with a proper Tab/Stack navigator when building the Moderator module.

import React from 'react';
import { Stack } from 'expo-router';
import { Colors, Typography } from '../../constants/theme';

export default function ModeratorLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: Colors.surface },
        headerTitleStyle: {
          fontWeight: Typography.semiBold,
          color: Colors.textPrimary,
        },
        headerShadowVisible: false,
      }}
    />
  );
}
