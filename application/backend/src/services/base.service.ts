import prisma from '../config/database.js';

/**
 * Base Service class providing database access via the Prisma singleton.
 * All feature services (AuthService, ProductService, OrderService, etc.)
 * should extend this class or consume the Prisma singleton directly.
 */
export abstract class BaseService {
  protected get db() {
    return prisma;
  }
}
