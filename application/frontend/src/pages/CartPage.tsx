import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, itemCount, subtotal, total, isLoading, updateQuantity, removeItem, clearCart } =
    useCart();

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-6 card-glass p-8">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 mx-auto">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Sign In to View Your Cart</h2>
          <p className="text-sm text-slate-400">
            Please log in with your customer account to view or update your cart items.
          </p>
        </div>
        <div className="flex items-center gap-3 justify-center pt-2">
          <Link to="/login" className="btn-primary w-full text-center py-2.5">
            Sign In
          </Link>
          <Link to="/register" className="btn-secondary w-full text-center py-2.5">
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return <LoadingState message="Fetching your shopping cart..." />;
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="border-b border-slate-800/80 pb-6">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-brand-400" /> Shopping Cart
          </h1>
        </div>
        <EmptyState
          title="Your Cart is Empty"
          description="Browse our hardware & software developer catalog and add items to your shopping cart."
          actionText="Explore Products Catalog"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-brand-400" /> Shopping Cart
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review your selected products ({itemCount} item{itemCount === 1 ? '' : 's'})
          </p>
        </div>

        <button
          onClick={() => clearCart()}
          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 hover:underline"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear All Items
        </button>
      </div>

      {/* Cart Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => {
            const product = item.product;
            const imageUrl =
              product?.images && product.images.length > 0
                ? product.images[0].url
                : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&auto=format&fit=crop&q=80';

            const unitPriceFormatted = `$${Number(item.unitPrice || product?.price || 0).toFixed(2)}`;
            const itemSubtotalFormatted = `$${Number(item.subtotal || 0).toFixed(2)}`;

            return (
              <div
                key={item.id || item.productId}
                className="card-glass p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-5 border-slate-800"
              >
                {/* Product Image */}
                <Link
                  to={`/products/${item.productId}`}
                  className="w-20 h-20 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden flex-shrink-0"
                >
                  <img
                    src={imageUrl}
                    alt={product?.name || 'Product'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80';
                    }}
                  />
                </Link>

                {/* Info */}
                <div className="flex-1 space-y-1 text-center sm:text-left min-w-0">
                  <Link
                    to={`/products/${item.productId}`}
                    className="font-bold text-white hover:text-brand-400 transition-colors text-base block truncate"
                  >
                    {product?.name || 'Product'}
                  </Link>
                  <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-2">
                    <span>Unit Price: {unitPriceFormatted}</span>
                    {product?.category && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                        {product.category.name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Quantity Adjuster */}
                <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
                  <button
                    disabled={item.quantity <= 1}
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-40"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-8 text-center font-bold text-white text-xs">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div className="flex items-center gap-4">
                  <span className="text-base font-extrabold text-white min-w-[70px] text-right">
                    {itemSubtotalFormatted}
                  </span>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Col: Order Summary */}
        <div className="space-y-6">
          <div className="card-glass p-6 space-y-6 border-slate-800">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-slate-400">
                <span>Items Subtotal</span>
                <span className="font-semibold text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Shipping</span>
                <span className="font-semibold text-emerald-400">FREE</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Estimated Tax</span>
                <span className="font-semibold text-white">$0.00</span>
              </div>

              <div className="pt-3 border-t border-slate-800/80 flex justify-between items-baseline">
                <span className="font-bold text-white text-base">Total</span>
                <span className="text-2xl font-extrabold text-brand-400">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Demo Notice Banner */}
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-amber-400">
                <Info className="w-4 h-4" /> Demo Platform Notice
              </div>
              <p className="leading-relaxed">
                Checkout will be available in a future release.
              </p>
            </div>

            {/* Disabled Checkout Button */}
            <button
              disabled
              className="w-full py-3 px-4 rounded-xl bg-slate-800 text-slate-500 border border-slate-700 font-bold text-sm cursor-not-allowed flex items-center justify-center gap-2"
            >
              Checkout Currently Disabled <ShieldCheck className="w-4 h-4 text-slate-600" />
            </button>

            <Link
              to="/products"
              className="block text-center text-xs text-brand-400 hover:underline font-semibold"
            >
              Continue Shopping <ArrowRight className="w-3 h-3 inline" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
