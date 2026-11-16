// app/(tutor)/profile/edit.tsx
// Screen 5 — Edit Profile
//
// A fully controlled form that lets the tutor update every field of their
// TutorProfile. The form is seeded from the existing profile data when the
// screen first mounts, and saves changes back via the global AuthContext.
//
// Key patterns used (from lab manuals):
//
//   Week 4 — Controlled form with combined state
//     All five-ish text field values live in ONE state object (FormValues).
//     This is the "Option B" combined state pattern: the whole form is one value,
//     easy to validate, reset, or pass to a save function in one go.
//
//   Week 4 — useEffect for seeding and mirroring
//     useEffect #1 seeds `values` from the fetched profile on first load.
//     useEffect #2 mirrors the context's saveError into a dismissable banner.
//
//   Week 4 — Manual validation
//     validate() is a pure function that checks every field and returns a
//     FormErrors object. If any error key is set, we update state and
//     return early without saving.
//
//   Week 4 — keyof FormData generic updater
//     setField<K>(key, value) updates one field without overwriting the rest,
//     using the spread pattern: setValues(prev => ({ ...prev, [key]: value })).
//     TypeScript's `keyof FormValues` ensures only valid field names are accepted.
//
//   Week 4 — Unsaved-changes guard (useRef, not useState)
//     We use useRef to store the original form values. useRef does NOT cause a
//     re-render when its value changes — perfect for a "snapshot" we compare
//     against to decide if the form is dirty. Alert.alert() shows the
//     Keep Editing / Discard confirmation (same pattern as Week 5).
//
//   Week 1 — Conditional styles as arrays
//     style={[styles.saveButton, saving && styles.saveButtonDisabled]}
//     React Native merges the array — the disabled style only applies when
//     `saving` is true.

import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Global auth context — provides the profile to seed from and saveProfile()
import { useAuth } from '../../../context/AuthContext';

// Reusable form components
import { ChipSelect } from '../../../components/tutor/ChipSelect';
import { FormField } from '../../../components/tutor/FormField';

// Loading / error placeholders
import { ErrorState } from '../../../components/tutor/ErrorState';
import { LoadingState } from '../../../components/tutor/LoadingState';

import {
  Colors,
  Radius,
  Shadow,
  Spacing,
  TouchTarget,
  Typography,
} from '../../../constants/theme';

// Static option arrays used to populate the chip selects
import { AREAS, CLASS_LEVELS, DAYS_OF_WEEK, SUBJECTS, YEARS } from '../../../mocks/options';

// Pure validation functions — each returns a string error or null
import {
  atLeastOne,
  maxLength,
  numericString,
  positiveNumber,
  required,
} from '../../../utils/validation';

import type { TutorProfile } from '../../../types/tutor';

// ---------------------------------------------------------------------------
// Type definitions
// ---------------------------------------------------------------------------

// The shape of all controlled field values in this form.
// All five text inputs map to string properties; arrays for multi-select chips.
// Note: `expectedSalaryText` is a string here (TextInput always gives strings)
// and is converted to a number only when we build the save payload.
interface FormValues {
  name: string;
  university: string;
  department: string;
  year: string;             // single-select: one of YEARS
  subjects: string[];       // multi-select chips
  classLevels: string[];    // multi-select chips
  areas: string[];          // multi-select chips
  expectedSalaryText: string;
  experience: string;
  availability: string[];   // days of the week
  bio: string;
}

// Validation errors — each key corresponds to a field that can fail.
// Fields without a key are considered valid.
interface FormErrors {
  name?: string;
  university?: string;
  department?: string;
  year?: string;
  subjects?: string;
  classLevels?: string;
  areas?: string;
  expectedSalary?: string;  // note: different key than the FormValues field
  bio?: string;
}

// ---------------------------------------------------------------------------
// Helper: convert a TutorProfile into FormValues for the form state
// ---------------------------------------------------------------------------
// Called once when the profile first loads to seed the form.
function profileToForm(profile: TutorProfile): FormValues {
  return {
    name: profile.name,
    university: profile.university,
    department: profile.department,
    year: profile.year,
    subjects: [...profile.subjects],      // spread to get independent copies
    classLevels: [...profile.classLevels],
    areas: [...profile.areas],
    expectedSalaryText:
      profile.expectedSalary > 0 ? String(profile.expectedSalary) : '',
    experience: profile.experience,
    availability: [...profile.availability],
    bio: profile.bio,
  };
}

