// app/(admin)/users/_layout.tsx
// Stack navigator for the Users tab: list → detail.
// The back arrow takes the admin from UserDetail back to ManageUsers.

import React from 'react';
import { Stack } from 'expo-router';
import { Colors, Typography } from '../../../constants/theme';

export default function UsersStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: Colors.surface },
        headerTintColor: Colors.primary,
        headerTitleStyle: {
          fontWeight: Typography.semiBold,
          color: Colors.textPrimary,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Manage Users' }} />
      <Stack.Screen name="[id]" options={{ title: 'User Detail' }} />
    </Stack>
  );
}
