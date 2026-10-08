import React from 'react';
import { ShoppingBag } from 'lucide-react';
import EmptyState from '../components/EmptyState';

export const OrdersPage: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="border-b border-slate-800/80 pb-6">
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <ShoppingBag className="w-8 h-8 text-brand-400" /> Order History
        </h1>
        <p className="text-sm text-slate-400">
          Order placement and status tracking demo interface.
        </p>
      </div>

      <EmptyState
        title="No Orders Found"
        description="Order management and checkout processing will be available in future releases."
      />
    </div>
  );
};

export default OrdersPage;
