import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle2,
  Users,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Package,
  Layers
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import api from '../../services/api';
import { StatsCard } from '../../components/StatsCard';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const res = await api.get('/dashboard/admin');
        if (res.success) setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const COLORS = ['#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#ef4444'];

  return (
    <div className="p-6 sm:p-8 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Executive Operations Console
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          High-level revenue metrics, fulfillment pipeline health, and inventory telemetry
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Revenue"
          value={`₹${(data?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="emerald"
          change="18.4%"
          subtitle="vs last month"
        />
        <StatsCard
          title="Total Orders"
          value={data?.totalOrders || 0}
          icon={ShoppingBag}
          color="brand"
          change="12%"
          subtitle="lifetime volume"
        />
        <StatsCard
          title="Pending / Processing"
          value={(data?.pendingOrders || 0) + (data?.processingOrders || 0)}
          icon={Clock}
          color="amber"
          subtitle="requires dispatch"
        />
        <StatsCard
          title="Low Stock Alerts"
          value={data?.lowStockCount || 0}
          icon={AlertTriangle}
          color="rose"
          subtitle="items below threshold"
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-brand-600" /> Revenue Trajectory
              </h3>
              <p className="text-[11px] text-slate-400">Monthly gross sales volume</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.salesAnalytics || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(value) => [`₹${Number(value).toFixed(2)}`, 'Revenue']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Bar dataKey="revenue" fill="#0267c7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution Pie Chart */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-600" /> Order Status Distribution
            </h3>
            <p className="text-[11px] text-slate-400">Current active states</p>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data?.statusDistribution || []}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  innerRadius={45}
                  paddingAngle={4}
                >
                  {(data?.statusDistribution || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Orders & Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-brand-600" /> Recent System Orders
            </h3>
            <Link to="/admin/orders" className="text-xs font-semibold text-brand-600 hover:underline">
              Manage All Orders
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Customer</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {data?.recentOrders?.slice(0, 6).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      <Link to={`/customer/orders/${order.id}`} className="hover:text-brand-600">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-[130px]">
                      {order.customerName}
                    </td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={order.orderStatus} />
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      ₹{order.totalAmount?.toFixed(2)}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        to={`/customer/orders/${order.id}`}
                        className="text-xs font-semibold text-brand-600 hover:underline"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts (1 col) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Stock Depletion Alerts
            </h3>
            <Link to="/warehouse/inventory" className="text-xs font-semibold text-brand-600 hover:underline">
              Audit
            </Link>
          </div>

          <div className="space-y-3">
            {(!data?.lowStockProducts || data.lowStockProducts.length === 0) ? (
              <p className="text-xs text-slate-400 text-center py-6">All products healthy above safety threshold.</p>
            ) : (
              data.lowStockProducts.map((p) => (
                <div key={p.id} className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/60 flex items-center justify-between">
                  <div className="truncate pr-2">
                    <span className="text-[10px] font-mono text-amber-700 font-bold block">{p.sku}</span>
                    <p className="text-xs font-bold text-slate-800 truncate">{p.name}</p>
                    <span className="text-[11px] text-slate-500">Threshold: {p.lowStockThreshold}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="px-2 py-0.5 rounded-full text-xs font-black bg-rose-500 text-white font-mono">
                      {p.stockQuantity} left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
