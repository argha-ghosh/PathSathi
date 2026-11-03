// app/(tutor)/board/[id].tsx
// Screen 2 – Tuition Detail + Apply

import React, { useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useTuitionPost } from '../../../hooks/useTuitionPost';
import { useApply, findExistingApplication } from '../../../hooks/useApply';
import { LoadingState } from '../../../components/tutor/LoadingState';
import { ErrorState } from '../../../components/tutor/ErrorState';
import { StatusBadge } from '../../../components/tutor/StatusBadge';
import { formatSalary, formatDate } from '../../../utils/format';
import { validateApplyMessage } from '../../../utils/validation';
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadow,
  TouchTarget,
} from '../../../constants/theme';

export default function TuitionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: post, loading, error, refetch } = useTuitionPost(id);

  const {
    existingApplication,
    applying,
    applyError,
    apply,
    setExistingApplication,
  } = useApply();

  const [message, setMessage] = React.useState('');
  const [messageError, setMessageError] = React.useState<string | null>(null);
  const [checkingExisting, setCheckingExisting] = React.useState(true);

  // Once the post loads, check for an existing application
  useEffect(() => {
    if (!post) return;

    let cancelled = false;
    setCheckingExisting(true);

    findExistingApplication(post.id)
      .then((found) => {
        if (!cancelled) {
          setExistingApplication(found);
          setCheckingExisting(false);
        }
      })
      .catch(() => {
        if (!cancelled) setCheckingExisting(false);
      });

    return () => {
      cancelled = true;
    };
  }, [post, setExistingApplication]);

  const handleApply = useCallback(async () => {
    const err = validateApplyMessage(message);
    if (err) {
      setMessageError(err);
      return;
    }
    setMessageError(null);
    await apply(post!.id, message);
  }, [message, apply, post]);

  // ── Loading ──
  if (loading || (post && checkingExisting)) {
    return <LoadingState message="Loading tuition post…" />;
  }

  // ── Error ──
  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ErrorState message={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // ── Not found ──
  if (!post) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <View style={styles.notFound}>
          <Ionicons name="document-outline" size={48} color={Colors.textTertiary} />
          <Text style={styles.notFoundTitle}>Post Not Found</Text>
          <Text style={styles.notFoundSub}>
            This tuition post may have been removed.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isClosed = post.status === 'closed';
  const alreadyApplied = existingApplication !== null;

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Post header card ── */}
        <View style={styles.heroCard}>
          {/* Subject pill + status */}
          <View style={styles.heroTopRow}>
            <View style={styles.subjectPill}>
              <Text style={styles.subjectPillText}>{post.subject}</Text>
            </View>
            {isClosed ? (
              <View style={styles.closedBadge}>
                <Text style={styles.closedBadgeText}>Closed</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.heroTitle}>{post.title}</Text>
          <Text style={styles.heroGuardian}>Posted by {post.guardianName}</Text>
          <Text style={styles.heroDate}>{formatDate(post.createdAt)}</Text>
        </View>

        {/* ── Details grid ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            <DetailRow icon="school-outline" label="Class Level" value={post.classLevel} />
            <DetailRow icon="location-outline" label="Area" value={post.area} />
            <DetailRow icon="cash-outline" label="Salary" value={formatSalary(post.salary)} />
            <DetailRow
              icon="calendar-outline"
              label="Days / Week"
              value={`${post.daysPerWeek} days`}
            />
          </View>
        </View>

        {/* ── Description ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{post.description}</Text>
        </View>

        {/* ── Apply / status section ── */}
        <View style={styles.section}>
          {isClosed ? (
            /* Post is closed */
            <View style={styles.closedNotice}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Colors.textSecondary}
              />
              <Text style={styles.closedNoticeText}>
                This tuition is no longer accepting applications.
              </Text>
            </View>
          ) : alreadyApplied ? (
            /* Already applied */
            <AlreadyAppliedSection
              status={existingApplication!.status}
              appliedAt={existingApplication!.appliedAt}
            />
          ) : (
            /* Apply form */
            <ApplyForm
              message={message}
              messageError={messageError ?? applyError}
              applying={applying}
              onChange={(text) => {
                setMessage(text);
                if (messageError) setMessageError(null);
              }}
              onSubmit={handleApply}
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Sub-components (kept in this file – they are screen-specific)
// ---------------------------------------------------------------------------

interface DetailRowProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}

function DetailRow({ icon, label, value }: DetailRowProps) {
  return (
    <View style={detailStyles.row}>
      <View style={detailStyles.iconWrap}>
        <Ionicons name={icon} size={16} color={Colors.primary} />
      </View>
      <View style={detailStyles.labelWrap}>
        <Text style={detailStyles.label}>{label}</Text>
        <Text style={detailStyles.value}>{value}</Text>
      </View>
    </View>
  );
}

interface ApplyFormProps {
  message: string;
  messageError: string | null;
  applying: boolean;
  onChange: (text: string) => void;
  onSubmit: () => void;
}

function ApplyForm({
  message,
  messageError,
  applying,
  onChange,
  onSubmit,
}: ApplyFormProps) {
  const charCount = message.length;
  const MAX = 300;

  return (
    <View style={applyStyles.wrapper}>
      <Text style={applyStyles.title}>Apply for this Tuition</Text>
      <Text style={applyStyles.subtitle}>
        Write a short message to introduce yourself to the guardian.
      </Text>

      {/* Message input */}
      <View style={applyStyles.inputWrapper}>
        <TextInput
          style={[applyStyles.input, messageError ? applyStyles.inputError : null]}
          value={message}
          onChangeText={onChange}
          placeholder="Tell the guardian about your experience and why you're a good fit… (min 20 chars)"
          placeholderTextColor={Colors.textTertiary}
          multiline
          maxLength={MAX + 50} // let them type but validate
          editable={!applying}
          selectionColor={Colors.primary}
          textAlignVertical="top"
          accessibilityLabel="Application message"
          accessibilityHint="Minimum 20, maximum 300 characters"
        />
        {/* Char counter */}
        <Text
          style={[
            applyStyles.charCount,
            charCount > MAX && applyStyles.charCountOver,
          ]}
        >
          {charCount}/{MAX}
        </Text>
      </View>

      {/* Inline error */}
      {messageError ? (
        <Text style={applyStyles.errorText} accessibilityRole="alert">
          {messageError}
        </Text>
      ) : null}

      {/* Submit button */}
      <TouchableOpacity
        style={[applyStyles.submitButton, applying && applyStyles.submitDisabled]}
        onPress={onSubmit}
        disabled={applying}
        activeOpacity={0.85}
        accessibilityLabel="Apply to this tuition"
        accessibilityRole="button"
      >
        {applying ? (
          <ActivityIndicator size="small" color={Colors.textInverse} />
        ) : (
          <>
            <Ionicons name="send-outline" size={16} color={Colors.textInverse} />
            <Text style={applyStyles.submitText}>Submit Application</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

interface AlreadyAppliedSectionProps {
  status: import('../../../types/tutor').ApplicationStatus;
  appliedAt: string;
}

function AlreadyAppliedSection({
  status,
  appliedAt,
}: AlreadyAppliedSectionProps) {
  return (
    <View style={appliedStyles.wrapper}>
      <View style={appliedStyles.row}>
        <View style={appliedStyles.iconWrap}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.accepted} />
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={appliedStyles.title}>Application Submitted</Text>
          <Text style={appliedStyles.sub}>
            Applied on {formatDate(appliedAt)}
          </Text>
        </View>
        <StatusBadge status={status} />
      </View>

      <TouchableOpacity
        style={appliedStyles.viewButton}
        onPress={() => router.push('/(tutor)/applications')}
        activeOpacity={0.85}
        accessibilityLabel="View my applications"
        accessibilityRole="button"
      >
        <Ionicons
          name="document-text-outline"
          size={16}
          color={Colors.primary}
        />
        <Text style={appliedStyles.viewButtonText}>View My Applications</Text>
      </TouchableOpacity>
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
    paddingBottom: Spacing['4xl'],
  },
  heroCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.base,
    gap: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flexWrap: 'wrap',
  },
  subjectPill: {
    backgroundColor: Colors.primarySurface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  subjectPillText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.primary,
  },
  closedBadge: {
    backgroundColor: Colors.withdrawnSurface,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.withdrawnBorder,
  },
  closedBadgeText: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.withdrawn,
  },
  heroTitle: {
    fontSize: Typography['2xl'],
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    lineHeight: Typography['2xl'] * Typography.lineHeightNormal,
    marginTop: Spacing.xs,
  },
  heroGuardian: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  heroDate: {
    fontSize: Typography.sm,
    color: Colors.textTertiary,
  },
  section: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  detailsGrid: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  descriptionText: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    lineHeight: Typography.base * Typography.lineHeightRelaxed,
  },
  closedNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.withdrawnSurface,
    borderRadius: Radius.lg,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.withdrawnBorder,
  },
  closedNoticeText: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textSecondary,
  },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing['2xl'],
  },
  notFoundTitle: {
    fontSize: Typography.xl,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  notFoundSub: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labelWrap: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  value: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
    textAlign: 'right',
    flex: 1,
    marginLeft: Spacing.sm,
  },
});

const applyStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.sm * Typography.lineHeightNormal,
    marginTop: -Spacing.xs,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    minHeight: 120,
    backgroundColor: Colors.background,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorSurface,
  },
  charCount: {
    position: 'absolute',
    bottom: Spacing.xs,
    right: Spacing.sm,
    fontSize: Typography.xs,
    color: Colors.textTertiary,
  },
  charCountOver: {
    color: Colors.error,
  },
  errorText: {
    fontSize: Typography.xs,
    color: Colors.error,
    marginTop: -Spacing.xs,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    height: TouchTarget,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textInverse,
  },
});

const appliedStyles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.acceptedSurface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    gap: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.acceptedBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.successSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.acceptedBorder,
  },
  title: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  sub: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    height: TouchTarget,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    backgroundColor: Colors.surface,
  },
  viewButtonText: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.primary,
  },
});
