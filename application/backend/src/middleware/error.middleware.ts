import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';
import { logger } from '../utils/logger.js';
import { config } from '../config/index.js';

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const errorCode = isAppError && err.errorCode ? err.errorCode : 'INTERNAL_SERVER_ERROR';

  const isDev = config.NODE_ENV === 'development';

  // Safe user-facing message
  let message = isAppError ? err.message : 'An unexpected error occurred. Please try again later.';

  // If in production and not an operational AppError, mask message completely
  if (!isDev && !isAppError) {
    message = 'An internal server error occurred.';
  }

  // Log error with context for debugging
  logger.error(err.message || 'Unhandled error', {
    name: err.name,
    statusCode,
    errorCode,
    stack: isDev ? err.stack : undefined,
  });

  const responsePayload: Record<string, unknown> = {
    status: 'error',
    statusCode,
    errorCode,
    message,
  };

  if (isAppError && err.details) {
    responsePayload.details = err.details;
  }

  if (isDev && err.stack) {
    responsePayload.stack = err.stack;
  }

  res.status(statusCode).json(responsePayload);
}
