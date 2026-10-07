import { Router, Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { config } from '../config/index.js';

const router = Router();

router.get('/test-error', (_req: Request, _res: Response, next: NextFunction) => {
  if (config.NODE_ENV === 'production') {
    return next(AppError.forbidden('Test error endpoint is disabled in production environment.'));
  }

  // Intentionally trigger operational AppError for testing
  return next(
    AppError.badRequest('This is a test operational error generated to verify centralized error handling.', 'TEST_ERROR_VERIFICATION', {
      testTimestamp: new Date().toISOString(),
      handler: 'centralized_error_middleware',
    })
  );
});

export default router;
