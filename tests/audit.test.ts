import request from 'supertest';
import app from '../src/app';

describe('Page Pulse API Comprehensive Suite', () => {
  it('should return health status at /health', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.header['x-request-id']).toBeDefined();
  });

  it('should return HTML landing page at / with credit link', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Built for Digital Heroes Training Task');
    expect(res.text).toContain('digitalheroesco.com');
  });

  it('should return 400 when url parameter is missing', async () => {
    const res = await request(app).get('/api/audit');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid Input');
  });

  it('should return 400 for invalid URL format', async () => {
    const res = await request(app).get('/api/audit?url=not-a-url');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid Input');
  });

  it('should return 400 for non-http/https protocols', async () => {
    const res = await request(app).get('/api/audit?url=ftp://example.com');
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid Input');
  });

  it('should audit a valid HTTP/HTTPS URL successfully and set X-Cache MISS on first request', async () => {
    const res = await request(app).get('/api/audit?url=https://example.com');
    expect(res.status).toBe(200);
    expect(res.body.url).toBe('https://example.com');
    expect(res.body.status).toBeDefined();
    expect(typeof res.body.responseTimeMs).toBe('number');
    expect(res.header['x-cache']).toBe('MISS');
    expect(res.header['x-request-id']).toBeDefined();
  });

  it('should serve repeat audit requests from cache with X-Cache HIT header', async () => {
    // First request populates cache
    await request(app).get('/api/audit?url=https://example.com');
    
    // Second request hits cache
    const res2 = await request(app).get('/api/audit?url=https://example.com');
    expect(res2.status).toBe(200);
    expect(res2.header['x-cache']).toBe('HIT');
    expect(res2.body.url).toBe('https://example.com');
  });

  it('should include rate limiting headers on /api requests', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    const auditRes = await request(app).get('/api/audit?url=https://example.com');
    expect(auditRes.header['ratelimit-limit']).toBeDefined();
    expect(auditRes.header['ratelimit-remaining']).toBeDefined();
  });
});
