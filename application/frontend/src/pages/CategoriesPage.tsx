import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Layers, ArrowRight, Package, Sparkles } from 'lucide-react';
import catalogService, { Category } from '../services/catalog.service';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

export const CategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await catalogService.getCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setError('Unable to retrieve categories from API server.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (isLoading) {
    return <LoadingState message="Loading catalog categories..." />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchCategories} />;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <Layers className="w-8 h-8 text-brand-400" /> Product Categories
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Explore specialized store collections for developers and cloud engineering
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?categoryId=${cat.id}`}
            className="card-glass-hover p-6 flex flex-col justify-between space-y-4 group border-slate-800 hover:border-brand-500/40"
          >
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6" />
              </div>

              {cat._count?.products !== undefined && (
                <span className="badge-brand text-xs">
                  <Package className="w-3.5 h-3.5" /> {cat._count.products} Products
                </span>
              )}
            </div>

            <div>
              <h3 className="text-xl font-bold text-white group-hover:text-brand-400 transition-colors mb-1">
                {cat.name}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {cat.description || 'Discover items in this product category.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-semibold text-brand-400 group-hover:text-brand-300">
              <span>View Collection</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CategoriesPage;
