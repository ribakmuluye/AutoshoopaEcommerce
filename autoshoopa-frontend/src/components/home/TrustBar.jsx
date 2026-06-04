import React from 'react';
import { motion } from 'framer-motion';
import { FaTruck, FaShieldAlt, FaCheckCircle, FaHeadset } from 'react-icons/fa';

const trustItems = [
  {
    icon: FaTruck,
    title: 'Fast Delivery',
    description: 'Nationwide shipping across Ethiopia',
    color: 'text-orange-500 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
  },
  {
    icon: FaShieldAlt,
    title: 'Genuine Parts',
    description: '100% authentic & quality assured',
    color: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    icon: FaCheckCircle,
    title: 'Verified Sellers',
    description: 'Every seller is vetted & approved',
    color: 'text-indigo-500 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
  },
  {
    icon: FaHeadset,
    title: 'Buyer Protection',
    description: 'Full refund if item not as described',
    color: 'text-rose-500 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
  },
];

const TrustBar = () => {
  return (
    <section className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt/30 border-y border-light-border dark:border-dark-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {trustItems.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.08 }}
              className="flex items-center gap-3 p-4 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0 transition-colors`}>
                <item.icon className={`${item.color} text-lg`} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-light-text dark:text-dark-text">{item.title}</h4>
                <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary mt-0.5 leading-snug">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustBar;
