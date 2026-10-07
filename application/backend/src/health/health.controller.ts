import { Request, Response } from 'express';

export const healthCheck = (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'ok',
    service: 'ai-ecommerce-backend',
    timestamp: new Date().toISOString(),
  });
};

export const livenessCheck = (_req: Request, res: Response): void => {
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
  });
};

export const readinessCheck = (_req: Request, res: Response): void => {
  // Database checks will be added in Part 2 after Prisma & PostgreSQL are connected
  res.status(200).json({
    status: 'ready',
    timestamp: new Date().toISOString(),
    checks: {
      appProcess: 'ok',
      database: 'not_configured_part1',
    },
  });
};
