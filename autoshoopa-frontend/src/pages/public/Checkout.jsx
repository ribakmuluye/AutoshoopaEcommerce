import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useCart } from '../../context/CartContext';
import { createOrder, clearCurrentOrder } from '../../store/slices/orderSlice';
import { getImageUrl, API_BASE_URL } from '../../config';
import { 
  FaCreditCard, 
  FaLock, 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaCheckCircle, 
  FaShoppingBag, 
  FaTruck, 
  FaShieldAlt, 
  FaPaypal, 
  FaHandHoldingUsd, 
  FaHome, 
  FaBuilding, 
  FaRoad, 
  FaCrosshairs, 
  FaInfoCircle,
  FaSpinner,
  FaArrowRight,
  FaTimes,
  FaGift
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/dateUtils';

const fmtETB = (n) => `${Number(n || 0).toLocaleString('en-ET', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ETB`;

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { cart, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const { currentOrder, loading: orderLoading } = useSelector((state) => state.orders);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('chapa'); // Default to Chapa Pay
  const [showReceipt, setShowReceipt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [verifiedOrder, setVerifiedOrder] = useState(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Ethiopia',
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    deliveryInstructions: '',
    location: {
      lat: null,
      lng: null,
      address: '',
      placeId: ''
    },
    locationType: 'home',
    streetAddress: '',
    buildingName: '',
    apartmentNumber: '',
    landmark: '',
    area: ''
  });

  // Check URL query parameters for Chapa redirect return callback
  useEffect(() => {
    const status = searchParams.get('status');
    const txRef = searchParams.get('tx_ref');
    const orderId = searchParams.get('orderId');

    if (status === 'success' && txRef) {
      const verifyPayment = async () => {
        try {
          setVerifyingPayment(true);
          const response = await fetch(`${API_BASE_URL}/api/verify_payment.php?tx_ref=${txRef}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || 'Verification failed');
          
          setVerifiedOrder(data.order);
          clearCart();
          setShowReceipt(true);
          toast.success('Payment verified successfully!');
        } catch (err) {
          console.error(err);
          toast.error(err.message || 'Payment verification failed. Please contact support.');
          // Even if verification fails online, fetch the order details locally
          if (orderId) fetchFallbackOrder(orderId);
        } finally {
          setVerifyingPayment(false);
        }
      };

      verifyPayment();
    }
  }, [searchParams]);

  const fetchFallbackOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders.php?id=${orderId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setVerifiedOrder(data);
        setShowReceipt(true);
      }
    } catch (err) {
      console.error('Error fetching fallback order details:', err);
    }
  };

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      toast.info('Please login to complete your purchase');
      navigate('/login', { 
        state: { 
          from: '/checkout',
          message: 'Please login to complete your purchase.'
        } 
      });
    } else {
      // Pre-fill form with user data if available
      setFormData(prev => ({
        ...prev,
        fullName: user?.displayName || user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        streetAddress: user?.address || ''
      }));
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLocationUpdate = (locationData) => {
    setFormData(prev => ({
      ...prev,
      location: locationData,
      address: locationData.address || prev.address,
      streetAddress: locationData.address || prev.streetAddress,
      city: locationData.city || prev.city,
      state: locationData.state || prev.state,
      zipCode: locationData.zipCode || prev.zipCode
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1: // Shipping
        return formData.fullName && formData.email && formData.phone && 
               formData.address && formData.city && formData.zipCode && formData.country;
      case 2: // Payment
        if (paymentMethod === 'card') {
          return formData.cardNumber && formData.cardName && 
                 formData.expiryDate && formData.cvv;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handlePlaceOrder = async () => {
    try {
      setIsProcessing(true);
      const orderData = {
        customerInfo: {
          name: formData.fullName,
          email: formData.email,
          phoneNumber: formData.phone,
          address: formData.address,
          city: formData.city,
          country: formData.country,
          state: formData.state,
          zipCode: formData.zipCode,
          streetAddress: formData.streetAddress,
          buildingName: formData.buildingName,
          apartmentNumber: formData.apartmentNumber,
          landmark: formData.landmark,
          area: formData.area,
          locationType: formData.locationType,
          location: formData.location
        },
        paymentMethod
      };

      const result = await dispatch(createOrder({ orderData, cart })).unwrap();
      
      // If Chapa Payment URL is returned, redirect the customer
      if (result.payment_url) {
        toast.success('Redirecting to Chapa Secure Payment...');
        window.location.href = result.payment_url;
        return;
      }

      // Successful Cash on Delivery or Card placement
      clearCart();
      toast.success('Order placed successfully!');
      setShowReceipt(true);
    } catch (err) {
      console.error(err);
      toast.error(err || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  const steps = [
    { id: 1, title: 'Shipping', icon: FaTruck },
    { id: 2, title: 'Payment', icon: FaCreditCard },
    { id: 3, title: 'Review', icon: FaShieldAlt }
  ];

  const subtotal = getCartTotal();
  const shipping = subtotal > 3000 ? 0 : 150;
  const total = subtotal + shipping;

  // Render verifying screen
  if (verifyingPayment) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl p-8 max-w-sm w-full text-center space-y-6 shadow-sm">
          <FaSpinner className="w-12 h-12 text-brand-orange-500 dark:text-brand-orange-400 animate-spin mx-auto" />
          <div className="space-y-1">
            <h2 className="text-base font-extrabold text-light-text dark:text-dark-text">Verifying Chapa Payment...</h2>
            <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium">Please do not close or reload this window while we verify your transaction.</p>
          </div>
        </div>
      </div>
    );
  }

  // Render receipt screen
  const displayOrder = verifiedOrder || currentOrder;
  if (showReceipt && displayOrder) {
    return (
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl shadow-sm overflow-hidden">
          
          {/* Receipt Header */}
          <div className="bg-gradient-to-r from-gray-950 to-neutral-900 text-white p-8 text-center space-y-3 relative">
            <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl mx-auto shadow-md">
              <FaCheckCircle />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-extrabold tracking-tight">Order Confirmed!</h2>
              <p className="text-xs text-light-textMuted dark:text-dark-textMuted">Order ID: #{String(displayOrder.id || '').toUpperCase()}</p>
            </div>
          </div>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b border-light-border dark:border-dark-border pb-6">
              
              {/* Delivery Details */}
              <div className="space-y-2 text-xs font-medium text-light-textSecondary dark:text-dark-textSecondary">
                <h4 className="text-light-text dark:text-dark-text font-extrabold uppercase tracking-wider text-[10px]">Delivery Address</h4>
                <p><span className="text-light-textMuted dark:text-dark-textMuted">Recipient:</span> {displayOrder.customer_info?.name}</p>
                <p><span className="text-light-textMuted dark:text-dark-textMuted">Email:</span> {displayOrder.customer_info?.email}</p>
                <p><span className="text-light-textMuted dark:text-dark-textMuted">Phone:</span> {displayOrder.customer_info?.phoneNumber || 'N/A'}</p>
                <p><span className="text-light-textMuted dark:text-dark-textMuted">Address:</span> {displayOrder.customer_info?.address || displayOrder.shipping_address}</p>
              </div>

              {/* Order Info */}
              <div className="space-y-2 text-xs font-medium text-light-textSecondary dark:text-dark-textSecondary">
                <h4 className="text-light-text dark:text-dark-text font-extrabold uppercase tracking-wider text-[10px]">Order Information</h4>
                <p><span className="text-light-textMuted dark:text-dark-textMuted">Date:</span> {formatDate(displayOrder.created_at)}</p>
                <p><span className="text-light-textMuted dark:text-dark-textMuted">Payment:</span> <span className="capitalize">{displayOrder.payment_method}</span></p>
                <p><span className="text-light-textMuted dark:text-dark-textMuted">Payment Status:</span> <span className="capitalize text-green-600 font-bold">{displayOrder.payment_status || 'Paid'}</span></p>
              </div>
            </div>

            {/* Detailed Address Location */}
            {displayOrder.customer_info?.streetAddress && (
              <div className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border p-5 rounded-2xl space-y-2">
                <h4 className="text-[10px] font-bold text-light-text dark:text-dark-text uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-light-border dark:border-dark-border/50">
                  <FaMapMarkerAlt className="text-brand-orange-500 dark:text-brand-orange-400" />
                  <span>Detailed Location</span>
                </h4>
                <div className="space-y-1 text-xs text-light-textMuted dark:text-dark-textMuted font-medium">
                  <p><span className="text-light-textMuted dark:text-dark-textMuted">Type:</span> <span className="capitalize">{displayOrder.customer_info.locationType}</span></p>
                  <p><span className="text-light-textMuted dark:text-dark-textMuted">Street Address:</span> {displayOrder.customer_info.streetAddress}</p>
                  {displayOrder.customer_info.buildingName && <p><span className="text-light-textMuted dark:text-dark-textMuted">Building:</span> {displayOrder.customer_info.buildingName}</p>}
                  {displayOrder.customer_info.apartmentNumber && <p><span className="text-light-textMuted dark:text-dark-textMuted">Apartment:</span> {displayOrder.customer_info.apartmentNumber}</p>}
                  {displayOrder.customer_info.landmark && <p><span className="text-light-textMuted dark:text-dark-textMuted">Landmark:</span> {displayOrder.customer_info.landmark}</p>}
                  {displayOrder.customer_info.area && <p><span className="text-light-textMuted dark:text-dark-textMuted">Area:</span> {displayOrder.customer_info.area}</p>}
                </div>
              </div>
            )}

            {/* Items List */}
            <div className="space-y-3">
              <h4 className="text-light-text dark:text-dark-text font-extrabold uppercase tracking-wider text-[10px]">Purchased Spares</h4>
              <div className="space-y-2">
                {displayOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      {(item.image_url || item.image) && (
                        <img src={getImageUrl(item.image_url || item.image)} alt={item.product_name} className="w-10 h-10 object-contain rounded bg-white dark:bg-dark-surface p-1" />
                      )}
                      <div>
                        <p className="text-xs font-bold text-light-text dark:text-dark-text">{item.product_name || item.name}</p>
                        <p className="text-[10px] text-light-textMuted dark:text-dark-textMuted font-bold mt-0.5">Quantity: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-light-text dark:text-dark-text">{fmtETB(item.total)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Grand Total */}
            <div className="border-t border-light-border dark:border-dark-border pt-4 flex justify-between items-center">
              <span className="text-xs font-extrabold text-light-textMuted dark:text-dark-textMuted uppercase">Paid Amount</span>
              <span className="text-lg font-extrabold text-brand-orange-600 dark:text-brand-orange-500">{fmtETB(displayOrder.total_amount)}</span>
            </div>

            {/* Redirect Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => {
                  dispatch(clearCurrentOrder());
                  navigate('/dashboard');
                }}
                className="flex-1 py-3.5 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-brand-orange-700 text-white font-bold rounded-xl text-xs transition-all shadow-md"
              >
                Track Orders Dashboard
              </button>
              <button
                onClick={() => {
                  dispatch(clearCurrentOrder());
                  navigate('/shop');
                }}
                className="px-6 py-3.5 border border-light-border dark:border-dark-border hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt text-light-textSecondary dark:text-dark-textSecondary font-bold rounded-xl text-xs bg-white dark:bg-dark-surface transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Step Indicators */}
        <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border p-6 rounded-3xl shadow-sm max-w-2xl mx-auto">
          <div className="flex items-center justify-between">
            {steps.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center justify-center w-9 h-9 rounded-xl border-2 transition-all duration-200 ${
                    currentStep >= step.id 
                      ? 'bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 border-transparent text-white shadow-sm' 
                      : 'bg-white dark:bg-dark-surface border-light-border dark:border-dark-border text-light-textMuted dark:text-dark-textMuted'
                  }`}>
                    <step.icon className="h-4 w-4" />
                  </div>
                  <span className={`text-xs font-bold ${
                    currentStep >= step.id ? 'text-light-text dark:text-dark-text' : 'text-light-textMuted dark:text-dark-textMuted'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-4 rounded-full ${
                    currentStep > step.id ? 'bg-orange-500' : 'bg-light-border dark:bg-dark-border'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Form Content */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl p-8 shadow-sm">
              
              {/* STEP 1: Shipping Info */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-base font-extrabold text-light-text dark:text-dark-text uppercase tracking-wider pb-3 border-b border-light-border dark:border-dark-border">Shipping Details</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-orange-500/10 focus:border-brand-orange-500 outline-none transition-all text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Email Address *</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-orange-500/10 focus:border-brand-orange-500 outline-none transition-all text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-orange-500/10 focus:border-brand-orange-500 outline-none transition-all text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Country *</label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        disabled
                        className="w-full px-4 py-3 border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg rounded-xl text-xs font-semibold text-light-textMuted dark:text-dark-textMuted cursor-not-allowed"
                      />
                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">General Address *</label>
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-orange-500/10 focus:border-brand-orange-500 outline-none transition-all text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">City *</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-orange-500/10 focus:border-brand-orange-500 outline-none transition-all text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">State/Region</label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-orange-500/10 focus:border-brand-orange-500 outline-none transition-all text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">ZIP/Postal Code *</label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.zipCode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-orange-500/10 focus:border-brand-orange-500 outline-none transition-all text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400"
                        required
                      />
                    </div>

                    {/* Detailed Location Details box */}
                    <div className="md:col-span-2 bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border rounded-2xl p-5 space-y-4">
                      <h3 className="text-xs font-extrabold text-light-text dark:text-dark-text uppercase tracking-wider flex items-center gap-1.5">
                        <FaMapMarkerAlt className="text-brand-orange-500 dark:text-brand-orange-400" />
                        <span>Detailed Delivery Location Details</span>
                      </h3>

                      <div className="space-y-2">
                        <label className="text-[9px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider block">Location Type *</label>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: 'home', label: 'Home', icon: FaHome },
                            { value: 'office', label: 'Office', icon: FaBuilding },
                            { value: 'other', label: 'Other', icon: FaRoad }
                          ].map(({ value, label, icon: Icon }) => (
                            <label key={value} className="cursor-pointer">
                              <input
                                type="radio"
                                name="locationType"
                                value={value}
                                checked={formData.locationType === value}
                                onChange={handleInputChange}
                                className="sr-only"
                              />
                              <div className={`flex items-center justify-center py-2.5 border rounded-xl transition-all ${
                                formData.locationType === value
                                  ? 'border-brand-orange-500 bg-brand-orange-50 dark:bg-brand-orange-950/20 text-brand-orange-600 dark:text-brand-orange-500 font-extrabold'
                                  : 'border-light-border dark:border-dark-border bg-white dark:bg-dark-surface hover:border-light-borderHover dark:border-dark-borderHover text-light-textMuted dark:text-dark-textMuted'
                              }`}>
                                <Icon className="mr-1.5 w-3.5 h-3.5" />
                                <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                              </div>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Detailed Street Address *</label>
                        <input
                          type="text"
                          name="streetAddress"
                          value={formData.streetAddress || ''}
                          onChange={handleInputChange}
                          placeholder="e.g. Bole Road, House #512"
                          className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-orange-500/10 focus:border-brand-orange-500 outline-none transition-all text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400 bg-white dark:bg-dark-surface"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Building Name (Optional)</label>
                          <input
                            type="text"
                            name="buildingName"
                            value={formData.buildingName || ''}
                            onChange={handleInputChange}
                            placeholder="e.g. Dembel City Center"
                            className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-orange-500/10 focus:border-brand-orange-500 outline-none transition-all text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400 bg-white dark:bg-dark-surface"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Apartment/Unit # (Optional)</label>
                          <input
                            type="text"
                            name="apartmentNumber"
                            value={formData.apartmentNumber || ''}
                            onChange={handleInputChange}
                            placeholder="e.g. Apt 3A"
                            className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-orange-500/10 focus:border-brand-orange-500 outline-none transition-all text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400 bg-white dark:bg-dark-surface"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Nearby Landmark (Optional)</label>
                        <input
                          type="text"
                          name="landmark"
                          value={formData.landmark || ''}
                          onChange={handleInputChange}
                          placeholder="e.g. Behind Edna Mall, Next to CBE Bank"
                          className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-orange-500/10 focus:border-brand-orange-500 outline-none transition-all text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400 bg-white dark:bg-dark-surface"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[9px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Area / Neighborhood (Optional)</label>
                        <input
                          type="text"
                          name="area"
                          value={formData.area || ''}
                          onChange={handleInputChange}
                          placeholder="e.g. Bole Medhanialem"
                          className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-orange-500/10 focus:border-brand-orange-500 outline-none transition-all text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400 bg-white dark:bg-dark-surface"
                        />
                      </div>

                      {/* Location button */}
                      <div className="pt-2 flex items-center justify-between flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (navigator.geolocation) {
                              navigator.geolocation.getCurrentPosition(
                                (position) => {
                                  const location = {
                                    lat: position.coords.latitude,
                                    lng: position.coords.longitude,
                                    address: `GPS Coordinate Location: ${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`,
                                    placeId: null,
                                    isExactLocation: true
                                  };
                                  handleLocationUpdate(location);
                                  toast.success('Current location detected successfully!');
                                },
                                () => {
                                  toast.error('Unable to fetch location. Please enter manually.');
                                }
                              );
                            } else {
                              toast.error('Geolocation is not supported by your browser');
                            }
                          }}
                          className="flex items-center px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all cursor-pointer gap-1.5"
                        >
                          <FaCrosshairs className="animate-pulse text-xs" />
                          <span>Use Current Location</span>
                        </button>

                        <div className="flex items-center gap-1 text-[10px] text-light-textMuted dark:text-dark-textMuted font-bold uppercase">
                          <FaInfoCircle className="text-brand-orange-500 dark:text-brand-orange-400" />
                          <span>Fills address with GPS values</span>
                        </div>
                      </div>

                    </div>

                    <div className="md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Delivery Instructions (Optional)</label>
                      <textarea
                        name="deliveryInstructions"
                        value={formData.deliveryInstructions}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-orange-500/10 focus:border-brand-orange-500 outline-none transition-all text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400 resize-none"
                        placeholder="e.g. Ring doorbell, drop at reception..."
                      />
                    </div>

                  </div>

                  <button
                    onClick={nextStep}
                    className="w-full py-3.5 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-brand-orange-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-orange-500/10 flex items-center justify-center gap-2"
                  >
                    <span>Proceed to Payment</span>
                    <FaArrowRight />
                  </button>
                </div>
              )}

              {/* STEP 2: Payment Method */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-base font-extrabold text-light-text dark:text-dark-text uppercase tracking-wider pb-3 border-b border-light-border dark:border-dark-border">Select Payment Method</h2>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { id: 'chapa', label: 'Chapa Pay', icon: FaCheckCircle, desc: 'Telebirr, CBE Birr' },
                      { id: 'card', label: 'Credit Card', icon: FaCreditCard, desc: 'Visa / MasterCard' },
                      { id: 'paypal', label: 'PayPal', icon: FaPaypal, desc: 'International' },
                      { id: 'cod', label: 'Cash on Deliv.', icon: FaHandHoldingUsd, desc: 'Pay at door' }
                    ].map(method => (
                      <button
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`p-4 border-2 rounded-2xl flex flex-col items-center text-center justify-center gap-1.5 transition-all cursor-pointer ${
                          paymentMethod === method.id 
                            ? 'border-brand-orange-500 bg-brand-orange-50 dark:bg-brand-orange-950/20 text-brand-orange-600 dark:text-brand-orange-500 font-extrabold'
                            : 'border-light-border dark:border-dark-border bg-white dark:bg-dark-surface hover:border-light-borderHover dark:border-dark-borderHover text-light-textMuted dark:text-dark-textMuted'
                        }`}
                      >
                        <method.icon className="text-xl" />
                        <div>
                          <span className="text-[10px] uppercase font-bold tracking-wider block">{method.label}</span>
                          <span className="text-[8px] text-light-textMuted dark:text-dark-textMuted font-medium">{method.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Chapa Info */}
                  {paymentMethod === 'chapa' && (
                    <div className="bg-brand-orange-50 dark:bg-brand-orange-950/20 border border-brand-orange-100 dark:border-brand-orange-500/20 rounded-2xl p-5 space-y-2.5">
                      <h3 className="text-xs font-bold text-brand-orange-600 dark:text-brand-orange-400 flex items-center gap-1.5">
                        <FaShieldAlt className="text-brand-orange-500 dark:text-brand-orange-400 text-sm" />
                        <span>Chapa Payment Portal (ETB)</span>
                      </h3>
                      <p className="text-xs text-brand-orange-600 dark:text-brand-orange-400 font-medium leading-relaxed">
                        Chapa is Ethiopia's premier secure payment platform. On clicking **Place Order** in the next step, you will be redirected to Chapa to authorize payment using **Telebirr**, **CBE Birr**, **Amole**, or your local **credit cards**.
                      </p>
                    </div>
                  )}

                  {/* Credit Card inputs */}
                  {paymentMethod === 'card' && (
                    <div className="space-y-4 pt-4 border-t border-light-border dark:border-dark-border">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Card Number *</label>
                        <input
                          type="text"
                          name="cardNumber"
                          value={formData.cardNumber}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-orange-500/10 focus:border-brand-orange-500 outline-none transition-all text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400"
                          required
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Name on Card *</label>
                        <input
                          type="text"
                          name="cardName"
                          value={formData.cardName}
                          onChange={handleInputChange}
                          placeholder="Cardholder Name"
                          className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-orange-500/10 focus:border-brand-orange-500 outline-none transition-all text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Expiry Date *</label>
                          <input
                            type="text"
                            name="expiryDate"
                            value={formData.expiryDate}
                            onChange={handleInputChange}
                            placeholder="MM/YY"
                            className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-orange-500/10 focus:border-brand-orange-500 outline-none transition-all text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400"
                            required
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">CVV *</label>
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            className="w-full px-4 py-3 border border-light-border dark:border-dark-border rounded-xl focus:ring-2 focus:ring-brand-orange-500/10 focus:border-brand-orange-500 outline-none transition-all text-xs font-semibold text-light-text dark:text-dark-text placeholder-gray-400"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PayPal details */}
                  {paymentMethod === 'paypal' && (
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 space-y-2">
                      <h3 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                        <FaPaypal className="text-blue-500" />
                        <span>PayPal Checkout</span>
                      </h3>
                      <p className="text-xs text-blue-800 font-medium leading-relaxed">
                        International buyers can checkout using PayPal. You will redirect to PayPal on placement.
                      </p>
                    </div>
                  )}

                  {/* COD details */}
                  {paymentMethod === 'cod' && (
                    <div className="bg-green-50/50 border border-green-150 rounded-2xl p-5 space-y-2">
                      <h3 className="text-xs font-bold text-green-800 flex items-center gap-1.5">
                        <FaHandHoldingUsd className="text-green-600" />
                        <span>Cash on Delivery</span>
                      </h3>
                      <p className="text-xs text-green-700 font-medium leading-relaxed">
                        Pay in cash upon delivery. An additional shipping handling fee of **ETB 500** will be collected at delivery.
                      </p>
                    </div>
                  )}

                  {/* Controls */}
                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={prevStep}
                      className="px-5 py-3.5 border border-light-border dark:border-dark-border hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt text-light-textSecondary dark:text-dark-textSecondary font-bold rounded-xl text-xs transition-all flex items-center gap-2"
                    >
                      <FaArrowLeft />
                      <span>Back</span>
                    </button>
                    <button 
                      onClick={nextStep}
                      className="flex-1 py-3.5 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-brand-orange-700 text-white font-bold rounded-xl text-xs transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <span>Review Order Details</span>
                      <FaArrowRight />
                    </button>
                  </div>

                </div>
              )}

              {/* STEP 3: Review Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-base font-extrabold text-light-text dark:text-dark-text uppercase tracking-wider pb-3 border-b border-light-border dark:border-dark-border">Review Your Order</h2>
                  
                  <div className="space-y-4">
                    
                    {/* Shipping Address summary */}
                    <div className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-2xl p-5 space-y-2">
                      <h4 className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-widest">Delivery Recipient</h4>
                      <div className="text-xs font-bold text-light-textSecondary dark:text-dark-textSecondary space-y-1">
                        <p><span className="text-light-textMuted dark:text-dark-textMuted font-medium">Name:</span> {formData.fullName}</p>
                        <p><span className="text-light-textMuted dark:text-dark-textMuted font-medium">Email:</span> {formData.email}</p>
                        <p><span className="text-light-textMuted dark:text-dark-textMuted font-medium">Phone:</span> {formData.phone}</p>
                        <p><span className="text-light-textMuted dark:text-dark-textMuted font-medium">General:</span> {formData.address}, {formData.city}, {formData.country}</p>
                      </div>
                    </div>

                    {/* Detailed Location Summary */}
                    {formData.streetAddress && (
                      <div className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-2xl p-5 space-y-2">
                        <h4 className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-widest flex items-center gap-1">
                          <FaMapMarkerAlt className="text-brand-orange-500 dark:text-brand-orange-400" />
                          <span>Detailed Coordinates Summary</span>
                        </h4>
                        <div className="text-xs font-bold text-light-textSecondary dark:text-dark-textSecondary space-y-1">
                          <p><span className="text-light-textMuted dark:text-dark-textMuted font-medium">Type:</span> <span className="capitalize">{formData.locationType}</span></p>
                          <p><span className="text-light-textMuted dark:text-dark-textMuted font-medium">Street Address:</span> {formData.streetAddress}</p>
                          {formData.buildingName && <p><span className="text-light-textMuted dark:text-dark-textMuted font-medium">Building:</span> {formData.buildingName}</p>}
                          {formData.apartmentNumber && <p><span className="text-light-textMuted dark:text-dark-textMuted font-medium">Apartment:</span> {formData.apartmentNumber}</p>}
                          {formData.landmark && <p><span className="text-light-textMuted dark:text-dark-textMuted font-medium">Landmark:</span> {formData.landmark}</p>}
                          {formData.area && <p><span className="text-light-textMuted dark:text-dark-textMuted font-medium">Area:</span> {formData.area}</p>}
                        </div>
                      </div>
                    )}

                    {/* Payment Method summary */}
                    <div className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-2xl p-5 flex justify-between items-center">
                      <div>
                        <h4 className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-widest block mb-1">Selected Payment</h4>
                        <span className="text-xs font-extrabold text-light-text dark:text-dark-text capitalize flex items-center gap-1.5">
                          {paymentMethod === 'chapa' && <><FaCheckCircle className="text-brand-orange-500 dark:text-brand-orange-400" /> Chapa Pay (ETB)</>}
                          {paymentMethod === 'card' && <><FaCreditCard className="text-brand-orange-500 dark:text-brand-orange-400" /> Credit Card</>}
                          {paymentMethod === 'paypal' && <><FaPaypal className="text-blue-500" /> PayPal</>}
                          {paymentMethod === 'cod' && <><FaHandHoldingUsd className="text-green-600" /> Cash on Delivery</>}
                        </span>
                      </div>
                      
                      {paymentMethod === 'cod' && (
                        <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2.5 py-1 border border-amber-100 rounded-lg">
                          +500 ETB fee applies
                        </span>
                      )}
                    </div>

                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      onClick={prevStep}
                      disabled={isProcessing}
                      className="px-5 py-3.5 border border-light-border dark:border-dark-border hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt text-light-textSecondary dark:text-dark-textSecondary font-bold rounded-xl text-xs transition-all flex items-center gap-2"
                    >
                      <FaArrowLeft />
                      <span>Back</span>
                    </button>
                    <button 
                      onClick={handlePlaceOrder}
                      disabled={isProcessing || cart.length === 0}
                      className="flex-1 py-3.5 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-brand-orange-700 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-brand-orange-500/10 flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <FaSpinner className="animate-spin text-sm" />
                          <span>Securing Order...</span>
                        </>
                      ) : (
                        <>
                          <FaLock className="text-[10px]" />
                          <span>Confirm & Place Order</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* Right Column: Order details & totals */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl p-6 shadow-sm sticky top-28 space-y-5">
              <h2 className="text-xs font-extrabold text-light-text dark:text-dark-text uppercase tracking-wider pb-3 border-b border-light-border dark:border-dark-border">Order Spares</h2>
              
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-3 p-2 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-xl">
                    <div className="flex items-center min-w-0 gap-2.5">
                      <img src={getImageUrl(item.image_url || item.image)} alt={item.name} className="w-9 h-9 object-contain bg-white dark:bg-dark-surface rounded-lg p-0.5" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-light-text dark:text-dark-text truncate">{item.name}</p>
                        <p className="text-[9px] text-light-textMuted dark:text-dark-textMuted font-bold mt-0.5">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-light-text dark:text-dark-text flex-shrink-0">{fmtETB((Number(item.price) || 0) * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2.5 text-xs font-bold text-light-textMuted dark:text-dark-textMuted border-t border-light-border dark:border-dark-border pt-4">
                <div className="flex justify-between items-center">
                  <span>Cart Subtotal</span>
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
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between items-center text-amber-600">
                    <span>COD Surcharge</span>
                    <span>{fmtETB(500)}</span>
                  </div>
                )}
                <div className="border-t border-light-border dark:border-dark-border pt-3 flex justify-between items-center text-sm font-extrabold">
                  <span className="text-light-text dark:text-dark-text">Total Price</span>
                  <span className="text-lg text-brand-orange-600 dark:text-brand-orange-500">
                    {fmtETB(total + (paymentMethod === 'cod' ? 500 : 0))}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1 text-[9px] text-light-textMuted dark:text-dark-textMuted font-bold uppercase tracking-wider pt-2">
                <FaLock className="text-green-500" />
                <span>SSL Encrypted Payments</span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default Checkout;