// app/(tutor)/profile/index.tsx
// Screen 4 – Tutor Profile (view)

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../../context/AuthContext';
import { checkProfileIncomplete } from '../../../hooks/useTutorProfile';
import { Avatar } from '../../../components/tutor/Avatar';
import { VerificationBadge } from '../../../components/tutor/VerificationBadge';
import { LoadingState } from '../../../components/tutor/LoadingState';
import { ErrorState } from '../../../components/tutor/ErrorState';
import { formatSalary } from '../../../utils/format';
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadow,
  TouchTarget,
} from '../../../constants/theme';

export default function ProfileScreen() {
  const { profile: data, profileLoading: loading, profileError: error, refetchProfile: refetch, logout } = useAuth();

  if (loading) return <LoadingState message="Loading profile…" />;

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState message={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  if (!data) return null;

  const incomplete = checkProfileIncomplete(data);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Incomplete banner ── */}
        {incomplete && (
          <View style={styles.incompleteBanner}>
            <Ionicons
              name="alert-circle-outline"
              size={18}
              color={Colors.warning}
            />
            <Text style={styles.incompleteBannerText}>
              Complete your profile to get verified.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/(tutor)/profile/edit')}
              hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
              accessibilityLabel="Complete profile"
              accessibilityRole="button"
            >
              <Text style={styles.incompleteBannerLink}>Complete now</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Hero card ── */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <Avatar name={data.name} photo={data.photo} size={72} />
            <View style={styles.heroTopActions}>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => router.push('/(tutor)/profile/edit')}
                activeOpacity={0.8}
                accessibilityLabel="Edit profile"
                accessibilityRole="button"
              >
                <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
                <Text style={styles.editButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={async () => {
                  await logout();
                  router.replace('/(auth)/login' as never);
                }}
                activeOpacity={0.8}
                accessibilityLabel="Log out"
                accessibilityRole="button"
              >
                <Ionicons name="log-out-outline" size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.university}>{data.university}</Text>
          <Text style={styles.dept}>
            {data.department} · {data.year}
          </Text>

          <View style={styles.badgeRow}>
            <VerificationBadge status={data.verification.status} />
          </View>

          {/* Re-submit for verification (only when rejected or after profile completion) */}
          {(data.verification.status === 'rejected' || data.verification.status === 'pending') && !incomplete && (
            <TouchableOpacity
              style={[
                styles.verifyButton,
                data.verification.status === 'rejected' && styles.verifyButtonRejected,
              ]}
              onPress={() => {
                // In production this would call an API endpoint.
                // For the mock we show a confirmation alert.
                Alert.alert(
                  'Submit for Verification',
                  'Your profile will be reviewed by our team. This usually takes 1–2 business days.',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Submit',
                      onPress: () =>
                        Alert.alert('Submitted!', 'Your profile has been submitted for verification.'),
                    },
                  ],
                );
              }}
              activeOpacity={0.85}
              accessibilityLabel="Submit profile for verification"
              accessibilityRole="button"
            >
              <Ionicons
                name="shield-checkmark-outline"
                size={15}
                color={data.verification.status === 'rejected' ? Colors.rejected : Colors.primary}
              />
              <Text
                style={[
                  styles.verifyButtonText,
                  data.verification.status === 'rejected' && styles.verifyButtonTextRejected,
                ]}
              >
                {data.verification.status === 'rejected'
                  ? 'Re-submit for Verification'
                  : 'Submit for Verification'}
              </Text>
            </TouchableOpacity>
          )}

          {/* Rejection reason box */}
          {data.verification.status === 'rejected' &&
            data.verification.reason && (
              <RejectionBox reason={data.verification.reason} />
            )}
        </View>

        {/* ── Info sections ── */}
        <ProfileSection title="Subjects">
          <ChipList items={data.subjects} color={Colors.primary} bg={Colors.primarySurface} />
        </ProfileSection>

        <ProfileSection title="Class Levels">
          <ChipList items={data.classLevels} color={Colors.textSecondary} bg={Colors.divider} />
        </ProfileSection>

        <ProfileSection title="Preferred Areas">
          <ChipList items={data.areas} color={Colors.textSecondary} bg={Colors.divider} />
        </ProfileSection>

        <ProfileSection title="Expected Salary">
          <Text style={styles.infoValue}>{formatSalary(data.expectedSalary)}</Text>
        </ProfileSection>

        <ProfileSection title="Availability">
          <DayChips days={data.availability} />
        </ProfileSection>

        {data.experience ? (
          <ProfileSection title="Experience">
            <Text style={styles.infoText}>{data.experience}</Text>
          </ProfileSection>
        ) : null}

        {data.bio ? (
          <ProfileSection title="Bio">
            <Text style={styles.infoText}>{data.bio}</Text>
          </ProfileSection>
        ) : null}

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RejectionBox({ reason }: { reason: string }) {
  return (
    <View style={rejectionStyles.box}>
      <View style={rejectionStyles.headerRow}>
        <Ionicons
          name="close-circle-outline"
          size={16}
          color={Colors.rejected}
        />
        <Text style={rejectionStyles.title}>Rejection Reason</Text>
      </View>
      <Text style={rejectionStyles.reason}>{reason}</Text>
    </View>
  );
}

