import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FaBox, 
  FaShoppingCart, 
  FaPlus, 
  FaCheckCircle, 
  FaClock, 
  FaChartLine, 
  FaShoppingBag, 
  FaUsers, 
  FaEye, 
  FaTruck, 
  FaTimesCircle,
  FaSpinner,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaChartBar
} from 'react-icons/fa';
import { fetchAllProducts, fetchSellerProducts } from '../../store/slices/productSlice';
import { getSellerOrders } from '../../store/slices/orderSlice';
import { useCurrency } from '../../context/CurrencyContext';
import { formatDate } from '../../utils/dateUtils';

const SellerDashboard = () => {
  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();
  const { sellerProducts = [], loading: productsLoading } = useSelector((state) => state.products);
  const { sellerOrders = [], loading: ordersLoading } = useSelector((state) => state.orders);
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    thisMonthRevenue: 0,
    lastMonthRevenue: 0
  });
  
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    if (user) {
      const sellerId = user.id || user.uid;
      dispatch(fetchAllProducts());
      dispatch(fetchSellerProducts(sellerId));
      dispatch(getSellerOrders(sellerId));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (!user) return;

    const sellerId = user.id || user.uid;

    let totalRevenue = 0;
    let thisMonthRevenue = 0;
    let lastMonthRevenue = 0;
    const uniqueCustomers = new Set();
    let pendingOrders = 0;
    let completedOrders = 0;

    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;

    sellerOrders.forEach((order) => {
      const sellerItems = order.items?.filter(item => item.seller_id === sellerId) || [];
      const sellerRevenue = sellerItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
      
      totalRevenue += sellerRevenue;
      
      const orderDate = new Date(order.created_at);
      const orderMonth = orderDate.getMonth();
      const orderYear = orderDate.getFullYear();
      
      if (orderMonth === thisMonth && orderYear === thisYear) {
        thisMonthRevenue += sellerRevenue;
      } else if (orderMonth === lastMonth && orderYear === lastMonthYear) {
        lastMonthRevenue += sellerRevenue;
      }
      
      if (order.user_id) {
        uniqueCustomers.add(order.user_id);
      }
      
      if (order.status === 'pending' || order.status === 'processing') {
        pendingOrders++;
      } else if (order.status === 'delivered') {
        completedOrders++;
      }
    });

    setStats({
      totalProducts: sellerProducts.length,
      totalOrders: sellerOrders.length,
      totalRevenue,
      totalCustomers: uniqueCustomers.size,
      pendingOrders,
      completedOrders,
      thisMonthRevenue,
      lastMonthRevenue
    });

    setRecentOrders(sellerOrders.slice(0, 5));
  }, [user, sellerProducts, sellerOrders]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-amber-750 bg-amber-50 border-amber-200/60';
      case 'processing':
        return 'text-blue-750 bg-blue-50 border-blue-200/60';
      case 'shipped':
        return 'text-purple-750 bg-purple-50 border-purple-200/60';
      case 'delivered':
        return 'text-green-750 bg-green-50 border-green-200/60';
      case 'cancelled':
        return 'text-red-750 bg-red-50 border-red-200/60';
      default:
        return 'text-gray-750 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border-light-border dark:border-dark-border/60';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaClock className="w-3 h-3" />;
      case 'processing':
        return <FaSpinner className="w-3 h-3 animate-spin" />;
      case 'shipped':
        return <FaTruck className="w-3 h-3" />;
      case 'delivered':
        return <FaCheckCircle className="w-3 h-3" />;
      case 'cancelled':
        return <FaTimesCircle className="w-3 h-3" />;
      default:
        return <FaClock className="w-3 h-3" />;
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  if (productsLoading || ordersLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-[#f8f8f8]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-4 border-light-border dark:border-dark-border"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-orange-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Welcome Section */}
        <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border/60 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden mb-8">
          <div className="absolute right-0 top-0 w-64 h-64 bg-brand-orange-500/5 rounded-full blur-3xl pointer-events-none" />
          <div>
            <span className="text-xs font-bold text-brand-orange-600 dark:text-brand-orange-500 uppercase tracking-widest">Seller Dashboard</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-light-text dark:text-dark-text mt-1">
              Welcome back, {user.displayName || user.display_name || 'Seller'}!
            </h1>
            <p className="mt-1 text-sm text-light-textMuted dark:text-dark-textMuted">
              Manage your automotive spare parts listings, track sales, and analyze earnings performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => navigate('/seller/products/add')}
              className="px-5 py-2.5 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-brand-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-orange-500/10 flex items-center gap-2"
            >
              <FaPlus /> Add New Product
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            {
              title: 'Active Listings',
              value: stats.totalProducts,
              subtitle: 'Active spares listed',
              icon: FaBox,
              color: 'text-blue-600 bg-blue-50 border-blue-100',
              trend: 'Items listed'
            },
            {
              title: 'Total Orders',
              value: stats.totalOrders,
              subtitle: `${stats.pendingOrders} pending verification`,
              icon: FaShoppingCart,
              color: 'text-green-600 bg-green-50 border-green-100',
              trend: 'All customer purchases'
            },
            {
              title: 'Total Revenue',
              value: formatPrice(stats.totalRevenue),
              subtitle: `This month: ${formatPrice(stats.thisMonthRevenue)}`,
              icon: FaChartLine,
              color: 'text-amber-600 bg-amber-50 border-amber-100',
              trend: 'Overall earnings'
            },
            {
              title: 'Unique Customers',
              value: stats.totalCustomers,
              subtitle: 'Different buyers',
              icon: FaUsers,
              color: 'text-purple-600 bg-purple-50 border-purple-100',
              trend: 'Buyer database'
            }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border/60 rounded-2xl p-5 flex flex-col justify-between shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl border ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {stat.trend}
                </span>
              </div>
              <div>
                <p className="text-xs font-semibold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">{stat.title}</p>
                <p className="text-xl md:text-2xl font-extrabold text-light-text dark:text-dark-text mt-1">{stat.value}</p>
                <p className="text-xs text-light-textMuted dark:text-dark-textMuted mt-1.5">{stat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Analytics dummy chart */}
        <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border/60 rounded-3xl p-6 shadow-sm mb-8">
          <div className="flex items-center justify-between border-b border-light-border dark:border-dark-border pb-4 mb-6">
            <div className="flex items-center gap-2">
              <FaChartBar className="text-brand-orange-500 dark:text-brand-orange-400 w-4 h-4" />
              <h2 className="text-base font-bold text-light-text dark:text-dark-text">Weekly Earnings Overview</h2>
            </div>
            <span className="text-xs text-light-textMuted dark:text-dark-textMuted font-bold bg-brand-orange-500/10 text-brand-orange-600 dark:text-brand-orange-500 border border-brand-orange-500/20 px-3 py-1 rounded-lg">
              Live updates
            </span>
          </div>

          {/* SVG Line Chart */}
          <div className="w-full h-64 bg-light-bg dark:bg-dark-bg rounded-2xl border border-light-border dark:border-dark-border p-4 flex flex-col justify-between relative overflow-hidden">
            {/* Grid Line Placeholders */}
            <div className="absolute inset-x-0 top-1/4 border-t border-light-border dark:border-dark-border/40 pointer-events-none" />
            <div className="absolute inset-x-0 top-2/4 border-t border-light-border dark:border-dark-border/40 pointer-events-none" />
            <div className="absolute inset-x-0 top-3/4 border-t border-light-border dark:border-dark-border/40 pointer-events-none" />

            <svg viewBox="0 0 500 150" className="w-full h-full overflow-visible z-10" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.25"/>
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
                </linearGradient>
              </defs>
              {/* Path gradient fill */}
              <path d="M 0 150 Q 75 80 150 110 T 300 40 T 450 70 L 500 80 L 500 150 Z" fill="url(#chart-grad)" />
              {/* Stroke line */}
              <path d="M 0 150 Q 75 80 150 110 T 300 40 T 450 70 L 500 80" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" />
              
              {/* Key points dots */}
              <circle cx="150" cy="110" r="4.5" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="300" cy="40" r="4.5" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
              <circle cx="450" cy="70" r="4.5" fill="#f97316" stroke="#ffffff" strokeWidth="1.5" />
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between items-center text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted mt-2 px-1">
              <span>Monday</span>
              <span>Tuesday</span>
              <span>Wednesday</span>
              <span>Thursday</span>
              <span>Friday</span>
              <span>Saturday</span>
              <span>Sunday</span>
            </div>
          </div>
        </div>

        {/* Recent Orders Section */}
        <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border/60 rounded-3xl shadow-sm overflow-hidden mb-8">
          <div className="px-6 py-5 border-b border-light-border dark:border-dark-border flex items-center gap-2">
            <FaShoppingBag className="text-brand-orange-500 dark:text-brand-orange-400 w-4 h-4" />
            <h2 className="text-base font-bold text-light-text dark:text-dark-text">Recent Customer Orders</h2>
          </div>
          
          {recentOrders.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border/60 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaShoppingBag className="w-6 h-6 text-light-textMuted dark:text-dark-textMuted" />
              </div>
              <h3 className="text-lg font-bold text-light-text dark:text-dark-text mb-1">No orders yet</h3>
              <p className="text-sm text-light-textMuted dark:text-dark-textMuted max-w-sm mx-auto">
                Orders will appear here as soon as customers buy your listed spare parts.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt/70">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Details</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Earnings</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-100">
                  {recentOrders.map((order) => {
                    const sellerItems = order.items?.filter(item => item.seller_id === (user?.id || user?.uid)) || [];
                    const sellerRevenue = sellerItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
                    
                    return (
                      <tr key={order.id} className="hover:bg-light-bg dark:bg-dark-bg transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-light-text dark:text-dark-text">
                          #{order.id?.slice(-8).toUpperCase() || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-light-textSecondary dark:text-dark-textSecondary font-semibold">
                          {order.customer_info?.name || order.customer_info?.email?.split('@')[0] || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-light-textMuted dark:text-dark-textMuted">
                          {formatDate(order.created_at)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-light-textMuted dark:text-dark-textMuted font-medium">
                          {sellerItems.length} items
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-gray-950">
                          {formatPrice(sellerRevenue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1 capitalize text-[11px]">{order.status}</span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-semibold">
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="text-brand-orange-600 dark:text-brand-orange-500 hover:text-orange-700 bg-brand-orange-50 dark:bg-brand-orange-950/20 hover:bg-orange-100/80 px-3 py-1.5 rounded-lg transition-all inline-flex items-center gap-1 text-xs font-bold"
                          >
                            <FaEye className="w-3.5 h-3.5" /> View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-base font-bold text-light-text dark:text-dark-text mb-4">Quick Management Shortcuts</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: 'Add New Parts',
                action: () => navigate('/seller/products/add'),
                icon: FaPlus,
                color: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/10'
              },
              {
                title: 'View All Orders',
                action: () => navigate('/seller/orders'),
                icon: FaShoppingCart,
                color: 'bg-green-600 hover:bg-green-700 shadow-green-500/10'
              },
              {
                title: 'Manage Listings',
                action: () => navigate('/seller/products'),
                icon: FaBox,
                color: 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/10'
              },
              {
                title: 'Sales Reports',
                action: () => navigate('/seller/orders'),
                icon: FaChartLine,
                color: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/10'
              }
            ].map((btn, idx) => (
              <button
                key={idx}
                onClick={btn.action}
                className={`w-full flex items-center justify-center gap-2 py-3 px-4 text-white text-xs font-bold rounded-xl transition-all shadow-md hover:scale-[1.02] ${btn.color}`}
              >
                <btn.icon />
                {btn.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto border border-light-border dark:border-dark-border/50 w-full max-w-2xl shadow-2xl rounded-3xl bg-white dark:bg-dark-surface overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-gray-900 to-neutral-900 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">Seller Order Information</h3>
                <p className="text-xs text-light-textMuted dark:text-dark-textMuted mt-0.5">#{selectedOrder.id?.slice(-8).toUpperCase()}</p>
              </div>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="text-light-textMuted dark:text-dark-textMuted hover:text-white p-2 rounded-xl hover:bg-white dark:bg-dark-surface/10 transition-colors"
              >
                <FaTimesCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              
              {/* Customer Contact Details */}
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                <h4 className="font-bold text-light-text dark:text-dark-text text-xs uppercase tracking-wider mb-2.5 flex items-center gap-2">
                  <FaUser className="text-blue-600" /> Buyer Contact Details
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  <p><span className="font-semibold text-light-textMuted dark:text-dark-textMuted">Name:</span> {selectedOrder.customer_info?.name || 'N/A'}</p>
                  <p><span className="font-semibold text-light-textMuted dark:text-dark-textMuted">Email:</span> {selectedOrder.customer_info?.email || 'N/A'}</p>
                  <p><span className="font-semibold text-light-textMuted dark:text-dark-textMuted">Phone:</span> {selectedOrder.customer_info?.phoneNumber || 'N/A'}</p>
                  <p><span className="font-semibold text-light-textMuted dark:text-dark-textMuted">Shipping Address:</span> {selectedOrder.customer_info?.address || 'N/A'}</p>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border p-4 rounded-2xl">
                <h4 className="font-bold text-light-text dark:text-dark-text text-xs uppercase tracking-wider mb-2.5">Billing Information</h4>
                <div className="grid grid-cols-2 gap-4 text-xs text-light-textSecondary dark:text-dark-textSecondary">
                  <p><span className="font-semibold text-light-textMuted dark:text-dark-textMuted">Order Date:</span> {formatDate(selectedOrder.created_at)}</p>
                  <div>
                    <span className="font-semibold text-light-textMuted dark:text-dark-textMuted">Status:</span>
                    <span className={`ml-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getStatusColor(selectedOrder.status)}`}>
                      {getStatusIcon(selectedOrder.status)}
                      <span className="capitalize">{selectedOrder.status}</span>
                    </span>
                  </div>
                  <p><span className="font-semibold text-light-textMuted dark:text-dark-textMuted">Payment:</span> <span className="capitalize">{selectedOrder.payment_method || 'N/A'}</span></p>
                  <p><span className="font-semibold text-light-textMuted dark:text-dark-textMuted">Billing Total:</span> <span className="font-bold text-light-text dark:text-dark-text">{formatPrice(selectedOrder.total_amount || 0)}</span></p>
                </div>
              </div>

              {/* Spares items ordered from this seller */}
              <div className="bg-green-50 border border-green-100 p-4 rounded-2xl">
                <h4 className="font-bold text-light-text dark:text-dark-text text-xs uppercase tracking-wider mb-3">Your Sold Spares in This Order</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.filter(item => item.seller_id === (user?.id || user?.uid)).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border">
                      <div className="flex items-center">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-11 h-11 object-contain bg-light-surfaceAlt dark:bg-dark-surfaceAlt p-1 rounded-lg border border-light-border dark:border-dark-border mr-3"
                          />
                        )}
                        <div>
                          <p className="font-bold text-sm text-light-text dark:text-dark-text">{item.name}</p>
                          <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-semibold">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-sm text-gray-950">{formatPrice(item.price || 0)}</p>
                        <p className="text-[10px] text-light-textMuted dark:text-dark-textMuted font-semibold">Total: {formatPrice(item.total || 0)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action items */}
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                <h4 className="font-bold text-light-text dark:text-dark-text text-xs uppercase tracking-wider mb-3">Customer Communication Shortcuts</h4>
                <div className="flex flex-wrap gap-2.5">
                  {selectedOrder.customer_info?.email && (
                    <a
                      href={`mailto:${selectedOrder.customer_info.email}`}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-xs font-bold rounded-xl text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/10"
                    >
                      <FaEnvelope /> Email Customer
                    </a>
                  )}
                  {selectedOrder.customer_info?.phoneNumber && (
                    <a
                      href={`tel:${selectedOrder.customer_info.phoneNumber}`}
                      className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-xs font-bold rounded-xl text-white bg-green-600 hover:bg-green-700 shadow-md shadow-green-500/10"
                    >
                      <FaPhone /> Call Customer
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Close buttons */}
            <div className="px-6 py-4 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border-t border-light-border dark:border-dark-border flex justify-end">
              <button
                onClick={() => setShowOrderDetails(false)}
                className="px-5 py-2 border border-light-border dark:border-dark-border hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt text-light-textSecondary dark:text-dark-textSecondary text-xs font-bold rounded-xl transition-all"
              >
                Close details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard;