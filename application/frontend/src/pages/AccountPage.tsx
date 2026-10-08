import React from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { User, Mail, Shield, Phone, Calendar, LogOut, ShoppingBag, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LoadingState from '../components/LoadingState';

export const AccountPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return <LoadingState message="Restoring account session..." />;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const createdDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Active Account';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <User className="w-8 h-8 text-brand-400" /> Account Dashboard
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your personal profile and authenticated platform preferences
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="btn-secondary py-2 px-4 text-xs gap-2 text-rose-400 border-rose-500/20 hover:bg-rose-500/10 self-start sm:self-auto"
        >
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>

      {/* User Information Card */}
      <div className="card-glass p-8 space-y-6 border-slate-800">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white font-extrabold text-2xl flex items-center justify-center shadow-lg shadow-brand-500/25">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user.name}</h2>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`badge-status ${
                user.role === 'ADMIN'
                  ? 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                  : 'bg-brand-500/10 text-brand-400 border-brand-500/30'
              }`}
            >
              <Shield className="w-3.5 h-3.5" /> {user.role} Role
            </span>
            <span className="badge-success">Active Session</span>
          </div>
        </div>

        {/* Detail Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5 text-brand-400" /> Email Address
            </div>
            <p className="font-medium text-white">{user.email}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Phone className="w-3.5 h-3.5 text-brand-400" /> Contact Phone
            </div>
            <p className="font-medium text-white">{user.phone || 'Not provided'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-brand-400" /> Account Created
            </div>
            <p className="font-medium text-white">{createdDate}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <User className="w-3.5 h-3.5 text-brand-400" /> Unique User Identifier
            </div>
            <p className="font-mono text-xs text-slate-300 truncate">{user.id}</p>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/products"
          className="card-glass-hover p-5 flex items-center justify-between group border-slate-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Browse Catalog</h4>
              <p className="text-[11px] text-slate-400">View store items</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-brand-400 transition-colors" />
        </Link>

        <Link
          to="/wishlist"
          className="card-glass-hover p-5 flex items-center justify-between group border-slate-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Saved Wishlist</h4>
              <p className="text-[11px] text-slate-400">View items</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-rose-400 transition-colors" />
        </Link>

        <Link
          to="/cart"
          className="card-glass-hover p-5 flex items-center justify-between group border-slate-800"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-white text-sm">Shopping Cart</h4>
              <p className="text-[11px] text-slate-400">View cart items</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
        </Link>
      </div>
    </div>
  );
};

export default AccountPage;
