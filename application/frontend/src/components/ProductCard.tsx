import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Heart, Check, PackageX, Sparkles } from 'lucide-react';
import { Product } from '../services/catalog.service';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Check stock availability
  const stock = product.inventory?.quantity ?? 10;
  const isOutOfStock = stock <= 0;
  const inWishlist = isInWishlist(product.id);

  const priceFormatted =
    typeof product.price === 'number'
      ? `$${product.price.toFixed(2)}`
      : `$${parseFloat(String(product.price)).toFixed(2)}`;

  const comparePriceFormatted = product.compareAtPrice
    ? typeof product.compareAtPrice === 'number'
      ? `$${product.compareAtPrice.toFixed(2)}`
      : `$${parseFloat(String(product.compareAtPrice)).toFixed(2)}`
    : null;

  const imageUrl =
    product.images && product.images.length > 0
      ? product.images[0].url
      : 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80';

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (isOutOfStock) return;

    setIsAdding(true);
    try {
      await addToCart(product.id, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err) {
      console.error('Failed to add item to cart:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setWishlistLoading(true);
    try {
      await toggleWishlist(product.id);
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="group card-glass-hover overflow-hidden flex flex-col justify-between transition-all duration-300 border border-slate-800/80 hover:border-brand-500/40">
      <div className="relative aspect-square w-full bg-slate-900/80 overflow-hidden">
        <Link to={`/products/${product.id}`} className="block w-full h-full">
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Fallback placeholder image if image fails to load
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80';
            }}
          />
        </Link>

        {/* Category & Stock Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
          {product.category && (
            <span className="px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[11px] font-medium text-brand-300 tracking-wide uppercase">
              {product.category.name}
            </span>
          )}

          {isOutOfStock ? (
            <span className="badge-status bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px]">
              <PackageX className="w-3 h-3" /> Out of Stock
            </span>
          ) : stock < 5 ? (
            <span className="badge-status bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
              Only {stock} left
            </span>
          ) : null}
        </div>

        {/* Wishlist Heart Toggle */}
        <button
          onClick={handleWishlistToggle}
          disabled={wishlistLoading}
          aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
          className={`absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md ${
            inWishlist
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
              : 'bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-900 border border-slate-800'
          }`}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Product Information & Footer Actions */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <Link
            to={`/products/${product.id}`}
            className="font-bold text-white group-hover:text-brand-400 transition-colors line-clamp-1 text-base"
          >
            {product.name}
          </Link>
          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-lg font-extrabold text-white">{priceFormatted}</span>
            {comparePriceFormatted && (
              <span className="text-xs text-slate-500 line-through -mt-1">
                {comparePriceFormatted}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isAdding || isOutOfStock}
            className={`py-2 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 ${
              justAdded
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : isOutOfStock
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                  : 'btn-primary py-2 px-3.5 text-xs'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5" /> Added
              </>
            ) : isAdding ? (
              <>
                <Sparkles className="w-3.5 h-3.5 animate-spin" /> Adding...
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" /> {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
