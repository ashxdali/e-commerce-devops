import React from 'react';
import { Link } from 'react-router-dom';
import { FileQuestion, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-6">
      <div className="card-glass p-8 space-y-6 border-slate-800">
        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-brand-400 mx-auto">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-white">404</h1>
          <h2 className="text-xl font-bold text-white">Page Not Found</h2>
          <p className="text-sm text-slate-400">
            The page or product route you are looking for does not exist or has been relocated.
          </p>
        </div>

        <Link to="/" className="btn-primary w-full gap-2 py-2.5">
          <ArrowLeft className="w-4 h-4" /> Return to Storefront
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
