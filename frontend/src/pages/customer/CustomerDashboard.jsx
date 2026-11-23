import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, CheckCircle2, ArrowRight, Package, Calendar } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { StatsCard } from '../../components/StatsCard';
import { StatusBadge } from '../../components/StatusBadge';

export const CustomerDashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.get('/dashboard/customer');
        if (res.success) setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
          <div className="h-28 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage active orders, view invoices, and follow live transit</p>
        </div>
        <Link
          to="/catalog"
          className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors self-start sm:self-auto flex items-center gap-1.5"
        >
          <Package className="w-4 h-4" /> Browse Catalog
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatsCard
          title="Total Orders Placed"
          value={data?.totalOrders || 0}
          icon={ShoppingBag}
          color="brand"
          subtitle="Lifetime orders"
        />
        <StatsCard
          title="Active Shipments"
          value={data?.activeShipments || 0}
          icon={Truck}
          color="amber"
          subtitle="In picking or transit"
        />
        <StatsCard
          title="Delivered Orders"
          value={data?.deliveredOrders || 0}
          icon={CheckCircle2}
          color="emerald"
          subtitle="Successfully received"
        />
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-brand-600" /> Recent Orders &amp; Active Shipments
          </h2>
          <Link to="/customer/orders" className="text-xs font-semibold text-brand-600 hover:underline">
            View All Orders
          </Link>
        </div>

        {(!data?.recentOrders || data.recentOrders.length === 0) ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No orders found. Place your first order from our catalog!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">Order Number</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {data.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      <Link to={`/customer/orders/${order.id}`} className="hover:text-brand-600">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {new Date(order.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">{order.totalItems} items</td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={order.orderStatus} />
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
                        Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
