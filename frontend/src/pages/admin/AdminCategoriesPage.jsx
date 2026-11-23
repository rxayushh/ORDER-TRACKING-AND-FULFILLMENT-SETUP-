import React, { useEffect, useState } from 'react';
import { Layers, Pencil, Plus, Trash2 } from 'lucide-react';
import api from '../../services/api';
import { Modal } from '../../components/Modal';

const emptyForm = { name: '', slug: '', description: '', imageUrl: '' };

export const AdminCategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/categories');
      if (res.success) setCategories(res.data || []);
    } catch (err) {
      setError(err.message || 'Could not load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const openEdit = (category) => {
    setEditing(category);
    setForm({
      name: category.name || '',
      slug: category.slug || '',
      description: category.description || '',
      imageUrl: category.imageUrl || '',
    });
    setIsModalOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    try {
      const payload = {
        name: form.name,
        slug: form.slug || undefined,
        description: form.description || null,
        imageUrl: form.imageUrl || null,
      };
      const res = editing
        ? await api.put(`/admin/categories/${editing.id}`, payload)
        : await api.post('/admin/categories', payload);
      if (res.success) {
        setIsModalOpen(false);
        setMessage(editing ? 'Category updated.' : 'Category created.');
        await load();
      }
    } catch (err) {
      setError(err.message || 'Could not save category');
    }
  };

  const remove = async (category) => {
    if (!window.confirm(`Delete category "${category.name}"? This only works when no products use it.`)) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/admin/categories/${category.id}`);
      setMessage('Category deleted.');
      await load();
    } catch (err) {
      setError(err.message || 'Could not delete category');
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Categories</h1>
          <p className="text-xs text-slate-500 mt-1">Catalog groups used by product search and the storefront</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl inline-flex items-center gap-1.5 self-start"
        >
          <Plus className="w-4 h-4" /> Add category
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">{message}</div>
      )}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">{error}</div>
      )}

      {loading ? (
        <div className="h-40 bg-white rounded-3xl border border-slate-200 animate-pulse" />
      ) : categories.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-xs text-slate-400">
          <Layers className="w-6 h-6 mx-auto mb-2 text-slate-300" />
          No categories yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900">{category.name}</h2>
                  <p className="text-[11px] font-mono text-slate-400 mt-0.5">{category.slug}</p>
                </div>
                <Layers className="w-4 h-4 text-brand-600" />
              </div>
              <p className="text-xs text-slate-600 min-h-8">{category.description || 'No description'}</p>
              <div className="flex gap-3">
                <button onClick={() => openEdit(category)} className="text-xs font-semibold text-brand-700 inline-flex items-center gap-1">
                  <Pencil className="w-3.5 h-3.5" /> Edit
                </button>
                <button onClick={() => remove(category)} className="text-xs font-semibold text-rose-600 inline-flex items-center gap-1">
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editing ? 'Edit category' : 'New category'}>
        <form onSubmit={save} className="space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            Name
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            Slug
            <input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="Generated from the name if left blank"
              className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            Description
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </label>
          <button type="submit" className="w-full py-2.5 bg-brand-600 text-white text-xs font-semibold rounded-xl">
            {editing ? 'Update category' : 'Create category'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
