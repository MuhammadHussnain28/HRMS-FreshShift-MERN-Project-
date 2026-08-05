# FreshShifts HRMS — Frontend Specification v1

**Companion document to `BACKEND_SPEC.md`. Build exactly to this document. Every screen below maps to a specific backend endpoint — if a screen needs data with no matching endpoint in BACKEND_SPEC.md, STOP and ask, do not invent one.**

---

## 1. Introduction & Purpose

Complete frontend specification for the FreshShifts HRMS — covers architecture, state management, routing, every screen, forms, error handling, and animation strategy end-to-end so development can proceed without ambiguity, exactly like BACKEND_SPEC.md does for the API.

Two roles consume this frontend: **Employee** and **HR Admin**. Every screen below states who can see it.

## 2. Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Build tool | Vite | Faster dev server than CRA, modern standard |
| Framework | React | Functional components + hooks only |
| Routing | react-router-dom (v6+) | |
| State management | Redux Toolkit (`configureStore`, one slice per module + `createAsyncThunk`) | Plain slices and thunks throughout — see Section 7 |
| HTTP client | axios | One shared instance with interceptors, called inside thunks — see Section 8 |
| Styling | Tailwind CSS | |
| Components | shadcn/ui (Radix primitives + Tailwind) | Accessible by default, fully customizable |
| Icons | lucide-react | |
| Animation | Framer Motion | Used **selectively** — see Section 12 |
| Forms | react-hook-form + zod (`@hookform/resolvers`) | Matches shadcn's own Form recipe |
| Charts | recharts | Dashboard trend chart only |
| Notifications | sonner | shadcn's current recommended toast |
| Dates | date-fns | |

## 3. Frontend-Specific Decisions & Rationale

Your master guide said "Redux Toolkit" and "axios" but didn't specify implementation detail at this depth. These are the judgment calls made to fill those gaps — flagged the same way BACKEND_SPEC.md flagged its v2 corrections, so you can push back on any of them.

| # | Decision | Reasoning |
|---|---|---|
| 1 | **Plain Redux Toolkit** (slices + `createAsyncThunk`) for every module, not RTK Query | More code to write than RTK Query, but zero new concepts — this is the Redux Toolkit already known, kept exactly as-is rather than learning a second new pattern on top of a brand-new IDE. |
| 2 | **axios called directly inside each thunk**, using one shared instance | The token-refresh logic lives entirely in the axios interceptor (Section 8), so it applies automatically no matter which slice or thunk triggers the request — no need to duplicate refresh logic per module. |
| 3 | **AI recommendation hidden from the employee's own leave view** — only HR Admin sees it | The AI hint is decision support *for HR*, per BACKEND_SPEC.md Section 8. Showing an employee "Flag — low team coverage" on their own request reads as the system pre-judging them before a human even looks at it. Employee sees status only (Pending/Approved/Rejected). Confirmed. |
| 4 | **"Add Employee" is a popup (Dialog) inside `/admin/employees`, not a separate `/register` page — and it must feel deliberate, not thrown together** | `POST /auth/register` is functionally "onboard a new hire," always done by a logged-in HR Admin acting on the Employees screen. The popup uses generous padding, grouped fields (identity → role/department → compensation), and a clear final step (credentials shown once) — not a flat list of inputs crammed into a small box. Confirmed as popup style. |
| 5 | **Route structure: shared routes for shared concerns, `/admin/*` prefix for admin-only management** | Employee and HR Admin see meaningfully different UIs for Attendance/Leave/Payroll (per BACKEND_SPEC.md's own access table — HR Admin doesn't submit leave or clock in/out in this system). Separate route components make RBAC enforcement obvious instead of one giant component full of role-branching. |
| 6 | **No dedicated automated frontend test suite** | Your master guide's testing rigor is entirely backend-focused (15–25 Jest tests). Section 19 substitutes a manual QA checklist instead, run once per module before demo — matches the project's actual time budget. |

## 4. Role Capability Matrix

