/// <reference types="vitest/globals" />
import { ProductService } from './ProductService';

describe('ProductService', () => {
  it('returns active products', async () => {
    const svc = new ProductService();
    const all = await svc.getAllProducts();
    expect(Array.isArray(all)).toBe(true);
  });
});
