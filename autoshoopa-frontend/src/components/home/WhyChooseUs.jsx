import React from 'react';
import { motion } from 'framer-motion';
import { FiAward, FiZap, FiLock, FiHeadphones } from 'react-icons/fi';

const features = [
  {
    icon: FiAward,
    title: 'Certified Quality',
    description: 'Every product is vetted. We partner only with certified dealers who meet our strict standards.',
    accent: 'text-orange-500 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/30',
  },
  {
    icon: FiZap,
    title: 'Fast Delivery',
    description: 'Get parts delivered across Ethiopia. Addis Ababa orders ship same-day before 2PM.',
    accent: 'text-indigo-500 dark:text-indigo-400',
    bg: 'bg-indigo-50 dark:bg-indigo-950/30',
  },
  {
    icon: FiLock,
    title: 'Secure Payments',
    description: 'Shop with confidence using our buyer protection. Full refunds for items not matching descriptions.',
    accent: 'text-emerald-500 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    icon: FiHeadphones,
    title: '24/7 Support',
    description: 'Our automotive specialists are always ready to help you find exactly the part you need.',
    accent: 'text-rose-500 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
  },
];

const WhyChooseUs = () => {
  return (
    <section className="py-20 bg-light-bg dark:bg-dark-bg border-t border-light-border dark:border-dark-border transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest text-brand-orange-600 dark:text-brand-orange-400 bg-brand-orange-50 dark:bg-brand-orange-950/20 border border-brand-orange-200 dark:border-brand-orange-500/20 px-3 py-1.5 rounded-full mb-4">
            Why AutoShoopa
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-light-text dark:text-dark-text tracking-tight">
            Built for Ethiopian Car Owners
          </h2>
          <p className="mt-3 text-light-textSecondary dark:text-dark-textSecondary max-w-xl mx-auto leading-relaxed">
            We connect car owners with verified dealers to deliver genuine parts with fast shipping and full buyer protection.
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4 }}
              className="p-6 bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-5 transition-colors`}>
                <feature.icon className={`${feature.accent} text-xl`} />
              </div>
              <h3 className="text-base font-bold text-light-text dark:text-dark-text mb-2">{feature.title}</h3>
              <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
