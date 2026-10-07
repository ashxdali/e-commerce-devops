import { Router } from 'express';
import { getApiInfo } from '../../controllers/api.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { sendSuccess } from '../../utils/response.js';
import { config } from '../../config/index.js';
import { z } from 'zod';

const v1Router = Router();

// GET /api/v1 - API information endpoint
v1Router.get('/', getApiInfo);

// Operational validation test endpoint (non-production environments)
if (config.NODE_ENV !== 'production') {
  const testValidationSchema = {
    body: z.object({
      email: z.string().email('Invalid email address'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
    }),
  };

  v1Router.post('/validate-test', validate(testValidationSchema), (req, res) => {
    sendSuccess(res, { validated: true, input: req.body });
  });
}

// Future modular route mounts:
// v1Router.use('/auth', authRoutes);
// v1Router.use('/categories', categoryRoutes);
// v1Router.use('/products', productRoutes);
// v1Router.use('/cart', cartRoutes);
// v1Router.use('/wishlist', wishlistRoutes);
// v1Router.use('/orders', orderRoutes);
// v1Router.use('/reviews', reviewRoutes);
// v1Router.use('/admin', adminRoutes);

export default v1Router;
