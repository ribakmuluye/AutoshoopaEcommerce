import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllOrders, getAllUsers, getAllProducts } from '../../store/slices/authSlice';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaTruck, FaBox } from 'react-icons/fa';

const OrdersManagement = () => {
  const dispatch = useDispatch();
  const { allOrders = [], allUsers = [], allProducts = [], loading } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getAllOrders());
    dispatch(getAllUsers());
    dispatch(getAllProducts());
  }, [dispatch]);

  const getCustomerName = (customerId) => {
    const customer = allUsers.find(user => user.uid === customerId);
    return customer ? customer.name : 'Unknown Customer';
  };

  const getProductName = (productId) => {
    const product = allProducts.find(p => p.id === productId);
    return product ? product.name : 'Unknown Product';
  };

  const formatPrice = (price) => {
    if (!price) return '0.00';
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Orders Management</h1>
      
      {allOrders.length === 0 ? (
        <div className="text-center py-12 text-light-textMuted dark:text-dark-textMuted">
          No orders found
        </div>
      ) : (
        <div className="bg-white dark:bg-dark-surface shadow overflow-hidden sm:rounded-lg">
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
                  Products
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-light-textMuted dark:text-dark-textMuted uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200">
              {allOrders.map((order) => (
                <tr key={order.id} className="hover:bg-light-surfaceAlt dark:bg-dark-surfaceAlt">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-light-text dark:text-dark-text">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-light-textMuted dark:text-dark-textMuted">
                    {getCustomerName(order.customer_id)}
                  </td>
                  <td className="px-6 py-4 text-sm text-light-textMuted dark:text-dark-textMuted">
                    <div className="space-y-1">
                      {order.items?.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span>{getProductName(item.product_id)}</span>
                          <span className="ml-4">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-light-textMuted dark:text-dark-textMuted">
                    ${formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      order.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-light-surfaceAlt dark:bg-dark-surfaceAlt text-light-text dark:text-dark-text'
                    }`}>
                      {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-light-textMuted dark:text-dark-textMuted">
                    {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement; 