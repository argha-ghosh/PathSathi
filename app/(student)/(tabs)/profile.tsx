// app/(student)/profile.tsx
// Student profile screen – matches the My Profile design.

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../../context/AuthContext';
import { updateProfile } from '../../../services/authApi';
import { getMyPosts } from '../../../services/studentApi';
import {
  Colors, Radius, Shadow, Spacing, TouchTarget, Typography,
} from '../../../constants/theme';
import { getInitials } from '../../../utils/format';
import { useFocusEffect } from 'expo-router';

export default function StudentProfileScreen() {
  const { user, logout } = useAuth();
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [postCount, setPostCount] = useState<number | null>(null);

  // Load post count — refetches every time screen is focused
  useFocusEffect(
    React.useCallback(() => {
      if (user) {
        getMyPosts(user.id).then((posts) => setPostCount(posts.length)).catch(() => setPostCount(0));
      }
    }, [user]),
  );

  async function handleLogout() {
    await logout();
    router.replace('/(auth)/login' as never);
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* ── Top bar ── */}
      <View style={styles.topBar}>
        <Pressable style={styles.topBarBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={Colors.textInverse} />
        </Pressable>
        <Text style={styles.topBarTitle}>My Profile</Text>
        <Pressable
          style={styles.topBarBtn}
          onPress={() => setEditModalVisible(true)}
          accessibilityLabel="Edit profile"
        >
          <Ionicons name="create-outline" size={20} color={Colors.textInverse} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Avatar + name hero ── */}
        <View style={styles.hero}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user?.name ?? '?')}</Text>
          </View>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>

        {/* ── Contact card ── */}
        <View style={styles.card}>
          <ContactRow
            icon="mail-outline"
            value={user?.email ?? '—'}
            subLabel="Email cannot be changed"
          />
          <View style={styles.divider} />
          <ContactRow
            icon="call-outline"
            label="PHONE NUMBER"
            value={user?.phone ?? 'Not set'}
          />
        </View>

        {/* ── Account section ── */}
        <Text style={styles.sectionLabel}>ACCOUNT</Text>
        <View style={styles.card}>
          <AccountRow
            icon="shield-checkmark-outline"
            label="ACCOUNT TYPE"
            value="Student / Guardian"
          />
          <View style={styles.divider} />
          <AccountRow
            icon="phone-portrait-outline"
            label="ACCOUNT ID"
            value={user?.id ?? '—'}
          />
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionLabel}>QUICK ACTIONS</Text>
        <View style={styles.card}>
          <QuickActionRow
            icon="documents-outline"
            title="My Tuition Posts"
            subtitle={postCount === null ? 'Loading…' : `${postCount} post${postCount !== 1 ? 's' : ''}`}
            onPress={() => router.push('/(student)/posts' as never)}
          />
          <View style={styles.divider} />
          <QuickActionRow
            icon="search-outline"
            title="Browse Tutors"
            subtitle="Find the right tutor"
            onPress={() => router.push('/(student)/home' as never)}
          />
          <View style={styles.divider} />
          <QuickActionRow
            icon="add-circle-outline"
            title="Post New Request"
            subtitle="Find a tutor for your need"
            onPress={() => router.push('/(student)/posts' as never)}
          />
        </View>

        {/* ── Sign Out ── */}
        <Pressable style={styles.signOutBtn} onPress={handleLogout} accessibilityRole="button">
          <Ionicons name="log-out-outline" size={20} color={Colors.rejected} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>

      {/* ── Edit Modal ── */}
      <EditProfileModal
        visible={editModalVisible}
        user={user}
        onClose={() => setEditModalVisible(false)}
      />
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// ContactRow
// ---------------------------------------------------------------------------

function ContactRow({
  icon, label, value, subLabel,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label?: string;
  value: string;
  subLabel?: string;
}) {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.iconWrap}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        {label && <Text style={rowStyles.label}>{label}</Text>}
        <Text style={rowStyles.value}>{value}</Text>
        {subLabel && <Text style={rowStyles.subLabel}>{subLabel}</Text>}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// AccountRow
// ---------------------------------------------------------------------------

