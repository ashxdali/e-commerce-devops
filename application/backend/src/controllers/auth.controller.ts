import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { tokenService } from '../services/token.service.js';
import { sendSuccess } from '../utils/response.js';
import { AppError } from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const registerHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await authService.register(req.body);
  res.cookie('refreshToken', result.refreshToken, tokenService.getRefreshCookieOptions());
  sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 201);
});

export const loginHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const result = await authService.login(req.body);
  res.cookie('refreshToken', result.refreshToken, tokenService.getRefreshCookieOptions());
  sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 200);
});

export const refreshHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!rawRefreshToken) {
    throw AppError.unauthorized('Refresh token required');
  }

  const result = await authService.refreshTokenSession(rawRefreshToken);
  res.cookie('refreshToken', result.refreshToken, tokenService.getRefreshCookieOptions());
  sendSuccess(res, { accessToken: result.accessToken }, 200);
});

export const logoutHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const rawRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

  await authService.logout(rawRefreshToken);
  res.clearCookie('refreshToken', tokenService.getRefreshCookieOptions());
  sendSuccess(res, { message: 'Logged out successfully' }, 200);
});

export const meHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required');
  }

  const user = await authService.getCurrentUser(req.user.id);
  sendSuccess(res, { user }, 200);
});
