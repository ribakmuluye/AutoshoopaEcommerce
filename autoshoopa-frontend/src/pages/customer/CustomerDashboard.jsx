import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getImageUrl } from '../../config';
import { 
  FaShoppingBag, 
  FaHistory, 
  FaBox, 
  FaTruck, 
  FaCheckCircle, 
  FaTimesCircle,
  FaSpinner,
  FaEye,
  FaArrowRight,
  FaSync,
  FaTimes
} from 'react-icons/fa';
import { getCustomerOrders } from '../../store/slices/orderSlice';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/dateUtils';

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { customerOrders = [], loading } = useSelector((state) => state.orders);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const userId = user?.id || user?.uid;
    if (userId) {
      dispatch(getCustomerOrders(userId));
    }
  }, [isAuthenticated, user, navigate, dispatch]);

  const refreshOrders = () => {
    const userId = user?.id || user?.uid;
    if (userId) {
      dispatch(getCustomerOrders(userId));
      toast.success('Orders refreshed');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'processing':
        return 'text-blue-600 bg-blue-50 border-blue-100';
      case 'shipped':
        return 'text-purple-600 bg-purple-50 border-purple-100';
      case 'delivered':
        return 'text-green-600 bg-green-50 border-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-50 border-red-100';
      default:
        return 'text-light-textSecondary dark:text-dark-textSecondary bg-light-surfaceAlt dark:bg-dark-surfaceAlt border-light-border dark:border-dark-border';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaBox className="w-3 h-3" />;
      case 'processing':
        return <FaSpinner className="w-3 h-3 animate-spin" />;
      case 'shipped':
        return <FaTruck className="w-3 h-3" />;
      case 'delivered':
        return <FaCheckCircle className="w-3 h-3" />;
      case 'cancelled':
        return <FaTimesCircle className="w-3 h-3" />;
      default:
        return <FaBox className="w-3 h-3" />;
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Welcome Header */}
        <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl p-8 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-32 h-32 bg-brand-orange-500/5 rounded-full blur-2xl pointer-events-none" />
          <div>
            <span className="text-[10px] font-bold text-brand-orange-600 dark:text-brand-orange-500 uppercase tracking-widest bg-brand-orange-50 dark:bg-brand-orange-950/20 px-2.5 py-1 rounded-full border border-brand-orange-100 dark:border-brand-orange-500/20">Customer Portal</span>
            <h1 className="text-2xl font-extrabold text-light-text dark:text-dark-text mt-3">
              Hello, {user?.name || user?.displayName || user?.email?.split('@')[0]}!
            </h1>
            <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium mt-1">
              Easily manage your spares purchases, track ongoing shipments, and review order histories.
            </p>
          </div>

          <div className="flex gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => navigate('/shop')}
              className="flex-1 sm:flex-initial px-5 py-3 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-brand-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-orange-500/10 flex items-center justify-center gap-2"
            >
              Shop Spares <FaArrowRight />
            </button>
            <button
              onClick={refreshOrders}
              className="px-4 py-3 border border-light-border dark:border-dark-border hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt text-light-textSecondary dark:text-dark-textSecondary text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 bg-white dark:bg-dark-surface"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: 'Total Orders',
              value: customerOrders.length,
              icon: FaShoppingBag,
              color: 'text-brand-orange-600 dark:text-brand-orange-500 bg-brand-orange-50 dark:bg-brand-orange-950/20 border-brand-orange-100 dark:border-brand-orange-500/20',
            },
            {
              title: 'Completed',
              value: customerOrders.filter(order => order.status === 'delivered').length,
              icon: FaCheckCircle,
              color: 'text-green-600 bg-green-50 border-green-100',
            },
            {
              title: 'Pending Verify',
              value: customerOrders.filter(order => order.status === 'pending').length,
              icon: FaBox,
              color: 'text-amber-600 bg-amber-50 border-amber-100',
            },
            {
              title: 'In Transit',
              value: customerOrders.filter(order => order.status === 'shipped').length,
              icon: FaTruck,
              color: 'text-purple-600 bg-purple-50 border-purple-100',
            }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-2xl p-5 flex items-center shadow-sm">
              <div className={`w-12 h-12 rounded-xl border ${stat.color} flex items-center justify-center text-lg`}>
                <stat.icon />
              </div>
              <div className="ml-4">
                <p className="text-[10px] font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-widest">{stat.title}</p>
                <p className="text-xl font-extrabold text-light-text dark:text-dark-text mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Orders Table Container */}
        <div className="bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border rounded-3xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-light-border dark:border-dark-border flex items-center gap-2.5">
            <FaHistory className="text-brand-orange-500 dark:text-brand-orange-400 text-sm" />
            <h2 className="text-sm font-extrabold text-light-text dark:text-dark-text uppercase tracking-wider">Your Order History</h2>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <FaSpinner className="animate-spin h-8 w-8 text-brand-orange-500 dark:text-brand-orange-400" />
            </div>
          ) : customerOrders.length === 0 ? (
            <div className="text-center py-20 px-6">
              <div className="w-16 h-16 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border border-light-border dark:border-dark-border rounded-2xl flex items-center justify-center mx-auto mb-4 text-gray-300">
                <FaHistory className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-light-text dark:text-dark-text mb-1">No orders found</h3>
              <p className="text-xs text-light-textMuted dark:text-dark-textMuted max-w-sm mx-auto mb-6">
                You haven't ordered any auto spare parts yet. Start browsing now!
              </p>
              <button
                onClick={() => navigate('/shop')}
                className="px-6 py-3 bg-gradient-to-r from-brand-orange-500 to-brand-orange-600 hover:from-brand-orange-600 hover:to-brand-orange-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-brand-orange-500/10"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-light-bg dark:bg-dark-bg">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Order Date</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Items Quantity</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Total Amount</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Delivery Status</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-100">
                  {customerOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt/30 transition-all">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-light-text dark:text-dark-text">
                        #{String(order.id || '').slice(-8).toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-light-textMuted dark:text-dark-textMuted font-medium">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-light-textMuted dark:text-dark-textMuted font-bold">
                        {order.items?.length || 0} spares
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-extrabold text-light-text dark:text-dark-text">
                        {Number(order.total_amount || 0).toFixed(2)}{' '}
                        <span className="text-[10px] text-light-textMuted dark:text-dark-textMuted font-bold">ETB</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <button
                          onClick={() => viewOrderDetails(order)}
                          className="text-brand-orange-600 dark:text-brand-orange-500 hover:text-orange-700 bg-brand-orange-50 dark:bg-brand-orange-950/20 hover:bg-brand-orange-50 dark:bg-brand-orange-950/20 px-3.5 py-2 rounded-xl transition-all inline-flex items-center gap-1.5 text-xs font-bold border border-brand-orange-100 dark:border-brand-orange-500/20"
                        >
                          <FaEye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modern Redesigned Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
          <div className="relative mx-auto border border-light-border dark:border-dark-border w-full max-w-2xl shadow-2xl rounded-3xl bg-white dark:bg-dark-surface overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-light-border dark:border-dark-border flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-light-text dark:text-dark-text">Order Breakdown</h3>
                <p className="text-xs text-light-textMuted dark:text-dark-textMuted font-medium mt-0.5">#{String(selectedOrder.id || '').toUpperCase()}</p>
              </div>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="text-light-textMuted dark:text-dark-textMuted hover:text-light-textSecondary dark:text-dark-textSecondary p-2 rounded-xl hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt transition-colors"
              >
                <FaTimes className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-5 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Billing Details */}
                <div className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border p-5 rounded-2xl space-y-3">
                  <h4 className="font-extrabold text-light-text dark:text-dark-text text-xs uppercase tracking-wider border-b border-light-border dark:border-dark-border pb-2">Billing & Payment</h4>
                  <div className="space-y-2 text-xs text-light-textSecondary dark:text-dark-textSecondary font-medium">
                    <p><span className="text-light-textMuted dark:text-dark-textMuted">Ordered:</span> {formatDate(selectedOrder.created_at)}</p>
                    <p><span className="text-light-textMuted dark:text-dark-textMuted">Payment Type:</span> <span className="capitalize text-light-text dark:text-dark-text">{selectedOrder.payment_method}</span></p>
                    <p><span className="text-light-textMuted dark:text-dark-textMuted">Grand Total:</span> <span className="font-bold text-gray-955 text-sm">{Number(selectedOrder.total_amount || 0).toFixed(2)} ETB</span></p>
                    <div className="pt-1.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        <span className="capitalize">{selectedOrder.status}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border p-5 rounded-2xl space-y-3">
                  <h4 className="font-extrabold text-light-text dark:text-dark-text text-xs uppercase tracking-wider border-b border-light-border dark:border-dark-border pb-2">Shipping Information</h4>
                  <div className="space-y-2 text-xs text-light-textSecondary dark:text-dark-textSecondary font-medium">
                    <p><span className="text-light-textMuted dark:text-dark-textMuted">Recipient Name:</span> <span className="text-light-text dark:text-dark-text">{selectedOrder.customer_info?.name}</span></p>
                    <p><span className="text-light-textMuted dark:text-dark-textMuted">Email Contact:</span> <span className="text-light-text dark:text-dark-text">{selectedOrder.customer_info?.email}</span></p>
                    <p><span className="text-light-textMuted dark:text-dark-textMuted">Phone Contact:</span> <span className="text-light-text dark:text-dark-text">{selectedOrder.customer_info?.phoneNumber || 'N/A'}</span></p>
                    <p className="leading-relaxed"><span className="text-light-textMuted dark:text-dark-textMuted">Address:</span> <span className="text-light-text dark:text-dark-text">{selectedOrder.customer_info?.address}, {selectedOrder.customer_info?.city}</span></p>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="bg-light-bg dark:bg-dark-bg border border-light-border dark:border-dark-border p-5 rounded-2xl space-y-3">
                <h4 className="font-extrabold text-light-text dark:text-dark-text text-xs uppercase tracking-wider border-b border-light-border dark:border-dark-border pb-2">Parts Summary</h4>
                <div className="space-y-3 pt-1">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-dark-surface rounded-xl border border-light-border dark:border-dark-border shadow-sm">
                      <div className="flex items-center">
                        {(item.image_url || item.image) && (
                          <img
                            src={getImageUrl(item.image_url || item.image)}
                            alt={item.product_name || item.name}
                            className="w-10 h-10 object-cover bg-light-surfaceAlt dark:bg-dark-surfaceAlt rounded-lg mr-3"
                          />
                        )}
                        <div>
                          <p className="font-bold text-xs text-light-text dark:text-dark-text">{item.product_name || item.name}</p>
                          <p className="text-[10px] text-light-textMuted dark:text-dark-textMuted font-bold mt-0.5">Quantity: {item.quantity}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-extrabold text-xs text-light-text dark:text-dark-text">{(Number(item.price) || 0).toFixed(2)} ETB</p>
                        <p className="text-[9px] text-light-textMuted dark:text-dark-textMuted font-bold">Total: {(Number(item.total) || 0).toFixed(2)} ETB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-light-surfaceAlt dark:bg-dark-surfaceAlt border-t border-light-border dark:border-dark-border flex justify-end">
              <button
                onClick={() => setShowOrderDetails(false)}
                className="px-5 py-2.5 border border-light-border dark:border-dark-border hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt text-light-textSecondary dark:text-dark-textSecondary text-xs font-bold rounded-xl transition-all"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;