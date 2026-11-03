// app/(tutor)/_layout.tsx
// Tab navigator for the Tutor module: Board | Applications | Profile

import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing } from '../../constants/theme';
import { Platform } from 'react-native';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconsName;
  iconActive: IoniconsName;
}

const TABS: TabConfig[] = [
  {
    name: 'board',
    title: 'Board',
    icon: 'grid-outline',
    iconActive: 'grid',
  },
  {
    name: 'applications',
    title: 'Applications',
    icon: 'document-text-outline',
    iconActive: 'document-text',
  },
  {
    name: 'profile',
    title: 'Profile',
    icon: 'person-outline',
    iconActive: 'person',
  },
];

export default function TutorTabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 60,
          paddingBottom: Platform.OS === 'ios' ? 28 : Spacing.xs,
          paddingTop: Spacing.xs,
        },
        tabBarLabelStyle: {
          fontSize: Typography.xs,
          fontWeight: Typography.medium,
          marginTop: 2,
        },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? tab.iconActive : tab.icon}
                size={size}
                color={color}
                accessibilityLabel={tab.title}
              />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
