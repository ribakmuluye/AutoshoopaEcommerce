import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiArrowRight } from 'react-icons/fi';
import toast from 'react-hot-toast';

const NewsletterCTA = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubmitted(true);
    toast.success('You\'re subscribed! Welcome to the AutoShoopa family 🎉');
    setEmail('');
    setTimeout(() => setSubmitted(false), 4000);
  };

  return (
    <section className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt/20 border-t border-light-border dark:border-dark-border transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-white dark:bg-dark-surface rounded-3xl border border-light-border dark:border-dark-border shadow-sm p-10 md:p-14 text-center relative overflow-hidden"
        >
          {/* Subtle background circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange-50 dark:bg-brand-orange-950/10 rounded-full opacity-50 dark:opacity-20 translate-x-1/3 -translate-y-1/3 pointer-events-none blur-2xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-50 dark:bg-amber-950/10 rounded-full opacity-40 dark:opacity-10 -translate-x-1/3 translate-y-1/3 pointer-events-none blur-2xl" />

          <div className="relative z-10 space-y-6">
            {/* Icon */}
            <div className="w-14 h-14 bg-brand-orange-50 dark:bg-brand-orange-950/30 border border-brand-orange-100 dark:border-brand-orange-500/20 rounded-2xl flex items-center justify-center mx-auto">
              <FiMail className="text-brand-orange-500 text-2xl" />
            </div>

            {/* Text */}
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-extrabold text-light-text dark:text-dark-text tracking-tight">
                Stay Ahead with the Latest Parts & Deals
              </h2>
              <p className="text-light-textSecondary dark:text-dark-textSecondary max-w-md mx-auto leading-relaxed">
                New arrivals, flash sales and exclusive discounts — straight to your inbox. Join 5,000+ car enthusiasts.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex items-center max-w-md mx-auto bg-light-surfaceAlt dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-2xl p-1.5 focus-within:border-brand-orange-500 focus-within:ring-4 focus-within:ring-brand-orange-500/10 transition-all">
              <FiMail className="ml-3 text-light-textMuted dark:text-dark-textMuted flex-shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="flex-1 px-3 py-2.5 bg-transparent text-light-text dark:text-dark-text text-sm placeholder-light-textMuted dark:placeholder-dark-textMuted focus:outline-none"
              />
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={submitted}
                className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md transition-all cursor-pointer ${
                  submitted
                    ? 'bg-emerald-500 shadow-emerald-500/20'
                    : 'bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 shadow-brand-orange-500/20'
                }`}
              >
                {submitted ? 'Done! ✓' : (
                  <>
                    Subscribe
                    <FiArrowRight className="text-xs" />
                  </>
                )}
              </motion.button>
            </form>

            <p className="text-xs text-light-textMuted dark:text-dark-textMuted">
              No spam. Unsubscribe anytime. We respect your privacy.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default NewsletterCTA;
