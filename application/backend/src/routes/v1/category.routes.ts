import { Router } from 'express';
import {
  getCategoriesHandler,
  getCategoryByIdHandler,
  createCategoryHandler,
  updateCategoryHandler,
  deleteCategoryHandler,
} from '../../controllers/category.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import {
  createCategorySchema,
  updateCategorySchema,
  categoryParamSchema,
} from '../../validators/category.validator.js';

const categoryRouter = Router();

// Public routes
categoryRouter.get('/', getCategoriesHandler);
categoryRouter.get('/:id', validate(categoryParamSchema), getCategoryByIdHandler);

// Admin-only protected routes
categoryRouter.post(
  '/',
  requireAuth,
  requireRole('ADMIN'),
  validate(createCategorySchema),
  createCategoryHandler
);

categoryRouter.patch(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  validate(categoryParamSchema),
  validate(updateCategorySchema),
  updateCategoryHandler
);

categoryRouter.delete(
  '/:id',
  requireAuth,
  requireRole('ADMIN'),
  validate(categoryParamSchema),
  deleteCategoryHandler
);

export default categoryRouter;
