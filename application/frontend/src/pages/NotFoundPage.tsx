import React from 'react';
import { HelpCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 card-glass text-center my-12 max-w-lg mx-auto border-brand-500/20">
      <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-400 mb-6 shadow-xl">
        <HelpCircle className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-extrabold text-white mb-2">404 Page Not Found</h1>
      <p className="text-sm text-slate-400 mb-8">
        The application page or route you requested could not be located.
      </p>
      <Link to="/" className="btn-primary gap-2">
        <ArrowLeft className="w-4 h-4" /> Return to Homepage
      </Link>
    </div>
  );
};

export default NotFoundPage;
