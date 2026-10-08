import apiClient from './api';
import { Product } from './catalog.service';

export interface WishlistItem {
  id: string;
  wishlistId: string;
  productId: string;
  product: Product & { availableStock?: number };
  createdAt: string;
}

export interface Wishlist {
  id: string;
  userId: string;
  items: WishlistItem[];
  itemCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistResponse {
  success: boolean;
  data: Wishlist;
}

export const wishlistService = {
  async getWishlist(): Promise<Wishlist> {
    const response = await apiClient.get<WishlistResponse>('/v1/wishlist');
    return response.data.data;
  },

  async addToWishlist(productId: string): Promise<Wishlist> {
    const response = await apiClient.post<WishlistResponse>('/v1/wishlist/items', { productId });
    return response.data.data;
  },

  async removeFromWishlist(productId: string): Promise<Wishlist> {
    const response = await apiClient.delete<WishlistResponse>(`/v1/wishlist/items/${productId}`);
    return response.data.data;
  },

  async clearWishlist(): Promise<Wishlist> {
    const response = await apiClient.delete<WishlistResponse>('/v1/wishlist');
    return response.data.data;
  },
};

export default wishlistService;
