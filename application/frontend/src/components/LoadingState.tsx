import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading application data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 card-glass text-center my-8">
      <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
      <p className="text-sm font-medium text-slate-300">{message}</p>
    </div>
  );
};

export default LoadingState;