| Feature | Employee | HR Admin |
|---|---|---|
| Dashboard | Own summary | Org-wide overview |
| Profile | View/edit own (limited fields) | Same, plus manage all employees |
| Clock in/out | ✅ | ❌ (not a system user for this) |
| View own attendance | ✅ | — |
| View all employees' attendance | ❌ | ✅ |
| Submit leave request | ✅ | ❌ |
| View own leave requests + balance | ✅ | — |
| View all leave requests + decide | ❌ | ✅ |
| View announcements | ✅ | ✅ |
| Create/edit/delete announcements | ❌ | ✅ |
| View own payslips | ✅ | — |
| Generate payroll for any employee | ❌ | ✅ |
| Create/edit/deactivate employees | ❌ | ✅ |

## 5. Folder Structure

```
/client
  /src
    /app
      store.js              → configureStore, combines all 6 slices
    /assets
    /components
      /ui                   → shadcn-generated primitives — don't hand-edit beyond shadcn's own CLI output
      /shared               → StatusBadge, StatCard, PageHeader, EmptyState, ErrorState,
                              ConfirmDialog, DataTable wrapper, AiRecommendationBadge
      /layout               → AppShell, Sidebar, Topbar, MobileNav
    /pages
      /auth                 → LoginPage
      /dashboard            → DashboardPage, EmployeeDashboard, AdminDashboard
      /profile              → ProfilePage
      /employees            → EmployeesListPage, AddEmployeeModal, EditEmployeeModal   (admin)
      /attendance           → AttendancePage (employee), AdminAttendancePage
      /leaves               → LeavesPage (employee), AdminLeavesPage
      /announcements        → AnnouncementsPage (shared, role-conditional controls)
      /payroll              → PayrollPage (employee), AdminPayrollPage
      /errors               → NotFoundPage, UnauthorizedPage
    /redux
      /slices
        authSlice.js          → user, accessToken, refreshToken, isAuthenticated + login/logout thunks
        employeesSlice.js     → list, selected, status/error + CRUD thunks
        attendanceSlice.js    → myRecords, allRecords, status/error + clockIn/clockOut thunks
        leaveSlice.js         → myLeaves, allLeaves, balance, status/error + submit/decide thunks
        announcementsSlice.js → list, status/error + CRUD thunks
        payrollSlice.js       → history, status/error + generate thunk
    /routes
      ProtectedRoute.jsx    → redirect to /login if not authenticated
      PublicRoute.jsx       → redirect to /dashboard if already authenticated
      RoleRoute.jsx         → redirect to /unauthorized if role doesn't match
      AppRoutes.jsx         → central route tree
    /lib
      axiosInstance.js      → axios instance + request/response interceptors (Section 8)
      utils.js              → shadcn's cn() helper
      validators.js         → zod schemas mirroring backend Joi rules
    /hooks
      useAuth.js            → convenience hook over authSlice selectors
    App.jsx
    main.jsx
  components.json            → shadcn config
  tailwind.config.js
  vite.config.js
  .env.example
  .env
```

## 6. Routing & Route Guards

| Route | Access | Guard |
|---|---|---|
| `/` | Public | none — landing page, always accessible |
| `/login` | Public | `PublicRoute` |
| `/dashboard` | Authenticated | `ProtectedRoute` (renders Employee or Admin view by role) |
| `/profile` | Authenticated | `ProtectedRoute` |
| `/announcements` | Authenticated | `ProtectedRoute` |
| `/attendance` | Employee only | `RoleRoute(['employee'])` |
| `/leaves` | Employee only | `RoleRoute(['employee'])` |
| `/payroll` | Employee only | `RoleRoute(['employee'])` |
| `/admin/employees` | HR Admin only | `RoleRoute(['hr_admin'])` |
| `/admin/attendance` | HR Admin only | `RoleRoute(['hr_admin'])` |
| `/admin/leaves` | HR Admin only | `RoleRoute(['hr_admin'])` |
| `/admin/payroll` | HR Admin only | `RoleRoute(['hr_admin'])` |
| `/unauthorized` | Any | Shown by `RoleRoute` on mismatch |
| `*` | Any | `NotFoundPage` |

`RoleRoute` wraps `ProtectedRoute` — always check authentication before role.

## 7. State Management — Redux Toolkit Architecture

Plain Redux Toolkit throughout: one slice per module, each with its own `createAsyncThunk` calls and its own `status`/`error` fields. Same pattern, six times — once you've built one slice, the rest are copy-and-adjust.

