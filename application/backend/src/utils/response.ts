import { Response } from 'express';
import { ApiResponse, ApiErrorResponse, PaginatedResponse, PaginationMeta, ApiErrorDetail } from '../types/api.types.js';

export function sendSuccess<T>(res: Response, data: T, statusCode: number = 200): Response {
  const payload: ApiResponse<T> = {
    success: true,
    data,
  };
  return res.status(statusCode).json(payload);
}

export function sendPaginated<T>(
  res: Response,
  data: T[],
  meta: PaginationMeta,
  statusCode: number = 200
): Response {
  const payload: PaginatedResponse<T> = {
    success: true,
    data,
    meta,
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  code: string = 'INTERNAL_SERVER_ERROR',
  details?: ApiErrorDetail[] | Record<string, unknown>,
  stack?: string
): Response {
  const payload: ApiErrorResponse = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      ...(stack ? { stack } : {}),
    },
  };
  return res.status(statusCode).json(payload);
}
