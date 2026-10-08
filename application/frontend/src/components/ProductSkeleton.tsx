import React from 'react';

export const ProductSkeleton: React.FC = () => {
  return (
    <div className="card-glass overflow-hidden flex flex-col justify-between animate-pulse">
      <div className="aspect-square w-full bg-slate-800/60" />
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <div className="h-4 bg-slate-800 rounded w-3/4" />
          <div className="h-3 bg-slate-800/60 rounded w-full" />
          <div className="h-3 bg-slate-800/60 rounded w-2/3" />
        </div>
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
          <div className="h-6 bg-slate-800 rounded w-20" />
          <div className="h-9 bg-slate-800 rounded-xl w-28" />
        </div>
      </div>
    </div>
  );
};

export default ProductSkeleton;
