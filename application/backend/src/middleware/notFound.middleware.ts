import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError.js';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  const error = AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`);
  next(error);
}
