import React from 'react';
import { FaCogs, FaUsers, FaHandshake, FaShieldAlt, FaCheckCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' }
  })
};

const About = () => {
  const features = [
    {
      icon: <FaCogs className="w-6 h-6 text-brand-orange-600 dark:text-brand-orange-500" />,
      title: 'Wide Parts Inventory',
      description: 'Find extensive catalogs of quality engine parts, brake assemblies, suspension setups, and electrics.',
      color: '#f97316'
    },
    {
      icon: <FaUsers className="w-6 h-6 text-brand-orange-600 dark:text-brand-orange-500" />,
      title: 'Certified Dealers',
      description: 'We connect you exclusively with verified spare parts retailers and wholesalers in Addis Ababa.',
      color: '#ea580c'
    },
    {
      icon: <FaHandshake className="w-6 h-6 text-brand-orange-600 dark:text-brand-orange-500" />,
      title: 'Trusted Platform',
      description: 'Enjoy secure buyer protection systems, transparent product grading, and seamless transactions.',
      color: '#f97316'
    },
    {
      icon: <FaShieldAlt className="w-6 h-6 text-brand-orange-600 dark:text-brand-orange-500" />,
      title: 'Guaranteed Quality',
      description: 'Only genuine parts list on our index, complete with merchant verification checks.',
      color: '#ea580c'
    }
  ];

  const team = [
    {
      name: 'Ezana ',
      position: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      quote: 'Simplifying auto repairs, one spare part at a time.'
    },
    {
      name: 'Bereket Ephrem',
      position: 'Operations Manager',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      quote: 'Setting the standard for quality auto supply lines.'
    },
    {
      name: 'Ribka Muluye',
      position: 'Head of Quality Assurance',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=256&q=80',
      quote: 'Ensuring every listed part meets strict performance rules.'
    }
  ];

  const stats = [
    { value: '10K+', label: 'Happy Customers' },
    { value: '25K+', label: 'Genuine Spares Listed'},
    { value: '99%', label: 'Delivery Guarantee' },
  ];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Simple & Minimal Hero Section */}
        <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl p-8 md:p-12 shadow-sm text-center space-y-5 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-48 h-48 bg-brand-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          <span className="text-[10px] font-bold text-brand-orange-600 dark:text-brand-orange-500 uppercase tracking-widest bg-brand-orange-50 dark:bg-brand-orange-950/20 px-2.5 py-1 rounded-full border border-brand-orange-100 dark:border-brand-orange-500/20">About AutoShoopa</span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-light-text dark:text-dark-text leading-tight">
            Ethiopia's Leading{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange-500 to-brand-orange-600">
              Spare Parts Marketplace
            </span>
          </h1>
          <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium max-w-xl mx-auto leading-relaxed">
            AutoShoopa is a state-of-the-art e-commerce platform dedicated to connecting spare parts dealers, mechanics, and vehicle owners. We provide secure payments, speed, and 100% genuine parts guarantees.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 max-w-3xl mx-auto">
            {[
              { val: '2020', label: 'Founded' },
              { val: '15K+', label: 'Users Served' },
              { val: '100%', label: 'Secure Portal' },
              { val: 'Addis Ababa', label: 'HQ Base' }
            ].map((card, idx) => (
              <div key={idx} className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border p-4.5 rounded-2xl flex flex-col justify-center items-center">
                <span className="text-lg font-extrabold text-light-text dark:text-dark-text">{card.val}</span>
                <span className="text-[9px] text-light-textMuted dark:text-dark-textMuted font-bold uppercase tracking-wider mt-1">{card.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-5"
          >
            <span className="text-[10px] font-bold text-brand-orange-600 dark:text-brand-orange-500 uppercase tracking-widest">Our Value</span>
            <h2 className="text-2xl font-extrabold text-light-text dark:text-dark-text">Our Core Mission</h2>
            <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium leading-relaxed">
              At AutoShoopa, we are committed to making the spare parts procurement process simple, secure, and fully transparent. We believe everyone deserves access to genuine, top-quality automotive spares without hidden fees.
            </p>
            <div className="space-y-2.5 pt-1">
              {['Strict Merchant Verification', 'Secure Buyer Protection Escrow', '24/7 Dedicated Support Services'].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-bold text-light-textSecondary dark:text-dark-textSecondary">
                  <FaCheckCircle className="text-brand-orange-500 dark:text-brand-orange-400" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={1}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="relative"
          >
            <div className="rounded-3xl overflow-hidden shadow-sm border border-light-border dark:border-dark-border">
              <img
                src="https://images.unsplash.com/photo-1486006920555-c77dce18193b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                alt="Workshop illustration"
                className="w-full h-64 object-cover"
              />
            </div>
          </motion.div>
        </div>

        {/* Why Choose Us Cards */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold text-brand-orange-600 dark:text-brand-orange-500 uppercase tracking-widest">Why Us</span>
            <h2 className="text-2xl font-extrabold text-light-text dark:text-dark-text">Built for Mechanics and Retailers</h2>
            <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium max-w-sm mx-auto">
              We built the most reliable auto parts index in Ethiopia — so you can keep moving.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                custom={idx * 0.1}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-dark-surface rounded-2xl p-5 border border-light-border dark:border-dark-border shadow-sm transition-all duration-200"
              >
                <div className="w-10 h-10 rounded-xl bg-brand-orange-50 dark:bg-brand-orange-950/20 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-sm font-extrabold text-light-text dark:text-dark-text">{feature.title}</h3>
                <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium leading-relaxed mt-2">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl p-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {stats.map((stat, idx) => (
              <div key={idx} className="pt-6 md:pt-0 md:px-4 space-y-1">
                <div className="text-3xl font-extrabold text-light-text dark:text-dark-text">{stat.value}</div>
                <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-bold uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team Grid */}
        <div className="space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold text-brand-orange-600 dark:text-brand-orange-500 uppercase tracking-widest">Our Leadership</span>
            <h2 className="text-2xl font-extrabold text-light-text dark:text-dark-text">Meet Our Team</h2>
            <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium max-w-sm mx-auto">
              A group of passionate automotive engineers and tech professionals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {team.map((member, idx) => (
              <motion.div
                key={idx}
                variants={fadeUp}
                custom={idx * 0.15}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white dark:bg-dark-surface rounded-2xl border border-light-border dark:border-dark-border overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
                <div className="p-5 space-y-2.5">
                  <div>
                    <h3 className="text-sm font-extrabold text-light-text dark:text-dark-text">{member.name}</h3>
                    <p className="text-[10px] font-bold text-brand-orange-600 dark:text-brand-orange-500 uppercase tracking-wider mt-0.5">{member.position}</p>
                  </div>
                  <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium italic">"{member.quote}"</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Call to Action (CTA) */}
        <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl p-8 md:p-12 shadow-sm text-center space-y-6">
          <h2 className="text-2xl font-extrabold text-light-text dark:text-dark-text">Need Auto Spare Parts?</h2>
          <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium max-w-md mx-auto leading-relaxed">
            Join thousands of motorists, mechanics, and local businesses who source genuine vehicle components through AutoShoopa.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center max-w-xs mx-auto">
            <a href="/shop"
              className="px-6 py-3.5 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-brand-orange-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-orange-500/10">
              Browse Spares
            </a>
            <a href="/contact"
              className="px-6 py-3.5 border border-light-border dark:border-dark-border hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt text-light-textSecondary dark:text-dark-textSecondary font-bold rounded-xl text-xs transition-all bg-white dark:bg-dark-surface">
              Contact Support
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};

export default About;