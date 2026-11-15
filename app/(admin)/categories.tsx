// app/(admin)/categories.tsx
// ManageCategoriesScreen — manage Subjects and Class Levels.
//
// Two tabs: Subjects | Class Levels
// Each tab: add new item, edit in-place, delete with confirm modal.
// All four states handled: loading, error, empty, success.

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Keyboard,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  ApiError,
} from '../../services/adminApi';
import type { Category, CategoryType } from '../../types/admin';

import ConfirmModal from '../../components/admin/ConfirmModal';
import LoadingView from '../../components/admin/LoadingView';
import ErrorView from '../../components/admin/ErrorView';
import EmptyView from '../../components/admin/EmptyView';
import ScreenContainer from '../../components/admin/ScreenContainer';
import { Colors, Spacing, Radius, Typography, Shadow } from '../../constants/theme';

export default function ManageCategoriesScreen() {
  // Active tab
  const [activeTab, setActiveTab] = useState<CategoryType>('subject');

  // ── Per-tab data ─────────────────────────────────────────────
  // Each tab has its own items/loading/error state so switching is instant
  const [subjects, setSubjects] = useState<Category[]>([]);
  const [classLevels, setClassLevels] = useState<Category[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [errorSubjects, setErrorSubjects] = useState<string | null>(null);
  const [errorLevels, setErrorLevels] = useState<string | null>(null);

  // Track which tabs have been fetched so we don't re-fetch on every tab switch
  const fetchedRef = useRef<Set<CategoryType>>(new Set());
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  // ── Add new item ─────────────────────────────────────────────
  const [addText, setAddText] = useState('');
  const [addError, setAddError] = useState('');
  const [adding, setAdding] = useState(false);

  // ── Edit in-place ────────────────────────────────────────────
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // ── Delete ───────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // ── Convenience getters for the active tab ───────────────────
  // Using plain variables avoids the useCallback closure issue
  const isSubject = activeTab === 'subject';
  const currentItems = isSubject ? subjects : classLevels;
  const currentLoading = isSubject ? loadingSubjects : loadingLevels;
  const currentError = isSubject ? errorSubjects : errorLevels;

  function setCurrentItems(items: Category[]) {
    if (isSubject) setSubjects(items); else setClassLevels(items);
  }
  function setCurrentLoading(v: boolean) {
    if (isSubject) setLoadingSubjects(v); else setLoadingLevels(v);
  }
  function setCurrentError(v: string | null) {
    if (isSubject) setErrorSubjects(v); else setErrorLevels(v);
  }

  // ── Load active tab (lazy — only on first visit) ─────────────
  async function loadTab(type: CategoryType, force = false) {
    if (fetchedRef.current.has(type) && !force) return;
    const setLoad = type === 'subject' ? setLoadingSubjects : setLoadingLevels;
    const setErr = type === 'subject' ? setErrorSubjects : setErrorLevels;
    const setItems = type === 'subject' ? setSubjects : setClassLevels;

    setLoad(true);
    setErr(null);
    try {
      const data = await getCategories(type);
      if (mountedRef.current) {
        setItems(data);
        fetchedRef.current.add(type);
      }
    } catch (err) {
      if (mountedRef.current)
        setErr(err instanceof Error ? err.message : 'Failed to load categories.');
    } finally {
      if (mountedRef.current) setLoad(false);
    }
  }

  // Load on mount and when tab switches
  useEffect(() => {
    void loadTab(activeTab);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Reset add/edit state when switching tabs
  useEffect(() => {
    setAddText('');
    setAddError('');
    setEditingId(null);
    setEditText('');
    setEditError('');
    setDeleteError(null);
  }, [activeTab]);

  // ── Duplicate check ──────────────────────────────────────────
  function checkDuplicate(name: string, excludeId?: string): string {
    if (!name.trim()) return 'Name cannot be empty.';
    const dup = currentItems.find(
      (c) => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== excludeId,
    );
    return dup ? `"${name.trim()}" already exists.` : '';
  }

  // ── Add new category ─────────────────────────────────────────
  async function handleAdd() {
    const err = checkDuplicate(addText);
    if (err) { setAddError(err); return; }

    Keyboard.dismiss();
    setAdding(true);
    setAddError('');
    try {
      const newCat = await createCategory(addText, activeTab);
      if (mountedRef.current) {
        setCurrentItems([...currentItems, newCat]);
        setAddText('');
      }
    } catch (err) {
      if (mountedRef.current)
        setAddError(err instanceof ApiError ? err.message : 'Failed to add.');
    } finally {
      if (mountedRef.current) setAdding(false);
    }
  }

  // ── Save edit ────────────────────────────────────────────────
  async function handleSaveEdit() {
    if (!editingId) return;
    const err = checkDuplicate(editText, editingId);
    if (err) { setEditError(err); return; }

    Keyboard.dismiss();
    setSavingEdit(true);
    setEditError('');
    try {
      const updated = await updateCategory(editingId, editText);
      if (mountedRef.current) {
        setCurrentItems(currentItems.map((c) => (c.id === updated.id ? updated : c)));
        setEditingId(null);
      }
    } catch (err) {
      if (mountedRef.current)
        setEditError(err instanceof ApiError ? err.message : 'Failed to save.');
    } finally {
      if (mountedRef.current) setSavingEdit(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteCategory(deleteTarget.id);
      if (mountedRef.current) {
        setCurrentItems(currentItems.filter((c) => c.id !== deleteTarget.id));
        setDeleteTarget(null);
      }
    } catch (err) {
      if (mountedRef.current) {
        setDeleteError(err instanceof ApiError ? err.message : 'Failed to delete.');
        setDeleteTarget(null);
      }
    } finally {
      if (mountedRef.current) setDeleting(false);
    }
  }

  // ── Render a single category row ─────────────────────────────
  function renderItem({ item }: { item: Category }) {
    if (editingId === item.id) {
      // Edit mode — show inline TextInput
      return (
        <View style={styles.row}>
          <View style={styles.editRow}>
            <View style={styles.editInputWrap}>
              <TextInput
                style={[styles.editInput, editError ? styles.editInputError : undefined]}
                value={editText}
                onChangeText={(v) => { setEditText(v); setEditError(''); }}
                autoFocus
                selectTextOnFocus
                returnKeyType="done"
                onSubmitEditing={handleSaveEdit}
              />
              {editError ? <Text style={styles.fieldError}>{editError}</Text> : null}
            </View>
            {/* Save */}
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: Colors.acceptedSurface }]}
              onPress={handleSaveEdit}
              disabled={savingEdit}
              accessibilityLabel="Save"
            >
              {savingEdit
                ? <ActivityIndicator size="small" color={Colors.accepted} />
                : <Ionicons name="checkmark" size={18} color={Colors.accepted} />}
            </TouchableOpacity>
            {/* Cancel */}
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: Colors.border }]}
              onPress={() => { setEditingId(null); setEditError(''); }}
              accessibilityLabel="Cancel edit"
            >
              <Ionicons name="close" size={18} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Normal display row
    return (
      <View style={styles.row}>
        <View style={styles.displayRow}>
          <Ionicons name="ellipse" size={8} color={Colors.primary} style={styles.dot} />
          <Text style={styles.rowText}>{item.name}</Text>
          {/* Edit */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: Colors.primarySurface }]}
            onPress={() => { setEditingId(item.id); setEditText(item.name); setEditError(''); }}
            accessibilityLabel={`Edit ${item.name}`}
          >
            <Ionicons name="pencil-outline" size={16} color={Colors.primary} />
          </TouchableOpacity>
          {/* Delete */}
          <TouchableOpacity
            style={[styles.iconBtn, { backgroundColor: Colors.errorSurface }]}
            onPress={() => { setDeleteError(null); setDeleteTarget(item); }}
            accessibilityLabel={`Delete ${item.name}`}
          >
            <Ionicons name="trash-outline" size={16} color={Colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Render ───────────────────────────────────────────────────
  return (
    <ScreenContainer padHorizontal={false}>

      {/* ── Tab switcher ── */}
      <View style={styles.tabRow}>
        {(['subject', 'class_level'] as CategoryType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab }}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'subject' ? 'Subjects' : 'Class Levels'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Add new item input ── */}
      <View style={styles.addArea}>
        <View style={styles.addInputWrap}>
          <TextInput
            style={[styles.addInput, addError ? styles.addInputError : undefined]}
            value={addText}
            onChangeText={(v) => { setAddText(v); setAddError(''); }}
            placeholder={isSubject ? 'New subject name…' : 'New class level name…'}
            placeholderTextColor={Colors.textTertiary}
            returnKeyType="done"
            onSubmitEditing={handleAdd}
          />
          {addError ? <Text style={styles.fieldError}>{addError}</Text> : null}
        </View>
        <TouchableOpacity
          style={[styles.addBtn, adding && styles.addBtnDisabled]}
          onPress={handleAdd}
          disabled={adding}
          accessibilityLabel="Add category"
        >
          {adding
            ? <ActivityIndicator size="small" color={Colors.textInverse} />
            : <Ionicons name="add" size={22} color={Colors.textInverse} />}
        </TouchableOpacity>
      </View>

      {/* Delete error */}
      {deleteError ? (
        <View style={[styles.errorBanner, styles.errorBannerHorizontal]}>
          <Text style={styles.errorBannerText}>⚠ {deleteError}</Text>
        </View>
      ) : null}

      {/* ── List ── */}
      {currentLoading ? (
        <LoadingView message="Loading categories…" />
      ) : currentError ? (
        <ErrorView
          message={currentError}
          onRetry={() => {
            fetchedRef.current.delete(activeTab);
            setCurrentLoading(true);
            void loadTab(activeTab, true);
          }}
        />
      ) : (
        <FlatList
          data={currentItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={[
            styles.listContent,
            currentItems.length === 0 && styles.listEmpty,
          ]}
          ListEmptyComponent={
            <EmptyView
              icon="list-outline"
              title="No categories yet"
              subtitle="Type a name above and tap + to add one."
            />
          }
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}

      {/* Delete confirm modal */}
      <ConfirmModal
        visible={!!deleteTarget}
        title="Delete Category"
        message={`Delete "${deleteTarget?.name}"? This may affect existing posts and profiles that use it.`}
        confirmLabel="Delete"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  // ── Tabs
  tabRow: {
    flexDirection: 'row',
    backgroundColor: Colors.border,
    margin: Spacing.base,
    marginBottom: 0,
    borderRadius: Radius.lg,
    padding: 3,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    alignItems: 'center',
  },
  tabActive: { backgroundColor: Colors.surface, ...Shadow.sm },
  tabText: {
    fontSize: Typography.base,
    fontWeight: Typography.semiBold,
    color: Colors.textSecondary,
  },
  tabTextActive: { color: Colors.primary },

  // ── Add area
  addArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  addInputWrap: { flex: 1, gap: 4 },
  addInput: {
    height: 44,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  addInputError: { borderColor: Colors.error, backgroundColor: Colors.errorSurface },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: { opacity: 0.6 },

  // ── Error banner
  errorBanner: {
    backgroundColor: Colors.errorSurface,
    borderRadius: Radius.md,
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.rejectedBorder,
  },
  errorBannerHorizontal: {
    marginHorizontal: Spacing.base,
    marginTop: Spacing.xs,
  },
  errorBannerText: { fontSize: Typography.sm, color: Colors.error },
  fieldError: { fontSize: Typography.xs, color: Colors.error },

  // ── List
  listContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing['3xl'],
  },
  listEmpty: { flex: 1 },
  separator: { height: Spacing.xs },

  // ── Category row
  row: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.sm,
  },
  displayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dot: { marginTop: 2 },
  rowText: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.textPrimary,
    fontWeight: Typography.medium,
  },

  // ── Edit row
  editRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
  },
  editInputWrap: { flex: 1, gap: 4 },
  editInput: {
    height: 40,
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.borderFocus,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.base,
    color: Colors.textPrimary,
  },
  editInputError: { borderColor: Colors.error },

  // ── Icon buttons (edit / delete / save / cancel)
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