**`authSlice`** (client-only state, no thunks needed beyond login/logout):
```js
{
  user: { id, name, role } | null,
  accessToken: string | null,
  refreshToken: string | null,
  isAuthenticated: boolean
}
```
Actions: `setCredentials({ user, accessToken, refreshToken })` (used directly by the login thunk AND by the axios interceptor on refresh, Section 8), `logout()`.

**Every other slice follows this exact shape** — state has `{ data, status: 'idle'|'loading'|'succeeded'|'failed', error }`, thunks call `axiosInstance` directly.

Representative example (mirror this pattern exactly for every other module — employees, attendance, announcements, payroll):

```js
// redux/slices/leaveSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axiosInstance';

export const submitLeave = createAsyncThunk('leave/submit', async (body, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.post('/leaves', body);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error || { message: 'Something went wrong' });
  }
});

export const getMyLeaves = createAsyncThunk('leave/getMine', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/leaves/me');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const getAllLeaves = createAsyncThunk('leave/getAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/leaves', { params });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const decideLeave = createAsyncThunk('leave/decide', async ({ id, decision }, { dispatch, rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.put(`/leaves/${id}/decision`, { decision });
    // Approval creates on-leave Attendance records (BACKEND_SPEC.md 7.1 step 8) —
    // manually re-fetch attendance too so an open attendance view stays accurate.
    dispatch(getAllAttendance());
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

export const getMyBalance = createAsyncThunk('leave/getBalance', async (_, { rejectWithValue }) => {
  try {
    const { data } = await axiosInstance.get('/leaves/balance/me');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.error);
  }
});

const leaveSlice = createSlice({
  name: 'leave',
  initialState: { myLeaves: [], allLeaves: [], balance: null, status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getMyLeaves.pending, (state) => { state.status = 'loading'; })
      .addCase(getMyLeaves.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.myLeaves = action.payload;
      })
      .addCase(getMyLeaves.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
      // Repeat the same three-case pattern (pending/fulfilled/rejected) for
      // submitLeave, getAllLeaves, decideLeave, getMyBalance — same shape each time.
  },
});

export default leaveSlice.reducer;
```

**Important — since there's no RTK Query auto-caching here, refetching after a mutation is manual.** After `submitLeave` succeeds, the component (or the thunk itself) should dispatch `getMyLeaves()` again to refresh the list. The `decideLeave` thunk above shows the one cross-module case explicitly: approving a leave also re-fetches attendance, because approval silently creates attendance records on the backend. Every other module only needs to refetch its own list after its own mutations — that one is the sole cross-module link in the whole app.

## 8. API Layer & Token Refresh Flow

This is the most bug-prone part of any JWT frontend. Follow this exactly — it solves the classic "multiple simultaneous 401s trigger multiple refresh calls" bug via a queue.

