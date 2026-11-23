import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.success) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addToCart = async (productId, quantity = 1) => {
    try {
      const res = await api.post('/cart/items', { productId, quantity });
      if (res.success) {
        setCart(res.data);
        return { success: true, message: 'Item added to cart' };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const updateQuantity = async (itemId, quantity) => {
    try {
      if (quantity <= 0) {
        return removeItem(itemId);
      }
      const res = await api.put(`/cart/items/${itemId}`, { quantity });
      if (res.success) {
        setCart(res.data);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await api.delete(`/cart/items/${itemId}`);
      if (res.success) {
        setCart(res.data);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      setCart(null);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const totalItemsCount = cart?.totalItems || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        fetchCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        totalItemsCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
