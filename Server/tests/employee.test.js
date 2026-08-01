import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import AuditLog from '../models/AuditLog.js';

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
  phone: '+923001111111',
  monthlySalary: 60000,
};

let adminToken;
let employeeToken;
let employeeId;

const setupUsersAndTokens = async () => {
  // Create admin directly in DB
  await User.create(adminData);

  // Login as admin to get token
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

  // Login as employee to get token
  const empLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: employeeData.email, password: employeeData.password });
  employeeToken = empLogin.body.data.accessToken;
};

describe('Employee Endpoints', () => {
  describe('GET /api/employees', () => {
    it('should allow admin to list all employees with no password/refreshTokenHash leaked', async () => {
      await setupUsersAndTokens();

      const res = await request(app)
        .get('/api/employees')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);

      // Verify no password or refreshTokenHash in ANY item
      for (const emp of res.body.data) {
        expect(emp).not.toHaveProperty('password');
        expect(emp).not.toHaveProperty('refreshTokenHash');
      }
    });
  });

  describe('GET /api/employees/me', () => {
    it('should return the authenticated employee own profile', async () => {
      await setupUsersAndTokens();

      const res = await request(app)
        .get('/api/employees/me')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(employeeData.email);
      expect(res.body.data).not.toHaveProperty('password');
      expect(res.body.data).not.toHaveProperty('refreshTokenHash');
    });
  });

  describe('GET /api/employees/:id', () => {
    it('should return 403 when employee tries to access another user profile', async () => {
      await setupUsersAndTokens();

      // Get admin user ID
      const adminUser = await User.findOne({ email: adminData.email });

      const res = await request(app)
        .get(`/api/employees/${adminUser._id}`)
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });
  });

  describe('PUT /api/employees/:id', () => {
    it('should allow admin to update employee and create an AuditLog entry', async () => {
      await setupUsersAndTokens();

      const res = await request(app)
        .put(`/api/employees/${employeeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ department: 'Marketing', designation: 'Marketing Lead' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.department).toBe('Marketing');
      expect(res.body.data.designation).toBe('Marketing Lead');
      expect(res.body.data).not.toHaveProperty('password');
      expect(res.body.data).not.toHaveProperty('refreshTokenHash');

      // Verify AuditLog entry was created
      const auditEntry = await AuditLog.findOne({
        action: 'EMPLOYEE_UPDATED',
        targetId: employeeId,
      });

      expect(auditEntry).not.toBeNull();
      expect(auditEntry.targetType).toBe('User');
      expect(auditEntry.details.changedFields).toContain('department');
      expect(auditEntry.details.changedFields).toContain('designation');
    });
  });

  describe('DELETE /api/employees/:id', () => {
    it('should soft-delete employee and block their login', async () => {
      await setupUsersAndTokens();

      // Delete (soft) the employee
      const deleteRes = await request(app)
        .delete(`/api/employees/${employeeId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
      expect(deleteRes.body.data.employmentStatus).toBe('terminated');

      // Verify the user document still exists in DB
      const user = await User.findById(employeeId);
      expect(user).not.toBeNull();
      expect(user.employmentStatus).toBe('terminated');

      // Attempt login — should be blocked
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: employeeData.email, password: employeeData.password });

      expect(loginRes.status).toBe(401);
      expect(loginRes.body.success).toBe(false);
    });
  });
});
