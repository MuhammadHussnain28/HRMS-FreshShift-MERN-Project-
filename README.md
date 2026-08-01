# FreshShifts HRMS — Backend API

A full-featured Human Resource Management System (HRMS) backend built with Node.js, Express, and MongoDB. Designed for small-to-medium companies to manage employees, attendance, leave requests, payroll, and announcements — with AI-powered leave recommendations via Google Gemini.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 (ES Modules) |
| Framework | Express.js |
| Database | MongoDB + Mongoose ODM |
| Authentication | JWT (Access + Refresh tokens with rotation) |
| Validation | Joi |
| AI Integration | Google Gemini (leave recommendations) |
| PDF Generation | PDFKit |
| Security | Helmet, CORS, express-mongo-sanitize, express-rate-limit, bcryptjs |
| Logging | Winston + Morgan |
| Testing | Jest, Supertest, mongodb-memory-server |
| CI/CD | GitHub Actions |

---

## Features

- **Authentication & Authorization** — JWT-based auth with access/refresh token rotation, role-based access control (HR Admin / Employee)
- **Employee Management** — Full CRUD with soft-delete (termination), self-profile editing, admin-only operations
- **Attendance Tracking** — Clock-in/out with timezone-aware date handling, duplicate prevention, attendance history
- **Leave Management** — Submit, approve/reject leave requests with automatic balance tracking, AI-powered approval recommendations via Google Gemini
- **Payroll Generation** — Dynamic absent-day computation, automatic salary deduction math, downloadable PDF payslips
- **Announcements** — HR-only CRUD, visible to all authenticated users
- **Audit Logging** — Every sensitive action (employee edits, leave decisions, payroll generation) is permanently logged
- **Security Hardened** — Helmet headers, CORS restrictions, NoSQL injection prevention, rate limiting, centralized error handling (no stack trace leaks)

---

## Folder Structure

```
Server/
├── config/          # Environment loader, DB connection, leave policy, timezone
├── controllers/     # Thin route handlers (parse → call service → respond)
├── middlewares/     # verifyToken, authorize, validate, errorHandler, rateLimiter, ownerOrAdmin
├── models/          # Mongoose schemas (User, Attendance, Leave, Payroll, Announcement, AuditLog)
├── routes/          # Express routers (auth, employee, attendance, leave, payroll, announcement, health)
├── services/        # Business logic (auth, employee, attendance, leave, payroll, payslipPdf, audit, AI)
├── utils/           # Helpers (response envelope, asyncHandler, logger, dateUtils)
├── validators/      # Joi schemas for every request body
├── tests/           # Jest + Supertest integration tests
├── seed.js          # Database seeder with demo accounts
├── app.js           # Express app setup (exports app without listen)
├── server.js        # Entry point (calls listen)
└── package.json
```

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/MuhammadHussnain28/HRMS-FreshShift-MERN-Project-.git
cd HRMS-FreshShift-MERN-Project-
```

### 2. Install dependencies

```bash
cd Server
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in your values:

```
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_ACCESS_SECRET=your-access-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
AI_API_KEY=your-google-gemini-api-key
AI_API_PROVIDER=gemini
APP_TIMEZONE=Asia/Karachi
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
```

### 4. Seed the database

```bash
npm run seed
```

### 5. Start the server

```bash
npm start
```

The server will start at `http://localhost:5000`. Verify by hitting `GET /api/health`.

---

## Demo Credentials

After running `npm run seed`, the following accounts are available:

### HR Admin
| Field | Value |
|-------|-------|
| Email | `admin@freshshifts.com` |
| Password | `Admin@123` |

### Employees
| Name | Email | Password |
|------|-------|----------|
| Ali Hassan | `ali.hassan@freshshifts.com` | `Employee@123` |
| Sara Ahmed | `sara.ahmed@freshshifts.com` | `Employee@123` |
| Usman Khan | `usman.khan@freshshifts.com` | `Employee@123` |

---

## Running Tests

```bash
cd Server
npm test
```

Tests use `mongodb-memory-server` (in-memory database) — no real database or `.env` secrets are needed.

To run with coverage:

```bash
npm test -- --coverage
```

---

## API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/health` | Public | Health check |
| POST | `/api/auth/register` | HR Admin | Register a new employee |
| POST | `/api/auth/login` | Public | Login |
| POST | `/api/auth/refresh-token` | Public | Refresh JWT tokens |
| POST | `/api/auth/logout` | Authenticated | Logout |
| GET | `/api/employees` | HR Admin | List all employees |
| GET | `/api/employees/me` | Authenticated | Get own profile |
| GET | `/api/employees/:id` | HR Admin | Get employee by ID |
| PUT | `/api/employees/me` | Authenticated | Update own profile |
| PUT | `/api/employees/:id` | HR Admin | Update employee |
| DELETE | `/api/employees/:id` | HR Admin | Soft-delete (terminate) employee |
| POST | `/api/attendance/clock-in` | Authenticated | Clock in |
| POST | `/api/attendance/clock-out` | Authenticated | Clock out |
| GET | `/api/attendance/me` | Authenticated | Own attendance history |
| GET | `/api/attendance` | HR Admin | All attendance records |
| GET | `/api/attendance/:employeeId` | HR Admin | Employee attendance |
| POST | `/api/leaves` | Authenticated | Submit leave request |
| GET | `/api/leaves/me` | Authenticated | Own leave history |
| GET | `/api/leaves/balance/me` | Authenticated | Own leave balances |
| GET | `/api/leaves` | HR Admin | All leave requests |
| GET | `/api/leaves/:id` | Owner/Admin | Get leave by ID |
| PUT | `/api/leaves/:id/decision` | HR Admin | Approve/reject leave |
| POST | `/api/payroll/generate` | HR Admin | Generate payroll |
| GET | `/api/payroll/:employeeId` | Owner/Admin | Payroll history |
| GET | `/api/payroll/:id/download` | Owner/Admin | Download payslip PDF |
| POST | `/api/announcements` | HR Admin | Create announcement |
| GET | `/api/announcements` | Authenticated | List announcements |
| PUT | `/api/announcements/:id` | HR Admin | Update announcement |
| DELETE | `/api/announcements/:id` | HR Admin | Delete announcement |

---

## Deployment

See the deployment checklist for Render/Railway setup. Key points:

- Set all environment variables from `.env.example` in your host dashboard
- Confirm `GET /api/health` returns 200 after deploy
- Run `npm run seed` to create demo accounts
- Set `CORS_ORIGIN` to your frontend URL

---

## License

This project is part of the FreshShifts HRMS capstone project.
