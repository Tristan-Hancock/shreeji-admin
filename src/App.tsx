/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { ToastProvider } from './components/ui/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './components/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import Categories from './pages/admin/Categories';
import Products from './pages/admin/Products';
import ProductDetail from './pages/admin/ProductDetail';
import Inventory from './pages/admin/Inventory';
import DeliveryBoys from './pages/admin/DeliveryBoys';
import Pincodes from './pages/admin/Pincodes';
import Settings from './pages/admin/Settings';
import Login from './pages/admin/Login';

export default function App() {
  return (
    <Router>
      <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/admin/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<Dashboard />} />
              <Route path="/admin/orders" element={<Orders />} />
              <Route path="/admin/categories" element={<Categories />} />
              <Route path="/admin/products" element={<Products />} />
              <Route path="/admin/products/:id" element={<ProductDetail />} />
              <Route path="/admin/inventory" element={<Inventory />} />
              <Route path="/admin/delivery-boys" element={<DeliveryBoys />} />
              <Route path="/admin/pincodes" element={<Pincodes />} />
              <Route path="/admin/settings" element={<Settings />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

