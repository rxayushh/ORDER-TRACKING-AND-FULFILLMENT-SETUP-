import React, { useEffect, useState } from 'react';
import { Search, Users } from 'lucide-react';
import api from '../../services/api';

export const AdminCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async (nextPage = page, query = search) => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/admin/customers', {
        params: { search: query || undefined, page: nextPage, size: 10 },
      });
      if (res.success) {
        setCustomers(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setPage(res.data.number || 0);
      }
    } catch (err) {
      setError(err.message || 'Could not load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(0, '');
  }, []);

  const onSearch = (e) => {
    e.preventDefault();
    load(0, search);
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Customers</h1>
        <p className="text-xs text-slate-500 mt-1">Registered customer accounts. Password hashes are never returned by this API.</p>
      </div>

      <form onSubmit={onSearch} className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl">
          Search
        </button>
      </form>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">{error}</div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-x-auto">
        {loading ? (
          <div className="p-10 text-xs text-slate-400 text-center">Loading customers...</div>
        ) : customers.length === 0 ? (
          <div className="p-10 text-center text-xs text-slate-400">
            <Users className="w-6 h-6 mx-auto mb-2 text-slate-300" />
            No customers match this search.
          </div>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4 text-center">Orders</th>
                <th className="py-3 px-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {customers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/60">
                  <td className="py-3 px-4 font-semibold text-slate-900">{customer.fullName}</td>
                  <td className="py-3 px-4 font-mono">{customer.email}</td>
                  <td className="py-3 px-4">{customer.phoneNumber || '—'}</td>
                  <td className="py-3 px-4 text-center font-bold">{customer.orderCount}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <button
            disabled={page === 0}
            onClick={() => load(page - 1, search)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-500">
            Page {page + 1} of {totalPages}
          </span>
          <button
            disabled={page + 1 >= totalPages}
            onClick={() => load(page + 1, search)}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
