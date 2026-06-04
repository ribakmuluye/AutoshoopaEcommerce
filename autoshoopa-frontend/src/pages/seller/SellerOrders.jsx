import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSellerOrders, updateOrderStatus } from '../../store/slices/orderSlice';
import { getImageUrl } from '../../config';
import { useCurrency } from '../../context/CurrencyContext';
import { formatDate } from '../../utils/dateUtils';
import { 
  FaEye, 
  FaTruck, 
  FaCheckCircle, 
  FaTimesCircle, 
  FaSpinner, 
  FaClock,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaMapMarkerAlt,
  FaBox
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const SellerOrders = () => {
  const dispatch = useDispatch();
  const { formatPrice } = useCurrency();
  const { user } = useSelector((state) => state.auth);
  const { sellerOrders = [], loading } = useSelector((state) => state.orders);
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (user) {
      dispatch(getSellerOrders(user.uid));
    }
  }, [dispatch, user]);

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
        return <FaClock className="w-4 h-4" />;
      case 'processing':
        return <FaSpinner className="w-4 h-4 animate-spin" />;
      case 'shipped':
        return <FaTruck className="w-4 h-4" />;
      case 'delivered':
        return <FaCheckCircle className="w-4 h-4" />;
      case 'cancelled':
        return <FaTimesCircle className="w-4 h-4" />;
      default:
        return <FaClock className="w-4 h-4" />;
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatus({ orderId, status: newStatus })).unwrap();
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const viewOrderDetails = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const filteredOrders = statusFilter === 'all' 
    ? sellerOrders 
    : sellerOrders.filter(order => order.status === statusFilter);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-light-text dark:text-dark-text">Your Orders</h1>
          
          {/* Status Filter */}
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-light-textSecondary dark:text-dark-textSecondary">Filter by status:</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-light-borderHover dark:border-dark-borderHover rounded-md px-3 py-1 text-sm"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-8 text-light-textMuted dark:text-dark-textMuted">
            <FaBox className="w-16 h-16 text-light-textMuted dark:text-dark-textMuted mx-auto mb-4" />
            <p className="text-lg font-medium text-light-text dark:text-dark-text mb-2">
              {statusFilter === 'all' ? 'No orders found' : `No ${statusFilter} orders`}
            </p>
            <p className="text-sm">
              {statusFilter === 'all' 
                ? 'Orders will appear here once customers start buying your products'
                : `No orders with ${statusFilter} status found`
              }
            </p>
          </div>
        ) : (
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
                    Your Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                    Revenue
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
                {filteredOrders.map((order) => {
                  const sellerItems = order.items?.filter(item => item.seller_id === user.uid) || [];
                  const sellerRevenue = sellerItems.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
                  
                  return (
                    <tr key={order.id} className="hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">
                        #{String(order.id || '').slice(-8) || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light-textMuted dark:text-dark-textMuted">
                        <div>
                          <p className="font-medium">{order.customer_info?.name || 'N/A'}</p>
                          <p className="text-xs text-light-textMuted dark:text-dark-textMuted">{order.customer_info?.email || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light-textMuted dark:text-dark-textMuted">
                        {formatDate(order.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-light-textMuted dark:text-dark-textMuted">
                        {sellerItems.length} items
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">
                        {formatPrice(sellerRevenue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="ml-1 capitalize">{order.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => viewOrderDetails(order)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <FaEye className="mr-1" />
                            View
                          </button>
                          
                          {/* Status Update Dropdown */}
                          {order.status !== 'delivered' && order.status !== 'cancelled' && (
                            <select
                              value={order.status}
                              onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                              className="text-xs border border-light-borderHover dark:border-dark-borderHover rounded px-2 py-1"
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-dark-surface">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-light-text dark:text-dark-text">
                  Order Details - #{String(selectedOrder.id || '').slice(-8)}
                </h3>
                <button
                  onClick={() => setShowOrderDetails(false)}
                  className="text-light-textMuted dark:text-dark-textMuted hover:text-light-textSecondary dark:text-dark-textSecondary"
                >
                  <FaTimesCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Customer Information */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-light-text dark:text-dark-text mb-2 flex items-center">
                    <FaUser className="mr-2" />
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-light-textSecondary dark:text-dark-textSecondary">Name:</span>
                      <p className="font-medium">{selectedOrder.customer_info?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-light-textSecondary dark:text-dark-textSecondary">Email:</span>
                      <p className="font-medium">{selectedOrder.customer_info?.email || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-light-textSecondary dark:text-dark-textSecondary">Phone:</span>
                      <p className="font-medium">{selectedOrder.customer_info?.phoneNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-light-textSecondary dark:text-dark-textSecondary">Address:</span>
                      <p className="font-medium">{selectedOrder.customer_info?.address || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
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
                      <p className="font-medium capitalize">{selectedOrder.payment_method || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-light-textSecondary dark:text-dark-textSecondary">Total Amount:</span>
                      <p className="font-medium">{formatPrice(selectedOrder.total_amount || 0)}</p>
                    </div>
                  </div>
                </div>

                {/* Your Products in This Order */}
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-light-text dark:text-dark-text mb-2">Your Products in This Order</h4>
                  <div className="space-y-3">
                    {selectedOrder.items?.filter(item => item.seller_id === user.uid).map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-dark-surface rounded border">
                        <div className="flex items-center">
                          {(item.image_url || item.image) && (
                            <img src={getImageUrl(item.image_url || item.image)} alt={item.product_name || item.name} className="w-12 h-12 object-cover rounded mr-3" />
                          )}
                          <div>
                            <p className="font-medium">{item.product_name || item.name}</p>
                            <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatPrice(item.price || 0)}</p>
                          <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">Total: {formatPrice(item.total || 0)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Actions */}
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-light-text dark:text-dark-text mb-2">Customer Contact</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedOrder.customer_info?.email && (
                      <a
                        href={`mailto:${selectedOrder.customer_info.email}`}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        <FaEnvelope className="mr-1" />
                        Email Customer
                      </a>
                    )}
                    {selectedOrder.customer_info?.phoneNumber && (
                      <a
                        href={`tel:${selectedOrder.customer_info.phoneNumber}`}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <FaPhone className="mr-1" />
                        Call Customer
                      </a>
                    )}
                  </div>
                </div>

                {/* Status Update */}
                {selectedOrder.status !== 'delivered' && selectedOrder.status !== 'cancelled' && (
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <h4 className="font-medium text-light-text dark:text-dark-text mb-2">Update Order Status</h4>
                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value)}
                        className="border border-light-borderHover dark:border-dark-borderHover rounded-md px-3 py-2 text-sm"
                      >
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <span className="text-sm text-light-textSecondary dark:text-dark-textSecondary">Click to update status</span>
                    </div>
                  </div>
                )}
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

export default SellerOrders;