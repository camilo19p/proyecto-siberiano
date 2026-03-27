import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/ProductService';

const productService = new ProductService();

export class ProductController {
  async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productService.getAllProducts();
      return res.json(products);
    } catch (err) {
      return next(err);
    }
  }

  async getLowStockProducts(req: Request, res: Response, next: NextFunction) {
    try {
      const products = await productService.getLowStockProducts();
      return res.json(products);
    } catch (err) {
      return next(err);
    }
  }

  async getProductsByType(req: Request, res: Response, next: NextFunction) {
    try {
      const { type } = req.params as { type: string };
      const products = await productService.getProductsByType(type);
      return res.json(products);
    } catch (err) {
      return next(err);
    }
  }

  async getProductById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const product = await productService.getProductById(id);
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      return res.json(product);
    } catch (err) {
      return next(err);
    }
  }

  async createProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await productService.createProduct(req.body);
      return res.status(201).json(created);
    } catch (err) {
      return next(err);
    }
  }

  async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const updated = await productService.updateProduct(id, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      return res.json(updated);
    } catch (err) {
      return next(err);
    }
  }

  async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      await productService.deleteProduct(id);
      return res.json({ success: true });
    } catch (err) {
      return next(err);
    }
  }

  async adjustStock(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params as { id: string };
      const { adjustment, reason } = req.body as { adjustment: number; reason?: string };

      if (typeof adjustment !== 'number' || adjustment === 0) {
        return res.status(400).json({ error: 'adjustment debe ser un número diferente de 0' });
      }

      const updated = await productService.adjustStock(id, adjustment, reason);
      if (!updated) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      return res.json(updated);
    } catch (err) {
      return next(err);
    }
  }
}
