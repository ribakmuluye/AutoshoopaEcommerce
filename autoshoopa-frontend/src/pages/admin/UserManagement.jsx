import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsers, getAllOrders, getAllProducts } from '../../store/slices/authSlice';
import { FaSpinner, FaEdit, FaTrash, FaPlus, FaUsers, FaStore } from 'react-icons/fa';

const UserManagement = () => {
  const dispatch = useDispatch();
  const { allUsers = [], allOrders = [], allProducts = [], loading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('customers');

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllOrders());
    dispatch(getAllProducts());
  }, [dispatch]);

  // Calculate customer statistics
  const customers = allUsers
    .filter(user => user.user_type === 'customer')
    .map(customer => {
      const customerOrders = allOrders.filter(order => order.customer_id === customer.uid);
      const totalSpent = customerOrders.reduce((sum, order) => sum + (order.total || 0), 0);
      
      return {
        ...customer,
        orders_count: customerOrders.length,
        total_spent: totalSpent,
        last_order: customerOrders.length > 0 
          ? new Date(Math.max(...customerOrders.map(o => new Date(o.created_at))))
          : null
      };
    });

  // Calculate seller statistics
  const sellers = allUsers
    .filter(user => user.user_type === 'seller')
    .map(seller => {
      const sellerProducts = allProducts.filter(product => product.seller_id === seller.uid);
      const sellerOrders = allOrders.filter(order => 
        order.items.some(item => sellerProducts.some(p => p.id === item.product_id))
      );
      const totalSales = sellerOrders.reduce((sum, order) => {
        const sellerItems = order.items.filter(item => 
          sellerProducts.some(p => p.id === item.product_id)
        );
        return sum + sellerItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
      }, 0);

      return {
        ...seller,
        products_count: sellerProducts.length,
        total_sales: totalSales,
        orders_count: sellerOrders.length,
        last_sale: sellerOrders.length > 0 
          ? new Date(Math.max(...sellerOrders.map(o => new Date(o.created_at))))
          : null
      };
    });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
      </div>
    );
  }

  const UserTable = ({ users, type }) => (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Joined
              </th>
              {type === 'customer' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Total Spent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Last Order
                  </th>
                </>
              )}
              {type === 'seller' && (
                <>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Total Sales
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                    Last Sale
                  </th>
                </>
              )}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={type === 'customer' ? 8 : 8} className="px-6 py-4 text-center text-gray-500">
                  No {type}s found
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.uid} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <img
                          className="h-10 w-10 rounded-full object-cover"
                          src={user.profileImage || '/images/logo.svg'}
                          alt={user.name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.phone || 'No phone number'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {user.is_approved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                  </td>
                  {type === 'customer' && (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.orders_count}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        ${user.total_spent.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.last_order ? new Date(user.last_order).toLocaleDateString() : 'No orders'}
                      </td>
                    </>
                  )}
                  {type === 'seller' && (
                    <>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.products_count}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        ${user.total_sales.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.last_sale ? new Date(user.last_sale).toLocaleDateString() : 'No sales'}
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4">
                      <FaEdit />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-600 transition-colors">
          <FaPlus className="mr-2" />
          Add User
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('customers')}
            className={`${
              activeTab === 'customers'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <FaUsers className="mr-2" />
            Customers ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('sellers')}
            className={`${
              activeTab === 'sellers'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <FaStore className="mr-2" />
            Sellers ({sellers.length})
          </button>
        </nav>
      </div>

      {/* Tables */}
      {activeTab === 'customers' ? (
        <UserTable users={customers} type="customer" />
      ) : (
        <UserTable users={sellers} type="seller" />
      )}
    </div>
  );
};

export default UserManagement; 