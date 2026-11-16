// components/tutor/FormField.tsx
// Reusable labelled TextInput with inline error text, hint, and char counter.
//
// This is the tutor module's equivalent of the FormField component built in
// Week 4's lab manual. Each form in the tutor section reuses this component
// instead of duplicating label + input + error text multiple times.
//
// Props:
//   label        — the field label shown above the input
//   error        — error string shown in red below the input (optional)
//   required     — if true, shows a red asterisk next to the label
//   hint         — grey helper text shown below the input when there is no error
//   charCount    — { current, max } to display a "12/300" counter (optional)
//   ...rest      — all standard TextInput props (value, onChangeText, etc.)
//
// Lab concept: reusable controlled input component with error display (Week 4)

import React from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    View,
} from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';

// ---------------------------------------------------------------------------
// Props interface
// ---------------------------------------------------------------------------
// We extend TextInputProps so callers can pass any standard TextInput prop
// (value, onChangeText, placeholder, multiline, keyboardType, etc.) directly
// to FormField without needing a wrapper.
interface FormFieldProps extends TextInputProps {
  label: string;
  error?: string | null;
  required?: boolean;
  hint?: string;
  /** Shows "current / max" in the top-right of the label row */
  charCount?: { current: number; max: number };
}

// ---------------------------------------------------------------------------
// FormField component
// ---------------------------------------------------------------------------
export function FormField({
  label,
  error,
  required,
  hint,
  charCount,
  style,
  ...inputProps  // remaining props forwarded to TextInput
}: FormFieldProps) {
  // hasError drives both the border colour and the error text visibility
  const hasError = Boolean(error);

  return (
    <View style={styles.wrapper}>
      {/* ── Label row ──
          Label text on the left; optional char counter on the right.
          justifyContent: 'space-between' pushes them to opposite ends. */}
      <View style={styles.labelRow}>
        <Text style={styles.label}>
          {label}
          {/* Conditionally render the asterisk — Week 1's conditional rendering */}
          {required ? <Text style={styles.asterisk}> *</Text> : null}
        </Text>
        {charCount ? (
          <Text
            style={[
              styles.charCount,
              // Red when the user has exceeded the max — conditional style array
              charCount.current > charCount.max && styles.charCountOver,
            ]}
          >
            {charCount.current}/{charCount.max}
          </Text>
        ) : null}
      </View>

      {/* ── Controlled TextInput ──
          value and onChangeText must be provided by the parent to make this
          a controlled component. All other props are spread from inputProps.
          This is exactly the same pattern as FormField in Week 4. */}
      <TextInput
        style={[
          styles.input,
          inputProps.multiline && styles.multilineInput,
          // Red border when there is an error — conditional style array (Week 1)
          hasError && styles.inputError,
          style,
        ]}
        placeholderTextColor={Colors.textTertiary}
        selectionColor={Colors.primary}
        {...inputProps}
      />

      {/* ── Hint text ──
          Only shown when there is no error. Provides helpful context. */}
      {hint && !error ? (
        <Text style={styles.hint}>{hint}</Text>
      ) : null}

      {/* ── Inline error text ──
          Only shown when `error` is a non-empty string.
          accessibilityRole="alert" announces the error to screen readers. */}
      {hasError ? (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
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
  // Taller input for multiline fields (e.g. Bio, Experience)
  multilineInput: {
    minHeight: 96,
    paddingTop: Spacing.sm + 2,
    // Aligns the cursor at the top-left for multiline inputs on Android
    textAlignVertical: 'top',
  },
  // Red border + light red background when validation has failed
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
