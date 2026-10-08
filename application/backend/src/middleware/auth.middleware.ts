import { Request, Response, NextFunction } from 'express';
import { Role } from '@prisma/client';
import { AppError } from '../utils/AppError.js';
import { tokenService } from '../services/token.service.js';

/**
 * Middleware requiring valid Bearer JWT access token in Authorization header.
 * Attaches decoded user payload ({ id, email, role }) to req.user.
 * Returns HTTP 401 on missing, expired, or invalid token.
 */
export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw AppError.unauthorized('Authentication token required');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw AppError.unauthorized('Authentication token required');
    }

    try {
      const decoded = tokenService.verifyAccessToken(token);
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };
      next();
    } catch {
      throw AppError.unauthorized('Invalid or expired authentication token');
    }
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware requiring user to possess one of the specified roles.
 * Returns HTTP 403 Forbidden if authenticated user lacks required role.
 */
export function requireRole(...allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(AppError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(AppError.forbidden('Access forbidden: Insufficient privileges'));
    }

    next();
  };
}
