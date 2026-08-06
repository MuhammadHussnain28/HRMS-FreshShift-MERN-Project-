# FreshShifts HRMS — Full Stack MERN Application

A full-featured, enterprise-grade Human Resource Management System (HRMS) built with the MERN stack (MongoDB, Express.js, React, Node.js). Designed for modern companies to manage employees, attendance, leave requests with AI recommendations, payroll calculation with PDF generation, and company broadcasts.

---

## 🔑 Demo Credentials

Use these seeded credentials to test both roles on the live app or local instance:

| Role | Email | Password | Allowed Access |
|---|---|---|---|
| **HR Administrator** | `admin@freshshifts.com` | `Admin@123` | Full Admin Operations (`/dashboard`, `/admin/*`) |
| **Employee** | `ali.hassan@freshshifts.com` | `Employee@123` | Employee Workspace (`/dashboard`, `/attendance`, `/leaves`, `/payroll`) |
| **Employee** | `sara.ahmed@freshshifts.com` | `Employee@123` | Employee Workspace |
| **Employee** | `usman.khan@freshshifts.com` | `Employee@123` | Employee Workspace |

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Redux Toolkit, Tailwind CSS v4, Lucide Icons, Recharts, Framer Motion |
| **Backend** | Node.js 20 (ES Modules), Express.js, MongoDB Atlas + Mongoose ODM |
| **Authentication** | JWT (Access + Refresh Token Rotation in Redux & HTTP interceptor) |
| **AI Integration** | Google Gemini 1.5 Pro (Automated Leave Recommendations) |
| **PDF Generation** | PDFKit (Direct Blob Download Stream) |
| **Security & Logging** | Helmet, CORS, Rate-Limiting, NoSQL Sanitization, Winston + Morgan |
| **Testing** | Jest, Supertest, mongodb-memory-server |

---

## ✨ Features Overview

### 1. 🛡️ Authentication & Role-Based Access Control (RBAC)
- Token refresh flow: Silent refresh on 401 via Axios interceptors.
- Route guards: `ProtectedRoute`, `PublicRoute`, and `RoleRoute`.

### 2. 👥 Employee Management
- Complete onboarding modal flow with automatic password generator.
- Soft-delete termination state preserving historical records.

### 3. ⏱️ Attendance Engine
- Timezone-aware clock-in / clock-out card with live shift duration timer.
- Duplicate clock-in prevention per calendar day.

### 4. 🌴 Leave System & AI Assistant
- Interactive leave application with dynamic balance tracking.
- Google Gemini AI recommendations analyzing attendance history and leave overlapping.
- HR decision queue with animated card exit transitions.

### 5. 💵 Payroll Engine & Payslip PDFs
- Dynamic absent-day deduction calculation (joining-date aware).
- Direct PDF binary stream download for payslips.
- Duplicate payroll generation conflict prevention (`409 Conflict`).

### 6. 📢 Company Newsroom / Announcements
- Executive newsroom feed with soft fade-in item animations.
- Admin CRUD permissions with full accessibility audit compliance (`aria-labels`).

---

## 📁 Repository Structure

```
HRMS-FreshShift-MERN-Project-/
├── Client/                  # Vite + React Frontend
│   ├── src/
│   │   ├── components/      # UI components (attendance, layout, shared, ui)
│   │   ├── pages/           # Screen pages (auth, dashboard, employees, leaves, payroll, announcements)
│   │   ├── redux/           # Redux Toolkit store & slices
│   │   └── lib/             # Axios instance & Zod validators
│   └── package.json
└── Server/                  # Node.js + Express Backend
    ├── config/              # Database, timezone, policies
    ├── controllers/         # Thin HTTP request handlers
    ├── models/              # Mongoose schemas
    ├── routes/              # Express API endpoints
    ├── services/            # Core business logic & AI integration
    ├── seed.js              # Database seeder script
    └── package.json
```

---

## 🚀 Local Development Setup

### 1. Clone the repository
```bash
git clone https://github.com/MuhammadHussnain28/HRMS-FreshShift-MERN-Project-.git
cd HRMS-FreshShift-MERN-Project-
```

### 2. Configure Backend (`Server`)
```bash
cd Server
npm install
cp .env.example .env
```
Fill `.env` with your MongoDB URI and Gemini API Key:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/hrms
JWT_ACCESS_SECRET=your_access_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret_min_32_chars
AI_API_KEY=your_google_gemini_api_key
CORS_ORIGIN=http://localhost:5173
```
Seed database & start backend:
```bash
npm run seed
npm start
```

### 3. Configure Frontend (`Client`)
Open a new terminal tab:
```bash
cd Client
npm install
cp .env.example .env
```
Ensure `VITE_API_BASE_URL` matches backend:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```
Start development server:
```bash
npm run dev
```

---

## 🧪 Testing

To run the backend integration test suite (uses in-memory MongoDB):
```bash
cd Server
npm test
```

---

## 📄 License
This application is developed as part of the FreshShifts HRMS capstone project.
