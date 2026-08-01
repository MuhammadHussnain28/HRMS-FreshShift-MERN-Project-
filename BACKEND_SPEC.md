# FreshShifts HRMS — Backend Specification v2 (Corrected)

**Internship Project — FreshShifts | July 2026**
This is the single source of truth for the backend. It supersedes v1. Four logic corrections have been applied (see Changelog). Build exactly to this document.

---

## Changelog — v2 corrections over v1

| # | Issue in v1 | Correction in v2 |
|---|---|---|
| 1 | Payroll counted Attendance records with `status: 'absent'`, but nothing in the system ever creates such records → deduction would always be 0 | Absence is now **computed**, never stored: a working day with no attendance record and no approved leave covering it counts as absent (Section 7.2) |
| 2 | Leave approval said "reduce the employee's leave balance," but no balance field existed anywhere → contradiction | Leave balance is now **always computed**: `policy allowance − sum of approved leave days this year`. Never stored, so it can never drift (Section 7.3) |
| 3 | `/auth/register` is HR-Admin-only with no public signup → impossible to create the first HR Admin (bootstrap deadlock) | A minimal **seed script** (`seed.js`) creates 1 HR Admin + 3 demo employees if the DB is empty (Section 16) |
| 4 | "Clock in for today" was timezone-ambiguous (server UTC vs PKT) → duplicate/wrong-day records possible | Attendance `date` is a normalized `YYYY-MM-DD` string derived from a single configured timezone, plus a **unique compound index** on `(employee, date)` (Section 4.2) |

---

## 1. Introduction & Purpose

Complete backend specification for the HR Management System (HRMS) built as the FreshShifts internship project. Covers data models, API contracts, business logic, security, testing, and deployment end-to-end so development can proceed without ambiguity. A separate Frontend Documentation covers UI screens and how they consume these APIs.

Company-specific values not known (leave policy numbers) use clearly-marked sensible defaults, changeable in one config file without touching business logic.

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (access + refresh token, rotation) |
| Password security | bcrypt (min 10 salt rounds) |
| Validation | Joi |
| AI integration | Gemini API (Smart Leave Assistant) |
| PDF generation | pdfkit (payslips) |
| Testing | Jest + Supertest + mongodb-memory-server |
| Logging | morgan (requests) + winston (app/error) |

## 3. User Roles & Access Model

Two-role model, deliberately simple:

- **Employee** — manages own profile (limited fields), clocks attendance, submits leave requests, views announcements, views/downloads own payslips.
- **HR Admin** — full administrative control: manages all employee records, decides leave requests, posts announcements, generates payroll.

No Manager role. Every permission check reduces to one of two questions: "is this the resource owner?" or "is this an HR Admin?"

## 4. Data Models

### 4.1 User (Employee)

Core identity record. HR Admin and Employee accounts share the same schema; only `role` differs. **No self-registration** — HR Admin creates accounts during onboarding (realistic, and removes a public registration endpoint from the attack surface).

```js
{
  name:            String,   // required
  email:           String,   // required, unique, lowercase
  password:        String,   // required, bcrypt hash
  role:            { type: String, enum: ['employee', 'hr_admin'], default: 'employee' },
  department:      String,
  designation:     String,
  phone:           String,
  joiningDate:     Date,
  employmentStatus:{ type: String, enum: ['active', 'inactive', 'terminated'], default: 'active' },
  monthlySalary:   Number,   // used by Payroll
  refreshTokenHash:String,   // hashed current refresh token (rotation/invalidation)
  createdAt, updatedAt
}
```

**Design note:** `employmentStatus` instead of hard deletes — deleting a User would orphan historical Attendance/Leave/Payroll records. Inactive/terminated users cannot log in but their history stays intact.

**No leave-balance field on this model — by design.** Balance is computed (Section 7.3). Storing it would create two sources of truth that can drift.

### 4.2 Attendance

One document = one employee's one calendar day.

