// components/admin/ScreenContainer.tsx
// SafeAreaView wrapper with consistent horizontal padding.
// Wraps every admin screen so they all have the same insets.

import React from 'react';
import { StyleSheet, View, StyleProp, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Spacing } from '../../constants/theme';

interface ScreenContainerProps {
  children: React.ReactNode;
  // Pass style to override or extend the inner container
  style?: StyleProp<ViewStyle>;
  // Set to false when the screen manages its own scrolling (e.g. FlatList)
  padHorizontal?: boolean;
}

export default function ScreenContainer({
  children,
  style,
  padHorizontal = true,
}: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View
        style={[
          styles.inner,
          padHorizontal && styles.padded,
          style,
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  inner: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  padded: {
    paddingHorizontal: Spacing.base,
  },
});
