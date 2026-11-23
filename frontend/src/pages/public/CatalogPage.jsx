import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ShoppingCart, Check, AlertTriangle, Layers, ArrowUpDown } from 'lucide-react';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { StatusBadge } from '../../components/StatusBadge';

export const CatalogPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [addedItem, setAddedItem] = useState(null);
  const { addToCart } = useCart();

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      if (res.success) setCategories(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        size: 24,
        ...(selectedCategory ? { categoryId: selectedCategory } : {}),
        ...(search ? { search } : {}),
      };
      const res = await api.get('/products', { params });
      if (res.success) {
        setProducts(res.data.content || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleAddToCart = async (product) => {
    const res = await addToCart(product.id, 1);
    if (res.success) {
      setAddedItem(product.id);
      setTimeout(() => setAddedItem(null), 1800);
    } else {
      alert(res.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Industrial &amp; Logistics Hardware
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Enterprise products with real-time multi-warehouse inventory reservation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative flex-1 md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by SKU, name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-xs"
            />
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            selectedCategory === null
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Categories
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-brand-600 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-72 bg-slate-100 rounded-2xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-700">No products found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your category or keyword filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => {
            const isOutOfStock = product.stockQuantity <= 0;
            const isAdded = addedItem === product.id;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
                    <img
                      src={product.imageUrl || 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2.5 right-2.5">
                      {isOutOfStock ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-md uppercase">
                          Out of Stock
                        </span>
                      ) : product.isLowStock ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-md uppercase flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Low Stock ({product.stockQuantity})
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                          In Stock ({product.stockQuantity})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{product.sku}</span>
                      <span>{product.categoryName}</span>
                    </div>

                    <Link to={`/products/${product.id}`} className="block">
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-100 mt-2">
                  <div>
                    <span className="text-xs text-slate-400">Unit Price</span>
                    <p className="text-base font-extrabold text-slate-900 font-mono">
                      ₹{product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </p>
                  </div>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={isOutOfStock}
                    className={`p-2.5 rounded-xl font-semibold text-xs flex items-center gap-1.5 transition-all shadow-xs ${
                      isAdded
                        ? 'bg-emerald-600 text-white'
                        : isOutOfStock
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
                    }`}
                    title={isOutOfStock ? 'Product out of stock' : 'Add to cart'}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-4 h-4" /> Added
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" /> Add
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
