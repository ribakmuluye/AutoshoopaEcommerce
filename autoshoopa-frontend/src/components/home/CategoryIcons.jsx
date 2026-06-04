import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaCogs, FaCarCrash, FaCar, FaCarSide, FaBolt, FaCarAlt, FaTools } from 'react-icons/fa';
import { GiCarWheel } from 'react-icons/gi';

const categories = [
  {
    id: 1,
    name: 'Engine Parts',
    icon: FaCogs,
    description: 'Pistons, filters, belts & more',
    path: '/shop?category=engine',
    color: 'text-blue-500 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    dot: 'bg-blue-500',
  },
  {
    id: 2,
    name: 'Brake Systems',
    icon: GiCarWheel,
    description: 'Pads, rotors & brake fluid',
    path: '/shop?category=brakes',
    color: 'text-red-500 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    dot: 'bg-red-500',
  },
  {
    id: 3,
    name: 'Suspension',
    icon: FaCar,
    description: 'Shock absorbers & control arms',
    path: '/shop?category=suspension',
    color: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    dot: 'bg-emerald-500',
  },
  {
    id: 4,
    name: 'Tires & Wheels',
    icon: FaCarSide,
    description: 'Quality treads & alloy wheels',
    path: '/shop?category=tires_wheels',
    color: 'text-amber-500 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    dot: 'bg-amber-500',
  },
  {
    id: 5,
    name: 'Electrical',
    icon: FaBolt,
    description: 'Sensors, spark plugs & fuses',
    path: '/shop?category=electrical',
    color: 'text-violet-500 dark:text-violet-400',
    bg: 'bg-violet-50 dark:bg-violet-950/30',
    dot: 'bg-violet-500',
  },
  {
    id: 6,
    name: 'Body Parts',
    icon: FaCarCrash,
    description: 'Bumpers, mirrors & panels',
    path: '/shop?category=body',
    color: 'text-rose-500 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    dot: 'bg-rose-500',
  },
  {
    id: 7,
    name: 'Interior',
    icon: FaCarAlt,
    description: 'Seat covers, mats & trim',
    path: '/shop?category=interior',
    color: 'text-indigo-500 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
    dot: 'bg-indigo-500',
  },
  {
    id: 8,
    name: 'Accessories',
    icon: FaTools,
    description: 'Tools, scanners & add-ons',
    path: '/shop?category=accessories',
    color: 'text-cyan-500 dark:text-cyan-400',
    bg: 'bg-cyan-50 dark:bg-cyan-950/30',
    dot: 'bg-cyan-500',
  },
];

const CategoryIcons = () => {
  const navigate = useNavigate();

  return (
    <section className="py-16 bg-light-surfaceAlt dark:bg-dark-surfaceAlt/20 border-y border-light-border dark:border-dark-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-brand-orange-600 dark:text-brand-orange-400 bg-brand-orange-50 dark:bg-brand-orange-950/20 border border-brand-orange-200 dark:border-brand-orange-500/20 px-3 py-1.5 rounded-full mb-3">
            Categories
          </span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-light-text dark:text-dark-text tracking-tight">
            Shop by Category
          </h2>
          <p className="mt-2 text-light-textSecondary dark:text-dark-textSecondary text-sm max-w-md mx-auto">
            Find the exact part your vehicle needs across our curated categories.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat, idx) => (
            <motion.button
              key={cat.id}
              onClick={() => navigate(cat.path)}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.05 }}
              whileHover={{ y: -3 }}
              className="flex flex-col items-center text-center p-4 bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border hover:border-brand-orange-500/30 dark:hover:border-brand-orange-500/30 shadow-sm hover:shadow-md transition-all cursor-pointer group"
            >
              <div className={`w-11 h-11 rounded-xl ${cat.bg} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <cat.icon className={`${cat.color} text-xl`} />
              </div>
              <span className="text-xs font-bold text-light-text dark:text-dark-text leading-tight">{cat.name}</span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoryIcons;