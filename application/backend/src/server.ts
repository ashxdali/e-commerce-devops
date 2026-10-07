import { createApp } from './app.js';
import { config } from './config/index.js';
import { logger } from './utils/logger.js';
import { Server } from 'http';

const app = createApp();
let server: Server;

function startServer(): void {
  server = app.listen(config.PORT, () => {
    logger.info(`🚀 Backend server running on port ${config.PORT}`, {
      environment: config.NODE_ENV,
      port: config.PORT,
      healthCheckUrl: `http://localhost:${config.PORT}/health`,
      apiBaseUrl: `http://localhost:${config.PORT}/api`,
    });
  });

  // Graceful Shutdown Handler
  const handleShutdown = (signal: string) => {
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    if (server) {
      server.close(() => {
        logger.info('HTTP server closed cleanly.');
        // Prepared for Prisma database client disconnection in Part 2
        process.exit(0);
      });

      // Force close server after 10 seconds if connections hang
      setTimeout(() => {
        logger.error('Could not close connections in time, forcing process exit.');
        process.exit(1);
      }, 10000);
    } else {
      process.exit(0);
    }
  };

  process.on('SIGTERM', () => handleShutdown('SIGTERM'));
  process.on('SIGINT', () => handleShutdown('SIGINT'));

  process.on('unhandledRejection', (reason: unknown) => {
    logger.error('Unhandled Promise Rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
    });
  });

  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught Exception', { message: error.message, stack: error.stack });
    process.exit(1);
  });
}

startServer();
