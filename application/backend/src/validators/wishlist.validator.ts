import { z } from 'zod';

export const addToWishlistSchema = {
  body: z.object({
    productId: z.string({ required_error: 'Product ID is required' }).trim().min(1, 'Product ID is required'),
  }),
};

export const wishlistItemParamSchema = {
  params: z.object({
    productId: z.string({ required_error: 'Product ID is required' }).trim().min(1, 'Product ID is required'),
  }),
};
