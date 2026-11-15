// app/(admin)/users/[id].tsx
// UserDetailScreen — shows full user info and status-change actions.
//
// States: loading → ErrorView → user detail with action buttons
// Each action opens a ConfirmModal before the API call.

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { getUserById, updateUserStatus } from '../../../services/adminApi';
import { ApiError } from '../../../services/adminApi';
import type { AdminUser, UserStatus } from '../../../types/admin';

import Avatar from '../../../components/admin/Avatar';
import StatusBadge from '../../../components/admin/StatusBadge';
import AppButton from '../../../components/admin/AppButton';
import ConfirmModal from '../../../components/admin/ConfirmModal';
import LoadingView from '../../../components/admin/LoadingView';
import ErrorView from '../../../components/admin/ErrorView';
import ScreenContainer from '../../../components/admin/ScreenContainer';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../../constants/theme';

// Describes a pending status-change action
interface PendingAction {
  newStatus: UserStatus;
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant: 'primary' | 'danger';
}

// Format an ISO date string to a readable date (e.g. "12 Jan 2026")
function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function UserDetailScreen() {
  // Expo Router provides the [id] param from the URL
  const { id } = useLocalSearchParams<{ id: string }>();

  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Action state
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setFetchError(null);
    try {
      const data = await getUserById(id);
      setUser(data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : 'Failed to load user.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchUser();
  }, [fetchUser]);

  // Called when the admin confirms the action in the modal
  async function handleConfirmAction() {
    if (!pendingAction || !user) return;

    setActionLoading(true);
    setActionError(null);
    setActionSuccess(null);

    try {
      const updated = await updateUserStatus(user.id, pendingAction.newStatus);
      // Update local state immediately (optimistic UI)
      setUser(updated);
      setActionSuccess(`User status updated to "${pendingAction.newStatus}".`);
    } catch (err) {
      setActionError(
        err instanceof ApiError
          ? err.message
          : 'Failed to update status. Please try again.',
      );
    } finally {
      setActionLoading(false);
      setPendingAction(null);
    }
  }

  // Show the confirm modal for a given action
  function requestAction(action: PendingAction) {
    setActionError(null);
    setActionSuccess(null);
    setPendingAction(action);
  }

  if (loading) return <LoadingView message="Loading user…" />;
  if (fetchError) {
    return (
      <ErrorView
        message={fetchError}
        onRetry={() => { setLoading(true); void fetchUser(); }}
      />
    );
  }
  if (!user) return null;

  return (
    <ScreenContainer>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* ── Profile card ── */}
        <View style={styles.profileCard}>
          <Avatar name={user.name} size={64} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user.name}</Text>
            <Text style={styles.email}>{user.email}</Text>
            {user.phone ? (
              <Text style={styles.phone}>{user.phone}</Text>
            ) : null}
          </View>
        </View>

        {/* ── Detail rows ── */}
        <View style={styles.detailCard}>
          <DetailRow label="Role">
            <StatusBadge status={user.role} />
          </DetailRow>
          <View style={styles.divider} />

          <DetailRow label="Status">
            <StatusBadge status={user.status} />
          </DetailRow>
          <View style={styles.divider} />

          <DetailRow label="Joined">
            <Text style={styles.detailValue}>{formatDate(user.joinedAt)}</Text>
          </DetailRow>
          <View style={styles.divider} />

          <DetailRow label="User ID">
            <Text style={[styles.detailValue, styles.mono]}>{user.id}</Text>
          </DetailRow>
        </View>

        {/* ── Feedback messages ── */}
        {actionSuccess ? (
          <View style={styles.successBanner}>
            <Text style={styles.successText}>✓ {actionSuccess}</Text>
          </View>
        ) : null}

        {actionError ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠ {actionError}</Text>
          </View>
        ) : null}

        {/* ── Action buttons — shown conditionally based on current status ── */}
        <View style={styles.actions}>
          <Text style={styles.actionsTitle}>Account Actions</Text>

          {/* Suspend — only for active users */}
          {user.status === 'active' && (
            <AppButton
              label="Suspend Account"
              variant="secondary"
              fullWidth
              onPress={() =>
                requestAction({
                  newStatus: 'suspended',
                  title: 'Suspend Account',
                  message: `Suspend ${user.name}? They will not be able to log in until reactivated.`,
                  confirmLabel: 'Suspend',
                  confirmVariant: 'primary',
                })
              }
            />
          )}

          {/* Ban — for active or suspended users */}
          {(user.status === 'active' || user.status === 'suspended') && (
            <AppButton
              label="Ban Account"
              variant="danger"
              fullWidth
              onPress={() =>
                requestAction({
                  newStatus: 'banned',
                  title: 'Ban Account',
                  message: `Permanently ban ${user.name}? This is a serious action.`,
                  confirmLabel: 'Ban',
                  confirmVariant: 'danger',
                })
              }
            />
          )}

          {/* Reactivate — for suspended or banned users */}
          {(user.status === 'suspended' || user.status === 'banned') && (
            <AppButton
              label="Reactivate Account"
              variant="primary"
              fullWidth
              onPress={() =>
                requestAction({
                  newStatus: 'active',
                  title: 'Reactivate Account',
                  message: `Reactivate ${user.name}? They will regain full access to the platform.`,
                  confirmLabel: 'Reactivate',
                  confirmVariant: 'primary',
                })
              }
            />
          )}
        </View>
      </ScrollView>

      {/* Confirm modal — shown when an action is requested */}
      {pendingAction && (
        <ConfirmModal
          visible={!!pendingAction}
          title={pendingAction.title}
          message={pendingAction.message}
          confirmLabel={pendingAction.confirmLabel}
          confirmVariant={pendingAction.confirmVariant}
          onConfirm={handleConfirmAction}
          onCancel={() => setPendingAction(null)}
          loading={actionLoading}
        />
      )}
    </ScreenContainer>
  );
}

// Small helper component for a label + right-side content row
function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingVertical: Spacing.base, gap: Spacing.base },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  profileInfo: { flex: 1, gap: 3 },
  name: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  email: { fontSize: Typography.base, color: Colors.textSecondary },
  phone: { fontSize: Typography.sm, color: Colors.textTertiary },
  detailCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  detailLabel: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    fontWeight: Typography.medium,
  },
  detailValue: {
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontWeight: Typography.medium,
  },
  mono: { fontSize: Typography.sm, color: Colors.textTertiary },
  divider: { height: 1, backgroundColor: Colors.border, marginHorizontal: Spacing.base },
  successBanner: {
    backgroundColor: Colors.acceptedSurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.acceptedBorder,
  },
  successText: { fontSize: Typography.sm, color: Colors.accepted },
  errorBanner: {
    backgroundColor: Colors.errorSurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.rejectedBorder,
  },
  errorText: { fontSize: Typography.sm, color: Colors.error },
  actions: { gap: Spacing.sm },
  actionsTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
});
