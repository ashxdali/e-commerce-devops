import { Router } from 'express';
import {
  getCartHandler,
  addToCartHandler,
  updateCartItemHandler,
  removeCartItemHandler,
  clearCartHandler,
} from '../../controllers/cart.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import {
  addToCartSchema,
  updateCartItemSchema,
  cartItemParamSchema,
} from '../../validators/cart.validator.js';

const cartRouter = Router();

// All Cart routes require authentication
cartRouter.use(requireAuth);

cartRouter.get('/', getCartHandler);
cartRouter.post('/items', validate(addToCartSchema), addToCartHandler);
cartRouter.patch('/items/:productId', validate(updateCartItemSchema), updateCartItemHandler);
cartRouter.delete('/items/:productId', validate(cartItemParamSchema), removeCartItemHandler);
cartRouter.delete('/', clearCartHandler);

export default cartRouter;
