import React from 'react';
import { FaUser, FaPhone, FaBox, FaCheckCircle, FaTimes, FaStore, FaTruck, FaInfoCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const OrderReceipt = ({ orderData, onClose }) => {
  // Group products by seller
  const productsBySeller = orderData.items.reduce((acc, item) => {
    if (!acc[item.seller_id]) {
      acc[item.seller_id] = {
        seller_name: item.seller_name,
        seller_phone: item.seller_phone,
        items: []
      };
    }
    acc[item.seller_id].items.push(item);
    return acc;
  }, {});

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      className="fixed top-0 right-0 h-full w-96 bg-white dark:bg-dark-surface shadow-xl z-50 overflow-y-auto"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="text-center flex-1">
            <FaCheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-light-text dark:text-dark-text">Order Confirmed!</h2>
          </div>
          <button
            onClick={onClose}
            className="text-light-textMuted dark:text-dark-textMuted hover:text-light-textSecondary dark:text-dark-textSecondary"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Order Details */}
        <div className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-light-textSecondary dark:text-dark-textSecondary">Order Number:</span>
            <span className="font-medium">{orderData.orderNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-light-textSecondary dark:text-dark-textSecondary">Date:</span>
            <span className="font-medium">{new Date(orderData.date).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Delivery & Communication Info */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-center mb-3">
            <FaTruck className="text-blue-600 mr-2" />
            <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Delivery & Communication</h3>
          </div>
          <div className="space-y-3">
            <div className="bg-white dark:bg-dark-surface rounded-lg p-3">
              <div className="flex items-start">
                <FaInfoCircle className="text-blue-500 mt-1 mr-2" />
                <div>
                  <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary mb-1">
                    For delivery updates and communication, please contact the seller directly:
                  </p>
                  {Object.entries(productsBySeller).map(([sellerId, sellerData]) => (
                    <div key={sellerId} className="mt-2 p-2 bg-light-surfaceAlt dark:bg-dark-surfaceAlt rounded">
                      <p className="font-medium text-light-text dark:text-dark-text">{sellerData.seller_name}</p>
                      <p className="text-blue-600 font-medium">{sellerData.seller_phone}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Products by Seller */}
        <div className="space-y-6">
          {Object.entries(productsBySeller).map(([sellerId, sellerData]) => (
            <div key={sellerId} className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt rounded-lg p-4">
              {/* Seller Information - More Prominent */}
              <div className="mb-4 pb-4 border-b border-light-border dark:border-dark-border">
                <div className="flex items-center mb-3">
                  <FaStore className="text-blue-600 mr-2" />
                  <h3 className="text-lg font-bold text-light-text dark:text-dark-text">Seller Information</h3>
                </div>
                <div className="bg-white dark:bg-dark-surface rounded-lg p-3 space-y-2">
                  <div className="flex items-center">
                    <FaUser className="text-light-textMuted dark:text-dark-textMuted mr-2" />
                    <div>
                      <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">Seller Name:</p>
                      <p className="font-medium text-light-text dark:text-dark-text">{sellerData.seller_name}</p>
                    </div>
                  </div>
                  {sellerData.seller_phone && (
                    <div className="flex items-center">
                      <FaPhone className="text-light-textMuted dark:text-dark-textMuted mr-2" />
                      <div>
                        <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">Contact Number:</p>
                        <p className="font-medium text-light-text dark:text-dark-text">{sellerData.seller_phone}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Products from this seller */}
              <div className="space-y-3">
                <h4 className="font-medium text-light-text dark:text-dark-text mb-2">Purchased Items:</h4>
                {sellerData.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm bg-white dark:bg-dark-surface rounded-lg p-3">
                    <div className="flex items-center">
                      <FaBox className="text-light-textMuted dark:text-dark-textMuted mr-2" />
                      <div>
                        <h4 className="font-medium text-light-text dark:text-dark-text">{item.name}</h4>
                        <p className="text-light-textMuted dark:text-dark-textMuted">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-medium text-light-text dark:text-dark-text">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="mt-6 pt-6 border-t border-light-border dark:border-dark-border">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium text-light-text dark:text-dark-text">Total Amount</span>
            <span className="text-2xl font-bold text-light-text dark:text-dark-text">${orderData.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Continue Shopping Button */}
        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default OrderReceipt; 