// app/(tutor)/_layout.tsx
// Tab navigator for the entire Tutor section.
//
// This file is a _layout.tsx — Expo Router reads it automatically and uses
// it as the navigator wrapper for every screen inside the (tutor) folder.
//
// We define THREE bottom tabs here: Board, Applications, and Profile.
// Each tab name matches a file or folder inside app/(tutor)/:
//   - 'board'        → app/(tutor)/board/   (a folder with its own _layout.tsx)
//   - 'applications' → app/(tutor)/applications.tsx
//   - 'profile'      → app/(tutor)/profile/ (a folder with its own _layout.tsx)
//
// Lab concept: Tab navigators (Week 3 — Expo Router tabs)

import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';

// TypeScript type alias so we get autocomplete on Ionicons icon names
type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

// ---------------------------------------------------------------------------
// Tab configuration array
// ---------------------------------------------------------------------------
// We define the tabs as a data array instead of repeating <Tabs.Screen> three
// times manually. Each object holds everything we need to render one tab entry.
// This is the same "data-driven rendering" pattern as FlatList (Week 2).

interface TabConfig {
  name: string;         // must match the file/folder name inside (tutor)/
  title: string;        // label shown in the tab bar
  icon: IoniconsName;   // outline icon when the tab is inactive
  iconActive: IoniconsName; // filled icon when the tab is active
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

// ---------------------------------------------------------------------------
// Layout component
// ---------------------------------------------------------------------------
// Expo Router calls this as the layout for app/(tutor)/*.
// <Tabs> renders the bottom tab bar; <Tabs.Screen> registers each screen.
// headerShown: false here because each nested Stack supplies its own header.

export default function TutorTabLayout() {
  return (
    <Tabs
      screenOptions={{
        // Hide the default Tabs header — each Stack inside a tab has its own
        headerShown: false,
        // Active (selected) tab tint colour
        tabBarActiveTintColor: Colors.primary,
        // Inactive tab icon/label colour
        tabBarInactiveTintColor: Colors.textTertiary,
        // Tab bar appearance — taller on iOS because of the home indicator
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
      {/* Map over the TABS array to render a Tabs.Screen for each tab.
          This is the same .map() pattern taught in Week 1 (skills list)
          and Week 2 (student list). */}
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            // tabBarIcon receives { focused, color, size } from Expo Router.
            // We switch between the outline and filled icon based on `focused`.
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
