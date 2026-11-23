import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Package, Lock, Mail, ArrowRight, ShieldCheck, Warehouse, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('admin@ordertrack.com');
  const [password, setPassword] = useState('Admin@123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.roles.includes('ROLE_ADMIN')) {
        navigate('/admin');
      } else if (data.roles.includes('ROLE_WAREHOUSE_MANAGER')) {
        navigate('/warehouse');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const applyDemoUser = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl shadow-slate-200/50 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center mx-auto shadow-md shadow-brand-500/20">
            <Package className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Sign in to LogiTrack</h2>
          <p className="text-xs text-slate-500">Access role-based portal with authenticated credentials</p>
        </div>

        {/* 1-Click Quick Demo Login Switcher */}
        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            Instant Demo Account Switcher
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => applyDemoUser('admin@ordertrack.com', 'Admin@123')}
              className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                email === 'admin@ordertrack.com'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin
            </button>
            <button
              type="button"
              onClick={() => applyDemoUser('warehouse@ordertrack.com', 'Warehouse@123')}
              className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                email === 'warehouse@ordertrack.com'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Warehouse className="w-4 h-4" />
              Warehouse
            </button>
            <button
              type="button"
              onClick={() => applyDemoUser('customer@ordertrack.com', 'Customer@123')}
              className={`p-2 rounded-xl text-xs font-semibold flex flex-col items-center gap-1 transition-all ${
                email === 'customer@ordertrack.com'
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <User className="w-4 h-4" />
              Customer
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@domain.com"
                className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:underline">
            Register now
          </Link>
        </p>
      </div>
    </div>
  );
};
