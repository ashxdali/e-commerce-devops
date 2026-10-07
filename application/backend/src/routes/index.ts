import { Router } from 'express';
import healthRoutes from './health.routes.js';
import testErrorRoutes from './testError.routes.js';
import v1Router from './v1/index.js';

const router = Router();

// Mount versioned API routes (/api/v1)
router.use('/v1', v1Router);

// Operational test error route
router.use('/', testErrorRoutes);

// Health check mounted under /api/health for convenience
router.use('/health', healthRoutes);

export default router;
