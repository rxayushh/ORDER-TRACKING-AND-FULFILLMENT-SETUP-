import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Users,
  Warehouse,
  Truck,
  BarChart3,
  MapPin,
  ClipboardList,
  Sliders,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ portal = 'customer' }) => {
  const { user, isAdmin, isWarehouseManager } = useAuth();

  const customerLinks = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/customer/orders', label: 'My Orders', icon: ShoppingBag },
    { to: '/customer/profile', label: 'Profile & Addresses', icon: MapPin },
    { to: '/tracking', label: 'Shipment Tracking', icon: Truck },
    { to: '/catalog', label: 'Order Supplies', icon: Package },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Analytics Dashboard', icon: BarChart3 },
    { to: '/admin/orders', label: 'All Orders', icon: ShoppingBag },
    { to: '/admin/products', label: 'Product Catalog', icon: Package },
    { to: '/admin/categories', label: 'Categories', icon: Layers },
    { to: '/admin/customers', label: 'Customers', icon: Users },
    { to: '/admin/users', label: 'User Management', icon: ShieldCheck },
    { to: '/admin/warehouses', label: 'Warehouses', icon: Warehouse },
    { to: '/warehouse/queue', label: 'Fulfillment Queue', icon: ClipboardList },
    { to: '/warehouse/inventory', label: 'Stock Allocations', icon: Sliders },
  ];

  const warehouseLinks = [
    { to: '/warehouse', label: 'Hub Dashboard', icon: LayoutDashboard },
    { to: '/warehouse/queue', label: 'Fulfillment Queue', icon: ClipboardList },
    { to: '/warehouse/inventory', label: 'Inventory Auditing', icon: Sliders },
    { to: '/warehouse/orders', label: 'Order Register', icon: ShoppingBag },
  ];

  let links = customerLinks;
  let title = 'Customer Portal';

  if (portal === 'admin' || (portal === 'auto' && isAdmin())) {
    links = adminLinks;
    title = 'Admin Console';
  } else if (portal === 'warehouse' || (portal === 'auto' && isWarehouseManager())) {
    links = warehouseLinks;
    title = 'Fulfillment Center';
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200/80 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between shrink-0">
      <div>
        <div className="px-3 mb-6">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</p>
          <p className="text-sm font-semibold text-slate-800 mt-0.5 truncate">{user?.fullName}</p>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/admin' || link.to === '/warehouse' || link.to === '/dashboard'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                {link.label}
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">MCA Project Edition</p>
        <p className="mt-1">Full-Stack Java 21 + Spring Boot 3 + MySQL 8 + React</p>
      </div>
    </aside>
  );
};
