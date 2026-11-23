import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Warehouse, ClipboardList, PackageCheck, Truck, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { StatsCard } from '../../components/StatsCard';
import { StatusBadge } from '../../components/StatusBadge';

export const WarehouseDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWarehouseData = async () => {
      try {
        const res = await api.get('/dashboard/warehouse');
        if (res.success) setData(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchWarehouseData();
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Fulfillment Operations Center</h1>
          <p className="text-xs text-slate-500 mt-1">Manage pick &amp; pack queue, verify parcels, assign tracking carriers</p>
        </div>
        <Link
          to="/warehouse/queue"
          className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <ClipboardList className="w-4 h-4" /> Open Full Queue
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatsCard
          title="Awaiting Processing"
          value={data?.awaitingProcessing || 0}
          icon={ClipboardList}
          color="amber"
          subtitle="Orders awaiting item pick"
        />
        <StatsCard
          title="Packed &amp; Staged"
          value={data?.packedOrders || 0}
          icon={PackageCheck}
          color="purple"
          subtitle="Ready for carrier dispatch"
        />
        <StatsCard
          title="Dispatched Total"
          value={data?.dispatchedOrders || 0}
          icon={Truck}
          color="emerald"
          subtitle="In transit with carriers"
        />
      </div>

      {/* Urgent Fulfillment Queue Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <ClipboardList className="w-4 h-4 text-purple-600" /> High-Priority Fulfillment Queue
          </h3>
          <Link to="/warehouse/queue" className="text-xs font-semibold text-purple-600 hover:underline">
            Manage Complete Queue
          </Link>
        </div>

        {(!data?.urgentQueue || data.urgentQueue.length === 0) ? (
          <div className="text-center py-10 text-xs text-slate-400">
            Queue is clear! All confirmed orders are currently picked and dispatched.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Facility</th>
                  <th className="py-2.5 px-3">Items</th>
                  <th className="py-2.5 px-3">Destination</th>
                  <th className="py-2.5 px-3">Fulfillment Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {data.urgentQueue.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                      <Link to={`/customer/orders/${item.orderId}`} className="hover:text-purple-600">
                        {item.orderNumber}
                      </Link>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{item.warehouseName}</td>
                    <td className="py-2.5 px-3 font-mono">{item.totalItems} items</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.destinationCity}</td>
                    <td className="py-2.5 px-3">
                      <StatusBadge status={item.fulfillmentStatus} />
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <Link
                        to="/warehouse/queue"
                        className="px-2.5 py-1 text-xs font-semibold bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg inline-block"
                      >
                        Process Order
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
