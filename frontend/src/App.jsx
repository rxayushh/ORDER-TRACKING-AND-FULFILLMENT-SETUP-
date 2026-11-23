import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { Sidebar } from './components/Sidebar';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { CatalogPage } from './pages/public/CatalogPage';
import { ProductDetailPage } from './pages/public/ProductDetailPage';
import { PublicTrackingPage } from './pages/public/PublicTrackingPage';

// Customer Pages
import { CartPage } from './pages/customer/CartPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { CustomerDashboard } from './pages/customer/CustomerDashboard';
import { OrderHistoryPage } from './pages/customer/OrderHistoryPage';
import { OrderDetailPage } from './pages/customer/OrderDetailPage';
import { ProfilePage } from './pages/customer/ProfilePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminWarehousesPage } from './pages/admin/AdminWarehousesPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminCategoriesPage } from './pages/admin/AdminCategoriesPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

// Warehouse Pages
import { WarehouseDashboard } from './pages/warehouse/WarehouseDashboard';
import { FulfillmentQueuePage } from './pages/warehouse/FulfillmentQueuePage';
import { WarehouseInventoryPage } from './pages/warehouse/WarehouseInventoryPage';

// Public Layout
const MainLayout = () => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <Navbar />
    <main className="flex-1">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// Portal Layout with Sidebar
const PortalLayout = ({ portal = 'customer' }) => (
  <div className="min-h-screen flex flex-col bg-slate-50">
    <Navbar />
    <div className="flex flex-1">
      <Sidebar portal={portal} />
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
    <Footer />
  </div>
);

// Protected Route Guard
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    return <Navigate to="/" replace />;
  }

  return children ? children : <Outlet />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Public Layout Routes */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/catalog" element={<CatalogPage />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/tracking" element={<PublicTrackingPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <CheckoutPage />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Customer Portal */}
            <Route
              element={
                <ProtectedRoute>
                  <PortalLayout portal="customer" />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<CustomerDashboard />} />
              <Route path="/customer/orders" element={<OrderHistoryPage />} />
              <Route path="/customer/orders/:id" element={<OrderDetailPage />} />
              <Route path="/customer/profile" element={<ProfilePage />} />
            </Route>

            {/* Admin Portal */}
            <Route
              element={
                <ProtectedRoute requiredRole="ROLE_ADMIN">
                  <PortalLayout portal="admin" />
                </ProtectedRoute>
              }
            >
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/products" element={<AdminProductsPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/customers" element={<AdminCustomersPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/warehouses" element={<AdminWarehousesPage />} />
            </Route>

            {/* Warehouse Manager Portal */}
            <Route
              element={
                <ProtectedRoute requiredRole="ROLE_WAREHOUSE_MANAGER">
                  <PortalLayout portal="warehouse" />
                </ProtectedRoute>
              }
            >
              <Route path="/warehouse" element={<WarehouseDashboard />} />
              <Route path="/warehouse/queue" element={<FulfillmentQueuePage />} />
              <Route path="/warehouse/inventory" element={<WarehouseInventoryPage />} />
              <Route path="/warehouse/orders" element={<AdminOrdersPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
