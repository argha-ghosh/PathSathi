// app/(tutor)/profile/edit.tsx
// Screen 5 – Edit Profile
// Full form with validation, unsaved-changes guard, day toggles, chip selects.

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { useAuth } from '../../../context/AuthContext';
import { FormField } from '../../../components/tutor/FormField';
import { ChipSelect } from '../../../components/tutor/ChipSelect';
import { LoadingState } from '../../../components/tutor/LoadingState';
import { ErrorState } from '../../../components/tutor/ErrorState';
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadow,
  TouchTarget,
} from '../../../constants/theme';
import { SUBJECTS, CLASS_LEVELS, AREAS, YEARS, DAYS_OF_WEEK } from '../../../mocks/options';
import {
  required,
  positiveNumber,
  numericString,
  atLeastOne,
  maxLength,
} from '../../../utils/validation';
import type { TutorProfile } from '../../../types/tutor';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FormValues {
  name: string;
  university: string;
  department: string;
  year: string;
  subjects: string[];
  classLevels: string[];
  areas: string[];
  expectedSalaryText: string; // string for TextInput; converted to number on save
  experience: string;
  availability: string[];
  bio: string;
}

interface FormErrors {
  name?: string;
  university?: string;
  department?: string;
  year?: string;
  subjects?: string;
  classLevels?: string;
  areas?: string;
  expectedSalary?: string;
  bio?: string;
}

function profileToForm(profile: TutorProfile): FormValues {
  return {
    name: profile.name,
    university: profile.university,
    department: profile.department,
    year: profile.year,
    subjects: [...profile.subjects],
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
// Component
// ---------------------------------------------------------------------------

export default function EditProfileScreen() {
  const { profile, profileLoading: loading, profileError: error, refetchProfile: refetch, saveProfile, saving, saveError } =
    useAuth();

  const [values, setValues] = useState<FormValues | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saveBannerError, setSaveBannerError] = useState<string | null>(null);

  // Track whether the form has been changed since it was seeded
  const originalRef = useRef<FormValues | null>(null);

  // Seed form when profile loads
  useEffect(() => {
    if (profile && values === null) {
      const initial = profileToForm(profile);
      setValues(initial);
      originalRef.current = initial;
    }
  }, [profile, values]);

  // Mirror save error into banner state
  useEffect(() => {
    setSaveBannerError(saveError);
  }, [saveError]);

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

  // Field setters
  function setField<K extends keyof FormValues>(key: K, val: FormValues[K]) {
    setValues((prev) => (prev ? { ...prev, [key]: val } : prev));
    // Clear the corresponding error on change
    const errKey = key === 'expectedSalaryText' ? 'expectedSalary' : (key as keyof FormErrors);
    if (errors[errKey]) {
      setErrors((prev) => ({ ...prev, [errKey]: undefined }));
    }
  }

  function toggleChip(key: 'subjects' | 'classLevels' | 'areas', value: string) {
    if (!values) return;
    const current = values[key];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setField(key, updated);
  }

  function toggleDay(day: string) {
    if (!values) return;
    const updated = values.availability.includes(day)
      ? values.availability.filter((d) => d !== day)
      : [...values.availability, day];
    setField('availability', updated);
  }

  function toggleYear(year: string) {
    setField('year', year);
    if (errors.year) setErrors((prev) => ({ ...prev, year: undefined }));
  }

  // ---------------------------------------------------------------------------
  // Validation
  // ---------------------------------------------------------------------------

  function validate(v: FormValues): FormErrors {
    const e: FormErrors = {};

    const nameErr = required(v.name, 'Name');
    if (nameErr) e.name = nameErr;

    const uniErr = required(v.university, 'University');
    if (uniErr) e.university = uniErr;

    const deptErr = required(v.department, 'Department');
    if (deptErr) e.department = deptErr;

    if (!v.year) e.year = 'Year is required.';

    const subErr = atLeastOne(v.subjects, 'Select');
    if (subErr) e.subjects = subErr;

    const lvlErr = atLeastOne(v.classLevels, 'Select');
    if (lvlErr) e.classLevels = lvlErr;

    const areaErr = atLeastOne(v.areas, 'Select');
    if (areaErr) e.areas = areaErr;

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

    const bioErr = maxLength(v.bio, 300, 'Bio');
    if (bioErr) e.bio = bioErr;

    return e;
  }

  // ---------------------------------------------------------------------------
  // Submit
  // ---------------------------------------------------------------------------

  async function handleSave() {
    if (!values) return;

    setSaveBannerError(null);
    const errs = validate(values);

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

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

    const ok = await saveProfile(payload);
    if (ok) {
      // Update the "original" ref so isDirty() returns false
      originalRef.current = values;
      router.back();
    }
    // On failure, saveError is reflected via the banner
  }

  // ---------------------------------------------------------------------------
  // Render
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

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      {/* Custom back button that triggers the unsaved-changes guard */}
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
          {/* ── Save error banner ── */}
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

          {/* ── Personal Info ── */}
          <FormSectionHeader title="Personal Info" />
          <View style={styles.card}>
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

            {/* Year – single-select chips */}
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

          {/* ── Teaching Preferences ── */}
          <FormSectionHeader title="Teaching Preferences" />
          <View style={styles.card}>
            {/* Subjects */}
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

            {/* Expected salary */}
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

          {/* ── Availability ── */}
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

          {/* ── About You ── */}
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

          <View style={{ height: Spacing['2xl'] }} />
        </ScrollView>

        {/* ── Sticky footer ── */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleBack}
            activeOpacity={0.75}
            accessibilityLabel="Cancel editing"
            accessibilityRole="button"
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>

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
                <Ionicons name="checkmark-outline" size={18} color={Colors.textInverse} />
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
// Sub-component
// ---------------------------------------------------------------------------

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
    flex: 2,
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
