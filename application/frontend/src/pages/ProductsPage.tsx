import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Package, Search, Filter, RefreshCw, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import catalogService, { Product, Category } from '../services/catalog.service';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';

export const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL State & Filter Values
  const initialCategory = searchParams.get('categoryId') || '';
  const initialSearch = searchParams.get('search') || '';

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'createdAt'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState<number>(1);
  const [limit] = useState<number>(9);

  // Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Load Categories list
  useEffect(() => {
    catalogService
      .getCategories()
      .then((cats) => setCategories(cats))
      .catch((err) => console.error('Failed to load categories:', err));
  }, []);

  // Fetch Products based on current filters
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await catalogService.getProducts({
        page,
        limit,
        search: searchQuery || undefined,
        categoryId: selectedCategory || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy,
        sortOrder,
      });

      setProducts(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
      setTotalProducts(response.meta?.total || 0);
    } catch (err: unknown) {
      console.error('Error fetching products:', err);
      setError('Unable to load product catalog. Please verify backend service.');
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, searchQuery, selectedCategory, minPrice, maxPrice, sortBy, sortOrder]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Sync category from URL search params when changed
  useEffect(() => {
    const urlCat = searchParams.get('categoryId');
    if (urlCat !== null && urlCat !== selectedCategory) {
      setSelectedCategory(urlCat);
      setPage(1);
    }
  }, [searchParams, selectedCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="space-y-8">
      {/* Header & Search Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Package className="w-8 h-8 text-brand-400" /> Product Catalog
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Explore our cloud-native store inventory ({totalProducts} item{totalProducts === 1 ? '' : 's'})
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="input-custom pl-9 text-xs"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
          <button type="submit" className="btn-primary py-2 px-4 text-xs">
            Search
          </button>
        </form>
      </div>

      {/* Filter Control Toolbar */}
      <div className="card-glass p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end border-slate-800">
        {/* Category Filter */}
        <div>
          <label className="label-custom flex items-center gap-1">
            <Filter className="w-3 h-3 text-brand-400" /> Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setPage(1);
              if (e.target.value) {
                setSearchParams({ categoryId: e.target.value });
              } else {
                setSearchParams({});
              }
            }}
            className="input-custom py-2 text-xs"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range Filter */}
        <div>
          <label className="label-custom flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3 text-brand-400" /> Price Range ($)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="input-custom py-2 text-xs w-full"
            />
            <span className="text-slate-600">-</span>
            <input
              type="number"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="input-custom py-2 text-xs w-full"
            />
          </div>
        </div>

        {/* Sort By Dropdown */}
        <div>
          <label className="label-custom">Sort By</label>
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [val, ord] = e.target.value.split('-');
              setSortBy(val as 'name' | 'price' | 'createdAt');
              setSortOrder(ord as 'asc' | 'desc');
              setPage(1);
            }}
            className="input-custom py-2 text-xs"
          >
            <option value="createdAt-desc">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>

        {/* Reset Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleResetFilters}
            className="btn-secondary w-full py-2 px-3 text-xs gap-1.5 justify-center"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
          </button>
        </div>
      </div>

      {/* Main Catalog Section */}
      {error ? (
        <ErrorState message={error} onRetry={fetchProducts} />
      ) : isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(limit)].map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No Products Found"
          description="We couldn't find any products matching your selected search or filter criteria."
          actionText="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between card-glass p-4 border-slate-800">
              <span className="text-xs text-slate-400">
                Page <strong className="text-white">{page}</strong> of <strong className="text-white">{totalPages}</strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="btn-secondary py-1.5 px-3 text-xs gap-1 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="btn-secondary py-1.5 px-3 text-xs gap-1 disabled:opacity-40"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ProductsPage;
