import React, { useEffect, useState } from 'react';
import { MapPin, Phone, Save, Star, Trash2, User } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../../components/Modal';

const emptyAddress = {
  recipientName: '',
  phoneNumber: '',
  streetAddress: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  addressType: 'HOME',
  isDefault: false,
};

export const ProfilePage = () => {
  const { updateStoredUser } = useAuth();
  const [profile, setProfile] = useState({ fullName: '', phoneNumber: '', email: '' });
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState(emptyAddress);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [profileRes, addressRes] = await Promise.all([
        api.get('/customer/profile'),
        api.get('/customer/addresses'),
      ]);
      if (profileRes.success) {
        setProfile({
          fullName: profileRes.data.fullName || '',
          phoneNumber: profileRes.data.phoneNumber || '',
          email: profileRes.data.email || '',
        });
      }
      if (addressRes.success) setAddresses(addressRes.data || []);
    } catch (err) {
      setError(err.message || 'Could not load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const res = await api.put('/customer/profile', {
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
      });
      if (res.success) {
        setProfile((current) => ({
          ...current,
          fullName: res.data.fullName,
          phoneNumber: res.data.phoneNumber || '',
        }));
        updateStoredUser(res.data);
        setMessage('Profile saved.');
      }
    } catch (err) {
      setError(err.message || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const addAddress = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/customer/addresses', newAddress);
      if (res.success) {
        setIsModalOpen(false);
        setNewAddress(emptyAddress);
        await load();
        setMessage('Address added.');
      }
    } catch (err) {
      setError(err.message || 'Could not save address');
    }
  };

  const makeDefault = async (id) => {
    setError('');
    try {
      await api.put(`/customer/addresses/${id}/default`);
      await load();
    } catch (err) {
      setError(err.message || 'Could not update the default address');
    }
  };

  const removeAddress = async (id) => {
    if (!window.confirm('Remove this delivery address?')) return;
    setError('');
    try {
      await api.delete(`/customer/addresses/${id}`);
      await load();
    } catch (err) {
      setError(err.message || 'Could not remove address');
    }
  };

  if (loading) {
    return (
      <div className="p-8 space-y-4 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-56" />
        <div className="h-40 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Profile &amp; Addresses</h1>
        <p className="text-xs text-slate-500 mt-1">Update your contact details and the addresses used at checkout</p>
      </div>

      {message && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-700">{message}</div>
      )}
      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">{error}</div>
      )}

      <form onSubmit={saveProfile} className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-brand-600" /> Account
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="block text-xs font-semibold text-slate-700">
            Full name
            <input
              required
              value={profile.fullName}
              onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            Phone
            <input
              value={profile.phoneNumber}
              onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
              className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono"
            />
          </label>
          <label className="block text-xs font-semibold text-slate-700 sm:col-span-2">
            Email
            <input
              value={profile.email}
              disabled
              className="mt-1 w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-mono"
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl inline-flex items-center gap-1.5 disabled:opacity-50"
        >
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save profile'}
        </button>
      </form>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-brand-600" /> Delivery addresses
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl"
          >
            Add address
          </button>
        </div>

        {addresses.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No saved addresses yet. Add one before checkout.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((address) => (
              <div key={address.id} className="border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-slate-900">{address.recipientName}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" /> {address.phoneNumber}
                    </p>
                  </div>
                  {address.isDefault && (
                    <span className="text-[10px] font-bold uppercase tracking-wide text-brand-700 bg-brand-50 px-2 py-1 rounded-lg">
                      Default
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {address.streetAddress}, {address.city}, {address.state} {address.postalCode}, {address.country}
                </p>
                <p className="text-[10px] font-semibold uppercase text-slate-400">{address.addressType}</p>
                <div className="flex gap-2 pt-1">
                  {!address.isDefault && (
                    <button
                      onClick={() => makeDefault(address.id)}
                      className="text-xs font-semibold text-brand-700 inline-flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5" /> Make default
                    </button>
                  )}
                  <button
                    onClick={() => removeAddress(address.id)}
                    className="text-xs font-semibold text-rose-600 inline-flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New delivery address">
        <form onSubmit={addAddress} className="space-y-3">
          {[
            ['recipientName', 'Recipient name'],
            ['phoneNumber', 'Phone'],
            ['streetAddress', 'Street address'],
            ['city', 'City'],
            ['state', 'State'],
            ['postalCode', 'Postal code'],
          ].map(([key, label]) => (
            <label key={key} className="block text-xs font-semibold text-slate-700">
              {label}
              <input
                required
                value={newAddress[key]}
                onChange={(e) => setNewAddress({ ...newAddress, [key]: e.target.value })}
                className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl"
              />
            </label>
          ))}
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={newAddress.isDefault}
              onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
            />
            Use as default address
          </label>
          <button type="submit" className="w-full py-2.5 bg-brand-600 text-white text-xs font-semibold rounded-xl">
            Save address
          </button>
        </form>
      </Modal>
    </div>
  );
};
