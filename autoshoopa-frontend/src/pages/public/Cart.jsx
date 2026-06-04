import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useCart } from '../../context/CartContext';
import { getImageUrl } from '../../config';
import {
  FaShoppingCart, FaArrowLeft, FaTrash, FaPlus, FaMinus,
  FaCreditCard, FaTruck, FaShieldAlt, FaCheckCircle,
  FaExclamationTriangle, FaTag, FaTimes, FaGift, FaLock
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';

/* ─── helpers ─────────────────────────────────────────────────────── */
const fmtETB = (n) => `${Number(n || 0).toLocaleString('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;

const VALID_COUPONS = {
  'SAVE10':  { discount: 0.10, type: 'percentage', label: '10% off' },
  'SAVE20':  { discount: 0.20, type: 'percentage', label: '20% off' },
  'FREESHIP': { discount: 150,  type: 'fixed',      label: 'Free shipping' },
};

const Cart = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector(s => s.auth);
  const { cart, removeFromCart, updateQuantity, clearCart, isUpdating } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponOpen, setCouponOpen] = useState(false);

  /* totals */
  const subtotal  = cart.reduce((t, i) => t + (Number(i.price) || 0) * (Number(i.quantity) || 1), 0);
  const shipping  = subtotal > 3000 ? 0 : subtotal > 0 ? 150 : 0;
  const discount  = (() => {
    if (!appliedCoupon) return 0;
    return appliedCoupon.type === 'percentage'
      ? subtotal * appliedCoupon.discount
      : Math.min(appliedCoupon.discount, subtotal);
  })();
  const total = subtotal + shipping - discount;

  /* handlers */
  const handleQty = async (itemId, qty) => {
    if (qty < 1) return;
    try { await updateQuantity(itemId, qty); }
    catch { toast.error('Failed to update quantity'); }
  };

  const handleRemove = async (itemId) => {
    try { await removeFromCart(itemId); toast.success('Item removed'); }
    catch { toast.error('Failed to remove item'); }
  };

  const handleClearCart = async () => {
    try { await clearCart(); toast.success('Cart cleared'); }
    catch { toast.error('Failed to clear cart'); }
  };

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (!code) { toast.error('Enter a coupon code'); return; }
    const c = VALID_COUPONS[code];
    if (c) { 
      setAppliedCoupon({ code, ...c }); 
      toast.success(`Coupon "${code}" applied – ${c.label}!`); 
      setCouponCode(''); 
      setCouponOpen(false); 
    } else { 
      toast.error('Invalid coupon code'); 
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) { 
      toast.info('Please login to checkout'); 
      navigate('/login', { state: { from: '/checkout' } }); 
      return; 
    }
    if (!cart.length) {
      toast.info('Your cart is empty');
      return;
    }
    navigate('/checkout');
  };

  if (!cart.length) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 py-20 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <motion.div 
          className="max-w-md w-full bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl p-8 shadow-sm text-center space-y-6"
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-20 h-20 bg-brand-orange-50 dark:bg-brand-orange-950/20 border border-brand-orange-100 dark:border-brand-orange-500/20 rounded-2xl flex items-center justify-center mx-auto text-brand-orange-500 text-3xl">
            <FaShoppingCart />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-extrabold text-light-text dark:text-dark-text">Your shopping cart is empty</h2>
            <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium leading-relaxed max-w-xs mx-auto">
              Looks like you haven't added any spares to your cart yet. Explore our genuine catalog!
            </p>
          </div>
          <Link to="/shop" className="w-full py-3.5 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-brand-orange-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-orange-500/10 flex items-center justify-center gap-2 cursor-pointer">
            <FaArrowLeft />
            <span>Browse Products</span>
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ── Full cart ── */
  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-light-border dark:border-dark-border">
          <div className="flex items-center gap-3.5">
            <div className="relative w-12 h-12 bg-brand-orange-50 dark:bg-brand-orange-950/20 border border-brand-orange-100 dark:border-brand-orange-500/20 rounded-xl flex items-center justify-center text-brand-orange-500 text-xl">
              <FaShoppingCart />
              <span className="absolute -top-1.5 -right-1.5 bg-brand-orange-500 text-white text-[9px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-dark-surface">
                {cart.length}
              </span>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-light-text dark:text-dark-text uppercase tracking-wider">Shopping Cart</h1>
              <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium mt-0.5">{cart.length} item{cart.length !== 1 ? 's' : ''} ready for checkout</p>
            </div>
          </div>
          <button 
            className="px-4 py-2 border border-red-200 dark:border-red-900/30 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-400 text-xs font-bold rounded-xl transition-all flex items-center gap-2 bg-white dark:bg-dark-surface cursor-pointer" 
            onClick={handleClearCart}
          >
            <FaTrash className="text-[10px]" /> 
            <span>Clear All</span>
          </button>
        </div>

        {/* Cart Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column: Items List */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {cart.map((item, idx) => (
                <motion.div
                  key={item.id}
                  className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center gap-4.5 shadow-sm hover:border-brand-orange-500/20 dark:hover:border-brand-orange-500/10 hover:shadow-md transition-all duration-250"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -30, scale: 0.95 }}
                  transition={{ delay: idx * 0.05 }}
                  layout
                >
                  {/* Spare Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-light-surfaceAlt dark:bg-dark-surfaceAlt/60 flex items-center justify-center p-2 border border-light-border dark:border-dark-border flex-shrink-0">
                    <img
                      src={getImageUrl(item.image_url || item.image)}
                      alt={item.name}
                      className="max-h-full max-w-full object-contain"
                      onError={e => { e.target.onerror = null; e.target.src = '/images/logo.svg'; }}
                    />
                  </div>

                  {/* Spare Details */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <h3 className="text-sm font-extrabold text-light-text dark:text-dark-text truncate">{item.name}</h3>
                    {item.category && (
                      <span className="inline-block bg-brand-orange-50 dark:bg-brand-orange-950/20 text-brand-orange-600 dark:text-brand-orange-400 text-[9px] font-bold px-2 py-0.5 rounded-md border border-brand-orange-100 dark:border-brand-orange-500/20">
                        {item.category}
                      </span>
                    )}
                    <div className="text-xs text-light-textMuted dark:text-dark-textMuted font-semibold">{fmtETB(item.price)} each</div>
                    <div className="pt-0.5">
                      {item.stock > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 dark:text-green-400">
                          <FaCheckCircle className="text-[9px]" /> In Stock ({item.stock})
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-600 dark:text-red-400">
                          <FaExclamationTriangle className="text-[9px]" /> Out of Stock
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls & Prices */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 w-full sm:w-auto mt-3 sm:mt-0 pt-3.5 sm:pt-0 border-t sm:border-t-0 border-light-border dark:border-dark-border flex-shrink-0">
                    <div className="flex items-center bg-light-surfaceAlt dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleQty(item.id, item.quantity - 1)}
                        disabled={isUpdating || item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center text-[10px] text-light-textSecondary dark:text-dark-textSecondary hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50 transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <FaMinus />
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-light-text dark:text-dark-text line-height-8">{item.quantity}</span>
                      <button
                        onClick={() => handleQty(item.id, item.quantity + 1)}
                        disabled={isUpdating}
                        className="w-8 h-8 flex items-center justify-center text-[10px] text-light-textSecondary dark:text-dark-textSecondary hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt/50 transition-colors disabled:opacity-40 cursor-pointer"
                      >
                        <FaPlus />
                      </button>
                    </div>

                    <div className="text-sm font-extrabold text-light-text dark:text-dark-text min-w-[90px] text-right">
                      {fmtETB((Number(item.price) || 0) * item.quantity)}
                    </div>

                    <button 
                      className="w-8 h-8 bg-red-50 dark:bg-red-950/20 hover:bg-red-105 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg flex items-center justify-center text-xs transition-all border border-red-100 dark:border-red-900/20 cursor-pointer" 
                      onClick={() => handleRemove(item.id)} 
                      title="Remove"
                    >
                      <FaTrash />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Bottom Info Badges */}
            <div className="flex flex-wrap gap-3 pt-2">
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-xs font-bold text-light-textSecondary dark:text-dark-textSecondary shadow-sm">
                <FaTruck className="text-green-600" />
                <span>Free delivery over 3,000 ETB</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-xl text-xs font-bold text-light-textSecondary dark:text-dark-textSecondary shadow-sm">
                <FaShieldAlt className="text-green-600" />
                <span>100% Secure Checkout</span>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl p-6.5 shadow-sm sticky top-28 space-y-6">
              <h2 className="text-sm font-extrabold text-light-text dark:text-dark-text uppercase tracking-wider pb-3.5 border-b border-light-border dark:border-dark-border">Order Summary</h2>

              {/* Coupon Form */}
              <div className="space-y-3">
                <button 
                  className="flex items-center justify-between w-full bg-light-surfaceAlt dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl px-4 py-3 text-xs font-bold text-light-textSecondary dark:text-dark-textSecondary hover:bg-light-surfaceAlt/80 dark:hover:bg-dark-bg/80 transition-all duration-200 cursor-pointer" 
                  onClick={() => setCouponOpen(o => !o)}
                >
                  <span className="flex items-center gap-2">
                    <FaTag className="text-brand-orange-500" />
                    <span>{appliedCoupon ? `Coupon: ${appliedCoupon.code}` : 'Promo / Coupon Code'}</span>
                  </span>
                  {appliedCoupon ? (
                    <span 
                      onClick={e => { e.stopPropagation(); setAppliedCoupon(null); toast.info('Coupon removed'); }}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <FaTimes />
                    </span>
                  ) : (
                    <span className="text-[10px] text-light-textMuted dark:text-dark-textMuted font-semibold">{couponOpen ? '▲' : '▼'}</span>
                  )}
                </button>

                <AnimatePresence>
                  {couponOpen && !appliedCoupon && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden bg-light-surfaceAlt/50 dark:bg-dark-bg/50 border border-light-border dark:border-dark-border rounded-xl p-3.5"
                    >
                      <div className="flex gap-2">
                        <input
                          value={couponCode}
                          onChange={e => setCouponCode(e.target.value)}
                          placeholder="e.g. SAVE10, SAVE20"
                          className="flex-1 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-lg px-3 py-2 text-xs font-bold text-light-text dark:text-dark-text focus:outline-none focus:border-brand-orange-500"
                          onKeyDown={e => e.key === 'Enter' && applyCoupon()}
                        />
                        <button 
                          className="px-4 py-2 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-brand-orange-700 text-white text-xs font-bold rounded-lg transition-all cursor-pointer" 
                          onClick={applyCoupon}
                        >
                          Apply
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3.5 text-xs font-bold text-light-textSecondary dark:text-dark-textSecondary">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="text-light-text dark:text-dark-text">{fmtETB(subtotal)}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Shipping Fee</span>
                  {shipping === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    <span className="text-light-text dark:text-dark-text">{fmtETB(shipping)}</span>
                  )}
                </div>

                {discount > 0 && (
                  <div className="flex justify-between items-center text-green-600">
                    <span className="flex items-center gap-1"><FaGift /> Coupon Discount</span>
                    <span>- {fmtETB(discount)}</span>
                  </div>
                )}

                <div className="border-t border-light-border dark:border-dark-border pt-3.5 flex justify-between items-center text-sm font-extrabold">
                  <span className="text-light-text dark:text-dark-text">Total Price</span>
                  <span className="text-lg text-brand-orange-500 dark:text-brand-orange-400">{fmtETB(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <motion.button
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-60 shadow-md shadow-brand-orange-500/10 cursor-pointer"
                  onClick={handleCheckout}
                  disabled={!cart.length || isUpdating}
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  style={{ background: 'linear-gradient(135deg, #f97316, #ea580c)' }}
                >
                  <FaCreditCard /> 
                  <span>Proceed to Checkout</span>
                </motion.button>

                <Link 
                  to="/shop" 
                  className="w-full flex items-center justify-center gap-2 py-3 border border-light-border dark:border-dark-border hover:bg-light-surfaceAlt dark:hover:bg-dark-surfaceAlt text-light-textSecondary dark:text-dark-textSecondary text-xs font-bold rounded-xl bg-white dark:bg-dark-surface transition-all text-center"
                >
                  <FaArrowLeft className="text-[10px]" /> 
                  <span>Continue Shopping</span>
                </Link>
              </div>

              {/* Secure SSL indicator */}
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-light-textMuted dark:text-dark-textMuted font-bold uppercase tracking-wider pt-2">
                <FaLock className="text-green-500" />
                <span>SSL Encrypted / Safe Portal</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Cart;