import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { login } from '../../store/slices/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiArrowRight, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    try {
      const resultAction = await dispatch(login(formData));
      
      if (login.fulfilled.match(resultAction)) {
        const userData = resultAction.payload;
        
        if (userData.user_type === 'admin') {
          toast.success('Admin login successful!');
          navigate('/admin/dashboard', { replace: true });
          return;
        }
        
        if (userData.user_type === 'seller' || userData.role === 'seller') {
          toast.success('Seller login successful! Welcome to your dashboard.');
          navigate('/seller/dashboard', { replace: true });
          return;
        }
        
        toast.success('Login successful!');
        navigate(userData.redirectPath || '/', { replace: true });
      } else {
        setError(resultAction.payload || 'Login failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-900 overflow-hidden font-sans">
      {/* Left Panel - Branding & Visuals */}
      <motion.div 
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="hidden lg:flex lg:w-1/2 relative items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 40%, #111827 100%)' }}
      >
        {/* Orange glow blobs */}
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full opacity-30 animate-pulse"
          style={{ background: 'radial-gradient(circle, #f97316 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #ea580c 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #fb923c 0%, transparent 70%)', filter: 'blur(60px)' }} />

        {/* Decorative grid lines */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(#f97316 1px, transparent 1px), linear-gradient(90deg, #f97316 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }} />

        <div className="relative z-10 px-16 text-white max-w-2xl">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-2xl"
                style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)', boxShadow: '0 0 30px rgba(249,115,22,0.5)' }}>
                <span className="text-2xl font-black text-white">A</span>
              </div>
              <span className="text-3xl font-extrabold tracking-tight">Autoshoopa</span>
            </div>
            
            <h1 className="text-5xl font-extrabold leading-tight mb-6">
              Welcome back to <br />
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(90deg, #fb923c, #f97316, #fed7aa)' }}>
                your dashboard.
              </span>
            </h1>
            <p className="text-lg font-medium leading-relaxed max-w-md" style={{ color: '#9ca3af' }}>
              Access your account to manage your automotive journey. Buy, sell, and discover the best parts and vehicles on the market.
            </p>

            {/* Feature bullets */}
            <div className="mt-10 space-y-3">
              {['Trusted automotive marketplace', 'Secure & fast transactions', 'Thousands of verified listings'].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}>
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-gray-300 text-sm">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-white dark:bg-dark-surface relative">
        {/* Subtle orange accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-1"
          style={{ background: 'linear-gradient(90deg, #f97316, #ea580c, #fb923c)' }} />

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md px-8 py-12 lg:px-12"
        >
          <div className="mb-6 flex justify-start">
            <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-light-textMuted dark:text-dark-textMuted hover:text-brand-orange-500 transition-colors">
              <FiArrowLeft /> Back to Home
            </Link>
          </div>
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, #fff7ed, #fed7aa)' }}>
              <span className="text-2xl font-black" style={{ color: '#ea580c' }}>A</span>
            </div>
            <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-2">Sign In</h2>
            <p className="text-light-textMuted dark:text-dark-textMuted">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold transition-colors" style={{ color: '#f97316' }}
                onMouseEnter={e => e.target.style.color='#ea580c'}
                onMouseLeave={e => e.target.style.color='#f97316'}>
                Create one now
              </Link>
            </p>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl p-4 flex items-start gap-3"
              >
                <FiAlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-red-800">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="h-5 w-5 text-light-textMuted dark:text-dark-textMuted transition-colors" style={{ }} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3.5 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text placeholder-gray-400 focus:outline-none focus:bg-white dark:bg-dark-surface transition-all duration-200 shadow-sm"
                  style={{ '--tw-ring-color': '#f97316' }}
                  onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="block text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary ml-1">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="h-5 w-5 text-light-textMuted dark:text-dark-textMuted transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-11 pr-4 py-3.5 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-xl text-light-text dark:text-dark-text placeholder-gray-400 focus:outline-none transition-all duration-200 shadow-sm"
                  onFocus={e => { e.target.style.borderColor = '#f97316'; e.target.style.boxShadow = '0 0 0 3px rgba(249,115,22,0.15)'; }}
                  onBlur={e => { e.target.style.borderColor = '#e5e7eb'; e.target.style.boxShadow = 'none'; }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 border-light-borderHover dark:border-dark-borderHover rounded cursor-pointer"
                  style={{ accentColor: '#f97316' }}
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-light-textSecondary dark:text-dark-textSecondary cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-semibold transition-colors" style={{ color: '#f97316' }}>
                  Forgot password?
                </Link>
              </div>
            </div>

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
                  Authenticating...
                </div>
              ) : (
                <div className="flex items-center">
                  Sign In
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

export default Login;