```js
{
  employee: ObjectId,  // ref 'User', required
  date:     String,    // required, 'YYYY-MM-DD' — normalized calendar day (see below)
  clockIn:  Date,      // timestamp
  clockOut: Date,      // timestamp
  status:   { type: String, enum: ['present', 'half-day', 'on-leave'], default: 'present' },
  createdAt, updatedAt
}

// REQUIRED index:
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
```

**v2 changes:**
- `date` is a `YYYY-MM-DD` **string**, computed from one configured timezone (`APP_TIMEZONE` in config, default `Asia/Karachi`). Never derive "today" from raw server time — hosted servers run UTC and will produce wrong-day records near midnight PKT.
- **Unique compound index on `(employee, date)`** makes double clock-in structurally impossible at the database level, not just via validation.
- `'absent'` removed from the status enum. Absence is a *derived fact* (Section 7.2), not a stored record — no process exists that would write absent records, so storing the state was dead logic.
- When a Leave is approved, the system creates/updates Attendance docs with `status: 'on-leave'` for each date in the range, so Attendance always reflects the full picture without manual double-entry.

### 4.3 Leave

```js
{
  employee:     ObjectId,  // ref 'User', required
  leaveType:    { type: String, enum: ['casual', 'sick', 'annual'], required: true },
  startDate:    Date,      // required
  endDate:      Date,      // required
  numberOfDays: Number,    // computed inclusive of both endpoints
  reason:       String,    // required
  status:       { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  aiRecommendation: {
    recommendation: String,  // 'Approve' | 'Flag' | null
    reasoning:      String
  },
  reviewedBy:   ObjectId,  // ref 'User' (HR Admin), set on decision
  reviewedAt:   Date,
  createdAt, updatedAt
}
```

### 4.4 Announcement

```js
{
  title:     String,    // required
  message:   String,    // required
  createdBy: ObjectId,  // ref 'User' (HR Admin), required
  createdAt, updatedAt
}
```

### 4.5 Payroll

One stored payslip per employee per month. Stored (not recalculated on view) so past payslips are a permanent, auditable snapshot — money records must not change retroactively when underlying data changes.

```js
{
  employee:       ObjectId,  // ref 'User', required
  month:          Number,    // 1–12
  year:           Number,
  baseSalary:     Number,
  unpaidLeaveDays:Number,    // computed absent days (Section 7.2)
  deduction:      Number,
  netSalary:      Number,
  generatedBy:    ObjectId,  // ref 'User' (HR Admin)
  generatedAt:    Date
}

// Recommended index (prevents duplicate payslips for the same month):
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });
```

### 4.6 AuditLog

```js
{
  user:       ObjectId,  // who performed the action
  action:     String,    // 'EMPLOYEE_UPDATED', 'LEAVE_DECISION', 'PAYROLL_GENERATED', ...
  targetType: String,    // 'User' | 'Leave' | 'Payroll' | ...
  targetId:   ObjectId,
  details:    Object,    // e.g. { from: 'pending', to: 'approved' }
  timestamp:  Date
}
```

## 5. Authentication & Authorization

Two-token flow: short-lived **access token** (~15 min, contains `{ id, role }`) attached as `Authorization: Bearer <token>` on every request; longer-lived **refresh token** (~7 days) used only to obtain new tokens.

Flow:
1. HR Admin creates an employee account (`POST /api/auth/register`); password bcrypt-hashed before storage.
2. User logs in (`POST /api/auth/login`).
3. Server verifies hash → issues access token + refresh token; refresh token's **hash** is stored on the User document.
4. On access-token expiry, client calls `POST /api/auth/refresh-token`; server validates against stored hash, issues a **new pair** (rotation — old refresh token is invalidated the moment a new one is issued).
5. Logout clears the stored refresh token hash → immediate invalidation.

Middleware:
- `verifyToken` — verifies JWT from the Authorization header, attaches `{ id, role }` to `req.user`; 401 on missing/invalid/expired.
- `authorize(...roles)` — 403 if `req.user.role` isn't in the allowed list. On every HR-Admin-only route.
- `ownerOrAdmin` — allows if `req.user.id` matches the resource owner OR role is `hr_admin`.

## 6. API Endpoints

All routes prefixed `/api`. Every response uses the Section 11 envelope.

