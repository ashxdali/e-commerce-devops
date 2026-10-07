import React from 'react';
import { Package, Search, Filter } from 'lucide-react';
import EmptyState from '../components/EmptyState.js';

export const ProductsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Package className="w-8 h-8 text-brand-400" /> Product Catalog
          </h1>
          <p className="text-sm text-slate-400">
            Catalog REST API endpoints will be integrated in Part 4.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search catalog..."
              disabled
              className="input-custom pl-9 py-2 text-xs w-48 opacity-60 cursor-not-allowed"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          </div>
          <button disabled className="btn-secondary py-2 px-3 text-xs gap-1.5 opacity-60 cursor-not-allowed">
            <Filter className="w-3.5 h-3.5" /> Filter
          </button>
        </div>
      </div>

      <EmptyState
        title="Catalog Unpopulated (Part 1 Foundation)"
        description="Product schema models and REST APIs will be created in Part 2 and Part 4."
      />
    </div>
  );
};

export default ProductsPage;
