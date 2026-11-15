# PathSathi — Admin Module: Tasks

**Phase 1 (Midterm — frontend shell)**

---

- [x] T-01: Create `types/admin.ts` — data models (AdminUser, Moderator, Category, PlatformStats)
- [x] T-02: Extend `mocks/authStore.ts` — add admin + moderator demo accounts
- [x] T-03: Create `mocks/adminStore.ts` — seed users, moderators, categories, stats
- [x] T-04: Create `services/adminApi.ts` — all 11 mock API functions with delay + error simulation
- [x] T-05: Extend `services/authApi.ts` — widen AuthUser.role to include admin + moderator
- [x] T-06: Extend `context/AuthContext.tsx` — add admin/moderator role support
- [x] T-07: Create shared components — AppButton, AppInput, SearchBar, FilterChips, Card, StatCard, StatusBadge, ListItem, LoadingView, ErrorView, EmptyView, ConfirmModal, ScreenContainer, Avatar
- [x] T-08: Extend `app/index.tsx` — add admin + moderator redirects
- [x] T-09: Extend `app/(auth)/login.tsx` — add Admin role to login toggle
- [x] T-10: Create `app/(admin)/_layout.tsx` — bottom-tab navigator (4 tabs)
- [x] T-11: Create `app/(admin)/users/_layout.tsx` — stack for users list → detail
- [x] T-12: Create `app/(admin)/dashboard.tsx` — AdminDashboardScreen
- [x] T-13: Create `app/(admin)/users/index.tsx` — ManageUsersScreen
- [x] T-14: Create `app/(admin)/users/[id].tsx` — UserDetailScreen
- [x] T-15: Create `app/(admin)/moderators.tsx` — ManageModeratorsScreen
- [x] T-16: Create `app/(admin)/categories.tsx` — ManageCategoriesScreen
- [x] T-17: Create `app/(moderator)/_layout.tsx` + `index.tsx` — placeholder
