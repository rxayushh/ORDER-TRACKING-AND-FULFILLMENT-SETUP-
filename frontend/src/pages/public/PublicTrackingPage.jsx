import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Truck,
  Search,
  Package,
  MapPin,
  Calendar,
  Building,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText
} from 'lucide-react';
import api from '../../services/api';
import { TimelineTracker } from '../../components/TimelineTracker';
import { StatusBadge } from '../../components/StatusBadge';

export const PublicTrackingPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTrack = searchParams.get('trk') || '';
  const [trackingNumber, setTrackingNumber] = useState(initialTrack);
  const [trackingData, setTrackingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchTracking = async (numberToTrack) => {
    if (!numberToTrack || !numberToTrack.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.get(`/tracking/${encodeURIComponent(numberToTrack.trim())}`);
      if (res.success && res.data) {
        setTrackingData(res.data);
      } else {
        setError('No tracking record found for this number.');
      }
    } catch (err) {
      setError(err.message || 'Tracking number not found. Please verify the code.');
      setTrackingData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialTrack) {
      fetchTracking(initialTrack);
    }
  }, [initialTrack]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setSearchParams({ trk: trackingNumber.trim() });
      fetchTracking(trackingNumber.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto mb-2">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Real-Time Order Tracking</h1>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Cryptographically transparent shipment milestones powered by LogiTrack fulfillment network
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="flex gap-2 p-2 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            required
            placeholder="Enter tracking number (e.g. TRK-20261120-99482103)"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors shrink-0 disabled:opacity-50"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-bold">Tracking Lookup Failed</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Tracking Data Content */}
      {trackingData && (
        <div className="space-y-6">
          {/* Main Shipment Summary Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-md p-6 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tracking Code</span>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                  {trackingData.trackingNumber}
                </h2>
                <p className="text-xs text-slate-500 mt-1 font-mono">Order Ref: {trackingData.orderNumber}</p>
              </div>

              <div className="text-right">
                <span className="text-xs text-slate-400 block mb-1">Current Milestone</span>
                <StatusBadge status={trackingData.currentStatus} className="text-sm px-3 py-1" />
              </div>
            </div>

            {/* Quick Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 flex items-center gap-1 mb-1 font-medium">
                  <Truck className="w-3.5 h-3.5 text-brand-600" /> Carrier
                </span>
                <p className="font-bold text-slate-800">{trackingData.carrier}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 flex items-center gap-1 mb-1 font-medium">
                  <Calendar className="w-3.5 h-3.5 text-brand-600" /> Estimated Delivery
                </span>
                <p className="font-bold text-slate-800">
                  {trackingData.estimatedDelivery
                    ? new Date(trackingData.estimatedDelivery).toLocaleDateString('en-IN', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })
                    : 'Calculating...'}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 flex items-center gap-1 mb-1 font-medium">
                  <Building className="w-3.5 h-3.5 text-brand-600" /> Origin Hub
                </span>
                <p className="font-bold text-slate-800 truncate">{trackingData.originWarehouse}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-slate-400 flex items-center gap-1 mb-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-brand-600" /> Destination
                </span>
                <p className="font-bold text-slate-800 truncate">
                  {trackingData.destinationCity}, {trackingData.destinationState}
                </p>
              </div>
            </div>

            {/* Visual Step Timeline */}
            <div className="pt-4">
              <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-600" /> Shipment Progression Milestones
              </h3>
              <TimelineTracker timeline={trackingData.timeline} currentStatus={trackingData.currentStatus} />
            </div>
          </div>

          {/* Audit History Logs Table */}
          {trackingData.statusLogs && trackingData.statusLogs.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-600" /> Timestamped Status Event Ledger
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-3">Timestamp</th>
                      <th className="py-2.5 px-3">Previous State</th>
                      <th className="py-2.5 px-3">New State</th>
                      <th className="py-2.5 px-3">Remarks / Comments</th>
                      <th className="py-2.5 px-3">Logged By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {trackingData.statusLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/60">
                        <td className="py-2.5 px-3 font-mono text-slate-500 whitespace-nowrap">
                          {new Date(log.createdAt).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3">
                          {log.previousStatus ? (
                            <StatusBadge status={log.previousStatus} />
                          ) : (
                            <span className="text-slate-400 font-mono">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={log.newStatus} />
                        </td>
                        <td className="py-2.5 px-3 text-slate-700 font-medium">{log.comments}</td>
                        <td className="py-2.5 px-3 font-mono text-slate-400">{log.updatedBy}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
