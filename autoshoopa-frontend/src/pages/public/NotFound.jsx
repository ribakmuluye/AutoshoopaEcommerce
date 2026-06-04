import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-9xl font-bold text-light-text dark:text-dark-text">404</h1>
          <h2 className="text-2xl font-semibold text-light-textSecondary dark:text-dark-textSecondary mt-4">Page Not Found</h2>
          <p className="text-light-textMuted dark:text-dark-textMuted mt-2 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaHome className="mr-2" />
            Return Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default NotFound; 