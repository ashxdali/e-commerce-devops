import { z } from 'zod';

const parseNumber = z.union([z.number(), z.string()]).transform((val, ctx) => {
  const num = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(num)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid numeric value',
    });
    return z.NEVER;
  }
  return num;
});

const parseNonNegativeInt = z.union([z.number(), z.string()]).transform((val, ctx) => {
  const num = typeof val === 'number' ? val : parseInt(val, 10);
  if (isNaN(num) || num < 0 || !Number.isInteger(num)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Must be a non-negative integer',
    });
    return z.NEVER;
  }
  return num;
});

const parsePositiveInt = z.union([z.number(), z.string()]).transform((val, ctx) => {
  const num = typeof val === 'number' ? val : parseInt(val, 10);
  if (isNaN(num) || num < 1 || !Number.isInteger(num)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Must be an integer greater than or equal to 1',
    });
    return z.NEVER;
  }
  return num;
});

const parseBoolean = z.union([z.boolean(), z.string()]).transform((val) => {
  if (typeof val === 'boolean') return val;
  if (val === 'true') return true;
  if (val === 'false') return false;
  return undefined;
});

const imageSchema = z.object({
  url: z.string({ required_error: 'Image URL is required' }).url('Invalid image URL format'),
  altText: z.string().trim().max(255).optional(),
  sortOrder: parseNonNegativeInt.optional().default(0),
});

export const createProductSchema = {
  body: z.object({
    name: z.string({ required_error: 'Product name is required' }).trim().min(1, 'Product name cannot be empty').max(200, 'Product name too long'),
    description: z.string({ required_error: 'Description is required' }).trim().min(1, 'Description cannot be empty'),
    price: parseNumber.pipe(z.number().positive('Price must be greater than 0')),
    compareAtPrice: parseNumber.pipe(z.number().positive('Compare at price must be greater than 0')).nullable().optional(),
    sku: z.string({ required_error: 'SKU is required' }).trim().min(1, 'SKU cannot be empty').max(100, 'SKU too long'),
    categoryId: z.string({ required_error: 'Category ID is required' }).min(1, 'Category ID cannot be empty'),
    isActive: z.boolean().optional().default(true),
    images: z.array(imageSchema).optional().default([]),
    stockQuantity: parseNonNegativeInt.optional(),
    inventory: z.object({
      quantity: parseNonNegativeInt,
    }).optional(),
  }),
};

export const updateProductSchema = {
  body: z
    .object({
      name: z.string().trim().min(1, 'Product name cannot be empty').max(200, 'Product name too long').optional(),
      description: z.string().trim().min(1, 'Description cannot be empty').optional(),
      price: parseNumber.pipe(z.number().positive('Price must be greater than 0')).optional(),
      compareAtPrice: parseNumber.pipe(z.number().positive('Compare at price must be greater than 0')).nullable().optional(),
      sku: z.string().trim().min(1, 'SKU cannot be empty').max(100, 'SKU too long').optional(),
      categoryId: z.string().min(1, 'Category ID cannot be empty').optional(),
      isActive: z.boolean().optional(),
      images: z.array(imageSchema).optional(),
      stockQuantity: parseNonNegativeInt.optional(),
      inventory: z.object({
        quantity: parseNonNegativeInt,
      }).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: 'At least one field must be provided for product update',
    }),
};

export const productParamSchema = {
  params: z.object({
    id: z.string().min(1, 'Product ID or slug is required'),
  }),
};

export const productQuerySchema = {
  query: z
    .object({
      page: parsePositiveInt.optional().default(1),
      limit: parsePositiveInt.pipe(z.number().max(100, 'Limit cannot exceed 100')).optional().default(12),
      search: z.string().trim().optional(),
      categoryId: z.string().trim().optional(),
      minPrice: parseNumber.pipe(z.number().min(0, 'Min price cannot be negative')).optional(),
      maxPrice: parseNumber.pipe(z.number().min(0, 'Max price cannot be negative')).optional(),
      sortBy: z.enum(['name', 'price', 'createdAt', 'updatedAt']).optional().default('createdAt'),
      sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
      isActive: parseBoolean.optional(),
    })
    .refine(
      (data) => {
        if (data.minPrice !== undefined && data.maxPrice !== undefined) {
          return data.minPrice <= data.maxPrice;
        }
        return true;
      },
      {
        message: 'minPrice must be less than or equal to maxPrice',
        path: ['minPrice'],
      }
    ),
};
