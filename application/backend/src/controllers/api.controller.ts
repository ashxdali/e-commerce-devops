import { Request, Response } from 'express';
import { sendSuccess } from '../utils/response.js';

export const getApiInfo = (_req: Request, res: Response): void => {
  sendSuccess(res, {
    name: 'AI-Powered E-Commerce API',
    version: 'v1',
  });
};
