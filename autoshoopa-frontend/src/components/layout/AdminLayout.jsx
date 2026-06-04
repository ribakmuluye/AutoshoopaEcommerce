import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { FaUsers, FaChartLine, FaSignOutAlt, FaBox, FaShoppingCart, FaSun, FaMoon, FaHome } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../context/ThemeContext';

const AdminLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text transition-colors duration-300">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-dark-border shadow-lg transition-colors duration-300">
        <div className="flex flex-col h-full">
          {/* Logo & Theme Toggle */}
          <div className="p-5 border-b border-light-border dark:border-dark-border flex items-center justify-between">
            <div>
              <Link to="/" className="text-xl font-extrabold tracking-tight flex items-center gap-1 group">
                <span className="bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 text-transparent bg-clip-text">Auto</span>
                <span className="text-light-text dark:text-dark-text group-hover:text-brand-orange-500 transition-colors">Shoopa</span>
              </Link>
              <p className="text-xs text-light-textMuted dark:text-dark-textMuted mt-0.5">Admin Dashboard</p>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50 rounded-lg transition-all duration-200 cursor-pointer"
              title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            >
              {theme === 'dark' ? <FaSun className="h-4.5 w-4.5" /> : <FaMoon className="h-4.5 w-4.5" />}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1">
            <ul className="space-y-1.5">
              <li>
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive('/admin/dashboard')
                      ? 'bg-brand-orange-500/10 text-brand-orange-500 dark:text-brand-orange-400 border border-brand-orange-500/20'
                      : 'text-light-textSecondary dark:text-dark-textSecondary hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50'
                  }`}
                >
                  <FaChartLine className="mr-3 text-base" />
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/orders"
                  className={`flex items-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive('/admin/orders')
                      ? 'bg-brand-orange-500/10 text-brand-orange-500 dark:text-brand-orange-400 border border-brand-orange-500/20'
                      : 'text-light-textSecondary dark:text-dark-textSecondary hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50'
                  }`}
                >
                  <FaShoppingCart className="mr-3 text-base" />
                  Orders
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/products"
                  className={`flex items-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive('/admin/products')
                      ? 'bg-brand-orange-500/10 text-brand-orange-500 dark:text-brand-orange-400 border border-brand-orange-500/20'
                      : 'text-light-textSecondary dark:text-dark-textSecondary hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50'
                  }`}
                >
                  <FaBox className="mr-3 text-base" />
                  Products
                </Link>
              </li>
              <li>
                <Link
                  to="/admin/users"
                  className={`flex items-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive('/admin/users')
                      ? 'bg-brand-orange-500/10 text-brand-orange-500 dark:text-brand-orange-400 border border-brand-orange-500/20'
                      : 'text-light-textSecondary dark:text-dark-textSecondary hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50'
                  }`}
                >
                  <FaUsers className="mr-3 text-base" />
                  Users
                </Link>
              </li>
            </ul>
          </nav>

          {/* Footer Actions */}
          <div className="p-4 border-t border-light-border dark:border-dark-border space-y-1.5">
            <Link
              to="/"
              className="flex items-center px-4 py-2.5 text-light-textSecondary dark:text-dark-textSecondary hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50 rounded-xl font-medium text-sm transition-all duration-200"
            >
              <FaHome className="mr-3 text-base" />
              Back to Shop
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2.5 text-red-500 hover:bg-red-500/10 rounded-xl font-medium text-sm transition-all duration-200 cursor-pointer"
            >
              <FaSignOutAlt className="mr-3 text-base" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8 min-h-screen">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout; 