# Product Requirement Document (PRD)
## FreshShifts HRMS — Next-Gen Enterprise Human Resource Management System

**Document Version:** 1.0.0 (Baseline Specification)  
**Status:** Approved for Development  
**Target Audience:** Engineering Team, Product Leadership, Quality Assurance  
**Authors:** Product Management & System Architecture Team  

---

## 1. Executive Summary & Vision

### 1.1 Product Vision
**FreshShifts HRMS** is specified as an enterprise-grade, full-stack Human Resource Management System designed to streamline workplace operations for small-to-medium enterprises (SMEs). The platform shall integrate modern employee self-service tools with AI-assisted administrative workflows, delivering automated leave recommendations, automated payroll processing with joining-date guards, timezone-aware attendance tracking, and executive communications.

### 1.2 Core Product Objectives
- **Operational Automation:** Reduce HR review overhead for leave applications by integrating automated contextual recommendations (attendance patterns, team calendar overlaps) via Google Gemini AI.
- **Financial & Payroll Precision:** Eliminate payroll calculation discrepancies through automated absence detection, joining-date validation, and server-side PDF payslip generation.
- **Security & Session Continuity:** Enforce robust security standards using JWT access/refresh token rotation, silent token refresh queues via HTTP interceptors, role-based access control (RBAC), and persistent audit logging.
- **UI/UX Restraint & Accessibility:** Enforce a locked design system (Navy `#0F172A`, Teal `#0284C7`, Sky Blue `#E0F2FE`, Beige `#F8FAFC`), DM Sans typography, bounded animations, and WCAG 2.1 Level AA accessibility compliance.

---

## 2. Problem Statement & Key Performance Indicators (KPIs)

### 2.1 Problem Statement
Small-to-medium organizations struggle with three primary administrative inefficiencies:
1. **Manual Leave Evaluation Overhead:** HR administrators waste hours cross-referencing paper leave requests against team calendars and attendance logs.
2. **Payroll Calculation Errors:** Spreadsheet-based payroll calculations lead to missing joining-date boundary checks, inaccurate unpaid absence deductions, and delayed payslip distribution.
3. **Cluttered Software Interfaces:** Over-complicated HR software results in low employee engagement for daily clock-ins and self-service features.

### 2.2 System Success Metrics (Target KPIs)

| Operational Area | Target Metric | Engineering Requirement |
|---|---|---|
| **Leave Decision Velocity** | Sub-2-minute evaluation per request | Instant Gemini AI recommendation badge with confidence scores |
| **Payroll Deduction Accuracy** | 100% calculation accuracy | Server-side `computeAbsentDays` logic with joining-date boundary checks |
| **Daily Clock-In Adoption** | > 95% active employee compliance | Single-click standalone `ClockCard` with live shift timer |
| **Session Persistence** | 0% user-visible session dropouts | Axios HTTP response interceptors handling silent JWT refresh queues |

---

## 3. User Personas & Permission Matrix (RBAC)

### 3.1 Targeted User Personas

#### Persona 1: HR Administrator (Operations Manager)
- **Role:** Full administrative oversight.
- **Responsibilities:** Monitor workforce attendance, evaluate leave applications with AI assistance, run monthly payroll, manage employee accounts, and broadcast executive announcements.

#### Persona 2: Employee (Staff Member)
- **Role:** Self-service end user.
- **Responsibilities:** Record daily attendance, track shift hours, monitor personal leave balances, apply for leaves, download monthly payslips, and view company broadcasts.

### 3.2 System Role-Based Permission Matrix

| Module / Screen | Specified Route | Employee Rights | HR Admin Rights |
|---|---|:---:|:---:|
| **Public Landing & Authentication** | `/`, `/login` | Public Access | Public Access |
| **Employee Workspace Dashboard** | `/dashboard` | View (4 Content Blocks) | Auto-redirect |
| **HR Operations Dashboard** | `/admin/dashboard` | Access Denied (403) | View (5 Content Blocks) |
| **Self Profile View & Edit** | `/profile` | View & Edit Phone | Full View & Edit |
| **Employee Roster Management** | `/admin/employees` | Access Denied (403) | Full CRUD + Modal |
| **Personal Attendance Log** | `/attendance` | Self View | View All |
| **Workforce Attendance Audit** | `/admin/attendance` | Access Denied (403) | Full Audit View |
| **Leave Application & Balance** | `/leaves` | Apply & View Status Only | Apply & View |
| **AI Leave Decision Queue** | `/admin/leaves` | Access Denied (403) | AI Badge + Decision Actions |
| **Personal Payslip History** | `/payroll` | Download PDF | Download PDF |
| **Payroll Generation Engine** | `/admin/payroll` | Access Denied (403) | Generate & Download PDF |
| **Company Announcements Feed** | `/announcements` | Read-Only Feed | Full Admin CRUD |

### 3.3 Data Privacy & Information Scoping Requirements
- **Leave Privacy Specification:** AI recommendation insights, confidence scores, and reasoning text **shall be strictly restricted to HR Admin decision views** (`/admin/leaves`). Employee leave views (`/leaves` and `/dashboard`) **must display status badges only** (`pending`, `approved`, `rejected`) with no AI data exposed.

---

## 4. System Architecture & Component Specifications

```
                             +-------------------------------------------------------+
                             |           Specified Frontend Layer (React + Vite)     |
                             |  - Redux Toolkit (Auth, Employee, Attendance, Leave)   |
                             |  - Tailwind CSS + DM Sans + Lucide Icons              |
                             |  - Axios Interceptor (Silent Refresh Queue)          |
                             +---------------------------+---------------------------+
                                                         |
                                                         | HTTPS / REST API
                                                         v
                             +-------------------------------------------------------+
                             |          Specified Backend Layer (Node.js + Express)  |
                             |  - Middleware: Helmet, CORS, MongoSanitize            |
                             |  - RBAC Guards (verifyToken, authorize)               |
                             |  - Controllers & Business Services Layer              |
                             +------------+----------------------+-------------------+
                                          |                      |
                    Mongoose ORM          |                      | Google Gemini 1.5 Pro
                    Interface             v                      v API Integration
                             +------------+-------+   +----------+-------------------+
                             | MongoDB Atlas Database |   |   Google AI Engine        |
                             |  - Users Collection    |   |  - Attendance Pattern    |
                             |  - Attendances         |   |  - Overlap Analysis      |
                             |  - Leaves              |   |  - Confidence Scoring    |
                             |  - Payrolls            |   +--------------------------+
                             |  - Announcements       |
                             |  - AuditLogs           |
                             +------------------------+
```

---

## 5. Functional Requirements & Technical Specifications

### 5.1 Authentication & Session Management Module
- **Access Token Architecture:** The backend shall issue short-lived JWT access tokens (15-minute expiration) transmitted in API response bodies and stored in Redux memory.
- **Refresh Token Architecture:** The backend shall issue long-lived JWT refresh tokens (7-day expiration) stored securely as hashed strings in the database.
- **Silent Refresh Interceptor Specification:** When an API request returns a `401 Unauthorized` response, the client-side HTTP interceptor must queue pending requests, call `POST /api/auth/refresh-token`, update the Redux access token, and automatically replay the failed requests without user intervention.

### 5.2 Employee Onboarding & Account Management Module
- **Grouped Onboarding Modal:** The HR Admin interface shall provide a single modal workflow grouping Personal Identity, Organizational Placement, and Initial Compensation.
- **Crypto Password Generator:** The onboarding interface must include an automated generator producing secure 12-character random passwords.
- **Credentials Receipt Dialog:** Upon successful employee creation, the system shall render a one-time credential confirmation dialog featuring a one-click copy function.
- **Soft-Delete (Termination) Rule:** Deactivating an employee shall set `employmentStatus: 'terminated'` to preserve audit history while revoking authentication rights.

### 5.3 Attendance Management Module
- **Timezone Standardization:** All server and client date operations shall execute in `APP_TIMEZONE` (`Asia/Karachi`) to ensure consistent daily boundary evaluation.
- **Standalone Clock Card Specification:** The employee interface shall render a `ClockCard` displaying shift status, real-time elapsed timer (`HH:MM:SS`), clock-in timestamp, and clock-out action.
- **Duplicate Protection:** The backend shall enforce a unique index constraint preventing duplicate clock-ins for the same employee on the same calendar date.

### 5.4 Leave Management & AI Decision Engine Module
- **Leave Quota Policies:** The system shall enforce default annual limits: Casual (10 days), Sick (8 days), and Annual (14 days).
- **Client-Side Balance Validation:** The leave submission form must validate requested days against remaining balance before submission.
- **AI Recommendation Engine Requirement:** When an HR Admin views a pending leave request, the backend shall query Google Gemini 1.5 Pro with the employee's 30-day attendance history and concurrent department leaves. The AI service must return:
  - `recommendation`: `"RECOMMENDED"` | `"NOT_RECOMMENDED"` | `"NEUTRAL"`
  - `confidenceScore`: Integer (0–100%)
  - `reasoning`: Concise 2-sentence rationale
  - `Timeout Fallback`: If Gemini API response exceeds 15 seconds, the backend shall return a neutral fallback badge without crashing.

### 5.5 Payroll Processing Engine & PDF Generation Module
- **Joining-Date Validation Specification:** The payroll generation service must validate the target pay period (`month`, `year`) against the employee's `joiningDate`. If `target_period < joining_period`, the backend shall reject the request with a `400 Bad Request` error.
- **Absence & Deduction Calculation Formula:**
  $$\text{Daily Rate} = \frac{\text{Base Monthly Salary}}{30}$$
  $$\text{Unpaid Days} = \text{Absent Days (excluding approved leaves and pre-joining dates)}$$
  $$\text{Salary Deduction} = \text{Daily Rate} \times \text{Unpaid Days}$$
  $$\text{Final Net Salary} = \text{Base Monthly Salary} - \text{Salary Deduction}$$
- **Duplicate Prevention:** Enforce a compound unique index `(employee, month, year)`. Re-generation attempts shall return a `409 Conflict` status with a link to the existing payslip.
- **Server-Side PDF Stream:** Payslip PDFs shall be generated dynamically via PDFKit on the backend and streamed to the client as binary blobs (`responseType: 'blob'`).

### 5.6 Executive Announcements Module
- **Broadcast Feed Specification:** Render announcement cards in reverse chronological order.
- **Accessibility Requirement:** All interactive icon buttons (edit, delete, modal close) must include explicit `aria-label` attributes compliant with WCAG 2.1 AA standards.

---

## 6. Database Schema Specifications (Mongoose Models)

### 6.1 User Model
```javascript
{
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ['employee', 'hr_admin'], default: 'employee' },
  department: { type: String, trim: true },
  designation: { type: String, trim: true },
  phone: { type: String, trim: true },
  joiningDate: { type: Date },
  employmentStatus: { type: String, enum: ['active', 'inactive', 'terminated'], default: 'active' },
  monthlySalary: { type: Number },
  refreshTokenHash: { type: String, select: false }
}
```

### 6.2 Attendance Model
```javascript
{
  employee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  clockIn: { type: Date },
  clockOut: { type: Date },
  status: { type: String, enum: ['present', 'absent', 'half_day', 'on_leave'], default: 'present' }
}
```

### 6.3 Leave Model
```javascript
{
  employee: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  leaveType: { type: String, enum: ['casual', 'sick', 'annual'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  numberOfDays: { type: Number, required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  aiRecommendation: {
    recommendation: String,
    confidenceScore: Number,
    reasoning: String
  },
  decidedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  decidedAt: { type: Date }
}
```

---

## 7. UI/UX Design Tokens & Motion Constraints

### 7.1 Locked Design Tokens
- **Typography:** DM Sans (`'DM Sans', ui-sans-serif, system-ui, sans-serif`)
- **Brand Palette:**
  - Primary Navy: `#0F172A` / `#1E293B`
  - Accent Teal: `#0284C7` / `#0369A1`
  - Soft Sky Blue: `#E0F2FE`
  - Neutral Background: `#F8FAFC`
- **Design Constraints:** Zero purple classes, zero background gradients, zero un-themed custom hex values. Target content block density: 3 to 5 blocks per app screen.

### 7.2 Motion Scope Constraints (Framer Motion)
Animation usage shall be **restricted strictly to 5 designated interaction moments**:
1. Route transitions (subtle fade + 8px slide)
2. HR Leave decision card exit (fade + collapse)
3. Clock in/out button state changes
4. Admin Dashboard stat card numerical count-up headers
5. Announcements feed new-item soft fade-in

---

## 8. Deployment & Environment Requirements

### 8.1 Monorepo Vercel Deployment Specification
- **Client Deployment:** Hosted as a static SPA compiled via Vite build pipeline.
- **Server Deployment:** Configured as a Node serverless function (`Server/vercel.json`) utilizing `@vercel/node`.
- **Database Environment:** Hosted on MongoDB Atlas with global IP network access (`0.0.0.0/0`).

---

## 9. Product Acceptance Criteria & Verification Plan

- [ ] **AC-1 (Auth):** User can log in with valid credentials; invalid attempts display inline field errors.
- [ ] **AC-2 (Session):** Reloading the browser preserves the active session without forcing re-login.
- [ ] **AC-3 (Attendance):** Employee can clock in/out; duplicate same-day clock-in triggers a 400 error.
- [ ] **AC-4 (Leave Application):** Employee leave views display status badges only, with zero AI insights visible.
- [ ] **AC-5 (AI Assistance):** HR Admin leave view renders Gemini AI recommendation badge with confidence score and fallback badge on timeout.
- [ ] **AC-6 (Payroll Guard):** Payroll generation requests prior to employee joining date return a 400 error.
- [ ] **AC-7 (Payroll Download):** Generated payslips produce downloadable PDF blobs.
- [ ] **AC-8 (RBAC Enforcement):** Direct navigation to `/admin/*` routes by an employee redirects to `/unauthorized`.
