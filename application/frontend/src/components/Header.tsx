import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  ShoppingCart,
  Heart,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Home,
  Grid,
  Layers,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();

  const navLinks = [
    { name: 'Home', path: '/', icon: Home },
    { name: 'Products', path: '/products', icon: Grid },
    { name: 'Categories', path: '/categories', icon: Layers },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
  };

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
      <div className="container-custom flex items-center justify-between h-16">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 group-hover:scale-105 transition-transform duration-200">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-brand-400 transition-colors">
              NEXUS<span className="text-brand-500">.</span>STORE
            </span>
            <span className="text-[10px] font-mono text-slate-400 tracking-wider uppercase -mt-1">
              Cloud-Native Architecture
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  active
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right Header Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Wishlist Link */}
          <Link
            to="/wishlist"
            className={`relative p-2.5 rounded-xl border transition-all duration-200 ${
              isActive('/wishlist')
                ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800'
            }`}
            title="Wishlist"
          >
            <Heart className="w-5 h-5" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md animate-pulse">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Link */}
          <Link
            to="/cart"
            className={`relative p-2.5 rounded-xl border transition-all duration-200 ${
              isActive('/cart')
                ? 'bg-brand-500/10 text-brand-400 border-brand-500/20'
                : 'bg-slate-900 text-slate-300 hover:text-white border-slate-800 hover:bg-slate-800'
            }`}
            title="Cart"
          >
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-brand-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth State Buttons */}
          {isAuthenticated ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <Link
                to="/account"
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 ${
                  isActive('/account')
                    ? 'bg-brand-500/10 text-brand-400 border-brand-500/30'
                    : 'bg-slate-900 text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-[11px] font-bold">
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="max-w-[100px] truncate">{user?.name || 'Account'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-rose-400 border border-slate-800 hover:bg-rose-500/10 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-secondary text-xs py-2 px-4">
                Sign In
              </Link>
              <Link to="/register" className="btn-primary text-xs py-2 px-4">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl bg-slate-900 text-slate-300 hover:text-white border border-slate-800"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-800 bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium ${
                  active
                    ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                {link.name}
              </Link>
            );
          })}

          <Link
            to="/wishlist"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium ${
              isActive('/wishlist')
                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-3">
              <Heart className="w-5 h-5" /> Wishlist
            </span>
            {wishlistCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-xs font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>

          <Link
            to="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-medium ${
              isActive('/cart')
                ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <span className="flex items-center gap-3">
              <ShoppingCart className="w-5 h-5" /> Cart
            </span>
            {cartCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-brand-500 text-white text-xs font-bold">
                {cartCount}
              </span>
            )}
          </Link>

          <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-200 bg-slate-800"
                >
                  <UserIcon className="w-5 h-5 text-brand-400" /> Account Profile ({user?.name})
                </Link>
                <button
                  onClick={handleLogout}
                  className="btn-secondary w-full text-center py-2.5 text-rose-400 border-rose-500/20"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-secondary w-full text-center py-2.5"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary w-full text-center py-2.5"
                >
                  Register Account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
