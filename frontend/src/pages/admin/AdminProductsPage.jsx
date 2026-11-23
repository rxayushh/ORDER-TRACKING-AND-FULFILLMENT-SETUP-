import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Edit2, Trash2, AlertTriangle, Layers } from 'lucide-react';
import api from '../../services/api';
import { Modal } from '../../components/Modal';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState({
    sku: '',
    name: '',
    categoryId: '',
    price: '',
    stockQuantity: '',
    lowStockThreshold: '10',
    description: '',
    imageUrl: '',
    initialWarehouseId: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, whRes] = await Promise.all([
        api.get('/products', { params: { size: 50, search: search || undefined } }),
        api.get('/categories'),
        api.get('/warehouses'),
      ]);
      if (prodRes.success) setProducts(prodRes.data.content || []);
      if (catRes.success) setCategories(catRes.data || []);
      if (whRes.success) setWarehouses(whRes.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const openCreateModal = () => {
    setEditingProduct(null);
    setForm({
      sku: '',
      name: '',
      categoryId: categories[0]?.id || '',
      price: '',
      stockQuantity: '',
      lowStockThreshold: '10',
      description: '',
      imageUrl: '',
      initialWarehouseId: warehouses[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p) => {
    setEditingProduct(p);
    setForm({
      sku: p.sku,
      name: p.name,
      categoryId: p.categoryId || '',
      price: p.price,
      stockQuantity: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold || '10',
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      initialWarehouseId: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        const res = await api.put(`/admin/products/${editingProduct.id}`, {
          name: form.name,
          categoryId: form.categoryId ? Number(form.categoryId) : null,
          price: Number(form.price),
          stockQuantity: Number(form.stockQuantity),
          lowStockThreshold: Number(form.lowStockThreshold),
          description: form.description,
          imageUrl: form.imageUrl,
        });
        if (res.success) {
          setIsModalOpen(false);
          fetchData();
        }
      } else {
        const res = await api.post('/admin/products', {
          sku: form.sku,
          name: form.name,
          categoryId: form.categoryId ? Number(form.categoryId) : null,
          price: Number(form.price),
          stockQuantity: Number(form.stockQuantity),
          lowStockThreshold: Number(form.lowStockThreshold),
          description: form.description,
          imageUrl: form.imageUrl,
          initialWarehouseId: form.initialWarehouseId ? Number(form.initialWarehouseId) : null,
        });
        if (res.success) {
          setIsModalOpen(false);
          fetchData();
        }
      }
    } catch (err) {
      alert(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this product SKU?')) return;
    try {
      const res = await api.delete(`/admin/products/${id}`);
      if (res.success) fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Product Catalog Management</h1>
          <p className="text-xs text-slate-500 mt-1">Configure catalog SKUs, adjust thresholds, and allocate warehouse inventory</p>
        </div>
        <button
          onClick={openCreateModal}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Product SKU
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center gap-4 pb-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by SKU or name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Price</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4 text-center">Threshold</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.sku}</td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{p.name}</td>
                  <td className="py-3 px-4 text-slate-500">{p.categoryName || 'General'}</td>
                  <td className="py-3 px-4 font-mono font-bold text-right text-slate-900">
                    ₹{p.price?.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold">
                    <span className={p.isLowStock ? 'text-rose-600' : 'text-slate-800'}>
                      {p.stockQuantity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-slate-400">{p.lowStockThreshold}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg"
                      title="Edit Product"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(p.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                      title="Archive Product"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Edit Product SKU' : 'Create New Product SKU'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!editingProduct && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">SKU Code</label>
              <input
                type="text"
                required
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value.toUpperCase() })}
                placeholder="ELEC-NEW-01"
                className="w-full px-3 py-2 border rounded-xl font-mono uppercase"
              />
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Module Name"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Price (₹)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Stock Qty</label>
              <input
                type="number"
                min="0"
                required
                disabled={!!editingProduct}
                value={form.stockQuantity}
                onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Low Stock Alert Level</label>
              <input
                type="number"
                min="1"
                required
                value={form.lowStockThreshold}
                onChange={(e) => setForm({ ...form, lowStockThreshold: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl font-mono"
              />
            </div>
          </div>

          {!editingProduct && (
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Initial Allocation Warehouse</label>
              <select
                value={form.initialWarehouseId}
                onChange={(e) => setForm({ ...form, initialWarehouseId: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              >
                <option value="">Select Warehouse Hub</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Product Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl disabled:bg-slate-100 disabled:text-slate-500"
            />
              {editingProduct && <p className="mt-1 text-[11px] text-slate-500">Use Inventory Management to adjust stock at a warehouse.</p>}
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Image URL</label>
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 border rounded-xl font-mono text-xs"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl"
          >
            {editingProduct ? 'Save Product Updates' : 'Create Product SKU'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
