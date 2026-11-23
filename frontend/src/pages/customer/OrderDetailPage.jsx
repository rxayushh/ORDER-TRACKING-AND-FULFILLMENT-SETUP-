import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Truck, Package, MapPin, Building, FileText, CheckCircle, Clock } from 'lucide-react';
import api from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        if (res.success) setOrder(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Order Not Found</h2>
        <Link to="/customer/orders" className="text-xs font-semibold text-brand-600 hover:underline">
          Return to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link to="/customer/orders" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to My Orders
      </Link>

      {/* Main Order Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Order Reference</span>
            <h1 className="text-2xl font-black text-slate-900 font-mono tracking-tight">{order.orderNumber}</h1>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={order.orderStatus} className="text-sm px-3.5 py-1" />
            {order.trackingNumber && (
              <Link
                to={`/tracking?trk=${order.trackingNumber}`}
                className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Truck className="w-4 h-4" /> Live Tracking
              </Link>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
          {/* Shipping Address */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
              <MapPin className="w-4 h-4 text-brand-600" /> Delivery Address
            </span>
            <p className="font-semibold text-slate-800">{order.shippingAddress?.recipientName}</p>
            <p className="text-slate-600">{order.shippingAddress?.streetAddress}</p>
            <p className="text-slate-600">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.postalCode}
            </p>
            <p className="font-mono text-slate-500 pt-1">{order.shippingAddress?.phoneNumber}</p>
          </div>

          {/* Fulfillment Hub */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
              <Building className="w-4 h-4 text-brand-600" /> Fulfillment Facility
            </span>
            <p className="font-semibold text-slate-800">{order.warehouseName || 'Central Hub'}</p>
            <p className="text-slate-500 font-mono">Carrier: {order.carrier || 'LogiTrack Express'}</p>
            <p className="text-slate-500 font-mono">Payment: {order.paymentStatus}</p>
          </div>

          {/* Shipment Code */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
            <span className="font-bold text-slate-900 flex items-center gap-1.5 mb-2">
              <Truck className="w-4 h-4 text-brand-600" /> Shipment Telemetry
            </span>
            <p className="font-mono font-bold text-brand-700 text-sm">
              {order.trackingNumber || 'Awaiting Dispatch'}
            </p>
            <p className="text-slate-500">Shipping Status: {order.shippingStatus || 'PREPARING'}</p>
          </div>
        </div>

        {/* Order Items Table */}
        <div className="pt-4 space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Package className="w-4 h-4 text-brand-600" /> Order Items ({order.totalItems})
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-2.5 px-3">Item Details</th>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3 text-right">Unit Price</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {order.items?.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 px-3 font-semibold text-slate-900">{item.productName}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{item.sku}</td>
                    <td className="py-3 px-3 text-right font-mono">
                      ₹{item.unitPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">{item.quantity}</td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{item.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <div className="w-full max-w-xs space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span className="font-mono font-bold">₹{order.subtotal?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Shipping Fee</span>
                <span className="font-mono font-bold">
                  {order.shippingFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${order.shippingFee?.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>GST (5%)</span>
                <span className="font-mono font-bold">₹{order.taxAmount?.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex justify-between text-sm font-black text-slate-900">
                <span>Total Amount Paid</span>
                <span className="font-mono text-brand-700">₹{order.totalAmount?.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Status History Ledger */}
        {order.statusHistory && order.statusHistory.length > 0 && (
          <div className="pt-6 border-t border-slate-100 space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-brand-600" /> Status History Log
            </h3>
            <div className="space-y-2 text-xs">
              {order.statusHistory.map((h) => (
                <div key={h.id} className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusBadge status={h.newStatus} />
                    <span className="text-slate-700">{h.comments}</span>
                  </div>
                  <span className="font-mono text-slate-400">
                    {new Date(h.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
