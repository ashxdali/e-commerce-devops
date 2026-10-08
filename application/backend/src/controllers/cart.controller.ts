import { Request, Response } from 'express';
import { cartService } from '../services/cart.service.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js';

export const getCartHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required');
  }
  const cart = await cartService.getCart(req.user.id);
  sendSuccess(res, cart, 200);
});

export const addToCartHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required');
  }
  const { productId, quantity } = req.body;
  const cart = await cartService.addItemToCart(req.user.id, productId, quantity);
  sendSuccess(res, cart, 200);
});

export const updateCartItemHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required');
  }
  const { productId } = req.params;
  const { quantity } = req.body;
  const cart = await cartService.updateCartItemQuantity(req.user.id, productId, quantity);
  sendSuccess(res, cart, 200);
});

export const removeCartItemHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required');
  }
  const { productId } = req.params;
  const cart = await cartService.removeCartItem(req.user.id, productId);
  sendSuccess(res, cart, 200);
});

export const clearCartHandler = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  if (!req.user) {
    throw AppError.unauthorized('Authentication required');
  }
  const cart = await cartService.clearCart(req.user.id);
  sendSuccess(res, cart, 200);
});
