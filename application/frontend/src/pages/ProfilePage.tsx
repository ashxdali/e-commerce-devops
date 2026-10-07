import React from 'react';
import { User, ShieldAlert } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="border-b border-slate-800/80 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <User className="w-8 h-8 text-brand-400" /> User Profile
        </h1>
        <p className="text-sm text-slate-400">
          User profile management placeholder.
        </p>
      </div>

      <div className="card-glass p-8 space-y-4 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 mx-auto">
          <ShieldAlert className="w-8 h-8 text-brand-400" />
        </div>
        <h3 className="text-xl font-bold text-white">Authentication Required (Part 3)</h3>
        <p className="text-sm text-slate-300 max-w-md mx-auto">
          User accounts, profiles, JWT token storage, and secure profile management will be implemented during Part 3.
        </p>
      </div>
    </div>
  );
};

export default ProfilePage;
