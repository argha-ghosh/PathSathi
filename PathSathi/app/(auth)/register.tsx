import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, type KeyboardTypeOptions, type ReturnKeyTypeOptions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors, Radius, Shadow, Spacing, TouchTarget, Typography } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { AuthError } from '../../services/authApi';

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterScreen() {
  const { registerTutor, registerStudent, authLoading } = useAuth();
  const { role: roleParam } = useLocalSearchParams<{ role?: string }>();
  const role: 'tutor' | 'student' = roleParam === 'tutor' ? 'tutor' : 'student';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [globalError, setGlobalError] = useState('');

  function validate(): boolean {
    const e: FormErrors = {};

    if (!name.trim()) {
      e.name = 'Full name is required.';
    } else if (name.trim().length < 2) {
      e.name = 'Name must be at least 2 characters.';
    }

    if (!email.trim()) {
      e.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      e.email = 'Enter a valid email address.';
    }

    if (role === 'student') {
      if (!phone.trim()) {
        e.phone = 'Phone number is required.';
      } else if (!/^01[3-9]\d{8}$/.test(phone.trim())) {
        e.phone = 'Enter a valid Bangladeshi phone number (e.g. 01712345678).';
      }
    }

    if (!password) {
      e.password = 'Password is required.';
    } else if (password.length < 6) {
      e.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      e.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      e.confirmPassword = 'Passwords do not match.';
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function clearError(field: keyof FormErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setGlobalError('');
  }

  async function handleRegister() {
    if (!validate()) return;

    try {
      if (role === 'tutor') {
        await registerTutor(name.trim(), email.trim(), password);
        router.replace('/(tutor)/board' as never);
      } else {
        await registerStudent(name.trim(), email.trim(), password, phone.trim());
        router.replace('/(student)/home' as never);
      }
    } catch (err) {
      if (err instanceof AuthError) {
        setGlobalError(err.message);
      } else {
        setGlobalError('Something went wrong. Please try again.');
      }
    }
  }

  const isStudent = role === 'student';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              accessibilityLabel="Go back"
              accessibilityRole="button"
            >
              <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
            </TouchableOpacity>

            <View style={styles.logoWrap}>
              <Ionicons name="navigate-circle" size={44} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>PathSathi</Text>
          </View>

          {/* ── Card ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Create account</Text>
            <Text style={styles.cardSubtitle}>
              {isStudent
                ? 'Join as a student and find your perfect tutor'
                : 'Join as a tutor and find students near you'}
            </Text>

            {/* Role badge */}
            <View style={styles.roleBadge}>
              <Ionicons
                name={isStudent ? 'person-outline' : 'school-outline'}
                size={14}
                color={Colors.primary}
              />
              <Text style={styles.roleBadgeText}>
                {isStudent ? 'Student Account' : 'Tutor Account'}
              </Text>
            </View>

            {/* Global error */}
            {globalError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                <Text style={styles.errorBannerText}>{globalError}</Text>
              </View>
            ) : null}

            {/* Full Name */}
            <InputField
              label="Full Name"
              icon="person-outline"
              value={name}
              onChangeText={(t) => { setName(t); clearError('name'); }}
              placeholder="e.g. Rahim Uddin"
              autoCapitalize="words"
              returnKeyType="next"
              error={errors.name}
              accessibilityLabel="Full name"
            />

            {/* Email */}
            <InputField
              label="Email"
              icon="mail-outline"
              value={email}
              onChangeText={(t) => { setEmail(t); clearError('email'); }}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              error={errors.email}
              accessibilityLabel="Email address"
            />

            {/* Phone – student only */}
            {isStudent && (
              <InputField
                label="Phone Number"
                icon="call-outline"
                value={phone}
                onChangeText={(t) => { setPhone(t); clearError('phone'); }}
                placeholder="e.g. 01712345678"
                keyboardType="phone-pad"
                autoCapitalize="none"
                returnKeyType="next"
                error={errors.phone}
                accessibilityLabel="Phone number"
              />
            )}

            {/* Password */}
            <PasswordField
              label="Password"
              value={password}
              onChangeText={(t) => { setPassword(t); clearError('password'); }}
              placeholder="At least 6 characters"
              show={showPassword}
              onToggleShow={() => setShowPassword((v) => !v)}
              returnKeyType="next"
              error={errors.password}
              accessibilityLabel="Password"
            />

            {/* Confirm Password */}
            <PasswordField
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(t) => { setConfirmPassword(t); clearError('confirmPassword'); }}
              placeholder="Re-enter your password"
              show={showConfirm}
              onToggleShow={() => setShowConfirm((v) => !v)}
              returnKeyType="done"
              onSubmitEditing={handleRegister}
              error={errors.confirmPassword}
              accessibilityLabel="Confirm password"
            />

            {/* Register button */}
            <TouchableOpacity
              style={[
                styles.primaryButton,
                authLoading && styles.primaryButtonDisabled,
              ]}
              onPress={handleRegister}
              disabled={authLoading}
              activeOpacity={0.85}
              accessibilityLabel="Create account"
              accessibilityRole="button"
            >
              {authLoading ? (
                <ActivityIndicator size="small" color={Colors.textInverse} />
              ) : (
                <Text style={styles.primaryButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            <Text style={styles.termsText}>
              By creating an account you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>
          </View>

          {/* ── Login link ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go to login"
            >
              <Text style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Internal field components
// ---------------------------------------------------------------------------

interface InputFieldProps {
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  returnKeyType?: ReturnKeyTypeOptions;
  error?: string;
  accessibilityLabel?: string;
}

function InputField({
  label, icon, error, value, onChangeText, placeholder,
  keyboardType, autoCapitalize, autoCorrect, returnKeyType, accessibilityLabel,
}: InputFieldProps) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={[fieldStyles.row, error ? fieldStyles.rowError : null]}>
        <Ionicons name={icon} size={18} color={Colors.textTertiary} style={fieldStyles.icon} />
        <TextInput
          style={fieldStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          selectionColor={Colors.primary}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          returnKeyType={returnKeyType}
          accessibilityLabel={accessibilityLabel}
        />
      </View>
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
    </View>
  );
}

interface PasswordFieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  show: boolean;
  onToggleShow: () => void;
  returnKeyType?: 'next' | 'done';
  onSubmitEditing?: () => void;
  error?: string;
  accessibilityLabel?: string;
}

function PasswordField({
  label, value, onChangeText, placeholder, show, onToggleShow,
  returnKeyType, onSubmitEditing, error, accessibilityLabel,
}: PasswordFieldProps) {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={[fieldStyles.row, error ? fieldStyles.rowError : null]}>
        <Ionicons
          name="lock-closed-outline"
          size={18}
          color={Colors.textTertiary}
          style={fieldStyles.icon}
        />
        <TextInput
          style={fieldStyles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          secureTextEntry={!show}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          selectionColor={Colors.primary}
          accessibilityLabel={accessibilityLabel}
        />
        <TouchableOpacity
          onPress={onToggleShow}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          accessibilityLabel={show ? 'Hide password' : 'Show password'}
          accessibilityRole="button"
        >
          <Ionicons
            name={show ? 'eye-off-outline' : 'eye-outline'}
            size={18}
            color={Colors.textTertiary}
          />
        </TouchableOpacity>
      </View>
      {error ? <Text style={fieldStyles.error}>{error}</Text> : null}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 0,
    top: Spacing.xl,
    width: TouchTarget,
    height: TouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: Radius.xl,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  appName: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius['2xl'],
    padding: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.md,
  },
  cardTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
    lineHeight: Typography.base * 1.5,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    alignSelf: 'flex-start',
    backgroundColor: Colors.primarySurface,
    borderRadius: Radius.full,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  roleBadgeText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.primary,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.errorSurface,
    borderWidth: 1,
    borderColor: Colors.rejectedBorder,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.base,
  },
  errorBannerText: { flex: 1, fontSize: Typography.sm, color: Colors.error },
  primaryButton: {
    height: TouchTarget,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.xs,
  },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textInverse,
  },
  termsText: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.base,
    lineHeight: Typography.xs * 1.6,
  },
  termsLink: { color: Colors.primary, fontWeight: Typography.medium },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  footerText: { fontSize: Typography.base, color: Colors.textSecondary },
  footerLink: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.primary,
  },
});

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.base, gap: Spacing.xs },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: TouchTarget,
  },
  rowError: { borderColor: Colors.error, backgroundColor: Colors.errorSurface },
  icon: { marginRight: Spacing.xs },
  input: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    height: TouchTarget,
    padding: 0,
  },
  error: { fontSize: Typography.xs, color: Colors.error },
});
