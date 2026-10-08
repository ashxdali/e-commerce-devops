import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import cartService, { Cart, CartItem } from '../services/cart.service';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  total: number;
  isLoading: boolean;
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    setIsLoading(true);
    try {
      const data = await cartService.getCart();
      setCart(data);
    } catch {
      // Failed to load cart or session invalid
      setCart(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isAuthenticated]);

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const updated = await cartService.addToCart(productId, quantity);
      setCart(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const updated = await cartService.updateCartItem(productId, quantity);
      setCart(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (productId: string) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const updated = await cartService.removeCartItem(productId);
      setCart(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const updated = await cartService.clearCart();
      setCart(updated);
    } finally {
      setIsLoading(false);
    }
  };

  const items = cart?.items || [];
  const itemCount = cart?.totalItems ?? cart?.itemCount ?? items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart?.subtotal ?? items.reduce((sum, item) => sum + Number(item.subtotal || 0), 0);
  const total = cart?.total ?? subtotal;

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        itemCount,
        subtotal,
        total,
        isLoading,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
