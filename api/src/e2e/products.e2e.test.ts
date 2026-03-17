/// <reference types="vitest/globals" />
import request from 'supertest';
import app from '../../index';

describe('Products E2E', () => {
  let createdId: string | null = null;

  it('should create a product (POST /api/products)', async () => {
    const payload = {
      name: 'E2E Test Ron',
      description: 'Producto creado desde test E2E',
      price: 10000,
      stock: 10,
      category: 'Test',
      type: 'ron',
      brand: 'Test Brand',
      alcoholContent: 40,
      imageUrl: '',
      minStock: 2
    };

    const res = await request(app).post('/api/products').send(payload);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(payload.name);
    createdId = res.body.id;
  });

  it('should get the created product (GET /api/products/:id)', async () => {
    if (!createdId) throw new Error('createdId not set');

    const res = await request(app).get(`/api/products/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(createdId);
  });

  it('should update the product (PUT /api/products/:id)', async () => {
    if (!createdId) throw new Error('createdId not set');

    const update = { price: 12345, stock: 5 };
    const res = await request(app).put(`/api/products/${createdId}`).send(update);
    expect(res.status).toBe(200);
    expect(res.body.price).toBe(update.price);
    expect(res.body.stock).toBe(update.stock);
  });

  it('should delete the product (DELETE /api/products/:id)', async () => {
    if (!createdId) throw new Error('createdId not set');

    const res = await request(app).delete(`/api/products/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message');

    // subsequent GET should return 404
    const resGet = await request(app).get(`/api/products/${createdId}`);
    expect(resGet.status).toBe(404);
  });
});
