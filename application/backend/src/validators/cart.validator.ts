import { z } from 'zod';

const parsePositiveInt = z.union([z.number(), z.string()]).transform((val, ctx) => {
  const num = typeof val === 'number' ? val : parseInt(val, 10);
  if (isNaN(num) || num < 1 || !Number.isInteger(num)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Quantity must be an integer greater than or equal to 1',
    });
    return z.NEVER;
  }
  return num;
});

export const addToCartSchema = {
  body: z.object({
    productId: z.string({ required_error: 'Product ID is required' }).trim().min(1, 'Product ID is required'),
    quantity: parsePositiveInt.optional().default(1),
  }),
};

export const updateCartItemSchema = {
  params: z.object({
    productId: z.string({ required_error: 'Product ID is required' }).trim().min(1, 'Product ID is required'),
  }),
  body: z.object({
    quantity: parsePositiveInt,
  }),
};

export const cartItemParamSchema = {
  params: z.object({
    productId: z.string({ required_error: 'Product ID is required' }).trim().min(1, 'Product ID is required'),
  }),
};
