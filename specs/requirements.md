# PathSathi — Admin Module & Shared UI: Requirements

**Author:** Md. Safinah Amed Sohag (GitHub: safin-55)  
**Course:** Mobile Application Development with React Native & Expo, Fall 2026-27, Group 08  
**Branch:** `feature/admin-module`  
**Last updated:** November 2026

---

## 0. Scope of This Document

This file covers **only the parts I own**:

1. **Admin Module** — five screens for managing users, moderators, categories, and viewing platform statistics.
2. **Shared UI** — theme, reusable components, and navigation wiring that every teammate's module uses.

My teammates own the Student, Tutor, and Moderator screens. I will create **placeholder screens only** for those modules so navigation wires up without merge conflicts.

---

## 1. Tech Constraints

| Concern | Decision | Reason |
|---|---|---|
| Routing | **Expo Router** (file-based, `app/` dir) | The repo already uses it; `AGENTS.md` mandates it |
| Language | **TypeScript** | Repo already uses TypeScript with strict mode |
| HTTP client | **`fetch` + a thin `src/api/client.ts` wrapper** | AGENTS.md says prefer Expo modules; no axios added |
| Navigation library | Expo Router (`Stack`, `Tabs` via `expo-router`) | Same as above — no extra React Navigation package |
| Auth persistence | `@react-native-async-storage/async-storage` | Already in `package.json` |
| State | React Context API + `useState`/`useEffect` | Keeps code simple and explainable in a viva |
| Mock layer | `src/api/adminApi.mock.ts` | Switch to real API in Phase 2 by one constant change |

---

## 2. User Stories & Acceptance Criteria

### Feature 1 — Platform Statistics (AdminDashboardScreen)

> **US-01:** As an admin, I want to see at-a-glance platform statistics so that I can monitor overall health of the app.

**Acceptance Criteria:**

| # | Criterion |
|---|---|
| AC-01-1 | Screen displays six stat cards: Total Users, Total Tutors, Total Students, Total Moderators, Active Tuition Posts, Accepted Applications. |
| AC-01-2 | On load, a full-screen loading spinner (or skeleton cards) is shown. |
| AC-01-3 | If the API call fails, an error message and a **Retry** button are displayed; tapping Retry re-calls the API. |
| AC-01-4 | Pull-to-refresh reloads all statistics. |
| AC-01-5 | Each stat card shows a label, a large number, and an icon. |
| AC-01-6 | The screen calls `GET /api/admin/stats` exactly once on mount (and again on retry/refresh). |

---

### Feature 2 — User Management (ManageUsersScreen + UserDetailScreen)

> **US-02:** As an admin, I want to list all users, search by name or email, and filter by role and status so that I can find any account quickly.

**Acceptance Criteria:**

| # | Criterion |
|---|---|
| AC-02-1 | A scrollable list shows all users with name, email, role badge, and status badge. |
| AC-02-2 | A search bar filters the list by name or email (minimum 2 characters triggers search). |
| AC-02-3 | Filter chips for **Role** (All / Student / Tutor / Moderator) narrow the list; only one role chip active at a time. |
| AC-02-4 | Filter chips for **Status** (All / Active / Suspended / Banned) narrow the list; only one status chip active at a time. |
| AC-02-5 | Search and filters combine (AND logic). |
| AC-02-6 | While fetching, a loading spinner is displayed. |
| AC-02-7 | If the list is empty after filtering, an **EmptyView** ("No users found") is shown. |
| AC-02-8 | If the API fails, an **ErrorView** with Retry is shown. |
| AC-02-9 | Tapping a user row navigates to UserDetailScreen, passing the user's `id`. |
| AC-02-10 | The screen calls `GET /api/admin/users?search=&role=&status=`. |

> **US-03:** As an admin, I want to view full details for a user and change their status so that I can suspend, ban, or reactivate accounts.

**Acceptance Criteria:**

