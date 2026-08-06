# FreshShifts HRMS — React Frontend

The client-side web application for FreshShifts HRMS, built with React 19, Redux Toolkit, Tailwind CSS v4, and Vite.

---

## 🔑 Demo Login Accounts

| Role | Email | Password |
|---|---|---|
| **HR Administrator** | `admin@freshshifts.com` | `Admin@123` |
| **Employee** | `ali.hassan@freshshifts.com` | `Employee@123` |

---

## 🛠️ Tech Stack & Libraries

- **Framework:** React 19 + Vite
- **State Management:** Redux Toolkit (`createSlice`, `createAsyncThunk`)
- **Styling & Icons:** Tailwind CSS v4, Lucide Icons, Shadcn UI primitives
- **Form Management:** `react-hook-form` + `zod` validation schemas
- **Charts & Data Visuals:** Recharts (`ResponsiveContainer`, `BarChart`)
- **Animation:** Framer Motion (scoped strictly to Section 12 sanctioned moments)
- **Toast Notifications:** Sonner

---

## 📁 Frontend Architecture

```
Client/
├── src/
│   ├── app/                 # Redux store configuration
│   ├── components/          # Reusable UI components
│   │   ├── attendance/      # ClockCard component
│   │   ├── layout/          # AppLayout, Topbar, Sidebar, MobileNav
│   │   ├── shared/          # ConfirmDialog, ErrorState, EmptyState, StatusBadge
│   │   └── ui/              # Shadcn UI primitives (button, dialog, input, card)
│   ├── hooks/               # useAuth custom hook
│   ├── lib/                 # Shared utilities (axiosInstance, validators)
│   ├── pages/               # Application view screens
│   │   ├── announcements/   # AnnouncementsPage
│   │   ├── attendance/      # AttendancePage, AdminAttendancePage
│   │   ├── auth/            # LoginPage
│   │   ├── dashboard/       # DashboardPage, EmployeeDashboard, AdminDashboard
│   │   ├── employees/       # EmployeesListPage, AddEmployeeModal, EditEmployeeModal
│   │   ├── errors/          # UnauthorizedPage
│   │   ├── leaves/          # LeavesPage, AdminLeavesPage, AiRecommendationBadge
│   │   ├── payroll/         # PayrollPage, AdminPayrollPage
│   │   └── profile/         # ProfilePage
│   ├── redux/               # Redux slices (auth, employees, attendance, leave, announcements, payroll)
│   └── routes/              # Route guards (ProtectedRoute, PublicRoute, RoleRoute)
└── package.json
```

---

## 🚀 Environment Variables

Create `.env` inside `Client/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 💻 Available Scripts

- `npm run dev` — Starts the local Vite development server
- `npm run build` — Compiles production bundle into `dist/`
- `npm run preview` — Locally previews the built production bundle
