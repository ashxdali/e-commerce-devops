import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import wishlistService, { Wishlist, WishlistItem } from '../services/wishlist.service';
import { useAuth } from './AuthContext';

interface WishlistContextType {
  wishlist: Wishlist | null;
  items: WishlistItem[];
  wishlistProductIds: Set<string>;
  itemCount: number;
  isLoading: boolean;
  toggleWishlist: (productId: string) => Promise<boolean>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchWishlist = async () => {
    if (!isAuthenticated) {
      setWishlist(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await wishlistService.getWishlist();
      setWishlist(data);
    } catch {
      setWishlist(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [isAuthenticated]);

  const items = wishlist?.items || [];
  const wishlistProductIds = new Set(items.map((item) => item.productId));

  const isInWishlist = (productId: string): boolean => {
    return wishlistProductIds.has(productId);
  };

  const toggleWishlist = async (productId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;
    setIsLoading(true);
    try {
      if (isInWishlist(productId)) {
        const updated = await wishlistService.removeFromWishlist(productId);
        setWishlist(updated);
        return false;
      } else {
        const updated = await wishlistService.addToWishlist(productId);
        setWishlist(updated);
        return true;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const updated = await wishlistService.removeFromWishlist(productId);
      setWishlist(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const itemCount = wishlist?.itemCount ?? items.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        items,
        wishlistProductIds,
        itemCount,
        isLoading,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        refreshWishlist: fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
