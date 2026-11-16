// app/(tutor)/board/[id].tsx
// Screen 2 — Tuition Post Detail & Apply
//
// This is a DYNAMIC ROUTE. The filename [id].tsx means Expo Router will match
// any URL like /(tutor)/board/1, /(tutor)/board/abc, etc. and make the segment
// available via useLocalSearchParams() — same pattern as ArticleDetail in Week 3.
//
// What this screen does:
//   1. Reads the `id` param from the URL
//   2. Fetches the matching tuition post
//   3. Checks if the tutor has already applied to this post
//   4. Shows post details (class level, area, salary, days/week, description)
//   5. Shows one of three bottom sections depending on state:
//        a) Post is closed → "not accepting applications" notice
//        b) Already applied → shows applied date + status badge
//        c) Open & not applied → apply form with a message TextInput
//
// Key patterns used (from lab manuals):
//   - useLocalSearchParams() to read the dynamic :id segment (Week 3)
//   - useState for the controlled message input (Week 1 / Week 4)
//   - useEffect with cleanup to run an async side-effect (Week 4)
//   - Conditional rendering based on state (Week 1)
//   - router.push() for navigation (Week 3)

import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Custom hooks — each hook encapsulates one responsibility
import { findExistingApplication, useApply } from '../../../hooks/useApply';
import { useTuitionPost } from '../../../hooks/useTuitionPost';

// Shared UI components
import { ErrorState } from '../../../components/tutor/ErrorState';
import { LoadingState } from '../../../components/tutor/LoadingState';
import { StatusBadge } from '../../../components/tutor/StatusBadge';

// Utility functions for display formatting
import { formatDate, formatSalary } from '../../../utils/format';
import { validateApplyMessage } from '../../../utils/validation';

import {
    Colors,
    Radius,
    Shadow,
    Spacing,
    TouchTarget,
    Typography,
} from '../../../constants/theme';

// ---------------------------------------------------------------------------
// Main screen component
// ---------------------------------------------------------------------------

