import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, Warehouse, CreditCard, ShieldCheck, ArrowRight, Check } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { Modal } from '../../components/Modal';

export const CheckoutPage = () => {
  const { cart, fetchCart } = useCart();
  const [addresses, setAddresses] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('SIMULATED_CARD');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newAddress, setNewAddress] = useState({
    recipientName: '',
    phoneNumber: '',
    streetAddress: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    addressType: 'HOME',
    isDefault: true,
  });
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const [addrRes, whRes] = await Promise.all([
        api.get('/customer/addresses'),
        api.get('/warehouses'),
      ]);
      if (addrRes.success) {
        setAddresses(addrRes.data);
        if (addrRes.data.length > 0) {
          const defaultAddr = addrRes.data.find((a) => a.isDefault) || addrRes.data[0];
          setSelectedAddressId(defaultAddr.id);
        }
      }
      if (whRes.success) {
        setWarehouses(whRes.data);
        if (whRes.data.length > 0) {
          setSelectedWarehouseId(whRes.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/customer/addresses', newAddress);
      if (res.success) {
        setIsAddressModalOpen(false);
        await loadData();
        setSelectedAddressId(res.data.id);
      }
    } catch (err) {
      alert(err.message || 'Failed to save address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select or add a shipping address');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/orders/checkout', {
        shippingAddressId: selectedAddressId,
        preferredWarehouseId: selectedWarehouseId,
        customerNotes,
        paymentMethod,
      });

      if (res.success && res.data) {
        await fetchCart();
        navigate(`/customer/orders/${res.data.id}`);
      }
    } catch (err) {
      alert(err.message || 'Order checkout failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Your cart is empty</h2>
        <button
          onClick={() => navigate('/catalog')}
          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold"
        >
          Return to Catalog
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Checkout &amp; Fulfillment</h1>
        <p className="text-xs text-slate-500 mt-1">Review allocation hub, select delivery address, and confirm simulated payment</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: Address & Warehouse */}
        <div className="lg:col-span-2 space-y-6">
          {/* 1. Address Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-brand-600" /> 1. Shipping Address
              </h2>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(true)}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Address
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-slate-200 rounded-2xl space-y-2">
                <p className="text-xs text-slate-500">No addresses found on your account.</p>
                <button
                  type="button"
                  onClick={() => setIsAddressModalOpen(true)}
                  className="px-4 py-1.5 bg-brand-50 text-brand-600 font-semibold text-xs rounded-xl"
                >
                  Create Delivery Address
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                      selectedAddressId === addr.id
                        ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{addr.recipientName}</span>
                      <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {addr.addressType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{addr.streetAddress}</p>
                    <p className="text-xs text-slate-500 mt-1 font-mono">
                      {addr.city}, {addr.state} - {addr.postalCode}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 font-mono">{addr.phoneNumber}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Warehouse Allocation Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Warehouse className="w-4 h-4 text-brand-600" /> 2. Preferred Logistics Hub
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {warehouses.map((wh) => (
                <div
                  key={wh.id}
                  onClick={() => setSelectedWarehouseId(wh.id)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedWarehouseId === wh.id
                      ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/10'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100 px-1.5 py-0.5 rounded">
                    {wh.code}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-2">{wh.name}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{wh.location}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Simulated Payment Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <CreditCard className="w-4 h-4 text-brand-600" /> 3. Simulated Payment Method
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'SIMULATED_CARD', label: 'Credit / Debit Card' },
                { id: 'SIMULATED_UPI', label: 'Instant UPI / QR' },
                { id: 'SIMULATED_NET_BANKING', label: 'Net Banking' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`p-3 rounded-2xl border text-xs font-semibold text-center transition-all ${
                    paymentMethod === m.id
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-xs text-slate-600">
              <p className="font-semibold text-slate-800">Academic Demo Gateway</p>
              <p className="mt-0.5 text-slate-500">Transaction approval is instantaneous without charging real funds.</p>
            </div>
          </div>
        </div>

        {/* Right Order Summary & Confirm */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-6 h-fit">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Review
          </h2>

          <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between text-xs py-1">
                <div className="truncate pr-2">
                  <p className="font-semibold text-slate-800 truncate">{item.productName}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Qty: {item.quantity}</p>
                </div>
                <span className="font-mono font-bold text-slate-900 shrink-0">₹{item.subtotal.toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span className="font-mono font-bold">₹{cart.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Shipping Fee</span>
              <span className="font-mono font-bold">
                {cart.shippingFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${cart.shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>GST (5%)</span>
              <span className="font-mono font-bold">₹{cart.taxAmount.toFixed(2)}</span>
            </div>
            <div className="pt-2 border-t border-slate-100 flex justify-between text-base font-black text-slate-900">
              <span>Grand Total</span>
              <span className="font-mono text-brand-700">₹{cart.totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handlePlaceOrder}
            disabled={submitting || !selectedAddressId}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? 'Placing Order...' : 'Confirm & Place Order'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Address Modal */}
      <Modal isOpen={isAddressModalOpen} onClose={() => setIsAddressModalOpen(false)} title="Add Delivery Address">
        <form onSubmit={handleCreateAddress} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Recipient Name</label>
            <input
              type="text"
              required
              value={newAddress.recipientName}
              onChange={(e) => setNewAddress({ ...newAddress, recipientName: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              required
              value={newAddress.phoneNumber}
              onChange={(e) => setNewAddress({ ...newAddress, phoneNumber: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl font-mono"
            />
          </div>
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Street Address</label>
            <input
              type="text"
              required
              value={newAddress.streetAddress}
              onChange={(e) => setNewAddress({ ...newAddress, streetAddress: e.target.value })}
              className="w-full px-3 py-2 border rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City</label>
              <input
                type="text"
                required
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">State</label>
              <input
                type="text"
                required
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
              <input
                type="text"
                required
                value={newAddress.postalCode}
                onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Address Type</label>
              <select
                value={newAddress.addressType}
                onChange={(e) => setNewAddress({ ...newAddress, addressType: e.target.value })}
                className="w-full px-3 py-2 border rounded-xl"
              >
                <option value="HOME">Home</option>
                <option value="OFFICE">Office</option>
                <option value="WAREHOUSE">Facility</option>
              </select>
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl"
          >
            Save Delivery Address
          </button>
        </form>
      </Modal>
    </div>
  );
};