```js
// lib/axiosInstance.js
import axios from 'axios';
import { store } from '../app/store';
import { setCredentials, logout } from '../redux/slices/authSlice';

const axiosInstance = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

axiosInstance.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue = []; // { resolve, reject } waiting on the in-flight refresh

function flushQueue(error, token = null) {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  queue = [];
}

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const status = error.response?.status;
    const isRefreshCall = original.url.includes('/auth/refresh-token');

    if (status === 401 && !original._retry && !isRefreshCall) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => queue.push({ resolve, reject })).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return axiosInstance(original);
        });
      }
      original._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = store.getState().auth.refreshToken;
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/auth/refresh-token`,
          { refreshToken }
        );
        const { accessToken, refreshToken: newRefresh, user } = data.data;
        store.dispatch(setCredentials({ accessToken, refreshToken: newRefresh, user }));
        flushQueue(null, accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(original);
      } catch (refreshError) {
        flushQueue(refreshError, null);
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

This single `axiosInstance` is imported directly into every slice's thunks (Section 7) — since the refresh logic lives here, in the interceptor, it applies automatically no matter which slice or thunk fires the request. Nothing extra needed per module.

**Payslip PDF download** is the one exception to "always go through a thunk that returns JSON" — it returns a binary blob. Call `axiosInstance.get(...)` with `responseType: 'blob'` directly in the component (or a dedicated thunk that just triggers the browser download rather than storing the blob in Redux state), then create an object URL and trigger a download link programmatically.

## 9. App Bootstrap & Session Persistence

Tokens persist in `localStorage` (not httpOnly cookies — the backend returns both tokens in the JSON body per BACKEND_SPEC.md Section 6.1, so the client is responsible for storing them; this is a known trade-off, standard for body-issued JWTs, worth stating plainly if asked in an interview).

On app load, before rendering any route:
1. Read `accessToken` / `refreshToken` from `localStorage` into `authSlice`.
2. If present, call `getMyProfile` (`GET /employees/me`) to confirm the session is still valid and fetch fresh user data.
3. If that call 401s, the axios interceptor (Section 8) already attempts a silent refresh automatically — if refresh also fails, `logout()` fires and the user lands on `/login`.
4. Show a full-screen loading state during this check — never flash the login page before the check resolves.

## 10. Design System

**Confirmed palette — locked, do not substitute or "improve" with different colors:**

| Token | Hex | Use |
|---|---|---|
| Navy | `#2F4156` | Primary text, primary buttons/CTAs, dark surfaces (sidebar/topbar) |
| Teal | `#567C8D` | Secondary accent — links, active nav state, icons, secondary buttons |
| Sky Blue | `#C8D9E6` | Light tints — hover states, selected rows, soft highlight backgrounds |
| Beige | `#F5EFEB` | Sparing warm touches — landing page only (Section 13.0); avoid on data-heavy app screens, large beige areas read dated |
| White | `#FFFFFF` | Main page background, card surfaces on app screens |
| Muted text | `#7C8B99` | Secondary text, labels (blended from Navy + Teal) |
| Border | `#E3EAF0` | Card/table borders — thin 1px, not heavy shadows |

**Status colors — muted, drawn from the same family, never bright/neon flags:**

| Status | Text | Background |
|---|---|---|
| Approved / Present | `#3F6B4A` (muted sage) | `#E7F0EA` |
| Pending / Flag | `#8A6529` (muted ochre) | `#F6EAD8` |
| Rejected / Absent-deduction | `#8A4530` (muted terracotta) | `#F4E2DC` |
| Inactive / Neutral | `#5C6B78` (navy-derived gray) | `#ECF0F3` |

**Explicitly avoid** (the "looks AI-generated" tells): purple/violet anywhere, purple-to-pink or blue-to-purple gradients, gradient buttons/backgrounds in general, glassmorphism/frosted-blur effects, neon/highly saturated accents, heavy glow/box-shadow on every element, emoji used as UI icons.

**Typography — DM Sans (Google Fonts), final, no substitution:**
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap" rel="stylesheet">
```
Set as the base `font-family` in `tailwind.config.js`.

**Breathing room — the part that most reads as "designed by a professional":**
- Generous card padding (`p-6`/`p-8`, not `p-3`)
- Section spacing `space-y-8`–`space-y-10` between major blocks
- Comfortable line-height on body text (`leading-relaxed`)
- Let empty space exist around key actions rather than filling every pixel

**Content density — every app screen (excluding the landing page, Section 13.0) targets 3–5 meaningful content blocks, never more, never fewer.** More than 5 feels cluttered no matter how well-spaced; fewer than 3 feels empty no matter how much padding is added. Reference: the Employee Dashboard's 4 blocks (greeting, clock-in card, balance summary, recent announcements) is the target density — use it as the benchmark for every other screen.

**Images:** relevant, tasteful images/illustrations are welcome throughout the frontend where they genuinely add value — landing page hero, feature highlights, empty states. Keep them consistent with the palette above; avoid generic stock-photo look.

**Shape:** `rounded-lg` cards, thin 1px `border`-colored borders as the primary separator — shadows reserved only for floating elements (Dialogs/Popovers), not every card.

**Add Employee popup specifically** (per Decision #4): generous internal padding, fields grouped into visual sections (Identity → Role & Department → Compensation), clean final "credentials" step.

## 11. Component Inventory

**shadcn primitives used:** Button, Input, Label, Form, Card, Table, Dialog, AlertDialog, DropdownMenu, Badge, Select, Calendar + Popover (date pickers), Tabs, Avatar, Skeleton, Separator, Sheet (mobile nav), Sonner (toasts).

**Custom shared components (built on the above):**
- `StatusBadge` — colored pill for leave/attendance/employment status
- `AiRecommendationBadge` — green "Approve" / amber "Flag" / gray "No AI insight available" (when `aiRecommendation` is null — never render this as broken, per backend's graceful-degradation contract)
- `StatCard` — dashboard number tile, supports count-up animation
- `PageHeader`, `EmptyState`, `ErrorState` — consistent across all list pages
- `ConfirmDialog` — generic yes/no wrapper over AlertDialog (used for deactivate employee, etc.)
- `DataTable` — thin wrapper over shadcn Table with consistent empty/loading rows

## 12. Animation Strategy

Framer Motion, used **only** where it earns its place. Everything else uses shadcn/Tailwind's built-in transitions, which are already smooth enough — do not wrap every element in `<motion.div>`.

**Animate these (the "stands out" list):**
1. **Route transitions** — subtle fade + 8px slide, ~150–200ms. Gives the whole app a premium feel without being showy.
2. **Leave decision moment** — when HR Admin approves/rejects, the request card animates out of the pending list (fade + collapse) instead of just vanishing. This is the app's signature interaction moment — worth the polish.
3. **Clock in/out button** — a small satisfying state change (icon morph, brief scale pulse) on success. Employees do this daily; a small delight compounds.
4. **Dashboard stat cards** — numbers count up on mount (Total Employees, Pending Leaves, Present Today). Directly serves "make the HR happy" — this is HR Admin's daily home screen.
5. **New items appearing in a live list** (new announcement posted, new leave request arriving in the admin queue) — a soft fade-in for just the new row.

**Do NOT animate (explicit skip list — do not improvise beyond this):**
- Form field focus/validation states — keep instant, animated errors feel laggy
- Button hover — shadcn's built-in `transition-colors` is enough; no scale/bounce on every hover
- Data tables in general — no stagger animation on every row of Attendance history or the full Employees list; this hurts perceived performance
- Sidebar navigation — instant active-state change
- Loading skeletons — shadcn's default pulse only, no custom shimmer

## 13. Screen-by-Screen Specification

### 13.0 Home / Landing Page — `/` (public)
Purpose: the first page anyone sees — explains what this HRMS is, what problem it solves, and invites login. This is the page to screen-share when demoing the project. The **only** screen allowed a richer, more "marketing" feel — every other screen stays calm and functional per Section 10's density rule.

Structure is fixed below; exact headlines/copy/wording are left open — don't over-script the language, but don't skip or reorder these sections:
1. **Hero** — headline + one-line problem statement + primary "Login" button. A relevant hero image/illustration is encouraged.
2. **Problem framing** — brief statement of the pain this solves (manual/scattered HR processes) before listing features.
3. **Feature highlights** — one card per module, 6 total (Employee Management, Attendance, Leave Management, Announcements, Payroll, Security/RBAC), icon + short description each. The **Smart Leave Assistant (AI)** should be visually called out as the standout feature, not listed as an equal seventh item.
4. **Craft mention** — one subtle line or small strip (not a big section), a quiet nod to the engineering behind it (e.g. two-token auth, automated testing).
5. **Final CTA** — Login button again, closing section.

Animation: a tasteful entrance animation on the hero (fade + slide-up) is appropriate here specifically, since this page's job is to impress on first load — still nothing heavy or looping, per Section 12.

### 13.1 Login — `/login` (public)
Data: `authApi.login` (`POST /auth/login`). UI: centered shadcn Card, email + password via Form, submit button with loading spinner, inline error alert on 401 ("Invalid email or password"). Animation: gentle fade+scale on card mount only — first thing the user sees.

### 13.2 Dashboard (Employee) — `/dashboard`
Data: `getMyProfile`, `getMyAttendance` (today's record), `getMyBalance`, `getAnnouncements` (latest 3), `getMyLeaves` (latest 2–3).
UI: greeting header; prominent clock-in/out card showing current status + a live elapsed-time counter while clocked in; three compact leave-balance stat cards (Casual/Sick/Annual, used vs allowed); recent announcements list; recent leave requests with `StatusBadge` only (no AI info — Decision #3).

### 13.3 Dashboard (HR Admin) — `/dashboard`
Data: `getEmployees` (count), `getAllLeaves?status=pending`, `getAllAttendance` (today, for present-count + chart), `getAnnouncements`.
UI: stat card row (Total Employees, Pending Leave Requests, Present Today) with count-up animation; pending leave requests list with `AiRecommendationBadge` and inline Approve/Reject buttons; recharts bar chart of daily attendance count over the current month; recent announcements with quick edit/delete + "New Announcement" button.

### 13.4 Profile — `/profile`
Data: `getMyProfile` / `updateMyProfile` (`PUT /employees/me`). UI: read view + edit mode for allowed fields only (phone, etc., per BACKEND_SPEC.md 6.2 — name/email/role/salary are not employee-editable). Same page for both roles; HR Admin sees identical self-profile behavior here (their own-record management is separate, in Employees).

### 13.5 Employees — `/admin/employees` (HR Admin only)
Data: `getEmployees`, `createEmployee` (`POST /auth/register`), `updateEmployee`, `deactivateEmployee`.
UI: `DataTable` of all employees (name, department, designation, status badge); "Add Employee" button opens a modal form (name, email, department, designation, phone, joining date, monthly salary, role, password — with a "Generate secure password" helper). On success, show the credentials **once** in a confirmation dialog for HR Admin to share manually (no email-sending in scope). Row actions: Edit (modal), Deactivate (`ConfirmDialog` → soft delete, sets `employmentStatus`).

### 13.6 Attendance — `/attendance` (Employee only)
Data: `clockIn`, `clockOut`, `getMyAttendance`. UI: same clock-in/out card as the dashboard, plus a full history table (date, clock-in, clock-out, status). Empty state if no records yet.

### 13.7 Attendance — `/admin/attendance` (HR Admin only)
Data: `getAllAttendance` (date-range filter), `getEmployeeAttendance` (drill into one employee). UI: filter bar (employee select + date range via Calendar/Popover), `DataTable` of results. No stagger animation on rows (skip list, Section 12).

### 13.8 Leaves — `/leaves` (Employee only)
Data: `getMyBalance`, `getMyLeaves`, `submitLeave`. UI: leave balance stat row at top (same three cards, visible again right where dates get picked); "Request Leave" button opens a Form (leaveType select, date range via Calendar, reason textarea, live day-count preview); own requests list below with `StatusBadge` only. On 400 (balance exceeded), show the server's message inline on the form, not a generic toast.

### 13.9 Leaves — `/admin/leaves` (HR Admin only)
Data: `getAllLeaves` (status filter tabs: Pending/Approved/Rejected), `decideLeave`. UI: each pending request as a card — employee name, dates, reason, `AiRecommendationBadge` with reasoning shown beneath, Approve/Reject buttons. On decision, card animates out of the Pending tab (Section 12, animation #2).

### 13.10 Announcements — `/announcements` (shared)
Data: `getAnnouncements`, and for HR Admin: `createAnnouncement`, `updateAnnouncement`, `deleteAnnouncement`. UI: feed of cards (title, message, date, author). HR Admin sees an additional "New Announcement" button and edit/delete icons per card; Employee sees a clean read-only feed. New items fade in (Section 12, animation #5).

### 13.11 Payroll — `/payroll` (Employee only)
Data: `getPayrollHistory` (own), `downloadPayslip`. UI: list of generated payslips (month/year, net salary), each with a Download button (direct axios blob request, Section 8).

### 13.12 Payroll — `/admin/payroll` (HR Admin only)
Data: `getEmployees` (select), `generatePayroll`, `getPayrollHistory`, `downloadPayslip`. UI: employee + month/year selector → "Generate" → breakdown card (Base Salary, Unpaid Leave Deduction, Net Salary) exactly per BACKEND_SPEC.md Section 7.2, with a Download Payslip button. **On 409** (duplicate month), show "Payslip already generated for this month" with a link to view the existing one — not a generic error toast (Section 15).

### 13.13 Error Pages
`NotFoundPage` (`*` route), `UnauthorizedPage` (shown by `RoleRoute` on role mismatch) — simple centered message + a button back to `/dashboard`.

## 14. Forms & Validation

react-hook-form + zod, matching shadcn's own Form pattern. Client-side schemas **mirror** BACKEND_SPEC.md Section 10's Joi rules — client validation is a UX convenience; the server remains the source of truth, so every submit handler must still gracefully surface server-side validation errors (Section 15).

Representative example (mirror this pattern for every other form — Employee, Announcement, Payroll generate):

```js
// lib/validators.js
import { z } from 'zod';

export const leaveRequestSchema = z.object({
  leaveType: z.enum(['casual', 'sick', 'annual']),
  startDate: z.date(),
  endDate: z.date(),
  reason: z.string().min(5).max(300),
}).refine((data) => data.endDate >= data.startDate, {
  message: 'End date must be on or after start date',
  path: ['endDate'],
});
```

## 15. Error, Loading & Empty States

Every list/detail screen has three explicit states via shared components: loading (`Skeleton`), empty (`EmptyState` with a relevant icon + message), error (`ErrorState` with retry button). Never leave a blank screen while data is pending.

**Backend error code → UI behavior** (apply consistently everywhere, don't improvise per-screen):

| Status | Meaning | Frontend behavior |
|---|---|---|
| 400 | Validation failed | Inline field error from `error.message`; toast only if not tied to a specific field |
| 401 | Expired/invalid token | Axios interceptor attempts silent refresh (Section 8) — invisible to the user unless refresh also fails, then forced logout + toast "Session expired, please log in again" |
| 403 | Forbidden (role/ownership) | Toast "You don't have permission to do this"; if reached via direct URL, `RoleRoute` already redirected before this fires |
| 404 | Not found | Inline "not found" state in that view, or `NotFoundPage` if navigating directly to a missing entity |
| 409 | Conflict (duplicate clock-in, duplicate payslip month, duplicate email) | Specific contextual message per action (see 13.12 for the payroll example) — never a generic "conflict occurred" |
| 429 | Rate limited (login/refresh) | Surface the server's own message directly — it already states the wait time |
| 500 | Server error | Generic toast "Something went wrong, please try again"; log full error to console in dev |

## 16. Notifications

Sonner toasts for: successful mutations (created/updated/deleted), non-field-specific errors, and session-expiry. Keep messages short and specific ("Leave request submitted", not "Success!"). Don't toast for things already visible in the UI (e.g. don't toast AND show an inline error for the same validation failure).

## 17. Accessibility

Mostly inherited for free from Radix/shadcn (keyboard navigation, focus trapping in dialogs, ARIA roles). Requirements on top: every form input has a visible `Label`; never remove focus-visible outlines; all icon-only buttons (edit/delete icons) get an `aria-label`.

## 18. Environment Variables

```
VITE_API_BASE_URL   # e.g. http://localhost:5000/api — must match backend PORT + /api prefix
```

## 19. Testing / Manual QA Checklist

No automated frontend test suite (Decision #6). Before demo, manually verify once per role:

- [ ] Login works for both roles; wrong password shows inline error
- [ ] Session survives a page refresh (bootstrap check, Section 9)
- [ ] Employee: clock in/out, duplicate clock-in same day is blocked with a clear message
- [ ] Employee: submit leave, see it pending with status only (no AI info visible)
- [ ] Employee: submitting leave beyond balance shows the 400 message inline
- [ ] HR Admin: sees AI recommendation badge on pending requests, including the "no AI insight" gray state
- [ ] HR Admin: approve a leave → request leaves the pending list, attendance view reflects on-leave days if reopened
- [ ] HR Admin: generate payroll, breakdown matches a hand-calculated example, PDF downloads and opens correctly
- [ ] HR Admin: generating the same employee/month twice shows the 409 message, not a crash
- [ ] HR Admin: create employee, credentials dialog appears once, new account can log in
- [ ] Deactivated employee cannot log in
- [ ] Employee cannot access any `/admin/*` route directly (redirects to `/unauthorized`)

## 20. Frontend Definition of Done

- [ ] All 14 screens (Section 13, including the public landing page) implemented and matched to their exact backend endpoint
- [ ] Token refresh flow (Section 8) verified: expired access token triggers silent refresh, not a logout, under normal use
- [ ] Role-based routing verified for both roles (Section 6)
- [ ] All error codes in Section 15's table produce the specified behavior, not a generic fallback
- [ ] Animation strategy followed as scoped (Section 12) — no motion outside the stated list
- [ ] Manual QA checklist (Section 19) fully passed
- [ ] `.env.example` committed; real `.env` git-ignored
- [ ] Deployed (Vercel/Netlify), pointed at the deployed backend, `CORS_ORIGIN` on the backend updated to match
