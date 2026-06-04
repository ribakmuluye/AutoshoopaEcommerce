import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedAdminRoute from './components/admin/ProtectedAdminRoute';
import DashboardHome from './pages/admin/DashboardHome';
import AdminDashboard from './pages/admin/AdminDashboard';
import OrdersManagement from './pages/admin/OrdersManagement';
import ProductsManagement from './pages/admin/ProductsManagement';
import UsersManagement from './pages/admin/UsersManagement';

// Layouts
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import SellerLayout from './components/layout/SellerLayout';

// Public Pages
import Home from './pages/public/Home';
import Products from './pages/public/Shop';
import ProductDetails from './pages/public/ProductDetails';
import Cart from './pages/public/Cart';
import Checkout from './pages/public/Checkout';
import NotFound from './pages/public/NotFound';
import About from './pages/public/About';
import Contact from './pages/public/Contact';

// Auth Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';

// User Pages
import Profile from './pages/user/Profile';
import CustomerDashboard from './pages/customer/CustomerDashboard';

// Admin Pages
import UserManagement from './pages/admin/UserManagement';
import OrderManagement from './pages/admin/OrderManagement';
import ProductManagement from './pages/admin/ProductManagement';
import Settings from './pages/admin/Settings';
import CreateAdmin from './pages/admin/CreateAdmin';

// Seller Pages
import SellerDashboard from './pages/seller/Dashboard';
import SellerProducts from './pages/seller/SellerProducts';
import SellerOrders from './pages/seller/SellerOrders';
import AddProduct from './pages/seller/AddProduct';
import EditProduct from './pages/seller/EditProduct';

// Protected Route Component
const ProtectedRoute = ({ children, roles }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user?.user_type)) {
    return <Navigate to="/" />;
  }

  return children;
};

// App Component
const App = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <ThemeProvider>
      <Router>
        <CurrencyProvider>
          <CartProvider>
            <Toaster position="top-center" />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="products" element={<Products />} />
                <Route path="shop" element={<Products />} />
                <Route path="products/:id" element={<ProductDetails />} />
                <Route path="cart" element={<Cart />} />
                <Route path="checkout" element={<Checkout />} />
                <Route path="about" element={<About />} />
                <Route path="contact" element={<Contact />} />
                <Route path="*" element={<NotFound />} />
              </Route>

              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Protected User Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route path="profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                <Route path="dashboard" element={
                  <ProtectedRoute>
                    <CustomerDashboard />
                  </ProtectedRoute>
                } />
              </Route>

              {/* Protected Admin Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedAdminRoute>
                    <AdminLayout />
                  </ProtectedAdminRoute>
                }
              >
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="products" element={<ProductsManagement />} />
                <Route path="orders" element={<OrdersManagement />} />
                <Route path="users" element={<UsersManagement />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Customer Routes */}
              <Route path="/customer" element={
                <ProtectedRoute roles={['customer']}>
                  <MainLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route index element={<Navigate to="/customer/dashboard" replace />} />
              </Route>

              {/* Seller Routes */}
              <Route path="/seller" element={
                <ProtectedRoute roles={['seller']}>
                  <SellerLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<SellerDashboard />} />
                <Route path="products" element={<SellerProducts />} />
                <Route path="products/add" element={<AddProduct />} />
                <Route path="products/edit/:id" element={<EditProduct />} />
                <Route path="orders" element={<SellerOrders />} />
                <Route index element={<Navigate to="/seller/dashboard" replace />} />
              </Route>
            </Routes>
          </CartProvider>
        </CurrencyProvider>
      </Router>
    </ThemeProvider>
  );
};

export default App;
