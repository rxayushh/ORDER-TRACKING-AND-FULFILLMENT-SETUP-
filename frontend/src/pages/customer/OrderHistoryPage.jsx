import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Truck, XCircle, FileText } from 'lucide-react';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';

export const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/customer/orders');
      if (res.success) {
        setOrders(res.data.content || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? Allocated stock will be restored.')) return;
    try {
      const res = await api.post(`/orders/${orderId}/cancel?reason=CustomerRequested`);
      if (res.success) {
        alert('Order cancelled successfully');
        fetchOrders();
      }
    } catch (err) {
      alert(err.message || 'Cannot cancel order in current state');
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Order History</h1>
        <p className="text-xs text-slate-500 mt-1">Review past procurements, track shipments, or request cancellations</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No orders found in your account history.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-4">Tracking Code</th>
                  <th className="py-3 px-4">Placed Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Warehouse</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {orders.map((order) => {
                  const canCancel = order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED';
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        <Link to={`/customer/orders/${order.id}`} className="hover:text-brand-600">
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-xs">
                        {order.trackingNumber ? (
                          <Link to={`/tracking?trk=${order.trackingNumber}`} className="text-brand-600 hover:underline">
                            {order.trackingNumber}
                          </Link>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 font-mono">
                        {new Date(order.createdAt).toLocaleDateString('en-IN')}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={order.orderStatus} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 truncate max-w-[150px]">
                        {order.warehouseName || 'Central Hub'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                        ₹{order.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2">
                        {order.trackingNumber && (
                          <Link
                            to={`/tracking?trk=${order.trackingNumber}`}
                            className="px-2.5 py-1 text-xs font-semibold bg-brand-50 text-brand-700 rounded-lg hover:bg-brand-100"
                          >
                            Track
                          </Link>
                        )}
                        <Link
                          to={`/customer/orders/${order.id}`}
                          className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                        >
                          View
                        </Link>
                        {canCancel && (
                          <button
                            onClick={() => handleCancel(order.id)}
                            className="px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
