// app/(tutor)/profile/_layout.tsx
// Stack navigator for the Profile tab.
//
// The Profile tab contains TWO screens in a push/pop Stack:
//   1. index → app/(tutor)/profile/index.tsx — the read-only profile view
//   2. edit  → app/(tutor)/profile/edit.tsx  — the editable profile form
//
// This follows the same subfolder pattern used by the Board tab:
// a folder named 'profile' with its own _layout.tsx creates a nested Stack
// inside the Profile tab (Week 3 — Stack inside a Tab).
//
// The index screen manages its own full-page header, so the Stack header
// is hidden for it. The edit screen uses the Stack header to show the
// 'Edit Profile' title and a standard back button.

import { Stack } from 'expo-router';
import React from 'react';
import { Colors, Typography } from '../../../constants/theme';

export default function ProfileStackLayout() {
  return (
    // screenOptions sets defaults for every screen in this Stack
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        // The back-arrow and header title colour
        headerTintColor: Colors.primary,
        headerTitleStyle: {
          fontWeight: Typography.semiBold,
          fontSize: Typography.lg,
          color: Colors.textPrimary,
        },
        // Remove the shadow/divider line under the header
        headerShadowVisible: false,
      }}
    >
      {/* Profile view: no Stack header — the screen renders its own layout */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Edit screen: show the Stack header with a back button and title */}
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