export default function TuitionDetailScreen() {
  // ---------------------------------------------------------------------------
  // Route param
  // ---------------------------------------------------------------------------
  // useLocalSearchParams() reads the URL segment named in the filename.
  // For /(tutor)/board/42, this gives { id: '42' }.
  // This is the same hook used in Week 3's ArticleDetail screen.
  const { id } = useLocalSearchParams<{ id: string }>();

  // ---------------------------------------------------------------------------
  // Data hooks
  // ---------------------------------------------------------------------------
  // useTuitionPost fetches the single post matching `id`
  const { data: post, loading, error, refetch } = useTuitionPost(id);

  // useApply manages the apply action and stores the existing application
  const {
    existingApplication,  // the tutor's prior application, or null if none
    applying,             // true while the apply API call is in progress
    applyError,           // error message if the apply call failed
    apply,                // async function: apply(postId, message)
    setExistingApplication, // setter so the useEffect below can populate it
  } = useApply();

  // ---------------------------------------------------------------------------
  // Local state for the apply form
  // ---------------------------------------------------------------------------
  // The message TextInput is a controlled component — its value is stored in
  // state, just like the form fields in Week 4's AddStudentForm.
  const [message, setMessage] = React.useState('');

  // Inline validation error shown below the TextInput
  const [messageError, setMessageError] = React.useState<string | null>(null);

  // Guard state: true while we're checking for an existing application.
  // We don't want to show the "Apply" form before we know whether the tutor
  // has already applied, so we block rendering until this check is done.
  const [checkingExisting, setCheckingExisting] = React.useState(true);

  // ---------------------------------------------------------------------------
  // Side effect: check for existing application when the post loads
  // ---------------------------------------------------------------------------
  // This useEffect runs every time `post` changes (i.e., once it loads from
  // the API). It calls findExistingApplication and stores the result.
  //
  // The cleanup function sets `cancelled = true` so that if the component
  // unmounts before the async call finishes, we don't call setState on an
  // unmounted component. This is the same cleanup pattern taught in Week 4
  // (the fake-submit useEffect with clearTimeout).
  useEffect(() => {
    if (!post) return; // nothing to check until the post has loaded

    let cancelled = false;
    setCheckingExisting(true);

    findExistingApplication(post.id)
      .then((found) => {
        // Only update state if the component is still mounted
        if (!cancelled) {
          setExistingApplication(found);
          setCheckingExisting(false);
        }
      })
      .catch(() => {
        if (!cancelled) setCheckingExisting(false);
      });

    // Cleanup: if the component unmounts before the Promise resolves, cancel
    return () => {
      cancelled = true;
    };
  }, [post, setExistingApplication]);

  // ---------------------------------------------------------------------------
  // Apply handler
  // ---------------------------------------------------------------------------
  // useCallback memoises this function so it doesn't change on every render.
  // We validate the message first, then call the apply() function from the hook.
  const handleApply = useCallback(async () => {
    const err = validateApplyMessage(message);
    if (err) {
      // Show inline error below the TextInput without submitting
      setMessageError(err);
      return;
    }
    setMessageError(null);
    await apply(post!.id, message);
  }, [message, apply, post]);

  // ---------------------------------------------------------------------------
  // Loading state — show spinner while the post or existing-application check
  // is in progress. We wait for BOTH to complete before rendering the content.
  // ---------------------------------------------------------------------------
  if (loading || (post && checkingExisting)) {
    return <LoadingState message="Loading tuition post…" />;
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ErrorState message={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // 404 state — post was not found in the data store
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

  // Derived values — computed fresh on every render (not state)
  const isClosed = post.status === 'closed';
  const alreadyApplied = existingApplication !== null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Hero card ──
            Shows the subject badge, open/closed status, title, guardian name,
            and posted date. This is the "above the fold" summary. */}
        <View style={styles.heroCard}>
          <View style={styles.heroTopRow}>
            {/* Subject pill — same badge pattern as ArticleCard category badges (Week 3) */}
            <View style={styles.subjectPill}>
              <Text style={styles.subjectPillText}>{post.subject}</Text>
            </View>
            {/* Only show the "Closed" badge when the post is closed —
                conditional rendering with a ternary (Week 1) */}
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

        {/* ── Details grid ──
            Four rows showing class level, area, salary, and days/week.
            Each row is a DetailRow sub-component (defined below). */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Details</Text>
          <View style={styles.detailsGrid}>
            <DetailRow icon="school-outline"   label="Class Level" value={post.classLevel} />
            <DetailRow icon="location-outline" label="Area"        value={post.area} />
            <DetailRow icon="cash-outline"     label="Salary"      value={formatSalary(post.salary)} />
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

        {/* ── Apply / status section ──
            This is conditional rendering with three branches (Week 1):
              1. isClosed        → show "not accepting" notice
              2. alreadyApplied  → show applied-status summary
              3. otherwise       → show the apply form */}
        <View style={styles.section}>
          {isClosed ? (
            // Branch 1: Post is closed
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
            // Branch 2: Tutor has already applied
            <AlreadyAppliedSection
              status={existingApplication!.status}
              appliedAt={existingApplication!.appliedAt}
            />
          ) : (
            // Branch 3: Post is open and tutor has not applied yet — show form
            <ApplyForm
              message={message}
              messageError={messageError ?? applyError}
              applying={applying}
              onChange={(text) => {
                setMessage(text);
                // Clear the validation error as soon as the user starts fixing it
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
// Sub-components
// ---------------------------------------------------------------------------
// These components are defined in this file because they are screen-specific —
// they won't be reused anywhere else. If a component is needed in multiple
// screens it should be moved to components/tutor/.

// ── DetailRow ──
// A single labelled row in the details grid. Uses flexDirection: 'row' to put
// the icon, label, and value side by side — the same Flexbox row layout taught
// in Week 2's StudentItem.
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

// ── ApplyForm ──
// The application form shown when the post is open and not yet applied to.
// The message TextInput is a CONTROLLED input — its value comes from props
// (ultimately from useState in the parent). Same pattern as FormField (Week 4).
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
  const MAX = 300; // maximum allowed characters

  return (
    <View style={applyStyles.wrapper}>
      <Text style={applyStyles.title}>Apply for this Tuition</Text>
      <Text style={applyStyles.subtitle}>
        Write a short message to introduce yourself to the guardian.
      </Text>

      {/* Controlled multiline TextInput for the application message.
          value and onChangeText make it controlled (Week 4 pattern). */}
      <View style={applyStyles.inputWrapper}>
        <TextInput
          style={[applyStyles.input, messageError ? applyStyles.inputError : null]}
          value={message}
          onChangeText={onChange}
          placeholder="Tell the guardian about your experience and why you're a good fit… (min 20 chars)"
          placeholderTextColor={Colors.textTertiary}
          multiline
          maxLength={MAX + 50}   // let them type past MAX — validation will catch it
          editable={!applying}
          selectionColor={Colors.primary}
          textAlignVertical="top"
          accessibilityLabel="Application message"
          accessibilityHint="Minimum 20, maximum 300 characters"
        />
        {/* Character counter — same concept as the charCount prop on FormField (Week 4) */}
        <Text
          style={[
            applyStyles.charCount,
            charCount > MAX && applyStyles.charCountOver,
          ]}
        >
          {charCount}/{MAX}
        </Text>
      </View>

      {/* Inline validation error — only shown when messageError is not null */}
      {messageError ? (
        <Text style={applyStyles.errorText} accessibilityRole="alert">
          {messageError}
        </Text>
      ) : null}

      {/* Submit button — disabled and shows a spinner while applying.
          The style array [base, disabled] merges styles when applying is true —
          the same conditional style array taught in Week 1's Follow button. */}
      <TouchableOpacity
        style={[applyStyles.submitButton, applying && applyStyles.submitDisabled]}
        onPress={onSubmit}
        disabled={applying}
        activeOpacity={0.85}
        accessibilityLabel="Apply to this tuition"
        accessibilityRole="button"
      >
        {applying ? (
          // Show ActivityIndicator while the API call is in progress (Week 4)
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

// ── AlreadyAppliedSection ──
// Shown when the tutor has previously applied. Displays the applied date,
// a StatusBadge, and a link to the Applications tab.
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
        {/* StatusBadge shows the current status (pending / accepted / rejected / withdrawn) */}
        <StatusBadge status={status} />
      </View>

      {/* Navigate to the Applications tab — router.push() same as Week 3 */}
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

// Styles for the DetailRow sub-component
const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',   // icon + text side by side (Week 2 Flexbox row pattern)
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
    flex: 1,   // takes remaining horizontal space (Week 2 — flex: 1 on info View)
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

// Styles for the ApplyForm sub-component
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

// Styles for the AlreadyAppliedSection sub-component
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
