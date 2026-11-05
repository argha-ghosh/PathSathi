// components/tutor/SegmentedTabs.tsx
// Horizontal segmented control for switching between labelled tabs.
// Scrollable so long labels (e.g. "Withdrawn") never wrap.

import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors, Typography, Spacing, Radius, Shadow } from '../../constants/theme';

export interface Tab<T extends string> {
  key: T;
  label: string;
  count?: number;
}

interface SegmentedTabsProps<T extends string> {
  tabs: Tab<T>[];
  activeTab: T;
  onTabChange: (key: T) => void;
}

export function SegmentedTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: SegmentedTabsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollView}
      bounces={false}
    >
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.activeTab]}
              onPress={() => onTabChange(tab.key)}
              activeOpacity={0.7}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={
                tab.count !== undefined
                  ? `${tab.label}, ${tab.count} items`
                  : tab.label
              }
            >
              <Text
                style={[styles.label, isActive && styles.activeLabel]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
              {tab.count !== undefined ? (
                <View
                  style={[
                    styles.countBadge,
                    isActive
                      ? styles.countBadgeActive
                      : styles.countBadgeInactive,
                  ]}
                >
                  <Text
                    style={[
                      styles.countText,
                      isActive
                        ? styles.countTextActive
                        : styles.countTextInactive,
                    ]}
                  >
                    {tab.count}
                  </Text>
                </View>
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.divider,
    borderRadius: Radius.lg,
    padding: 3,
    gap: 2,
    // stretch to fill available width when tabs fit naturally
    flexGrow: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    minHeight: 36,
    // shrink naturally to content — no forced equal flex
  },
  activeTab: {
    backgroundColor: Colors.surface,
    ...Shadow.sm,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
  activeLabel: {
    color: Colors.primary,
    fontWeight: Typography.semiBold,
  },
  countBadge: {
    borderRadius: Radius.full,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countBadgeActive: {
    backgroundColor: Colors.primarySurface,
  },
  countBadgeInactive: {
    backgroundColor: Colors.border,
  },
  countText: {
    fontSize: Typography.xs - 1,
    fontWeight: Typography.bold,
  },
  countTextActive: {
    color: Colors.primary,
  },
  countTextInactive: {
    color: Colors.textSecondary,
  },
});
