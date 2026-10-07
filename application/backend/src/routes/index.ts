import { Router } from 'express';
import healthRoutes from './health.routes.js';
import testErrorRoutes from './testError.routes.js';

const router = Router();

// Mount root api test endpoints
router.use('/', testErrorRoutes);

// Health check also mounted under /api/health for convenience if needed
router.use('/health', healthRoutes);

export default router;
