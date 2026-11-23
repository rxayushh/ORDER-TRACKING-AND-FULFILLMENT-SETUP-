import React, { useCallback, useEffect, useState } from 'react';
import { Search, Shield, UserCog } from 'lucide-react';
import api from '../../services/api';

const ROLES = ['ROLE_CUSTOMER', 'ROLE_WAREHOUSE_MANAGER', 'ROLE_ADMIN'];

export const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async (nextPage = 0, query = '') => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/admin/users', { params: { page: nextPage, size: 20, search: query || undefined } });
      if (response.success) {
        setUsers(response.data.content || []);
        setPage(response.data.number || 0);
        setTotalPages(response.data.totalPages || 0);
        setDrafts(Object.fromEntries((response.data.content || []).map((user) => [user.id, {
          roles: user.roles,
          enabled: user.enabled,
        }])));
      }
    } catch (err) {
      setError(err.message || 'Could not load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggleRole = (id, role) => {
    setDrafts((current) => {
      const draft = current[id];
      const roles = draft.roles.includes(role)
        ? draft.roles.filter((item) => item !== role)
        : [...draft.roles, role];
      return { ...current, [id]: { ...draft, roles } };
    });
  };

  const save = async (user) => {
    setSavingId(user.id);
    setError('');
    setMessage('');
    try {
      await api.put(`/admin/users/${user.id}`, drafts[user.id]);
      setMessage(`Updated permissions for ${user.email}.`);
      await load(page, search);
    } catch (err) {
      setError(err.message || 'Could not save user permissions');
    } finally {
      setSavingId(null);
    }
  };

  const submitSearch = (event) => {
    event.preventDefault();
    load(0, search);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6 sm:p-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          <UserCog className="h-7 w-7 text-brand-600" /> User Management
        </h1>
        <p className="mt-1 text-xs text-slate-500">Manage account access and role assignments. Passwords are never shown here.</p>
      </div>

      {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">{error}</div>}
      {message && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">{message}</div>}

      <form onSubmit={submitSearch} className="flex gap-3 rounded-3xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name or email" className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs" />
        </div>
        <button className="rounded-xl bg-brand-600 px-4 py-2 text-xs font-semibold text-white">Search</button>
      </form>

      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
        {loading ? <p className="p-10 text-center text-xs text-slate-500">Loading users…</p> : users.length === 0 ? <p className="p-10 text-center text-xs text-slate-500">No users found.</p> : (
          <table className="w-full min-w-[900px] text-left text-xs">
            <thead className="border-b border-slate-100 bg-slate-50 uppercase tracking-wide text-slate-500">
              <tr><th className="px-4 py-3">Account</th><th className="px-4 py-3">Roles</th><th className="px-4 py-3">Access</th><th className="px-4 py-3 text-right">Action</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const draft = drafts[user.id] || { roles: user.roles, enabled: user.enabled };
                const changed = draft.enabled !== user.enabled || ROLES.some((role) => draft.roles.includes(role) !== user.roles.includes(role));
                return (
                  <tr key={user.id} className="align-top hover:bg-slate-50/50">
                    <td className="px-4 py-4">
                      <p className="font-semibold text-slate-900">{user.fullName}</p>
                      <p className="mt-1 font-mono text-slate-500">{user.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-3">
                        {ROLES.map((role) => (
                          <label key={role} className="flex items-center gap-1.5 text-slate-600">
                            <input type="checkbox" checked={draft.roles.includes(role)} onChange={() => toggleRole(user.id, role)} />
                            {role.replace('ROLE_', '')}
                          </label>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <label className="flex items-center gap-2 text-slate-600">
                        <input type="checkbox" checked={draft.enabled} onChange={(event) => setDrafts((current) => ({ ...current, [user.id]: { ...current[user.id], enabled: event.target.checked } }))} />
                        {draft.enabled ? 'Enabled' : 'Disabled'}
                      </label>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button disabled={!changed || savingId === user.id || draft.roles.length === 0} onClick={() => save(user)} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">
                        <Shield className="h-3.5 w-3.5" /> {savingId === user.id ? 'Saving…' : 'Save access'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {totalPages > 1 && <div className="flex items-center justify-end gap-3 text-xs text-slate-500">
        <button disabled={page === 0} onClick={() => load(page - 1, search)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Previous</button>
        Page {page + 1} of {totalPages}
        <button disabled={page + 1 >= totalPages} onClick={() => load(page + 1, search)} className="rounded-lg border px-3 py-1.5 disabled:opacity-40">Next</button>
      </div>}
    </div>
  );
};