### 6.1 Auth
| Method | Route | Access | Description |
|---|---|---|---|
| POST | /auth/register | HR Admin only | Create employee account (onboarding) |
| POST | /auth/login | Public | Login → access + refresh tokens |
| POST | /auth/refresh-token | Public (valid refresh token) | Rotate tokens |
| POST | /auth/logout | Authenticated | Invalidate current refresh token |

### 6.2 Employees
| Method | Route | Access | Description |
|---|---|---|---|
| GET | /employees | HR Admin only | List all employees |
| GET | /employees/me | Authenticated | Own profile |
| GET | /employees/:id | HR Admin only | Specific employee's profile |
| PUT | /employees/:id | HR Admin only | Update employee details |
| PUT | /employees/me | Authenticated | Update own limited fields (e.g. phone) |
| DELETE | /employees/:id | HR Admin only | Soft delete (mark inactive/terminated) |

### 6.3 Attendance
| Method | Route | Access | Description |
|---|---|---|---|
| POST | /attendance/clock-in | Employee (self) | Clock in for today (normalized date) |
| POST | /attendance/clock-out | Employee (self) | Clock out for today |
| GET | /attendance/me | Employee (self) | Own attendance history |
| GET | /attendance/:employeeId | HR Admin only | One employee's attendance |
| GET | /attendance | HR Admin only | All records (date-range query params) |

### 6.4 Leave
| Method | Route | Access | Description |
|---|---|---|---|
| POST | /leaves | Employee (self) | Submit request (triggers AI recommendation) |
| GET | /leaves/me | Employee (self) | Own leave requests |
| GET | /leaves | HR Admin only | All requests (filterable by status) |
| GET | /leaves/:id | Owner or HR Admin | Single request detail |
| PUT | /leaves/:id/decision | HR Admin only | Approve/reject |
| GET | /leaves/balance/me | Employee (self) | **(v2)** Own computed balance per leave type |

*(The balance endpoint is new in v2 — since balance is computed, the frontend needs a way to display it. Trivial controller over the Section 7.3 function.)*

### 6.5 Announcements
| Method | Route | Access | Description |
|---|---|---|---|
| POST | /announcements | HR Admin only | Create |
| GET | /announcements | Authenticated | List all |
| PUT | /announcements/:id | HR Admin only | Edit |
| DELETE | /announcements/:id | HR Admin only | Delete |

### 6.6 Payroll
| Method | Route | Access | Description |
|---|---|---|---|
| POST | /payroll/generate | HR Admin only | Generate payslip for employee + month/year |
| GET | /payroll/:employeeId | Owner or HR Admin | Payslip history |
| GET | /payroll/:id/download | Owner or HR Admin | Download payslip PDF |

### 6.7 Health
| Method | Route | Access | Description |
|---|---|---|---|
| GET | /health | Public | `{ status: "ok" }` |

## 7. Business Logic

### 7.1 Leave Approval Workflow

1. Employee submits leave (type, dates, reason).
2. Backend computes `numberOfDays` (inclusive of both endpoints — known simplification: weekends not excluded).
3. Backend computes remaining balance for that type this year (Section 7.3). Reject with 400 if `numberOfDays > remaining balance`.
4. Backend gathers team-calendar context: count of other employees with **approved** leave overlapping the requested range.
5. Backend calls the AI service (Section 8); stores recommendation + reasoning on the Leave doc. Status stays `pending`. **If the AI call fails, the leave is still created with `aiRecommendation: null` — the hint is a bonus, never a dependency.**
6. HR Admin sees pending request + AI recommendation on the dashboard.
7. HR Admin calls `PUT /leaves/:id/decision` with `approved` or `rejected`. Only `pending` requests can be decided (400 otherwise). An employee can never decide their own request (enforced even if they were an admin — defense in depth optional, role check required).
8. **On approval:** Attendance docs for each date in the range are created/updated with `status: 'on-leave'`. No balance mutation happens — balance is computed, so approval *inherently* reduces it (v2 fix).
9. **On rejection:** nothing changes beyond status/reviewedBy/reviewedAt.
10. AuditLog entry written either way.