// ---------------------------------------------------------------------------
// Validation function (pure — no side effects, easy to test)
// ---------------------------------------------------------------------------
// Takes the current FormValues and returns a FormErrors object.
// An empty {} return means the form is valid.
function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};

  // required() returns an error string if the value is empty, otherwise null
  const nameErr = required(v.name, 'Name');
  if (nameErr) e.name = nameErr;

  const uniErr = required(v.university, 'University');
  if (uniErr) e.university = uniErr;

  const deptErr = required(v.department, 'Department');
  if (deptErr) e.department = deptErr;

  // Year is a single-select chip — we just check it's not empty
  if (!v.year) e.year = 'Year is required.';

  // atLeastOne() returns an error if the array is empty
  const subErr = atLeastOne(v.subjects, 'Select');
  if (subErr) e.subjects = subErr;

  const lvlErr = atLeastOne(v.classLevels, 'Select');
  if (lvlErr) e.classLevels = lvlErr;

  const areaErr = atLeastOne(v.areas, 'Select');
  if (areaErr) e.areas = areaErr;

  // Salary: first check it's a valid number string, then check it's positive
  const numErr = numericString(v.expectedSalaryText, 'Expected salary');
  if (numErr) {
    e.expectedSalary = numErr;
  } else {
    const posErr = positiveNumber(
      parseInt(v.expectedSalaryText, 10),
      'Expected salary',
    );
    if (posErr) e.expectedSalary = posErr;
  }

  // Bio is optional, but if provided it must not exceed 300 characters
  const bioErr = maxLength(v.bio, 300, 'Bio');
  if (bioErr) e.bio = bioErr;

  return e;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function EditProfileScreen() {
  // ---------------------------------------------------------------------------
  // Global state from AuthContext
  // ---------------------------------------------------------------------------
  const {
    profile,            // TutorProfile | null — used to seed the form
    profileLoading: loading,
    profileError: error,
    refetchProfile: refetch,
    saveProfile,        // async function to persist the form data
    saving,             // true while the save API call is in progress
    saveError,          // error string from the last failed save, or null
  } = useAuth();

  // ---------------------------------------------------------------------------
  // Local state
  // ---------------------------------------------------------------------------
  // Combined state for all form field values (Week 4 — Option B).
  // Null until the profile has loaded and we've seeded it via useEffect.
  const [values, setValues] = useState<FormValues | null>(null);

  // Per-field validation errors, populated by validate() on save attempt
  const [errors, setErrors] = useState<FormErrors>({});

  // Error banner displayed above the form after a failed save
  const [saveBannerError, setSaveBannerError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Ref: snapshot of the original form values
  // ---------------------------------------------------------------------------
  // useRef stores a value between renders WITHOUT causing a re-render when it
  // changes. We use it to hold the initial form state so isDirty() can compare
  // the current values against it without triggering extra re-renders.
  const originalRef = useRef<FormValues | null>(null);

  // ---------------------------------------------------------------------------
  // useEffect #1 — seed the form when the profile first loads
  // ---------------------------------------------------------------------------
  // The dependency array [profile, values] means: run this effect whenever
  // profile or values changes. The guard `values === null` ensures we only
  // seed once — if the user starts editing we don't want to reset their work
  // just because the profile object identity changed.
  useEffect(() => {
    if (profile && values === null) {
      const initial = profileToForm(profile);
      setValues(initial);
      originalRef.current = initial; // store snapshot for isDirty()
    }
  }, [profile, values]);

  // ---------------------------------------------------------------------------
  // useEffect #2 — mirror saveError into the banner
  // ---------------------------------------------------------------------------
  // saveError lives in the context. We mirror it into local state so we can
  // let the user dismiss the banner (by setting saveBannerError to null)
  // without affecting the context value.
  useEffect(() => {
    setSaveBannerError(saveError);
  }, [saveError]);

  // ---------------------------------------------------------------------------
  // isDirty — detects unsaved changes
  // ---------------------------------------------------------------------------
  // Compares current values against the originalRef snapshot.
  // Arrays are compared with JSON.stringify because reference equality would
  // always return "changed" after any state update (new array reference).
  function isDirty(): boolean {
    if (!values || !originalRef.current) return false;
    const o = originalRef.current;
    return (
      values.name !== o.name ||
      values.university !== o.university ||
      values.department !== o.department ||
      values.year !== o.year ||
      values.expectedSalaryText !== o.expectedSalaryText ||
      values.experience !== o.experience ||
      values.bio !== o.bio ||
      JSON.stringify(values.subjects) !== JSON.stringify(o.subjects) ||
      JSON.stringify(values.classLevels) !== JSON.stringify(o.classLevels) ||
      JSON.stringify(values.areas) !== JSON.stringify(o.areas) ||
      JSON.stringify(values.availability) !== JSON.stringify(o.availability)
    );
  }

  // ---------------------------------------------------------------------------
  // Back navigation with unsaved-changes guard
  // ---------------------------------------------------------------------------
  // If the user has made changes, show a confirmation alert before discarding.
  // This is the same Alert.alert() destructive-action pattern from Week 5.
  function handleBack() {
    if (isDirty()) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to go back?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: () => router.back(),
          },
        ],
      );
    } else {
      router.back();
    }
  }

  // ---------------------------------------------------------------------------
  // Generic field updater
  // ---------------------------------------------------------------------------
  // setField<K>(key, value) updates one field in the FormValues object without
  // overwriting the other fields. The spread pattern keeps all other fields:
  //   setValues(prev => ({ ...prev, [key]: value }))
  // TypeScript's `keyof FormValues` ensures only valid field names are passed.
  // This is the same pattern as Week 4's updateField() in AddStudentForm.
  function setField<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setValues((prev) => (prev ? { ...prev, [key]: val } : prev));
    // Clear the error for this field as soon as the user starts fixing it —
    // same as the error-clearing logic in Week 4's updateField.
    const errKey =
      key === 'expectedSalaryText'
        ? 'expectedSalary'
        : (key as keyof FormErrors);
    if (errors[errKey]) {
      setErrors((prev) => ({ ...prev, [errKey]: undefined }));
    }
  }

  // ---------------------------------------------------------------------------
  // Chip / toggle helpers
  // ---------------------------------------------------------------------------

  // Multi-select chip toggle for subjects, classLevels, and areas.
  // If the value is already in the array, remove it; otherwise add it.
  function toggleChip(
    key: 'subjects' | 'classLevels' | 'areas',
    value: string,
  ) {
    if (!values) return;
    const current = values[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)  // remove if already selected
      : [...current, value];                // add if not selected
    setField(key, updated);
  }

  // Availability is a multi-select of day strings (e.g. 'Mon', 'Tue')
  function toggleDay(day: string) {
    if (!values) return;
    const updated = values.availability.includes(day)
      ? values.availability.filter((d) => d !== day)
      : [...values.availability, day];
    setField('availability', updated);
  }

  // Year is SINGLE-select — clicking a year chip replaces the previous one
  function toggleYear(year: string) {
    setField('year', year);
    if (errors.year) setErrors((prev) => ({ ...prev, year: undefined }));
  }

  // ---------------------------------------------------------------------------
  // Save handler
  // ---------------------------------------------------------------------------
  async function handleSave() {
    if (!values) return;

    setSaveBannerError(null);

    // Run validation — if any field fails, show errors and stop
    const errs = validate(values);
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    // Build the payload — trim all text fields and convert salary to number
    const payload: Omit<TutorProfile, 'id' | 'verification'> = {
      name: values.name.trim(),
      university: values.university.trim(),
      department: values.department.trim(),
      year: values.year,
      subjects: values.subjects,
      classLevels: values.classLevels,
      areas: values.areas,
      expectedSalary: parseInt(values.expectedSalaryText, 10),
      experience: values.experience.trim(),
      availability: values.availability,
      bio: values.bio.trim(),
    };

    // saveProfile() is an async function from AuthContext.
    // It returns true on success, false on failure.
    const ok = await saveProfile(payload);
    if (ok) {
      // Update the snapshot so isDirty() returns false after saving
      originalRef.current = values;
      router.back();
    }
    // On failure, saveError in the context will flow into saveBannerError
    // via useEffect #2 above.
  }

  // ---------------------------------------------------------------------------
  // Loading / error / waiting-for-seed states
  // ---------------------------------------------------------------------------
  if (loading || values === null) {
    return <LoadingState message="Loading profile…" />;
  }

  if (error) {
    return (
      <SafeAreaView style={styles.safe} edges={['bottom']}>
        <ErrorState message={error} onRetry={refetch} />
      </SafeAreaView>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* KeyboardAvoidingView shifts the content up on iOS when the keyboard
          appears, so the focused input is never hidden. */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Save error banner ──
              Only shown when a save attempt has failed.
              The user can dismiss it by tapping ×. */}
          {saveBannerError ? (
            <View style={styles.errorBanner}>
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={Colors.rejected}
              />
              <Text style={styles.errorBannerText}>{saveBannerError}</Text>
              <TouchableOpacity
                onPress={() => setSaveBannerError(null)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel="Dismiss error"
                accessibilityRole="button"
              >
                <Ionicons name="close" size={16} color={Colors.rejected} />
              </TouchableOpacity>
            </View>
          ) : null}

          {/* ════════════════════════════════════════════════════════════════
              SECTION 1 — Personal Info
              Text inputs for name, university, department, and a year chip row.
          ════════════════════════════════════════════════════════════════ */}
          <FormSectionHeader title="Personal Info" />
          <View style={styles.card}>
            {/* FormField is our reusable labelled input from components/tutor/.
                value and onChangeText make it controlled (Week 4). */}
            <FormField
              label="Full Name"
              required
              value={values.name}
              onChangeText={(t) => setField('name', t)}
              error={errors.name}
              placeholder="e.g. Arif Hassan"
              autoCapitalize="words"
              returnKeyType="next"
            />
            <FormField
              label="University"
              required
              value={values.university}
              onChangeText={(t) => setField('university', t)}
              error={errors.university}
              placeholder="e.g. AIUB"
              autoCapitalize="words"
              returnKeyType="next"
            />
            <FormField
              label="Department"
              required
              value={values.department}
              onChangeText={(t) => setField('department', t)}
              error={errors.department}
              placeholder="e.g. Computer Science and Engineering"
              autoCapitalize="words"
              returnKeyType="next"
            />

            {/* Year — single-select chip row.
                Tapping a chip calls toggleYear() which calls setField('year', y).
                The active chip gets a filled teal background — the same
                conditional style array pattern as Week 1's Follow button. */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>
                Year <Text style={styles.asterisk}>*</Text>
              </Text>
              <View style={styles.yearRow}>
                {YEARS.map((y) => {
                  const active = values.year === y;
                  return (
                    <TouchableOpacity
                      key={y}
                      style={[styles.yearChip, active && styles.yearChipActive]}
                      onPress={() => toggleYear(y)}
                      activeOpacity={0.75}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: active }}
                      accessibilityLabel={y}
                    >
                      <Text
                        style={[
                          styles.yearChipLabel,
                          active && styles.yearChipLabelActive,
                        ]}
                      >
                        {y}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
              {errors.year ? (
                <Text style={styles.fieldError} accessibilityRole="alert">
                  {errors.year}
                </Text>
              ) : null}
            </View>
          </View>

          {/* ════════════════════════════════════════════════════════════════
              SECTION 2 — Teaching Preferences
              Multi-select chip rows for subjects, class levels, areas.
              Also the expected salary text input.
          ════════════════════════════════════════════════════════════════ */}
          <FormSectionHeader title="Teaching Preferences" />
          <View style={styles.card}>
            {/* Subjects — ChipSelect renders a horizontal scrollable row of chips.
                onToggle calls toggleChip() which adds/removes from the array. */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>
                Subjects <Text style={styles.asterisk}>*</Text>
              </Text>
              <ChipSelect
                options={SUBJECTS}
                selected={values.subjects}
                onToggle={(v) => toggleChip('subjects', v)}
                error={errors.subjects}
                accessibilityHint="Select one or more subjects you can teach"
              />
            </View>

            {/* Class Levels */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>
                Class Levels <Text style={styles.asterisk}>*</Text>
              </Text>
              <ChipSelect
                options={CLASS_LEVELS}
                selected={values.classLevels}
                onToggle={(v) => toggleChip('classLevels', v)}
                error={errors.classLevels}
                accessibilityHint="Select one or more class levels you can teach"
              />
            </View>

            {/* Preferred Areas */}
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>
                Preferred Areas <Text style={styles.asterisk}>*</Text>
              </Text>
              <ChipSelect
                options={AREAS}
                selected={values.areas}
                onToggle={(v) => toggleChip('areas', v)}
                error={errors.areas}
                accessibilityHint="Select the areas in Dhaka where you can travel"
              />
            </View>

            {/* Expected salary — numeric text input */}
            <FormField
              label="Expected Salary (BDT / month)"
              required
              value={values.expectedSalaryText}
              onChangeText={(t) => setField('expectedSalaryText', t)}
              error={errors.expectedSalary}
              placeholder="e.g. 5000"
              keyboardType="number-pad"
              returnKeyType="done"
              hint="Numbers only — e.g. 5000"
            />
          </View>

          {/* ════════════════════════════════════════════════════════════════
              SECTION 3 — Availability
              A grid of 7 day chips (Sat–Fri), each toggleable.
              The day chips work like the Year chips above but are multi-select.
          ════════════════════════════════════════════════════════════════ */}
          <FormSectionHeader title="Availability" />
          <View style={styles.card}>
            <Text style={styles.availabilityHint}>
              Select the days you are available for sessions.
            </Text>
            <View style={styles.daysRow}>
              {DAYS_OF_WEEK.map((day) => {
                const active = values.availability.includes(day);
                return (
                  <TouchableOpacity
                    key={day}
                    style={[styles.dayChip, active && styles.dayChipActive]}
                    onPress={() => toggleDay(day)}
                    activeOpacity={0.75}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: active }}
                    accessibilityLabel={`${day} ${active ? 'selected' : 'not selected'}`}
                  >
                    <Text
                      style={[
                        styles.dayLabel,
                        active && styles.dayLabelActive,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ════════════════════════════════════════════════════════════════
              SECTION 4 — About You
              Optional multiline inputs for experience and bio.
              charCount on the bio field shows "current/max" (Week 4).
          ════════════════════════════════════════════════════════════════ */}
          <FormSectionHeader title="About You" />
          <View style={styles.card}>
            <FormField
              label="Experience"
              value={values.experience}
              onChangeText={(t) => setField('experience', t)}
              placeholder="Describe your tutoring experience…"
              multiline
              autoCapitalize="sentences"
            />
            <FormField
              label="Bio"
              value={values.bio}
              onChangeText={(t) => setField('bio', t)}
              error={errors.bio}
              placeholder="Write a short bio visible to guardians… (max 300 chars)"
              multiline
              autoCapitalize="sentences"
              charCount={{ current: values.bio.length, max: 300 }}
            />
          </View>

          {/* Bottom spacer so the last field is not hidden behind the footer */}
          <View style={{ height: Spacing['2xl'] }} />
        </ScrollView>

        {/* ── Sticky footer ──
            The Cancel and Save buttons are outside the ScrollView so they
            stay visible at the bottom regardless of scroll position. */}
        <View style={styles.footer}>
          {/* Cancel — triggers the unsaved-changes guard */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleBack}
            activeOpacity={0.75}
            accessibilityLabel="Cancel editing"
            accessibilityRole="button"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

          {/* Save — disabled (greyed out) while the save API call is running.
              Shows an ActivityIndicator while saving (Week 4 pattern). */}
          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            accessibilityLabel="Save profile"
            accessibilityRole="button"
          >
            {saving ? (
              <ActivityIndicator size="small" color={Colors.textInverse} />
            ) : (
              <>
                <Ionicons
                  name="checkmark-outline"
                  size={18}
                  color={Colors.textInverse}
                />
                <Text style={styles.saveText}>Save Profile</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Sub-component: FormSectionHeader
// ---------------------------------------------------------------------------
// A small section heading rendered above each card group.
// Defined here (not in a separate file) because it is only used on this screen.
function FormSectionHeader({ title }: { title: string }) {
  return <Text style={sectionHeaderStyles.text}>{title}</Text>;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['2xl'],
  },
  // Red dismissable banner shown at the top when saveProfile() fails
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.rejectedSurface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.rejectedBorder,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm + 2,
  },
  errorBannerText: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.rejected,
  },
  // White card container for each form section
  card: {
    marginHorizontal: Spacing.base,
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.base,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.base,
    ...Shadow.sm,
  },
  fieldWrapper: {
    gap: Spacing.xs,
    marginBottom: Spacing.base,
  },
  fieldLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  asterisk: {
    color: Colors.error,
  },
  fieldError: {
    fontSize: Typography.xs,
    color: Colors.error,
  },
  // Year chip row (single-select)
  yearRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  yearChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  yearChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  yearChipLabel: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
  yearChipLabelActive: {
    color: Colors.textInverse,
    fontWeight: Typography.semiBold,
  },
  availabilityHint: {
    fontSize: Typography.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  // Day chip grid (multi-select)
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  dayChip: {
    width: 42,
    height: 42,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  dayChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayLabel: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
  },
  dayLabelActive: {
    color: Colors.textInverse,
  },
  // Sticky footer with Cancel and Save buttons
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    height: TouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  cancelText: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
  },
  saveButton: {
    flex: 2,                // twice as wide as the Cancel button
    height: TouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveText: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textInverse,
  },
});

const sectionHeaderStyles = StyleSheet.create({
  text: {
    fontSize: Typography.xs,
    fontWeight: Typography.semiBold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.xs,
    marginTop: Spacing.base,
  },
});
