import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Trash2, ArrowRight, ShieldCheck, Truck, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export const CartPage = () => {
  const { cart, loading, updateQuantity, removeItem, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse space-y-4">
        <div className="h-8 bg-slate-200 rounded w-48" />
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
    );
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
          <ShoppingCart className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-500">Explore our catalog of IoT modules and fulfillment hardware.</p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors"
        >
          Explore Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const subtotal = cart.subtotal || 0;
  const shippingFee = cart.shippingFee || 0;
  const taxAmount = cart.taxAmount || 0;
  const totalAmount = cart.totalAmount || 0;

  const freeShippingThreshold = 2000;
  const progressPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Shopping Cart</h1>
          <p className="text-xs text-slate-500 mt-1">{cart.totalItems} items selected for procurement</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs font-semibold text-rose-600 hover:text-rose-700 transition-colors"
        >
          Clear Cart
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-slate-700">
            <Truck className="w-4 h-4 text-brand-600" />
            {subtotal >= freeShippingThreshold
              ? 'Congratulations! You qualify for Free Express Shipping.'
              : `Add ₹${(freeShippingThreshold - subtotal).toFixed(2)} more for Free Shipping!`}
          </span>
          <span className="font-mono text-slate-500">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <img
                  src={item.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'}
                  alt={item.productName}
                  className="w-16 h-16 rounded-xl object-cover border border-slate-100 bg-slate-50"
                />
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400">{item.sku}</span>
                  <Link to={`/products/${item.productId}`} className="text-sm font-bold text-slate-900 hover:text-brand-600 block line-clamp-1">
                    {item.productName}
                  </Link>
                  <span className="text-xs font-mono font-semibold text-slate-700">
                    ₹{item.unitPrice?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Quantity Controls & Line Total */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6">
                <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                  >
                    -
                  </button>
                  <span className="px-3 py-1 text-xs font-bold font-mono text-slate-800">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 font-bold text-xs"
                  >
                    +
                  </button>
                </div>

                <div className="text-right min-w-[80px]">
                  <p className="text-sm font-black font-mono text-slate-900">
                    ₹{item.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </p>
                </div>

                <button
                  onClick={() => removeItem(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Remove item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-md space-y-6 h-fit">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">
            Procurement Summary
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Items Subtotal</span>
              <span className="font-mono font-bold">₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Express Logistics Fee</span>
              <span className="font-mono font-bold">
                {shippingFee === 0 ? <span className="text-emerald-600">FREE</span> : `₹${shippingFee.toFixed(2)}`}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Applicable GST (5%)</span>
              <span className="font-mono font-bold">₹{taxAmount.toFixed(2)}</span>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-between text-sm font-black text-slate-900">
              <span>Total Payable</span>
              <span className="font-mono text-brand-700 text-lg">₹{totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <div className="p-3 bg-brand-50 rounded-xl text-[11px] text-brand-800 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-brand-600 mt-0.5" />
            <span>Simulated checkout for academic evaluation. No real payment required.</span>
          </div>

          <button
            onClick={() => {
              if (!isAuthenticated) {
                navigate('/login');
              } else {
                navigate('/checkout');
              }
            }}
            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl shadow-md shadow-brand-500/20 transition-all flex items-center justify-center gap-2"
          >
            Proceed to Checkout <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
