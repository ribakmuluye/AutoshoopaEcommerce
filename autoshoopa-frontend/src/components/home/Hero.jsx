import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiSearch, FiArrowRight, FiShield, FiTruck, FiStar } from 'react-icons/fi';

const Hero = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const badges = [
    { icon: FiShield, label: 'Verified Parts' },
    { icon: FiTruck, label: 'Fast Delivery' },
    { icon: FiStar, label: '100% Genuine' },
  ];

  return (
    <section className="relative bg-light-bg dark:bg-dark-bg overflow-hidden transition-colors duration-300">
      {/* Subtle background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-orange-50 dark:bg-brand-orange-950/10 rounded-full opacity-60 dark:opacity-30 translate-x-1/3 -translate-y-1/4 blur-3xl transition-colors duration-300" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-50 dark:bg-amber-950/10 rounded-full opacity-40 dark:opacity-20 -translate-x-1/4 translate-y-1/4 blur-3xl transition-colors duration-300" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* Left — Text Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="space-y-8"
          >


            {/* Headline */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-light-text dark:text-dark-text leading-[1.1] tracking-tight">
                Find the Right
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-500 to-amber-500 dark:from-brand-orange-400 dark:to-yellow-500">
                  Parts Fast
                </span>
              </h1>
              <p className="text-light-textSecondary dark:text-dark-textSecondary text-lg leading-relaxed max-w-md">
                Thousands of genuine auto spare parts from verified dealers — 
                delivered right to your door across Ethiopia.
              </p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit}>
              <div className="flex items-center bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-1.5 max-w-lg focus-within:border-brand-orange-500 focus-within:ring-4 focus-within:ring-brand-orange-500/10 transition-all shadow-sm">
                <FiSearch className="ml-3 text-light-textMuted dark:text-dark-textMuted text-lg flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search engine parts, brakes, tires..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-3 py-2.5 bg-transparent text-light-text dark:text-dark-text text-sm placeholder-light-textMuted dark:placeholder-dark-textMuted focus:outline-none"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-brand-orange-700 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-orange-500/20 transition-all cursor-pointer"
                >
                  Search
                </motion.button>
              </div>
            </form>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-light-text dark:bg-brand-orange-500 text-white text-sm font-bold rounded-xl hover:bg-light-text/90 dark:hover:bg-brand-orange-600 transition-colors shadow-lg shadow-light-text/10 dark:shadow-brand-orange-500/20"
                >
                  Browse Catalog
                  <FiArrowRight className="text-sm" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-light-textSecondary dark:text-dark-textSecondary text-sm font-semibold rounded-xl hover:border-brand-orange-500 hover:text-brand-orange-500 dark:hover:border-brand-orange-400 dark:hover:text-brand-orange-400 transition-all shadow-sm"
                >
                  Learn More
                </Link>
              </motion.div>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 pt-2">
              {badges.map(({ icon: Icon, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-light-textSecondary dark:text-dark-textSecondary text-xs font-semibold">
                  <Icon className="text-brand-orange-500 w-4 h-4" />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right — Hero Image + Stats */}
          <motion.div
            initial={{ opacity: 0, x: 400 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.2, type: 'spring', stiffness: 50, damping: 15 }}
            className="relative flex flex-col items-center"
          >
            {/* Image Card */}
            <div className="relative w-full max-w-3xl mx-auto mt-12 lg:mt-8">
                <motion.img
                  src="/images/hero/home_backgroundimage.png"
                  alt="Auto spare parts"
                  className="relative z-10 w-full h-auto object-contain drop-shadow-2xl scale-[2.2] lg:scale-[3.0] origin-center"
                  animate={{ x: [200, 0], y: [0, -15, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.style.display = 'none';
                  }}
                />
            </div>

            {/* Floating Stats Cards */}
            <div className="flex gap-4 mt-10 w-full max-w-xl">
              {[
                { value: '10,000+', label: 'Parts Listed' },
                { value: '500+', label: 'Verified Sellers' },
                { value: '99%', label: 'Satisfaction' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ y: -2 }}
                  className="flex-1 bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border shadow-sm p-4 text-center transition-colors"
                >
                  <div className="text-xl font-extrabold text-light-text dark:text-dark-text">{stat.value}</div>
                  <div className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider mt-0.5">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;