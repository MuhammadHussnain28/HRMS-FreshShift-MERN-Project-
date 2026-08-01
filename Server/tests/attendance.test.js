import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';

// Set JWT secrets for test environment
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';

const adminData = {
  name: 'HR Admin',
  email: 'hradmin@test.com',
  password: 'Admin@123',
  role: 'hr_admin',
  department: 'HR',
  monthlySalary: 100000,
};

const employeeData = {
  name: 'Test Employee',
  email: 'employee@test.com',
  password: 'Employee@123',
  role: 'employee',
  department: 'Engineering',
  monthlySalary: 60000,
};

let adminToken;
let employeeToken;
let employeeId;
let adminId;

const setupUsersAndTokens = async () => {
  // Create admin directly in DB
  const admin = await User.create(adminData);
  adminId = admin._id.toString();

  // Login as admin
  const adminLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: adminData.email, password: adminData.password });
  adminToken = adminLogin.body.data.accessToken;

  // Register employee via admin
  const regRes = await request(app)
    .post('/api/auth/register')
    .set('Authorization', `Bearer ${adminToken}`)
    .send(employeeData);
  employeeId = regRes.body.data._id;

  // Login as employee
  const empLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: employeeData.email, password: employeeData.password });
  employeeToken = empLogin.body.data.accessToken;
};

describe('Attendance Endpoints', () => {
  describe('POST /api/attendance/clock-in', () => {
    it('should create a correct normalized date record on clock-in', async () => {
      await setupUsersAndTokens();

      const res = await request(app)
        .post('/api/attendance/clock-in')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('date');
      expect(res.body.data.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(res.body.data).toHaveProperty('clockIn');
      expect(res.body.data.employee).toBe(employeeId);
    });

    it('should return 409 on second clock-in the same day', async () => {
      await setupUsersAndTokens();

      // First clock-in
      await request(app)
        .post('/api/attendance/clock-in')
        .set('Authorization', `Bearer ${employeeToken}`);

      // Second clock-in same day
      const res = await request(app)
        .post('/api/attendance/clock-in')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/attendance/clock-out', () => {
    it('should set clockOut timestamp on clock-out', async () => {
      await setupUsersAndTokens();

      // Clock in first
      await request(app)
        .post('/api/attendance/clock-in')
        .set('Authorization', `Bearer ${employeeToken}`);

      // Clock out
      const res = await request(app)
        .post('/api/attendance/clock-out')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('clockOut');
      expect(res.body.data.clockOut).not.toBeNull();
    });
  });

  describe('GET /api/attendance/:employeeId', () => {
    it('should return 403 for employee accessing another user records, and 200 for admin', async () => {
      await setupUsersAndTokens();

      // Clock in as employee so there is data
      await request(app)
        .post('/api/attendance/clock-in')
        .set('Authorization', `Bearer ${employeeToken}`);

      // Employee tries to access admin's attendance → 403
      const empRes = await request(app)
        .get(`/api/attendance/${adminId}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(empRes.status).toBe(403);
      expect(empRes.body.success).toBe(false);

      // Admin accesses employee's attendance → 200
      const adminRes = await request(app)
        .get(`/api/attendance/${employeeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(adminRes.status).toBe(200);
      expect(adminRes.body.success).toBe(true);
      expect(Array.isArray(adminRes.body.data)).toBe(true);
      expect(adminRes.body.data.length).toBe(1);
    });
  });
});
