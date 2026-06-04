import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsers, getAllSellers, updateUserStatus } from '../../store/slices/authSlice';
import { FaSpinner, FaUserCheck, FaUserTimes, FaStore, FaUser } from 'react-icons/fa';

const UsersManagement = () => {
  const dispatch = useDispatch();
  const { allUsers = [], allSellers = [], loading } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('customers');

  useEffect(() => {
    dispatch(getAllUsers());
    dispatch(getAllSellers());
  }, [dispatch]);

  const handleStatusChange = async (userId, newStatus) => {
    try {
      await dispatch(updateUserStatus({ userId, status: newStatus })).unwrap();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  const renderUserList = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <FaSpinner className="animate-spin h-8 w-8 text-indigo-600" />
        </div>
      );
    }

    if (activeTab === 'customers') {
      const customers = allUsers.filter(user => user.user_type === 'customer');
      if (customers.length === 0) {
        return (
          <div className="text-center py-12 text-light-textMuted dark:text-dark-textMuted">
            No customers found
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {customers.map((customer) => (
            <div key={customer.uid} className="bg-white dark:bg-dark-surface rounded-lg shadow p-6">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <img
                    className="h-12 w-12 rounded-full"
                    src={customer.profile_image || '/images/logo.svg'}
                    alt={customer.name}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-light-text dark:text-dark-text">{customer.name}</h3>
                  <p className="text-sm text-light-textMuted dark:text-dark-textMuted">{customer.email}</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  <span className="font-medium">Phone:</span> {customer.phone || 'N/A'}
                </p>
                <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  <span className="font-medium">Joined:</span>{' '}
                  {new Date(customer.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  <span className="font-medium">Last Login:</span>{' '}
                  {customer.last_login ? new Date(customer.last_login).toLocaleDateString() : 'Never'}
                </p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => handleStatusChange(customer.uid, !customer.is_active)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    customer.is_active
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {customer.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      if (allSellers.length === 0) {
        return (
          <div className="text-center py-12 text-light-textMuted dark:text-dark-textMuted">
            No sellers found
          </div>
        );
      }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allSellers.map((seller) => (
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
                  {new Date(seller.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  <span className="font-medium">Last Login:</span>{' '}
                  {seller.last_login ? new Date(seller.last_login).toLocaleDateString() : 'Never'}
                </p>
                <p className="text-sm text-light-textSecondary dark:text-dark-textSecondary">
                  <span className="font-medium">Status:</span>{' '}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    seller.is_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {seller.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </p>
              </div>
              <div className="mt-4 flex space-x-2">
                <button
                  onClick={() => handleStatusChange(seller.uid, !seller.is_active)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    seller.is_active
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                  }`}
                >
                  {seller.is_active ? 'Deactivate' : 'Activate'}
                </button>
                {!seller.is_approved && (
                  <button
                    onClick={() => handleStatusChange(seller.uid, true)}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200"
                  >
                    Approve
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Users Management</h1>
      
      <div className="mb-6">
        <div className="border-b border-light-border dark:border-dark-border">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('customers')}
              className={`${
                activeTab === 'customers'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-light-textMuted dark:text-dark-textMuted hover:text-light-textSecondary dark:text-dark-textSecondary hover:border-light-borderHover dark:border-dark-borderHover'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <FaUser className="mr-2" />
              Customers
            </button>
            <button
              onClick={() => setActiveTab('sellers')}
              className={`${
                activeTab === 'sellers'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-light-textMuted dark:text-dark-textMuted hover:text-light-textSecondary dark:text-dark-textSecondary hover:border-light-borderHover dark:border-dark-borderHover'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <FaStore className="mr-2" />
              Sellers
            </button>
          </nav>
        </div>
      </div>

      {renderUserList()}
    </div>
  );
};

export default UsersManagement; 