import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import healthRoutes from './routes/health.routes.js';
import apiRoutes from './routes/index.js';
import { requestLogger } from './middleware/logger.middleware.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import { config } from './config/index.js';

export function createApp(): Express {
  const app = express();

  // Security Middleware
  app.use(helmet());

  // CORS Configuration
  app.use(
    cors({
      origin: config.FRONTEND_URL,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    })
  );

  // Request Body Parsers (with size limits)
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Request Logging Middleware
  app.use(requestLogger);

  // Health Endpoints mounted at root level: /health, /health/live, /health/ready
  app.use('/health', healthRoutes);

  // API Namespace Base Route: /api
  app.use('/api', apiRoutes);

  // 404 Handler
  app.use(notFoundHandler);

  // Centralized Operational Error Handler
  app.use(errorHandler);

  return app;
}
