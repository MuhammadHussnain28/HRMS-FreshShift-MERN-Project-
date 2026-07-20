# HRMS Project Rules — Always Active

## 0. Source of Truth
- `BACKEND_SPEC.md` in the project root is the single source of truth. Build exactly what it says — nothing more, nothing less.
- If anything is ambiguous or two sections seem to conflict, STOP and ask the user. Never guess, never silently invent features.
- Never add features, endpoints, fields, or packages that are not in the spec without explicit user approval.

## 1. Secrets & Credentials (NON-NEGOTIABLE)
- NEVER read, open, print, echo, or log the contents of `.env`.
- NEVER hardcode any secret, API key, token, or connection string in code, tests, comments, or artifacts. Always use `process.env.*`.
- Only `.env.example` (variable names, no values) may be created or committed.
- Never commit `.env` or `node_modules`. Respect `.gitignore` at all times.

## 2. Security Rules (apply to every endpoint, every time)
- Every request body is validated with a Joi schema BEFORE any database access. Invalid input → 400.
- Every protected route uses `verifyToken`. Every role-restricted route uses `authorize(...)`. Owner-only resources use `ownerOrAdmin`.
- Passwords are always bcrypt-hashed (min 10 salt rounds). Never store or log plain passwords.
- All errors flow to the single centralized error handler. Never send stack traces or internal details to the client. Never use scattered inline error formatting.
- `helmet`, `cors` (origin from env, never `*`), and `express-mongo-sanitize` are applied globally in app.js.
- Rate limiting on `/auth/login` and `/auth/refresh-token`.
- Every sensitive action (employee edit/delete, leave decision, payroll generation) writes an AuditLog entry.

## 3. Architecture Rules
- Follow the folder structure in BACKEND_SPEC.md Section 14 exactly.
- Controllers stay THIN: parse request → call service/model → send response. Business logic lives in `/services`.
- Every response uses the standard envelope from spec Section 11: `{ success, data, message }` or `{ success: false, error: { message, code } }`.
- `computeAbsentDays` and `remainingLeaveBalance` must be pure, exported functions in `/services` — no Express objects inside them.
- Leave policy numbers and timezone live in `/config` constants (`leavePolicy.js`, APP_TIMEZONE). Never hardcode them inline.
- Attendance `date` is always a `YYYY-MM-DD` string derived from APP_TIMEZONE. Never derive "today" from raw server time.
- `app.js` exports the Express app WITHOUT calling listen(). Only `server.js` calls listen(). (Required for Supertest.)

## 4. Code Style
- ES Modules (`import`/`export`) consistently across the whole backend. Set `"type": "module"` in package.json. Never mix `require` and `import`.
- `app.js` uses `export default app`; `server.js` imports it. All local imports include the `.js` file extension (required in ESM).
- Jest must be configured to run ESM correctly (e.g. `cross-env NODE_OPTIONS=--experimental-vm-modules jest` in the test script, or an equivalent working setup). `npm test` passing in ESM mode is part of Phase 1's definition of done — do not fall back to CommonJS to make tests pass.
- async/await everywhere. Route handlers wrap errors to `next(err)` (use an asyncHandler wrapper).
- Descriptive names. No dead code, no commented-out blocks, no TODOs left behind.
- Comments only where logic is non-obvious (e.g. inside computeAbsentDays).

## 5. Testing Rules
- Tests use Jest + Supertest + mongodb-memory-server ONLY. Tests must never touch a real database or real .env values.
- A phase is NOT complete until `npm test` passes with zero failures.
- NEVER weaken, skip, delete, or comment out a failing test just to make the suite pass. Fix the code, not the test. If a test itself is wrong, explain why to the user first.
- New endpoints in a phase must have their tests written in the same phase.

## 6. Git Rules
- Conventional commit messages only: `feat:`, `fix:`, `test:`, `chore:`, `docs:`.
- Never run `git push`, `git reset --hard`, `rm -rf`, or any destructive command without explicit user approval.
- Do not modify files outside this project folder.

## 7. Process Rules
- Always produce an Implementation Plan and wait for user review before writing code for a task.
- After implementing, run `npm test` and report actual results honestly. Never claim tests pass without running them.
- If the same mistake is corrected twice, propose an addition to this rules file.

## 8. AI Leave Assistant Rules
- The AI call is an internal service, never a public endpoint.
- Wrap in try/catch with a ~10s timeout. On ANY failure, return null and let the leave request succeed with `aiRecommendation: null`. A leave request must never fail because the AI was unavailable.
- AI key comes from `process.env.AI_API_KEY` only.
