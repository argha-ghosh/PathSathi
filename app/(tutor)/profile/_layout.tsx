// app/(tutor)/profile/_layout.tsx
// Stack navigator for the Profile tab: view → edit

import React from 'react';
import { Stack } from 'expo-router';
import { Colors, Typography } from '../../../constants/theme';

export default function ProfileStackLayout() {
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
        name="edit"
        options={{
          title: 'Edit Profile',
          headerShown: true,
        }}
      />
    </Stack>
  );
}
