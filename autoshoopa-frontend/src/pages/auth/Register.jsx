import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { register } from '../../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { validateName, validateEmail, validatePassword, validateConfirmPassword, validatePhone } from '../../utils/validation';
import { FiUser, FiMail, FiLock, FiPhone, FiMapPin, FiBriefcase, FiArrowRight, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    userType: 'customer',
    business_name: '',
    business_address: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const nameValidation = validateName(formData.displayName);
    if (!nameValidation.isValid) {
      setError(nameValidation.errors[0]);
      setLoading(false);
      return;
    }

    const emailValidation = validateEmail(formData.email);
    if (!emailValidation.isValid) {
      setError(emailValidation.errors[0]);
      setLoading(false);
      return;
    }

    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]);
      setLoading(false);
      return;
    }

    const confirmPasswordValidation = validateConfirmPassword(formData.password, formData.confirmPassword);
    if (!confirmPasswordValidation.isValid) {
      setError(confirmPasswordValidation.errors[0]);
      setLoading(false);
      return;
    }

    if (formData.userType === 'seller') {
      if (!formData.business_name.trim()) {
        setError('Business name is required for seller accounts');
        setLoading(false);
        return;
      }
      if (!formData.business_address.trim()) {
        setError('Business address is required for seller accounts');
        setLoading(false);
        return;
      }
      if (!formData.phone.trim()) {
        setError('Phone number is required for seller accounts');
        setLoading(false);
        return;
      }
      
      const phoneValidation = validatePhone(formData.phone);
      if (!phoneValidation.isValid) {
        setError(phoneValidation.errors[0]);
        setLoading(false);
        return;
      }
    }

    try {
      const resultAction = await dispatch(register({
        email: formData.email,
        password: formData.password,
        displayName: formData.displayName,
        userType: formData.userType,
        business_name: formData.business_name,
        business_address: formData.business_address,
        phone: formData.phone
      }));

      if (register.fulfilled.match(resultAction)) {
        const userData = resultAction.payload;
        if (userData.user_type === 'seller') {
          toast.success('Registration successful! Your seller account is pending approval.');
        } else {
          toast.success('Registration successful!');
        }
        navigate('/login');
      } else {
        setError(resultAction.payload || 'Registration failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputFocus = (e) => {
    e.target.style.borderColor = '#f97316';
    e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.15)';
  };
  const inputBlur = (e) => {
    e.target.style.borderColor = '#e5e7eb';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div className="min-h-screen flex bg-gray-900 overflow-hidden font-sans">
      {/* Left Panel - Branding & Visuals */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-[45%] relative items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #111827 0%, #1f2937 40%, #0f172a 100%)' }}
      >
        {/* Orange glow blobs */}
        <div className="absolute top-[10%] right-[-20%] w-[80%] h-[80%] rounded-full opacity-25 animate-pulse"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-[-10%] left-[-20%] w-[70%] h-[70%] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #ea580c 0%, transparent 70%)', filter: 'blur(90px)' }} />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />

        <div className="relative z-10 px-16 text-white max-w-xl">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-10">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 0 30px rgba(249,115,22,0.5)' }}>
                <span className="text-2xl font-black text-white">A</span>
              </div>
              <span className="text-3xl font-extrabold tracking-tight">Autoshoopa</span>
            </div>
            
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              Start your engine.<br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #fb923c, #f97316, #fde68a)' }}>
                Join us today.
              </span>
            </h1>
            <p className="text-lg font-medium leading-relaxed max-w-md" style={{ color: '#9ca3af' }}>
              Create an account to track your orders, save your favorite vehicles, and access exclusive deals in our marketplace.
            </p>

            {/* Benefits */}
            <div className="mt-10 space-y-4">
              {[
                { icon: '🚗', text: 'Browse thousands of verified listings' },
                { icon: '🔒', text: 'Safe and secure transactions' },
                { icon: '📦', text: 'Track your orders in real-time' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.15)' }}>
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-gray-300 text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Registration Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center bg-white dark:bg-dark-surface relative overflow-y-auto">
        {/* Orange top bar */}
        <div className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, #f97316, #ea580c, #fb923c)' }} />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-lg px-8 py-12 lg:px-12 my-8"
        >
          <div className="mb-6 flex justify-start">
            <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-light-textMuted dark:text-dark-textMuted hover:text-brand-orange-500 transition-colors">
              <FiArrowLeft /> Back to Home
            </Link>
          </div>
          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
              style={{ background: 'linear-gradient(135deg, #fff7ed, #fed7aa)' }}>
              <span className="text-xl font-black" style={{ color: '#ea580c' }}>A</span>
            </div>
            <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">Create Account</h2>
            <p className="text-light-textMuted dark:text-dark-textMuted">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold transition-colors" style={{ color: '#f97316' }}>
                Sign in instead
              </Link>
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl p-4 flex items-start gap-3 overflow-hidden"
              >
                <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-red-800">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Account Type Selector */}
            <div className="flex bg-light-surfaceAlt dark:bg-dark-surfaceAlt p-1 rounded-xl mb-6 shadow-inner">
              <button
                type="button"
                onClick={() => setFormData({...formData, userType: 'customer'})}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  formData.userType === 'customer' 
                    ? 'bg-white dark:bg-dark-surface shadow-sm' 
                    : 'text-light-textMuted dark:text-dark-textMuted hover:text-light-textSecondary dark:text-dark-textSecondary'
                }`}
                style={formData.userType === 'customer' ? { color: '#f97316' } : {}}
              >
                Customer
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, userType: 'seller'})}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  formData.userType === 'seller' 
                    ? 'bg-white dark:bg-dark-surface shadow-sm' 
                    : 'text-light-textMuted dark:text-dark-textMuted hover:text-light-textSecondary dark:text-dark-textSecondary'
                }`}
                style={formData.userType === 'seller' ? { color: '#f97316' } : {}}
              >
                Seller
              </button>
            </div>

            <div className="space-y-1">
              <label htmlFor="displayName" className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary ml-1">Full Name</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiUser className="h-5 w-5 text-light-textMuted dark:text-dark-textMuted" />
                </div>
                <input
                  id="displayName"
                  name="displayName"
                  type="text"
                  required
                  value={formData.displayName}
                  onChange={handleChange}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  className="block w-full pl-11 pr-4 py-3 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text placeholder-gray-400 focus:outline-none transition-all duration-200 shadow-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-light-textMuted dark:text-dark-textMuted" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  onFocus={inputFocus}
                  onBlur={inputBlur}
                  className="block w-full pl-11 pr-4 py-3 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text placeholder-gray-400 focus:outline-none transition-all duration-200 shadow-sm"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-light-textMuted dark:text-dark-textMuted" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                    className="block w-full pl-11 pr-4 py-3 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text placeholder-gray-400 focus:outline-none transition-all duration-200 shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary ml-1">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FiLock className="h-5 w-5 text-light-textMuted dark:text-dark-textMuted" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onFocus={inputFocus}
                    onBlur={inputBlur}
                    className="block w-full pl-11 pr-4 py-3 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text placeholder-gray-400 focus:outline-none transition-all duration-200 shadow-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Seller Specific Fields */}
            <AnimatePresence>
              {formData.userType === 'seller' && (
                <motion.div
                  initial={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  animate={{ opacity: 1, height: 'auto', overflow: 'visible' }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.3 }}
                  className="space-y-5 pt-2 border-t border-light-border dark:border-dark-border"
                >
                  <div className="space-y-1">
                    <label htmlFor="business_name" className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary ml-1">Business Name</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiBriefcase className="h-5 w-5 text-light-textMuted dark:text-dark-textMuted" />
                      </div>
                      <input
                        id="business_name"
                        name="business_name"
                        type="text"
                        required={formData.userType === 'seller'}
                        value={formData.business_name}
                        onChange={handleChange}
                        onFocus={inputFocus}
                        onBlur={inputBlur}
                        className="block w-full pl-11 pr-4 py-3 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text placeholder-gray-400 focus:outline-none transition-all duration-200 shadow-sm"
                        placeholder="Your Company LLC"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="business_address" className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary ml-1">Business Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiMapPin className="h-5 w-5 text-light-textMuted dark:text-dark-textMuted" />
                      </div>
                      <input
                        id="business_address"
                        name="business_address"
                        type="text"
                        required={formData.userType === 'seller'}
                        value={formData.business_address}
                        onChange={handleChange}
                        onFocus={inputFocus}
                        onBlur={inputBlur}
                        className="block w-full pl-11 pr-4 py-3 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text placeholder-gray-400 focus:outline-none transition-all duration-200 shadow-sm"
                        placeholder="123 Market St, City"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="phone" className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary ml-1">Business Phone</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FiPhone className="h-5 w-5 text-light-textMuted dark:text-dark-textMuted" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required={formData.userType === 'seller'}
                        value={formData.phone}
                        onChange={handleChange}
                        onFocus={inputFocus}
                        onBlur={inputBlur}
                        className="block w-full pl-11 pr-4 py-3 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text placeholder-gray-400 focus:outline-none transition-all duration-200 shadow-sm"
                        placeholder="+251 911 000 000"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              whileHover={{ scale: 1.01, translateY: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 px-4 border border-transparent rounded-xl text-sm font-bold text-white disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200 mt-8"
              style={{
                background: loading ? '#9ca3af' : 'linear-gradient(135deg, #f97316, #ea580c)',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(249,115,22,0.4)'
              }}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </div>
              ) : (
                <div className="flex items-center">
                  Create Account
                  <FiArrowRight className="ml-2 h-4 w-4" />
                </div>
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;