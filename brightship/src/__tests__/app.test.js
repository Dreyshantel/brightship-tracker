const request = require('supertest');
const app     = require('../app');

// NOTE from Kofi: these tests need postgres running locally first
// run: docker-compose up db
// then: npm test
// they will fail in CI because there's no database there — sorry about that

describe('GET /health', () => {
  it('returns ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('GET /shipments', () => {
  it('returns a list of shipments', async () => {
    const res = await request(app).get('/shipments');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.shipments)).toBe(true);
  });
});

describe('POST /shipments', () => {
  it('creates a new shipment', async () => {
    const res = await request(app).post('/shipments').send({
      sender:      'Test Sender',
      recipient:   'Test Recipient',
      origin:      'Lagos',
      destination: 'Abuja',
      weight_kg:   3.5,
    });
    expect(res.status).toBe(201);
    expect(res.body.shipment.status).toBe('PENDING');
  });

  it('rejects a shipment with missing fields', async () => {
    const res = await request(app).post('/shipments').send({
      sender: 'Only sender',
    });
    expect(res.status).toBe(400);
  });
});
