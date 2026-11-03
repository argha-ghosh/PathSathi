// app/(tutor)/board/_layout.tsx
// Stack navigator for the Board tab: list → detail

import React from 'react';
import { Stack } from 'expo-router';
import { Colors, Typography } from '../../../constants/theme';

export default function BoardStackLayout() {
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
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Tuition Detail',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
