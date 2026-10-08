import { Router, Request, Response } from 'express';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';
import { sendSuccess } from '../../utils/response.js';
import { Role } from '@prisma/client';

const adminRouter = Router();

/**
 * TEMPORARY TEST ENDPOINT ONLY
 * Used strictly for verifying role-based authorization middleware (requireRole("ADMIN")).
 * This is not a production admin business endpoint.
 */
adminRouter.get('/test', requireAuth, requireRole(Role.ADMIN), (req: Request, res: Response) => {
  sendSuccess(res, {
    message: 'Admin authorization successful',
    user: req.user,
  });
});

export default adminRouter;
