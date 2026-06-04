import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import {
  FaUsers,
  FaBox,
  FaShoppingCart,
  FaDollarSign,
  FaChartLine,
  FaSpinner,
  FaStore,
  FaCheckCircle,
  FaTimesCircle,
  FaSearch,
  FaSync,
} from 'react-icons/fa';
import {
  getAllUsers,
  getAllProducts,
  getAllOrders,
  getAllSellers,
  updateUserStatus,
  rejectSeller,
  approveSeller,
  getPendingSellers
} from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import api from '../../api/client';

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-dark-surface rounded-lg shadow p-6"
  >
    <div className="flex items-center">
      <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-light-textMuted dark:text-dark-textMuted">{title}</p>
        {loading ? (
          <div className="flex items-center mt-1">
            <FaSpinner className="animate-spin h-5 w-5 text-light-textMuted dark:text-dark-textMuted" />
          </div>
        ) : (
          <p className="text-2xl font-semibold text-light-text dark:text-dark-text">{value}</p>
        )}
      </div>
    </div>
  </motion.div>
);

const DashboardHome = () => {
  const dispatch = useDispatch();
  const { user, allUsers = [], allProducts = [], allOrders = [], allSellers = [], loading, error } = useSelector(
    (state) => state.auth
  );
  const [processingSeller, setProcessingSeller] = useState(null);
  const [pendingSellers, setPendingSellers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedAction, setSelectedAction] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPendingSellers = async () => {
    try {
      const res = await dispatch(getPendingSellers()).unwrap();
      const sellers = res.map(seller => ({
        uid: seller.id || seller.uid,
        ...seller,
        created_at: seller.created_at
      }));
      setPendingSellers(sellers);
    } catch (error) {
      console.error('Error fetching pending sellers:', error);
      toast.error('Failed to fetch pending sellers');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(getAllUsers());
        await fetchPendingSellers();
        await Promise.all([
          dispatch(getAllProducts()),
          dispatch(getAllOrders())
        ]);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      }
    };

    fetchData();

    // Poll every 30 seconds instead of Firebase listeners
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [dispatch]);

  // Add a debug effect to monitor pending sellers
  useEffect(() => {
    console.log('Current pending sellers:', pendingSellers);
  }, [pendingSellers]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchPendingSellers();
      toast.success('Pending sellers list refreshed');
    } catch (error) {
      toast.error('Failed to refresh pending sellers');
    } finally {
      setRefreshing(false);
    }
  };

  const handleSellerAction = (sellerId, isApproved) => {
    setSelectedAction({ sellerId, isApproved });
    setShowConfirmDialog(true);
  };

  const confirmSellerAction = async () => {
    if (!selectedAction) return;
    
    const { sellerId, isApproved } = selectedAction;
    setProcessingSeller(sellerId);
    const toastId = toast.loading(isApproved ? 'Approving seller...' : 'Rejecting seller...');

    try {
      if (isApproved) {
        await dispatch(approveSeller(sellerId)).unwrap();
        toast.success('Seller approved successfully', { id: toastId });
      } else {
        await dispatch(rejectSeller(sellerId)).unwrap();
        toast.success('Seller rejected and removed successfully', { id: toastId });
      }

      setPendingSellers(prev => prev.filter(seller => seller.uid !== sellerId));
      await dispatch(getAllUsers());
    } catch (error) {
      console.error('Error updating seller status:', error);
      toast.error(
        isApproved ? 'Failed to approve seller' : 'Failed to reject seller',
        { id: toastId }
      );
    } finally {
      setProcessingSeller(null);
      setShowConfirmDialog(false);
      setSelectedAction(null);
    }
  };

  // Filter sellers based on search term
  const filteredSellers = pendingSellers.filter(seller => 
    seller.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seller.phone?.includes(searchTerm)
  );

  const totalRevenue = allOrders?.reduce((sum, order) => sum + (order?.total || 0), 0) || 0;
  const averageOrderValue = allOrders?.length
    ? (totalRevenue / allOrders.length).toFixed(2)
    : '0.00';

  // Calculate user statistics
  const userStats = {
    total: allUsers.length,
    active: allUsers.filter(user => user.isActive).length,
    newThisMonth: allUsers.filter(user => {
      const createdAt = user.createdAt;
      if (!createdAt) return false;
      
      // Handle both Firestore Timestamp and regular Date objects
      const userDate = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
      const now = new Date();
      return userDate.getMonth() === now.getMonth() && 
             userDate.getFullYear() === now.getFullYear();
    }).length,
  };

  // Calculate statistics
  const totalCustomers = allUsers.filter(user => user.user_type === 'customer').length;
  const totalSellers = allUsers.filter(user => user.user_type === 'seller').length;
  const approvedSellers = allUsers.filter(user => user.user_type === 'seller' && user.is_approved).length;
  const rejectedSellers = allUsers.filter(user => user.user_type === 'seller' && !user.is_approved).length;
  const totalOrders = allOrders.length;
  const totalProducts = allProducts.length;

  // Get recent orders
  const recentOrders = [...allOrders]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-light-text dark:text-dark-text">
          Welcome back, {user?.name || 'Admin'}!
        </h1>
        <p className="mt-1 text-light-textMuted dark:text-dark-textMuted">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaUsers className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-light-textMuted dark:text-dark-textMuted">Total Customers</p>
              <p className="text-lg font-semibold text-light-text dark:text-dark-text">{totalCustomers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaStore className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-light-textMuted dark:text-dark-textMuted">Total Sellers</p>
              <p className="text-lg font-semibold text-light-text dark:text-dark-text">{totalSellers}</p>
              <div className="mt-2 text-sm">
                <span className="text-green-600">{approvedSellers} Approved</span>
                <span className="mx-2">•</span>
                <span className="text-red-600">{rejectedSellers} Pending</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FaShoppingCart className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-light-textMuted dark:text-dark-textMuted">Total Orders</p>
              <p className="text-lg font-semibold text-light-text dark:text-dark-text">{totalOrders}</p>
              <p className="text-sm text-light-textMuted dark:text-dark-textMuted">${totalRevenue.toFixed(2)} Revenue</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FaBox className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-light-textMuted dark:text-dark-textMuted">Total Products</p>
              <p className="text-lg font-semibold text-light-text dark:text-dark-text">{totalProducts}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface rounded-lg shadow p-6"
        >
          <h2 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Platform Overview</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-light-textMuted dark:text-dark-textMuted">Total Orders</span>
                <span className="font-medium">{allOrders?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-light-textMuted dark:text-dark-textMuted">Total Revenue</span>
                <span className="font-medium">${totalRevenue.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-light-textMuted dark:text-dark-textMuted">Average Order Value</span>
                <span className="font-medium">${averageOrderValue}</span>
              </div>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-dark-surface rounded-lg shadow p-6"
        >
          <h2 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">Recent Activity</h2>
          {loading ? (
            <div className="flex justify-center py-8">
              <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center">
                <FaChartLine className="h-5 w-5 text-indigo-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-light-text dark:text-dark-text">
                    {allOrders?.length || 0} orders processed
                  </p>
                  <p className="text-xs text-light-textMuted dark:text-dark-textMuted">In the last 24 hours</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaUsers className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-light-text dark:text-dark-text">
                    {userStats.active} active users
                  </p>
                  <p className="text-xs text-light-textMuted dark:text-dark-textMuted">Across the platform</p>
                </div>
              </div>
              <div className="flex items-center">
                <FaBox className="h-5 w-5 text-purple-600 mr-3" />
                <div>
                  <p className="text-sm font-medium text-light-text dark:text-dark-text">
                    {allProducts?.length || 0} products listed
                  </p>
                  <p className="text-xs text-light-textMuted dark:text-dark-textMuted">
                    By {allSellers?.length || 0} sellers
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Pending Approvals and Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Seller Approvals */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="px-6 py-4 border-b border-light-border dark:border-dark-border">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-light-text dark:text-dark-text">Pending Seller Approvals</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="p-2 text-light-textSecondary dark:text-dark-textSecondary hover:text-light-text dark:text-dark-text disabled:opacity-50"
                  title="Refresh List"
                >
                  <FaSync className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                <span className="px-3 py-1 text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary bg-light-surfaceAlt dark:bg-dark-surfaceAlt rounded-full">
                  {pendingSellers.length} Pending
                </span>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-5 w-5 text-light-textMuted dark:text-dark-textMuted" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search sellers..."
                className="block w-full pl-10 pr-3 py-2 border border-light-borderHover dark:border-dark-borderHover rounded-md leading-5 bg-white dark:bg-dark-surface placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="p-6">
            {filteredSellers.length === 0 ? (
              <p className="text-light-textMuted dark:text-dark-textMuted text-center">
                {searchTerm ? 'No matching sellers found' : 'No pending approvals'}
              </p>
            ) : (
              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredSellers.map((seller) => (
                  <div key={seller.uid} className="flex items-center justify-between p-4 rounded-lg hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt transition-colors border border-light-border dark:border-dark-border">
                    <div className="flex items-center space-x-4">
                      <img
                        className="h-12 w-12 rounded-full object-cover"
                        src={seller.profileImage || '/images/logo.svg'}
                        alt={seller.name}
                      />
                      <div>
                        <p className="text-sm font-medium text-light-text dark:text-dark-text">{seller.name}</p>
                        <p className="text-sm text-light-textMuted dark:text-dark-textMuted">{seller.email}</p>
                        <div className="mt-1 space-y-1">
                          <p className="text-xs text-light-textMuted dark:text-dark-textMuted">
                            Registered: {new Date(seller.created_at).toLocaleDateString()}
                          </p>
                          {seller.phone && (
                            <p className="text-xs text-light-textMuted dark:text-dark-textMuted">
                              Phone: {seller.phone}
                            </p>
                          )}
                          {seller.business_name && (
                            <p className="text-xs text-light-textMuted dark:text-dark-textMuted">
                              Business: {seller.business_name}
                            </p>
                          )}
                          {seller.business_address && (
                            <p className="text-xs text-light-textMuted dark:text-dark-textMuted">
                              Address: {seller.business_address}
                            </p>
                          )}
                          {seller.tax_id && (
                            <p className="text-xs text-light-textMuted dark:text-dark-textMuted">
                              Tax ID: {seller.tax_id}
                            </p>
                          )}
                          {seller.business_license && (
                            <p className="text-xs text-light-textMuted dark:text-dark-textMuted">
                              License: {seller.business_license}
                            </p>
                          )}
                          {seller.verification_status && (
                            <p className="text-xs text-light-textMuted dark:text-dark-textMuted">
                              Verification: {seller.verification_status}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleSellerAction(seller.uid, true)}
                          disabled={processingSeller === seller.uid}
                          className={`px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                            processingSeller === seller.uid ? 'animate-pulse' : ''
                          }`}
                          title="Approve Seller"
                        >
                          {processingSeller === seller.uid ? (
                            <FaSpinner className="h-5 w-5 animate-spin" />
                          ) : (
                            <span className="flex items-center">
                              <FaCheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </span>
                          )}
                        </button>
                        <button 
                          onClick={() => handleSellerAction(seller.uid, false)}
                          disabled={processingSeller === seller.uid}
                          className={`px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed ${
                            processingSeller === seller.uid ? 'animate-pulse' : ''
                          }`}
                          title="Reject Seller"
                        >
                          {processingSeller === seller.uid ? (
                            <FaSpinner className="h-5 w-5 animate-spin" />
                          ) : (
                            <span className="flex items-center">
                              <FaTimesCircle className="h-4 w-4 mr-1" />
                              Reject
                            </span>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-light-textMuted dark:text-dark-textMuted">
                        ID: {seller.uid}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="px-6 py-4 border-b border-light-border dark:border-dark-border">
            <h2 className="text-lg font-medium text-light-text dark:text-dark-text">Recent Orders</h2>
          </div>
          <div className="p-6">
            {recentOrders.length === 0 ? (
              <p className="text-light-textMuted dark:text-dark-textMuted text-center">No recent orders</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 rounded-lg hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt transition-colors">
                    <div>
                      <p className="text-sm font-medium text-light-text dark:text-dark-text">Order #{order.id}</p>
                      <p className="text-sm text-light-textMuted dark:text-dark-textMuted">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-light-text dark:text-dark-text">
                      ${order.total.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-dark-surface rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-light-text dark:text-dark-text mb-4">
              {selectedAction?.isApproved ? 'Approve Seller' : 'Reject Seller'}
            </h3>
            <p className="text-sm text-light-textMuted dark:text-dark-textMuted mb-6">
              Are you sure you want to {selectedAction?.isApproved ? 'approve' : 'reject'} this seller?
              {!selectedAction?.isApproved && ' This action cannot be undone.'}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowConfirmDialog(false);
                  setSelectedAction(null);
                }}
                className="px-4 py-2 text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary bg-light-surfaceAlt dark:bg-dark-surfaceAlt rounded-md hover:bg-light-border dark:bg-dark-border"
              >
                Cancel
              </button>
              <button
                onClick={confirmSellerAction}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  selectedAction?.isApproved
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {selectedAction?.isApproved ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardHome; 