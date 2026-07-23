import request from 'supertest';
import app from '../app.js';

describe('GET /api/health', () => {
  it('should return status 200 and standard success envelope with { success: true }', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toEqual({ status: 'ok' });
  });
});
