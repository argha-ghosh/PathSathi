// app/(student)/tutor/[id].tsx
// Tutor detail screen – shows full profile, reviews, and review submission.

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../../context/AuthContext';
import { useBookmarks } from '../../../hooks/useBookmarks';
import { getTutorById, getTutorReviews, submitReview, sendBookingRequest } from '../../../services/studentApi';
import type { TutorProfilePublic, Review } from '../../../types/student';
import {
  Colors, Radius, Shadow, Spacing, TouchTarget, Typography,
} from '../../../constants/theme';
import { formatSalary, getInitials, timeAgo } from '../../../utils/format';

export default function TutorDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();

  const [tutor, setTutor] = useState<TutorProfilePublic | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);

  // Review form
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [t, r] = await Promise.all([getTutorById(id), getTutorReviews(id)]);
      setTutor(t);
      setReviews(r);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tutor.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { void load(); }, [load]);

  async function handleSubmitReview() {
    if (!user || !tutor) return;
    if (rating === 0) { setReviewError('Please select a rating.'); return; }
    if (comment.trim().length < 10) { setReviewError('Comment must be at least 10 characters.'); return; }

    setSubmitting(true);
    setReviewError(null);
    try {
      const newReview = await submitReview(tutor.id, user.id, user.name, rating, comment.trim());
      setReviews((prev) => [newReview, ...prev]);
      setReviewSuccess(true);
      setRating(0);
      setComment('');
      // Update local tutor rating
      const allRatings = [...reviews, newReview].map((r) => r.rating);
      const avg = allRatings.reduce((a, b) => a + b, 0) / allRatings.length;
      setTutor((prev) => prev ? {
        ...prev,
        rating: Math.round(avg * 10) / 10,
        reviewCount: allRatings.length,
      } : prev);
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error || !tutor) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle-outline" size={40} color={Colors.error} />
        <Text style={styles.errorText}>{error ?? 'Tutor not found.'}</Text>
        <Pressable style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryText}>Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Sticky top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={22} color={Colors.textPrimary} />
        </Pressable>
        <Text style={styles.topBarTitle} numberOfLines={1}>Tutor Profile</Text>
        <Pressable
          style={styles.bookmarkBtn}
          onPress={() => toggleBookmark(tutor.id)}
          accessibilityLabel={isBookmarked(tutor.id) ? 'Remove bookmark' : 'Bookmark tutor'}
        >
          <Ionicons
            name={isBookmarked(tutor.id) ? 'bookmark' : 'bookmark-outline'}
            size={22}
            color={isBookmarked(tutor.id) ? Colors.primary : Colors.textSecondary}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarLg}>
            <Text style={styles.avatarText}>{getInitials(tutor.name)}</Text>
          </View>
          <Text style={styles.name}>{tutor.name}</Text>
          <Text style={styles.uni}>{tutor.university}</Text>
          <Text style={styles.dept}>{tutor.department} · {tutor.year}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Ionicons name="star" size={16} color="#F59E0B" />
              <Text style={styles.statValue}>
                {tutor.reviewCount > 0 ? tutor.rating.toFixed(1) : 'New'}
              </Text>
              <Text style={styles.statLabel}>{tutor.reviewCount} reviews</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Ionicons name="cash-outline" size={16} color={Colors.primary} />
              <Text style={styles.statValue}>{formatSalary(tutor.expectedSalary)}</Text>
              <Text style={styles.statLabel}>per month</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Ionicons name="laptop-outline" size={16} color={Colors.primary} />
              <Text style={styles.statValue}>{tutor.teachingMethod}</Text>
              <Text style={styles.statLabel}>method</Text>
            </View>
          </View>

          {/* Book a Tutor button */}
          <Pressable
            style={styles.bookBtn}
            onPress={() => setBookingModalVisible(true)}
            accessibilityRole="button"
            accessibilityLabel="Book this tutor"
          >
            <Ionicons name="calendar-outline" size={18} color={Colors.textInverse} />
            <Text style={styles.bookBtnText}>Book a Tutor</Text>
          </Pressable>
        </View>

        {/* Bio */}
        {tutor.bio ? (
          <Section title="About">
            <Text style={styles.bioText}>{tutor.bio}</Text>
          </Section>
        ) : null}

        {/* Experience */}
        {tutor.experience ? (
          <Section title="Experience">
            <Text style={styles.bioText}>{tutor.experience}</Text>
          </Section>
        ) : null}

        {/* Teaching details */}
        <Section title="Teaching Details">
          <InfoRow icon="book-outline" label="Subjects" value={tutor.subjects.join(', ')} />
          <InfoRow icon="school-outline" label="Class Levels" value={tutor.classLevels.join(', ')} />
          <InfoRow icon="location-outline" label="Areas" value={tutor.areas.join(', ')} />
          <InfoRow icon="time-outline" label="Availability" value={tutor.availability.join(', ')} />
        </Section>

        {/* Reviews */}
        <Section title={`Reviews (${reviews.length})`}>
          {reviews.length === 0 ? (
            <Text style={styles.noReviews}>No reviews yet. Be the first!</Text>
          ) : (
            reviews.map((rev) => (
              <View key={rev.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Text style={styles.reviewerName}>{rev.studentName}</Text>
                  <View style={styles.starRow}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Ionicons
                        key={s}
                        name="star"
                        size={12}
                        color={s <= rev.rating ? '#F59E0B' : Colors.border}
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewDate}>{timeAgo(rev.createdAt)}</Text>
                </View>
                <Text style={styles.reviewComment}>{rev.comment}</Text>
              </View>
            ))
          )}
        </Section>

        {/* Submit review */}
        {!reviewSuccess ? (
          <Section title="Write a Review">
            <View style={styles.starSelector}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Pressable key={s} onPress={() => { setRating(s); setReviewError(null); }}>
                  <Ionicons
                    name={s <= rating ? 'star' : 'star-outline'}
                    size={32}
                    color={s <= rating ? '#F59E0B' : Colors.border}
                  />
                </Pressable>
              ))}
            </View>
            <TextInput
              style={styles.reviewInput}
              value={comment}
              onChangeText={(t) => { setComment(t); setReviewError(null); }}
              placeholder="Share your experience with this tutor..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            {reviewError ? <Text style={styles.reviewErrorText}>{reviewError}</Text> : null}
            <Pressable style={styles.submitBtn} onPress={handleSubmitReview} disabled={submitting}>
              {submitting
                ? <ActivityIndicator size="small" color={Colors.textInverse} />
                : <Text style={styles.submitBtnText}>Submit Review</Text>}
            </Pressable>
          </Section>
        ) : (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={20} color={Colors.accepted} />
            <Text style={styles.successText}>Review submitted successfully!</Text>
          </View>
        )}
      </ScrollView>

      {/* ── Booking Modal ── */}
      <BookingModal
        visible={bookingModalVisible}
        tutor={tutor}
        studentId={user?.id ?? ''}
        onClose={() => setBookingModalVisible(false)}
      />
    </SafeAreaView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sectionStyles.wrapper}>
      <Text style={sectionStyles.title}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({
  icon, label, value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={infoStyles.row}>
      <Ionicons name={icon} size={16} color={Colors.primary} style={infoStyles.icon} />
      <Text style={infoStyles.label}>{label}:</Text>
      <Text style={infoStyles.value} numberOfLines={2}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorText: { fontSize: Typography.base, color: Colors.error },
  retryBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.lg },
  retryText: { fontSize: Typography.base, color: Colors.textInverse, fontWeight: Typography.semiBold },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backBtn: { width: TouchTarget, height: TouchTarget, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { flex: 1, textAlign: 'center', fontSize: Typography.lg, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  bookmarkBtn: { width: TouchTarget, height: TouchTarget, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingBottom: Spacing['4xl'] },
  profileCard: {
    backgroundColor: Colors.surface,
    alignItems: 'center',
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.xs,
  },
  avatarLg: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarText: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.primary },
  name: { fontSize: Typography.xl, fontWeight: Typography.bold, color: Colors.textPrimary },
  uni: { fontSize: Typography.sm, color: Colors.textSecondary, textAlign: 'center' },
  dept: { fontSize: Typography.sm, color: Colors.textTertiary },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.md,
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    width: '100%',
  },
  statBox: { flex: 1, alignItems: 'center', gap: 2 },
  statDivider: { width: 1, height: 36, backgroundColor: Colors.border },
  statValue: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.textPrimary },
  statLabel: { fontSize: Typography.xs, color: Colors.textTertiary },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    height: TouchTarget,
    width: '100%',
    marginTop: Spacing.md,
  },
  bookBtnText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textInverse },
  bioText: { fontSize: Typography.base, color: Colors.textSecondary, lineHeight: Typography.base * 1.6 },
  noReviews: { fontSize: Typography.base, color: Colors.textTertiary, textAlign: 'center', paddingVertical: Spacing.base },
  reviewCard: {
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  reviewerName: { fontWeight: Typography.semiBold, fontSize: Typography.sm, color: Colors.textPrimary, flex: 1 },
  starRow: { flexDirection: 'row', gap: 2 },
  reviewDate: { fontSize: Typography.xs, color: Colors.textTertiary },
  reviewComment: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: Typography.sm * 1.5 },
  starSelector: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  reviewInput: {
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    minHeight: 100,
    marginBottom: Spacing.sm,
  },
  reviewErrorText: { fontSize: Typography.xs, color: Colors.error, marginBottom: Spacing.sm },
  submitBtn: {
    height: TouchTarget,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnText: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textInverse },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.acceptedSurface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginHorizontal: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.acceptedBorder,
    marginBottom: Spacing.base,
  },
  successText: { fontSize: Typography.base, color: Colors.accepted, fontWeight: Typography.semiBold },
});

