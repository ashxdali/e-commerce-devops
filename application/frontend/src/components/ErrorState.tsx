import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while communicating with backend services.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-10 card-glass border-rose-500/30 bg-rose-950/20 text-center my-8 max-w-lg mx-auto">
      <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-sm text-slate-300 mb-6">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn-secondary gap-2">
          <RefreshCw className="w-4 h-4" /> Retry Action
        </button>
      )}
    </div>
  );
};

export default ErrorState;
