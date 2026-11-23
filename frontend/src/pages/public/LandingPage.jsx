import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package,
  Truck,
  Shield,
  ArrowRight,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  BarChart,
  Warehouse,
  Boxes,
  Cpu
} from 'lucide-react';

export const LandingPage = () => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const navigate = useNavigate();

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/tracking?trk=${encodeURIComponent(trackingNumber.trim())}`);
    }
  };

  const sampleTracking = 'TRK-20261120-99482103';

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-brand-50/60 via-white to-slate-50 pt-16 pb-20 border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-800 text-xs font-semibold">
              <span className="flex h-2 w-2 rounded-full bg-brand-600 animate-ping" />
              MCA 3rd-Semester Major Project • Production-Grade Web Application
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Precision Order Tracking &amp;{' '}
              <span className="bg-gradient-to-r from-brand-600 to-indigo-600 bg-clip-text text-transparent">
                Warehouse Fulfillment
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              An enterprise full-stack order management ecosystem featuring multi-warehouse inventory allocation,
              strict stateful fulfillment lifecycles, and cryptographic tracking transparency.
            </p>

            {/* Live Tracking Search Widget */}
            <div className="pt-4 max-w-xl mx-auto">
              <form
                onSubmit={handleTrackSubmit}
                className="flex flex-col sm:flex-row items-center gap-2 p-2 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200"
              >
                <div className="relative flex-1 w-full">
                  <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    placeholder="Enter Tracking Number (e.g. TRK-20261120-99482103)"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 text-sm text-slate-900 bg-transparent rounded-xl focus:outline-none font-mono placeholder:font-sans"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 shrink-0"
                >
                  <Truck className="w-4 h-4" /> Track Order
                </button>
              </form>

              <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-500">
                <span>Quick demo:</span>
                <button
                  onClick={() => setTrackingNumber(sampleTracking)}
                  className="font-mono text-brand-600 hover:underline font-medium"
                >
                  {sampleTracking}
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Role Quick Access Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Role-Based Operational Architecture</h2>
          <p className="text-sm text-slate-500 mt-2">Engineered with Spring Security &amp; JWT role-based access control</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Customer */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Customer Experience</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Browse catalog, manage real-time cart, select addresses, execute simulated card checkout, and view step-by-step shipment timeline.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">customer@ordertrack.com</span>
              <Link to="/login" className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                Log In <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Warehouse Manager */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Warehouse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Warehouse Fulfillment</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Manage fulfillment queues, execute digital item picking, pack verified boxes, assign carrier tracking numbers, and audit stock levels.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">warehouse@ordertrack.com</span>
              <Link to="/login" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                Log In <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* System Administrator */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Admin Control &amp; Analytics</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Full-spectrum analytics, order overrides, catalog SKU creation, multi-warehouse setup, low-stock alerts, and user directory.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-mono text-slate-400">admin@ordertrack.com</span>
              <Link to="/login" className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                Log In <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Lifecycle Flow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold text-brand-400 uppercase tracking-widest">End-to-End Workflow</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold mt-2">Stateful Order &amp; Fulfillment Pipeline</h2>
            <p className="text-sm text-slate-400 mt-2">
              Every status change is audited in MySQL with timestamps, previous state, and actor logging.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {[
              { step: '1', title: 'Order Placed', desc: 'Validated & totals tallied' },
              { step: '2', title: 'Confirmed', desc: 'Stock reserved in hub' },
              { step: '3', title: 'Processing', desc: 'Warehouse item picking' },
              { step: '4', title: 'Packed', desc: 'Boxed & barcode tagged' },
              { step: '5', title: 'Shipped', desc: 'Carrier GPS transit' },
              { step: '6', title: 'Delivered', desc: 'Doorstep completion' },
            ].map((s, idx) => (
              <div key={idx} className="bg-slate-800/60 p-4 rounded-xl border border-slate-700/50">
                <span className="w-7 h-7 mx-auto rounded-full bg-brand-500 text-white text-xs font-bold flex items-center justify-center mb-2">
                  {s.step}
                </span>
                <p className="text-xs font-bold text-white">{s.title}</p>
                <p className="text-[11px] text-slate-400 mt-1">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
