import { Router } from 'express';
import {
  registerHandler,
  loginHandler,
  refreshHandler,
  logoutHandler,
  meHandler,
} from '../../controllers/auth.controller.js';
import { validate } from '../../middleware/validate.middleware.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { registerSchema, loginSchema, refreshSchema } from '../../validators/auth.validator.js';

const authRouter = Router();

// POST /api/v1/auth/register - Register a new customer
authRouter.post('/register', validate(registerSchema), registerHandler);

// POST /api/v1/auth/login - Authenticate user and issue tokens
authRouter.post('/login', validate(loginSchema), loginHandler);

// POST /api/v1/auth/refresh - Refresh access token using HttpOnly cookie or body refresh token
authRouter.post('/refresh', validate(refreshSchema), refreshHandler);

// POST /api/v1/auth/logout - Revoke refresh session and clear cookie
authRouter.post('/logout', logoutHandler);

// GET /api/v1/auth/me - Retrieve current authenticated user profile
authRouter.get('/me', requireAuth, meHandler);

export default authRouter;
