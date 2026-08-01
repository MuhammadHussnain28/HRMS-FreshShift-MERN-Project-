import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import Announcement from '../models/Announcement.js';
import AuditLog from '../models/AuditLog.js';

const adminData = {
  name: 'HR Admin',
  email: 'hradmin_ann@test.com',
  password: 'Admin@123',
  role: 'hr_admin',
  department: 'HR',
};

const employeeData = {
  name: 'Employee',
  email: 'emp_ann@test.com',
  password: 'Emp@123',
  role: 'employee',
  department: 'Engineering',
};

describe('Announcement Endpoints', () => {
  let adminToken, employeeToken;

  beforeAll(async () => {
    // Register Admin
    await User.create(adminData);
    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: adminData.email, password: adminData.password });
    adminToken = adminLogin.body.data.accessToken;

    // Register Employee
    await request(app)
      .post('/api/auth/register')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(employeeData);
    
    const empLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: employeeData.email, password: employeeData.password });
    employeeToken = empLogin.body.data.accessToken;
  });

  afterEach(async () => {
    await Announcement.deleteMany({});
    await AuditLog.deleteMany({});
  });

  it('should allow admin to create an announcement', async () => {
    const res = await request(app)
      .post('/api/announcements')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Company Meeting',
        message: 'All hands meeting tomorrow at 10 AM',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toBe('Company Meeting');

    const audit = await AuditLog.findOne({ action: 'ANNOUNCEMENT_CREATED' });
    expect(audit).not.toBeNull();
  });

  it('should block employee from creating an announcement (403)', async () => {
    const res = await request(app)
      .post('/api/announcements')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        title: 'Fake Meeting',
        message: 'I want a meeting',
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should allow employee to read announcements', async () => {
    // Admin creates one first
    await request(app)
      .post('/api/announcements')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Holiday',
        message: 'Tomorrow is a holiday',
      });

    const res = await request(app)
      .get('/api/announcements')
      .set('Authorization', `Bearer ${employeeToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.data[0].title).toBe('Holiday');
  });
});
