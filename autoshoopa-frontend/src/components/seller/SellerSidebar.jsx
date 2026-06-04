import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaTachometerAlt,
  FaBox,
  FaShoppingCart,
  FaStore,
  FaSignOutAlt,
  FaUser,
} from 'react-icons/fa';

const SellerSidebar = () => {
  const location = useLocation();

  const menuItems = [
    { path: '/seller/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
    { path: '/seller/products', icon: FaBox, label: 'Products' },
    { path: '/seller/orders', icon: FaShoppingCart, label: 'Orders' },
    { path: '/seller/profile', icon: FaUser, label: 'Profile' },
    { path: '/seller/store', icon: FaStore, label: 'Store Settings' },
  ];

  return (
    <div className="w-64 min-h-screen bg-white shadow-lg">
      <div className="p-4">
        <Link to="/seller/dashboard" className="flex items-center space-x-2 mb-8">
          <FaStore className="w-8 h-8 text-gray-700" />
          <span className="text-xl font-bold text-gray-900">Seller Panel</span>
        </Link>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-gray-100 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <button
            onClick={() => {
              // Add logout logic here
              window.location.href = '/';
            }}
            className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:bg-gray-50 hover:text-gray-900 rounded-lg transition-colors w-full"
          >
            <FaSignOutAlt className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SellerSidebar; 