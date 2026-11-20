import { Stack } from 'expo-router';
import React from 'react';
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
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

      <Stack.Screen
        name="tutor/[id]"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