### 7.2 Payroll Calculation (v2 — corrected)

```
workingDays      = all calendar dates in (month, year), from the 1st to the last day
                   (or up to today if the month is current)
absentDays       = count of workingDays where:
                     - date >= employee.joiningDate
                     - no Attendance record exists for (employee, date)
                     - AND no approved Leave covers that date
perDayRate       = baseSalary / 30
deduction        = perDayRate * absentDays
netSalary        = baseSalary - deduction
```

Implement `computeAbsentDays(employeeId, month, year)` as a **pure, exported service function** — it is the single most important unit-test target in the project.

**Why v1 was wrong:** v1 counted Attendance records with `status: 'absent'`, but no code path ever creates such records — a no-show employee simply has *no record*. The query would return 0 forever and deduction would silently never apply. Absence must be derived from the *gap* between expected days and recorded days.

Known simplifications (deliberate, state plainly if asked): `/30` regardless of month length; weekends/holidays counted as working days; no tax/statutory/bonus logic (country-specific, high risk of being confidently wrong — a transparent simple calculation was chosen over a risky incomplete "real" one).

### 7.3 Leave Balance & Policy (v2 — computed, never stored)

```js
// config/leavePolicy.js
const LEAVE_POLICY = { casual: 10, sick: 8, annual: 14 }; // days/year — placeholder, confirm with FreshShifts
```

```
remainingBalance(employee, leaveType, year) =
  LEAVE_POLICY[leaveType]
  − sum(numberOfDays of that employee's APPROVED leaves of that type in that year)
```

Single source of truth = the Leave collection itself. No stored counter to drift out of sync. Implement as a pure service function; used by the submission check (7.1 step 3), the AI context (Section 8), and `GET /leaves/balance/me`.

## 8. AI Leave Assistant

Decision-support only — never decides, never auto-approves. Internal service call from the Leave controller, **not** a public endpoint.

```js
// services/aiLeaveService.js
async function getLeaveRecommendation(leaveData) {
  const prompt = buildPrompt(leaveData);
  const response = await callLLM(prompt);   // Gemini API
  return parseRecommendation(response);      // → { recommendation, reasoning }
}
```

Prompt inputs: employee name, leave type, dates, reason, used vs allowed days (computed via 7.3), count of teammates already approved-off in the window. Ask for "Approve" or "Flag" + one-sentence reason, under 20 words.

Hard requirements:
- Wrap in try/catch with a timeout (e.g. 10s). On any failure → return `null`, leave creation proceeds. A leave request must never fail because the AI was unavailable.
- `AI_API_KEY` lives in `.env` only.

## 9. Security Implementation

| Measure | Detail |
|---|---|
| Password hashing | bcrypt, min 10 salt rounds |
| Tokens | JWT access ~15m + refresh ~7d, rotation on every refresh |
| RBAC | `authorize(...roles)` on every protected route |
| Input validation | Joi schema on every request body; reject 400 before touching the DB |
| NoSQL injection | express-mongo-sanitize globally |
| Rate limiting | express-rate-limit on /auth/login and /auth/refresh-token (e.g. 10 per 15 min per IP) |
| Headers | helmet globally |
| CORS | Restricted to known frontend origin — never `*` |
| Secrets | .env (git-ignored); only .env.example committed |
| Error responses | Never leak stack traces or internals |
| Audit logging | Every sensitive action writes an AuditLog entry |

## 10. Validation (representative sample)

```js
const leaveRequestSchema = Joi.object({
  leaveType: Joi.string().valid('casual', 'sick', 'annual').required(),
  startDate: Joi.date().required(),
  endDate:   Joi.date().min(Joi.ref('startDate')).required(),
  reason:    Joi.string().min(5).max(300).required()
});
```

Same pattern (required fields, types, enums, length limits) on every endpoint.

## 11. API Response Envelope

```js
// Success
{ "success": true, "data": { ... }, "message": "optional" }
// Error
{ "success": false, "error": { "message": "Human-readable", "code": "OPTIONAL_CODE" } }
```

## 12. Error Handling