| # | Criterion |
|---|---|
| AC-03-1 | Screen shows: avatar/initials, full name, email, phone (if available), role, current status, and join date. |
| AC-03-2 | Three action buttons are shown conditionally: **Suspend** (visible when active), **Ban** (visible when active or suspended), **Reactivate** (visible when suspended or banned). |
| AC-03-3 | Tapping any action button opens a **ConfirmModal** with a descriptive message before the API call is made. |
| AC-03-4 | While the status change is in-flight, the action button shows a spinner and all buttons are disabled. |
| AC-03-5 | On success, the status badge on the screen updates immediately (optimistic UI). |
| AC-03-6 | On failure, an error message is shown below the action area; buttons re-enable. |
| AC-03-7 | A loading spinner is shown while the initial user detail is fetching. |
| AC-03-8 | The screen calls `GET /api/admin/users/:id` and `PATCH /api/admin/users/:id/status`. |

---

### Feature 3 — Moderator Management (ManageModeratorsScreen)

> **US-04:** As an admin, I want to view all moderators, create new moderator accounts, and remove existing ones so that I can keep the moderation team up to date.

**Acceptance Criteria:**

| # | Criterion |
|---|---|
| AC-04-1 | A list displays all moderators with name, email, and join date. |
| AC-04-2 | A **+ Add Moderator** button opens an inline form (or bottom sheet) with fields: Name, Email, Temporary Password. |
| AC-04-3 | Form validation: Name ≥ 2 chars, valid email format, password ≥ 8 chars. Inline error messages shown. |
| AC-04-4 | Submitting the form calls `POST /api/admin/moderators`; a loading indicator replaces the submit button. |
| AC-04-5 | On success, the new moderator appears at the top of the list without a full refresh. |
| AC-04-6 | On failure, an error banner is shown above the form; the form stays open with values intact. |
| AC-04-7 | Each moderator row has a **Remove** button; tapping it opens a **ConfirmModal**. |
| AC-04-8 | Confirming removal calls `DELETE /api/admin/moderators/:id`; on success the row is removed from the list. |
| AC-04-9 | On failure of removal, an error toast/banner is shown. |
| AC-04-10 | An empty state ("No moderators yet") is shown when the list is empty. |
| AC-04-11 | The screen calls `GET /api/admin/moderators`, `POST /api/admin/moderators`, and `DELETE /api/admin/moderators/:id`. |

---

### Feature 4 — Category Management (ManageCategoriesScreen)

> **US-05:** As an admin, I want to manage the list of Subjects and Class Levels used across the app so that tutors and students always have accurate options to choose from.

**Acceptance Criteria:**

| # | Criterion |
|---|---|
| AC-05-1 | The screen has two tabs: **Subjects** and **Class Levels**. |
| AC-05-2 | Each tab shows a list of category items with name and an **Edit** / **Delete** action per item. |
| AC-05-3 | An **+ Add** button opens an inline text field for the new category name. |
| AC-05-4 | Validation: name must not be empty; name must not duplicate an existing item in the same tab (case-insensitive). Inline error shown. |
| AC-05-5 | Submitting a new category calls `POST /api/admin/categories` with `{ name, type }`. |
| AC-05-6 | Tapping **Edit** on a row puts that row into an edit-in-place text field; saving calls `PATCH /api/admin/categories/:id`. |
| AC-05-7 | Tapping **Delete** opens a **ConfirmModal**; confirming calls `DELETE /api/admin/categories/:id`. |
| AC-05-8 | All mutations show a loading indicator and handle success/error states. |
| AC-05-9 | An empty state is shown when a tab has no categories. |
| AC-05-10 | Each tab calls `GET /api/admin/categories?type=subject` or `?type=class_level` on first focus. |

---

## 3. Shared UI Requirements

### 3.1 Theme

