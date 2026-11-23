import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Search, Filter, Edit3, Truck, Eye } from 'lucide-react';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = {
        size: 50,
        ...(statusFilter ? { status: statusFilter } : {}),
        ...(search ? { search } : {}),
      };
      const res = await api.get('/admin/orders', { params });
      if (res.success) setOrders(res.data.content || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, search]);

  const openStatusModal = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.orderStatus);
    setStatusRemarks('');
    setIsModalOpen(true);
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    if (!selectedOrder) return;
    try {
      const res = await api.put(`/orders/${selectedOrder.id}/status`, {
        newStatus,
        comments: statusRemarks || `Admin updated order state to ${newStatus}`,
      });
      if (res.success) {
        setIsModalOpen(false);
        fetchOrders();
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const statuses = [
    'PENDING',
    'CONFIRMED',
    'PROCESSING',
    'PACKED',
    'SHIPPED',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
    'RETURN_REQUESTED',
    'RETURNED',
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Order Lifecycle Register</h1>
        <p className="text-xs text-slate-500 mt-1">Audit complete system orders, examine logistics telemetry, and transition states</p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by order #, email, customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs text-slate-400 font-semibold">Filter:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            >
              <option value="">All Statuses</option>
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Fulfillment Hub</th>
                <th className="py-3 px-4">Tracking Code</th>
                <th className="py-3 px-4">Date Placed</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 font-mono text-right">Amount</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <Link to={`/customer/orders/${order.id}`} className="hover:text-brand-600">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <p className="font-semibold text-slate-800">{order.customerName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{order.customerEmail}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{order.warehouseName || 'Unassigned'}</td>
                  <td className="py-3 px-4 font-mono text-xs">
                    {order.trackingNumber ? (
                      <Link to={`/tracking?trk=${order.trackingNumber}`} className="text-brand-600 hover:underline">
                        {order.trackingNumber}
                      </Link>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">
                    {new Date(order.createdAt).toLocaleDateString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={order.orderStatus} />
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-right text-slate-900">
                    ₹{order.totalAmount?.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => openStatusModal(order)}
                      className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg inline-flex items-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" /> State
                    </button>
                    <Link
                      to={`/customer/orders/${order.id}`}
                      className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg inline-block"
                      title="Inspect Order"
                    >
                      <Eye className="w-4 h-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Transition Order ${selectedOrder?.orderNumber}`}
      >
        <form onSubmit={handleStatusUpdate} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">New Target State</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-bold font-mono"
            >
              {statuses.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Audit Log Comments / Remarks</label>
            <textarea
              rows={3}
              required
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
              placeholder="e.g. Cleared customs and received at regional delivery depot"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl"
          >
            Confirm Status Transition
          </button>
        </form>
      </Modal>
    </div>
  );
};
