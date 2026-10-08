import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Heart, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 mt-auto text-slate-400 text-sm">
      <div className="container-custom py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <span className="font-bold text-white tracking-tight text-lg">Nexus Store Platform</span>
            </div>
            <p className="text-slate-400 text-sm max-w-md">
              AI-Powered E-Commerce DevOps & Cloud-Native Delivery Platform foundation architecture. Designed for high availability, microservices delivery, and automated operations.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Quick Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-brand-400 transition-colors">Store Home</Link></li>
              <li><Link to="/products" className="hover:text-brand-400 transition-colors">Product Catalog</Link></li>
              <li><Link to="/categories" className="hover:text-brand-400 transition-colors">Categories</Link></li>
              <li><Link to="/cart" className="hover:text-brand-400 transition-colors">Shopping Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-brand-400 transition-colors">Wishlist</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-3 text-xs uppercase tracking-wider">Tech Stack</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-brand-400" /> React 18 + Vite + TypeScript</li>
              <li className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-emerald-400" /> Node.js Express REST API</li>
              <li className="flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5 text-blue-400" /> Prisma ORM + PostgreSQL</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} AI-Powered E-Commerce DevOps Platform.</p>
          <div className="flex items-center gap-1">
            <span>Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>for Cloud Native Engineering</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