| # | Requirement |
|---|---|
| SH-01 | A single `src/theme/colors.ts` file defines the full color palette (primary, secondary, semantic colors for status badges, backgrounds, text, border). The whole team imports from this file. |
| SH-02 | A `src/theme/spacing.ts` file defines spacing tokens (xs, sm, md, lg, xl, xxl) so spacing is consistent across all screens. |
| SH-03 | A `src/theme/typography.ts` file defines font sizes and weights. |
| SH-04 | The palette must be legible on small Android phones (minimum WCAG AA contrast for text on background). |

### 3.2 Reusable Components

Each component must be documented with a JSDoc comment showing its props.

| Component | Purpose |
|---|---|
| `AppButton` | Themed pressable button with `variant` (primary/secondary/danger/ghost), `loading` prop (spinner replaces label), and `disabled` state. |
| `AppInput` | Labeled TextInput with `error`, `hint`, and optional `rightIcon` prop. |
| `SearchBar` | Search TextInput with a clear (×) button; calls `onChangeText` on every keystroke. |
| `FilterChips` | Horizontal scroll row of chip buttons; `selected` prop highlights active chip; calls `onSelect(value)`. |
| `Card` | A `View` with shadow and rounded corners; a generic content container. |
| `StatCard` | Specialised card: icon, large number, label. For the dashboard. |
| `StatusBadge` | Coloured pill text for status values (active=green, suspended=amber, banned=red, pending=grey, verified=indigo). |
| `ListItem` | A tappable row with left content (avatar/icon), primary text, secondary text, and optional right element. |
| `LoadingView` | Full-area centered `ActivityIndicator` with an optional message. |
| `ErrorView` | Full-area centered error message with a Retry button; calls `onRetry`. |
| `EmptyView` | Full-area centered icon + title + optional subtitle. |
| `ConfirmModal` | Modal overlay with title, message, cancel and confirm buttons; `loading` prop disables both buttons and shows a spinner. |
| `ScreenContainer` | `SafeAreaView` + `ScrollView` or plain `View` wrapper with consistent horizontal padding, used by every screen. |
| `Avatar` | Initials-based circle with configurable size and colour. |

### 3.3 Navigation

| # | Requirement |
|---|---|
| NAV-01 | The root `app/index.tsx` reads the authenticated user's role from `AuthContext` and redirects to the appropriate group: `/(auth)/login`, `/(student)/`, `/(tutor)/`, `/(moderator)/`, or `/(admin)/`. |
| NAV-02 | `app/(admin)/_layout.tsx` provides a bottom-tab navigator: **Dashboard**, **Users**, **Moderators**, **Categories**. |
| NAV-03 | The Users tab is a nested Stack: list → detail. |
| NAV-04 | `app/(moderator)/_layout.tsx`, `app/(student)/_layout.tsx`, and `app/(tutor)/_layout.tsx` exist with placeholder screens so teammates can fill them in. |
| NAV-05 | Tab icons use `@expo/vector-icons` (Ionicons). |
| NAV-06 | All admin tab screens have a **Logout** button in the header (or profile tab). |

### 3.4 AuthContext Extension

The existing `AuthContext` supports `tutor` and `student` roles. It must be extended to also support `admin` and `moderator` roles.

| # | Requirement |
|---|---|
| AUTH-01 | `AuthUser.role` type is widened to `'tutor' | 'student' | 'admin' | 'moderator'`. |
| AUTH-02 | `login()` accepts the new roles. |
| AUTH-03 | `app/index.tsx` redirects admin users to `/(admin)/` and moderator users to `/(moderator)/`. |
| AUTH-04 | Demo admin credentials (`admin@pathsathi.com / admin123`) work in Phase 1 via the mock layer. |
| AUTH-05 | The existing tutor/student flows are not broken. |

### 3.5 API Client

