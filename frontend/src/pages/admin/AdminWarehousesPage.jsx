import React, { useState, useEffect } from 'react';
import { Warehouse, Plus, MapPin, Phone, Mail, User, Pencil } from 'lucide-react';
import api from '../../services/api';
import { Modal } from '../../components/Modal';

export const AdminWarehousesPage = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState(null);
  const [form, setForm] = useState({
    code: '',
    name: '',
    location: '',
    address: '',
    contactPerson: '',
    contactPhone: '',
    contactEmail: '',
    isActive: true,
  });

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/warehouses');
      if (res.success) setWarehouses(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const openCreate = () => {
    setEditingWarehouse(null);
    setForm({ code: '', name: '', location: '', address: '', contactPerson: '', contactPhone: '', contactEmail: '', isActive: true });
    setIsModalOpen(true);
  };

  const openEdit = (warehouse) => {
    setEditingWarehouse(warehouse);
    setForm({
      code: warehouse.code,
      name: warehouse.name,
      location: warehouse.location,
      address: warehouse.address,
      contactPerson: warehouse.contactPerson || '',
      contactPhone: warehouse.contactPhone || '',
      contactEmail: warehouse.contactEmail || '',
      isActive: warehouse.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = editingWarehouse
        ? await api.put(`/admin/warehouses/${editingWarehouse.id}`, form)
        : await api.post('/admin/warehouses', form);
      if (res.success) {
        setIsModalOpen(false);
        fetchWarehouses();
        setForm({
          code: '',
          name: '',
          location: '',
          address: '',
          contactPerson: '',
          contactPhone: '',
          contactEmail: '',
          isActive: true,
        });
      }
    } catch (err) {
      alert(err.message || 'Failed to add warehouse');
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Fulfillment Facilities</h1>
          <p className="text-xs text-slate-500 mt-1">Multi-hub warehouse management and regional dispatch points</p>
        </div>
        <button
          onClick={openCreate}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Fulfillment Center
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {warehouses.map((wh) => (
          <div
            key={wh.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                {wh.code}
              </span>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${wh.isActive ? 'text-emerald-600' : 'text-slate-500'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${wh.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`} /> {wh.isActive ? 'Operational' : 'Inactive'}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900">{wh.name}</h3>
              <p className="text-xs text-brand-600 font-medium flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5" /> {wh.location}
              </p>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">{wh.address}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <p className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-slate-400" /> {wh.contactPerson || 'Facility Head'}
              </p>
              <p className="flex items-center gap-2 font-mono">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {wh.contactPhone || '+91 99000 00000'}
              </p>
              <p className="flex items-center gap-2 font-mono">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> {wh.contactEmail || 'hub@ordertrack.com'}
              </p>
            </div>
            <button onClick={() => openEdit(wh)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900">
              <Pencil className="w-3.5 h-3.5" /> Edit facility
            </button>
          </div>
        ))}
      </div>

      {/* Add Warehouse Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingWarehouse ? 'Edit Fulfillment Facility' : 'Add Fulfillment Facility'}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Facility Code</label>
              <input
                type="text"
                required
                disabled={!!editingWarehouse}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="WH-KOL-04"
                className="w-full px-3 py-2 border rounded-xl font-mono uppercase disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Facility Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="East Hub Distribution"
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">City / Region Location</label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              placeholder="Dankuni, Kolkata"
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Complete Physical Address</label>
            <textarea
              rows={2}
              required
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Plot 12, Logistic Corridor, NH-19..."
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Contact Lead</label>
              <input
                type="text"
                value={form.contactPerson}
                onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="text"
                value={form.contactPhone}
                onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={form.contactEmail}
                onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl font-mono"
              />
            </div>
          </div>

          <label className="flex items-center gap-2 text-slate-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Warehouse is operational
          </label>

          <button
            type="submit"
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl"
          >
            {editingWarehouse ? 'Save Warehouse Changes' : 'Create Warehouse Facility'}
          </button>
        </form>
      </Modal>
    </div>
  );
};
