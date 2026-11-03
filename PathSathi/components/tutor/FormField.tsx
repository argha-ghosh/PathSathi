// components/tutor/FormField.tsx
// Labelled input wrapper with inline error text.

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
} from 'react-native';
import { Colors, Typography, Spacing, Radius } from '../../constants/theme';

interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  required?: boolean;
  hint?: string;
  /** Character count display: "current / max" */
  charCount?: { current: number; max: number };
}

export function FormField({
  label,
  error,
  required,
  hint,
  charCount,
  style,
  ...inputProps
}: FormFieldProps) {
  const hasError = Boolean(error);

  return (
    <View style={styles.wrapper}>
      {/* Label row */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {required ? <Text style={styles.asterisk}> *</Text> : null}
        </Text>
        {charCount ? (
          <Text
            style={[
              styles.charCount,
              charCount.current > charCount.max && styles.charCountOver,
            ]}
          >
            {charCount.current}/{charCount.max}
          </Text>
        ) : null}
      </View>

      {/* Input */}
      <TextInput
        style={[
          styles.input,
          inputProps.multiline && styles.multilineInput,
          hasError && styles.inputError,
          style,
        ]}
        placeholderTextColor={Colors.textTertiary}
        selectionColor={Colors.primary}
        {...inputProps}
      />

      {/* Hint */}
      {hint && !error ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}

      {/* Error */}
      {hasError ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.xs,
    marginBottom: Spacing.base,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  asterisk: {
    color: Colors.error,
  },
  charCount: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  charCountOver: {
    color: Colors.error,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    minHeight: 44,
  },
  multilineInput: {
    minHeight: 96,
    paddingTop: Spacing.sm + 2,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorSurface,
  },
  hint: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  errorText: {
    fontSize: Typography.xs,
    color: Colors.error,
  },
});
