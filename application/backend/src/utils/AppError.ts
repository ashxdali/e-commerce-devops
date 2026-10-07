export interface ErrorDetails {
  [key: string]: unknown;
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode: string;
  public readonly details?: ErrorDetails | unknown[];

  constructor(
    message: string,
    statusCode: number = 500,
    errorCode: string = 'INTERNAL_SERVER_ERROR',
    details?: ErrorDetails | unknown[]
  ) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }

  public static badRequest(message: string, errorCode?: string, details?: ErrorDetails | unknown[]): AppError {
    return new AppError(message, 400, errorCode || 'BAD_REQUEST', details);
  }

  public static validation(message: string = 'Invalid request data', details?: ErrorDetails | unknown[]): AppError {
    return new AppError(message, 400, 'VALIDATION_ERROR', details);
  }

  public static unauthorized(message: string = 'Unauthorized access', errorCode?: string): AppError {
    return new AppError(message, 401, errorCode || 'UNAUTHORIZED');
  }

  public static forbidden(message: string = 'Access forbidden', errorCode?: string): AppError {
    return new AppError(message, 403, errorCode || 'FORBIDDEN');
  }

  public static notFound(message: string = 'Resource not found', errorCode?: string): AppError {
    return new AppError(message, 404, errorCode || 'NOT_FOUND');
  }

  public static conflict(message: string = 'Resource conflict', errorCode?: string): AppError {
    return new AppError(message, 409, errorCode || 'CONFLICT');
  }

  public static internal(message: string = 'Internal server error', errorCode?: string): AppError {
    return new AppError(message, 500, errorCode || 'INTERNAL_SERVER_ERROR');
  }
}