function AccountRow({
  icon, label, value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={rowStyles.row}>
      <View style={rowStyles.iconWrap}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={rowStyles.label}>{label}</Text>
        <Text style={rowStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// QuickActionRow
// ---------------------------------------------------------------------------

function QuickActionRow({
  icon, title, subtitle, onPress,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle?: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={rowStyles.actionRow} onPress={onPress} accessibilityRole="button">
      <View style={rowStyles.iconWrap}>
        <Ionicons name={icon} size={18} color={Colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={rowStyles.actionTitle}>{title}</Text>
        {subtitle && <Text style={rowStyles.actionSubtitle}>{subtitle}</Text>}
      </View>
      <Ionicons name="chevron-forward" size={18} color={Colors.textTertiary} />
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// EditProfileModal
// ---------------------------------------------------------------------------

function EditProfileModal({
  visible, user, onClose,
}: {
  visible: boolean;
  user: { id: string; name: string; email: string; phone?: string; role: string } | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [saveError, setSaveError] = useState('');
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    let valid = true;
    setNameError(''); setPhoneError(''); setSaveError('');
    if (!name.trim() || name.trim().length < 2) {
      setNameError('Name must be at least 2 characters.'); valid = false;
    }
    if (phone.trim() && !/^01[3-9]\d{8}$/.test(phone.trim())) {
      setPhoneError('Enter a valid Bangladeshi phone number.'); valid = false;
    }
    return valid;
  }

  async function handleSave() {
    if (!user || !validate()) return;
    setSaving(true);
    try {
      await updateProfile(user.id, { name: name.trim(), phone: phone.trim() });
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); }, 1000);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={modalStyles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={modalStyles.header}>
          <Pressable onPress={onClose} style={modalStyles.headerBtn}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={modalStyles.title}>Edit Profile</Text>
          <Pressable
            onPress={handleSave}
            disabled={saving}
            style={[modalStyles.saveBtn, saving && { opacity: 0.6 }]}
          >
            {saving
              ? <ActivityIndicator size="small" color={Colors.primary} />
              : <Text style={modalStyles.saveBtnText}>Save</Text>}
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={modalStyles.scroll} keyboardShouldPersistTaps="handled">
          {success && (
            <View style={modalStyles.successBanner}>
              <Ionicons name="checkmark-circle" size={16} color={Colors.accepted} />
              <Text style={modalStyles.successText}>Profile updated!</Text>
            </View>
          )}
          {saveError ? (
            <View style={modalStyles.errorBanner}>
              <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
              <Text style={modalStyles.errorText}>{saveError}</Text>
            </View>
          ) : null}

          {/* Name */}
          <View style={modalStyles.fieldWrapper}>
            <Text style={modalStyles.fieldLabel}>Full Name</Text>
            <TextInput
              style={[modalStyles.input, nameError ? modalStyles.inputError : null]}
              value={name}
              onChangeText={(t) => { setName(t); setNameError(''); }}
              placeholder="Your full name"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="words"
            />
            {nameError ? <Text style={modalStyles.fieldError}>{nameError}</Text> : null}
          </View>

          {/* Email (read-only) */}
          <View style={modalStyles.fieldWrapper}>
            <Text style={modalStyles.fieldLabel}>Email</Text>
            <TextInput
              style={[modalStyles.input, { color: Colors.textTertiary }]}
              value={user?.email ?? ''}
              editable={false}
            />
            <Text style={modalStyles.fieldHint}>Email cannot be changed</Text>
          </View>

          {/* Phone */}
          <View style={modalStyles.fieldWrapper}>
            <Text style={modalStyles.fieldLabel}>Phone Number</Text>
            <TextInput
              style={[modalStyles.input, phoneError ? modalStyles.inputError : null]}
              value={phone}
              onChangeText={(t) => { setPhone(t); setPhoneError(''); }}
              placeholder="e.g. 01712345678"
              placeholderTextColor={Colors.textTertiary}
              keyboardType="phone-pad"
            />
            {phoneError ? <Text style={modalStyles.fieldError}>{phoneError}</Text> : null}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },

  // Top bar – indigo/primary background
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  topBarBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textInverse,
  },

  scroll: { paddingBottom: Spacing['4xl'] },

  // Hero
  hero: {
    backgroundColor: Colors.primary,
    alignItems: 'center',
    paddingTop: Spacing.base,
    paddingBottom: Spacing['2xl'],
    gap: Spacing.sm,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  avatarText: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textInverse,
  },
  userName: {
    fontSize: Typography.xl,
    fontWeight: Typography.bold,
    color: Colors.textInverse,
  },

  // Cards
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.divider,
    marginLeft: 64,
  },

  sectionLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.bold,
    color: Colors.textTertiary,
    letterSpacing: 1,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },

  // Sign out
  signOutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginHorizontal: Spacing.base,
    marginTop: Spacing.base,
    height: TouchTarget + 4,
    borderRadius: Radius.lg,
    borderWidth: 2,
    borderColor: Colors.rejected,
    backgroundColor: Colors.surface,
  },
  signOutText: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.rejected,
  },
});

const rowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.semiBold,
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  value: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  subLabel: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.base,
    gap: Spacing.md,
  },
  actionTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  actionSubtitle: {
    fontSize: Typography.xs,
    color: Colors.textTertiary,
    marginTop: 2,
  },
});

const modalStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerBtn: {
    width: TouchTarget,
    height: TouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
  },
  saveBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  saveBtnText: {
    fontSize: Typography.base,
    fontWeight: Typography.bold,
    color: Colors.primary,
  },
  scroll: { padding: Spacing.base },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.acceptedSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.acceptedBorder,
  },
  successText: { fontSize: Typography.sm, color: Colors.accepted, fontWeight: Typography.semiBold },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.errorSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.rejectedBorder,
  },
  errorText: { fontSize: Typography.sm, color: Colors.error },
  fieldWrapper: { marginBottom: Spacing.base, gap: Spacing.xs },
  fieldLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  input: {
    height: TouchTarget,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorSurface,
  },
  fieldError: { fontSize: Typography.xs, color: Colors.error },
  fieldHint: { fontSize: Typography.xs, color: Colors.textTertiary },
});
