import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, ShoppingCart, Check, AlertTriangle, ArrowLeft, Shield, Truck, Warehouse } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await api.get(`/products/${id}`);
        if (res.success) setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAdd = async () => {
    if (!product) return;
    const res = await addToCart(product.id, quantity);
    if (res.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      alert(res.message);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="aspect-square bg-slate-200 rounded-3xl" />
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-24 bg-slate-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Product Not Found</h2>
        <Link to="/catalog" className="text-sm font-semibold text-brand-600 hover:underline">
          Return to Catalog
        </Link>
      </div>
    );
  }

  const isOutOfStock = product.stockQuantity <= 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/catalog" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Catalog
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Product Image */}
        <div className="relative aspect-square rounded-2xl bg-slate-100 overflow-hidden border border-slate-200">
          <img
            src={product.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Details */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-mono font-semibold bg-slate-100 text-slate-600">
                {product.sku}
              </span>
              <span className="text-xs text-brand-600 font-semibold">{product.categoryName}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {product.name}
            </h1>

            <div className="pt-2">
              <span className="text-xs text-slate-400 block">Unit Price (excl. 5% GST)</span>
              <span className="text-3xl font-black text-slate-900 font-mono">
                ₹{product.price?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <p className="text-sm text-slate-600 leading-relaxed pt-2">{product.description}</p>

            <div className="pt-4 flex items-center gap-2">
              {isOutOfStock ? (
                <span className="px-3 py-1 text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
                  Out of Stock
                </span>
              ) : product.isLowStock ? (
                <span className="px-3 py-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded-lg flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" /> Low Stock: Only {product.stockQuantity} remaining
                </span>
              ) : (
                <span className="px-3 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg">
                  In Stock: {product.stockQuantity} units across distribution centers
                </span>
              )}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-6 border-t border-slate-100 space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stockQuantity}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-12 text-center text-sm font-semibold text-slate-800 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stockQuantity, quantity + 1))}
                  className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                onClick={handleAdd}
                disabled={isOutOfStock}
                className={`flex-1 py-3 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md ${
                  added
                    ? 'bg-emerald-600 text-white'
                    : isOutOfStock
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                    : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" /> Added to Cart!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" /> Add to Shopping Cart
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-2">
              <span className="flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-brand-600" /> Dispatched within 24 hours</span>
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-brand-600" /> Enterprise quality guarantee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
