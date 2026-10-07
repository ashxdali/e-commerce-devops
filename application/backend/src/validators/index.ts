import { z } from 'zod';

export const commonSchemas = {
  idParam: z.object({
    id: z.string().uuid('Invalid ID format'),
  }),
  paginationQuery: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),
};
