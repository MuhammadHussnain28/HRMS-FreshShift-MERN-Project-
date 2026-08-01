import { jest } from '@jest/globals';
import request from 'supertest';

// Set JWT secrets for test environment before anything loads
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
process.env.JWT_ACCESS_EXPIRY = '15m';
process.env.JWT_REFRESH_EXPIRY = '7d';

jest.unstable_mockModule('../services/aiLeaveService.js', () => ({
  getLeaveRecommendation: jest.fn(),
}));

// Dynamic imports AFTER mock
const aiLeaveService = await import('../services/aiLeaveService.js');
const { default: app } = await import('../app.js');
const { default: User } = await import('../models/User.js');
const { default: Leave } = await import('../models/Leave.js');
const { default: Attendance } = await import('../models/Attendance.js');
const { default: AuditLog } = await import('../models/AuditLog.js');
const { LEAVE_POLICY } = await import('../config/leavePolicy.js');
const { todayYMD } = await import('../utils/dateUtils.js');

const adminData = {
  name: 'HR Admin',
  email: 'hradmin@test.com',
  password: 'Admin@123',
  role: 'hr_admin',
  department: 'HR',
};

const employeeData = {
  name: 'Test Employee',
  email: 'employee@test.com',
  password: 'Employee@123',
  role: 'employee',
  department: 'Engineering',
};

let adminToken;
let employeeToken;
let employeeId;
let adminId;

const setupUsersAndTokens = async () => {
  const admin = await User.create(adminData);
  adminId = admin._id.toString();

  const adminLogin = await request(app).post('/api/auth/login').send({ email: adminData.email, password: adminData.password });
  adminToken = adminLogin.body.data.accessToken;

  const regRes = await request(app).post('/api/auth/register').set('Authorization', `Bearer ${adminToken}`).send(employeeData);
  employeeId = regRes.body.data._id;

  const empLogin = await request(app).post('/api/auth/login').send({ email: employeeData.email, password: employeeData.password });
  employeeToken = empLogin.body.data.accessToken;
};

describe('Leave Endpoints', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/leaves', () => {
    it('1. should submit leave and store as pending with AI Approve', async () => {
      await setupUsersAndTokens();

      aiLeaveService.getLeaveRecommendation.mockResolvedValue({
        recommendation: 'Approve',
        reasoning: 'Test reasoning',
      });

      const res = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveType: 'casual',
          startDate: '2026-08-10',
          endDate: '2026-08-12',
          reason: 'Sick leave',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.numberOfDays).toBe(3); // 10, 11, 12 = 3 days
      expect(res.body.data.aiRecommendation.recommendation).toBe('Approve');
    });

    it('2. should return 400 if leave request exceeds balance', async () => {
      await setupUsersAndTokens();

      const res = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveType: 'casual',
          startDate: '2026-08-10',
          endDate: '2026-08-30', // 21 days, limit is 10
          reason: 'Long vacation',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Insufficient leave balance');
    });

    it('3. should create leave with aiRecommendation null on AI failure', async () => {
      await setupUsersAndTokens();

      // Mock AI failure
      aiLeaveService.getLeaveRecommendation.mockResolvedValue(null);

      const res = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({
          leaveType: 'annual',
          startDate: '2026-09-01',
          endDate: '2026-09-02',
          reason: 'Vacation leave',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('pending');
      expect(res.body.data.aiRecommendation).toBeNull();
    });
  });

  describe('PUT /api/leaves/:id/decision', () => {
    let leaveId;

    beforeEach(async () => {
      await setupUsersAndTokens();
      aiLeaveService.getLeaveRecommendation.mockResolvedValue({ recommendation: 'Approve', reasoning: 'Ok' });
      
      const res = await request(app)
        .post('/api/leaves')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ leaveType: 'casual', startDate: '2026-08-10', endDate: '2026-08-11', reason: 'Sick leave' });
      
      leaveId = res.body.data._id;
    });

    it('4. should approve leave, create Attendance records, and reduce balance', async () => {
      // Approve
      const approveRes = await request(app)
        .put(`/api/leaves/${leaveId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ decision: 'approved' });

      expect(approveRes.status).toBe(200);
      expect(approveRes.body.data.status).toBe('approved');

      // Check Attendance records created (10th and 11th)
      const attendances = await Attendance.find({ employee: employeeId });
      expect(attendances.length).toBe(2);
      expect(attendances[0].status).toBe('on-leave');
      expect(attendances[1].status).toBe('on-leave');

      // Check balance reduction
      const balanceRes = await request(app)
        .get('/api/leaves/balance/me')
        .set('Authorization', `Bearer ${employeeToken}`);

      const casualBalance = balanceRes.body.data.casual;
      expect(casualBalance.allowed).toBe(10);
      expect(casualBalance.used).toBe(2);
      expect(casualBalance.remaining).toBe(8);
      
      // Check audit log
      const auditLog = await AuditLog.findOne({ action: 'LEAVE_DECISION', targetId: leaveId });
      expect(auditLog).not.toBeNull();
    });

    it('5. should reject leave, keeping balance intact and Attendance unchanged', async () => {
      // Reject
      const rejectRes = await request(app)
        .put(`/api/leaves/${leaveId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ decision: 'rejected' });

      expect(rejectRes.status).toBe(200);
      expect(rejectRes.body.data.status).toBe('rejected');

      // Check Attendance (should be 0)
      const attendances = await Attendance.find({ employee: employeeId });
      expect(attendances.length).toBe(0);

      // Check balance (should still be full)
      const balanceRes = await request(app)
        .get('/api/leaves/balance/me')
        .set('Authorization', `Bearer ${employeeToken}`);

      expect(balanceRes.body.data.casual.remaining).toBe(10);
    });

    it('6. should return 403 if an employee tries to decide their own request', async () => {
      // Attempt to self-approve as the employee
      const res = await request(app)
        .put(`/api/leaves/${leaveId}/decision`)
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({ decision: 'approved' });

      expect(res.status).toBe(403);
    });

    it('7. should return 400 if trying to re-decide an already decided request', async () => {
      // Approve first
      await request(app)
        .put(`/api/leaves/${leaveId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ decision: 'approved' });

      // Try to reject the approved leave
      const res = await request(app)
        .put(`/api/leaves/${leaveId}/decision`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ decision: 'rejected' });

      expect(res.status).toBe(400);
      expect(res.body.error.message).toContain('already been approved');
    });
  });
});