One centralized error middleware, registered last. Maps error types (Joi validation, JWT errors, CastError/not-found, duplicates, unknown) to correct status codes (400/401/403/404/409/500) in one place. Controllers stay thin — throw or `next(err)`, never format errors inline.

## 13. Testing Plan (~20–24 tests, mongodb-memory-server)

- **Auth (4–5):** register succeeds as HR Admin / 403 as Employee; login success; login wrong-password fails; refresh rotates correctly; expired/invalid access token → 401.
- **RBAC (2–3):** Employee blocked (403) from admin route; HR Admin passes; unauthenticated → 401.
- **Employees (3–4):** admin CRUD works; employee reads own profile, cannot read another's.
- **Attendance (3–4):** clock in/out works; **second clock-in same day → 409 (unique index)**; employee can't view someone else's records.
- **Leave (5–6):** submit works; AI failure still creates request; **submit exceeding computed balance → 400**; approval creates on-leave attendance records and reduces computed balance; rejection changes nothing; employee can't decide own request.
- **Payroll (3–4):** **`computeAbsentDays` returns correct count for a hand-built scenario (some present days, some approved-leave days, some gaps)**; generated payslip math matches manual calculation; employee can download own payslip, not another's.

Bold items are v2 additions — they directly test the corrected logic and are the strongest tests in the suite.

## 14. Folder Structure

```
/server
  /config        → db, env, leavePolicy.js, timezone constant
  /models        → User, Attendance, Leave, Announcement, Payroll, AuditLog
  /controllers   → thin request handlers per module
  /routes        → route definitions
  /middlewares   → verifyToken, authorize, ownerOrAdmin, validate, errorHandler, rateLimiter
  /validators    → Joi schemas per module
  /services      → aiLeaveService, payslipPdfService, leaveBalanceService, payrollService, auditService
  /tests         → Jest + Supertest, grouped by module
  /utils         → date normalization helper, response helpers
  seed.js        → v2: bootstrap seeding (Section 16)
  app.js         → express app (exported for Supertest)
  server.js      → listen()
```

## 15. Environment Variables

```
PORT
MONGO_URI
JWT_ACCESS_SECRET
JWT_REFRESH_SECRET
JWT_ACCESS_EXPIRY      # 15m
JWT_REFRESH_EXPIRY     # 7d
AI_API_KEY
AI_API_PROVIDER        # 'gemini'
APP_TIMEZONE           # Asia/Karachi (v2 — attendance date normalization)
CORS_ORIGIN
NODE_ENV
```

## 16. Seeding & Bootstrap (v2 — new)

`/auth/register` is HR-Admin-only and there is no public signup — correct design, but it makes the first HR Admin impossible to create. `seed.js` resolves this:

- Run manually via `npm run seed` (never auto-runs on server start).
- If the Users collection is empty: create **1 HR Admin + 3 demo employees** (with departments, salaries, joining dates) so the deployed demo is immediately usable.
- If users exist: exit without changes (idempotent, safe to re-run).
- Demo credentials go in the README — they are seeded demo accounts, not secrets.

## 17. Deployment Notes

- Render / Railway or similar Node host.
- All Section 15 variables set in the host dashboard — never committed.
- After deploy: confirm `GET /api/health` → 200 before anything else, then run the seed, then point the frontend at the deployed base URL.

## 18. Backend Definition of Done

- [ ] All 6 models implemented exactly as Section 4 (including both unique indexes)
- [ ] All Section 6 endpoints implemented and verified in Postman
- [ ] Leave workflow fully working: balance check on submit, AI recommendation with graceful failure, on-leave attendance creation on approval
- [ ] `computeAbsentDays` verified against a hand-calculated scenario
- [ ] Payroll calculation verified against a manual example
- [ ] All Section 9 security measures in place
- [ ] ~20+ Jest/Supertest tests passing
- [ ] Consistent response envelope everywhere
- [ ] `.env.example` committed; real `.env` git-ignored
- [ ] `npm run seed` creates working demo accounts
- [ ] Deployed, `/api/health` confirmed, demo credentials documented in README
