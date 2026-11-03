// app/(auth)/_layout.tsx
// Stack navigator for the auth flow: login ↔ register

import React from 'react';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right' }} />
  );
}
