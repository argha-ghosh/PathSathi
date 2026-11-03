// components/tutor/FilterSheet.tsx
// Modal bottom-sheet style filter panel for the Tuition Board.
// Uses a plain Modal + Animated slide (no third-party sheet library).

import React, { useState, useEffect, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  TextInput,
  StyleSheet,
  Animated,
  Keyboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Colors,
  Typography,
  Spacing,
  Radius,
  Shadow,
  TouchTarget,
} from '../../constants/theme';
import type { PostFilters } from '../../types/tutor';
import { SUBJECTS, CLASS_LEVELS, AREAS } from '../../mocks/options';

interface FilterSheetProps {
  visible: boolean;
  filters: PostFilters;
  onApply: (filters: Omit<PostFilters, 'search'>) => void;
  onClose: () => void;
}

type LocalFilters = Omit<PostFilters, 'search'>;

const EMPTY: LocalFilters = {};

export function FilterSheet({ visible, filters, onApply, onClose }: FilterSheetProps) {
  const insets = useSafeAreaInsets();

  // Local draft state; committed only on "Apply"
  const [draft, setDraft] = useState<LocalFilters>(EMPTY);
  const [minText, setMinText] = useState('');
  const [maxText, setMaxText] = useState('');

  // Slide-up animation
  const slideAnim = useRef(new Animated.Value(400)).current;

  useEffect(() => {
    if (visible) {
      // Seed draft from current filters when sheet opens
      setDraft({
        subject: filters.subject,
        classLevel: filters.classLevel,
        area: filters.area,
        minSalary: filters.minSalary,
        maxSalary: filters.maxSalary,
      });
      setMinText(filters.minSalary !== undefined ? String(filters.minSalary) : '');
      setMaxText(filters.maxSalary !== undefined ? String(filters.maxSalary) : '');

      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 4,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, filters, slideAnim]);

  function selectSingle(
    key: 'subject' | 'classLevel' | 'area',
    value: string,
  ) {
    setDraft((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }));
  }

  function handleApply() {
    Keyboard.dismiss();
    const min = parseInt(minText, 10);
    const max = parseInt(maxText, 10);
    onApply({
      ...draft,
      minSalary: isNaN(min) ? undefined : min,
      maxSalary: isNaN(max) ? undefined : max,
    });
    onClose();
  }

  function handleReset() {
    setDraft(EMPTY);
    setMinText('');
    setMaxText('');
  }

  const activeCount = [
    draft.subject,
    draft.classLevel,
    draft.area,
    minText,
    maxText,
  ].filter(Boolean).length;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose} accessibilityLabel="Close filter sheet">
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* Sheet */}
      <Animated.View
        style={[
          styles.sheet,
          { paddingBottom: insets.bottom + Spacing.base },
          { transform: [{ translateY: slideAnim }] },
        ]}
      >
        {/* Handle */}
        <View style={styles.handle} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>
            Filters{activeCount > 0 ? ` (${activeCount})` : ''}
          </Text>
          <TouchableOpacity
            onPress={onClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Close filters"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={22} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollArea}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Subject */}
          <FilterSection title="Subject">
            <ChipRow
              options={SUBJECTS}
              selected={draft.subject}
              onSelect={(v) => selectSingle('subject', v)}
            />
          </FilterSection>

          {/* Class Level */}
          <FilterSection title="Class Level">
            <ChipRow
              options={CLASS_LEVELS}
              selected={draft.classLevel}
              onSelect={(v) => selectSingle('classLevel', v)}
            />
          </FilterSection>

          {/* Area */}
          <FilterSection title="Area">
            <ChipRow
              options={AREAS}
              selected={draft.area}
              onSelect={(v) => selectSingle('area', v)}
            />
          </FilterSection>

          {/* Salary range */}
          <FilterSection title="Salary Range (BDT / month)">
            <View style={styles.salaryRow}>
              <View style={styles.salaryInput}>
                <Text style={styles.salaryPrefix}>৳</Text>
                <TextInput
                  value={minText}
                  onChangeText={setMinText}
                  keyboardType="number-pad"
                  placeholder="Min"
                  placeholderTextColor={Colors.textTertiary}
                  style={styles.salaryField}
                  accessibilityLabel="Minimum salary"
                  returnKeyType="done"
                />
              </View>
              <Text style={styles.salarySep}>–</Text>
              <View style={styles.salaryInput}>
                <Text style={styles.salaryPrefix}>৳</Text>
                <TextInput
                  value={maxText}
                  onChangeText={setMaxText}
                  keyboardType="number-pad"
                  placeholder="Max"
                  placeholderTextColor={Colors.textTertiary}
                  style={styles.salaryField}
                  accessibilityLabel="Maximum salary"
                  returnKeyType="done"
                />
              </View>
            </View>
          </FilterSection>

          {/* Bottom padding for scroll */}
          <View style={{ height: Spacing['2xl'] }} />
        </ScrollView>

        {/* Action buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.resetButton}
            onPress={handleReset}
            activeOpacity={0.7}
            accessibilityLabel="Reset all filters"
            accessibilityRole="button"
          >
            <Text style={styles.resetText}>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.applyButton}
            onPress={handleApply}
            activeOpacity={0.85}
            accessibilityLabel="Apply filters"
            accessibilityRole="button"
          >
            <Text style={styles.applyText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Internal sub-components
// ---------------------------------------------------------------------------

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={sectionStyles.wrapper}>
      <Text style={sectionStyles.title}>{title}</Text>
      {children}
    </View>
  );
}

function ChipRow({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string | undefined;
  onSelect: (v: string) => void;
}) {
  return (
    <View style={chipRowStyles.row}>
      {options.map((option) => {
        const active = selected === option;
        return (
          <TouchableOpacity
            key={option}
            style={[chipRowStyles.chip, active && chipRowStyles.chipActive]}
            onPress={() => onSelect(option)}
            activeOpacity={0.75}
            accessibilityRole="radio"
            accessibilityState={{ checked: active }}
            accessibilityLabel={option}
          >
            <Text
              style={[chipRowStyles.label, active && chipRowStyles.labelActive]}
            >
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.modalBackdrop,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius['2xl'],
    borderTopRightRadius: Radius['2xl'],
    maxHeight: '85%',
    ...Shadow.lg,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    alignSelf: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  sheetTitle: {
    fontSize: Typography.lg,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
  },
  scrollArea: {
    flex: 1,
    paddingHorizontal: Spacing.base,
  },
  salaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  salaryInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    height: 44,
    backgroundColor: Colors.surface,
  },
  salaryPrefix: {
    fontSize: Typography.base,
    color: Colors.textSecondary,
    marginRight: 4,
  },
  salaryField: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    height: 44,
    padding: 0,
  },
  salarySep: {
    fontSize: Typography.md,
    color: Colors.textTertiary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.divider,
  },
  resetButton: {
    flex: 1,
    height: TouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  resetText: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
  },
  applyButton: {
    flex: 2,
    height: TouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    backgroundColor: Colors.primary,
  },
  applyText: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textInverse,
  },
});

const sectionStyles = StyleSheet.create({
  wrapper: {
    paddingTop: Spacing.base,
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.sm,
    fontWeight: Typography.semiBold,
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
});

const chipRowStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  label: {
    fontSize: Typography.sm,
    fontWeight: Typography.medium,
    color: Colors.textSecondary,
  },
  labelActive: {
    color: Colors.textInverse,
    fontWeight: Typography.semiBold,
  },
});
