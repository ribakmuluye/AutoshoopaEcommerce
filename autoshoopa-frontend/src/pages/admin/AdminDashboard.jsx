import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FaUserCheck, FaUserTimes, FaSpinner, FaUsers, FaShoppingBag, FaBox, FaShoppingCart, FaChartLine, FaStore, FaEye, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { getPendingSellers, approveSeller, rejectSeller, getAllSellers, getAllCustomers, getAllProducts, getAllOrders } from '../../store/slices/authSlice';
import { updateOrderStatus } from '../../store/slices/orderSlice';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/dateUtils';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { pendingSellers = [], allSellers = [], allCustomers = [], allProducts = [], allOrders = [], loading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  console.log('AdminDashboard - auth state:', { pendingSellers, allSellers, allCustomers, allProducts, allOrders, loading });

  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    pendingApprovals: 0,
    activeSellers: 0,
    totalCustomers: 0
  });

  useEffect(() => {
    console.log('AdminDashboard - dispatching actions...');
    try {
    dispatch(getPendingSellers());
    dispatch(getAllSellers());
    dispatch(getAllCustomers());
    dispatch(getAllProducts());
    dispatch(getAllOrders());
    } catch (error) {
      console.error('Error dispatching admin actions:', error);
      toast.error('Failed to load admin data');
    }
  }, [dispatch]);

  useEffect(() => {
    // Calculate statistics
    const totalRevenue = allOrders?.reduce((sum, order) => sum + (Number(order?.total_amount) || 0), 0) || 0;
    const totalOrders = allOrders?.length || 0;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const activeSellers = allSellers?.filter(seller => seller?.status === 'approved' || seller?.is_approved)?.length || 0;
    const totalCustomers = allCustomers?.length || 0;

    setStats({
      totalRevenue,
      totalOrders,
      averageOrderValue,
      pendingApprovals: pendingSellers?.length || 0,
      activeSellers,
      totalCustomers
    });
  }, [allOrders, allSellers, allCustomers, pendingSellers]);

  const handleSellerAction = async (sellerId, isApproved) => {
    try {
      if (isApproved) {
        await dispatch(approveSeller(sellerId)).unwrap();
        toast.success('Seller approved successfully');
      } else {
        await dispatch(rejectSeller(sellerId)).unwrap();
        toast.success('Seller rejected successfully');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to process seller');
    }
  };

  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error('Failed to update order status');
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

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const renderOrders = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
        </div>
      );
    }

    if (!allOrders?.length) {
      return (
        <div className="text-center py-12 text-light-textMuted dark:text-dark-textMuted">
          No orders found
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-light-surfaceAlt dark:bg-dark-surfaceAlt">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                Order ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                Items
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200">
            {allOrders.map((order) => (
              <tr key={order.id} className="hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">
                  #{order.id?.slice(-8) || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-light-textMuted dark:text-dark-textMuted">
                  {order.customer_info?.name || order.customer_info?.email || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-light-textMuted dark:text-dark-textMuted">
                  {formatDate(order.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-light-textMuted dark:text-dark-textMuted">
                  {order.items?.length || 0} items
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">
                  ₦{Number(order.total_amount || 0).toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="ml-1 capitalize">{order.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => viewOrderDetails(order)}
                    className="text-blue-600 hover:text-blue-900 flex items-center"
                  >
                    <FaEye className="mr-1" />
                    View
                  </button>
                  <select
                    value={order.status}
                    onChange={(e) => handleOrderStatusUpdate(order.id, e.target.value)}
                    className="text-sm border border-light-borderHover dark:border-dark-borderHover rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPendingSellers = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
        </div>
      );
    }

    if (!pendingSellers?.length) {
      return (
        <div className="text-center py-12 text-light-textMuted dark:text-dark-textMuted">
          No pending seller approvals
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pendingSellers.map((seller) => (
          <div key={seller.uid} className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <img
                  className="h-12 w-12 rounded-full"
                  src={seller.profile_image || '/images/logo.svg'}
                  alt={seller.name}
                />
              </div>
              <div>
                <h3 className="text-lg font-medium text-light-text dark:text-dark-text">{seller.name}</h3>
                <p className="text-sm text-light-textMuted dark:text-dark-textMuted">{seller.email}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                <span className="font-medium">Business Name:</span> {seller.business_name || 'N/A'}
              </p>
              <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                <span className="font-medium">Phone:</span> {seller.phone || 'N/A'}
              </p>
              <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                <span className="font-medium">Joined:</span>{' '}
                {seller.created_at ? new Date(seller.created_at).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleSellerAction(seller.uid, true)}
                className="px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 hover:bg-green-200"
              >
                Approve
              </button>
              <button
                onClick={() => handleSellerAction(seller.uid, false)}
                className="px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 hover:bg-red-200"
              >
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderApprovedSellers = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
        </div>
      );
    }

    if (!allSellers?.length) {
      return (
        <div className="text-center py-12 text-light-textMuted dark:text-dark-textMuted">
          No approved sellers
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allSellers.map((seller) => {
          const sellerProducts = allProducts?.filter(p => p?.seller_id === seller.uid) || [];
          const sellerOrders = allOrders?.filter(order => 
            order?.items?.some(item => sellerProducts.some(p => p?.id === item?.product_id))
          ) || [];
          const sellerCustomers = [...new Set(sellerOrders.map(order => order?.customer_id))];

          return (
            <div key={seller.uid} className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full"
                    src={seller.profile_image || '/images/logo.svg'}
                    alt={seller.name}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-light-text dark:text-dark-text">{seller.name}</h3>
                  <p className="text-sm text-light-textMuted dark:text-dark-textMuted">{seller.email}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  <span className="font-medium">Business Name:</span> {seller.business_name || 'N/A'}
                </p>
                <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  <span className="font-medium">Products:</span> {sellerProducts.length}
                </p>
                <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  <span className="font-medium">Orders:</span> {sellerOrders.length}
                </p>
                <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  <span className="font-medium">Customers:</span> {sellerCustomers.length}
                </p>
                <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    seller.status === 'approved' || seller.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {seller.status === 'approved' || seller.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-light-surfaceAlt dark:bg-dark-surfaceAlt py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Admin Dashboard</h1>
          <p className="text-light-textSecondary dark:text-dark-textSecondary mt-2">Manage your marketplace</p>
        </div>

        {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white dark:bg-dark-surface rounded-lg shadow p-6"
          >
          <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaChartLine className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">Total Revenue</p>
                <p className="text-2xl font-bold text-light-text dark:text-dark-text">₦{stats.totalRevenue.toFixed(2)}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="bg-white dark:bg-dark-surface rounded-lg shadow p-6"
          >
          <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">Total Orders</p>
                <p className="text-2xl font-bold text-light-text dark:text-dark-text">{stats.totalOrders}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white dark:bg-dark-surface rounded-lg shadow p-6"
          >
          <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <FaUserCheck className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">Pending Approvals</p>
                <p className="text-2xl font-bold text-light-text dark:text-dark-text">{stats.pendingApprovals}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="bg-white dark:bg-dark-surface rounded-lg shadow p-6"
          >
          <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FaStore className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
                <p className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">Active Sellers</p>
                <p className="text-2xl font-bold text-light-text dark:text-dark-text">{stats.activeSellers}</p>
              </div>
            </div>
          </motion.div>
      </div>

      {/* Tabs */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow mb-8">
        <div className="border-b border-light-border dark:border-dark-border">
            <nav className="-mb-px flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('pending')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'pending'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-light-textMuted dark:text-dark-textMuted hover:text-light-textSecondary dark:text-dark-textSecondary hover:border-light-borderHover dark:border-dark-borderHover'
                }`}
              >
                Pending Approvals ({pendingSellers.length})
              </button>
              <button
                onClick={() => setActiveTab('sellers')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'sellers'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-light-textMuted dark:text-dark-textMuted hover:text-light-textSecondary dark:text-dark-textSecondary hover:border-light-borderHover dark:border-dark-borderHover'
                }`}
              >
                Approved Sellers ({allSellers.length})
            </button>
            <button
                onClick={() => setActiveTab('orders')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'orders'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-light-textMuted dark:text-dark-textMuted hover:text-light-textSecondary dark:text-dark-textSecondary hover:border-light-borderHover dark:border-dark-borderHover'
                }`}
            >
                All Orders ({allOrders.length})
            </button>
          </nav>
          </div>

          <div className="p-6">
            {activeTab === 'pending' && renderPendingSellers()}
            {activeTab === 'sellers' && renderApprovedSellers()}
            {activeTab === 'orders' && renderOrders()}
          </div>
        </div>
      </div>

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

export default AdminDashboard; 