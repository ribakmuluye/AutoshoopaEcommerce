import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSellerOrders, updateOrderStatus } from '../../store/slices/orderSlice';
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import dayjs from 'dayjs';
import toast from 'react-hot-toast';

const OrderManagement = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { 
    sellerOrders, 
    loading, 
    error
  } = useSelector((state) => state.orders);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    if (user) {
      dispatch(getSellerOrders(user.uid));
    }
  }, [dispatch, user]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatus({
        orderId,
        status: newStatus
      })).unwrap();
      toast.success('Order status updated successfully');
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  // Calculate statistics from seller orders
  const statistics = {
    totalOrders: sellerOrders.length,
    totalRevenue: sellerOrders.reduce((sum, order) => sum + (Number(order.total_amount) || 0), 0),
    completedOrders: sellerOrders.filter(order => order.status === 'delivered').length,
    pendingOrders: sellerOrders.filter(order => order.status === 'pending').length
  };

  const filteredOrders = selectedStatus === 'all'
    ? sellerOrders
    : sellerOrders.filter(order => order.status === selectedStatus);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        Error loading orders: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-4 border border-light-border dark:border-dark-border">
          <h3 className="text-sm font-medium text-light-textMuted dark:text-dark-textMuted">Total Orders</h3>
          <p className="text-2xl font-semibold">{statistics.totalOrders}</p>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-4 border border-light-border dark:border-dark-border">
          <h3 className="text-sm font-medium text-light-textMuted dark:text-dark-textMuted">Total Revenue</h3>
          <p className="text-2xl font-semibold">₦{statistics.totalRevenue.toFixed(2)}</p>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-4 border border-light-border dark:border-dark-border">
          <h3 className="text-sm font-medium text-light-textMuted dark:text-dark-textMuted">Completed Orders</h3>
          <p className="text-2xl font-semibold">{statistics.completedOrders}</p>
        </div>
        <div className="bg-white dark:bg-dark-surface rounded-lg shadow p-4 border border-light-border dark:border-dark-border">
          <h3 className="text-sm font-medium text-light-textMuted dark:text-dark-textMuted">Pending Orders</h3>
          <p className="text-2xl font-semibold">{statistics.pendingOrders}</p>
        </div>
      </div>

      {/* Order List */}
      <div className="bg-white dark:bg-dark-surface rounded-lg shadow border border-light-border dark:border-dark-border">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Orders</h2>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border rounded-md px-3 py-1"
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

        <div className="divide-y">
          {filteredOrders.length === 0 ? (
            <div className="p-8 text-center text-light-textMuted dark:text-dark-textMuted">
              No orders found
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">Order #{order.id?.slice(-6) || 'N/A'}</h3>
                    <p className="text-sm text-light-textMuted dark:text-dark-textMuted">
                      {dayjs(order.created_at).format('MMMM D, YYYY h:mm A')}
                    </p>
                    <div className="mt-2 space-y-1">
                      {order.items?.map((item, index) => (
                        <div key={index} className="text-sm">
                          {item.quantity}x {item.name} - ₦{Number(item.total || 0).toFixed(2)}
                        </div>
                      ))}
                    </div>
                    <p className="mt-2 font-medium">
                      Total: ₦{Number(order.total_amount || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>

                    {order.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'processing')}
                          className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                        >
                          Process
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {order.status === 'processing' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'shipped')}
                          className="px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
                        >
                          Ship
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(order.id, 'cancelled')}
                          className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    )}

                    {order.status === 'shipped' && (
                      <button
                        onClick={() => handleStatusUpdate(order.id, 'delivered')}
                        className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                      >
                        Deliver
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement; 