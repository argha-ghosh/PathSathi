// app/(admin)/moderators.tsx
// ManageModeratorsScreen — list moderators, create new ones, remove existing ones.
//
// States: loading → ErrorView → EmptyView / list
// Creating: inline form with validation
// Removing: ConfirmModal

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  getModerators,
  createModerator,
  deleteModerator,
  ApiError,
} from '../../services/adminApi';
import type { Moderator, CreateModeratorForm } from '../../types/admin';

import Avatar from '../../components/admin/Avatar';
import AppButton from '../../components/admin/AppButton';
import AppInput from '../../components/admin/AppInput';
import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingView from '../../components/admin/LoadingView';
import ErrorView from '../../components/admin/ErrorView';
import EmptyView from '../../components/admin/EmptyView';
import ScreenContainer from '../../components/admin/ScreenContainer';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';

// Simple email format check
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

// Format ISO date to "12 Jan 2026"
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

export default function ManageModeratorsScreen() {
  const [moderators, setModerators] = useState<Moderator[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Add moderator form state
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CreateModeratorForm>({ name: '', email: '', password: '' });
  const [formErrors, setFormErrors] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Remove moderator state
  const [removeTarget, setRemoveTarget] = useState<Moderator | null>(null);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  const fetchModerators = useCallback(async () => {
    setFetchError(null);
    try {
      const data = await getModerators();
      if (mountedRef.current) setModerators(data);
    } catch (err) {
      if (mountedRef.current)
        setFetchError(err instanceof Error ? err.message : 'Failed to load moderators.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchModerators(); }, [fetchModerators]);

  // ── Form validation ──────────────────────────────────────────
  function validateForm(): boolean {
    const errors = { name: '', email: '', password: '' };
    let valid = true;

    if (form.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters.';
      valid = false;
    }
    if (!isValidEmail(form.email)) {
      errors.email = 'Enter a valid email address.';
      valid = false;
    }
    if (form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
      valid = false;
    }

    setFormErrors(errors);
    return valid;
  }

  // ── Submit new moderator ─────────────────────────────────────
  async function handleSubmit() {
    if (!validateForm()) return;

    Keyboard.dismiss();
    setSubmitting(true);
    setSubmitError(null);

    try {
      const newMod = await createModerator(form);
      if (mountedRef.current) {
        // Prepend to list (backend also does this)
        setModerators((prev) => [newMod, ...prev]);
        // Reset and close the form
        setForm({ name: '', email: '', password: '' });
        setFormErrors({ name: '', email: '', password: '' });
        setShowForm(false);
      }
    } catch (err) {
      if (mountedRef.current)
        setSubmitError(
          err instanceof ApiError ? err.message : 'Failed to create moderator.',
        );
    } finally {
      if (mountedRef.current) setSubmitting(false);
    }
  }

  // ── Remove moderator ─────────────────────────────────────────
  async function handleRemove() {
    if (!removeTarget) return;

    setRemoving(true);
    setRemoveError(null);

    try {
      await deleteModerator(removeTarget.id);
      if (mountedRef.current) {
        setModerators((prev) => prev.filter((m) => m.id !== removeTarget.id));
        setRemoveTarget(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setRemoveError(
          err instanceof ApiError ? err.message : 'Failed to remove moderator.',
        );
        setRemoveTarget(null);
      }
    } finally {
      if (mountedRef.current) setRemoving(false);
    }
  }

  if (loading) {
    return <LoadingView message="Loading moderators…" />;
  }

  if (fetchError) {
    return (
      <ErrorView
        message={fetchError}
        onRetry={() => { setLoading(true); void fetchModerators(); }}
      />
    );
  }

  return (
    <ScreenContainer padHorizontal={false}>
      {/* ── Header row with Add button ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Moderators</Text>
        <TouchableOpacity
          style={[styles.addBtn, showForm && styles.addBtnActive]}
          onPress={() => { setShowForm((v) => !v); setSubmitError(null); }}
          accessibilityLabel={showForm ? 'Cancel' : 'Add moderator'}
          accessibilityRole="button"
        >
          <Ionicons
            name={showForm ? 'close' : 'add'}
            size={20}
            color={showForm ? Colors.error : Colors.primary}
          />
          <Text style={[styles.addBtnText, showForm && styles.addBtnTextActive]}>
            {showForm ? 'Cancel' : 'Add'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Add moderator form (expandable) ── */}
      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>New Moderator</Text>

          {submitError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorBannerText}>⚠ {submitError}</Text>
            </View>
          ) : null}

          <AppInput
            label="Full Name"
            value={form.name}
            onChangeText={(v) => { setForm((f) => ({ ...f, name: v })); setFormErrors((e) => ({ ...e, name: '' })); }}
            placeholder="e.g. Farhan Islam"
            error={formErrors.name}
            autoCapitalize="words"
          />
          <AppInput
            label="Email"
            value={form.email}
            onChangeText={(v) => { setForm((f) => ({ ...f, email: v })); setFormErrors((e) => ({ ...e, email: '' })); }}
            placeholder="e.g. farhan@pathsathi.com"
            error={formErrors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <AppInput
            label="Temporary Password"
            value={form.password}
            onChangeText={(v) => { setForm((f) => ({ ...f, password: v })); setFormErrors((e) => ({ ...e, password: '' })); }}
            placeholder="Min 8 characters"
            error={formErrors.password}
            secureTextEntry
          />

          <AppButton
            label="Create Moderator"
            onPress={handleSubmit}
            loading={submitting}
            fullWidth
          />
        </View>
      )}

      {/* ── Remove error banner ── */}
      {removeError ? (
        <View style={[styles.errorBanner, { marginHorizontal: Spacing.base }]}>
          <Text style={styles.errorBannerText}>⚠ {removeError}</Text>
        </View>
      ) : null}

      {/* ── Moderator list ── */}
      <FlatList
        data={moderators}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Avatar name={item.name} size={44} />
            <View style={styles.rowContent}>
              <Text style={styles.rowName}>{item.name}</Text>
              <Text style={styles.rowEmail}>{item.email}</Text>
              <Text style={styles.rowDate}>Joined {formatDate(item.joinedAt)}</Text>
            </View>
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => { setRemoveError(null); setRemoveTarget(item); }}
              accessibilityLabel={`Remove ${item.name}`}
              accessibilityRole="button"
            >
              <Ionicons name="trash-outline" size={18} color={Colors.error} />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={[
          styles.listContent,
          moderators.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={
          <EmptyView
            icon="shield-outline"
            title="No moderators yet"
            subtitle='Tap "Add" to create the first moderator account.'
          />
        }
        ItemSeparatorComponent={() => <View style={{ height: Spacing.xs }} />}
        showsVerticalScrollIndicator={false}
      />

      {/* Confirm remove modal */}
      <ConfirmModal
        visible={!!removeTarget}
        title="Remove Moderator"
        message={`Remove ${removeTarget?.name} as a moderator? They will lose all moderator access.`}
        confirmLabel="Remove"
        confirmVariant="danger"
        onConfirm={handleRemove}
        onCancel={() => setRemoveTarget(null)}
        loading={removing}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  addBtnActive: { backgroundColor: Colors.errorSurface },
  addBtnText: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.primary },
  addBtnTextActive: { color: Colors.error },
  form: {
    gap: Spacing.md,
    padding: Spacing.base,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  formTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  errorBanner: {
    backgroundColor: Colors.errorSurface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.rejectedBorder,
  },
  errorBannerText: { fontSize: Typography.sm, color: Colors.error },
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['3xl'],
  },
  listEmpty: { flex: 1 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  rowContent: { flex: 1, gap: 2 },
  rowName: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  rowEmail: { fontSize: Typography.sm, color: Colors.textSecondary },
  rowDate: { fontSize: Typography.xs, color: Colors.textTertiary },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.errorSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
