import React, { useState, useEffect } from 'react';
import { Sliders, Plus, Minus, Search, AlertTriangle, Building, Layers } from 'lucide-react';
import api from '../../services/api';
import { Modal } from '../../components/Modal';

export const WarehouseInventoryPage = () => {
  const [inventory, setInventory] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState('');
  const [loading, setLoading] = useState(true);

  // Adjustment Modal State
  const [adjustItem, setAdjustItem] = useState(null);
  const [quantityChange, setQuantityChange] = useState(10);
  const [isStockIn, setIsStockIn] = useState(true);
  const [reason, setReason] = useState('RESTOCK');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, whRes] = await Promise.all([
        api.get('/warehouse/inventory', {
          params: selectedWarehouse ? { warehouseId: selectedWarehouse } : {},
        }),
        api.get('/warehouses'),
      ]);
      if (invRes.success) setInventory(invRes.data);
      if (whRes.success) setWarehouses(whRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedWarehouse]);

  const openAdjustModal = (item, defaultIn = true) => {
    setAdjustItem(item);
    setIsStockIn(defaultIn);
    setQuantityChange(10);
    setReason(defaultIn ? 'RESTOCK' : 'DAMAGE_AUDIT');
    setIsModalOpen(true);
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    if (!adjustItem) return;
    try {
      const delta = isStockIn ? Math.abs(Number(quantityChange)) : -Math.abs(Number(quantityChange));
      const res = await api.post('/warehouse/inventory/adjust', {
        warehouseId: adjustItem.warehouseId,
        productId: adjustItem.productId,
        quantityChange: delta,
        reason,
      });
      if (res.success) {
        setIsModalOpen(false);
        fetchData();
      }
    } catch (err) {
      alert(err.message || 'Stock adjustment failed');
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Multi-Warehouse Inventory Stock</h1>
          <p className="text-xs text-slate-500 mt-1">Audit bin allocations, reserved units, and execute audited stock additions or write-offs</p>
        </div>

        <select
          value={selectedWarehouse}
          onChange={(e) => setSelectedWarehouse(e.target.value)}
          className="px-4 py-2 text-xs bg-white border border-slate-200 rounded-xl font-semibold shadow-xs self-start sm:self-auto"
        >
          <option value="">All Warehouses</option>
          {warehouses.map((w) => (
            <option key={w.id} value={w.id}>{w.code} - {w.name}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="py-3 px-4">Warehouse</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4 text-center">Available Stock</th>
                <th className="py-3 px-4 text-center">Reserved for Orders</th>
                <th className="py-3 px-4 text-center font-bold">Total Allocation</th>
                <th className="py-3 px-4 text-right">Stock Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {inventory.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[11px]">
                      {inv.warehouseCode}
                    </span>
                    <span className="text-slate-500 block text-[11px] mt-0.5">{inv.warehouseName}</span>
                  </td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-800">{inv.productSku}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{inv.productName}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold">
                    <span className={inv.availableQuantity <= 15 ? 'text-rose-600 font-black' : 'text-emerald-700'}>
                      {inv.availableQuantity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center font-mono text-amber-600 font-bold">
                    {inv.reservedQuantity}
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-extrabold text-slate-900">
                    {inv.totalQuantity}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1">
                    <button
                      onClick={() => openAdjustModal(inv, true)}
                      className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                      title="Add Stock"
                    >
                      <Plus className="w-3 h-3" /> In
                    </button>
                    <button
                      onClick={() => openAdjustModal(inv, false)}
                      className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold inline-flex items-center gap-1"
                      title="Deduct Stock"
                    >
                      <Minus className="w-3 h-3" /> Out
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${isStockIn ? 'Stock In (Add)' : 'Stock Out (Reduce)'}: ${adjustItem?.productSku}`}
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border space-y-1">
            <p className="font-bold text-slate-800">{adjustItem?.productName}</p>
            <p className="text-slate-500">Warehouse: {adjustItem?.warehouseName}</p>
            <p className="text-slate-500 font-mono">Current Available: {adjustItem?.availableQuantity} units</p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsStockIn(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border ${
                isStockIn ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              + Stock In (Restock)
            </button>
            <button
              type="button"
              onClick={() => setIsStockIn(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl border ${
                !isStockIn ? 'bg-rose-600 text-white' : 'bg-slate-100 text-slate-700'
              }`}
            >
              - Stock Out (Audit/Damage)
            </button>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
            <input
              type="number"
              min="1"
              required
              value={quantityChange}
              onChange={(e) => setQuantityChange(Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 border rounded-xl font-mono text-sm font-bold"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Audit Ledger Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border rounded-xl"
            >
              <option value="RESTOCK">Supplier Restock Shipment</option>
              <option value="INTERNAL_TRANSFER">Inter-Warehouse Transfer</option>
              <option value="PHYSICAL_AUDIT">Physical Stocktake Reconciliation</option>
              <option value="DAMAGED_WRITE_OFF">Damaged / Expired Write-Off</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl"
          >
            Confirm Inventory Adjustment
          </button>
        </form>
      </Modal>
    </div>
  );
};
