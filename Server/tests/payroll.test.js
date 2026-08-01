import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import AuditLog from '../models/AuditLog.js';
import { computeAbsentDays } from '../services/payrollService.js';
import { jest } from '@jest/globals';

const adminData = {
  name: 'HR Admin',
  email: 'hradmin_pay@test.com',
  password: 'Admin@123',
  role: 'hr_admin',
  department: 'HR',
};

const emp1Data = {
  name: 'Emp 1',
  email: 'emp1_pay@test.com',
  password: 'Emp@123',
  role: 'employee',
  department: 'Eng',
  monthlySalary: 3000,
};

const emp2Data = {
  name: 'Emp 2',
  email: 'emp2_pay@test.com',
  password: 'Emp@123',
  role: 'employee',
  department: 'Sales',
  monthlySalary: 6000,
};

describe('Payroll Endpoints & Logic', () => {
  let adminToken, emp1Token, emp2Token;
  let adminId, emp1Id, emp2Id;

  beforeEach(async () => {
    // Admin
    const admin = await User.create(adminData);
    adminId = admin._id.toString();
    const adminLogin = await request(app).post('/api/auth/login').send({ email: adminData.email, password: adminData.password });
    adminToken = adminLogin.body.data.accessToken;

    // Emp 1
    const reg1 = await request(app).post('/api/auth/register').set('Authorization', `Bearer ${adminToken}`).send(emp1Data);
    if (!reg1.body.success) console.error('Reg1 failed:', reg1.body);
    const emp1 = await User.findOne({ email: emp1Data.email });
    emp1Id = emp1._id.toString();
    const login1 = await request(app).post('/api/auth/login').send({ email: emp1Data.email, password: emp1Data.password });
    emp1Token = login1.body.data.accessToken;

    // Emp 2
    await request(app).post('/api/auth/register').set('Authorization', `Bearer ${adminToken}`).send(emp2Data);
    const emp2 = await User.findOne({ email: emp2Data.email });
    emp2Id = emp2._id.toString();
    const login2 = await request(app).post('/api/auth/login').send({ email: emp2Data.email, password: emp2Data.password });
    emp2Token = login2.body.data.accessToken;
  });



  describe('computeAbsentDays Logic', () => {
    it('should correctly calculate exact absent gaps (manual scenario)', async () => {
      // Scenario: Past Month (e.g., January 2026, 31 days)
      // Emp1 joined on Jan 10th 2026
      await User.findByIdAndUpdate(emp1Id, { joiningDate: '2026-01-10T00:00:00Z' });

      // Attendance on Jan 12, 13, 14
      await Attendance.create([
        { employee: emp1Id, date: '2026-01-12' },
        { employee: emp1Id, date: '2026-01-13' },
        { employee: emp1Id, date: '2026-01-14' }
      ]);

      // Approved Leave from Jan 16 to Jan 20 (5 days)
      await Leave.create({
        employee: emp1Id,
        leaveType: 'casual',
        startDate: '2026-01-16T00:00:00Z',
        endDate: '2026-01-20T23:59:59Z',
        numberOfDays: 5,
        reason: 'Holiday',
        status: 'approved',
      });

      // Total days in Jan: 31. 
      // Checking starts from joining date: Jan 10.
      // Days to check: 10th to 31st (22 days total).
      // Present: 3 days (12, 13, 14)
      // On Leave: 5 days (16, 17, 18, 19, 20)
      // Total accounted for: 8 days.
      // Expected absent days: 22 - 8 = 14 days.

      const absentDays = await computeAbsentDays(emp1Id, 1, 2026);
      expect(absentDays).toBe(14);
    });
  });

  describe('Payroll API', () => {
    it('should generate payroll, prevent duplicates, and manage PDF downloads', async () => {
      // 1. Generate Payroll
      const res = await request(app)
        .post('/api/payroll/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          employeeId: emp1Id,
          month: 1,
          year: 2026
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);

      const payroll = res.body.data;
      expect(payroll.unpaidLeaveDays).toBe(31);
      expect(payroll.baseSalary).toBe(3000);
      
      const payrollId = payroll._id;

      // 2. Reject Duplicate
      const dupRes = await request(app)
        .post('/api/payroll/generate')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          employeeId: emp1Id,
          month: 1,
          year: 2026
        });

      expect(dupRes.status).toBe(409);

      // 3. Download Own PDF
      const downRes = await request(app)
        .get(`/api/payroll/${payrollId}/download`)
        .set('Authorization', `Bearer ${emp1Token}`);

      expect(downRes.status).toBe(200);
      expect(downRes.headers['content-type']).toBe('application/pdf');
      expect(downRes.headers['content-disposition']).toContain('attachment; filename=payslip-1-2026.pdf');

      // 4. Block Other Employee PDF
      const blockRes = await request(app)
        .get(`/api/payroll/${payrollId}/download`)
        .set('Authorization', `Bearer ${emp2Token}`); // Emp2 trying to download Emp1's slip

      expect(blockRes.status).toBe(403);
    });
  });
});
