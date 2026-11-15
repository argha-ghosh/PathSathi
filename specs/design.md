# PathSathi — Admin Module & Shared UI: Design

**Author:** Md. Safinah Amed Sohag (GitHub: safin-55)  
**Course:** Mobile Application Development with React Native & Expo, Fall 2026-27, Group 08  
**Phase:** 1 (Midterm — frontend shell with mock data)  
**Last updated:** November 2026

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────┐
│              Expo Router                 │
│  app/index.tsx  →  role-based redirect  │
│                                          │
│  /(auth)/          /(admin)/            │
│  /(student)/       /(tutor)/            │
│  /(moderator)/                          │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│           React Context                  │
│  AuthContext  (user, token, login,       │
│               logout, authLoading)       │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│           Service / API Layer            │
│  services/adminApi.ts  ──►  real fetch  │
│  mocks/adminApi.mock.ts ──► fake delay  │
│  (config.ts USE_MOCK_API flag picks one) │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│           Mock Data Stores               │
│  mocks/adminStore.ts                     │
│  (Phase 2: replaced by real REST API)   │
└─────────────────────────────────────────┘
```

**Key principle:** Every screen imports from `services/adminApi.ts` only. That file re-exports either the mock or real implementation depending on `USE_MOCK_API` in `config.ts`. Switching to a real backend in Phase 2 is a one-line change.

---

## 2. Folder Structure

This is the complete new tree for my part. Files owned by teammates are shown as-is; I do not modify them except to extend `AuthContext` and `app/index.tsx` (carefully, with backward compatibility).

```
PathSathi/
│
├── app/
│   ├── _layout.tsx               ← EXISTS — no change needed
│   ├── index.tsx                 ← EXTEND — add admin/moderator redirect
│   │
│   ├── (auth)/
│   │   ├── login.tsx             ← EXTEND — add admin/moderator role toggle
│   │   ├── register.tsx          ← TEAMMATES — do not touch
│   │   └── _layout.tsx           ← EXISTS — no change
│   │
│   ├── (admin)/                  ← NEW (my work)
│   │   ├── _layout.tsx           ← bottom tabs: Dashboard / Users / Moderators / Categories
│   │   ├── dashboard.tsx         ← AdminDashboardScreen
│   │   ├── moderators.tsx        ← ManageModeratorsScreen
│   │   ├── categories.tsx        ← ManageCategoriesScreen
│   │   └── users/
│   │       ├── _layout.tsx       ← Stack for users list → detail
│   │       ├── index.tsx         ← ManageUsersScreen
│   │       └── [id].tsx          ← UserDetailScreen
│   │
│   ├── (student)/                ← PLACEHOLDER (teammate fills in)
│   │   ├── _layout.tsx
│   │   └── index.tsx
│   │
│   ├── (tutor)/                  ← EXISTS (teammate's work) — no change
│   │
│   └── (moderator)/              ← PLACEHOLDER (teammate fills in)
│       ├── _layout.tsx
│       └── index.tsx
│
├── src/                          ← NEW top-level src/ for my shared code
│   │
│   ├── config.ts                 ← BASE_URL + USE_MOCK_API flag
│   │
│   ├── api/
│   │   ├── client.ts             ← fetch wrapper: request(), ApiError
│   │   └── adminApi.ts           ← all 11 admin endpoints (mock or real)
│   │
│   ├── theme/
│   │   ├── colors.ts             ← color palette
│   │   ├── spacing.ts            ← spacing tokens
│   │   └── typography.ts         ← font sizes + weights
│   │
│   └── components/               ← 14 shared reusable components
│       ├── AppButton.tsx
│       ├── AppInput.tsx
│       ├── SearchBar.tsx
│       ├── FilterChips.tsx
│       ├── Card.tsx
│       ├── StatCard.tsx
│       ├── StatusBadge.tsx
│       ├── ListItem.tsx
│       ├── LoadingView.tsx
│       ├── ErrorView.tsx
│       ├── EmptyView.tsx
│       ├── ConfirmModal.tsx
│       ├── ScreenContainer.tsx
│       └── Avatar.tsx
│
├── mocks/
│   ├── authStore.ts              ← EXTEND — add admin + moderator demo accounts
│   └── adminStore.ts             ← NEW — mock data for admin module
│
├── services/
│   ├── authApi.ts                ← EXTEND — add admin/moderator to AuthUser type
│   └── adminApi.ts               ← NEW — exports from mock or real (via config)
│
├── types/
│   ├── tutor.ts                  ← EXISTS — no change
│   ├── student.ts                ← EXISTS — no change
│   └── admin.ts                  ← NEW — AdminUser, Moderator, Category, PlatformStats
│
└── context/
    └── AuthContext.tsx           ← EXTEND — add admin/moderator roles (backward-compatible)
```

> **Note on `src/` vs root-level folders:** The existing project puts `components/`, `hooks/`, etc. at the root level (not inside `src/`). To avoid conflicts, my new shared components go in `src/components/` and my API layer goes in `src/api/`. This keeps my code completely separate from my teammates' work.

---

## 3. Navigation Tree

```
app/index.tsx  (auth gate)
│
├── authLoading=true  ──►  <LoadingView />
│
├── user=null         ──►  /(auth)/login
│
├── role='admin'      ──►  /(admin)/   [AdminTabs]
│   ├── Tab 1: dashboard.tsx           AdminDashboardScreen
│   ├── Tab 2: users/index.tsx         ManageUsersScreen
│   │             └── users/[id].tsx   UserDetailScreen  (stack push)
│   ├── Tab 3: moderators.tsx          ManageModeratorsScreen
│   └── Tab 4: categories.tsx          ManageCategoriesScreen
│
├── role='moderator'  ──►  /(moderator)/  [placeholder]
│
├── role='tutor'      ──►  /(tutor)/      [teammates' work]
│
└── role='student'    ──►  /(student)/    [teammates' work + my placeholder]
```

**Tab icons (Ionicons):**

| Tab | Icon |
|---|---|
| Dashboard | `bar-chart-outline` |
| Users | `people-outline` |
| Moderators | `shield-checkmark-outline` |
| Categories | `list-outline` |

---

## 4. Screen Designs

### 4.1 AdminDashboardScreen (`app/(admin)/dashboard.tsx`)

**Layout:**
```
┌─────────────────────────────────┐
│  PathSathi Admin        [logout]│
│  ─────────────────────────────  │
│  ┌────────┐  ┌────────┐         │
│  │👥 1,245│  │🎓  892 │         │
│  │ Users  │  │ Tutors │         │
│  └────────┘  └────────┘         │
│  ┌────────┐  ┌────────┐         │
│  │🧑  320 │  │🛡️   33 │         │
│  │Students│  │  Mods  │         │
│  └────────┘  └────────┘         │
│  ┌────────┐  ┌────────┐         │
│  │📋  156 │  │✅  482 │         │
│  │ Posts  │  │ Accepts│         │
│  └────────┘  └────────┘         │
└─────────────────────────────────┘
```

**State machine:**
- `loading=true` → show `<LoadingView message="Loading stats…" />`
- `error≠null` → show `<ErrorView message={error} onRetry={fetchStats} />`
- `stats≠null` → show 6 `<StatCard>` components in a 2-column grid
- Pull-to-refresh: `RefreshControl` on the `ScrollView`

**Hook:** `useFetch` (custom hook) called with `getAdminStats`

---

### 4.2 ManageUsersScreen (`app/(admin)/users/index.tsx`)

**Layout:**
```
┌─────────────────────────────────┐
│  Manage Users                   │
│  [🔍 Search by name or email  ] │
│                                  │
│  Role:  [All][Student][Tutor]   │
│         [Moderator]              │
│  Status:[All][Active][Suspended]│
│         [Banned]                 │
│  ─────────────────────────────  │
│  ┌─────────────────────────┐    │
│  │ 👤 Rahim Uddin       ›  │    │
│  │    rahim@example.com    │    │
│  │    [Student] [Active]   │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ 👤 Arif Hassan       ›  │    │
│  │    arif@example.com     │    │
│  │    [Tutor]  [Suspended] │    │
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

**State machine:**
- `loading` → `<LoadingView />`
- `error` → `<ErrorView onRetry />`
- `users.length === 0` → `<EmptyView title="No users found" />`
- success → `FlatList` of `<ListItem>` rows

**Interactions:**
- Search bar: debounced 400ms, calls API with `?search=`
- Role chips: single-select, calls API with `?role=`
- Status chips: single-select, calls API with `?status=`
- Row tap: `router.push('/(admin)/users/' + id)`

---

### 4.3 UserDetailScreen (`app/(admin)/users/[id].tsx`)

**Layout:**
```
┌─────────────────────────────────┐
│  ← User Detail                  │
│                                  │
│       ┌───┐                     │
│       │ RU│  Rahim Uddin        │
│       └───┘  rahim@example.com  │
│              📱 01712345678     │
│                                  │
│  Role:    [Student]              │
│  Status:  [Suspended]            │
│  Joined:  12 Jan 2026            │
│                                  │
│  ─────────────────────────────  │
│  [     Reactivate Account     ] │
│  [         Ban Account        ] │
│                                  │
│  ⚠ Could not update. Try again. │
└─────────────────────────────────┘
```

**Conditional buttons:**
| Current Status | Show Buttons |
|---|---|
| active | Suspend, Ban |
| suspended | Reactivate, Ban |
| banned | Reactivate |

**Confirm modal text examples:**
- Suspend: "Suspend Rahim Uddin? They will not be able to log in until reactivated."
- Ban: "Permanently ban Rahim Uddin? This is a serious action."
- Reactivate: "Reactivate Rahim Uddin? They will regain full access."

---

### 4.4 ManageModeratorsScreen (`app/(admin)/moderators.tsx`)

**Layout:**
```
┌─────────────────────────────────┐
│  Moderators              [+ Add]│
│  ─────────────────────────────  │
│  ┌─────────────────────────┐    │
│  │ 👤 Fatima Noor          │    │
│  │    fatima@pathsathi.com │    │
│  │    Joined: 3 Mar 2026   │    │
│  │                 [Remove]│    │
│  └─────────────────────────┘    │
│                                  │
│  ── Add Moderator (expanded) ── │
│  Name     [               ]     │
│  Email    [               ]     │
│  Password [               ]     │
│           [ Cancel ] [Submit]   │
└─────────────────────────────────┘
```

**State:** `showForm` boolean — tapping "+ Add" expands the form; "Cancel" collapses it.  
**Form validation:** inline, on submit attempt.  
**Optimistic add:** new moderator prepended to list on success; form collapses.

---

### 4.5 ManageCategoriesScreen (`app/(admin)/categories.tsx`)

**Layout:**
```
┌─────────────────────────────────┐
│  Categories                     │
│  [  Subjects  ][Class Levels]  │
│  ─────────────────────────────  │
│  [+ Add Subject]                │
│                                  │
│  ┌─────────────────────────┐    │
│  │ Math            [✏][🗑] │    │
│  └─────────────────────────┘    │
│  ┌─────────────────────────┐    │
│  │ Physics         [✏][🗑] │    │   ← edit mode: inline TextInput
│  └─────────────────────────┘    │
└─────────────────────────────────┘
```

**Tab state:** `activeTab: 'subject' | 'class_level'` — switching tabs fetches the other list (lazy, cached after first load).  
**Edit-in-place:** tapping ✏ replaces the text with a `TextInput` pre-filled with the current name; ✓ saves, ✕ cancels.  
**Add row:** tapping "+ Add Subject/Class Level" inserts a blank `TextInput` at the top of the list.

---

## 5. Component Specifications

### AppButton

```typescript
interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
}
```

- `primary` — filled indigo background, white text
- `secondary` — white background, indigo border + text
- `danger` — filled red background, white text
- `ghost` — no border, indigo text only
- `loading=true` → shows `ActivityIndicator` instead of label; button is non-tappable

---

### AppInput

```typescript
interface AppInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  hint?: string;
  secureTextEntry?: boolean;
  rightIcon?: React.ReactNode;
  keyboardType?: KeyboardTypeOptions;
}
```

---

### SearchBar

```typescript
interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}
```

Renders a row with a magnifier icon, `TextInput`, and a × clear button (visible when value is non-empty).

---

### FilterChips

```typescript
interface FilterChipsProps<T extends string> {
  options: { label: string; value: T }[];
  selected: T;
  onSelect: (value: T) => void;
}
```

Horizontal `ScrollView` of chip pills. Active chip uses primary color fill.

---

### StatCard

```typescript
interface StatCardProps {
  icon: string;          // Ionicons name
  iconColor: string;
  value: number | string;
  label: string;
}
```

---

### StatusBadge

```typescript
interface StatusBadgeProps {
  status: 'active' | 'suspended' | 'banned' | 'pending' | 'verified' | 'rejected';
}
```

Color map:
| Status | Background | Text |
|---|---|---|
| active | `#D1FAE5` | `#065F46` |
| suspended | `#FEF3C7` | `#92400E` |
| banned | `#FEE2E2` | `#991B1B` |
| pending | `#F3F4F6` | `#374151` |
| verified | `#EDE9FE` | `#4C1D95` |
| rejected | `#FEE2E2` | `#991B1B` |

---

### ConfirmModal

```typescript
interface ConfirmModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;      // default: "Confirm"
  confirmVariant?: 'primary' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
}
```

---

### LoadingView / ErrorView / EmptyView

```typescript
interface LoadingViewProps { message?: string; }

interface ErrorViewProps {
  message: string;
  onRetry: () => void;
}

interface EmptyViewProps {
  icon?: string;              // Ionicons name, default: 'search-outline'
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

---

## 6. Data Models (`types/admin.ts`)

```typescript
// User roles across the whole app
export type UserRole = 'student' | 'tutor' | 'moderator' | 'admin';

// Status values for user accounts
export type UserStatus = 'active' | 'suspended' | 'banned';

// Category type
export type CategoryType = 'subject' | 'class_level';

// Platform-wide statistics
export interface PlatformStats {
  totalUsers: number;
  totalTutors: number;
  totalStudents: number;
  totalModerators: number;
  activePosts: number;
  acceptedApplications: number;
}

// A user record as seen by the admin
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;    // ISO 8601 date string
}

// Filters for the users list
export interface UserFilters {
  search: string;
  role: UserRole | 'all';
  status: UserStatus | 'all';
}

// A moderator account
export interface Moderator {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

// Form data for creating a new moderator
export interface CreateModeratorForm {
  name: string;
  email: string;
  password: string;
}

// A subject or class level category
export interface Category {
  id: string;
  name: string;
  type: CategoryType;
}
```

---

## 7. API Layer Design

### `src/config.ts`

```typescript
// ─── ONE LINE to switch between mock and real API ───────────────
export const USE_MOCK_API = true;

// Base URL for the real backend (Phase 2)
export const BASE_URL = 'http://localhost:3000';
```

---

### `src/api/client.ts`

```typescript
// Thin fetch wrapper — attaches JWT, handles errors uniformly

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Generic request function used by all API modules
export async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<T>
```

Flow:
1. Read token from `AsyncStorage`
2. Build headers: `Content-Type: application/json` + `Authorization: Bearer <token>`
3. `fetch(BASE_URL + path, { ...options, headers })`
4. If `!response.ok` → throw `new ApiError(response.status, errorBody.message)`
5. Return `response.json()` as `T`

---

### `src/api/adminApi.ts`

```typescript
// Re-exports from mock or real depending on USE_MOCK_API
import { USE_MOCK_API } from '../config';

export const {
  getAdminStats,
  getUsers,
  getUserById,
  updateUserStatus,
  getModerators,
  createModerator,
  deleteModerator,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} = USE_MOCK_API
  ? require('../../mocks/adminApi.mock')
  : require('./adminApiReal');
```

Each function signature:

```typescript
getAdminStats(): Promise<PlatformStats>
getUsers(filters: UserFilters): Promise<AdminUser[]>
getUserById(id: string): Promise<AdminUser>
updateUserStatus(id: string, status: UserStatus): Promise<AdminUser>
getModerators(): Promise<Moderator[]>
createModerator(form: CreateModeratorForm): Promise<Moderator>
deleteModerator(id: string): Promise<void>
getCategories(type: CategoryType): Promise<Category[]>
createCategory(name: string, type: CategoryType): Promise<Category>
updateCategory(id: string, name: string): Promise<Category>
deleteCategory(id: string): Promise<void>
```

---

## 8. AuthContext Changes

The existing `AuthContext.tsx` is extended minimally:

1. `AuthUser.role` type in `services/authApi.ts` widens from `'tutor' | 'student'` to `UserRole`
2. `login()` in `services/authApi.ts` calls `findUserByEmailAndRole` which currently only looks for `tutor | student` — this logic is extended to also match `admin | moderator`
3. `mocks/authStore.ts` gets two new pre-seeded demo accounts:
   - `admin@pathsathi.com / admin123` (role: `'admin'`)
   - `mod@pathsathi.com / mod123` (role: `'moderator'`)
4. `app/index.tsx` adds two new redirect cases
5. Everything else in `AuthContext.tsx` is **unchanged** — no risk of breaking tutor/student flows

---

## 9. Theme Design (`src/theme/`)

### `colors.ts`

```typescript
export const Colors = {
  // Brand
  primary:        '#4F46E5',   // indigo-600  (matches existing splash)
  primaryLight:   '#EDE9FE',   // indigo-100
  primaryDark:    '#3730A3',   // indigo-800

  // Semantic
  success:        '#10B981',
  successLight:   '#D1FAE5',
  warning:        '#F59E0B',
  warningLight:   '#FEF3C7',
  danger:         '#EF4444',
  dangerLight:    '#FEE2E2',
  info:           '#3B82F6',
  infoLight:      '#DBEAFE',

  // Neutral
  background:     '#F9FAFB',
  surface:        '#FFFFFF',
  border:         '#E5E7EB',
  textPrimary:    '#111827',
  textSecondary:  '#6B7280',
  textTertiary:   '#9CA3AF',
  textInverse:    '#FFFFFF',

  // Overlay
  overlay:        'rgba(0, 0, 0, 0.5)',
};
```

### `spacing.ts`

```typescript
export const Spacing = {
  xs:   4,
  sm:   8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
};
```

### `typography.ts`

```typescript
export const FontSize = {
  xs:   11,
  sm:   13,
  md:   15,
  lg:   17,
  xl:   20,
  xxl:  24,
  xxxl: 28,
};

export const FontWeight = {
  regular:  '400' as const,
  medium:   '500' as const,
  semibold: '600' as const,
  bold:     '700' as const,
};
```

---

## 10. Mock Data (`mocks/adminStore.ts`)

Pre-seeded data for Phase 1:

- **Users:** 10 entries — 4 students, 4 tutors, 1 moderator, 1 admin. Mix of active, suspended, banned.
- **Moderators:** 3 entries
- **Subjects:** same 9 as `mocks/options.ts` (SUBJECTS)
- **Class Levels:** same 7 as `mocks/options.ts` (CLASS_LEVELS)
- **Stats:** derived from the above counts; active posts = 12 (matches tuitionPosts mock); accepted = 1 (matches applications mock)

---

## 11. Backend Stack (Phase 2 — TBD)

The backend stack has **not yet been decided by the team**. The mock layer is designed so Phase 2 is a straight swap:

1. Set `USE_MOCK_API = false` in `src/config.ts`
2. Set `BASE_URL` to the real server
3. Implement `src/api/adminApiReal.ts` with the same function signatures, using `request()` from `client.ts`

Likely stack (pending team decision): **Node.js + Express + MongoDB** — common for React Native courses, well-documented, and aligns with the JSON data models already designed.

My backend files will live in a `backend/` folder at the repo root (not inside the Expo project) to avoid conflicts with the Expo bundler.

---

## 12. What I Do NOT Touch (Teammates' Files)

| File/Folder | Owner | My action |
|---|---|---|
| `app/(tutor)/` | Tutor teammate | No changes |
| `components/tutor/` | Tutor teammate | No changes |
| `services/tutorApi.ts` | Tutor teammate | No changes |
| `services/studentApi.ts` | Student teammate | No changes |
| `mocks/tuitionPosts.ts` | Tutor teammate | No changes |
| `mocks/applications.ts` | Tutor teammate | No changes |
| `mocks/tutors.ts` | Student teammate | No changes |
| `app/(auth)/register.tsx` | Shared/teammates | No changes |
| `constants/theme.ts` | Existing | I add `src/theme/` alongside it; both can coexist |
