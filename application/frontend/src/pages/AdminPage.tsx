import React from 'react';
import { Shield, Server, Activity } from 'lucide-react';

export const AdminPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-slate-800/80 pb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
            <Shield className="w-8 h-8 text-brand-400" /> Platform Admin Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            System administration & infrastructure monitoring placeholder.
          </p>
        </div>
        <span className="badge-brand">Part 1 Architecture Mode</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-glass p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Backend API Status</span>
            <Server className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-white">Online (Port 5000)</p>
          <p className="text-xs text-slate-500">Node.js Express TypeScript process</p>
        </div>

        <div className="card-glass p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">Prisma ORM</span>
            <Activity className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-2xl font-bold text-white">Initialized</p>
          <p className="text-xs text-slate-500">PostgreSQL migrations ready for Part 2</p>
        </div>

        <div className="card-glass p-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">DevOps Pipeline</span>
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">Stage 1 of 27</p>
          <p className="text-xs text-slate-500">Future stages: Docker, K8s, Jenkins, ELK</p>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
