import apiClient from './api';
import { Product } from './catalog.service';

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
  product: Product & { availableStock?: number };
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string;
  items: CartItem[];
  itemCount: number;
  totalItems: number;
  subtotal: number;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartResponse {
  success: boolean;
  data: Cart;
}

export const cartService = {
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<CartResponse>('/v1/cart');
    return response.data.data;
  },

  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    const response = await apiClient.post<CartResponse>('/v1/cart/items', { productId, quantity });
    return response.data.data;
  },

  async updateCartItem(productId: string, quantity: number): Promise<Cart> {
    const response = await apiClient.patch<CartResponse>(`/v1/cart/items/${productId}`, { quantity });
    return response.data.data;
  },

  async removeCartItem(productId: string): Promise<Cart> {
    const response = await apiClient.delete<CartResponse>(`/v1/cart/items/${productId}`);
    return response.data.data;
  },

  async clearCart(): Promise<Cart> {
    const response = await apiClient.delete<CartResponse>('/v1/cart');
    return response.data.data;
  },
};

export default cartService;
