import React from 'react';

export const StatsCard = ({ title, value, icon: Icon, change, trend = 'up', color = 'brand', subtitle }) => {
  const colorStyles = {
    brand: 'bg-brand-50 text-brand-600 border-brand-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{value}</h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${colorStyles[color] || colorStyles.brand}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {(change || subtitle) && (
        <div className="mt-3 flex items-center gap-2 text-xs">
          {change && (
            <span className={`font-semibold ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
              {trend === 'up' ? '↑' : '↓'} {change}
            </span>
          )}
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
        </div>
      )}
    </div>
  );
};