function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={sectionStyles.wrapper}>
      <Text style={sectionStyles.title}>{title}</Text>
      <View style={sectionStyles.content}>{children}</View>
    </View>
  );
}

function ChipList({
  items,
  color,
  bg,
}: {
  items: string[];
  color: string;
  bg: string;
}) {
  if (items.length === 0) {
    return <Text style={styles.emptyField}>Not specified</Text>;
  }
  return (
    <View style={chipListStyles.row}>
      {items.map((item) => (
        <View key={item} style={[chipListStyles.chip, { backgroundColor: bg }]}>
          <Text style={[chipListStyles.label, { color }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function DayChips({ days }: { days: string[] }) {
  const ALL_DAYS = ['Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  return (
    <View style={chipListStyles.row}>
      {ALL_DAYS.map((day) => {
        const active = days.includes(day);
        return (
          <View
            key={day}
            style={[
              chipListStyles.dayChip,
              active
                ? chipListStyles.dayChipActive
                : chipListStyles.dayChipInactive,
            ]}
          >
            <Text
              style={[
                chipListStyles.dayLabel,
                active
                  ? chipListStyles.dayLabelActive
                  : chipListStyles.dayLabelInactive,
              ]}
            >
              {day}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['2xl'],
  },
  incompleteBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.warningSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.pendingBorder,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
    flexWrap: 'wrap',
  },
  incompleteBannerText: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.warning,
    fontWeight: Typography.medium,
  },
  incompleteBannerLink: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.pending,
    textDecorationLine: 'underline',
  },
  heroCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    gap: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    marginBottom: Spacing.base,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  heroTopActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primarySurface,
    minHeight: TouchTarget - 12,
  },
  editButtonText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.primary,
  },
  logoutButton: {
    width: TouchTarget - 12,
    height: TouchTarget - 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  verifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.primarySurface,
  },
  verifyButtonRejected: {
    borderColor: Colors.rejectedBorder,
    backgroundColor: Colors.rejectedSurface,
  },
  verifyButtonText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.primary,
  },
  verifyButtonTextRejected: {
    color: Colors.rejected,
  },
  name: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  university: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dept: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  badgeRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  infoValue: {
    fontSize: Typography.md,
    fontWeight: Typography.semiBold,
    color: Colors.primary,
  },
  infoText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: Typography.base * Typography.lineHeightRelaxed,
  },
  emptyField: {
    fontSize: Typography.base,
    color: Colors.textTertiary,
    fontStyle: 'italic',
  },
});

const rejectionStyles = StyleSheet.create({
  box: {
    backgroundColor: Colors.rejectedSurface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.rejectedBorder,
    padding: Spacing.md,
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.rejected,
  },
  reason: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * Typography.lineHeightNormal,
  },
});

const sectionStyles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  title: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
  content: {
    paddingHorizontal: Spacing.base,
    paddingBottom: Spacing.md,
  },
});

const chipListStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
  },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  dayChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayChipInactive: {
    backgroundColor: Colors.surface,
    borderColor: Colors.border,
  },
  dayLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
  },
  dayLabelActive: {
    color: Colors.textInverse,
  },
  dayLabelInactive: {
    color: Colors.textTertiary,
  },
});
