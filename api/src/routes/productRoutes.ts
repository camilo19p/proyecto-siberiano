import { Router } from 'express';
import { ProductController } from '../../controllers/ProductController';
import { validateBody, validateParams } from '../middlewares/validate';
import { createProductSchema, updateProductSchema, idParamSchema, typeParamSchema } from '../validators/productValidators';

const router = Router();
const productController = new ProductController();

// Rutas de productos
router.get('/products', (req, res, next) => productController.getProducts(req, res, next));
router.get('/products/low-stock', (req, res, next) => productController.getLowStockProducts(req, res, next));
router.get('/products/type/:type', validateParams(typeParamSchema), (req, res, next) => productController.getProductsByType(req, res, next));
router.get('/products/:id', validateParams(idParamSchema), (req, res, next) => productController.getProductById(req, res, next));
router.post('/products', validateBody(createProductSchema), (req, res, next) => productController.createProduct(req, res, next));
router.put('/products/:id', validateParams(idParamSchema), validateBody(updateProductSchema), (req, res, next) => productController.updateProduct(req, res, next));
router.delete('/products/:id', validateParams(idParamSchema), (req, res, next) => productController.deleteProduct(req, res, next));

export default router;