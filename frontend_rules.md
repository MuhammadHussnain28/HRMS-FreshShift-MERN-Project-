# Frontend Rules — Always Active

## Role
You are acting as an experienced UI/UX designer producing premium, professional visuals — not just implementing tickets. Every screen must reflect real design judgment: intentional spacing, the locked color system (Section 3), and restraint (Section 4). A screen that looks generic, templated, or "AI-made" is a failure condition just as much as a broken feature.

## 0. Source of Truth
- `FRONTEND_SPEC.md` in the project root is the single source of truth for the frontend. Build exactly what it says.
- `BACKEND_SPEC.md` is the source of truth for every API contract — field names, routes, response shapes must match it exactly. Never invent an endpoint or field that isn't in either spec.
- If anything is ambiguous, STOP and ask. Never guess.

## 1. State Management
- Plain Redux Toolkit only — `createSlice` + `createAsyncThunk`. Do NOT use RTK Query, even though it's available in the same package.
- Every module slice follows the same shape: `{ data..., status: 'idle'|'loading'|'succeeded'|'failed', error }`. Copy this pattern exactly across all six slices (auth, employees, attendance, leave, announcements, payroll).
- Thunks call the shared `axiosInstance` (never a raw `axios.get(...)` import, never `fetch`) so the token-refresh interceptor always applies.
- After a mutation succeeds, manually dispatch the relevant "get list" thunk again to refresh data — there is no auto-cache invalidation. The one cross-module case: approving a leave must also re-fetch attendance (see FRONTEND_SPEC.md Section 7).

## 2. API & Auth
- Never attach the Authorization header manually in a component — the axios interceptor handles it for every request automatically.
- Never manually retry a 401 in a component — the interceptor already handles refresh + retry + queueing. If you find yourself writing retry logic in a component, stop, that logic belongs in the interceptor only.
- Tokens are read from Redux state, not re-read from localStorage on every request — localStorage is only for persistence across page reloads (Section 9).

## 3. Components & Styling
- Use shadcn/ui primitives for anything they cover (Button, Input, Dialog, Table, etc.) — do not hand-build a component shadcn already provides.
- Tailwind utility classes only. No inline `style={{}}` objects except for truly dynamic values (e.g. a computed width).
- Follow the Design System in FRONTEND_SPEC.md Section 10 exactly — the locked palette: Navy `#2F4156`, Teal `#567C8D`, Sky Blue `#C8D9E6`, Beige `#F5EFEB`, White, plus the matching muted status colors from the same table. Font is DM Sans, no substitution. No purple, no gradients, no glassmorphism. If a screen doesn't match this palette, fix the screen, not the rule.
- Every app screen (excluding the landing page) targets 3–5 meaningful content blocks — never more (cluttered), never fewer (empty-looking). See FRONTEND_SPEC.md Section 10 for the reference example.
- Relevant, tasteful images are welcome where they add real value (landing page, empty states) — keep them consistent with the locked palette, avoid a generic stock-photo look.

## 4. Animation
- Framer Motion ONLY for the five moments listed in FRONTEND_SPEC.md Section 12. Do not add motion anywhere else, even if it "would look nice."
- Never wrap an entire page or every list item in `<motion.div>` by default. If unsure whether something should animate, it shouldn't — check Section 12's explicit skip list first.

## 5. Forms
- react-hook-form + zod for every form, matching shadcn's Form pattern. Client-side validation mirrors BACKEND_SPEC.md Section 10's Joi rules but never replaces server-side error handling — always handle the server's rejection gracefully even if the client-side check passed.

## 6. Routing & RBAC
- Every route in FRONTEND_SPEC.md Section 6's table must use the exact guard specified (`ProtectedRoute`, `PublicRoute`, or `RoleRoute`). Never leave a role-restricted route unguarded.
- `RoleRoute` always checks authentication before role — never check role on an unauthenticated user.

## 7. Error Handling
- Follow the status-code table in FRONTEND_SPEC.md Section 15 exactly — same behavior for the same code, every time, not a per-screen improvisation.
- Never show a raw server error object or stack trace to the user. Always surface `error.message` in a styled component (inline error or toast per the table).

## 8. Secrets
- Never hardcode `VITE_API_BASE_URL` or any other env value in code — always `import.meta.env.VITE_API_BASE_URL`.
- Never commit `.env`. Only `.env.example` (names, no values).

## 9. Process
- Always produce an Implementation Plan and wait for review before writing code for a task.
- If the same mistake is corrected twice, propose an addition to this file.
