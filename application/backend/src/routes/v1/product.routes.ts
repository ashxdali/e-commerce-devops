import { Router } from 'express';
import {
  getProductsHandler,
  getProductByIdHandler,
  createProductHandler,
  updateProductHandler,
  deleteProductHandler,
} from '../../controllers/product.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import {
  createProductSchema,
  updateProductSchema,
  productParamSchema,
  productQuerySchema,
} from '../../validators/product.validator.js';

const productRouter = Router();

// Public routes
productRouter.get('/', validate(productQuerySchema), getProductsHandler);
productRouter.get('/:id', validate(productParamSchema), getProductByIdHandler);

// Admin-only protected routes
productRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  validate(createProductSchema),
  createProductHandler
);

productRouter.patch(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  validate(productParamSchema),
  validate(updateProductSchema),
  updateProductHandler
);

productRouter.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  validate(productParamSchema),
  deleteProductHandler
);

export default productRouter;
