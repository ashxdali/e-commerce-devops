import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Server, ShieldCheck, Database, CheckCircle2, Sparkles, Layers } from 'lucide-react';
import apiClient from '../services/api';
import catalogService, { Product, Category } from '../services/catalog.service';
import ProductCard from '../components/ProductCard';
import ProductSkeleton from '../components/ProductSkeleton';
import ErrorState from '../components/ErrorState';

interface HealthData {
  status: string;
  service: string;
  timestamp: string;
}

export const HomePage: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthStatus, setHealthStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const loadData = async () => {
    setLoadingData(true);
    setDataError(null);
    try {
      // 1. Health check
      apiClient
        .get('/health')
        .then((res) => {
          setHealth(res.data);
          setHealthStatus('success');
        })
        .catch(() => {
          setHealthStatus('error');
        });

      // 2. Fetch products & categories in parallel
      const [prodRes, catRes] = await Promise.all([
        catalogService.getProducts({ limit: 6, sortBy: 'createdAt', sortOrder: 'desc' }),
        catalogService.getCategories(),
      ]);

      setFeaturedProducts(prodRes.data || []);
      setCategories(catRes || []);
    } catch (err: unknown) {
      console.error('HomePage data load error:', err);
      setDataError('Failed to connect to catalog API. Please ensure the backend service is running.');
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden card-glass p-8 md:p-14 border-brand-500/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
            ENTERPRISE E-COMMERCE PLATFORM
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Next-Gen AI & <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400">Cloud-Native Store</span>
          </h1>

          <p className="text-lg text-slate-300 font-normal leading-relaxed">
            Discover cutting-edge gadgets, developer gear, and cloud infrastructure hardware. High performance microservices storefront powered by modern DevOps principles.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/products" className="btn-primary gap-2 text-base px-6 py-3">
              Browse Catalog <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/categories" className="btn-secondary gap-2 text-base px-6 py-3">
              <Layers className="w-4 h-4 text-brand-400" /> Explore Categories
            </Link>
          </div>
        </div>
      </section>

      {/* Backend API Connection Status */}
      <section className="card-glass p-5 flex flex-wrap items-center justify-between gap-4 border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-brand-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Express REST Backend Connectivity</h3>
            <p className="text-xs text-slate-400">Microservice status health check endpoint</p>
          </div>
        </div>

        <div>
          {healthStatus === 'loading' && <span className="badge-warning">Connecting to backend...</span>}
          {healthStatus === 'success' && (
            <span className="badge-success">
              <CheckCircle2 className="w-3.5 h-3.5" /> API Active ({health?.service})
            </span>
          )}
          {healthStatus === 'error' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
              API Offline (Port 5000)
            </span>
          )}
        </div>
      </section>

      {/* Categories Showcase */}
      {categories.length > 0 && (
        <section className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Layers className="w-6 h-6 text-brand-400" /> Shop by Category
              </h2>
              <p className="text-xs text-slate-400">Curated hardware and developer gear collections</p>
            </div>
            <Link to="/categories" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/products?categoryId=${cat.id}`}
                className="card-glass-hover p-5 flex flex-col justify-between space-y-3 group"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base group-hover:text-brand-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{cat.description || 'Explore products'}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products Showcase */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-brand-400" /> Featured Products
            </h2>
            <p className="text-xs text-slate-400">Hand-picked items from our high quality catalog</p>
          </div>
          <Link to="/products" className="text-xs font-semibold text-brand-400 hover:text-brand-300 flex items-center gap-1">
            Browse All Products <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {dataError ? (
          <ErrorState message={dataError} onRetry={loadData} />
        ) : loadingData ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="card-glass p-8 text-center text-slate-400">
            No products available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* Architectural Feature Pillars */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <div className="card-glass-hover p-6 space-y-3 border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Server className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Decoupled API Tier</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Clean client-server contract using Axios interceptors and RESTful JSON endpoints.
          </p>
        </div>

        <div className="card-glass-hover p-6 space-y-3 border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Prisma PostgreSQL Data</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Data integrity enforced via relational constraints, indexes, and inventory validations.
          </p>
        </div>

        <div className="card-glass-hover p-6 space-y-3 border-slate-800">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">JWT & RBAC Security</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Stateless access authorization with BCrypt password hashing and session management.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
