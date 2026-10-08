import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart,
  Heart,
  Check,
  Package,
  PackageX,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  Sparkles,
} from 'lucide-react';
import catalogService, { Product } from '../services/catalog.service';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [justAdded, setJustAdded] = useState<boolean>(false);
  const [wishlistLoading, setWishlistLoading] = useState<boolean>(false);

  const fetchProduct = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await catalogService.getProductById(id);
      setProduct(data);
      if (data.images && data.images.length > 0) {
        setSelectedImage(data.images[0].url);
      } else {
        setSelectedImage(
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
        );
      }
    } catch (err: unknown) {
      console.error('Failed to load product details:', err);
      setError('Product not found or unable to fetch details from server.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  if (isLoading) {
    return <LoadingState message="Fetching product specifications..." />;
  }

  if (error || !product) {
    return <ErrorState title="Product Not Found" message={error || 'The requested product could not be found.'} onRetry={fetchProduct} />;
  }

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

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (isOutOfStock) return;

    setIsAdding(true);
    try {
      await addToCart(product.id, quantity);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 2000);
    } catch (err) {
      console.error('Add to cart failed:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleWishlistToggle = async () => {
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
    <div className="space-y-8">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-white transition-colors">
          Home
        </Link>
        <span>/</span>
        <Link to="/products" className="hover:text-white transition-colors">
          Products
        </Link>
        <span>/</span>
        <span className="text-slate-200 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Left: Product Images Gallery */}
        <div className="space-y-4">
          <div className="aspect-square w-full rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden relative group">
            <img
              src={selectedImage}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80';
              }}
            />
            {product.category && (
              <span className="absolute top-4 left-4 px-3 py-1 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs font-semibold text-brand-400">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                    selectedImage === img.url
                      ? 'border-brand-500 ring-2 ring-brand-500/20'
                      : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Controls */}
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">
                SKU: {product.sku}
              </span>
              {isOutOfStock ? (
                <span className="badge-status bg-rose-500/10 text-rose-400 border-rose-500/20">
                  <PackageX className="w-3.5 h-3.5" /> Out of Stock
                </span>
              ) : (
                <span className="badge-success">
                  <Package className="w-3.5 h-3.5" /> In Stock ({stock} available)
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {product.name}
            </h1>
          </div>

          {/* Price Header */}
          <div className="flex items-baseline gap-4 border-y border-slate-800/80 py-4">
            <span className="text-3xl font-extrabold text-white">{priceFormatted}</span>
            {comparePriceFormatted && (
              <span className="text-base text-slate-500 line-through">
                {comparePriceFormatted}
              </span>
            )}
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 ml-auto">
              In Stock & Ready to Ship
            </span>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Product Overview
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Action Row */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              {/* Quantity Picker */}
              <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 p-1">
                <button
                  disabled={quantity <= 1 || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-40"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-bold text-white text-sm">
                  {quantity}
                </span>
                <button
                  disabled={quantity >= stock || isOutOfStock}
                  onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
                  className="w-9 h-9 flex items-center justify-center text-slate-400 hover:text-white disabled:opacity-40"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCart}
                disabled={isAdding || isOutOfStock}
                className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  justAdded
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : isOutOfStock
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                      : 'btn-primary'
                }`}
              >
                {justAdded ? (
                  <>
                    <Check className="w-5 h-5" /> Added to Cart!
                  </>
                ) : isAdding ? (
                  <>
                    <Sparkles className="w-5 h-5 animate-spin" /> Adding...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />{' '}
                    {isOutOfStock ? 'Currently Out of Stock' : 'Add to Shopping Cart'}
                  </>
                )}
              </button>

              {/* Wishlist Button */}
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                aria-label={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-center ${
                  inWishlist
                    ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/30'
                    : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800'
                }`}
              >
                <Heart className={`w-5 h-5 ${inWishlist ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>

          {/* Guarantee Badges */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
            <div className="flex items-center gap-3 card-glass p-3">
              <Truck className="w-5 h-5 text-brand-400" />
              <div>
                <h4 className="font-bold text-xs text-white">Fast Worldwide Shipping</h4>
                <p className="text-[11px] text-slate-400">Automated dispatch logistics</p>
              </div>
            </div>
            <div className="flex items-center gap-3 card-glass p-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="font-bold text-xs text-white">Authentic Hardware</h4>
                <p className="text-[11px] text-slate-400">Manufacturer warranty included</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
