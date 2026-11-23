import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt_token');
    const storedUser = localStorage.getItem('user_data');
    if (token && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user_data');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data) {
      localStorage.setItem('jwt_token', res.data.token);
      localStorage.setItem('user_data', JSON.stringify(res.data));
      setUser(res.data);
      return res.data;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.post('/auth/register', userData);
    if (res.success && res.data) {
      localStorage.setItem('jwt_token', res.data.token);
      localStorage.setItem('user_data', JSON.stringify(res.data));
      setUser(res.data);
      return res.data;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const updateStoredUser = (profile) => {
    setUser((current) => {
      const next = {
        ...(current || {}),
        id: profile.id,
        email: profile.email,
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber,
        roles: profile.roles || current?.roles,
      };
      const token = localStorage.getItem('jwt_token');
      localStorage.setItem('user_data', JSON.stringify({ ...next, token }));
      return next;
    });
  };

  const logout = () => {
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('user_data');
    setUser(null);
  };

  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    const formatted = roleName.startsWith('ROLE_') ? roleName : `ROLE_${roleName}`;
    return user.roles.includes(formatted);
  };

  const isAdmin = () => hasRole('ADMIN');
  const isWarehouseManager = () => hasRole('WAREHOUSE_MANAGER');
  const isCustomer = () => hasRole('CUSTOMER');

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        updateStoredUser,
        hasRole,
        isAdmin,
        isWarehouseManager,
        isCustomer,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
