import React from 'react';
import { motion } from 'framer-motion';
import { FaCogs, FaCar, FaCarSide, FaBolt, FaCarCrash, FaCarAlt, FaTools } from 'react-icons/fa';
import { GiCarWheel, GiCarBattery } from 'react-icons/gi';

const categories = [
  { id: 'all', name: 'All Categories', icon: FaCogs },
  { id: 'engine', name: 'Engine Parts', icon: FaCogs },
  { id: 'brakes', name: 'Brake Systems', icon: GiCarWheel },
  { id: 'suspension', name: 'Suspension', icon: FaCar },
  { id: 'tires_wheels', name: 'Tires & Wheels', icon: FaCarSide },
  { id: 'electrical', name: 'Electrical', icon: FaBolt },
  { id: 'body', name: 'Body Parts', icon: FaCarCrash },
  { id: 'interior', name: 'Interior', icon: FaCarAlt },
  { id: 'accessories', name: 'Accessories', icon: FaTools }
];

const CategoryFilter = ({ selectedCategories, onCategoryChange }) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-semibold text-light-text dark:text-dark-text mb-4">Categories</h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <motion.button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                selectedCategories.includes(category.id)
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-dark-surface text-light-textSecondary dark:text-dark-textSecondary hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Icon className="w-4 h-4" />
              {category.name}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter; 