| # | Requirement |
|---|---|
| API-01 | A single `src/api/client.ts` file exports a `request()` helper built on `fetch`, with a configurable `BASE_URL` from `src/config.ts`. |
| API-02 | `request()` automatically attaches the JWT `Authorization: Bearer <token>` header using the token from `AsyncStorage`. |
| API-03 | `request()` returns parsed JSON on success; throws a typed `ApiError` (with `status` code and `message`) on 4xx/5xx. |
| API-04 | All admin API calls live in `src/api/adminApi.ts`; a mock version lives in `src/api/adminApi.mock.ts`. |
| API-05 | Switching from mock to real is controlled by a single boolean in `src/config.ts` (`USE_MOCK_API`). |

---

## 4. API Contract (Phase 1 — Mock; Phase 2 — Real)

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/admin/stats` | Platform statistics | Admin JWT |
| GET | `/api/admin/users?search=&role=&status=` | List users with optional filters | Admin JWT |
| GET | `/api/admin/users/:id` | Single user detail | Admin JWT |
| PATCH | `/api/admin/users/:id/status` | Change user status | Admin JWT |
| GET | `/api/admin/moderators` | List all moderators | Admin JWT |
| POST | `/api/admin/moderators` | Create new moderator account | Admin JWT |
| DELETE | `/api/admin/moderators/:id` | Remove moderator | Admin JWT |
| GET | `/api/admin/categories?type=subject\|class_level` | List categories by type | Admin JWT |
| POST | `/api/admin/categories` | Create a category | Admin JWT |
| PATCH | `/api/admin/categories/:id` | Rename a category | Admin JWT |
| DELETE | `/api/admin/categories/:id` | Delete a category | Admin JWT |

---

## 5. Data Models

```typescript
// --- Auth ---
interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'tutor' | 'moderator' | 'admin';
  token: string;        // JWT (Phase 2); session ID (Phase 1 mock)
}

// --- Stats ---
interface PlatformStats {
  totalUsers: number;
  totalTutors: number;
  totalStudents: number;
  totalModerators: number;
  activePosts: number;
  acceptedApplications: number;
}

// --- User ---
type UserStatus = 'active' | 'suspended' | 'banned';
type UserRole   = 'student' | 'tutor' | 'moderator' | 'admin';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  joinedAt: string;   // ISO date string
}

// --- Moderator (subset of AdminUser) ---
interface Moderator {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

// --- Category ---
type CategoryType = 'subject' | 'class_level';

interface Category {
  id: string;
  name: string;
  type: CategoryType;
}
```

---

## 6. Out of Scope (Other Teammates' Responsibility)

- Student registration, home, posts, saved, profile screens.
- Tutor board, applications, profile screens.
- Moderator verification, report handling screens.
- Backend routes for student, tutor, moderator (I wire only `/api/admin/*`).

---

## 7. Definition of Done (Phase 1 — Midterm)

- [ ] `npx expo start` runs with zero errors and zero warnings.
- [ ] All five admin screens render and are reachable via tab/stack navigation.
- [ ] Every screen demonstrates loading, error (via `USE_MOCK_API + forceError flag`), empty, and success states.
- [ ] All reusable components are in `src/components/` and used by at least one admin screen.
- [ ] Theme file is in `src/theme/` and all components import from it.
- [ ] AuthContext supports all four roles; demo login works for admin.
- [ ] Placeholder screens exist for student, tutor, and moderator groups.
- [ ] Code has short comments explaining every hook and navigation decision.
- [ ] `npx expo lint` passes with no errors.

## 8. Definition of Done (Phase 2 — Final)

- [ ] All Phase 1 criteria still pass.
- [ ] `USE_MOCK_API = false` in `src/config.ts`; app talks to real backend.
- [ ] Backend: Node.js + Express, MongoDB (or team's chosen stack), admin-only JWT middleware.
- [ ] All 11 admin endpoints return correct HTTP status codes and JSON.
- [ ] Input validation on the backend (400 for bad input, 401/403 for auth failures).
- [ ] GitHub: feature branch with ≥ 10 meaningful commits; a PR is opened against `main`.
