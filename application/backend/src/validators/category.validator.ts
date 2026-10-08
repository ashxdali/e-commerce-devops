import { z } from 'zod';

export const createCategorySchema = {
  body: z.object({
    name: z.string({ required_error: 'Category name is required' }).trim().min(1, 'Category name cannot be empty').max(100, 'Category name too long'),
    description: z.string().trim().max(1000, 'Description too long').optional(),
    slug: z.string().trim().min(1, 'Slug cannot be empty').max(120, 'Slug too long').optional(),
  }),
};

export const updateCategorySchema = {
  body: z
    .object({
      name: z.string().trim().min(1, 'Category name cannot be empty').max(100, 'Category name too long').optional(),
      description: z.string().trim().max(1000, 'Description too long').optional(),
      slug: z.string().trim().min(1, 'Slug cannot be empty').max(120, 'Slug too long').optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for category update',
    }),
};

export const categoryParamSchema = {
  params: z.object({
    id: z.string().min(1, 'Category ID or slug is required'),
  }),
};
