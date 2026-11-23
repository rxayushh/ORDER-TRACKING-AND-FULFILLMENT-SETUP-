import React from 'react';
import { CheckCircle2, Clock, Truck, Package, Box, MapPin, AlertCircle, Home } from 'lucide-react';

const stepIcons = {
  PENDING: Clock,
  CONFIRMED: CheckCircle2,
  PROCESSING: Box,
  PACKED: Package,
  SHIPPED: Truck,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: Home,
  CANCELLED: AlertCircle,
};

export const TimelineTracker = ({ timeline = [], currentStatus }) => {
  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
      {timeline.map((item, idx) => {
        const IconComponent = stepIcons[item.step] || Clock;
        const isDone = item.isCompleted;
        const isCurrent = item.isCurrent;

        let iconBg = 'bg-slate-100 text-slate-400 border-slate-300';
        if (isDone) {
          iconBg = 'bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-200';
        }
        if (isCurrent) {
          iconBg = 'bg-amber-500 text-white border-amber-500 ring-4 ring-amber-100 animate-pulse';
        }

        return (
          <div key={idx} className="relative flex items-start gap-4 group">
            {/* Step Node */}
            <div
              className={`absolute -left-6 sm:-left-8 w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center transition-all ${iconBg}`}
            >
              <IconComponent className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>

            {/* Step Content */}
            <div className="flex-1 bg-white p-4 rounded-xl border border-slate-100 shadow-xs hover:border-slate-200 transition-colors">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className={`text-sm font-bold ${isCurrent ? 'text-amber-700' : isDone ? 'text-slate-900' : 'text-slate-400'}`}>
                  {item.label}
                </span>
                {item.timestamp && (
                  <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                    {new Date(item.timestamp).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
