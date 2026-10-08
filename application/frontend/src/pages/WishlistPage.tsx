import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, Check } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';
import LoadingState from '../components/LoadingState';

export const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { items, itemCount, isLoading, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-6 card-glass p-8">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mx-auto">
          <Heart className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Sign In to View Your Wishlist</h2>
          <p className="text-sm text-slate-400">
            Keep track of your favorite products across sessions by signing in to your account.
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
    return <LoadingState message="Fetching your wishlist..." />;
  }

  if (items.length === 0) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto">
        <div className="border-b border-slate-800/80 pb-6">
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Heart className="w-8 h-8 text-rose-500 fill-rose-500" /> Saved Wishlist
          </h1>
        </div>
        <EmptyState
          title="Your Wishlist is Empty"
          description="Explore our hardware catalog and save items to your wishlist for later."
          actionText="Browse Product Catalog"
          onAction={() => navigate('/products')}
        />
      </div>
    );
  }

  const handleAddToCart = async (productId: string) => {
    setAddingId(productId);
    try {
      await addToCart(productId, 1);
      setAddedIds((prev) => new Set(prev).add(productId));
      setTimeout(() => {
        setAddedIds((prev) => {
          const next = new Set(prev);
          next.delete(productId);
          return next;
        });
      }, 2000);
    } catch (err) {
      console.error('Failed to add wishlist item to cart:', err);
    } finally {
      setAddingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Heart className="w-8 h-8 text-rose-500 fill-rose-500" /> Saved Wishlist
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          {itemCount} item{itemCount === 1 ? '' : 's'} saved to your personal collection
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => {
          const product = item.product;
          if (!product) return null;

          const imageUrl =
            product.images && product.images.length > 0
              ? product.images[0].url
              : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop&q=80';

          const priceFormatted =
            typeof product.price === 'number'
              ? `$${product.price.toFixed(2)}`
              : `$${parseFloat(String(product.price)).toFixed(2)}`;

          const isAdded = addedIds.has(product.id);
          const isAdding = addingId === product.id;

          return (
            <div
              key={item.id || item.productId}
              className="card-glass-hover overflow-hidden flex flex-col justify-between border-slate-800"
            >
              <div className="relative aspect-square w-full bg-slate-900 overflow-hidden">
                <Link to={`/products/${product.id}`}>
                  <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=80';
                    }}
                  />
                </Link>

                <button
                  onClick={() => removeFromWishlist(product.id)}
                  className="absolute top-3 right-3 p-2 rounded-full bg-slate-950/80 text-slate-400 hover:text-rose-400 hover:bg-slate-900 border border-slate-800 transition-colors"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  {product.category && (
                    <span className="text-[10px] uppercase font-semibold tracking-wider text-brand-400">
                      {product.category.name}
                    </span>
                  )}
                  <Link
                    to={`/products/${product.id}`}
                    className="font-bold text-white hover:text-brand-400 transition-colors block text-base truncate"
                  >
                    {product.name}
                  </Link>
                  <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                    {product.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-3">
                  <span className="text-lg font-extrabold text-white">{priceFormatted}</span>

                  <button
                    onClick={() => handleAddToCart(product.id)}
                    disabled={isAdding}
                    className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : 'btn-primary py-2 px-3.5 text-xs'
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-3.5 h-3.5" /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-3.5 h-3.5" /> Move to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WishlistPage;
