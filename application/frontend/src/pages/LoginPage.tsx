import React from 'react';
import { Lock, Mail, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LoginPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto py-8">
      <div className="card-glass p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600/20 border border-brand-500/30 flex items-center justify-center text-brand-400 mx-auto">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white">Sign In to Nexus</h2>
          <p className="text-sm text-slate-400">
            Authentication logic will be implemented in Part 3.
          </p>
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div>
            <label className="label-custom">Email Address</label>
            <div className="relative">
              <input
                type="email"
                disabled
                placeholder="user@example.com (Part 3 feature)"
                className="input-custom pl-10 cursor-not-allowed opacity-60"
              />
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <div>
            <label className="label-custom">Password</label>
            <div className="relative">
              <input
                type="password"
                disabled
                placeholder="•••••••• (Part 3 feature)"
                className="input-custom pl-10 cursor-not-allowed opacity-60"
              />
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
            </div>
          </div>

          <button type="button" disabled className="btn-primary w-full gap-2">
            Sign In (Disabled in Part 1) <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-400 hover:underline font-semibold">
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
