import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';

// Set JWT secrets for test environment
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';

const adminData = {
  name: 'Test Admin',
  email: 'admin@test.com',
  password: 'Admin@123',
  role: 'hr_admin',
  department: 'HR',
  designation: 'HR Manager',
  monthlySalary: 100000,
};

const employeeData = {
  name: 'Test Employee',
  email: 'employee@test.com',
  password: 'Employee@123',
  role: 'employee',
  department: 'Engineering',
  designation: 'Developer',
  monthlySalary: 60000,
};

let adminToken;
let employeeToken;
let adminRefreshToken;

// Helper to create an admin user directly in DB and get a token
const createAdminAndLogin = async () => {
  await User.create(adminData);

  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: adminData.email, password: adminData.password });

  adminToken = res.body.data.accessToken;
  adminRefreshToken = res.body.data.refreshToken;
  return res;
};

describe('Auth Endpoints', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new employee when called by HR Admin', async () => {
      await createAdminAndLogin();

      const res = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(employeeData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('email', employeeData.email);
      expect(res.body.data).not.toHaveProperty('password');
      expect(res.body.data).not.toHaveProperty('refreshTokenHash');
    });

    it('should return 403 when an employee tries to register a user', async () => {
      await createAdminAndLogin();

      // Register an employee first
      await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(employeeData);

      // Login as employee
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: employeeData.email, password: employeeData.password });

      employeeToken = loginRes.body.data.accessToken;

      // Try to register as employee
      const res = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          name: 'Another User',
          email: 'another@test.com',
          password: 'Test@123',
          role: 'employee',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and return tokens + user', async () => {
      await User.create(adminData);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: adminData.email, password: adminData.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('refreshToken');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user).toHaveProperty('email', adminData.email);
      expect(res.body.data.user).not.toHaveProperty('password');
      expect(res.body.data.user).not.toHaveProperty('refreshTokenHash');
    });

    it('should return 401 with wrong password', async () => {
      await User.create(adminData);

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: adminData.email, password: 'WrongPassword123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    it('should rotate tokens: new tokens work, old refresh token is invalid', async () => {
      const loginRes = await createAdminAndLogin();
      const oldRefreshToken = loginRes.body.data.refreshToken;

      // Refresh with the old token — should succeed
      const refreshRes = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: oldRefreshToken });

      expect(refreshRes.status).toBe(200);
      expect(refreshRes.body.success).toBe(true);
      expect(refreshRes.body.data).toHaveProperty('accessToken');
      expect(refreshRes.body.data).toHaveProperty('refreshToken');

      // Attempt to re-use the OLD refresh token — should fail (rotation)
      const replayRes = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: oldRefreshToken });

      expect(replayRes.status).toBe(401);
      expect(replayRes.body.success).toBe(false);
    });
  });

  describe('Protected Route Access', () => {
    it('should return 401 when no token is provided', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(employeeData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 when an invalid token is provided', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .set('Authorization', 'Bearer invalid-token-here')
        .send(employeeData);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return 403 when employee tries to access admin route', async () => {
      await createAdminAndLogin();

      // Register employee
      await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(employeeData);

      // Login as employee
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: employeeData.email, password: employeeData.password });

      const empToken = loginRes.body.data.accessToken;

      // Try admin-only route
      const res = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${empToken}`)
        .send({
          name: 'Blocked User',
          email: 'blocked@test.com',
          password: 'Test@123',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('should allow HR Admin to access admin-only route', async () => {
      await createAdminAndLogin();

      const res = await request(app)
        .post('/api/auth/register')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'New Employee',
          email: 'newemployee@test.com',
          password: 'Test@123',
          role: 'employee',
          department: 'Sales',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });
  });
});
