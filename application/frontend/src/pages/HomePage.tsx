import React, { useEffect, useState } from 'react';
import { ArrowRight, Server, ShieldCheck, Database, Cpu, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api.js';

interface HealthData {
  status: string;
  service: string;
  timestamp: string;
}

export const HomePage: React.FC = () => {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [healthStatus, setHealthStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    apiClient
      .get('/health')
      .then((res) => {
        setHealth(res.data);
        setHealthStatus('success');
      })
      .catch(() => {
        setHealthStatus('error');
      });
  }, []);

  return (
    <div className="space-y-12 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden card-glass p-8 md:p-14 border-brand-500/20">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="max-w-3xl space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-400 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-brand-400 animate-ping" />
            PART 1: APPLICATION ARCHITECTURE COMPLETE
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
            Next-Gen AI & <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-400">Cloud-Native Platform</span>
          </h1>

          <p className="text-lg text-slate-300 font-normal leading-relaxed">
            Enterprise-grade e-commerce storefront designed for multi-tier microservices, continuous delivery, and intelligent automated operations.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link to="/products" className="btn-primary gap-2 text-base px-6 py-3">
              Explore Catalog <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="http://localhost:5000/health"
              target="_blank"
              rel="noreferrer"
              className="btn-secondary gap-2 text-base px-6 py-3"
            >
              <Server className="w-4 h-4 text-brand-400" /> Backend API Status
            </a>
          </div>
        </div>
      </section>

      {/* Real-Time Backend Connectivity Badge */}
      <section className="card-glass p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-brand-400">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm">Express REST Backend Connection</h3>
            <p className="text-xs text-slate-400">Endpoint: http://localhost:5000/health</p>
          </div>
        </div>

        <div>
          {healthStatus === 'loading' && (
            <span className="badge-warning">Connecting to backend...</span>
          )}
          {healthStatus === 'success' && (
            <div className="flex items-center gap-3">
              <span className="badge-success">
                <CheckCircle2 className="w-3.5 h-3.5" /> API Connected: {health?.service}
              </span>
            </div>
          )}
          {healthStatus === 'error' && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
              API Disconnected (Start backend on port 5000)
            </span>
          )}
        </div>
      </section>

      {/* Feature Pillar Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-glass-hover p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
            <Server className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Decoupled Architecture</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Strict client-server separation via REST API. Frontend never accesses PostgreSQL directly.
          </p>
        </div>

        <div className="card-glass-hover p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Prisma & PostgreSQL Ready</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Data layer initialized and structured cleanly for upcoming Part 2 schema migrations.
          </p>
        </div>

        <div className="card-glass-hover p-6 space-y-3">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Operational Security</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Helmet security headers, CORS origin protection, structured logging & centralized operational errors.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
