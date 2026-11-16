// app/(student)/posts.tsx
// Student's tuition posts + booking requests — segmented tabs.

import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../../context/AuthContext';
import {
  createTuitionPost,
  getMyPosts,
  getApplicants,
  updateApplicationStatus,
  updatePostStatus,
  getMyBookings,
} from '../../../services/studentApi';
import type {
  StudentTuitionPost,
  StudentApplication,
  BookingRequest,
} from '../../../types/student';
import {
  Colors, Radius, Shadow, Spacing, TouchTarget, Typography,
} from '../../../constants/theme';
import { FormField } from '../../../components/student/FormField';
import { formatSalary, timeAgo, getInitials } from '../../../utils/format';
import { SUBJECTS, CLASS_LEVELS, AREAS } from '../../../mocks/options';

const TEACHING_METHODS = ['Home Tuition', 'Online', 'Both'] as const;
const TUTOR_GENDERS = ['Male', 'Female', 'Any'] as const;
const PREFERRED_TIMES = ['Morning (6am–12pm)', 'Afternoon (12pm–5pm)', 'Evening (5pm–9pm)', 'Flexible'] as const;

type ActiveTab = 'posts' | 'bookings';

export default function MyPostsScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<ActiveTab>('posts');

  // ── Posts state ──
  const [posts, setPosts] = useState<StudentTuitionPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [postsError, setPostsError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<StudentTuitionPost | null>(null);
  const [applicants, setApplicants] = useState<StudentApplication[]>([]);
  const [applicantsLoading, setApplicantsLoading] = useState(false);

  // ── Bookings state ──
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    setPostsLoading(true);
    setPostsError(null);
    try {
      const data = await getMyPosts(user.id);
      setPosts(data);
    } catch (err) {
      setPostsError(err instanceof Error ? err.message : 'Failed to load posts.');
    } finally {
      setPostsLoading(false);
    }
  }, [user]);

  const fetchBookings = useCallback(async () => {
    if (!user) return;
    setBookingsLoading(true);
    try {
      const data = await getMyBookings(user.id);
      setBookings(data);
    } catch {
      setBookings([]);
    } finally {
      setBookingsLoading(false);
    }
  }, [user]);

  // Reload both when screen is focused
  useFocusEffect(
    useCallback(() => {
      void fetchPosts();
      void fetchBookings();
    }, [fetchPosts, fetchBookings]),
  );

  async function handleViewApplicants(post: StudentTuitionPost) {
    setSelectedPost(post);
    setApplicantsLoading(true);
    try {
      const data = await getApplicants(post.id);
      setApplicants(data);
    } catch {
      setApplicants([]);
    } finally {
      setApplicantsLoading(false);
    }
  }

  async function handleUpdateStatus(appId: string, status: 'accepted' | 'rejected') {
    try {
      const updated = await updateApplicationStatus(appId, status);
      setApplicants((prev) => prev.map((a) => (a.id === appId ? updated : a)));
    } catch { /* silently fail */ }
  }

  async function handleClosePost(postId: string) {
    try {
      const updated = await updatePostStatus(postId, 'closed');
      setPosts((prev) => prev.map((p) => (p.id === postId ? updated : p)));
      if (selectedPost?.id === postId) setSelectedPost(updated);
    } catch { /* silently fail */ }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.pageTitle}>My Activity</Text>
        {activeTab === 'posts' && (
          <Pressable style={styles.addBtn} onPress={() => setShowCreateModal(true)}>
            <Ionicons name="add" size={22} color={Colors.textInverse} />
          </Pressable>
        )}
      </View>

      {/* Segmented tabs */}
      <View style={styles.segmentRow}>
        <Pressable
          style={[styles.segBtn, activeTab === 'posts' && styles.segBtnActive]}
          onPress={() => setActiveTab('posts')}
        >
          <Ionicons
            name="document-text-outline"
            size={15}
            color={activeTab === 'posts' ? Colors.textInverse : Colors.textSecondary}
          />
          <Text style={[styles.segBtnText, activeTab === 'posts' && styles.segBtnTextActive]}>
            My Posts
          </Text>
          {posts.length > 0 && (
            <View style={[styles.badge, activeTab === 'posts' && styles.badgeActive]}>
              <Text style={[styles.badgeText, activeTab === 'posts' && styles.badgeTextActive]}>
                {posts.length}
              </Text>
            </View>
          )}
        </Pressable>
        <Pressable
          style={[styles.segBtn, activeTab === 'bookings' && styles.segBtnActive]}
          onPress={() => setActiveTab('bookings')}
        >
          <Ionicons
            name="calendar-outline"
            size={15}
            color={activeTab === 'bookings' ? Colors.textInverse : Colors.textSecondary}
          />
          <Text style={[styles.segBtnText, activeTab === 'bookings' && styles.segBtnTextActive]}>
            Booking Requests
          </Text>
          {bookings.length > 0 && (
            <View style={[styles.badge, activeTab === 'bookings' && styles.badgeActive]}>
              <Text style={[styles.badgeText, activeTab === 'bookings' && styles.badgeTextActive]}>
                {bookings.length}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* ── Posts Tab ── */}
      {activeTab === 'posts' && (
        postsLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : postsError ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{postsError}</Text>
            <Pressable style={styles.retryBtn} onPress={fetchPosts}>
              <Text style={styles.retryText}>Retry</Text>
            </Pressable>
          </View>
        ) : posts.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="document-text-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No posts yet</Text>
            <Text style={styles.emptySubText}>Create a post to find the right tutor</Text>
            <Pressable style={styles.createBtn} onPress={() => setShowCreateModal(true)}>
              <Text style={styles.createBtnText}>Create Post</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PostCard
                post={item}
                onViewApplicants={() => handleViewApplicants(item)}
                onClose={() => handleClosePost(item.id)}
              />
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )
      )}

      {/* ── Bookings Tab ── */}
      {activeTab === 'bookings' && (
        bookingsLoading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : bookings.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="calendar-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No booking requests</Text>
            <Text style={styles.emptySubText}>
              Book a tutor from their profile to see requests here
            </Text>
            <Pressable
              style={styles.createBtn}
              onPress={() => router.push('/(student)/(tabs)/home' as never)}
            >
              <Text style={styles.createBtnText}>Find Tutors</Text>
            </Pressable>
          </View>
        ) : (
          <FlatList
            data={bookings}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <BookingCard booking={item} />}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )
      )}

      {/* Create Post Modal */}
      <CreatePostModal
        visible={showCreateModal}
        studentId={user?.id ?? ''}
        studentName={user?.name ?? ''}
        onClose={() => setShowCreateModal(false)}
        onCreated={(post) => {
          setPosts((prev) => [post, ...prev]);
          setShowCreateModal(false);
        }}
      />

      {/* Applicants Modal */}
      {selectedPost && (
        <ApplicantsModal
          visible
          post={selectedPost}
          applicants={applicants}
          loading={applicantsLoading}
          onClose={() => setSelectedPost(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// PostCard
// ---------------------------------------------------------------------------

function PostCard({
  post,
  onViewApplicants,
  onClose,
}: {
  post: StudentTuitionPost;
  onViewApplicants: () => void;
  onClose: () => void;
}) {
  const statusColor = post.status === 'open'
    ? Colors.accepted
    : post.status === 'filled'
    ? Colors.primary
    : Colors.textTertiary;

  return (
    <View style={cardStyles.card}>
      <View style={cardStyles.topRow}>
        <Text style={cardStyles.title} numberOfLines={2}>{post.title}</Text>
        <View style={[cardStyles.statusBadge, { backgroundColor: statusColor + '1A' }]}>
          <Text style={[cardStyles.statusText, { color: statusColor }]}>
            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={cardStyles.metaRow}>
        <MetaChip icon="book-outline" label={post.subject} />
        <MetaChip icon="school-outline" label={post.classLevel} />
        <MetaChip icon="location-outline" label={post.area} />
      </View>

      <View style={cardStyles.salaryRow}>
        <Ionicons name="cash-outline" size={14} color={Colors.textTertiary} />
        <Text style={cardStyles.salaryText}>
          ৳{post.minSalary.toLocaleString()} – ৳{post.maxSalary.toLocaleString()} / month
        </Text>
      </View>

      <View style={cardStyles.actions}>
        <Pressable style={cardStyles.viewBtn} onPress={onViewApplicants}>
          <Ionicons name="people-outline" size={16} color={Colors.primary} />
          <Text style={cardStyles.viewBtnText}>
            {post.applicantCount} Applicant{post.applicantCount !== 1 ? 's' : ''}
          </Text>
        </Pressable>
        {post.status === 'open' && (
          <Pressable style={cardStyles.closeBtn} onPress={onClose}>
            <Text style={cardStyles.closeBtnText}>Close Post</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function MetaChip({ icon, label }: { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }) {
  return (
    <View style={chipStyles.chip}>
      <Ionicons name={icon} size={12} color={Colors.textTertiary} />
      <Text style={chipStyles.text}>{label}</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// BookingCard
// ---------------------------------------------------------------------------

function BookingCard({ booking }: { booking: BookingRequest }) {
  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    pending:   { bg: Colors.pendingSurface,   text: Colors.pending,   border: Colors.pendingBorder },
    confirmed: { bg: Colors.acceptedSurface,  text: Colors.accepted,  border: Colors.acceptedBorder },
    cancelled: { bg: Colors.rejectedSurface,  text: Colors.rejected,  border: Colors.rejectedBorder },
  };
  const sc = statusColors[booking.status] ?? statusColors.pending;

  return (
    <View style={bkStyles.card}>
      {/* Tutor row */}
      <View style={bkStyles.tutorRow}>
        <View style={bkStyles.avatar}>
          <Text style={bkStyles.avatarText}>{getInitials(booking.tutor.name)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={bkStyles.tutorName}>{booking.tutor.name}</Text>
          <Text style={bkStyles.tutorUni} numberOfLines={1}>{booking.tutor.university}</Text>
        </View>
        <View style={[bkStyles.statusBadge, { backgroundColor: sc.bg, borderColor: sc.border }]}>
          <Text style={[bkStyles.statusText, { color: sc.text }]}>
            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
          </Text>
        </View>
      </View>

      {/* Details */}
      <View style={bkStyles.detailsGrid}>
        <DetailItem icon="laptop-outline"   label="Method"    value={booking.teachingMethod} />
        <DetailItem icon="calendar-outline" label="Days/week" value={`${booking.daysPerWeek} days`} />
        <DetailItem icon="time-outline"     label="Time"      value={booking.preferredTime} />
        <DetailItem icon="cash-outline"     label="Salary"    value={formatSalary(booking.tutor.expectedSalary)} />
      </View>

      {/* Message */}
      <View style={bkStyles.messageBox}>
        <Text style={bkStyles.messageLabel}>Your message</Text>
        <Text style={bkStyles.messageText}>{booking.message}</Text>
      </View>

      {/* Footer */}
      <View style={bkStyles.footer}>
        <Ionicons name="time-outline" size={12} color={Colors.textTertiary} />
        <Text style={bkStyles.footerText}>{timeAgo(booking.createdAt)}</Text>
        <Pressable
          style={bkStyles.profileBtn}
          onPress={() => router.push(`/(student)/tutor/${booking.tutorId}` as never)}
        >
          <Text style={bkStyles.profileBtnText}>View Profile</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DetailItem({
  icon, label, value,
}: {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  label: string;
  value: string;
}) {
  return (
    <View style={bkStyles.detailItem}>
      <Ionicons name={icon} size={13} color={Colors.primary} />
      <View>
        <Text style={bkStyles.detailLabel}>{label}</Text>
        <Text style={bkStyles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// ApplicantsModal
// ---------------------------------------------------------------------------

function ApplicantsModal({
  visible, post, applicants, loading, onClose, onUpdateStatus,
}: {
  visible: boolean;
  post: StudentTuitionPost;
  applicants: StudentApplication[];
  loading: boolean;
  onClose: () => void;
  onUpdateStatus: (appId: string, status: 'accepted' | 'rejected') => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={modalStyles.safe} edges={['top', 'bottom']}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title} numberOfLines={1}>{post.title}</Text>
          <Pressable onPress={onClose} style={modalStyles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </Pressable>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={Colors.primary} />
          </View>
        ) : applicants.length === 0 ? (
          <View style={styles.center}>
            <Ionicons name="people-outline" size={48} color={Colors.textTertiary} />
            <Text style={styles.emptyText}>No applications yet</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={modalStyles.scroll}>
            {applicants.map((app) => (
              <View key={app.id} style={modalStyles.appCard}>
                <View style={modalStyles.appHeader}>
                  <View style={modalStyles.avatar}>
                    <Text style={modalStyles.avatarText}>
                      {app.tutor.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={modalStyles.tutorName}>{app.tutor.name}</Text>
                    <Text style={modalStyles.tutorUni} numberOfLines={1}>{app.tutor.university}</Text>
                  </View>
                  <View style={[
                    modalStyles.statusBadge,
                    { backgroundColor: app.status === 'pending'
                      ? Colors.pendingSurface
                      : app.status === 'accepted'
                      ? Colors.acceptedSurface
                      : Colors.rejectedSurface }
                  ]}>
                    <Text style={[
                      modalStyles.statusText,
                      { color: app.status === 'pending'
                        ? Colors.pending
                        : app.status === 'accepted'
                        ? Colors.accepted
                        : Colors.rejected }
                    ]}>
                      {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                    </Text>
                  </View>
                </View>

                <Text style={modalStyles.message}>{app.message}</Text>
                <Text style={modalStyles.time}>{timeAgo(app.appliedAt)}</Text>

                {app.status === 'pending' && (
                  <View style={modalStyles.actionRow}>
                    <Pressable
                      style={modalStyles.acceptBtn}
                      onPress={() => onUpdateStatus(app.id, 'accepted')}
                    >
                      <Ionicons name="checkmark" size={16} color={Colors.textInverse} />
                      <Text style={modalStyles.acceptBtnText}>Accept</Text>
                    </Pressable>
                    <Pressable
                      style={modalStyles.rejectBtn}
                      onPress={() => onUpdateStatus(app.id, 'rejected')}
                    >
                      <Ionicons name="close" size={16} color={Colors.rejected} />
                      <Text style={modalStyles.rejectBtnText}>Reject</Text>
                    </Pressable>
                    <Pressable
                      style={modalStyles.viewProfileBtn}
                      onPress={() => router.push(`/(student)/tutor/${app.tutorId}` as never)}
                    >
                      <Text style={modalStyles.viewProfileText}>View Profile</Text>
                    </Pressable>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// CreatePostModal
// ---------------------------------------------------------------------------

interface CreatePostForm {
  title: string;
  subject: string;
  classLevel: string;
  numberOfStudents: string;
  tutorGender: string;
  teachingMethod: string;
  daysPerWeek: string;
  preferredTime: string;
  area: string;
  minSalary: string;
  maxSalary: string;
  description: string;
}

function CreatePostModal({
  visible, studentId, studentName, onClose, onCreated,
}: {
  visible: boolean;
  studentId: string;
  studentName: string;
  onClose: () => void;
  onCreated: (post: StudentTuitionPost) => void;
}) {
  const [form, setForm] = useState<CreatePostForm>({
    title: '',
    subject: SUBJECTS[0],
    classLevel: CLASS_LEVELS[0],
    numberOfStudents: '1',
    tutorGender: 'Any',
    teachingMethod: 'Home Tuition',
    daysPerWeek: '3',
    preferredTime: PREFERRED_TIMES[0],
    area: AREAS[0],
    minSalary: '',
    maxSalary: '',
    description: '',
  });
  const [errors, setErrors] = useState<Partial<CreatePostForm>>({});
  const [submitting, setSubmitting] = useState(false);

  function set(key: keyof CreatePostForm, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<CreatePostForm> = {};
    if (!form.title.trim() || form.title.trim().length < 5) e.title = 'Title must be at least 5 characters.';
    if (!form.minSalary || isNaN(Number(form.minSalary)) || Number(form.minSalary) <= 0) e.minSalary = 'Enter a valid minimum salary.';
    if (!form.maxSalary || isNaN(Number(form.maxSalary)) || Number(form.maxSalary) <= 0) e.maxSalary = 'Enter a valid maximum salary.';
    if (Number(form.minSalary) > Number(form.maxSalary)) e.maxSalary = 'Max salary must be ≥ min salary.';
    if (!form.description.trim() || form.description.trim().length < 20) e.description = 'Description must be at least 20 characters.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleCreate() {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const post = await createTuitionPost({
        studentId,
        studentName,
        title: form.title.trim(),
        subject: form.subject,
        classLevel: form.classLevel,
        numberOfStudents: parseInt(form.numberOfStudents) || 1,
        tutorGender: form.tutorGender as 'Male' | 'Female' | 'Any',
        teachingMethod: form.teachingMethod as 'Home Tuition' | 'Online' | 'Both',
        daysPerWeek: parseInt(form.daysPerWeek) || 3,
        preferredTime: form.preferredTime,
        division: 'Dhaka',
        district: 'Dhaka',
        area: form.area,
        minSalary: parseInt(form.minSalary),
        maxSalary: parseInt(form.maxSalary),
        description: form.description.trim(),
        status: 'open',
      });
      onCreated(post);
    } catch {
      // silently fail in mock
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={modalStyles.safe} edges={['top', 'bottom']}>
        <View style={modalStyles.header}>
          <Text style={modalStyles.title}>Post a Requirement</Text>
          <Pressable onPress={onClose} style={modalStyles.closeBtn}>
            <Ionicons name="close" size={24} color={Colors.textPrimary} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={modalStyles.scroll} keyboardShouldPersistTaps="handled">
          <FormField label="Post Title" value={form.title} onChangeText={(t) => set('title', t)}
            placeholder="e.g. Need Math Tutor for SSC" error={errors.title} />

          <PickerRow label="Subject" options={SUBJECTS} value={form.subject} onChange={(v) => set('subject', v)} />
          <PickerRow label="Class Level" options={CLASS_LEVELS} value={form.classLevel} onChange={(v) => set('classLevel', v)} />
          <PickerRow label="Tutor Gender" options={[...TUTOR_GENDERS]} value={form.tutorGender} onChange={(v) => set('tutorGender', v)} />
          <PickerRow label="Teaching Method" options={[...TEACHING_METHODS]} value={form.teachingMethod} onChange={(v) => set('teachingMethod', v)} />
          <PickerRow label="Preferred Time" options={[...PREFERRED_TIMES]} value={form.preferredTime} onChange={(v) => set('preferredTime', v)} />
          <PickerRow label="Area" options={AREAS} value={form.area} onChange={(v) => set('area', v)} />

          <FormField label="Min Salary (BDT/month)" value={form.minSalary} onChangeText={(t) => set('minSalary', t)}
            placeholder="e.g. 4000" keyboardType="numeric" error={errors.minSalary} />
          <FormField label="Max Salary (BDT/month)" value={form.maxSalary} onChangeText={(t) => set('maxSalary', t)}
            placeholder="e.g. 7000" keyboardType="numeric" error={errors.maxSalary} />

          <FormField label="Description" value={form.description} onChangeText={(t) => set('description', t)}
            placeholder="Describe your requirements in detail..." multiline numberOfLines={4} error={errors.description} />

          <Pressable style={[createStyles.submitBtn, submitting && { opacity: 0.7 }]} onPress={handleCreate} disabled={submitting}>
            {submitting
              ? <ActivityIndicator size="small" color={Colors.textInverse} />
              : <Text style={createStyles.submitBtnText}>Post Requirement</Text>}
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

function PickerRow({
  label, options, value, onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={pickerStyles.wrapper}>
      <Text style={pickerStyles.label}>{label}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={pickerStyles.row}>
        {options.map((opt) => (
          <Pressable
            key={opt}
            style={[pickerStyles.chip, value === opt && pickerStyles.chipActive]}
            onPress={() => onChange(opt)}
          >
            <Text style={[pickerStyles.chipText, value === opt && pickerStyles.chipTextActive]}>
              {opt}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  pageTitle: { fontSize: Typography['2xl'], fontWeight: Typography.bold, color: Colors.textPrimary },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Segment tabs
  segmentRow: {
    flexDirection: 'row',
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.md,
    backgroundColor: Colors.border,
    borderRadius: Radius.lg,
    padding: 3,
    gap: 3,
  },
  segBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: 9,
    borderRadius: Radius.md,
  },
  segBtnActive: {
    backgroundColor: Colors.primary,
    ...Shadow.sm,
  },
  segBtnText: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
  },
  segBtnTextActive: { color: Colors.textInverse },
  badge: {
    minWidth: 18,
    height: 18,
    borderRadius: Radius.full,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeActive: { backgroundColor: 'rgba(255,255,255,0.25)' },
  badgeText: { fontSize: 10, fontWeight: Typography.bold, color: Colors.primary },
  badgeTextActive: { color: Colors.textInverse },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md },
  errorText: { fontSize: Typography.base, color: Colors.error, textAlign: 'center' },
  retryBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.sm, backgroundColor: Colors.primary, borderRadius: Radius.lg },
  retryText: { fontSize: Typography.base, color: Colors.textInverse, fontWeight: Typography.semiBold },
  emptyText: { fontSize: Typography.lg, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  emptySubText: { fontSize: Typography.base, color: Colors.textSecondary, textAlign: 'center' },
  createBtn: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.md, backgroundColor: Colors.primary, borderRadius: Radius.lg },
  createBtnText: { fontSize: Typography.base, color: Colors.textInverse, fontWeight: Typography.semiBold },
  list: { paddingHorizontal: Spacing.base, paddingBottom: Spacing['3xl'] },
});

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
    gap: Spacing.sm,
  },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  title: { flex: 1, fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  statusText: { fontSize: Typography.xs, fontWeight: Typography.semiBold },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  salaryRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  salaryText: { fontSize: Typography.sm, color: Colors.textSecondary },
  actions: { flexDirection: 'row', gap: Spacing.sm },
  viewBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    height: 36,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  viewBtnText: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.primary },
  closeBtn: {
    paddingHorizontal: Spacing.md,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.rejectedSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.rejected },
});

const chipStyles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  text: { fontSize: Typography.xs, color: Colors.textSecondary },
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
  title: { flex: 1, fontSize: Typography.lg, fontWeight: Typography.bold, color: Colors.textPrimary },
  closeBtn: { width: TouchTarget, height: TouchTarget, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: Spacing.base, paddingBottom: Spacing['4xl'] },
  appCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
    gap: Spacing.sm,
  },
  appHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.full,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: Typography.sm, fontWeight: Typography.bold, color: Colors.primary },
  tutorName: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  tutorUni: { fontSize: Typography.xs, color: Colors.textSecondary },
  statusBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  statusText: { fontSize: Typography.xs, fontWeight: Typography.semiBold },
  message: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: Typography.sm * 1.6 },
  time: { fontSize: Typography.xs, color: Colors.textTertiary },
  actionRow: { flexDirection: 'row', gap: Spacing.sm },
  acceptBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.accepted,
  },
  acceptBtnText: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textInverse },
  rejectBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    height: 36,
    borderRadius: Radius.md,
    backgroundColor: Colors.rejectedSurface,
    borderWidth: 1,
    borderColor: Colors.rejectedBorder,
  },
  rejectBtnText: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.rejected },
  viewProfileBtn: {
    paddingHorizontal: Spacing.md,
    height: 36,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewProfileText: { fontSize: Typography.xs, fontWeight: Typography.semiBold, color: Colors.primary },
});

const createStyles = StyleSheet.create({
  submitBtn: {
    height: TouchTarget,
    backgroundColor: Colors.primary,
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  submitBtnText: { fontSize: Typography.base, fontWeight: Typography.semiBold, color: Colors.textInverse },
});

const pickerStyles = StyleSheet.create({
  wrapper: { marginBottom: Spacing.base, gap: Spacing.xs },
  label: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  row: { gap: Spacing.xs, paddingVertical: 2 },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: { borderColor: Colors.primary, backgroundColor: Colors.primarySurface },
  chipText: { fontSize: Typography.sm, color: Colors.textSecondary, fontWeight: Typography.medium },
  chipTextActive: { color: Colors.primary, fontWeight: Typography.semiBold },
});

const bkStyles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
    gap: Spacing.md,
  },
  tutorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: Radius.full,
    backgroundColor: Colors.primarySurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.primary },
  tutorName: { fontSize: Typography.base, fontWeight: Typography.bold, color: Colors.textPrimary },
  tutorUni: { fontSize: Typography.xs, color: Colors.textSecondary, marginTop: 2 },
  statusBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderWidth: 1,
  },
  statusText: { fontSize: Typography.xs, fontWeight: Typography.bold },
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.xs,
    width: '47%',
  },
  detailLabel: { fontSize: Typography.xs, color: Colors.textTertiary },
  detailValue: { fontSize: Typography.sm, fontWeight: Typography.semiBold, color: Colors.textPrimary },
  messageBox: {
    backgroundColor: Colors.primarySurface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: 4,
    borderLeftWidth: 3,
    borderLeftColor: Colors.primary,
  },
  messageLabel: { fontSize: Typography.xs, fontWeight: Typography.semiBold, color: Colors.primary },
  messageText: { fontSize: Typography.sm, color: Colors.textSecondary, lineHeight: Typography.sm * 1.5 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerText: { flex: 1, fontSize: Typography.xs, color: Colors.textTertiary },
  profileBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  profileBtnText: { fontSize: Typography.xs, fontWeight: Typography.semiBold, color: Colors.primary },
});
