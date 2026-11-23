import React from 'react';

const statusConfig = {
  // Order Statuses
  PENDING: { label: 'Pending', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  PROCESSING: { label: 'Processing', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  PACKED: { label: 'Packed', bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  SHIPPED: { label: 'Shipped', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', dot: 'bg-cyan-500' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', bg: 'bg-teal-50 text-teal-700 border-teal-200', dot: 'bg-teal-500' },
  DELIVERED: { label: 'Delivered', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  RETURN_REQUESTED: { label: 'Return Req.', bg: 'bg-orange-50 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  RETURNED: { label: 'Returned', bg: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-500' },

  // Fulfillment & Shipping Statuses
  AWAITING_PROCESSING: { label: 'Awaiting Pick', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  PICKED: { label: 'Picked', bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  READY_FOR_DISPATCH: { label: 'Ready Dispatch', bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  DISPATCHED: { label: 'Dispatched', bg: 'bg-cyan-50 text-cyan-700 border-cyan-200', dot: 'bg-cyan-500' },
  COMPLETED: { label: 'Completed', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  IN_TRANSIT: { label: 'In Transit', bg: 'bg-sky-50 text-sky-700 border-sky-200', dot: 'bg-sky-500' },
  PREPARING: { label: 'Preparing', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },

  // General Statuses
  ACTIVE: { label: 'Active', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  ARCHIVED: { label: 'Archived', bg: 'bg-slate-100 text-slate-600 border-slate-300', dot: 'bg-slate-400' },
  LOW_STOCK: { label: 'Low Stock', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
};

export const StatusBadge = ({ status, className = '' }) => {
  const norm = (status || '').toUpperCase();
  const cfg = statusConfig[norm] || { label: status || 'Unknown', bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};
