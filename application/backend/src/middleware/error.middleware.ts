import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';
import { sendError } from '../utils/response.js';

export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const errorCode = isAppError && err.errorCode ? err.errorCode : 'INTERNAL_SERVER_ERROR';

  const isDev = config.NODE_ENV === 'development';

  // Safe user-facing message
  let message = isAppError ? err.message : 'An unexpected error occurred. Please try again later.';

  // Mask internal unexpected error messages in production
  if (!isDev && !isAppError) {
    message = 'An internal server error occurred.';
  }

  // Log error with context for observability
  logger.error(err.message || 'Unhandled error', {
    name: err.name,
    statusCode,
    errorCode,
    path: req.originalUrl || req.url,
    method: req.method,
    stack: isDev ? err.stack : undefined,
  });

  const details = isAppError && err.details ? err.details : undefined;
  const stack = isDev && err.stack ? err.stack : undefined;

  sendError(res, message, statusCode, errorCode, details as Record<string, unknown> | undefined, stack);
}
