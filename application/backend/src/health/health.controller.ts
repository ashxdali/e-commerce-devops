import { Request, Response } from 'express';
import prisma from '../config/database.js';

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

export const readinessCheck = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Perform database health check using raw query SELECT 1
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: 'ready',
      timestamp: new Date().toISOString(),
      checks: {
        appProcess: 'ok',
        database: 'connected',
      },
    });
  } catch (error) {
    // Log internal error safely without exposing connection string or sensitive info to client
    console.error('❌ Database readiness check failed:', error instanceof Error ? error.message : 'Unknown database error');

    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      checks: {
        appProcess: 'ok',
        database: 'disconnected',
      },
    });
  }
};
