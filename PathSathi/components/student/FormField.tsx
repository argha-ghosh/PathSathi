// components/student/FormField.tsx
// Reusable form input field for student screens.

import React from 'react';
import { View, Text, TextInput, StyleSheet, type KeyboardTypeOptions } from 'react-native';
import { Colors, Radius, Spacing, TouchTarget, Typography } from '../../constants/theme';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: KeyboardTypeOptions;
  autoCorrect?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
}

export function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
  autoCorrect,
  multiline,
  numberOfLines,
}: FormFieldProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          multiline && styles.inputMultiline,
          error ? styles.inputError : null,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        secureTextEntry={secureTextEntry}
        autoCapitalize={autoCapitalize}
        keyboardType={keyboardType}
        autoCorrect={autoCorrect}
        multiline={multiline}
        numberOfLines={numberOfLines}
        selectionColor={Colors.primary}
        textAlignVertical={multiline ? 'top' : 'center'}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.xs, marginBottom: Spacing.base },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  input: {
    height: TouchTarget,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  inputMultiline: {
    height: 100,
    paddingTop: Spacing.md,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorSurface,
  },
  error: {
    fontSize: Typography.xs,
    color: Colors.error,
  },
});
