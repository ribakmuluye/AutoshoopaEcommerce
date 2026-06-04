import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart, FaUser, FaSignOutAlt, FaHistory, FaBars, FaTimes, FaSun, FaMoon } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { logout } from '../../store/slices/authSlice';
import { toast } from 'react-toastify';
import { useCart } from '../../context/CartContext';
import { useTheme } from '../../context/ThemeContext';
import NotificationBell from './NotificationBell';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getCartCount } = useCart();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
  };

  const totalItems = getCartCount();

  return (
    <nav className="sticky top-0 z-50 bg-light-surface/80 dark:bg-dark-surface/80 backdrop-blur-xl border-b border-light-border dark:border-dark-border transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-2xl font-extrabold tracking-tight flex items-center gap-1 group">
              <span className="bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 text-transparent bg-clip-text">Auto</span>
              <span className="text-light-text dark:text-dark-text group-hover:text-brand-orange-500 transition-colors">Shoopa</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {['/shop', '/about', '/contact'].map((path) => {
              const label = path === '/shop' ? 'Shop' : path === '/about' ? 'About' : 'Contact';
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`text-sm font-semibold tracking-wide transition-colors relative py-1 ${
                    isActive 
                      ? 'text-brand-orange-500 dark:text-brand-orange-400' 
                      : 'text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400'
                  }`}
                >
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-brand-orange-500 dark:bg-brand-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.6)]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right side buttons */}
          <div className="flex items-center space-x-3">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50 rounded-xl transition-all duration-200 cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50 rounded-xl transition-all"
            >
              <FaShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-1 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 text-white text-[9px] font-extrabold rounded-full h-4.5 w-4.5 flex items-center justify-center shadow-md shadow-brand-orange-500/20 px-1">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Notification Bell - shown when authenticated */}
            {isAuthenticated && <NotificationBell />}

            {/* Auth Buttons */}
            {isAuthenticated ? (
              <div className="flex items-center space-x-1.5">
                <Link
                  to="/profile"
                  className="p-2.5 text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50 rounded-xl transition-all"
                  title="Profile"
                >
                  <FaUser className="h-5 w-5" />
                </Link>
                
                {/* Conditional Dashboard Link */}
                {user?.user_type === 'customer' ? (
                  <Link
                    to="/customer/dashboard"
                    className="p-2.5 text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50 rounded-xl transition-all"
                    title="My Orders"
                  >
                    <FaHistory className="h-5 w-5" />
                  </Link>
                ) : user?.user_type === 'seller' ? (
                  <Link
                    to="/seller/dashboard"
                    className="p-2.5 text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50 rounded-xl transition-all"
                    title="Seller Dashboard"
                  >
                    <FaHistory className="h-5 w-5" />
                  </Link>
                ) : user?.user_type === 'admin' ? (
                  <Link
                    to="/admin/dashboard"
                    className="p-2.5 text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50 rounded-xl transition-all"
                    title="Admin Dashboard"
                  >
                    <FaHistory className="h-5 w-5" />
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="p-2.5 text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50 rounded-xl transition-all"
                    title="Dashboard"
                  >
                    <FaHistory className="h-5 w-5" />
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="p-2.5 text-light-textSecondary dark:text-dark-textSecondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all cursor-pointer"
                  title="Logout"
                >
                  <FaSignOutAlt className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="hidden sm:flex items-center space-x-1.5">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-semibold text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50 rounded-xl transition-all"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-bold text-white rounded-xl bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-brand-orange-700 shadow-md shadow-brand-orange-500/10 hover:shadow-brand-orange-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50 rounded-xl transition-all focus:outline-none cursor-pointer"
            >
              {isMenuOpen ? <FaTimes className="h-5 w-5" /> : <FaBars className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-light-surface/95 dark:bg-dark-surface/95 border-b border-light-border dark:border-dark-border backdrop-blur-xl"
          >
            <div className="px-4 pt-2 pb-4 space-y-1.5">
              {['/shop', '/about', '/contact'].map((path) => {
                const label = path === '/shop' ? 'Shop' : path === '/about' ? 'About' : 'Contact';
                const isActive = location.pathname === path;
                return (
                  <Link
                    key={path}
                    to={path}
                    className={`block px-3 py-2 rounded-xl text-base font-semibold transition-all ${
                      isActive 
                        ? 'text-brand-orange-500 bg-brand-orange-500/10' 
                        : 'text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {label}
                  </Link>
                );
              })}
              
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="block px-3 py-2 rounded-xl text-base font-semibold text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  {user?.user_type === 'customer' ? (
                    <Link
                      to="/customer/dashboard"
                      className="block px-3 py-2 rounded-xl text-base font-semibold text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                  ) : user?.user_type === 'seller' ? (
                    <Link
                      to="/seller/dashboard"
                      className="block px-3 py-2 rounded-xl text-base font-semibold text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Seller Dashboard
                    </Link>
                  ) : user?.user_type === 'admin' ? (
                    <Link
                      to="/admin/dashboard"
                      className="block px-3 py-2 rounded-xl text-base font-semibold text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="block px-3 py-2 rounded-xl text-base font-semibold text-light-textSecondary dark:text-dark-textSecondary hover:text-brand-orange-500 dark:hover:text-brand-orange-400 hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-left px-3 py-2 rounded-xl text-base font-semibold text-red-500 hover:bg-red-500/10 cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="w-full text-center py-2.5 rounded-xl text-sm font-semibold text-light-textSecondary dark:text-dark-textSecondary hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50 border border-light-border dark:border-dark-border"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="w-full text-center py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-brand-orange-500 to-brand-orange-600"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