const sectionStyles = StyleSheet.create({
  wrapper: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: Typography.bold,
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
});

const infoStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, paddingVertical: 4 },
  icon: { marginTop: 2 },
  label: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textPrimary, width: 90 },
  value: { flex: 1, fontSize: Typography.sm, color: Colors.textSecondary },
});

// ---------------------------------------------------------------------------
// Booking Modal
// ---------------------------------------------------------------------------

const TEACHING_METHODS = ['Home Tuition', 'Online', 'Both'] as const;
const DAYS_PER_WEEK = ['1', '2', '3', '4', '5', '6', '7'] as const;
const PREFERRED_TIMES = ['Morning (6am–12pm)', 'Afternoon (12pm–5pm)', 'Evening (5pm–9pm)', 'Flexible'] as const;

function BookingModal({
  visible, tutor, studentId, onClose,
}: {
  visible: boolean;
  tutor: TutorProfilePublic;
  studentId: string;
  onClose: () => void;
}) {
  const [method, setMethod] = useState<string>(
    tutor.teachingMethod === 'Home' ? 'Home Tuition'
    : tutor.teachingMethod === 'Online' ? 'Online'
    : 'Home Tuition',
  );
  const [days, setDays] = useState('3');
  const [time, setTime] = useState(PREFERRED_TIMES[2]);
  const [message, setMessage] = useState('');
  const [booked, setBooked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleBook() {
    if (!message.trim()) {
      Alert.alert('Message Required', 'Please write a short message for the tutor.');
      return;
    }
    setSubmitting(true);
    try {
      await sendBookingRequest(
        studentId,
        tutor.id,
        method,
        parseInt(days),
        time,
        message.trim(),
      );
      setBooked(true);
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to send request.');
    } finally {
      setSubmitting(false);
    }
  }

  function handleClose() {
    setBooked(false);
    setMessage('');
    onClose();
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={bookingStyles.safe} edges={['top', 'bottom']}>
        {/* Header */}
        <View style={bookingStyles.header}>
          <Pressable onPress={handleClose} style={bookingStyles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </Pressable>
          <Text style={bookingStyles.title}>Book a Tutor</Text>
          <View style={{ width: TouchTarget }} />
        </View>

        {booked ? (
          /* Success state */
          <View style={bookingStyles.successState}>
            <View style={bookingStyles.successIcon}>
              <Ionicons name="checkmark-circle" size={64} color={Colors.accepted} />
            </View>
            <Text style={bookingStyles.successTitle}>Booking Request Sent!</Text>
            <Text style={bookingStyles.successSub}>
              Your booking request has been sent to {tutor.name}. They will contact you shortly.
            </Text>
            <Pressable style={bookingStyles.doneBtn} onPress={handleClose}>
              <Text style={bookingStyles.doneBtnText}>Done</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView contentContainerStyle={bookingStyles.scroll} keyboardShouldPersistTaps="handled">
            {/* Tutor summary */}
            <View style={bookingStyles.tutorSummary}>
              <View style={bookingStyles.summaryAvatar}>
                <Text style={bookingStyles.summaryAvatarText}>{getInitials(tutor.name)}</Text>
              </View>
              <View>
                <Text style={bookingStyles.summaryName}>{tutor.name}</Text>
                <Text style={bookingStyles.summaryUni}>{tutor.university}</Text>
                <Text style={bookingStyles.summaryPrice}>{formatSalary(tutor.expectedSalary)}</Text>
              </View>
            </View>

            {/* Teaching method */}
            <Text style={bookingStyles.fieldLabel}>Teaching Method</Text>
            <View style={bookingStyles.optRow}>
              {TEACHING_METHODS.map((m) => (
                <Pressable
                  key={m}
                  style={[bookingStyles.optChip, method === m && bookingStyles.optChipActive]}
                  onPress={() => setMethod(m)}
                >
                  <Text style={[bookingStyles.optChipText, method === m && bookingStyles.optChipTextActive]}>{m}</Text>
                </Pressable>
              ))}
            </View>

            {/* Days per week */}
            <Text style={bookingStyles.fieldLabel}>Days per Week</Text>
            <View style={bookingStyles.optRow}>
              {DAYS_PER_WEEK.map((d) => (
                <Pressable
                  key={d}
                  style={[bookingStyles.dayChip, days === d && bookingStyles.optChipActive]}
                  onPress={() => setDays(d)}
                >
                  <Text style={[bookingStyles.optChipText, days === d && bookingStyles.optChipTextActive]}>{d}</Text>
                </Pressable>
              ))}
            </View>

            {/* Preferred time */}
            <Text style={bookingStyles.fieldLabel}>Preferred Time</Text>
            <View style={bookingStyles.optCol}>
              {PREFERRED_TIMES.map((t) => (
                <Pressable
                  key={t}
                  style={[bookingStyles.optChip, time === t && bookingStyles.optChipActive]}
                  onPress={() => setTime(t)}
                >
                  <Text style={[bookingStyles.optChipText, time === t && bookingStyles.optChipTextActive]}>{t}</Text>
                </Pressable>
              ))}
            </View>

            {/* Message */}
            <Text style={bookingStyles.fieldLabel}>Message to Tutor</Text>
            <TextInput
              style={bookingStyles.messageInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Introduce yourself and describe what you need help with..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            {/* Send request */}
            <Pressable style={[bookingStyles.bookBtn, submitting && { opacity: 0.7 }]} onPress={handleBook} disabled={submitting}>
              {submitting
                ? <ActivityIndicator size="small" color={Colors.textInverse} />
                : <>
                    <Ionicons name="send-outline" size={18} color={Colors.textInverse} />
                    <Text style={bookingStyles.bookBtnText}>Send Booking Request</Text>
                  </>}
            </Pressable>
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const bookingStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeBtn: { width: TouchTarget, height: TouchTarget, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  scroll: { padding: Spacing.base, paddingBottom: Spacing['4xl'], gap: Spacing.xs },
  tutorSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  summaryAvatar: {
    width: 52,
    height: 52,
    borderRadius: Radius.full,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryAvatarText: { fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.primary },
  summaryName: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  summaryUni: { fontSize: Typography.xs, color: Colors.textSecondary },
  summaryPrice: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.primary, marginTop: 2 },
  fieldLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
    marginTop: Spacing.base,
    marginBottom: Spacing.xs,
  },
  optRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  optCol: { flexDirection: 'column', gap: Spacing.xs },
  optChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  dayChip: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optChipActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySurface },
  optChipText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  optChipTextActive: { color: Colors.primary, fontWeight: Typography.semiBold },
  messageInput: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    minHeight: 110,
    marginTop: Spacing.xs,
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    height: TouchTarget,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    marginTop: Spacing.lg,
  },
  bookBtnText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textInverse },
  successState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing['2xl'],
    gap: Spacing.base,
  },
  successIcon: {
    width: 100,
    height: 100,
    borderRadius: Radius.full,
    backgroundColor: Colors.acceptedSurface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  successTitle: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary, textAlign: 'center' },
  successSub: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center', lineHeight: Typography.base * 1.6 },
  doneBtn: {
    marginTop: Spacing.base,
    height: TouchTarget,
    paddingHorizontal: Spacing['2xl'],
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textInverse },
});
