import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Package, ShoppingCart, User, LogOut, Search, Menu, X, Shield, Warehouse, Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isAdmin, isWarehouseManager } = useAuth();
  const { totalItemsCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [trackQuery, setTrackQuery] = useState('');
  const navigate = useNavigate();

  const handleTrackSearch = (e) => {
    e.preventDefault();
    if (trackQuery.trim()) {
      navigate(`/tracking?trk=${encodeURIComponent(trackQuery.trim())}`);
      setTrackQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900 group-hover:text-brand-600 transition-colors">
                Logi<span className="text-brand-600">Track</span>
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 rounded">
                Enterprise
              </span>
            </div>
          </Link>

          {/* Quick Tracking Search Bar */}
          <form onSubmit={handleTrackSearch} className="hidden md:flex items-center flex-1 max-w-xs relative">
            <input
              type="text"
              placeholder="Track number (TRK-...)"
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-100/80 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:bg-white focus:border-brand-500 transition-all font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
          </form>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/catalog" className="hover:text-brand-600 transition-colors">Products</Link>
            <Link to="/tracking" className="hover:text-brand-600 transition-colors">Live Tracking</Link>
            {isAdmin() && (
              <Link to="/admin" className="flex items-center gap-1.5 text-brand-700 hover:text-brand-800 font-semibold">
                <Shield className="w-4 h-4" /> Admin Console
              </Link>
            )}
            {isWarehouseManager() && (
              <Link to="/warehouse" className="flex items-center gap-1.5 text-purple-700 hover:text-purple-800 font-semibold">
                <Warehouse className="w-4 h-4" /> Fulfillment Hub
              </Link>
            )}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-3">
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="relative p-2 text-slate-700 hover:text-brand-600 hover:bg-slate-100 rounded-xl transition-colors"
              title="Cart"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
                  {totalItemsCount}
                </span>
              )}
            </Link>

            {/* Auth Dropdown / Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to={isAdmin() ? '/admin' : isWarehouseManager() ? '/warehouse' : '/dashboard'}
                  className="flex items-center gap-2 py-1.5 px-3 bg-slate-100 hover:bg-slate-200/80 rounded-xl text-xs font-semibold text-slate-800 transition-colors"
                >
                  <User className="w-4 h-4 text-brand-600" />
                  <span className="hidden sm:inline max-w-[120px] truncate">{user?.fullName || 'My Account'}</span>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-slate-600 hover:text-slate-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <form onSubmit={handleTrackSearch} className="relative mb-3">
            <input
              type="text"
              placeholder="Track number (TRK-...)"
              value={trackQuery}
              onChange={(e) => setTrackQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 rounded-lg focus:outline-none font-mono"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          </form>
          <Link
            to="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
          >
            Product Catalog
          </Link>
          <Link
            to="/tracking"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
          >
            Live Tracking
          </Link>
          {isAuthenticated && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-slate-700 hover:text-brand-600"
              >
                Customer Orders &amp; Profile
              </Link>
              {isAdmin() && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-semibold text-brand-600"
                >
                  Admin Portal
                </Link>
              )}
              {isWarehouseManager() && (
                <Link
                  to="/warehouse"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 text-sm font-semibold text-purple-600"
                >
                  Warehouse Fulfillment Hub
                </Link>
              )}
            </>
          )}
        </div>
      )}
    </header>
  );
};
