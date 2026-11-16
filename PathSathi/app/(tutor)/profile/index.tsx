// app/(tutor)/profile/index.tsx
// Screen 4 — Tutor Profile (read-only view)
//
// This screen shows the tutor's full profile in a scrollable layout.
// It is a pure READ screen — no state of its own. All data comes from
// the global AuthContext via the useAuth() hook.
//
// Sections shown:
//   - Incomplete-profile warning banner (if applicable)
//   - Hero card: avatar, name, university, dept, year, verification badge,
//                edit button, logout button, verify/re-submit button,
//                rejection-reason box
//   - Info cards: Subjects, Class Levels, Areas, Expected Salary,
//                 Availability, Experience, Bio
//
// Key patterns used (from lab manuals):
//   - useAuth() (global context, Week 5) for profile data and actions
//   - Conditional rendering for loading / error / incomplete states (Week 1)
//   - router.push() / router.replace() for navigation (Week 3)
//   - Alert.alert() for destructive-action confirmation (Week 5)
//   - Sub-components defined in the same file (Week 3 pattern)

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import {
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Global auth context — provides profile data, logout, etc. (Week 5 pattern)
import { useAuth } from '../../../context/AuthContext';

// Helper function that checks whether required profile fields are still empty
import { checkProfileIncomplete } from '../../../hooks/useTutorProfile';

// Reusable tutor components
import { Avatar } from '../../../components/tutor/Avatar';
import { ErrorState } from '../../../components/tutor/ErrorState';
import { LoadingState } from '../../../components/tutor/LoadingState';
import { VerificationBadge } from '../../../components/tutor/VerificationBadge';

// Utility function: formats a number as currency (e.g. 5000 → "৳5,000/mo")
import { formatSalary } from '../../../utils/format';

import {
    Colors,
    Radius,
    Shadow,
    Spacing,
    TouchTarget,
    Typography,
} from '../../../constants/theme';

export default function ProfileScreen() {
  // ---------------------------------------------------------------------------
  // Global state from AuthContext
  // ---------------------------------------------------------------------------
  // No local state needed here — this is a pure read screen.
  // profile     — the TutorProfile object (null while loading)
  // loading     — true during the initial profile fetch
  // error       — error string or null
  // refetch     — reloads the profile from the API
  // logout      — clears the user session and navigates to login
  const {
    profile: data,
    profileLoading: loading,
    profileError: error,
    refetchProfile: refetch,
    logout,
  } = useAuth();

  // ---------------------------------------------------------------------------
  // Loading / error / empty states
  // ---------------------------------------------------------------------------
  // Show a spinner while the profile is loading on first visit
  if (loading) return <LoadingState message="Loading profile…" />;

  // Show an error screen with a "Try Again" button if the fetch failed
  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ErrorState message={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // If profile is null (e.g. logged out between renders), render nothing.
  // The root layout's auth gate will redirect to the login screen.
  if (!data) return null;

  // Derived value — not state. checkProfileIncomplete() checks whether
  // required fields (subjects, areas, etc.) are still empty.
  const incomplete = checkProfileIncomplete(data);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Incomplete-profile banner ──
            Only shown when at least one required field is missing.
            Conditional rendering with && — same as Week 1's skills section. */}
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

        {/* ── Hero card ──
            Avatar, name, university, department/year, verification badge,
            edit & logout buttons, verify/re-submit button (conditional). */}
        <View style={styles.heroCard}>
          {/* Top row: Avatar (left) + Edit/Logout buttons (right) */}
          <View style={styles.heroTop}>
            {/* Avatar shows initials if no photo is set */}
            <Avatar name={data.name} photo={data.photo} size={72} />
            <View style={styles.heroTopActions}>
              {/* Edit button — navigates to the edit screen (Week 3: router.push) */}
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
              {/* Logout button — calls logout() then redirects to login.
                  router.replace() replaces the current route so the user
                  can't press Back to return to this screen (Week 3). */}
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

          {/* Name, university, department and year */}
          <Text style={styles.name}>{data.name}</Text>
          <Text style={styles.university}>{data.university}</Text>
          <Text style={styles.dept}>
            {data.department} · {data.year}
          </Text>

          {/* Verification badge — shows pending / verified / rejected */}
          <View style={styles.badgeRow}>
            <VerificationBadge status={data.verification.status} />
          </View>

          {/* Submit / Re-submit for verification button.
              Only shown when: profile is complete AND status is not 'verified'.
              Conditional rendering with && and ternary (Week 1). */}
          {(data.verification.status === 'rejected' ||
            data.verification.status === 'pending') &&
            !incomplete && (
              <TouchableOpacity
                style={[
                  styles.verifyButton,
                  data.verification.status === 'rejected' &&
                    styles.verifyButtonRejected,
                ]}
                onPress={() => {
                  // Alert.alert for confirmation before submitting — same
                  // destructive-action pattern as Week 5's Remove Student.
                  Alert.alert(
                    'Submit for Verification',
                    'Your profile will be reviewed by our team. This usually takes 1–2 business days.',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      {
                        text: 'Submit',
                        onPress: () =>
                          Alert.alert(
                            'Submitted!',
                            'Your profile has been submitted for verification.',
                          ),
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
                  color={
                    data.verification.status === 'rejected'
                      ? Colors.rejected
                      : Colors.primary
                  }
                />
                <Text
                  style={[
                    styles.verifyButtonText,
                    data.verification.status === 'rejected' &&
                      styles.verifyButtonTextRejected,
                  ]}
                >
                  {data.verification.status === 'rejected'
                    ? 'Re-submit for Verification'
                    : 'Submit for Verification'}
                </Text>
              </TouchableOpacity>
            )}

          {/* Rejection reason box — only shown when status is 'rejected'
              and a reason was provided by the reviewer. */}
          {data.verification.status === 'rejected' &&
            data.verification.reason && (
              <RejectionBox reason={data.verification.reason} />
            )}
        </View>

        {/* ── Profile info sections ──
            Each section is a ProfileSection wrapper (card with a title).
            ChipList renders each string array as a row of coloured pill chips.
            DayChips renders the 7-day availability grid. */}
        <ProfileSection title="Subjects">
          <ChipList
            items={data.subjects}
            color={Colors.primary}
            bg={Colors.primarySurface}
          />
        </ProfileSection>

        <ProfileSection title="Class Levels">
          <ChipList
            items={data.classLevels}
            color={Colors.textSecondary}
            bg={Colors.divider}
          />
        </ProfileSection>

        <ProfileSection title="Preferred Areas">
          <ChipList
            items={data.areas}
            color={Colors.textSecondary}
            bg={Colors.divider}
          />
        </ProfileSection>

        <ProfileSection title="Expected Salary">
          <Text style={styles.infoValue}>{formatSalary(data.expectedSalary)}</Text>
        </ProfileSection>

        <ProfileSection title="Availability">
          <DayChips days={data.availability} />
        </ProfileSection>

        {/* Experience and Bio are optional — only render if the tutor has set them */}
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

        {/* Bottom spacer so the last section isn't cut off by the tab bar */}
        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
// These are defined here because they are only used on this screen.
// If they are needed on other screens, move them to components/tutor/.

// ── RejectionBox ──
// Shows the rejection reason from the reviewer in a red-tinted box.
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

// ── ProfileSection ──
// A titled card wrapper for each info section. Accepts any children.
// This is the same "section card" pattern used throughout the app.
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

// ── ChipList ──
// Renders a string array as a horizontal flex-wrap row of coloured pill chips.
// This is a read-only display — tapping does nothing.
// Compare with ChipSelect in the edit screen, which is interactive.
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
    // flexDirection: 'row' + flexWrap: 'wrap' — the same tag/badge layout
    // pattern taught in Week 1's skills section.
    <View style={chipListStyles.row}>
      {items.map((item) => (
        <View key={item} style={[chipListStyles.chip, { backgroundColor: bg }]}>
          <Text style={[chipListStyles.label, { color }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

// ── DayChips ──
// Shows all 7 days of the week as circular chips.
// Active days (in the tutor's availability array) are filled; inactive are outlined.
// This is a read-only display — compare with the interactive day toggles on the
// edit screen.
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
  // Warning banner shown when the profile is incomplete
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
  // Hero card: white card at the top containing avatar, name, buttons
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
  // flexDirection: 'row' + flexWrap: 'wrap' — standard tag/badge layout (Week 1)
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
