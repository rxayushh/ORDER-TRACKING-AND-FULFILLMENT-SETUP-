import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ClipboardList,
  PackageCheck,
  Truck,
  Box,
  CheckCircle,
  Search,
  Filter,
  Eye,
  Send,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { Modal } from '../../components/Modal';

export const FulfillmentQueuePage = () => {
  const [queue, setQueue] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Dispatch Action Modal State
  const [dispatchItem, setDispatchItem] = useState(null);
  const [carrier, setCarrier] = useState('LogiTrack Express');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const params = {
        size: 50,
        ...(selectedWarehouse ? { warehouseId: selectedWarehouse } : {}),
        ...(statusFilter ? { status: statusFilter } : {}),
      };
      const res = await api.get('/warehouse/fulfillment', { params });
      if (res.success) setQueue(res.data.content || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses');
      if (res.success) setWarehouses(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [selectedWarehouse, statusFilter]);

  const handleSimpleAction = async (orderId, actionName) => {
    try {
      const res = await api.post(`/warehouse/orders/${orderId}/action`, {
        action: actionName,
        notes: `Executed ${actionName} by warehouse operator`,
      });
      if (res.success) {
        fetchQueue();
      }
    } catch (err) {
      alert(err.message || 'Action failed');
    }
  };

  const openDispatchModal = (item) => {
    setDispatchItem(item);
    setCarrier('LogiTrack Express');
    setTrackingNumber(item.trackingNumber || `TRK-${Date.now().toString().slice(-8)}`);
    setDispatchNotes('Package picked up by courier service');
    setIsDispatchModalOpen(true);
  };

  const handleDispatchSubmit = async (e) => {
    e.preventDefault();
    if (!dispatchItem) return;
    try {
      const res = await api.post(`/warehouse/orders/${dispatchItem.orderId}/action`, {
        action: 'DISPATCH',
        carrier,
        trackingNumber,
        notes: dispatchNotes,
      });
      if (res.success) {
        setIsDispatchModalOpen(false);
        fetchQueue();
      }
    } catch (err) {
      alert(err.message || 'Dispatch failed');
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Fulfillment Dispatch Queue
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Execute sequential picking, packing, quality checks, and carrier handover
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-2">
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <select
              value={selectedWarehouse}
              onChange={(e) => setSelectedWarehouse(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            >
              <option value="">All Fulfillment Hubs</option>
              {warehouses.map((w) => (
                <option key={w.id} value={w.id}>{w.code} - {w.location}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            >
              <option value="">All Processing Stages</option>
              <option value="AWAITING_PROCESSING">Awaiting Processing</option>
              <option value="PICKED">Picked</option>
              <option value="PACKED">Packed &amp; Staged</option>
              <option value="DISPATCHED">Dispatched</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {/* Queue Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4 text-center">Items Qty</th>
                <th className="py-3 px-4">Fulfillment Stage</th>
                <th className="py-3 px-4">Tracking Number</th>
                <th className="py-3 px-4 text-right">Fulfillment Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {queue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    <Link to={`/customer/orders/${item.orderId}`} className="hover:text-purple-600">
                      {item.orderNumber}
                    </Link>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{item.warehouseCode}</td>
                  <td className="py-3 px-4 text-slate-600">{item.destinationCity}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold">{item.totalItems}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={item.fulfillmentStatus} />
                  </td>
                  <td className="py-3 px-4 font-mono text-xs">
                    {item.trackingNumber ? (
                      <Link to={`/tracking?trk=${item.trackingNumber}`} className="text-brand-600 hover:underline">
                        {item.trackingNumber}
                      </Link>
                    ) : (
                      <span className="text-slate-400">Pre-dispatch</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    {/* Step 1: PICK */}
                    {item.fulfillmentStatus === 'AWAITING_PROCESSING' && (
                      <button
                        onClick={() => handleSimpleAction(item.orderId, 'PICK')}
                        className="px-3 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs rounded-lg inline-flex items-center gap-1 shadow-xs"
                      >
                        <Box className="w-3.5 h-3.5" /> Pick Items
                      </button>
                    )}

                    {/* Step 2: PACK */}
                    {item.fulfillmentStatus === 'PICKED' && (
                      <button
                        onClick={() => handleSimpleAction(item.orderId, 'PACK')}
                        className="px-3 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-xs rounded-lg inline-flex items-center gap-1 shadow-xs"
                      >
                        <PackageCheck className="w-3.5 h-3.5" /> Pack Parcel
                      </button>
                    )}

                    {/* Step 3: DISPATCH */}
                    {item.fulfillmentStatus === 'PACKED' && (
                      <button
                        onClick={() => openDispatchModal(item)}
                        className="px-3 py-1 bg-emerald-600 text-white hover:bg-emerald-700 font-semibold text-xs rounded-lg inline-flex items-center gap-1 shadow-xs shadow-emerald-500/20"
                      >
                        <Truck className="w-3.5 h-3.5" /> Dispatch
                      </button>
                    )}

                    {/* Step 4: OUT FOR DELIVERY */}
                    {item.fulfillmentStatus === 'DISPATCHED' && item.orderStatus !== 'OUT_FOR_DELIVERY' && item.orderStatus !== 'DELIVERED' && (
                      <button
                        onClick={() => handleSimpleAction(item.orderId, 'OUT_FOR_DELIVERY')}
                        className="px-2.5 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 font-semibold text-xs rounded-lg"
                      >
                        Out for Delivery
                      </button>
                    )}

                    {/* Step 5: DELIVER */}
                    {item.orderStatus === 'OUT_FOR_DELIVERY' && (
                      <button
                        onClick={() => handleSimpleAction(item.orderId, 'DELIVER')}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs rounded-lg inline-flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Delivered
                      </button>
                    )}

                    {item.fulfillmentStatus === 'COMPLETED' && (
                      <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title={`Handover Order ${dispatchItem?.orderNumber} to Carrier`}
      >
        <form onSubmit={handleDispatchSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Carrier Partner</label>
            <select
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl"
            >
              <option value="LogiTrack Express">LogiTrack Express (Standard Fleet)</option>
              <option value="BlueDart Surface">BlueDart Surface</option>
              <option value="Delhivery Logistics">Delhivery Logistics</option>
              <option value="FedEx Industrial">FedEx Industrial Logistics</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Assigned Tracking AWB Number</label>
            <input
              type="text"
              required
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl font-mono"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Handover Audit Remarks</label>
            <textarea
              rows={2}
              value={dispatchNotes}
              onChange={(e) => setDispatchNotes(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl"
          >
            Confirm Dispatch &amp; Activate Tracking
          </button>
        </form>
      </Modal>
    </div>
  );
};
