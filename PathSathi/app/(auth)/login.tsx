// app/(auth)/login.tsx
// Login screen – email + password, links to register.

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../context/AuthContext';
import { AuthError } from '../../services/authApi';
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadow,
  TouchTarget,
} from '../../constants/theme';

export default function LoginScreen() {
  const { login, authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [globalError, setGlobalError] = useState('');

  function validate(): boolean {
    let valid = true;
    setEmailError('');
    setPasswordError('');
    setGlobalError('');

    if (!email.trim()) {
      setEmailError('Email is required.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Enter a valid email address.');
      valid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      valid = false;
    }

    return valid;
  }

  async function handleLogin() {
    if (!validate()) return;

    try {
      await login(email.trim(), password);
      router.replace('/(tutor)/board');
    } catch (err) {
      if (err instanceof AuthError) {
        setGlobalError(err.message);
      } else {
        setGlobalError('Something went wrong. Please try again.');
      }
    }
  }

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
          {/* ── Logo / Brand ── */}
          <View style={styles.brandSection}>
            <View style={styles.logoWrap}>
              <Ionicons name="navigate-circle" size={56} color={Colors.primary} />
            </View>
            <Text style={styles.appName}>PathSathi</Text>
            <Text style={styles.tagline}>Your path to better teaching</Text>
          </View>

          {/* ── Card ── */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>Sign in to your tutor account</Text>

            {/* Global error */}
            {globalError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                <Text style={styles.errorBannerText}>{globalError}</Text>
              </View>
            ) : null}

            {/* Email */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Email</Text>
              <View style={[styles.inputRow, emailError ? styles.inputRowError : null]}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={Colors.textTertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={(t) => { setEmail(t); setEmailError(''); setGlobalError(''); }}
                  placeholder="you@example.com"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  accessibilityLabel="Email address"
                />
              </View>
              {emailError ? <Text style={styles.fieldError}>{emailError}</Text> : null}
            </View>

            {/* Password */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputRow, passwordError ? styles.inputRowError : null]}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={Colors.textTertiary}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={(t) => { setPassword(t); setPasswordError(''); setGlobalError(''); }}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textTertiary}
                  secureTextEntry={!showPassword}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  accessibilityLabel="Password"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                  accessibilityRole="button"
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={Colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
              {passwordError ? <Text style={styles.fieldError}>{passwordError}</Text> : null}
            </View>

            {/* Login button */}
            <TouchableOpacity
              style={[styles.primaryButton, authLoading && styles.primaryButtonDisabled]}
              onPress={handleLogin}
              disabled={authLoading}
              activeOpacity={0.85}
              accessibilityLabel="Sign in"
              accessibilityRole="button"
            >
              {authLoading ? (
                <ActivityIndicator size="small" color={Colors.textInverse} />
              ) : (
                <Text style={styles.primaryButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            {/* Demo hint */}
            <View style={styles.demoHint}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.textTertiary} />
              <Text style={styles.demoHintText}>
                Demo: <Text style={styles.demoCode}>arif@example.com</Text> / <Text style={styles.demoCode}>password123</Text>
              </Text>
            </View>
          </View>

          {/* ── Register link ── */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity
              onPress={() => router.push('/(auth)/register' as never)}
              accessibilityRole="button"
              accessibilityLabel="Go to register"
            >
              <Text style={styles.footerLink}>Create account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing['3xl'],
    justifyContent: 'center',
  },

  // Brand
  brandSection: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'],
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: Radius['2xl'],
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  appName: {
    fontSize: Typography['4xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // Card
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
    marginBottom: Spacing.xl,
  },

  // Error banner
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
  errorBannerText: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.error,
  },

  // Fields
  fieldWrapper: {
    marginBottom: Spacing.base,
    gap: Spacing.xs,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    height: TouchTarget,
  },
  inputRowError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorSurface,
  },
  inputIcon: {
    marginRight: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    height: TouchTarget,
    padding: 0,
  },
  fieldError: {
    fontSize: Typography.xs,
    color: Colors.error,
  },

  // Buttons
  primaryButton: {
    height: TouchTarget,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  primaryButtonDisabled: { opacity: 0.7 },
  primaryButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textInverse,
  },

  // Demo hint
  demoHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: Spacing.base,
    justifyContent: 'center',
  },
  demoHintText: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  demoCode: {
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
  },

  // Footer
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.xl,
  },
  footerText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  footerLink: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.primary,
  },
});
