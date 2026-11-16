// app/(tutor)/board/_layout.tsx
// Stack navigator for the Board tab.
//
// The Board tab contains TWO screens in a push/pop Stack:
//   1. index   → app/(tutor)/board/index.tsx   — the list of tuition posts
//   2. [id]    → app/(tutor)/board/[id].tsx    — detail view for one post
//
// Creating a subfolder with its own _layout.tsx is how Expo Router lets a
// single tab host a full Stack navigator (drill-down pattern).
// This is exactly the (home) subfolder pattern from Week 3 of the lab manual.
//
// Lab concept: Stack inside a Tab (Week 3 — Expo Router nested navigators)

import { Stack } from 'expo-router';
import React from 'react';
import { Colors, Typography } from '../../../constants/theme';

export default function BoardStackLayout() {
  return (
    // screenOptions sets defaults for every screen in this Stack.
    // Individual Stack.Screen can override them (like headerShown on index).
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.surface },
        // The back-arrow and title colour
        headerTintColor: Colors.primary,
        headerTitleStyle: {
          fontWeight: Typography.semiBold,
          fontSize: Typography.lg,
          color: Colors.textPrimary,
        },
        // Remove the shadow/border line under the header
        headerShadowVisible: false,
      }}
    >
      {/* The list screen manages its own header (dark nav bar), so we hide
          the Stack header here and let the screen render its own title bar. */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* The detail screen uses the Stack header to show 'Tuition Detail'
          and a back button — the same approach as ArticleDetail in Week 3. */}
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
