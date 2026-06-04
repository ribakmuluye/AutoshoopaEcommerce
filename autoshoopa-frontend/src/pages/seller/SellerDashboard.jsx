import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  FaSpinner, 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaBox, 
  FaShoppingCart, 
  FaDollarSign, 
  FaUsers, 
  FaChartLine,
  FaEye,
  FaTruck,
  FaTimesCircle,
  FaHistory
} from 'react-icons/fa';
import api from '../../api/client';
import { getSellerOrders } from '../../store/slices/orderSlice';
import Notification from '../../components/Notification';

const SellerDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { sellerOrders, loading } = useSelector((state) => state.orders);
  const [sellerData, setSellerData] = useState(null);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    lowStockProducts: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  useEffect(() => {
    if (user) {
      setSellerData(user);
      fetchSellerStats();
      if (user.uid) {
        dispatch(getSellerOrders(user.uid));
      }
    }
  }, [user, dispatch]);

  useEffect(() => {
    if (sellerOrders.length > 0) {
      setRecentOrders(sellerOrders.slice(0, 5));
    }
  }, [sellerOrders]);

  const fetchSellerStats = async () => {
    try {
      // Fetch seller products via API
      const res = await api.get(`/api/products.php?seller_id=${user.id || user.uid}`);
      const products = Array.isArray(res.data) ? res.data : [];
      const totalProducts = products.length;
      const lowStockProducts = products.filter(product => (product.stock || 0) < 10).length;

      // Calculate stats from seller orders
      const totalRevenue = sellerOrders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0);
      const uniqueCustomers = new Set(sellerOrders.map(order => order.customer_id)).size;

      setStats({
        totalProducts,
        totalOrders: sellerOrders.length,
        totalRevenue,
        totalCustomers: uniqueCustomers,
        lowStockProducts
      });
    } catch (error) {
      console.error('Error fetching seller stats:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'shipped':
        return 'text-purple-600 bg-purple-100';
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-light-textSecondary dark:text-dark-textSecondary bg-light-surfaceAlt dark:bg-dark-surfaceAlt';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FaBox className="w-4 h-4" />;
      case 'processing':
        return <FaSpinner className="w-4 h-4 animate-spin" />;
      case 'shipped':
        return <FaTruck className="w-4 h-4" />;
      case 'delivered':
        return <FaCheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <FaTimesCircle className="w-4 h-4" />;
      default:
        return <FaBox className="w-4 h-4" />;
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  if (!sellerData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Notification />
      
      {!sellerData.is_approved && sellerData.status !== 'approved' ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-lg shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <FaExclamationTriangle className="h-6 w-6 text-yellow-400" />
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-yellow-800">Account Pending Approval</h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>Your seller account is currently under review by our admin team. This process typically takes 1-2 business days.</p>
                <p className="mt-2">While waiting for approval, you can:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Complete your business profile</li>
                  <li>Prepare your product listings</li>
                  <li>Review our seller guidelines</li>
                </ul>
                <p className="mt-4">You will receive a notification once your account is approved. Thank you for your patience!</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-green-50 border-l-4 border-green-400 p-6 mb-6 rounded-lg shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaCheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-green-800">Welcome to Your Seller Dashboard!</h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Your seller account is active. You can now manage your products, view orders, and track your sales.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            {/* Total Products */}
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                  <FaBox className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">Total Products</p>
                  <p className="text-2xl font-semibold text-light-text dark:text-dark-text">{stats.totalProducts}</p>
                </div>
              </div>
            </div>

            {/* Total Orders */}
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FaShoppingCart className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">Total Orders</p>
                  <p className="text-2xl font-semibold text-light-text dark:text-dark-text">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            {/* Total Revenue */}
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <FaDollarSign className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">Total Revenue</p>
                  <p className="text-2xl font-semibold text-light-text dark:text-dark-text">₦{stats.totalRevenue.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Total Customers */}
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <FaUsers className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">Total Customers</p>
                  <p className="text-2xl font-semibold text-light-text dark:text-dark-text">{stats.totalCustomers}</p>
                </div>
              </div>
            </div>

            {/* Low Stock Alert */}
            <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <FaExclamationTriangle className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">Low Stock</p>
                  <p className="text-2xl font-semibold text-light-text dark:text-dark-text">{stats.lowStockProducts}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Quick Actions</h3>
                <div className="space-y-4">
                  <button
                    onClick={() => navigate('/seller/products/add')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <FaBox className="h-5 w-5 mr-2" />
                    Add New Product
                  </button>
                  <button
                    onClick={() => navigate('/seller/orders')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <FaShoppingCart className="h-5 w-5 mr-2" />
                    View All Orders
                  </button>
                  <button
                    onClick={() => navigate('/seller/products')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <FaBox className="h-5 w-5 mr-2" />
                    Manage Products
                  </button>
                  <button
                    onClick={() => navigate('/seller/analytics')}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                  >
                    <FaChartLine className="h-5 w-5 mr-2" />
                    View Analytics
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-dark-surface rounded-lg shadow">
                <div className="px-6 py-4 border-b border-light-border dark:border-dark-border">
                  <h3 className="text-lg font-medium text-light-text dark:text-dark-text flex items-center">
                    <FaHistory className="mr-2" />
                    Recent Orders
                  </h3>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="flex justify-center items-center py-8">
                      <FaSpinner className="animate-spin h-6 w-6 text-indigo-600" />
                    </div>
                  ) : recentOrders.length === 0 ? (
                    <div className="text-center py-8 text-light-textMuted dark:text-dark-textMuted">
                      <FaShoppingCart className="h-12 w-12 mx-auto mb-4 text-light-textMuted dark:text-dark-textMuted" />
                      <p>No orders yet</p>
                      <p className="text-sm">Orders will appear here once customers start buying your products</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-4 border border-light-border dark:border-dark-border rounded-lg hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt">
                          <div className="flex items-center space-x-4">
                            <div>
                              <p className="font-medium text-light-text dark:text-dark-text">
                                Order #{order.id?.slice(-8) || 'N/A'}
                              </p>
                              <p className="text-sm text-light-textMuted dark:text-dark-textMuted">
                                {order.customer_info?.name || order.customer_info?.email || 'Customer'}
                              </p>
                              <p className="text-sm text-light-textMuted dark:text-dark-textMuted">
                                {formatDate(order.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="text-right">
                              <p className="font-medium text-light-text dark:text-dark-text">
                                ₦{Number(order.total_amount || 0).toFixed(2)}
                              </p>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                                {getStatusIcon(order.status)}
                                <span className="ml-1 capitalize">{order.status}</span>
                              </span>
                            </div>
                            <button
                              onClick={() => viewOrderDetails(order)}
                              className="text-blue-600 hover:text-blue-900 flex items-center"
                            >
                              <FaEye className="mr-1" />
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                      {sellerOrders.length > 5 && (
                        <div className="text-center pt-4">
                          <button
                            onClick={() => navigate('/seller/orders')}
                            className="text-indigo-600 hover:text-indigo-900 font-medium"
                          >
                            View All Orders ({sellerOrders.length})
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-dark-surface">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-light-text dark:text-dark-text">
                  Order Details - #{selectedOrder.id?.slice(-8) || 'N/A'}
                </h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-light-textMuted dark:text-dark-textMuted hover:text-light-textSecondary dark:text-dark-textSecondary"
                >
                  <FaTimesCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Order Info */}
                <div className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt p-4 rounded-lg">
                  <h4 className="font-medium text-light-text dark:text-dark-text mb-2">Order Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-light-textSecondary dark:text-dark-textSecondary">Order Date:</span>
                      <p className="font-medium">{formatDate(selectedOrder.created_at)}</p>
                    </div>
                    <div>
                      <span className="text-light-textSecondary dark:text-dark-textSecondary">Status:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusIcon(selectedOrder.status)}
                        <span className="ml-1 capitalize">{selectedOrder.status}</span>
                      </span>
                    </div>
                    <div>
                      <span className="text-light-textSecondary dark:text-dark-textSecondary">Payment Method:</span>
                      <p className="font-medium capitalize">{selectedOrder.payment_method}</p>
                    </div>
                    <div>
                      <span className="text-light-textSecondary dark:text-dark-textSecondary">Total Amount:</span>
                      <p className="font-medium">₦{Number(selectedOrder.total_amount || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt p-4 rounded-lg">
                  <h4 className="font-medium text-light-text dark:text-dark-text mb-2">Customer Information</h4>
                  <div className="text-sm">
                    <p><span className="text-light-textSecondary dark:text-dark-textSecondary">Name:</span> {selectedOrder.customer_info?.name}</p>
                    <p><span className="text-light-textSecondary dark:text-dark-textSecondary">Email:</span> {selectedOrder.customer_info?.email}</p>
                    <p><span className="text-light-textSecondary dark:text-dark-textSecondary">Address:</span> {selectedOrder.customer_info?.address}</p>
                    <p><span className="text-light-textSecondary dark:text-dark-textSecondary">City:</span> {selectedOrder.customer_info?.city}</p>
                    <p><span className="text-light-textSecondary dark:text-dark-textSecondary">Country:</span> {selectedOrder.customer_info?.country}</p>
                    {selectedOrder.customer_info?.phoneNumber && (
                      <p><span className="text-light-textSecondary dark:text-dark-textSecondary">Phone:</span> {selectedOrder.customer_info.phoneNumber}</p>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt p-4 rounded-lg">
                  <h4 className="font-medium text-light-text dark:text-dark-text mb-2">Order Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-dark-surface rounded border">
                        <div className="flex items-center">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="w-12 h-12 object-cover rounded mr-3" />
                          )}
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₦{Number(item.price || 0).toFixed(2)}</p>
                          <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">Total: ₦{Number(item.total || 0).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="px-4 py-2 bg-gray-300 text-light-textSecondary dark:text-dark-textSecondary rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerDashboard; 