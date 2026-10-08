import { Router } from 'express';
import {
  getWishlistHandler,
  addToWishlistHandler,
  removeWishlistItemHandler,
  clearWishlistHandler,
} from '../../controllers/wishlist.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  addToWishlistSchema,
  wishlistItemParamSchema,
} from '../../validators/wishlist.validator.js';

const wishlistRouter = Router();

// All Wishlist routes require authentication
wishlistRouter.use(requireAuth);

wishlistRouter.get('/', getWishlistHandler);
wishlistRouter.post('/items', validate(addToWishlistSchema), addToWishlistHandler);
wishlistRouter.delete('/items/:productId', validate(wishlistItemParamSchema), removeWishlistItemHandler);
wishlistRouter.delete('/', clearWishlistHandler);

export default wishlistRouter;
