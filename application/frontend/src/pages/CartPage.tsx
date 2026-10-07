import React from 'react';
import { ShoppingCart } from 'lucide-react';
import EmptyState from '../components/EmptyState.js';

export const CartPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-800/80 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <ShoppingCart className="w-8 h-8 text-brand-400" /> Shopping Cart
        </h1>
        <p className="text-sm text-slate-400">
          Cart state management and persistence will be introduced in Part 5.
        </p>
      </div>

      <EmptyState
        title="Your Cart is Empty"
        description="E-commerce checkout, cart storage, and order calculation will be implemented in Part 5."
      />
    </div>
  );
};

export default CartPage;
