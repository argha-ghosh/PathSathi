// app/(student)/_layout.tsx
// Stack wrapping the tab navigator so tutor/[id] can sit outside tabs.

import React from 'react';
import { Stack } from 'expo-router';
import { Colors, Typography } from '../../constants/theme';

export default function StudentLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.primary,
        headerTitleStyle: {
          fontWeight: Typography.semiBold,
          fontSize: Typography.lg,
          color: Colors.textPrimary,
        },
        headerShadowVisible: false,
      }}
    >
      {/* The tab navigator lives at (student)/(tabs) */}
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      {/* Tutor detail – shown over the tabs without tab bar */}
      <Stack.Screen
        name="tutor/[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
