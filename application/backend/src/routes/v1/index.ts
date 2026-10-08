import { Router } from 'express';
import { getApiInfo } from '../../controllers/api.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { sendSuccess } from '../../utils/response.js';
import { config } from '../../config/index.js';
import { z } from 'zod';
import authRouter from './auth.routes.js';
import adminRouter from './admin.routes.js';

const v1Router = Router();

// GET /api/v1 - API information endpoint
v1Router.get('/', getApiInfo);

// Authentication API Endpoints
v1Router.use('/auth', authRouter);

// Admin Temporary Test Endpoints
v1Router.use('/admin', adminRouter);

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

export default v1Router;
