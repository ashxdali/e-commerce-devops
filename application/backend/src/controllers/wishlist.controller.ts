import { Request, Response } from 'express';
import { wishlistService } from '../services/wishlist.service.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const getWishlistHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required');
  }
  const wishlist = await wishlistService.getWishlist(req.user.id);
  sendSuccess(res, wishlist, 200);
});

export const addToWishlistHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required');
  }
  const { productId } = req.body;
  const wishlist = await wishlistService.addItemToWishlist(req.user.id, productId);
  sendSuccess(res, wishlist, 200);
});

export const removeWishlistItemHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required');
  }
  const { productId } = req.params;
  const wishlist = await wishlistService.removeWishlistItem(req.user.id, productId);
  sendSuccess(res, wishlist, 200);
});

export const clearWishlistHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required');
  }
  const wishlist = await wishlistService.clearWishlist(req.user.id);
  sendSuccess(res, wishlist, 200);
});
